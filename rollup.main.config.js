import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'
import replace from 'rollup-plugin-replace'
import vue from 'rollup-plugin-vue'

const config = {
  input: './src/main.mjs',
  output: {
    file: './dist/js/app.js',
    format: 'umd',
    sourcemap: true
  },
  plugins: [
    vue({
      css: './dist/css/app.css'
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify( 'production' )
    }),
    nodeResolve(),
    commonjs(),
  ]
}

export default config
