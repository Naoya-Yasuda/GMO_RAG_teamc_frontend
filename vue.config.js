const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    // proxy: {
    //   // WebSocket用のパスをプロキシから除外
    //   // '/ws': {
    //   //   target: 'ws://localhost:49503', // オリジナルのWebSocketサーバー
    //   //   ws: true,
    //   //   changeOrigin: true,
    //   //   pathRewrite: { '^/ws': '' }, // WebSocketパスのリライトが必要な場合
    //   //   logLevel: 'debug'
    //   // },
    //   '^/': {  // '^/' はすべてのリクエストを意味する正規表現
    //     target: 'http://160.251.238.232:49510',
    //     changeOrigin: true,
    //     secure: false, // httpsを使用しない場合、または自己署名証明書を使用している場合に役立ちます
    //     logLevel: 'debug' // プロキシの動作をログで詳細に追跡
    //   }
    // }
  }
})
