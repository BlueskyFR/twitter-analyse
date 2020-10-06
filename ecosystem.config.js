module.exports = {
  apps: [
    {
      name: "twitter-analyse",
      script: "build/app.js",
      watch: ".",
      // prettier-ignore
      ignore_watch: ["[\/\\]\./", "node_modules", "config.json5", ".git"],
    },
  ],
};
