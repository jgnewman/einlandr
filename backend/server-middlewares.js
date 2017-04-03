import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';


export default function attachMiddlewares(app) {

  /******************************
   * Attach your middleware here
   ******************************/


  /**
   * Add some bodyparser goodness to requests
   */
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.text());

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


}
