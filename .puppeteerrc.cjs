// https://pptr.dev/troubleshooting#running-puppeteer-in-the-cloud
const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // We are moving puppeteer cache inside node_modules to avoid issues with
  // the cache directory being outside of the project root. This means that
  // CI will used the cached Chrome browser inside node_modules.
  cacheDirectory: join(__dirname, 'node_modules', '.puppeteer_cache'),
};
