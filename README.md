# Einlandr

Einlandr is a robust bootstrapping environment for React apps running on Node servers with Postgres databases that runs on Yarn.

## Features

On the front end:

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
