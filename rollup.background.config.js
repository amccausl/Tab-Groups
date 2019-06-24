// @todo most of this isn't required, can be cleaned up
import async from 'rollup-plugin-async'
import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

const config = {
  input: './src/background.mjs',
  output: {
    file: './dist/background.js',
    format: 'umd',
    sourcemap: true,
  },
  plugins: [
    async(),
    nodeResolve({
    }),
    commonjs()
  ]
}

export default config
