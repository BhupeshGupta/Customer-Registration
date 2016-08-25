const makeWebpackConfig = require('./make-webpack-config');
const config = makeWebpackConfig({
  // commonsChunk: true,
  longTermCaching: true,
  separateStylesheet: true,
  minimize: false,
  devtool: false,
});

module.exports = config;
