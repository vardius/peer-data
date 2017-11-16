import sourcemaps from "rollup-plugin-sourcemaps";
import resolve from "rollup-plugin-node-resolve";
import globals from "rollup-plugin-node-globals";
import builtins from "rollup-plugin-node-builtins";
import commonjs from "rollup-plugin-commonjs";
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
];

const config = {
  name: pkg.name,
  input: "src/index.ts",
  exports: 'named',
  external: external,
  plugins: plugins,
  output: [
    {
      file: pkg.module,
      format: "es",
      sourcemap: true
    },
    {
      file: pkg.main,
      format: "umd",
      sourcemap: true
    },
  ]
};

export default config;
