$ErrorActionPreference = "Stop"
if ($PSVersionTable.PSVersion.Major -ge 7) {
  $PSNativeCommandUseErrorActionPreference = $false
}
$env:NODE_NO_WARNINGS = "1"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $root "backend"
$dbPath = Join-Path $backendDir "src\\data\\db.json"
$dbBackup = Join-Path $env:TEMP ("electromart-db-smoke-" + [guid]::NewGuid().ToString() + ".json")

function Get-PageCheck {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Url,
    [Parameter(Mandatory = $true)]
    [string]$Page
  )

  $response = Invoke-WebRequest -Uri $Url -UseBasicParsing
  $title = ""
  if ($response.Content -match "<title>([^<]+)</title>") {
    $title = $Matches[1]
  }

  return [pscustomobject]@{
    page = $Page
    status = [int]$response.StatusCode
    title = $title
  }
}

function Post-Json {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Url,
    [Parameter(Mandatory = $true)]
    $Body,
    [hashtable]$Headers = @{}
  )

  return Invoke-RestMethod -Uri $Url -Method Post -Headers $Headers -ContentType "application/json" -Body ($Body | ConvertTo-Json -Depth 10)
}

function Patch-Json {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Url,
    [Parameter(Mandatory = $true)]
    $Body,
    [hashtable]$Headers = @{}
  )

  return Invoke-RestMethod -Uri $Url -Method Patch -Headers $Headers -ContentType "application/json" -Body ($Body | ConvertTo-Json -Depth 10)
}

function Invoke-OtpLogin {
  param(
    [Parameter(Mandatory = $true)]
    [string]$ApiBaseUrl,
    [Parameter(Mandatory = $true)]
    [string]$EmailOrMobile,
    [Parameter(Mandatory = $true)]
    [string]$Password
  )

  try {
    $otpRequest = Post-Json -Url ($ApiBaseUrl + "/auth/otp/request") -Body @{
      purpose = "login"
      channel = "email"
      emailOrMobile = $EmailOrMobile
      password = $Password
    }
  }
  catch {
    $response = $_.Exception.Response
    if (-not $response) {
      throw
    }

    $reader = New-Object System.IO.StreamReader($response.GetResponseStream())
    $responseBody = $reader.ReadToEnd()
    $payload = $responseBody | ConvertFrom-Json
    if ($response.StatusCode.value__ -ne 429 -or -not $payload.resendAvailableAt) {
      throw
    }

    $retryAt = [datetime]$payload.resendAvailableAt
    $delayMs = [math]::Max(0, [int](($retryAt - (Get-Date)).TotalMilliseconds)) + 250
    Start-Sleep -Milliseconds $delayMs
    $otpRequest = Post-Json -Url ($ApiBaseUrl + "/auth/otp/request") -Body @{
      purpose = "login"
      channel = "email"
      emailOrMobile = $EmailOrMobile
      password = $Password
    }
  }

  if (-not $otpRequest.challengeId -or -not $otpRequest.otpPreview) {
    throw "OTP login requires simulated OTP preview for $EmailOrMobile."
  }

  return Post-Json -Url ($ApiBaseUrl + "/auth/otp/verify") -Body @{
    purpose = "login"
    challengeId = [string]$otpRequest.challengeId
    code = [string]$otpRequest.otpPreview
    emailOrMobile = $EmailOrMobile
    password = $Password
  }
}

function Wait-HttpAvailable {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Url,
    [int]$TimeoutSeconds = 30
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    try {
      $response = Invoke-WebRequest -Uri $Url -UseBasicParsing
      if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
        return
      }
    }
    catch {
      Start-Sleep -Milliseconds 500
      continue
    }

    Start-Sleep -Milliseconds 500
  }

  throw "Timed out waiting for $Url"
}

Copy-Item $dbPath $dbBackup -Force

$backendJob = $null
$frontendJob = $null

