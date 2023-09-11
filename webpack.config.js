const path = require("path");

const dirname = path.dirname(__filename);

module.exports = { 
    mode: "production",
    entry: path.resolve(dirname, "./src/index.ts"),
    module: { 
        rules: [{ test: /.ts?$/, use: "ts-loader", exclude: /node_modules/, },], 
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    output: {
        filename: "script.js",
        path: path.resolve(dirname, "public", "static", "bundle"),
    },
};