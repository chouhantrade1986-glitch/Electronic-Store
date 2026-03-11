const AUTH_SESSION_STORAGE_KEY = "electromart_auth_v1";
const AUTH_PROFILE_STORAGE_KEY = "electromart_profile_v1";

function readAuthSession() {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (error) {
    return null;
  }
}

function clearAuthSession() {
  try {
    localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    localStorage.removeItem(AUTH_PROFILE_STORAGE_KEY);
  } catch (error) {
    return;
  }
}

function getSessionDisplayName(session) {
  const name = String(session && session.name ? session.name : "").trim();
  if (name) {
    return name.split(/\s+/)[0];
  }
  const email = String(session && session.email ? session.email : "").trim();
  if (email) {
    return email.split("@")[0];
  }
  return "Account";
}

function getHeaderContainers() {
  return Array.from(document.querySelectorAll(".nav-actions, .header-links, .header-actions"))
    .filter((element) => element.closest("header"));
}

function ensureGeneratedAccountLink(session) {
  const container = getHeaderContainers()[0];
  if (!container) {
    return null;
  }

  const link = document.createElement("a");
  link.href = session ? "account.html" : "auth.html";
  link.textContent = session ? "Account" : "Sign In";
  link.dataset.authGenerated = "account";
  container.append(link);
  return link;
}

function getAccountLink(session) {
  const existing = document.querySelector(
    'header .account-link:not([data-auth-signout]), header a[href="auth.html"]:not([data-auth-signout]), header a[href="account.html"]:not([data-auth-signout])'
  );
  if (existing) {
    return existing;
  }
  return session ? ensureGeneratedAccountLink(session) : null;
}

function setStackedLinkText(link, topLine, bottomLine) {
  let top = link.querySelector("span");
  let bottom = link.querySelector("strong");

  if (!top) {
    top = document.createElement("span");
    link.prepend(top);
  }
  if (!bottom) {
    bottom = document.createElement("strong");
    link.append(bottom);
  }

  top.textContent = topLine;
  bottom.textContent = bottomLine;
}

function updateAccountLink(link, session) {
  if (!link) {
    return;
  }

  if (session) {
    link.href = "account.html";
    link.hidden = false;

    if (link.classList.contains("account-link") || link.querySelector("span") || link.querySelector("strong")) {
      setStackedLinkText(link, `Hello, ${getSessionDisplayName(session)}`, "Account");
    } else if (link.dataset.authGenerated === "account") {
      link.textContent = "Account";
    }

    link.title = `${getSessionDisplayName(session)} account`;
    return;
  }

  link.href = "auth.html";
  link.hidden = false;
  link.removeAttribute("title");

  if (link.classList.contains("account-link") || link.querySelector("span") || link.querySelector("strong")) {
    setStackedLinkText(link, "Hello, sign in", "Account");
    return;
  }

  if (link.dataset.authGenerated === "account") {
    link.textContent = "Sign In";
  }
}

function buildSignOutLink(container) {
  const link = document.createElement("a");
  link.href = "auth.html";
  link.dataset.authSignout = "true";
  link.dataset.authGenerated = "signout";
  if (container.classList.contains("nav-actions")) {
    link.className = "orders-link";
  }
  container.append(link);
  return link;
}

function buildAdminLink(container) {
  const link = document.createElement("a");
  link.href = "admin.html";
  link.dataset.authAdmin = "true";
  link.dataset.authGenerated = "admin";
  if (container.classList.contains("nav-actions")) {
    link.className = "orders-link";
  }
  container.append(link);
  return link;
}

function getAdminLink(session) {
  const existing = document.querySelector("header [data-auth-admin]");
  if (existing) {
    return existing;
  }

  if (!session || String(session.role || "").toLowerCase() !== "admin") {
    return null;
  }

  const signOutLink = getSignOutLink(session);
  const container = signOutLink && signOutLink.parentElement ? signOutLink.parentElement : getHeaderContainers()[0];
  if (!container) {
    return null;
  }
  return buildAdminLink(container);
}

function updateAdminLink(link, session) {
  if (!link) {
    return;
  }

  if (!session || String(session.role || "").toLowerCase() !== "admin") {
    link.hidden = true;
    return;
  }

  link.hidden = false;
  link.href = "admin.html";
  if (link.classList.contains("orders-link") || link.querySelector("span") || link.querySelector("strong")) {
    setStackedLinkText(link, "Seller Central", "Admin Panel");
  } else {
    link.textContent = "Admin Panel";
  }
}

function getSignOutLink(session) {
  const existing = document.querySelector("header [data-auth-signout]");
  if (existing) {
    return existing;
  }

  if (!session) {
    return null;
  }

  const accountLink = getAccountLink(session);
  const container = accountLink && accountLink.parentElement ? accountLink.parentElement : getHeaderContainers()[0];
  if (!container) {
    return null;
  }
  return buildSignOutLink(container);
}

function updateSignOutLink(link, session) {
  if (!link) {
    return;
  }

  if (!session) {
    link.hidden = true;
    return;
  }

  link.hidden = false;
  link.href = "auth.html";

  if (link.classList.contains("orders-link") || link.querySelector("span") || link.querySelector("strong")) {
    setStackedLinkText(link, "Signed in", "Sign Out");
  } else {
    link.textContent = "Sign Out";
  }

  if (link.dataset.authLogoutBound === "true") {
    return;
  }

  link.addEventListener("click", (event) => {
    event.preventDefault();
    clearAuthSession();
    window.location.href = "auth.html";
  });
  link.dataset.authLogoutBound = "true";
}

function syncHeaderAuthState() {
  const session = readAuthSession();
  const accountLink = getAccountLink(session);
  updateAccountLink(accountLink, session);
  const signOutLink = getSignOutLink(session);
  updateSignOutLink(signOutLink, session);
  const adminLink = getAdminLink(session);
  updateAdminLink(adminLink, session);
}

syncHeaderAuthState();
