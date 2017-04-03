import path from 'path';

export default function attachRoutes(app) {

  app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../', 'frontend', 'index.html'));
  });

  /******************************
   * Attach your routes here
   ******************************/

};
