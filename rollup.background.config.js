// @todo most of this isn't required, can be cleaned up
import async from 'rollup-plugin-async'
import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

let plugins = [
  async(),
  nodeResolve({
  }),
  commonjs()
]

let config = {
  input: './src/background.mjs',
  output: {
    file: './dist/background.js',
    format: 'umd',
    sourcemap: true,
  },
  plugins: plugins
}

export default config
