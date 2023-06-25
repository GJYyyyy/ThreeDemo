// webpack.pro.config.js
const path = require('path');
const baseConfig = require('./webpack.config');

module.exports = Object.assign(baseConfig, {
    // 生产模式配置
    mode: 'production',
    output: {
        path: path.resolve(__dirname, 'docs'),
        filename: 'scripts/bundle.js',
        publicPath: './'
    }
});