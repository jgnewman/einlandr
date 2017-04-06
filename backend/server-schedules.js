import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { log, colors } from 'gulp-util';
import config from '../config';

const childSettings = {
  stdio: 'inherit',
  shell: true
};

function getRealSchedules(dirContents) {
  const realSchedules = [];
  dirContents.forEach(fileName => {
    if (/\.(js|jsx)$/.test(fileName)) {
      realSchedules.push({
        fileName: fileName,
        filePath: path.resolve(__dirname, '../', 'schedules', fileName)
      }); // put path on it
    }
  });
  return realSchedules;
}

export default function attachSchedules() {
  const schedulesDir = path.resolve(__dirname, '../', 'schedules');
  fs.readdir(schedulesDir, (err, result) => {

    if (err) {
      log(colors.red('Problem reading schedules directory:'), colors.red(err));

    } else {

      const scheduleFiles = getRealSchedules(result);
      scheduleFiles.forEach(file => {
        config.tmp.schedules = config.tmp.schedules || [];
        config.tmp.schedules.push(file.fileName);
        log(colors.green(`Executing schedule '${colors.cyan(file.fileName)}'...`));
        const child = spawn(`babel-node ${file.filePath}`, childSettings);
        child.on('close', code => log(`Child '${colors.cyan(file.fileName)}' exited with code ${code}`));
      });

    }
  });
}
