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
  app.post('/api/v1/authentication/', async (req, res) => {
    try {

      const state = await promiser({
        email: req.body.email,
        password: req.body.password
      });

      // Attempt to authenticate the user
      await state.set('user', queries.authUser(state.email, state.password), 401);
      await state.rejectIf(!state.user, 401);

      // Remove password-related fields from the record and
      // create a new session
      delete state.user.password;
      delete state.user.pwdSalt;
      delete state.user.pwdIterations;

      await state.set('session', generateSession(
        state.user,
        queries.createSession,
        queries.suppressSession
      ), 500);

      // Send positive info to the user.
      await state.handle(res.send({ token: state.session.id, user: state.user }));

    } catch ({err}) {

      // Send a failing status if something didn't work.
      res.sendStatus(err);

    }

  });

  // POST to authentication/logout
  // Log a user out
  app.post('/api/v1/authentication/logout', async (req, res) => {
    try {

      const state = await promiser();

      // Destroy a session
      await state.set('destroyed', destroySession(req.body.token, queries.deleteSession), 500);

      // Then provide feedback on whether it worked or not
      await state.handle(res.sendStatus(200));

    } catch ({ err }) {

      res.sendStatus(err);
    }
  });

  // POST to authentication/check
  // Check an auth token
  app.post('/api/v1/authentication/check', async (req, res) => {
    try {

      const state = await promiser();

      // Validate the token
      await state.set('validated', validateSession(
        req.body.token,
        queries.readSession,
        queries.updateSession,
        queries.deleteSession
      ), 500)
      await state.rejectIf(!state.validated, 401)

      // Send the result
      await state.handle(res.sendStatus(200));

    } catch ({ err }) {

      res.setStatus(err);

    }
  });

  /*******************************************
   * Users
   *******************************************/

  app.get('/api/v1/users/:id', async (req, res) => {
    try {
      const state = await promiser();
      await state.set('user', queries.readUser(req.params.id));
      await state.rejectIf(!state.user, 404);
      await state.handle(res.send(state.user));
    } catch ({ err }) {
      res.sendStatus(err);
    }
  });

  /*******************************************
   * Add more API routes here
   *******************************************/

}
