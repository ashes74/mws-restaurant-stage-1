const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    mode: "development",
    entry: {
        main: "./src/js/main.js",
        restaurant: "./src/js/restaurant_info.js"
    },
    output: {
        path: __dirname + '/dist',
        filename: "[name].js"
    },
    devtool: "source-map",
    devServer: {
        contentBase: `${__dirname}/dist`,
        hot: true,
        port: 9000
    },
    module: {
        rules: [
            {
                enforce: "pre",
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: "eslint-loader"
            }, {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        "presets": [
                            ["@babel/preset-env"]
                        ],
                        plugins: ['@babel/plugin-transform-runtime']
                    }
                }
            }, {
                test: /\.scss$/,
                use: ["style-loader", "css-loader", "sass-loader"]
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(['dist']),
    ],
}