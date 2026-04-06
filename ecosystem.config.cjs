module.exports = {
  apps: [
    {
      name: "threads-obsidian",
      cwd: __dirname,
      script: "/usr/bin/bash",
      args: `-lc 'cd "${__dirname}" && set -a; source "${__dirname}/.env"; set +a; exec node "${__dirname}/dist/web/server.js"'`,
      autorestart: true,
      exp_backoff_restart_delay: 100,
      kill_timeout: 20000,
      watch: false,
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "threads-mobile-save",
      cwd: __dirname,
      script: "/usr/bin/bash",
      args: `-lc 'cd "${__dirname}" && set -a; source "${__dirname}/.env"; set +a; exec node "${__dirname}/dist/mobile-save/server.js"'`,
      autorestart: true,
      exp_backoff_restart_delay: 100,
      kill_timeout: 20000,
      watch: false,
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
