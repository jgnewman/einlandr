import { log, colors } from 'gulp-util';
import ngrok from 'ngrok';
import config from '../config';

export default function attachNgrok(app) {
  ngrok.connect(config.backend.serverPort, (err, url) => {
    if (err) log(colors.red(err));
    log('App exposed to the interenet at', colors.cyan(url));
  });
}
