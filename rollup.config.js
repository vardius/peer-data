import sourcemaps from 'rollup-plugin-sourcemaps';
import nodeResolve from 'rollup-plugin-node-resolve';
import nodeGlobals from 'rollup-plugin-node-globals';
import nodeBuiltins from 'rollup-plugin-node-builtins';
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify';
import pascalCase from 'pascal-case';

export default {
  format: 'umd',
  moduleName: 'peer-data',
  entry: 'es/index.js',
  dest: 'dist/peer-data.js',
  exports: 'named',
  sourceMap: true,
  plugins: [
    sourcemaps(),
    nodeResolve(),
    nodeGlobals(),
    nodeBuiltins(),
    commonjs(),
    uglify()
  ]
};