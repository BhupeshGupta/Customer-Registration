const makeWebpackConfig = require('./make-webpack-config');
const path = require('path');

const config = makeWebpackConfig({
  devtool: 'source-map',
  separateStylesheet: true,
  debug: true,
});

module.exports = {
  
  config: config,
  module: {
          loaders: [
              {
                test: /\.jpe?g$|\.gif$|\.png$|\.svg$|\.woff$|\.ttf$|\.wav$|\.mp3$|\.html$/, loader: "file"
              },
          ]
      }
  }
