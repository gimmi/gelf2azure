const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = function (env) {
    const ifDev = (devVal, otherVal) => env.development ? devVal : otherVal;

    return {
        mode: 'none',
        entry: {
            main: [
                './src/index.css',
                'babel-polyfill',
                'whatwg-fetch',
                './src/index'
            ]
        },
        output: {
            path: path.resolve(__dirname, '..', 'server', 'src', 'static'),
            filename: ifDev('[name].js', '[fullhash].js')
        },
        devtool: ifDev('source-map', false),
        optimization: {
            nodeEnv: ifDev('development', 'production'),
            minimize: ifDev(false, true)
        },
        module: {
            rules: [{
                test: /\.js$/,
                include: path.resolve(__dirname, 'src'),
                use: [ 'babel-loader' ]
            }, {
                test: /\.css$/,
                use: [ 'style-loader', 'css-loader' ]
            }]
        },
        plugins: [
            new ESLintPlugin(),
            new HtmlWebpackPlugin({
                favicon: './src/favicon.png',
                template: './src/index.html'
            })
        ]
    };
};
