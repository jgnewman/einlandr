let needsReload = true;
let isRefreshing = true;

export function shouldReload() {
  return needsReload && !isRefreshing;
}

export function prepReload() {
  needsReload = true;
}

export function unprepReload() {
  needsReload = false;
}

export function markRefreshing() {
  isRefreshing = true;
}

export function finishRefreshing() {
  isRefreshing = false;
}

export function attachReload(app) {
  app.get('/einlandr-reload', (req, res) => {

    if (shouldReload()) {
      unprepReload();
      res.send({needsReload: true});

    } else {
      res.send({needsReload: false});

    }
  });
}
