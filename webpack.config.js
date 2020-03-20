/* global __dirname, require, module*/

const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const path = require('path')
const pkg = require('./package.json')
const chalk = require('chalk')
const find = require('globule').find
const { isEmpty } = require('lodash')

// When rewriting source map file paths, prepend a slash for Windows
const protocol = process.platform === 'win32' ? 'file:///' : 'file://'

// Paths for source codes and builds relative to Java project
const paths = {
  source: resolve('/src/'),
  destination: resolve('/lib'),
}

let libraryName = pkg.name;

const BABEL_OPTS = require('./babel-opts');

const uglifyConfig = {
  // https://github.com/mishoo/UglifyJS2/tree/harmony#compress-options
  compress: {
    drop_console: true,
    drop_debugger: true
  },
  // https://github.com/mishoo/UglifyJS2/tree/harmony#output-options
  output: {
    comments: false
  },
  // https://github.com/mishoo/UglifyJS2/tree/harmony#source-map-options
  sourceMap: true,
  exclude: [ /\.test.js$/ ]
}

const config = {
  entry: entries(),
  devtool: 'eval',
  plugins: [],
  output: {
    path: paths.destination,
    filename: '[name].js',
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  externals: {
    "lodash": "node_modules/lodash/index.js"
},
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        options: BABEL_OPTS,
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.less$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'less-loader']
        })
      },
      {
        test: /\.(jpe|jpg|woff|woff2|eot|ttf|svg)(\?.*$|$)/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000
            }
          }
        ]
      },
      {
        test: /\.(gif|jpg|jpeg|png)$/,
        use: ['file-loader']
      },
      {
        test: /\.json$/,
        use: ['json-loader']
      }
    ]
  }
};

// Add additional Webpack configurations based on environment
switch (process.env.MINIFY) {
  case 'false':
  default:
    console.info('Webpack: using development configuration')
    config.devtool = 'eval'
    config.output.pathinfo = true
    config.output.devtoolModuleFilenameTemplate = filenameTemplate
    config.plugins = [
      ...config.plugins
    ]
    break

  case 'true':
    console.info('Webpack: using production configuration')
    config.devtool = 'nosources-source-map'
    config.plugins = [
      ...config.plugins,
      new webpack.optimize.UglifyJsPlugin(uglifyConfig)
    ]
    break
}  

// Find all top-level JS files in src to compile to build an entries object
// for Webpack
function entries() {
  const entryFiles = find(path.join(paths.source, '*.js'));
  console.log("ENV: " + entryFiles);
  if (isEmpty(entryFiles)) {
    const message = `No files found in '${paths.source}' to serve as entry points. Do you have the correct 'source.directory' value?`
    console.error(chalk`{red ${message}}`)
    throw new Error(message)
  }
  return entryFiles.reduce((obj, filename) => {
    const name = path.basename(filename, path.extname(filename))
    obj[name] = [filename]
    return obj
  }, {})
}

// Build a path relative to this current one
function resolve() {
  const args = [__dirname, '.'].concat(Array.from(arguments))
  return path.join.apply(path, args)
}
// Build a new resource path for source maps with respect to the OS
function filenameTemplate(h) {
  return `${protocol}${h.absoluteResourcePath.split(path.sep).join('/')}`
}

module.exports = config;