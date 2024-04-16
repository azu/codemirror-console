const path = require("path");
const webpack = require("webpack");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
module.exports = {
    entry: ["./src/index.js"],
    devtool: process.env.WEBPACK_DEVTOOL || "source-map",
    output: {
        path: path.join(__dirname, "assets"),
        filename: "console-ui.js"
    },
    plugins: [
        // Remove the `node:` prefix
        // see: https://github.com/webpack/webpack/issues/14166
        // see: https://github.com/web-infra-dev/rsbuild/pull/1402
        new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
            resource.request = resource.request.replace(/^node:/, "");
        }),
        new NodePolyfillPlugin()
    ],
    module: {
        rules: [
            {
                test: /\.hbs$/,
                use: [
                    {
                        loader: "raw-loader",
                        options: {
                            esModule: false
                        }
                    }
                ]
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "babel-loader",
                        options: {
                            cacheDirectory: true
                        }
                    }
                ]
            }
        ]
    }
};
