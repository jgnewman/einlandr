import { shouldReload, unprepReload } from '../reloader/server-reloader';
import config from '../config';

export default function attachReload(app) {
  app.get('/einlandr-reload', (req, res) => {

    if (shouldReload()) {
      unprepReload();
      res.send({needsReload: true});

    } else {
      res.send({needsReload: false});

    }
  });
}
