import sourcemaps from "rollup-plugin-sourcemaps";
import resolve from "rollup-plugin-node-resolve";
import globals from "rollup-plugin-node-globals";
import builtins from "rollup-plugin-node-builtins";
import commonjs from "rollup-plugin-commonjs";
import uglify from "rollup-plugin-uglify";
import typescript from "rollup-plugin-typescript2";

const pkg = require("./package");
const external = Object.keys(pkg.dependencies);
const env = process.env.NODE_ENV;
const plugins = [
  sourcemaps(),
  resolve({
    jsnext: true,
    browser: true
  }),
  typescript(),
  commonjs(),
  globals(),
  builtins(),
  uglify()
];

const config = {
  moduleName: pkg.name,
  entry: "src/index.ts",
  exports: "named",
  external: external,
  plugins: plugins,
  targets: [
    {
      dest: pkg.main,
      format: "umd",
      sourceMap: true
    },
    {
      dest: pkg.module,
      format: "es",
      sourceMap: true
    }
  ]
};

export default config;
