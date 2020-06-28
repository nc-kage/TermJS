/* eslint-disable quote-props */
const path = require('path');

module.exports = {
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    modules: ['node_modules'],
    alias: {
      '@ReactTerm': path.resolve(__dirname, 'src/ReactTerm'),
      '@general': path.resolve(__dirname, '../../general'),
    },
  },
};
