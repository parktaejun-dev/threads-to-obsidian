const fs = require("node:fs");
const path = require("node:path");

const envFile = path.join(__dirname, ".env");
const serverScript = path.join(__dirname, "dist/web/server.js");

function quote(value) {
  return String(value).replaceAll("\\", "\\\\").replaceAll("\"", "\\\"");
}

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const parsed = {};
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/u)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const normalized = trimmed.startsWith("export ") ? trimmed.slice("export ".length).trim() : trimmed;
    const separatorIndex = normalized.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = normalized.slice(0, separatorIndex).trim();
    let value = normalized.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    parsed[key] = value;
  }

  return parsed;
}

const fileEnv = parseEnvFile(envFile);
const baseEnv = {
  ...fileEnv,
  NODE_ENV: process.env.NODE_ENV || fileEnv.NODE_ENV || "production"
};

function parsePositiveInteger(raw, fallback) {
  const parsed = Number.parseInt(`${raw ?? ""}`.trim(), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function buildPublicPorts(primaryPort, workerPort, instanceCount) {
  const ports = [parsePositiveInteger(primaryPort, 4174)];
  const workerPortNumber = parsePositiveInteger(workerPort, 4175);
  let candidate = ports[0] + 1;

  while (ports.length < instanceCount) {
    if (candidate !== workerPortNumber) {
      ports.push(candidate);
    }
    candidate += 1;
  }

  return ports.map((port) => String(port));
}

function buildPublicApp(name, port, host) {
  return {
    name,
    cwd: __dirname,
    script: "/usr/bin/bash",
    args: buildArgs({
      THREADS_WEB_PORT: port,
      THREADS_WEB_HOST: host,
      THREADS_WEB_DISABLE_COLLECTOR: "true",
      THREADS_WEB_DISABLE_MONITORING_AUTORUN: "true"
    }),
    autorestart: true,
    env: {
      NODE_ENV: "production"
    },
    exec_mode: "fork",
    exp_backoff_restart_delay: 100,
    kill_timeout: 20000,
    watch: false
  };
}

function buildArgs(extraEnv = {}) {
  const exports = Object.entries(extraEnv)
    .map(([key, value]) => `export ${key}="${quote(value)}";`)
    .join(" ");

  return `-lc 'cd "${quote(__dirname)}" && set -a; source "${quote(envFile)}"; set +a; ${exports} exec node "${quote(serverScript)}"'`;
}

const publicPort = process.env.THREADS_WEB_PUBLIC_PORT || fileEnv.THREADS_WEB_PUBLIC_PORT || "4174";
const publicHost = process.env.THREADS_WEB_PUBLIC_HOST || fileEnv.THREADS_WEB_PUBLIC_HOST || "127.0.0.1";
const publicInstances = parsePositiveInteger(
  process.env.THREADS_PM2_PUBLIC_INSTANCES || fileEnv.THREADS_PM2_PUBLIC_INSTANCES,
  1
);
const workerPort = process.env.THREADS_WEB_WORKER_PORT || fileEnv.THREADS_WEB_WORKER_PORT || "4175";
const workerHost = process.env.THREADS_WEB_WORKER_HOST || fileEnv.THREADS_WEB_WORKER_HOST || "127.0.0.1";
const publicPorts = buildPublicPorts(publicPort, workerPort, publicInstances);
const mobileSavePort = process.env.THREADS_MOBILE_SAVE_PORT || fileEnv.THREADS_MOBILE_SAVE_PORT || "4180";
const mobileSaveHost = process.env.THREADS_MOBILE_SAVE_HOST || fileEnv.THREADS_MOBILE_SAVE_HOST || "127.0.0.1";
const mobileSaveScript = path.join(__dirname, "dist", "mobile-save", "server.js");

module.exports = {
  apps: [
    ...publicPorts.map((port, index) =>
      buildPublicApp(index === 0 ? "threads-obsidian-public" : `threads-obsidian-public-${index + 1}`, port, publicHost)
    ),
    {
      name: "threads-obsidian-worker",
      cwd: __dirname,
      script: "/usr/bin/bash",
      args: buildArgs({
        THREADS_WEB_PORT: workerPort,
        THREADS_WEB_HOST: workerHost
      }),
      autorestart: true,
      env: {
        NODE_ENV: "production"
      },
      exec_mode: "fork",
      exp_backoff_restart_delay: 100,
      kill_timeout: 20000,
      watch: false
    },
    {
      name: "threads-mobile-save",
      cwd: __dirname,
      script: "/usr/bin/bash",
      args: `-lc 'cd "${quote(__dirname)}" && set -a; source "${quote(envFile)}"; set +a; export THREADS_MOBILE_SAVE_PORT="${quote(mobileSavePort)}"; export THREADS_MOBILE_SAVE_HOST="${quote(mobileSaveHost)}"; exec node "${quote(mobileSaveScript)}"'`,
      autorestart: true,
      env: {
        NODE_ENV: "production"
      },
      exec_mode: "fork",
      exp_backoff_restart_delay: 100,
      kill_timeout: 20000,
      watch: false
    }
  ]
};
