import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { log, colors } from 'gulp-util';
import config from '../config';

let runningThreads = {};

/**
 * Collects all paths and filenames for each
 * schedule in the schedules directory.
 */
function getRealSchedules(dirContents) {
  const realSchedules = [];
  dirContents.forEach(fileName => {
    if (/\.(js|jsx)$/.test(fileName)) {
      realSchedules.push({
        fileName: fileName,
        filePath: path.resolve(__dirname, 'schedules', fileName)
      }); // put path on it
    }
  });
  return realSchedules;
}

/**
 * Formats output from a child process to work nicely with gulp logging.
 */
function logChildOutput(data, name, isErr) {
  const stampColor = isErr ? colors.red : colors.gray;
  const stringified = data.toString()
                          .trim()
                          .replace(/^\[\d\d\:\d\d:\d\d\]\s*/, '')
                          .replace(/\n\[(\d\d\:\d\d:\d\d)\]\s*/g, `\n[${stampColor('$1')}] [${stampColor(name)}]: `);

  return stringified && log(`[${stampColor(name)}]: ${stringified}`);
}

/**
 * Starts up all schedules
 */
export function attachSchedules() {
  const schedulesDir = path.resolve(__dirname, 'schedules');

  // Read the files in the schedules directory
  fs.readdir(schedulesDir, (err, result) => {

    // Log an error if we couldn't read the directory
    if (err) {
      log(colors.red('Problem reading schedules directory:'), colors.red(err));

    } else {

      // Collect a list of actual schedule files then loop over them.
      // For each one...
      const scheduleFiles = getRealSchedules(result);
      scheduleFiles.forEach(file => {

        // Add this schedule's filename to the runtime config
        config.tmp.schedules = config.tmp.schedules || [];
        config.tmp.schedules.push(file.fileName);
        log(colors.green(`Executing schedule '${colors.cyan(file.fileName)}'...`));

        // Spawn a child process.
        // Handle its output and exit events.
        const child = spawn('babel-node', [file.filePath]);
        child.stdout.on('data', data => logChildOutput(data, file.fileName));
        child.stderr.on('data', data => logChildOutput(data, file.fileName, true));
        child.on('exit', code => log(`Child '${colors.cyan(file.fileName)}' exited with code ${code}`));

        // Add this process to our list of running processes so that
        // `killSchedules` can send it a kill signal later.
        runningThreads[file.fileName] = child;
      });

    }
  });
}

/**
 * Sends a kill signal to every running thread.
 */
export function killSchedules() {
  Object.keys(runningThreads).forEach(name => {
    log(colors.yellow('Killing schedule', name + '...'));
    runningThreads[name].kill();
  })
  runningThreads = {};
}
