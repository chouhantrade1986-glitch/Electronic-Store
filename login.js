(function () {
  const AUTH_STORAGE_KEY = "electromart_auth_v1";
  const PROFILE_STORAGE_KEY = "electromart_profile_v1";
  const LOCAL_USERS_KEY = "electromart_local_users_v1";
  const KEEP_SIGNED_IN_KEY = "electromart_keep_signed_in_v1";

  // Elements
  const loginForm = document.getElementById("loginForm");
  const loginStep1 = document.getElementById("loginStep1");
  const loginStep2 = document.getElementById("loginStep2");
  const loginIdentifier = document.getElementById("loginIdentifier");
  const loginContinueBtn = document.getElementById("loginContinueBtn");
  const loginPreviewText = document.getElementById("loginPreviewText");
  const loginChangeIdentifierBtn = document.getElementById("loginChangeIdentifierBtn");
  const loginPassword = document.getElementById("loginPassword");
  const loginSubmitBtn = document.getElementById("loginSubmitBtn");
  const keepSignedInCheckbox = document.getElementById("keepSignedInCheckbox");
  const keepSignedInDetailsLink = document.getElementById("keepSignedInDetailsLink");
  const keepSignedInTooltip = document.getElementById("keepSignedInTooltip");
  const loginOtpOptionBtn = document.getElementById("loginOtpOptionBtn");
  const loginOtpSection = document.getElementById("loginOtpSection");
  const loginOtpInput = document.getElementById("loginOtpInput");
  const loginOtpSubmitBtn = document.getElementById("loginOtpSubmitBtn");
  const authMessage = document.getElementById("authMessage");
  const createAccountBtn = document.getElementById("createAccountBtn");

  // Parse redirect
  const params = new URLSearchParams(window.location.search);
  const redirectTarget = (() => {
    const raw = String(params.get("redirect") || "").trim();
    if (!raw || /^(https?:|\/\/|javascript:)/i.test(raw)) return "index.html";
    if (!/^[a-z0-9\-_/?.=&.]+$/i.test(raw)) return "index.html";
    return raw;
  })();

  // Update create account button with redirect if present
  if (createAccountBtn && redirectTarget && redirectTarget !== "index.html") {
    createAccountBtn.href = `register.html?redirect=${encodeURIComponent(redirectTarget)}`;
  }

  function setMessage(msg, isError = false) {
    if (!authMessage) return;
    authMessage.textContent = msg;
    authMessage.className = `auth-message ${isError ? "error" : "success"}`;
  }

  function clearMessage() {
    if (!authMessage) return;
    authMessage.textContent = "";
    authMessage.className = "auth-message";
  }

  // Auto-focus on page load
  if (loginIdentifier) {
    loginIdentifier.focus();
  }

  // Step 1 -> Step 2 (Progressive Disclosure)
  function goToStep2() {
    clearMessage();
    const identifier = String(loginIdentifier.value || "").trim();
    if (!identifier) {
      setMessage("Enter your email or mobile phone number", true);
      loginIdentifier.focus();
      return;
    }

    if (loginPreviewText) {
      loginPreviewText.textContent = identifier;
    }

    loginStep1.classList.remove("active");
    loginStep2.classList.add("active");

    // Smooth auto-focus shift to password
    setTimeout(() => {
      if (loginPassword) loginPassword.focus();
    }, 50);
  }

  // Step 2 -> Step 1 (Change Identifier)
  function goToStep1() {
    clearMessage();
    loginStep2.classList.remove("active");
    loginStep1.classList.add("active");

    setTimeout(() => {
      if (loginIdentifier) {
        loginIdentifier.focus();
        loginIdentifier.select();
      }
    }, 50);
  }

  if (loginContinueBtn) {
    loginContinueBtn.addEventListener("click", (e) => {
      e.preventDefault();
      goToStep2();
    });
  }

  if (loginIdentifier) {
    loginIdentifier.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        goToStep2();
      }
    });
  }

  if (loginChangeIdentifierBtn) {
    loginChangeIdentifierBtn.addEventListener("click", (e) => {
      e.preventDefault();
      goToStep1();
    });
  }

  // Password Visibility Toggle
  const pwdToggles = document.querySelectorAll(".amz-toggle-pwd-btn");
  pwdToggles.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const input = document.getElementById(targetId);
      if (!input) return;
      const isPwd = input.type === "password";
      input.type = isPwd ? "text" : "password";
      btn.setAttribute("title", isPwd ? "Hide password" : "Show password");
      btn.setAttribute("aria-label", isPwd ? "Hide password" : "Show password");
    });
  });

  // "Keep me signed in" Details Tooltip
  if (keepSignedInDetailsLink && keepSignedInTooltip) {
    keepSignedInDetailsLink.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = keepSignedInTooltip.classList.toggle("open");
      keepSignedInDetailsLink.setAttribute("aria-expanded", String(isOpen));
    });

    document.addEventListener("click", (e) => {
      if (!keepSignedInTooltip.contains(e.target) && e.target !== keepSignedInDetailsLink) {
        keepSignedInTooltip.classList.remove("open");
        keepSignedInDetailsLink.setAttribute("aria-expanded", "false");
      }
    });
  }

  // OTP Login Option
  let simulatedOtp = "123456";
  if (loginOtpOptionBtn && loginOtpSection) {
    loginOtpOptionBtn.addEventListener("click", () => {
      loginOtpSection.style.display = "block";
      loginOtpOptionBtn.style.display = "none";
      simulatedOtp = String(Math.floor(100000 + Math.random() * 900000));
      setMessage(`OTP sent to ${loginIdentifier.value}. Demo OTP is: ${simulatedOtp}`);
      if (loginOtpInput) loginOtpInput.focus();
    });
  }

  if (loginOtpSubmitBtn) {
    loginOtpSubmitBtn.addEventListener("click", () => {
      const enteredOtp = String(loginOtpInput.value || "").trim();
      if (!enteredOtp) {
        setMessage("Please enter the 6-digit OTP", true);
        return;
      }
      if (enteredOtp !== simulatedOtp && enteredOtp !== "123456") {
        setMessage("Invalid OTP code. Please try again.", true);
        return;
      }
      completeSignIn(loginIdentifier.value, "Customer");
    });
  }

  // Step 2 Submission (Sign In with Password)
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearMessage();

      const identifier = String(loginIdentifier.value || "").trim();
      const password = String(loginPassword.value || "");

      if (!identifier) {
        goToStep1();
        return;
      }

      if (!password) {
        setMessage("Please enter your password", true);
        loginPassword.focus();
        return;
      }

      loginSubmitBtn.disabled = true;
      loginSubmitBtn.textContent = "Signing in...";

      try {
        // Try backend API if reachable
        let authenticated = false;
        let userData = null;

        try {
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identifier, password })
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.user) {
              authenticated = true;
              userData = data.user;
            }
          }
        } catch {
          // Backend offline - use safe client/local demo fallback
        }

        // Local & Demo User Fallback
        if (!authenticated) {
          const idLower = identifier.toLowerCase();
          const cleanPhone = identifier.replace(/\D/g, "");

          // Check standard offline demo users
          if ((idLower === "admin@electromart.com" || cleanPhone === "9999999999") && password === "Admin@123") {
            authenticated = true;
            userData = { id: "admin-1", email: "admin@electromart.com", name: "Store Admin", role: "admin" };
          } else if ((idLower === "customer@electromart.com" || cleanPhone === "8888888888") && password === "Customer@123") {
            authenticated = true;
            userData = { id: "customer-1", email: "customer@electromart.com", name: "Demo Customer", role: "customer" };
          } else {
            // Check local users registered in browser
            try {
              const localUsers = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || "[]");
              const matched = localUsers.find(u => 
                (u.email && u.email.toLowerCase() === idLower) ||
                (u.mobile && u.mobile.replace(/\D/g, "") === cleanPhone)
              );
              if (matched && matched.password === password) {
                authenticated = true;
                userData = matched;
              }
            } catch {
              // Ignore parse error
            }
          }
        }

        if (!authenticated) {
          setMessage("We cannot find an account with that email or password. Please verify and try again.", true);
          loginSubmitBtn.disabled = false;
          loginSubmitBtn.textContent = "Sign in";
          loginPassword.focus();
          return;
        }

        completeSignIn(identifier, userData ? userData.name : "Customer", userData ? userData.role : "customer");
      } catch (err) {
        setMessage(err.message || "An unexpected error occurred. Please try again.", true);
        loginSubmitBtn.disabled = false;
        loginSubmitBtn.textContent = "Sign in";
      }
    });
  }

  function completeSignIn(identifier, name, role = "customer") {
    const session = {
      authenticated: true,
      token: `em_token_${Date.now()}`,
      role: role || "customer",
      user: {
        name: name || "Customer",
        email: identifier.includes("@") ? identifier : `${identifier}@electromart.local`,
        mobile: identifier.includes("@") ? "" : identifier
      },
      expiresAt: Date.now() + (keepSignedInCheckbox && keepSignedInCheckbox.checked ? 30 * 86400000 : 86400000)
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));

    // Save profile for address & order pre-filling
    const existingProfile = JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY) || "{}");
    existingProfile.name = existingProfile.name || session.user.name;
    existingProfile.email = existingProfile.email || session.user.email;
    existingProfile.phone = existingProfile.phone || session.user.mobile;
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(existingProfile));

    if (keepSignedInCheckbox && keepSignedInCheckbox.checked) {
      localStorage.setItem(KEEP_SIGNED_IN_KEY, "true");
    } else {
      localStorage.removeItem(KEEP_SIGNED_IN_KEY);
    }

    setMessage("Sign in successful! Redirecting...", false);

    // Notify listeners
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("electromart:auth-changed", { detail: session }));

    setTimeout(() => {
      window.location.href = redirectTarget;
    }, 400);
  }
})();
