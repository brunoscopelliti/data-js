const path = require("rollup-plugin-includepaths");

module.exports = {
  input: "index.js",
  output: {
    dir: "dist/",
    file: "data.iife.js",
    format: "iife",
    name: "Data",
  },
  plugins: [
    path({
      paths: ["./"],
    }),
  ],
};
