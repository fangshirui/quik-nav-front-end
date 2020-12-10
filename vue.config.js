module.exports = {

  devServer: {
    proxy: {
      // detail: https://cli.vuejs.org/config/#devserver-proxy

      '/api': {
        // target: `http://localhost:8081/api`,
        target: 'http://test.fangshirui.cn:8081/api',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  },
  // 生产环境 是否需要 sourceMap, 默认为true
  // sourceMap对普通用户无感，
  // 浏览器打开开发者模式才会加载后端的map文件帮助分析
  // 若想在前端隐藏隐藏源代码可以考虑关闭sourceMap
  productionSourceMap: false
}
