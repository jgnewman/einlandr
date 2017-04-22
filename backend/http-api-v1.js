import {
  applyAuth,
  generateSession,
  destroySession,
  validateSession
} from './server-auth';

import promiser from 'stateful-promise';

export default function attachAPI(app, queries) {

  // Make sure authentication requirements are properly applied
  // to the following routes.
  app.use(applyAuth({
    requireFor: ['/api/v1/*'],
    bypassFor: [
      '/api/v1/authentication',
      '/api/v1/authentication/*'
    ]
  }));

  /*******************************************
   * Authentication
   *******************************************/

  // POST to authentication
  // Takes email, password
  // Log a user in
  // Return a session id
  app.post('/api/v1/authentication/', (req, res) => {
    promiser({
      email: req.body.email,
      password: req.body.password
    })

    // Attempt to authenticate the user
    .then(state => {
      return state.set('user', queries.authUser(state.email, state.password), 401)
    })

    // Remove password-related fields from the record and
    // create a new session
    .then(state => {
      delete state.user.password;
      delete state.user.pwdSalt;
      delete state.user.pwdIterations;
      return state.set('session', generateSession(
        state.user,
        queries.createSession,
        queries.suppressSession
      ), 500)
    })

    // Send positive info to the user.
    .then(state => {
      res.send({ token: state.session.id, user: state.user })
    })

    // Send a failing status if something didn't work.
    .catch((_, err) => {
      res.sendStatus(err);
    })
  });

  // POST to authentication/logout
  // Log a user out
  app.post('/api/v1/authentication/logout', (req, res) => {
    promiser()

    // Destory a session
    .then(state => {
      return state.set('destroyed', destorySession(req.body.token, queries.deleteSession))
    })

    // Then provide feedback on whether it worked or not
    .then(() => res.sendStatus(200))
    .catch(() => res.sendStatus(500))
  });

  // POST to authentication/check
  // Check an auth token
  app.post('/api/v1/authentication/check', (req, res) => {
    promiser()

    // Validate the token
    .then(state => {
      return state.set('validated', validateSession(
        req.body.token,
        queries.readSession,
        queries.updateSession,
        queries.deleteSession
      ))
    })

    // Provide info about whether or not it worked
    .then(() => res.sendStatus(200))
    .catch(() => res.sendStatus(401))
  });

  /*******************************************
   * Users
   *******************************************/

  app.get('/api/v1/users/:id', (req, res) => {
    promiser()
      .then(state => state.set('user', queries.readUser(req.params.id)))
      .then(state => res.send(state.user))
      .catch(()   => res.sendStatus(404))
  });

  /*******************************************
   * Add more API routes here
   *******************************************/

}
