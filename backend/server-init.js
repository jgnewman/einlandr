import http from 'http';
import express from 'express';
import brightsocket from 'brightsocket.io';
import attachMiddlewares from './server-middlewares';
import attachRoutes from './server-routes';
import attachNgrok from './server-ngrok';
import { attachSchedules, killSchedules } from './server-schedules';
import { attachReload, markRefreshing } from '../utilities/reloader/server-reloader';
import attachAPI from './http-api-v1';
import attachSocketAPI from './socket-api-v1';
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
  config.backend.dbEnabled && dbReady(db => {
    attachAPI(app, db);
    attachSocketAPI(socketServer, db);
  });
  !config.isProduction && config.backend.ngrokEnabled && attachNgrok(app);
  attachSchedules();
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
  killSchedules();
  process.exit(99);
}
