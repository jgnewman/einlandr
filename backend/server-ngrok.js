import { log, colors } from 'gulp-util';
import ngrok from 'ngrok';
import config from '../config';

export default function attachNgrok(app) {
  ngrok.connect(config.backend.serverPort, (err, url) => {
    if (err) log(colors.red(err));
    config.tmp.ngrokURL = url;
    log(colors.yellow('Exposing app to the internet at', colors.cyan(url)));
  });
}
