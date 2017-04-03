import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import { checkAuth } from './server-auth';
import config from '../config';


export default function attachMiddlewares(app) {

  /**
   * Add some bodyparser goodness to requests
   */
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.text());

  /**
   * Allow authenticating requests
   */
  app.use(checkAuth());

  /**
   * Conditionally enable cross-origin resource sharing
   */
  if (config.backend.corsEnabled) {
    app.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
    });
  }

  /**
   * Serve static assets
   */
  app.use('/css', express.static(
    path.resolve(__dirname, '../', 'frontend', 'css')
  ));

  app.use('/js', express.static(
    path.resolve(__dirname, '../', 'frontend', 'js')
  ));

  app.use('/fonts', express.static(
    path.resolve(__dirname, '../', 'frontend', 'fonts')
  ));

  app.use('/img', express.static(
    path.resolve(__dirname, '../', 'frontend', 'img')
  ));

  app.use('/favicon.ico', express.static(
    path.resolve(__dirname, '../', 'frontend', 'favicon.ico')
  ));

  app.use('/apple-touch-icon.png', express.static(
    path.resolve(__dirname, '../', 'frontend', 'apple-touch-icon.png')
  ));

  /**
   * Serve compiled application files
   */
  app.use('/app', express.static(
    path.resolve(__dirname, '../', 'frontend', 'app')
  ));

  /*************************************
   * Attach your custom middleware here
   *************************************/


}
