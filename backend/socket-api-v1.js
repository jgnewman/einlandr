import { log, colors } from 'gulp-util';

export default function attachSocketAPI(socketServer, { Users, Sessions }) {

  // Users will connect to the AUTHENTICATION channel and pass us a
  // username and password.
  socketServer.connect('AUTHENTICATION', async(connection, identity) => {
    log('User requesting authentication...', identity.email);

    try {
      const user = await Users.authenticate(identity.email, identity.password);

      if (!user || user.isNull()) {
        log(colors.red('Failed to authorize user.'));
        return connection.send('UNAUTHORIZED', {
          responseTo: 'AUTHENTICATION:connect'
        });
      }

      const session = await Sessions.start(user);
      delete user.password;
      delete user.pwdSalt;
      delete user.pwdIterations;

      log('User was authenticated:', identity.email);
      connection.send('AUTHENTICATED', {
        sessionId: session.id,
        user: user.raw(),
        reconnect: 'AUTHENTICATED'
      });

    } catch (err) {
      log(colors.blue(err));
      connection.send('SERVER_ERROR', {
        responseTo: 'AUTHENTICATION:connect'
      });
    }

  });

  // Authenticated users will connect to the AUTHENTICATED channel
  // and pass us a package with { sessionId: <token> }
  socketServer.connect('AUTHENTICATED', (connection, identity) => {
    log('User requesting authenticated API...');

    // We'll add a filter to all incoming actions on this channel.
    // For each one, we'll expect the sessionId to be included.
    // If we can validate the session, we'll allow the action through.
    // If we can't, we'll filter it out and tell the user they're UNAUTHORIZED.
    connection.addFilter(async(action, payload, next) => {
      try {
        await Sessions.validate(payload.sessionId);
        return next();
      } catch (_) {
        connection.send('UNAUTHORIZED', {
          responseTo: `AUTHENTICATED:${action}`
        })
      }
    });

    /*******************************************
     * Add additional action handlers here
     *******************************************/

    // Example.
    // connection.receive('GET_USER', async(payload) => {
    //   const user = await Users.get(payload.userId)
    //
    //   if (!user || user.isNull()) return connection.send('NOT_FOUND', {
    //     responseTo: 'AUTHENTICATED:GET_USER'
    //   })
    //
    //   return connection.send('USER_RECORD', user.raw(
    //     'id',
    //     'firstName',
    //     'lastName',
    //     'email'
    //   ))
    // })

  });

  /*******************************************
   * Add additional websocket channels here
   *******************************************/

}
