const proxy = require('http-proxy-middleware');
const backendTarget = "http://10.9.7.108";

module.exports = function (app) {
  app.use(proxy('/api', { target: backendTarget, changeOrigin: true }));
};