try {
  $backendJob = Start-Job -ScriptBlock {
    Set-Location "c:\Users\Admin\Documents\GitHub\Electronic-Store\backend"
    node src/server.js
  }
  $frontendJob = Start-Job -ScriptBlock {
    Set-Location "c:\Users\Admin\Documents\GitHub\Electronic-Store"
    node qa-static-server.js
  }

  Wait-HttpAvailable -Url "http://127.0.0.1:4000/api/health" -TimeoutSeconds 30
  Wait-HttpAvailable -Url "http://127.0.0.1:5500/index.html" -TimeoutSeconds 30

  $result = [ordered]@{}
  $result.health = Invoke-RestMethod -Uri "http://127.0.0.1:4000/api/health"

  $pages = @(
    "index.html",
    "auth.html",
    "products.html",
    "product-detail.html",
    "cart.html",
    "checkout.html",
    "orders.html",
    "account.html",
    "admin-dashboard.html",
    "invoice.html"
  )
  $result.pages = @($pages | ForEach-Object {
    Get-PageCheck -Url ("http://127.0.0.1:5500/" + $_) -Page $_
  })

  $adminLogin = Invoke-OtpLogin -ApiBaseUrl "http://127.0.0.1:4000/api" -EmailOrMobile "admin@electromart.com" -Password "Admin@123"
  $customerLogin = Invoke-OtpLogin -ApiBaseUrl "http://127.0.0.1:4000/api" -EmailOrMobile "customer@electromart.com" -Password "Customer@123"
  $adminHeaders = @{ Authorization = "Bearer $($adminLogin.token)" }
  $customerHeaders = @{ Authorization = "Bearer $($customerLogin.token)" }

  $adminMe = Invoke-RestMethod -Uri "http://127.0.0.1:4000/api/auth/me" -Headers $adminHeaders
  $customerMe = Invoke-RestMethod -Uri "http://127.0.0.1:4000/api/auth/me" -Headers $customerHeaders
  $products = Invoke-RestMethod -Uri "http://127.0.0.1:4000/api/products"
  $allProducts = @($products.products)
  $smokeOrderProductIdForCleanup = $null
  $smokeProduct = $allProducts | Where-Object { [string]$_.id -eq "1" -and [double]($_.stock) -ge 2 } | Select-Object -First 1
  if (-not $smokeProduct) {
    $smokeProduct = $allProducts | Where-Object {
      [double]($_.stock) -ge 2 -and ([string]$_.status).ToLowerInvariant() -eq "active"
    } | Select-Object -First 1
  }
  if (-not $smokeProduct) {
    $orderSku = "SMOKE-ORDER-" + (Get-Date -Format "yyyyMMddHHmmss")
    $smokeProduct = Post-Json -Url "http://127.0.0.1:4000/api/products" -Headers $adminHeaders -Body @{
      sku = $orderSku
      name = "Smoke Order Product"
      brand = "QA"
      category = "accessory"
      segment = "b2c"
      price = 599
      listPrice = 799
      stock = 5
      rating = 4.1
      moq = 1
      status = "active"
      fulfillment = "fbm"
      featured = $false
      keywords = @("smoke", "order")
      collections = @("accessory")
      description = "Temporary smoke product for order flow checks"
      image = "https://example.com/smoke-order-product.jpg"
      images = @("https://example.com/smoke-order-product.jpg")
    }
    $smokeOrderProductIdForCleanup = $smokeProduct.id
  }
  $smokeProductId = [string]$smokeProduct.id
  $product1 = Invoke-RestMethod -Uri ("http://127.0.0.1:4000/api/products/" + $smokeProductId)

  $phoneReq = Post-Json -Url "http://127.0.0.1:4000/api/auth/phone-verification/request" -Body @{} -Headers $customerHeaders
  $phoneConfirm = Post-Json -Url "http://127.0.0.1:4000/api/auth/phone-verification/confirm" -Body @{
    code = [string]$phoneReq.otpPreview
  } -Headers $customerHeaders
  $testNotification = Post-Json -Url "http://127.0.0.1:4000/api/auth/test-notification" -Body @{} -Headers $customerHeaders

  $orderA = Post-Json -Url "http://127.0.0.1:4000/api/orders" -Headers $customerHeaders -Body @{
    items = @(@{ productId = $smokeProductId; quantity = 1 })
    shippingAddress = "Jaipur, Rajasthan"
    paymentMethod = "cod"
  }
  $paymentA = Post-Json -Url "http://127.0.0.1:4000/api/payments/intent" -Headers $customerHeaders -Body @{
    orderId = $orderA.id
    method = "cod"
  }
  $adminOrderUpdate = Patch-Json -Url ("http://127.0.0.1:4000/api/admin/orders/" + $orderA.id + "/status") -Headers $adminHeaders -Body @{
    status = "shipped"
  }

  $orderB = Post-Json -Url "http://127.0.0.1:4000/api/orders" -Headers $customerHeaders -Body @{
    items = @(@{ productId = $smokeProductId; quantity = 1 })
    shippingAddress = "Jaipur, Rajasthan"
    paymentMethod = "cod"
  }
  $cancelB = Patch-Json -Url ("http://127.0.0.1:4000/api/orders/" + $orderB.id + "/cancel") -Headers $customerHeaders -Body @{}
  $customerOrders = Invoke-RestMethod -Uri "http://127.0.0.1:4000/api/orders/my" -Headers $customerHeaders
  $customerNotifications = Invoke-RestMethod -Uri "http://127.0.0.1:4000/api/orders/notifications?limit=20" -Headers $customerHeaders

  $testSku = "SMOKE-SKU-" + (Get-Date -Format "yyyyMMddHHmmss")
  $createdProduct = Post-Json -Url "http://127.0.0.1:4000/api/products" -Headers $adminHeaders -Body @{
    sku = $testSku
    name = "Smoke Test Product"
    brand = "QA"
    category = "accessory"
    segment = "b2c"
    price = 499
    listPrice = 699
    stock = 0
    rating = 4.2
    moq = 1
    status = "active"
    fulfillment = "fbm"
    featured = $false
    keywords = @("smoke", "qa")
    collections = @("accessory")
    description = "Smoke verification product"
    image = "https://example.com/smoke-product.jpg"
    images = @("https://example.com/smoke-product.jpg")
  }

  $backInStockCreate = Post-Json -Url ("http://127.0.0.1:4000/api/products/" + $createdProduct.id + "/back-in-stock-request") -Body @{
    email = "customer@electromart.com"
    name = "Demo Customer"
    quantityDesired = 1
  }
  $backInStockListBefore = Invoke-RestMethod -Uri "http://127.0.0.1:4000/api/admin/back-in-stock/requests" -Headers $adminHeaders

  $updatedProduct = Invoke-RestMethod -Uri ("http://127.0.0.1:4000/api/products/" + $createdProduct.id) -Method Put -Headers $adminHeaders -ContentType "application/json" -Body (@{
    id = $createdProduct.id
    sku = $createdProduct.sku
    name = "Smoke Test Product Updated"
    brand = "QA"
    category = "accessory"
    segment = "b2c"
    price = 549
    listPrice = 749
    stock = 5
    rating = 4.3
    moq = 1
    status = "active"
    fulfillment = "fbm"
    featured = $true
    keywords = @("smoke", "qa", "updated")
    collections = @("accessory")
    description = "Updated smoke verification product"
    image = "https://example.com/smoke-product.jpg"
    images = @("https://example.com/smoke-product.jpg")
  } | ConvertTo-Json -Depth 10)

  $clonedProduct = Invoke-RestMethod -Uri ("http://127.0.0.1:4000/api/products/" + $createdProduct.id + "/clone") -Method Post -Headers $adminHeaders
  Invoke-WebRequest -Uri ("http://127.0.0.1:4000/api/products/" + $clonedProduct.id) -Method Delete -Headers $adminHeaders -UseBasicParsing | Out-Null
  Invoke-WebRequest -Uri ("http://127.0.0.1:4000/api/products/" + $createdProduct.id) -Method Delete -Headers $adminHeaders -UseBasicParsing | Out-Null
  if ($smokeOrderProductIdForCleanup) {
    Invoke-WebRequest -Uri ("http://127.0.0.1:4000/api/products/" + $smokeOrderProductIdForCleanup) -Method Delete -Headers $adminHeaders -UseBasicParsing | Out-Null
  }

  $backInStockListAfter = Invoke-RestMethod -Uri "http://127.0.0.1:4000/api/admin/back-in-stock/requests" -Headers $adminHeaders
  $requestId = @($backInStockListAfter.requests | Where-Object { $_.productId -eq $createdProduct.id } | Select-Object -First 1).id
  $backInStockStatus = $null
  if ($requestId) {
    $backInStockStatus = Patch-Json -Url ("http://127.0.0.1:4000/api/admin/back-in-stock/requests/" + $requestId + "/status") -Headers $adminHeaders -Body @{
      status = "closed"
    }
  }

  $dashboard = Invoke-RestMethod -Uri "http://127.0.0.1:4000/api/admin/dashboard" -Headers $adminHeaders
  $users = Invoke-RestMethod -Uri "http://127.0.0.1:4000/api/admin/users" -Headers $adminHeaders
  $orders = Invoke-RestMethod -Uri "http://127.0.0.1:4000/api/admin/orders" -Headers $adminHeaders
  $sales = Invoke-RestMethod -Uri "http://127.0.0.1:4000/api/admin/sales" -Headers $adminHeaders
  $catalog = Invoke-RestMethod -Uri "http://127.0.0.1:4000/api/admin/catalog" -Headers $adminHeaders
  $inventory = Invoke-RestMethod -Uri "http://127.0.0.1:4000/api/admin/inventory-settings" -Headers $adminHeaders
  $analytics = Invoke-RestMethod -Uri "http://127.0.0.1:4000/api/admin/analytics" -Headers $adminHeaders
  $orderNotifications = Invoke-RestMethod -Uri "http://127.0.0.1:4000/api/admin/order-notifications" -Headers $adminHeaders
  $phoneAutomation = Invoke-RestMethod -Uri "http://127.0.0.1:4000/api/admin/phone-verification-automation" -Headers $adminHeaders

  $razorpayChecksSkipped = $false
  Push-Location $backendDir
  try {
    $hasRazorpayKeyId = -not [string]::IsNullOrWhiteSpace([string]$env:RAZORPAY_KEY_ID)
    $hasRazorpayKeySecret = -not [string]::IsNullOrWhiteSpace([string]$env:RAZORPAY_KEY_SECRET)
    if ($hasRazorpayKeyId -and $hasRazorpayKeySecret) {
      $razorpaySmokeOutput = (& node src/jobs/runRazorpaySmokeTest.js --amount=1 --method=upi 2>&1) | Out-String
      $razorpaySmokeExit = $LASTEXITCODE

      $resumeSmokeOutput = (& node src/jobs/verifyRazorpayResumeFlow.js 2>&1) | Out-String
      $resumeSmokeExit = $LASTEXITCODE
    } else {
      $razorpayChecksSkipped = $true
      $razorpaySmokeOutput = "Skipped: Razorpay credentials are not configured in the smoke environment."
      $razorpaySmokeExit = 0
      $resumeSmokeOutput = "Skipped: Razorpay credentials are not configured in the smoke environment."
      $resumeSmokeExit = 0
    }

    $automationDryRunOutput = (& node src/jobs/runPhoneVerificationAutomation.js --dry-run 2>&1) | Out-String
    $automationDryRunExit = $LASTEXITCODE
  }
  finally {
    Pop-Location
  }

  $result.api = [ordered]@{
    adminRole = $adminMe.role
    customerRole = $customerMe.role
    productCount = @($products.products).Count
    product1Name = $product1.name
    phoneVerificationRequested = [bool]$phoneReq.phoneVerification
    phoneVerificationConfirmed = [bool]$phoneConfirm.phoneVerification.isVerified
    testNotificationMessage = $testNotification.message
    orderAId = $orderA.id
    codPaymentAStatus = $paymentA.status
    orderAStatusAfterAdmin = $adminOrderUpdate.status
    orderBId = $orderB.id
    orderBStatusAfterCancel = $cancelB.status
    customerOrdersCount = @($customerOrders.orders).Count
    customerNotificationsCount = @($customerNotifications.notifications).Count
    createdProductId = $createdProduct.id
    updatedProductStock = $updatedProduct.stock
    backInStockCreated = [bool]$backInStockCreate.request
    backInStockRequestsBefore = @($backInStockListBefore.requests).Count
    backInStockRequestsAfter = @($backInStockListAfter.requests).Count
    backInStockDispatchMatched = $updatedProduct.backInStock.matched
    backInStockStatus = if ($backInStockStatus) { $backInStockStatus.message } else { "" }
    clonedProductId = $clonedProduct.id
    dashboardProducts = $dashboard.products
    adminUsersCount = @($users.users).Count
    adminOrdersCount = @($orders.orders).Count
    adminSalesCount = @($sales.sales).Count
    adminCatalogCount = @($catalog.products).Count
    inventoryDefaultThreshold = $inventory.defaultLowStockThreshold
    analyticsHasRevenueSeries = (@($analytics.revenueLast7Days).Count -gt 0)
    adminOrderNotificationsCount = @($orderNotifications.notifications).Count
    phoneAutomationCandidateCount = $phoneAutomation.summary.candidateCount
  }
  $result.jobs = [ordered]@{
    razorpayChecksSkipped = $razorpayChecksSkipped
    razorpayCredentialSmokePassed = ($razorpaySmokeExit -eq 0)
    razorpayCredentialSmokeOutput = $razorpaySmokeOutput.Trim()
    razorpayResumeSmokePassed = ($resumeSmokeExit -eq 0)
    razorpayResumeSmokeOutput = $resumeSmokeOutput.Trim()
    phoneAutomationDryRunPassed = ($automationDryRunExit -eq 0)
    phoneAutomationDryRunOutput = $automationDryRunOutput.Trim()
  }

  $result | ConvertTo-Json -Depth 10
}
finally {
  if ($backendJob) {
    Stop-Job $backendJob -ErrorAction SilentlyContinue | Out-Null
    Remove-Job $backendJob -Force -ErrorAction SilentlyContinue | Out-Null
  }
  if ($frontendJob) {
    Stop-Job $frontendJob -ErrorAction SilentlyContinue | Out-Null
    Remove-Job $frontendJob -Force -ErrorAction SilentlyContinue | Out-Null
  }
  if (Test-Path $dbBackup) {
    Copy-Item $dbBackup $dbPath -Force
    Remove-Item $dbBackup -Force
  }
}
