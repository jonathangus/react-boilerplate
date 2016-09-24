import path from 'path';
import webpack from 'webpack';
import qs from 'querystring';

import AssetsPlugin from 'assets-webpack-plugin';
import CompressionPlugin from 'compression-webpack-plugin';
const root = process.cwd();
const src  = path.join(root, 'src');
const build = path.join(root, 'build');

const client = path.join(src, 'client');
const universal = path.join(src, 'universal');

const clientInclude = [client, universal];

export default {
  context: src,
  entry: {
    app: ['babel-polyfill', 'client/client.js'],
  },
  output: {
    filename: '[name]_[chunkhash].js',
    chunkFilename: '[name]_[chunkhash].js',
    path: build,
    publicPath: '/static/'
  },
  resolve: {
    extensions: ['.js'],
    modules: [src, 'node_modules'],
    unsafeCache: true
  },
  node: {
    dns: 'mock',
    net: 'mock'
  },
  plugins: [
   new webpack.NamedModulesPlugin(),
   new webpack.optimize.CommonsChunkPlugin({
     names: ['vendor', 'manifest'],
     minChunks: Infinity
   }),
   new webpack.optimize.AggressiveMergingPlugin(),
   new webpack.optimize.MinChunkSizePlugin({minChunkSize: 50000}),
   new webpack.optimize.UglifyJsPlugin({compressor: {warnings: false}, comments: /(?:)/}),
   new AssetsPlugin({path: build, filename: 'assets.json'}),
   new webpack.NoErrorsPlugin(),
   new webpack.DefinePlugin({
     '__CLIENT__': true,
     '__PRODUCTION__': true,
     'process.env.NODE_ENV': JSON.stringify('production')
   }),
   new CompressionPlugin({
     asset: "[path].gz[query]",
     algorithm: "gzip",
     test: /\.js$|\.css$/,
     threshold: 10240,
     minRatio: 0.8
   })
 ],
 module: {
   loaders: [
     {
       test: /\.css$/,
       loader: 'style-loader!css?'+qs.stringify({
         modules: true,
         importLoaders: 1,
         localIdentName: '[name]_[local]_[hash:base64:5]'
       })  + '!sass-loader',
       include: clientInclude,
     },
     {
       test: /\.(eot|png|jpg|jpeg|gif|woff)$/,
       loaders: [
         'file-loader',
         'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false'
       ]
     },
     {
        test   : /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
        loader : 'file-loader'
     },
     {
       test: /\.js$/,
       loader: 'babel',
       include: clientInclude
     }

   ]
 }
}
