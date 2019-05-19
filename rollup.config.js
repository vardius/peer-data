import sourcemaps from "rollup-plugin-sourcemaps";
import resolve from "rollup-plugin-node-resolve";
import globals from "rollup-plugin-node-globals";
import builtins from "rollup-plugin-node-builtins";
import commonjs from "rollup-plugin-commonjs";
import typescript from "rollup-plugin-typescript2";

const pkg = require("./package");
const external = Object.keys(pkg.peerDependencies);
const env = process.env.NODE_ENV;
const plugins = [
  sourcemaps(),
  resolve({
    mainFields: ['module', 'main', 'browser', 'jsnext']
  }),
  typescript({
    clean: true,
    rollupCommonJSResolveHack: true,
    exclude: ['*.d.ts', '**/*.d.ts'],
  }),
  commonjs(),
  globals(),
  builtins(),
];

const config = {
  input: "src/index.ts",
  external: external,
  plugins: plugins,
  output: [
    {
      name: pkg.name,
      exports: 'named',
      file: pkg.module,
      format: "es",
      sourcemap: true
    },
    {
      name: pkg.name,
      exports: 'named',
      file: pkg.main,
      format: "umd",
      sourcemap: true
    },
  ]
};

export default config;
