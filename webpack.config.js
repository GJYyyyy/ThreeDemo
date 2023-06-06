// webpack.config.js
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    // target: 'node', // 如果需要打包后运行在nodejs环境下，需要设置此值
    entry: './src/index.js',
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader'
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(), // 先删除打包目标目录再打包,
        new HtmlWebpackPlugin({
            template: './public/index.html' // 配置模板index.html文件
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: "./public/city.gltf" }, // 把文件（CNAME等）移动到打包目录
                { from: "./public/video_point.png" }, // 把文件（CNAME等）移动到打包目录
            ]
        }),
    ]
};