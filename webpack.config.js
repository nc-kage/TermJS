const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = ({ cssBlackList, scss, root, isReact = false, resolve = {} }) => {
  const { includePaths = [], outputFileName = 'styles.css' } = scss || {};
  return {
    mode: 'development',
    entry: path.resolve(root, isReact ? './src/start.tsx' : './src/start.ts'),
    devtool: 'inline-source-map',
    context: root,

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: ['awesome-typescript-loader?module=es6'],
          exclude: [/node_modules/]
        },
        {
          test: /\.js$/,
          loader: 'source-map-loader',
          enforce: 'pre'
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          use: [{
            loader: 'file-loader',
            options: { publicPath: './assets/fonts', outputPath: './assets/fonts' },
          }]
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.scss$/,
          exclude: /node_modules/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                modules: {
                  getLocalIdent: (context, localIdentName, localName) => {
                    if (cssBlackList.some((item) => context.resourcePath.includes(item)
                      || localName.includes(item))) {
                      return localName;
                    }
                    return `${localName}-️${context.resourcePath.split(/[\\/]src[\\/]/)[1].replace(/\/[^/]+.scss/, '').replace(/\//g, '-️')}`;
                  },
                },
              },
            },
            'postcss-loader',
            {
              loader: 'sass-loader',
              options: {
                sassOptions: {
                  includePaths: [...includePaths, '../../general/styles', './'],
                },
              },
            },
          ],
        },
        {
          test: /\.html$/,
          use: [
            { loader: 'html-loader' }
          ],
        },
      ],
    },
    output: {
      path: path.resolve(root, './dist'),
      filename: 'index.js',
    },
    resolve,
    externals: {},
    plugins: [
      new MiniCssExtractPlugin({ filename: outputFileName }),
      new HtmlWebpackPlugin({
        template: path.join(root, './src/index.html'),
      }),
    ],
  };
};
