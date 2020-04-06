const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/server.ts',
    devtool: 'inline-source-map',
    plugins: [
        new CopyPlugin([
            { from: './assets', to: './assets' }
        ])
    ],
    target: 'node',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    output: {
        filename: 'server.js',
        path: path.resolve(__dirname, 'dist')
    },
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        filename: 'server.js',
        port: 3000
    },
    // until azure roll forward with this fix https://github.com/node-fetch/node-fetch/issues/667
    optimization: {
        minimize: false
    }
};