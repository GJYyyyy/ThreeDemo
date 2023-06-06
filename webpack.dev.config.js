// webpack.dev.config.js
const path = require('path');
const baseConfig = require('./webpack.config');

module.exports = Object.assign(baseConfig, {
    // 开发模式配置
    mode: 'development',
    devtool: 'source-map',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        publicPath: '/'
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist') // 开发服务器根目录
        },
        compress: true,
        port: 8888
    }
});