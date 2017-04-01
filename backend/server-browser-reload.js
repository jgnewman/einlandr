export default function attachReload(app) {
  let needsReload = true;

  app.get('/einlandr-reload', (req, res) => {

    if (needsReload) {
      needsReload = false;
      res.send({needsReload: true});

    } else {
      res.send({needsReload: false});

    }
  });
}
