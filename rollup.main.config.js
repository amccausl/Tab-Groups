import alias from 'rollup-plugin-alias'
import vue from 'rollup-plugin-vue'
import buble from 'rollup-plugin-buble'
import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import replace from 'rollup-plugin-replace'

let plugins = [
  alias({
    vue$: 'vue/dist/vue.common.js'
  }),
  vue({
    css: './dist/assets/css/app.css'
  }),
  buble({
    objectAssign: 'Object.assign',
    // target: { firefox: 57 },
    transforms: {
      arrow: false,
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
  nodeResolve({
    jsnext: true,
    main: true,
    browser: true
  }),
  commonjs(),
]

let config = {
  input: './src/main.mjs',
  output: {
    file: './dist/assets/js/app.js',
    format: 'umd',
    sourcemap: true
  },
  plugins
}

export default config
