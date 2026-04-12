const crypto = require("crypto");
const fs = require("fs");
const http = require("http");
const path = require("path");
const { spawn } = require("child_process");

const ROOT = __dirname;
const BACKEND_DIR = path.join(ROOT, "backend");
const BACKEND_ENV_PATH = path.join(BACKEND_DIR, ".env");

const FRONTEND_URL = "http://127.0.0.1:5500/index.html";
const BACKEND_API_URL = "http://127.0.0.1:4000/api";
const BACKEND_HEALTH_URL = `${BACKEND_API_URL}/health`;

const REQUEST_TIMEOUT_MS = 2000;
const SERVICE_STARTUP_TIMEOUT_MS = 30000;
const POLLING_INTERVAL_MS = 400;

let shuttingDown = false;
const childProcesses = [];

function spawnProcess(command, args, cwd, env) {
  const child = spawn(command, args, {
    cwd,
    env,
    stdio: "inherit"
  });
  childProcesses.push(child);
  return child;
}

function checkUrl(url) {
  return new Promise((resolve) => {
    const request = http.get(url, (response) => {
      response.resume();
      resolve(response.statusCode >= 200 && response.statusCode < 300);
    });

    request.on("error", () => resolve(false));
    request.setTimeout(REQUEST_TIMEOUT_MS, () => {
      request.destroy();
      resolve(false);
    });
  });
}

async function waitForUrl(url, timeoutMs, errorMessage) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    // eslint-disable-next-line no-await-in-loop
    if (await checkUrl(url)) {
      return;
    }
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL_MS));
  }

  throw new Error(errorMessage);
}

function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  for (const child of childProcesses) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }
  process.exit(exitCode);
}

function attachExitHandler(child, name) {
  child.on("exit", (code) => {
    if (shuttingDown) {
      return;
    }

    const normalized = typeof code === "number" ? code : 1;
    console.error(`${name} exited with code ${normalized}.`);
    shutdown(normalized);
  });
}

async function main() {
  const backendEnv = { ...process.env };
  const backendEnvFileExists = fs.existsSync(BACKEND_ENV_PATH);
  const hasJwtSecret = Boolean(String(backendEnv.JWT_SECRET || "").trim());

  if (!backendEnvFileExists && !hasJwtSecret) {
    backendEnv.JWT_SECRET = crypto.randomBytes(32).toString("hex");
    console.log("backend/.env not found. Using temporary local JWT_SECRET for this session.");
    console.log("Create backend/.env for a persistent secret across restarts.");
  }

  const backend = spawnProcess("node", ["src/server.js"], BACKEND_DIR, backendEnv);
  const frontend = spawnProcess("node", ["qa-static-server.js"], ROOT, process.env);

  attachExitHandler(backend, "Backend");
  attachExitHandler(frontend, "Frontend");

  await waitForUrl(
    BACKEND_HEALTH_URL,
    SERVICE_STARTUP_TIMEOUT_MS,
    `Backend failed to start at ${BACKEND_HEALTH_URL}. Check backend logs and port 4000 conflicts.`
  );

  await waitForUrl(
    FRONTEND_URL,
    SERVICE_STARTUP_TIMEOUT_MS,
    `Frontend failed to start at ${FRONTEND_URL}. Check frontend logs and port 5500 conflicts.`
  );

  console.log("");
  console.log("ElectroMart is running:");
  console.log(`Frontend: ${FRONTEND_URL}`);
  console.log(`Backend:  ${BACKEND_API_URL}`);
  console.log("Press Ctrl+C to stop both services.");
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

main().catch((error) => {
  console.error(error.message);
  shutdown(1);
});