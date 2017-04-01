import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';

export default function attachMiddlewares(app) {

  /**
   * Add some bodyparser goodness to requests
   */
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.text());

  /**
   * Serve static assets
   */
  app.use('/assets', express.static(
    path.resolve(__dirname, '../', 'frontend', 'assets')
  ));

  /**
   * Serve compiled application files
   */
  app.use('/app', express.static(
    path.resolve(__dirname, '../', 'frontend', 'app')
  ));

  /**
   * Serve the favicon from its standard location
   */
  app.use('/favicon.ico', express.static(
    path.resolve(__dirname, '../', 'frontend', 'favicon.ico')
  ));

}
