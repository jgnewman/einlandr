import http from 'http';
import express from 'express';
import brightsocket from 'brightsocket.io';
import attachMiddlewares from './server-middlewares';
import attachRoutes from './server-routes';
import attachReload from './server-browser-reload';

const isProd = process.env.NODE_ENV === 'production';

let app, server, socketServer;

export function startServer() {
  app = express();
  server = http.createServer(app);
  socketServer = brightsocket(server);
  attachMiddlewares(app);
  attachRoutes(app);
  !isProd && attachReload(app);
  server.listen(8080);
}

export function stopServer() {
  if (server) {
    server.close();
    app = null;
    server = null;
    socketServer = null;
  }
}

export function refreshServer() {
  stopServer();
  process.exit(99);
}
