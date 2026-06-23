const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Store the browser cache inside the project directory so Railway includes it in the build artifact
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
