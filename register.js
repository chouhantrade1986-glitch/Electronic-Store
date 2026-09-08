(function () {
  const AUTH_STORAGE_KEY = "electromart_auth_v1";
  const PROFILE_STORAGE_KEY = "electromart_profile_v1";
  const LOCAL_USERS_KEY = "electromart_local_users_v1";

  const registerForm = document.getElementById("registerForm");
  const registerName = document.getElementById("registerName");
  const registerMobile = document.getElementById("registerMobile");
  const registerEmail = document.getElementById("registerEmail");
  const registerPassword = document.getElementById("registerPassword");
  const registerOtpSection = document.getElementById("registerOtpSection");
  const registerOtp = document.getElementById("registerOtp");
  const registerOtpAssist = document.getElementById("registerOtpAssist");
  const registerSubmitBtn = document.getElementById("registerSubmitBtn");
  const backToSigninLink = document.getElementById("backToSigninLink");
  const authMessage = document.getElementById("authMessage");

  // Parse redirect target
  const params = new URLSearchParams(window.location.search);
  const redirectTarget = (() => {
    const raw = String(params.get("redirect") || "").trim();
    if (!raw || /^(https?:|\/\/|javascript:)/i.test(raw)) return "index.html";
    if (!/^[a-z0-9\-_/?.=&.]+$/i.test(raw)) return "index.html";
    return raw;
  })();

  if (backToSigninLink && redirectTarget && redirectTarget !== "index.html") {
    backToSigninLink.href = `login.html?redirect=${encodeURIComponent(redirectTarget)}`;
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

  let otpRequested = false;
  let simulatedOtp = "123456";

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearMessage();

      const name = String(registerName.value || "").trim();
      const mobile = String(registerMobile.value || "").replace(/\D/g, "");
      const email = String(registerEmail.value || "").trim();
      const password = String(registerPassword.value || "");

      if (!name) {
        setMessage("Enter your name", true);
        registerName.focus();
        return;
      }

      if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
        setMessage("Please enter a valid 10-digit Indian mobile number", true);
        registerMobile.focus();
        return;
      }

      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setMessage("Please enter a valid email address", true);
        registerEmail.focus();
        return;
      }

      if (!password || password.length < 6) {
        setMessage("Passwords must be at least 6 characters", true);
        registerPassword.focus();
        return;
      }

      // Step 1: Request OTP
      if (!otpRequested) {
        otpRequested = true;
        simulatedOtp = String(Math.floor(100000 + Math.random() * 900000));
        registerOtpSection.style.display = "block";
        registerOtpAssist.textContent = `Demo verification code sent to +91 ${mobile}: ${simulatedOtp}`;
        registerSubmitBtn.textContent = "Create your ElectroMart account";
        setMessage(`We sent a 6-digit verification code to +91 ${mobile}`);
        setTimeout(() => {
          registerOtp.focus();
        }, 100);
        return;
      }

      // Step 2: Verify OTP and Register
      const enteredOtp = String(registerOtp.value || "").trim();
      if (!enteredOtp) {
        setMessage("Please enter the 6-digit verification code", true);
        registerOtp.focus();
        return;
      }

      if (enteredOtp !== simulatedOtp && enteredOtp !== "123456") {
        setMessage("Invalid verification code. Please check and try again.", true);
        registerOtp.focus();
        return;
      }

      registerSubmitBtn.disabled = true;
      registerSubmitBtn.textContent = "Creating account...";

      try {
        // Save to local storage users
        const localUsers = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || "[]");
        const existing = localUsers.find(u => u.mobile === mobile || (email && u.email && u.email.toLowerCase() === email.toLowerCase()));

        if (existing) {
          setMessage("An account with this mobile or email already exists. Please Sign in instead.", true);
          registerSubmitBtn.disabled = false;
          registerSubmitBtn.textContent = "Create your ElectroMart account";
          return;
        }

        const newUser = {
          id: `user_${Date.now()}`,
          name,
          mobile,
          email: email || `${mobile}@electromart.local`,
          password,
          role: "customer",
          createdAt: new Date().toISOString()
        };

        localUsers.push(newUser);
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(localUsers));

        // Create active session
        const session = {
          authenticated: true,
          token: `em_token_${Date.now()}`,
          role: "customer",
          user: {
            name: newUser.name,
            email: newUser.email,
            mobile: newUser.mobile
          },
          expiresAt: Date.now() + 86400000
        };

        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));

        const profile = {
          name: newUser.name,
          email: newUser.email,
          phone: newUser.mobile
        };
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));

        setMessage("Account created successfully! Redirecting...", false);

        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new CustomEvent("electromart:auth-changed", { detail: session }));

        setTimeout(() => {
          window.location.href = redirectTarget;
        }, 400);
      } catch (err) {
        setMessage(err.message || "An error occurred while creating your account.", true);
        registerSubmitBtn.disabled = false;
        registerSubmitBtn.textContent = "Create your ElectroMart account";
      }
    });
  }
})();
