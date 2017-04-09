import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { log, colors } from 'gulp-util';
import config from '../config';

let runningThreads = {};

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

function logChildOutput(data, name, isErr) {
  const stringified = data.toString().trim().replace(/^\[\d\d\:\d\d:\d\d\]\s*/, '');
  if (stringified) {
    return log(`[${isErr ? colors.red('Error') + ' from ' : ''}${colors.gray(name)}]: ${stringified}`);
  }
}

export function attachSchedules() {
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
        const child = spawn('babel-node', [file.filePath]);
        child.stdout.on('data', data => logChildOutput(data, file.fileName));
        child.stderr.on('data', data => logChildOutput(data, file.fileName, true));
        child.on('exit', code => log(`Child '${colors.cyan(file.fileName)}' exited with code ${code}`));
        runningThreads[file.fileName] = child;
      });

    }
  });
}

export function killSchedules() {
  Object.keys(runningThreads).forEach(name => {
    log(colors.yellow('Killing schedule', name + '...'));
    runningThreads[name].kill();
  })
  runningThreads = {};
}
