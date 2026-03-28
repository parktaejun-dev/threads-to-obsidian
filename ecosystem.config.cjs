module.exports = {
  apps: [
    {
      name: "threads-obsidian",
      cwd: __dirname,
      script: "/usr/bin/bash",
      args: "-lc 'set -a; source ./.env; set +a; exec node dist/web/server.js'",
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
