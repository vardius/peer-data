import sourcemaps from "rollup-plugin-sourcemaps";
import resolve from "rollup-plugin-node-resolve";
import globals from "rollup-plugin-node-globals";
import builtins from "rollup-plugin-node-builtins";
import babel from "rollup-plugin-babel";
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
    sourcemaps(),
    resolve(),
    globals(),
    builtins(),
    babel({
      exclude: "node_modules/**"
    }),
    commonjs(),
    uglify()
  ]
};
