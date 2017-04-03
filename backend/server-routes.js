import path from 'path';

export default function attachRoutes(app) {

  /******************************
   * Attach your routes here
   ******************************/

  app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../', 'frontend', 'index.html'));
  });

};
