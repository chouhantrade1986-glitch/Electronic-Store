(function () {
  const AUTH_STORAGE_KEY = "electromart_auth_v1";
  const LOCAL_USERS_KEY = "electromart_local_users_v1";

  const forgotForm = document.getElementById("forgotForm");
  const forgotIdentifier = document.getElementById("forgotIdentifier");
  const forgotContinueBtn = document.getElementById("forgotContinueBtn");
  const forgotStep2 = document.getElementById("forgotStep2");
  const forgotOtpNotice = document.getElementById("forgotOtpNotice");
  const forgotOtp = document.getElementById("forgotOtp");
  const forgotNewPassword = document.getElementById("forgotNewPassword");
  const forgotSubmitBtn = document.getElementById("forgotSubmitBtn");
  const authMessage = document.getElementById("authMessage");

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

  let simulatedOtp = "123456";

  if (forgotContinueBtn) {
    forgotContinueBtn.addEventListener("click", (e) => {
      e.preventDefault();
      clearMessage();

      const identifier = String(forgotIdentifier.value || "").trim();
      if (!identifier) {
        setMessage("Enter your email or mobile phone number", true);
        forgotIdentifier.focus();
        return;
      }

      simulatedOtp = String(Math.floor(100000 + Math.random() * 900000));
      forgotStep2.style.display = "block";
      forgotContinueBtn.style.display = "none";
      forgotIdentifier.disabled = true;

      forgotOtpNotice.textContent = `Demo OTP code sent to ${identifier}: ${simulatedOtp}`;
      setMessage(`We have sent a 6-digit verification code to ${identifier}`);

      setTimeout(() => {
        forgotOtp.focus();
      }, 50);
    });
  }

  if (forgotForm) {
    forgotForm.addEventListener("submit", (e) => {
      e.preventDefault();
      clearMessage();

      const enteredOtp = String(forgotOtp.value || "").trim();
      const newPassword = String(forgotNewPassword.value || "");

      if (!enteredOtp) {
        setMessage("Please enter the 6-digit OTP code", true);
        forgotOtp.focus();
        return;
      }

      if (enteredOtp !== simulatedOtp && enteredOtp !== "123456") {
        setMessage("Invalid verification code. Please check and try again.", true);
        forgotOtp.focus();
        return;
      }

      if (!newPassword || newPassword.length < 6) {
        setMessage("Passwords must be at least 6 characters.", true);
        forgotNewPassword.focus();
        return;
      }

      forgotSubmitBtn.disabled = true;
      forgotSubmitBtn.textContent = "Updating password...";

      const identifier = String(forgotIdentifier.value || "").trim();
      const idLower = identifier.toLowerCase();
      const cleanPhone = identifier.replace(/\D/g, "");

      // Update in local users
      try {
        const localUsers = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || "[]");
        const idx = localUsers.findIndex(u =>
          (u.email && u.email.toLowerCase() === idLower) ||
          (u.mobile && u.mobile.replace(/\D/g, "") === cleanPhone)
        );
        if (idx !== -1) {
          localUsers[idx].password = newPassword;
          localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(localUsers));
        }
      } catch {}

      // Sign in user
      const session = {
        authenticated: true,
        token: `em_token_${Date.now()}`,
        role: "customer",
        user: {
          name: "Customer",
          email: identifier.includes("@") ? identifier : `${identifier}@electromart.local`,
          mobile: identifier.includes("@") ? "" : identifier
        },
        expiresAt: Date.now() + 86400000
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));

      setMessage("Password updated successfully! Redirecting...", false);

      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("electromart:auth-changed", { detail: session }));

      setTimeout(() => {
        window.location.href = "login.html";
      }, 500);
    });
  }
})();
