import http from 'http';
import express from 'express';
import attachMiddlewares from './server-middlewares';
import attachRoutes from './server-routes';

let app, server;

export function startServer() {
  app = express();
  server = http.createServer(app);
  attachMiddlewares(app);
  attachRoutes(app);
  server.listen(8080);
}

export function stopServer() {
  if (server) {
    server.close();
    app = null;
    server = null;
  }
}

export function refreshServer() {
  stopServer();
  process.exit(99);
}
