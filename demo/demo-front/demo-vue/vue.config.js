const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 3000, // 개발 서버 포트를 3000으로 설정
    proxy: {
      '/app-api': { // 프론트엔드에서 '/app-api'로 시작하는 요청을 프록시
        target: 'http://localhost:8080', // 백엔드 서버 주소 (포트까지만)
        changeOrigin: true,
        pathRewrite: {
          '^/app-api': '/api/v1' // '/app-api'를 '/api/v1'로 변경
        }
      }
    }
  }
})
