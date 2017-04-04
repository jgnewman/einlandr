import {
  applyAuth,
  generateSession,
  destroySession
} from './server-auth';

export default function attachAPI(app, dbAPI) {

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
    dbAPI.authUser(req.body.email, req.body.password).then(result => {
      if (result) {
        const creator = generateSession(result, dbAPI.createSession);
        creator.then(token => res.send({ token: token, user: result }));
        creator.catch(() => res.sendStatus(500));
      } else {
        res.sendStatus(401);
      }
    })
    .catch(result => res.sendStatus(401));
  });

  // POST to authentication/logout
  // Log a user out
  app.post('/api/v1/authentication/logout', (req, res) => {
    const token = req.body.token;
    const destroyer = destroySession(token, dbAPI.deleteSession);
    destroyer.then(() => res.sendStatus(200));
    destroyer.catch(() => res.sendStatus(500));
  });

  /*******************************************
   * Users
   *******************************************/

  app.get('/api/v1/users/:id', (req, res) => {
    dbAPI.readUser(req.params.id)
         .then(result => { res.send(result) })
         .catch(() => { res.sendStatus(404) });
  });

  /*******************************************
   * Add more API routes here
   *******************************************/

}
