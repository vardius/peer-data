import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import sourcemaps from "rollup-plugin-sourcemaps";
import typescript from "rollup-plugin-typescript2";

const pkg = require("./package");
const external = Object.keys(pkg.peerDependencies);
const env = process.env.NODE_ENV;
const plugins = [
  sourcemaps(),
  resolve({
    browser: true,
    preferBuiltins: true,
  }),
  commonjs(),
  typescript({
    objectHashIgnoreUnknownHack: true,
    clean: true,
  }),
];

const config = {
  input: "src/index.ts",
  external: external,
  plugins: plugins,
  output: [
    {
      name: pkg.name,
      exports: "named",
      file: pkg.module,
      format: "es",
      sourcemap: true,
    },
    {
      name: pkg.name,
      exports: "named",
      file: pkg.main,
      format: "cjs",
      sourcemap: true,
    },
  ],
};

export default config;
