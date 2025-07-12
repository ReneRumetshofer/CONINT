const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  use: {
    browserName: "chromium",
    headless: true,
    launchOptions: {
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  },
  testDir: "./test/e2e",
});
