const webpack = require('webpack');
const path = require('path');
const packageJson = require('../package.json');

const nodeExternals = require('webpack-node-externals');

// Plugins
const HtmlWebpackPlugin = require('html-webpack-plugin');

const defaultExtensions = ['.js', '.jsx', '.ts', '.tsx'];
const rootPath = path.join(__dirname, '..');

/**
 * Getter for webpack config for all the different kind of builds there is in this repo
 * @param  {Object} options        Passed from building, starting and testing the application
 * @return {Object}                Webpack config object
 */
module.exports = ({
  isWebpackDevServer = false,
  isProd = true,
  bail = false,
} = {}) => {
  const entryPrefix = `app${isProd ? '.min' : ''}`;
  const outputPath = path.join(rootPath, 'web', 'dist');

  const deviceExtensions = defaultExtensions.map(extension => `.web${extension}`);
  const baseExtensions = []
    .concat(deviceExtensions)
    .concat(defaultExtensions);
  const buildExtensions = baseExtensions.map(extension => `.${isProd ? 'prod' : 'dev'}${extension}`);
  const extensions = []
    .concat(buildExtensions)
    .concat(baseExtensions);

  return ({
    bail,
    devtool: 'source-map',
    entry: {
      [entryPrefix]: []
        .concat(isWebpackDevServer ? ['webpack-hot-middleware/client'] : [])
        .concat(path.join(rootPath, 'src', 'index')),
    },
    output: {
      path: outputPath,
      filename: '[name].js',
      libraryTarget: 'umd',
    },
    plugins: [
      new webpack.DefinePlugin({
        __PROD__: JSON.stringify(isProd),
        __DEV__: JSON.stringify(!isProd),
        __DEVSERVER__: JSON.stringify(isWebpackDevServer),
        __DEVTOOLS__: JSON.stringify(isWebpackDevServer),
        __VERSION__: JSON.stringify(packageJson.version),
        'process.env': {
          NODE_ENV: JSON.stringify(isProd ? 'production' : 'development'),
        },
      }),
      new HtmlWebpackPlugin({
        minify: {},
        template: path.join(rootPath, 'src', 'web', 'index.html'),
        inject: 'body',
      })
    ]
      .concat(isWebpackDevServer ? [
        new webpack.HotModuleReplacementPlugin(),
      ] : [])
      .concat(isProd ? [
        new webpack.optimize.UglifyJsPlugin({
          output: {
            comments: false,
          },
        }),
      ] : []),
    module: {
      rules: []
        .concat([
          {
            test: /\.js$/,
            exclude: /node_modules/,
            use: [
              {
                loader: 'babel-loader',
                options: {
                  presets: [
                    '@babel/preset-env',
                    ['@babel/preset-stage-2', { "decoratorsLegacy": true }],
                  ],
                  plugins: ['@babel/plugin-transform-runtime', '@babel/plugin-proposal-class-properties'],
                },
              },
            ],
          },
          {
            test: /\.jsx$/,
            exclude: /node_modules/,
            use: [
              {
                loader: 'babel-loader',
                options: {
                  presets: [
                    '@babel/preset-env',
                    ['@babel/preset-stage-2', { "decoratorsLegacy": true }],
                    '@babel/preset-react'
                  ],
                  plugins: ['@babel/plugin-transform-runtime', '@babel/plugin-proposal-class-properties'].concat(isWebpackDevServer ? ['react-hot-loader/babel'] : []),
                },
              },
            ],
          },
          {
            test: /\.ts$/,
            exclude: /node_modules/,
            use: [
              {
                loader: 'babel-loader',
                options: {
                  presets: ['@babel/preset-env', '@babel/preset-typescript'],
                  plugins: ['@babel/plugin-transform-runtime', '@babel/plugin-proposal-class-properties'],
                },
              },
            ],
          },
          {
            test: /\.tsx$/,
            exclude: /node_modules/,
            use: [
              {
                loader: 'babel-loader',
                options: {
                  presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
                  plugins: ['@babel/plugin-transform-runtime', '@babel/plugin-proposal-class-properties'].concat(isWebpackDevServer ? ['react-hot-loader/babel'] : []),
                },
              },
            ],
          },
          {
            test: /\.html$/,
            use: [
              {
                loader: 'html-loader',
                options: {
                  attrs: [
                    'img:src',
                    'link:href',
                  ],
                },
              },
            ],
          },
          {
            test: /\.ttf$/,
            use: [
              {
                loader: 'ttf-loader',
                options: {
                  name: './font/[hash].[ext]',
                },
              },
            ],
          },
          {
            test: /\.svg$/,
            use: [
              {
                loader: path.resolve(__dirname, 'loader', 'svg'),
              },
              {
                loader: 'raw-loader',
              },
            ],
          },
          {
            test: /\.mp3$/,
            use: [
              {
                loader: path.resolve(__dirname, 'loader', 'sound'),
              },
              {
                loader: 'url-loader',
                options: {
                  limit: 10000,
                  name: './asset/[hash].[ext]',
                },
              },
            ],
          },
          {
            test: /\.(gif|png|jpg)$/,
            issuer: /\.html$/,
            use: [
              {
                loader: 'file-loader',
                options: {
                  name: './asset/[hash].[ext]',
                },
              },
            ],
          },
          {
            test: /\.(gif|png|jpg)$/,
            issuer: file => (!/\.html$/.test(file)),
            use: [
              {
                loader: 'url-loader',
                options: {
                  limit: 10000,
                  name: './asset/[hash].[ext]',
                },
              },
            ],
          },
        ]),
    },
    resolve: {
      extensions,
      modules: [
        rootPath,
        path.join(rootPath, 'node_modules'),
      ],
    },
  });
};
