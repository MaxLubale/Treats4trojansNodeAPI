const path = require('path');

module.exports = {
  entry: './app.js', // Entry point of your app
  output: {
    path: path.resolve(__dirname, 'dist'), // Output directory
    filename: 'bundle.js', // Output bundle file name
  },
  module: {
    rules: [
      {
        test: /\.js$/, // Apply this rule to .js files
        exclude: /node_modules/, // Exclude node_modules
        use: {
          loader: 'babel-loader', // Use Babel to transpile ES6+ to ES5
        },
      },
      {
        test: /\.css$/, // Apply this rule to .css files
        use: ['style-loader', 'css-loader'], // Process CSS files
      },
    ],
  },
  resolve: {
    fallback: {
      fs: false, // Don't bundle fs module
      path: require.resolve('path-browserify'), // Polyfill for path
      process: require.resolve('process/browser'), // Polyfill for process
      assert: require.resolve('assert/'), // Polyfill for assert
    },
  },
  mode: 'development', // Change to 'production' for production builds
};
