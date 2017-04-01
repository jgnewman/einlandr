import path from 'path';
import express from 'express';

export default function attachMiddlewares(app) {

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
