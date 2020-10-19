module.exports = {

  devServer: {
    proxy: {
      // detail: https://cli.vuejs.org/config/#devserver-proxy

      '/api': {
        // target: `http://localhost:8081/api`,
        target: 'http://test.fangshirui.cn:8081/api',
        changeOrigin: true,
        pathRewrite: {
          '^/api' : ''
        }
      }
    }
  }

}
