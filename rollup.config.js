import resolve from "rollup-plugin-node-resolve";
import globals from "rollup-plugin-node-globals";
import builtins from "rollup-plugin-node-builtins";
import commonjs from "rollup-plugin-commonjs";
import uglify from "rollup-plugin-uglify";

export default {
  format: "umd",
  moduleName: "peer-data",
  entry: "es/index.js",
  dest: "dist/peer-data.js",
  exports: "named",
  plugins: [
    resolve({ jsnext: true }),
    globals(),
    builtins(),
    commonjs(),
    uglify()
  ]
};
