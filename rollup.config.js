import resolve from "rollup-plugin-node-resolve";
import globals from "rollup-plugin-node-globals";
import builtins from "rollup-plugin-node-builtins";
import commonjs from "rollup-plugin-commonjs";
import uglify from "rollup-plugin-uglify";

var env = process.env.NODE_ENV;
var config = {
  format: "umd",
  moduleName: "peer-data",
  exports: "named",
  plugins: [
    commonjs(),
    resolve({
      module: true,
      jsnext: true,
      main: true,
      browser: true
    }),
    globals(),
    builtins()
  ]
};

if (env === "production") {
  config.plugins.push(
    uglify({
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        warnings: false
      }
    })
  );
}

export default config;
