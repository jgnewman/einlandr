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
- [Scheduling jobs](#scheduling-jobs)
- [Using the http API](#using-the-http-api)
- [Using the websocket API](#using-the-websocket-api)
- [Using authentication](#using-authentication)
- [Understanding the front end](#understanding-the-front-end)
- [Adding a new React layer](#adding-a-new-react-layer)
- [About auto refreshing](#about-auto-refreshing)
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
- A job scheduler
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
export SERVER_PORT=8080
export DB_DEV_NAME=einlandr
export DB_SECRET="I've got a secret, I'm not gonna tell you"
```

**env-prod**

```bash
export NODE_ENV=production
export SERVER_PORT=5000
export DB_SECRET="Pirates always fight with cutlasses"
```

Everything you do with Einlandr is run through Yarn commands. These commands will source these files as appropriate, making them available throughout your server environment. That said, the expected workflow is that the config file should adjust itself based on these variables, then the rest of the server uses the config file. As you add new layers to your application that require environment variables, you will want to store those in these files and then make corresponding config values.

Note that these are just example values. You can change them as needed.

## Using a database

### Creation

Einlandr is optimized for Postgres. You can switch this out for something else if you'd like but I wouldn't recommend it unless you are intimately familiar with all of the Einlandr source code. A lot of things are bootstrapped for you and they assume a Postgres database.

To set up a local database, make sure you have Postgres installed and some method of looking inside your database to make sure everything is working. If you're a visual person and are using a Mac, I highly recommend [Postico](https://eggerapps.at/postico/).

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
  // record, `simplify` will cut the password
  // value out of it so that doesn't accidentally make it
  // out to the client side.
  return simplify(promise);
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

## Scheduling jobs

Einlandr comes packaged with a built-in scheduler using [node-schedule](https://www.npmjs.com/package/node-schedule). To create a scheduled job, simply add a new file to the "schedules" directory. When the server starts up, each file in this directory will be launched in a child_process so that when jobs run, they won't block events on the main thread.

In order to user node-schedule you may want to be familiar with cron format. However, there are plenty of more semantic ways to schedule jobs though none are quite as concise.

Here is an example of a scheduled job that will run once every minute. Feel free to try it out.

```javascript
// Start by creating example.js and putting it
// in the schedules directory. Here are the
// contents of that file...

import schedule from 'node-schedule';
import dbReady from '../backend/db-init';

// Establish a database connection
dbReady((db, models, api) => {

  // Schedule a job to run every minute
  schedule.scheduleJob('0 * * * * *', () => {

    // Read the first user from the database and log it
    api.readUser(1).then(user => console.log(user));
  });
});
```

Note that the above script will only be able to log out data if you have already run the database migration script or you have put users into your database in some other way.

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

On the client side, Einlandr comes packaged with [Axios](https://www.npmjs.com/package/axios), a promise-based library for quickly making ajax requests. For example:

```javascript
import axios from 'axios';

axios.get('/api/v1/users/1')
     .then(user => { console.log(user) })
     .catch(err => { console.log(err) });
```

## Using the websocket API

Einlandr uses [Brightsocket.io](https://www.npmjs.com/package/brightsocket.io), a lesser-known but rather cool that sits on top of Socket.io for managing websocket APIs.

If you open up backend/socket-api-v1.js, you'll find 2 areas prepared for you to start writing code. The first is labeled "Add additional action handlers here" and the second is labeled "Add additional websocket channels here".

The first area is where you can describe API events for authenticated users (more on authentication later). The second area is where you can start doing more advanced things with Brightsocket.io once you get how it works.

Within the first area, an example of how you might write an API call using websockets has been written for you:

```javascript
// When an authenticated user sends the GET_USER action,
// we'll expect the payload to have a userId property.
connection.receive('GET_USER', payload => {

  // Use the database API to read a user by id.
  dbAPI.readUser(payload.userId)

       // If it's successful, send the result to the user as
       // a USER_RECORD action. The client side should listen for
       // this action and handle the result when it comes in.
       .then(result => connection.send('USER_RECORD', result))

       // If it didn't work, send the NOT_FOUND action instead.
       .catch(result => connection.send('NOT_FOUND'));
});
```


## Using authentication

Einlandr comes with a built-in method for authentication using json web tokens. Here's how it works and how you'll use it:

### Database schema

In backend/db-models.js, a User model and a Session model have already been created. Users are expected to have an email address and password to match against for authentication. When a user is authenticated, a session will be created in the sessions table.

By running the migration script (`$ yarn dev:migrate`), you will have 2 users created in the database that you can experiment with.

### Http api

In backend/http-api-v1.js, two routes have been created for authentication, specifically `POST /api/v1/authentication/` and `POST /api/v1/authentication/logout`.

An example login would look like the following:

```javascript
import axios from 'axios';

// Post credentials to the api
axios.post('/api/v1/authentication', {
  email: 'fake@fake.com',
  password: 'asdf;laksjdf'
})

// If it worked, we'll get back a session token and a
// user record.
.then(result => { console.log(result.token, result.user) })

// If not, we'll log the error.
.catch(err => { console.log(err) });
```

And an example logout would look like the following:

```javascript
import axios from 'axios';

// Post the token to the logout endpoint.
axios.post('/api/v1/authentication/logout', { token: sessionId })

// Log if it worked.
.then(() => { console.log('logged out') })

// Log if it didn't (this would be a server error)
.catch(err => { console.log(err) });
```

Once logged in, you'll need to pass in correct, standard ajax headers for any API route that requires authentication. For example:

```javascript
const token = // The token you got from logging in

axios.post('/api/v1/some-protected-route', dataToSend, {
  headers: { Authorization: `Basic ${token}` }
});
```

If you try to access a route that requires you to be authenticated and the `Authorization` header is not properly formed, you will get back a `401`.

### Protecting http routes

In backend/server-middlewares.js, you will notice this call: `app.use(checkAuth())`. This causes a function to run that checks authorization on every request. However, it will only _enforce_ authorization on routes you specify.

To that end, in backend/http-api-v1.js, you'll notice this call:

```javascript
app.use(applyAuth({
  requireFor: ['/api/v1/*'],
  bypassFor: [
    '/api/v1/authentication',
    '/api/v1/authentication/*'
  ]
}));
```

The `applyAuth` function is where you will specify which routes you would like to protect by enforcing authorization. By default, authorization is not enforced on any routes so, in the `requireFor` key, we've specified that authorization should be required for all routes beginning with `/api/v1/`. This lets us quickly protect the entire API. However, there are a few routes within that glob we'd like to let through. In particular, we can't enforce authorization on authentication end points because they are designed to be accessed by unauthenticated users. To fix this, we've added those routes to the `bypassFor` key. Anything listed here will be allowed through without requiring authentication.

### How authorization is checked

Whether it's via http or websockets (more on that in a minute), users will have to pass in the token they received when logging in to prove they are allowed to access protected routes.

In config.js you are allowed to specify how long a token is good for using the `sessionExpiry` key. By default, this key is set to 12, meaning 12 hours from the last time it was updated. A session is updated every time it successfully validates so, in effect, this would be 12 hours since a token was last used. You can adjust this at your leisure.

When a user is authenticated, a session is created in the database. Whenever a request comes in that needs to be authenticated, the token is used to retrieve the session from the database and validate it. If the session gets invalidated, the session is automatically removed from the database.

Simultaneously, while the app is running, there is a background process running a schedule that will clean expired sessions out of the database every 12 hours. See [scheduling jobs](#scheduling-jobs). You can adjust the schedule for this particular job in the config under the `sessionCleanFrequency` key.

### Websocket API

Because Einlandr uses [Brightsocket.io](https://www.npmjs.com/package/brightsocket.io) for websocket handling (and due to the nature of websockets generally), authentication is a little looser.

In backend/socket-api-v1.js, two brightsocket channels have been created for you. A brightsocket channel is essentially a partition of your websocket API. Before an incoming connection can do anything, it has to identify a channel it wants to use. Once it does, it will only have access to the events described within that channel until it reconnects and chooses a different channel.

Here, the two channels we've created are called `AUTHENTICATION` and `AUTHENTICATED`.

The `AUTHENTICATION` channel uses the database API to try to authenticate users then sends back the result. An incoming connection to this channel should include an `email` and `password` key in its payload. If the credentials can be authenticated, the server will send an event called "AUTHENTICATED" back through the connection with the following data attached:

```
{
  reconnect: 'AUTHENTICATED', // The channel the user should reconnect to
  user: { ... }, // The user record of the authenticated user
  sessionId: 'qoiwuerakfjdh...' // The auth token
}
```

In any other case, the server will send back "UNAUTHORIZED" or "SERVER_ERROR" depending on what went wrong.

Once authenticated, it's time for the connection to reconnect to the `AUTHENTICATED` channel. You'll notice that this channel has a call to `addFilter` in it, which is essentially middleware for Brightsocket.io. Any connection who can pass the test imposed by the filter will be allowed access to the rest of the API defined within this channel. Otherwise, it will be send "UNAUTHORIZED".

Specifically, this channel demands that every time data comes in through a connection (including when the actual connection occurs) that the payload include a `sessionId` key containing a valid session token. If it does, it will be able to access the websocket events you have set up within this channel.

On the client side, you can authenticate using a method like this:

```javascript
import brightsocket from 'brightsocket.io-client';

const socket = brightsocket();
const credentials = {
  email: 'fake@fake.com',
  password: 'asdf;laksjdf'
};

let sessionId;

function defineApi() {

  socket.send('GET_USER', {
    sessionId: sessionId,
    userId: 1
  });

  socket.receive('USER_RECORD' payload => {
    console.log('Received user record', payload);
  });
}

socket.connect('AUTHENTICATION', credentials, () => {
  socket.receive('AUTHENTICATED', payload => {
    sessionId = payload.sessionId;
    socket.connect(payload.reconnect, { sessionId: sessionId }, defineApi);
  });
})
```

## Understanding the front end

Then entire front end of the application lives in the "frontend" directory. As you might expect, there are files in here you'll want to modify and also files you'll want to leave alone because they are generated by the build process.

### Which files should be left alone

You'll want to ignore the entire frontend/css directory. It is exclusively used by the build process and will get wiped clean with every build. Instead, you'll define your styles using scss in the frontend/src/scss directory.

You'll also want to ignore frontend/index.html. This file is modified by the build process in that it changes depending upon whether you're in a development or production environment. If you want to modify change this file, you'll need to edit frontend/src/templates/index.html instead.

Fonts and images are just static files and Einlandr doesn't do anything with them. As such, feel free to put your fonts and images directly into frontend/fonts and frontend/img. You can also modify frontend/favicon.ico at will. Einlandr won't mess with it.

Most of the files you'll be dealing with on a regular basis live in frontend/src/js and frontend/src/scss.

### Scss structure

All of the project's source styles live in frontend/src/scss. Within this directory there is a subdirectory called "global" as well as 2 scss files:

- global - Contains all of your scss utility files: normalize, variables, fonts, mixins, classes, and universal styles.
- index.scss - imports all other scss files in the correct order
- \_application.scss - A file corresponding to the `AppContainer` component in your application.

The structural concept here is that, for every container in your React app, you should add a corresponding file next to \_application.scss and import it into index.scss. This way you can keep your styles organized by sections in the same way you will be organizing your JavaScript.

Normally, if you're adding a large new piece to your application with its own container, it's good to let Einlandr set the whole thing up for you. See [Adding a new React layer](#adding-a-new-react-layer) for more information on that.

### JavaScript structure

Your React app lives in frontend/src/js. At the root of this directory there are many subdirectories and a single file called index.js. Let's explore what's going on with each piece.

#### index.js

This file imports react-redux's store provider component and wraps it around an instance of react-router. The `/` route has already been defined for you and is attached to your `AppContainer` component. Within this file, react-dom also renders your application into the html.

#### containers

Each major "chunk" of your application should be divided into containers. This is comprised of a container component, at least one presentation component, and usually a place in the application state, a reducer, some event handlers, some data functions, and some redux actions. As you explore the various directories inside frontend/src/js, you'll see examples of this.

A container component should import data functions, redux actions, and event handlers and export a react-redux `connect`ed version of the component where state and actions have been mapped to props. A container should also instantiate a presentational component and begin passing down props. In AppContainer.js, all actions have been gathered into a single object that can be passed down to every nested component as a package. The same has been done with data functions and event handlers. Normally you'll want to be a bit more explicit with state values because the app will dynamically update along with those values, not so with these other functions.

#### components

There should be at least one presentational component nested within a container. In the case of AppContainer.js, the component App.js is rendered by the container.

As much as possible, presentational components should focus solely on the display of the html and calling event handlers when the user interacts with the DOM. All the heavy lifting should be done at the container level, within library code, or within actions, handlers, or data functions themselves.

#### handlers

In order to assist presentational components in remaining strictly presentational, handlers should be imported in from the handlers file, bound to the container, and serve the purpose of calling other functions at the container level. Here's an imaginary example:

We may imagine a handler imported by ApplicationContainer.js called `clickHandler` that looks like this:

```javascript
export function clickHandler(evt) {
  evt.preventDefault();
  this.doSomethingAfterClick();
}
```

The `doSomethingAfterClick` function would be defined on the ApplicationContainer component and then, when the ApplicationContainer renders the Application component, it would pass the handler down like this:

```javascript
doSomethingAfterClick() {
  ...
}

render() {
  return (
    <Application
      clickHandler={clickHandler.bind(this)}
    />
  )
}
```

This way, wherever in the presentational nesting the handler actually gets called, we will have a predictable place to know where it gets dealt with – at the container level. At the same time, we keep our presentational components clean from spaghetti.

In Einlandr's case, all of the handlers are automatically bound to the container for you via the call to `bindHandlers` that you see in the AppContainer's `render` method.

#### data

Like handlers, data files should export functions that serve the purpose of accessing your application's API. When you use Yarn to add a new React layer, a data file will be generated that automatically imports both axios and Brightsocket.io to help you with your API calls.

#### actions & constants

Actions are somewhat like data files and handler files except they serve the purpose of triggering redux actions. When these functions are imported into the container, you should use react-redux's `bindActionCreators` to hook them up to redux. You will notice that in AppContainer.js, they are all collected into a package called "actions" that becomes a single prop you can pass down.

Einlandr helps you out with your potentially long list of redux action names by allowing you to group action names by container and defining them as re-usable constants. These constants are defined in frontend/src/js/lib/constants.js. If you look at this file you will see that AppContainer-related constants live in a collection called `APP`. For each container you can create a list of constants that becomes an object with matching keys and values when you call `objectize` on it. This will allow you to define your constants in an array but access them from an object. For example:

```javascript
// In constants.js...
export const FOO = objectize(['BAR', 'BAZ', 'QUUX']);

// In actions/fooActions.js...
import { FOO } from '../lib/constants';

export function bar(payload) {
  return {
    type: FOO.BAR,
    payload: payload
  }
}
```

#### reducers & initial state

In the reducers directory you should make a reducer file for each container and compose that into the collection of reducers found in frontend/src/js/reducers/reducers.js (normally best handled by using yarn to generate a new React layer).

You can see a great example of a container-specific reducer file in frontend/src/js/reducers/appReducers.js. This reducer imports our initial state and makes sure that if no state is available when the reducer is called, the initial state will be used. It also imports our re-usable constants to help us be confident that the action types we listen for here match the action types specified in the actions file.

The initial state is found in frontend/src/js/state/initialstate.js. Each container should have its own entry in the initial state so that reducers have a confined place to work and we have an easy collection of values that we can map to props within a container.

#### localstorage persistence

Notice that initialstate.js imports a function called `retrieveState`. This function tries to retrieve a stored copy of the state from `localStorage` and subsequently `hydrateInitialState` uses that to automatically populate our initial state with any stored values that may exist as soon as the app fires up.

To go along with that, in frontend/src/js/state/store.js, there is a subscription set up on all state changes that saves the state to `localStorage`. For a little extra security, this function will not store any values where the key matches `/password/`. This way, if you are storing things like form inputs, you won't accidentally capture a password in localStorage. Be on the lookout for stuff like that!

#### redux middleware

Writing redux middleware always seems to feel weirdly convoluted. As such, Einlandr provides an easy way to throw together some nice middleware.

In frontend/src/js/state/store.js, you'll see an example that calls the function `createBasicMiddleware`. That function takes a copy of the state and the `next` function. Like any normal middleware, you'll call `next` to move on to the next function. You can call `createBasicMiddleware` as many times you want and pass all those executions in to `applyMiddleware` as arguments.

You may also notice a function call in this file called `devToolsCompose`. This function calls redux's `compose` function but adds in the redux devtools extension if it exists in the browser environment. This way your redux dev tools will be enabled if you have them but you won't get errors if you don't.

## Adding a new React layer

As you have probably guessed, Einlandr is prepared to help you create apps that go from very small to very large. Because there is a lot of structure involved, adding a new layer is a pretty involved process. You need to create a container, a presentational component, an actions file, a handlers file, a data file, a reducer, and an scss file. You also have to add in new constants, a new entry into the state, a new entry into reducers.js, and a new entry into index.scss.

That's a lot. So let yarn do it for you.

You may have noticed as you've explored the files that some of them have strange comments in them that look like this: `/* INJECT POINT 1 */`. These comments are there to help Einlandr add new entries to these files so that you don't have to.

Let's say you wanted to make a new layer called "foo". In that case, you would run `$ yarn layer foo`. Doing so will create all the following files:

- frontend/src/js/containers/FooContainer.js
- frontend/src/js/components/Foo.js
- frontend/src/js/actions/fooActions.js
- frontend/src/js/data/fooData.js
- frontend/src/js/handlers/fooHandlers.js
- frontend/src/js/reducers/fooReducers.js
- frontend/src/scss/\_foo.scss

It will also create the proper entries for you in the following files:

- frontend/src/js/lib/constants.js (creating an export called `FOO`)
- frontend/src/js/state/initialstate.js (creating an object `state.foo`)
- frontend/src/js/reducers/reducers.js (importing and composing in your new reducer file)
- frontend/src/scss/index.scss (importing in your new scss file)

And with all that done, you can be on your merry way.

Another option you have, as opposed to adding a full layer of files, is to quickly generate a single new component. You can do this via the command `$ yarn component <name>`. For example, if you wanted to generate a new component called "Foo", you would run `$ yarn component foo`. This will generate a file called "Foo.js" for you in the components directory.

## About auto refreshing

One thing to keep in mind is that Einlandr sets up file watchers all over the place. Any time a source file changes within the frontend directory, the front end will re-build itself automatically.

There are also watchers set up to track changes to backend files. Changing one of those will trigger a full server refresh so that you don't manually have to restart things.

If you launch the app in dev mode, Einlandr will inject some auto-refresh code into frontend/src/templates/index.html. This way, any time the app rebuilds or the server refreshes, your browser will automatically refresh as well.

## All the yarn commands

Everything you do when working with Einlandr will be executed via Yarn commands. Here is a list of what's available:

- `$ yarn dev` - Launch the app using development variables
- `$ yarn prod` - Launch the app using production variables
- `$ yarn dev:migrate` - Clean and seed the development database
- `$ yarn prod:migrate` - Clean and seed the production database
- `$ yarn layer <name>` - Generate a new layer to the React app (see [Adding a new React Layer](#adding-a-new-react-layer))
- `$ yarn component <name>` - Generate a single React component.
