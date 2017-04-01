import config from '../config';

export default function attachReload(app) {
  app.get('/einlandr-reload', (req, res) => {

    if (config.frontend.needsReload) {
      config.actions.unprepReload();
      res.send({needsReload: true});

    } else {
      res.send({needsReload: false});

    }
  });
}
