import http from 'http';
import express from 'express';
import brightsocket from 'brightsocket.io';
import attachMiddlewares from './server-middlewares';
import attachRoutes from './server-routes';
import attachNgrok from './server-ngrok';
import { attachReload, markRefreshing } from '../reloader/server-reloader';
import dbReady from './db-init';
import config from '../config';

let app, server, socketServer;

export function startServer() {
  app = express();
  server = http.createServer(app);
  socketServer = brightsocket(server);
  attachMiddlewares(app);
  attachRoutes(app);
  !config.isProduction && attachReload(app);
  config.backend.ngrokEnabled && attachNgrok(app);
  config.backend.dbEnabled && dbReady();
  server.listen(config.backend.serverPort);
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
  markRefreshing();
  stopServer();
  process.exit(99);
}
