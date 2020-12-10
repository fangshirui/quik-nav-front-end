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
  // 生产环境 是否需要 source map, 默认为true
  // 定义为false可以优化前端代码量
  productionSourceMap: false
}
