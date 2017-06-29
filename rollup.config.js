import pascalCase from "pascal-case";
import sourcemaps from "rollup-plugin-sourcemaps";
import resolve from "rollup-plugin-node-resolve";
import globals from "rollup-plugin-node-globals";
import builtins from "rollup-plugin-node-builtins";
import commonjs from "rollup-plugin-commonjs";
import uglify from "rollup-plugin-uglify";
import typescript from "rollup-plugin-typescript2";

const pkg = require("./package");
const env = process.env.NODE_ENV;
const config = {
  moduleName: pascalCase(pkg.name),
  entry: "src/index.ts",
  format: "umd",
  exports: "named",
  sourceMap: true,
  plugins: [
    sourcemaps(),
    resolve({
      jsnext: true,
      browser: true
    }),
    typescript(),
    commonjs(),
    globals(),
    builtins()
  ]
};

if (env === "production") {
  config.plugins.push(uglify());
}

export default config;
