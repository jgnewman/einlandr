var spawn = require('child_process').spawn;
var gutil = require('gulp-util');


/**
 * Spawn a child process that pulls in the correct environment
 * variables and initiates the gulp server.
 */
function up() {

  const isProd = process.env.NODE_ENV === 'production';
  const isImplicitEnv = process.argv[2] === '--implicit-env';
  const prodCommand = isImplicitEnv ? 'gulp up' : '. ./env-prod && gulp up';
  const cmdString = isProd ? prodCommand : '. ./env-dev && gulp up';

  gutil.log(gutil.colors.green(`Building ${process.env.NODE_ENV} app...`));

  const child = spawn(cmdString, {
    stdio: 'inherit',
    shell: true
  });

  child.on('close', function(code) {
    gutil.log('Shutting down server management worker with code ' + code);
    if (code === 99) {
      gutil.log(gutil.colors.green('Refreshing server...'));
      up();
    }
  });

}

/**
 * Launch the process
 */
up();
