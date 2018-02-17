import { applyAuth } from './server-auth';

import promiser from 'stateful-promise';

export default function attachAPI(app, { Users, Sessions }) {

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

      // Attempt to authenticate the user
      const user = await Users.authenticate(req.body.email, req.body.password);
      if (!user || user.isNull()) throw 401;

      // Remove password-related fields from the record and
      // create a new session
      delete user.password;
      delete user.pwdSalt;
      delete user.pwdIterations;

      const session = await Sessions.start(user);

      // Send positive info to the user.
      return res.send({ token: session.id, user: user.raw() });

    } catch (err) {

      // Send a failing status if something didn't work.
      res.sendStatus(typeof err === 'number' ? err : 500);

    }

  });

  // POST to authentication/logout
  // Log a user out
  app.post('/api/v1/authentication/logout', async (req, res) => {
    try {
      await Sessions.destroy(req.body.token);
      return res.sendStatus(200);
    } catch (_) {
      res.sendStatus(500);
    }
  });

  // POST to authentication/check
  // Check an auth token
  app.post('/api/v1/authentication/check', async (req, res) => {
    try {
      const session = await Sessions.validate(req.body.token);
      if (!session || session.isNull()) throw 401;
      return res.sendStatus(200);
    } catch (err) {
      res.setStatus(typeof err === 'number' ? err : 500);
    }
  });

  /*******************************************
   * Users
   *******************************************/

  app.get('/api/v1/users/:id', async (req, res) => {
    try {
      const user = await Users.get(req.params.id);
      if (!user || user.isNull()) throw 404;
      return res.send(user.raw());
    } catch (err) {
      res.sendStatus(typeof err === 'number' ? err : 500);
    }
  });

  /*******************************************
   * Add more API routes here
   *******************************************/

}
