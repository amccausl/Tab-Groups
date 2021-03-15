import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import scss from 'rollup-plugin-scss'
import vue from 'rollup-plugin-vue'

const config = {
  input: './src/app-action.mjs',
  output: {
    file: './dist/js/app-action.js',
    format: 'iife',
    sourcemap: false,
  },
  plugins: [
    vue({
    }),
    scss({
      output: './dist/css/app-action.css',
    }),
    replace({
      "preventAssignment": true,
      'process.env.NODE_ENV': JSON.stringify( 'production' ),
    }),
    nodeResolve(),
    commonjs(),
  ]
}

export default config
