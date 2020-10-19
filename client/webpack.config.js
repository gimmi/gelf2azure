const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = function (env) {
    const ifDev = (val, other) => env !== 'production' ? val : other;

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
            filename: ifDev('[name].js', '[hash].js')
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
                use: [ 'babel-loader', 'eslint-loader' ]
            }, {
                test: /\.css$/,
                use: [ 'style-loader', 'css-loader' ]
            }]
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: './src/index.html'
            })
        ]
    };
};
