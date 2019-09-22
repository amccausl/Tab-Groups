import vue from 'rollup-plugin-vue'
import buble from 'rollup-plugin-buble'
import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import replace from 'rollup-plugin-replace'

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
    buble({
      objectAssign: 'Object.assign',
      // target: { firefox: 57 },
      transforms: {
        arrow: false,
        asyncAwait: false,
        conciseMethodProperty: false,
        destructuring: false,
        forOf: false,
        letConst: false,
        parameterDestructuring: false,
        templateString: false
      }
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify( 'production' )
    }),
    nodeResolve(),
    commonjs(),
  ]
}

export default config
