import sourcemaps from "rollup-plugin-sourcemaps";
import legacy from "rollup-plugin-legacy";
import resolve from "rollup-plugin-node-resolve";
import globals from "rollup-plugin-node-globals";
import builtins from "rollup-plugin-node-builtins";
import commonjs from "rollup-plugin-commonjs";
import uglify from "rollup-plugin-uglify";
import pascalCase from "pascal-case";

const pkg = require("./package");

export default {
  moduleName: pascalCase(pkg.name),
  entry: "es/index.js",
  dest: "dist/bundle.js",
  format: "umd",
  exports: "named",
  sourceMap: true,
  plugins: [
    legacy({
      "node_modules/socket.io-client/lib/url.js": "url",
      "node_modules/debug/src/index.js": "index",
      "node_modules/has-binary2/index.js": "index",
      "node_modules/socket.io-parser/binary.js": "binary",
      "node_modules/socket.io-parser/is-buffer.js": "isBuffer",
      "node_modules/engine.io-parser/lib/index.js": "index",
      "node_modules/engine.io-client/lib/socket.js": "socket"
    }),
    sourcemaps(),
    resolve(),
    globals(),
    builtins(),
    commonjs(),
    uglify()
  ]
};
