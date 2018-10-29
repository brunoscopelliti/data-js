const path = require("rollup-plugin-includepaths");

module.exports = {
  input: "index.js",
  output: {
    dir: "dist/",
    file: "data.js",
    format: "cjs",
  },
  plugins: [
    path({
      paths: ["./"],
    }),
  ],
};
