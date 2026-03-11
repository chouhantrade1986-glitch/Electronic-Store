const AUTH_STORAGE_KEY = "electromart_auth_v1";

const statusCard = document.getElementById("adminPortalStatus");
const primaryAction = document.getElementById("adminPrimaryAction");
const secondaryAction = document.getElementById("adminSecondaryAction");

function readSession() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (error) {
    return null;
  }
}

function setStatus(mode, title, detail) {
  if (!statusCard) {
    return;
  }
  statusCard.classList.remove("ready", "pending", "warning");
  statusCard.classList.add(mode);
  statusCard.innerHTML = `<strong>${title}</strong><p>${detail}</p>`;
}

function applyPortalState() {
  const session = readSession();
  if (!session || !session.token) {
    setStatus("pending", "Admin sign-in required", "Sign in with an admin account to open Seller Central. Demo users will remain available.");
    primaryAction.href = "auth.html?mode=admin&redirect=admin-dashboard.html";
    primaryAction.textContent = "Sign In as Admin";
    secondaryAction.href = "index.html";
    secondaryAction.textContent = "Back to Store";
    return;
  }

  if (String(session.role || "").toLowerCase() === "admin") {
    setStatus("ready", `Signed in as ${session.name || session.email || "Admin"}`, "Your admin session is active. Open the dashboard or manage your account.");
    primaryAction.href = "admin-dashboard.html";
    primaryAction.textContent = "Open Admin Dashboard";
    secondaryAction.href = "account.html";
    secondaryAction.textContent = "Open Admin Account";
    return;
  }

  setStatus("warning", `Signed in as ${session.name || session.email || "Customer"}`, "This account is not an admin. Switch user to access the admin panel.");
  primaryAction.href = "auth.html?mode=admin&redirect=admin-dashboard.html";
  primaryAction.textContent = "Switch to Admin";
  secondaryAction.href = "account.html";
  secondaryAction.textContent = "Back to Account";
}

applyPortalState();
