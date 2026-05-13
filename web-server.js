const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());

// Proxy all requests to the Expo dev server
app.use('/', createProxyMiddleware({
  target: 'http://localhost:8083',
  changeOrigin: true,
  ws: true,
  pathRewrite: {
    '^/': '/'
  }
}));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Web server running on http://localhost:${PORT}`);
  console.log(`Accessible from anywhere at: http://localhost:${PORT}`);
});
