const path = require("path");
module.exports = {
    entry: [
        "./src/index.js"
    ],
    devtool: process.env.WEBPACK_DEVTOOL || "source-map",
    output: {
        path: path.join(__dirname, "dist"),
        filename: "console-ui.js"
    },
    module: {
        // to avoid warning by power-assert-formatter
        exprContextCritical: false,
        loaders: [
            {
                test: /\.js$/,
                loader: "transform?brfs"
            },
            {
                test: /\.json$/,
                loader: "json-loader"
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel",
                query: {
                    cacheDirectory: true
                }
            }
        ]
    }
};
