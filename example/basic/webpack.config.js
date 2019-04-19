const path = require('path');

module.exports = {
  entry: path.resolve(__dirname, 'index.ts'),
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        use: [
          'file-loader',
          {
            loader: 'image-webpack-loader',
            options: {
              bypassOnDebug: true, // webpack@1.x
              disable: true, // webpack@2.x and newer
            },
          },
        ],
      }
    ]
  },
  resolve: {
    extensions: [ '.ts' ]
  },
  devtool: "source-map",
  output: {
    filename: 'bundle.js',
    path: __dirname
  }
}