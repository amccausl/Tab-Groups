import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'

const config = {
  input: './src/background.mjs',
  output: {
    file: './dist/background.js',
    format: 'umd',
    sourcemap: true,
  },
  plugins: [
    nodeResolve(),
    commonjs()
  ]
}

export default config
