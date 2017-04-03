# Einlandr

Einlandr is a robust bootstrapping environment for React apps running on Node servers with Postgres databases that runs on Yarn.

Jump to...

- [Features](#features)
- [Getting set up](#getting-set-up)
- [Environment files](#environment-files)
- [Using a database](#using-a-database)
- [Exposing a dev app to the internet](#exposing-a-dev-app-to-the-internet)
- [Enabling CORS](#enabling-cors)
- [Configuring server routes](#configuring-server-routes)
- [Configuring server middleware](#configuring-server-middleware)
- [Using the http API](#using-the-http-api)

- [Using the websocket API](#using-the-websocket-api)
- [Using authentication](#using-authentication)
- [Understanding the front end](#understanding-the-front-end)
- [Adding a new React layer](#adding-a-new-react-layer)
- [All the yarn commands](#all-the-yarn-commands)

## Features

On the front end:

- ES6
- A clean, ready-made application architecture following the container/presentational pattern, great for managing...
  - containers
  - components
  - actions
  - reducers
  - event handlers
  - data
  - misc libraries
  - initial state
  - redux middleware
  - redux devtools
- A clean, ready-made scss architecture dividing styles up in a way that follows your application structure
- Bootstrapped react-router
- Bootstrapped react-redux state management
- Bootstrapped localStorage state persistence
- Axios for utilizing a built-in REST API
- Websockets for utilizing a built-in Websocket API
- A yarn command for generating a new application layer on the fly
- Placeholders for fonts, images, and a favicon

On the back end:

- ES6
- Gulp + Express
- A configurable nature
- Env variables for both prod vs dev environments
- Minified CSS and JavaScript for prod environment
- Automatic browser refreshing for dev environment
- Automatic server refresh + browser refresh when server files change
- Optionally enable/disable ngrok for development
- Optionally enable/disable CORS
- Optionally enable/disable use of a database
- A bootstrapped database schema with Users and Sessions
- A bootstrapped database migration script + Yarn command
- A bootstrapped http API
- A bootstrapped Websocket API
- Built-in authentication using JSON web tokens
- Authentication shared between http and Websocket APIs
- Ability to easily add express middleware and routes

## Getting set up

1. Make a copy of this repo using the method of your choice.
2. Make sure you have Yarn installed globally then install deps by running `$ yarn`.
3. Prepare a basic environment so Yarn commands will work. See [Environment files](#environment-files).
4. Open up config.js and choose a server port. The default is 8080. If you want to be up and running quickly, temporarily forego your database by setting `dbEnabled` to false.
5. Run `$ yarn dev`.

The app is now running on a local server!

To learn about all the cool things you can do with Einlandr, keep reading.

## Environment files

Einlandr is configurable for both development and production environments. To make this work, you will need to create two new files at the top level. These files are not included in the repo for security purposes as you will eventually need to add various secret keys to them.

The files should be called `env-dev` and `env-prod` respectively. No file extension is necessary. At the very least you should add the following content to these files:

**env-dev**

```bash
export NODE_ENV=development
export DB_DEV_NAME=einlandr
export DB_SECRET="I've got a secret, I'm not gonna tell you"
```

**env-prod**

```bash
export NODE_ENV=production
export DB_SECRET="Pirates always fight with cutlasses"
```

Everything you do with Einlandr is run through Yarn commands. These commands will source these files as appropriate, making them available throughout your server environment. That said, the expected workflow is that the config file should adjust itself based on these variables, then the rest of the server uses the config file. As you add new layers to your application that require environment variables, you will want to store those in these files.

## Using up a database

### Creation

Einlandr is optimized for Postgres. You can switch this out for something else if you'd like but I wouldn't recommend it unless you are intimately familiar with all of the Einlandr source code. A lot of things are bootstrapped for you and they assume a Postgres database.

To set up a local database, make sure you have Postgres installed and some method of checking in your database to make sure everything is working. If you're a visual person and are using a Mac, I highly recommend [Postico](https://eggerapps.at/postico/).

Einlandr can't actually create a database for you so you'll need to do this yourself. I'll have to assume you already know how to create databases. With Postico, hit "connect", click "localhost" at the top, then click the "+ Database" button at the bottom. Give your database a name.

### Configuration

Once you've created a database and named it, you'll need to plug that name into your env-dev file for the `DB_DEV_NAME` key. Also make sure you choose a `DB_SECRET` to go along with certain database-related actions.

Open up config.js, find the `backend` object, and make sure you set `dbEnabled` to true. Notice how other database values are pulled in from the environment. You'll want to follow this pattern when adding new configuration options.

The `DB_URL` key is only necessary for production databases such as on Heroku. When you're ready to use it, it should take a form like:

```
postgres://axjxocwjzztraf:6f8b8351f2f87b26e50fa06210d7cbf1474567891dbdde5abb64440c7aa9c608@ec2-48-21-220-167.compute-1.amazonaws.com:5432/d2v3v3huf99oin
```

### Migration (seeding)

In order to create a database scheme, Einlandr uses [Sequelize](http://docs.sequelizejs.com/en/v3/). If you open backend/db-models.js you will see that the first two ORM models have been created for you, namely Users and Sessions. These two models are necessary for Einlandr's built-in authentication to work properly so I'd recommend against deleting them, although you can feel free to modify the Users model to your heart's content as long as you leave email and password intact.

Define all the additional models you'd like in the area labeled "Define your models here". This will allow Sequelize to set up all of the necessary tables and relations for you.

Next, open up backend/db-migrate.js and look for the area labeled as "Create your data here". Just above this line you will see two examples of users that will be seeded into the database whenever you run your migration script. Feel free to copy/paste this pattern in order to easily add new seed data:

```javascript
// Create a new User with these values
.then(() => create(models.User, {
  firstName: 'John',
  lastName: 'Doe',
  email: 'fake@fake.com',
  password: 'asdf;laksjdf'
}, 'Created user John Doe')) // Useful console output on creation success
```

The migration command is `yarn dev:migrate` for development environments or `yarn prod:migrate` for production environments. Remember that the only difference between these two commands is which set of envionment variables it uses and how it connects to your database.

**The migration script will drop all tables** if they already exist and then create everything from scratch. So only use it when that's what you want.

### Defining an API

In order to make using the http API and websocket API easy, you'll want to simplify how these layers access your database. Sequelize can often be verbose and it's good to put a layer of abstraction over it for some of your more complicated queries.

To do that, open up the file backend/db-api.js and locate the area labeled "Define the rest of your API here". Follow the pattern you see below for the `authUser` function. Note that `create<ModelName>, read<ModelName>, update<ModelName>, delete<ModelName>` functions have automatically been created for each of your models.

```javascript
// Create a function on the DB API called authUser.
// It takes an email string and a password string.
api.authUser = (email, password) => {

  // Use sequelize to locate a user record where
  // the username/password values match.
  const promise = models.User.findOne({
    where: { email: email, password: password }
  });

  // If there's a problem, log that to the console.
  promise.catch(err => log(colors.red(err)));

  // Log a successful result to the console as well.
  promise.then(result => {
    result ? log(colors.green(`Found user with matching email & password.`))
           : log(colors.blue(`Could not find user with matching email & password.`));
  });

  // Return a promise. When it resolves with the user
  // record, asyncRemovePassword will cut the password
  // value out of it so that doesn't accidentally make it
  // out to the client side.
  return asyncRemovePassword(promise);
};
```

You will have this database API available to you when defining both your http API and your websocket API.

## Exposing a dev app to the internet

Einlandr allows you to _easily_ expose a development app to the internet if that ability is necessary for testing. To do this, it uses [ngrok](https://ngrok.com/).

Open up config.js and set `ngrokEnabled` to true. That's it. When you run the app via `$ yarn dev`, you'll see a temporary URL logged to the console through which external connections should be able to access your application.

Note that if your _computer_ is not currently allowing outside connections, you'll have to turn that off in order for ngrok to work.

## Enabling CORS

Einlandr makes cross origin resource sharing a breeze as well. Simply open up config.js and set `enableCORS` to true. Feel free to base this on an environment variable if you'd like. This will enable CORS for all http requests.

## Configuring server routes

Einlandr uses [Express](https://expressjs.com/) for the http server. The first route that serves up your react app has already been configured for you. To add more, open the file backend/server-routes.js.

Within this file, locate the area labeled "Attach your routes here". You'll want to define all of your additional routes in this area following the pattern shown above.

Note that static assets are already configured for you in the file server-middlewares.js. A good rule of thumb for determining whether something should go into server-middlewares or server-routes is whether it's a call to `app.get` or `app.use`. If it's `app.use`, put it in middlewares.

## Configuring server middleware

As stated above, Einlandr uses [Express](https://expressjs.com/) for the http server. If you'd like to add middleware to http requests to your server app, you can do that in backend/server-middlewares.js.

Within this file, you'll see that lots of yummy middleware is already being applied. To add more, find the area labeled "Attach your custom middleware here" and add in all the calls to `app.use` that you want.

## Using the http API

Einlandr starts you off with a minimally bootstrapped http API. If your app does not use a database, this will be both useless and unavailable to you.

To define your API, open the file backend/http-adpi-v1.js and locate the area labeled "Add more API routes here". Because Einlandr uses [Express](https://expressjs.com/) for the http server, API routes will be added with calls to `app.get, app.post, etc`.

Notice that 3 routes have already been created for you: one for logging in, one for logging out (more on authentication later), and one for getting a user record. Follow the pattern seen in these functions to create routes of your own:

```javascript
// When a request attempts to get a user by id...
app.get('/api/v1/users/:id', (req, res) => {

  // Call readUser from the db api.
  dbAPI.readUser(req.params.id)

       // If we got a result, send it back out.
       .then(result => { res.send(result) })

       // If something went wrong, send a 404 instead.
       .catch(() => { res.sendStatus(404) });
});
```
