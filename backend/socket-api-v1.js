import { validateSession, generateSession } from './server-auth';
import { log, colors } from 'gulp-util';


export default function attachSocketAPI(socketServer, dbAPI) {

  // Users will connect to the AUTHENTICATION channel and pass us a
  // username and password.
  socketServer.connect('AUTHENTICATION', (connection, identity) => {
    log(colors.yellow('User requesting authentication...'));
    console.log(identity.email, identity.password);
    // We'll attempt to authenticate the identity.
    dbAPI.authUser(identity.email, identity.password)

         // In the event of a successful authentication,
         // make sure we have a real result. If so, create
         // a new session.
         .then(result => {
           if (result) {
             const creator = generateSession(result, dbAPI.createSession);

             // When the new session is made, send back AUTHENTICATED and
             // tell the user to reconnect to the AUTHENTICATED channel.
             creator.then(token => {
               log(colors.green('User was authenticated.'));
               connection.send('AUTHENTICATED', {
                 sessionId: token,
                 user: result,
                 reconnect: 'AUTHENTICATED'
               });
             });

             // If we couldn't create a session. That's an error.
             creator.catch(err => {
               log(colors.red(err));
               connection.send('SERVER_ERROR', err);
             });

           // If we don't have a real result, the user is still UNAUTHORIZED.
           } else {
             log(colors.red('Failed to authorize user.'));
             connection.send('UNAUTHORIZED');
           }
         })

         // In the event of a failed authentication
         // we'll send back UNAUTHORIZED.
         .catch(err => {
           log(colors.blue(err));
           connection.send('UNAUTHORIZED');
         });
  });

  // Authenticated users will connect to the AUTHENTICATED channel
  // and pass us a package with { sessionId: <token> }
  socketServer.connect('AUTHENTICATED', (connection, identity) => {
    log(colors.yellow('User requesting authenticated API...'));

    // We'll add a filter to all incoming actions on this channel.
    // For each one, we'll expect the sessionId to be included.
    // If we can validate the session, we'll allow the action through.
    // If we can't, we'll filter it out and tell the user they're UNAUTHORIZED.
    connection.addFilter((action, payload, next) => {
      const validator = validateSession(
        payload.sessionId,
        dbAPI.readSession,
        dbAPI.deleteSession
      );
      validator.then(() => next());
      validator.catch(() => connection.send('UNAUTHORIZED'));
    });

    /*******************************************
     * Add additional action handlers here
     *******************************************/

    // Example.
    // connection.receive('GET_USER', payload => {
    //   dbAPI.readUser(payload.userId)
    //        .then(result => connection.send('USER_RECORD', result))
    //        .catch(result => connection.send('NOT_FOUND'));
    // });

  });

  /*******************************************
   * Add additional websocket channels here
   *******************************************/

}
