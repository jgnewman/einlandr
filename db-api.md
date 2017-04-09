# Database API

This file documents the provided functions that assist you in accessing your database.

## Accessing the database API

To access the database API, you'll need to establish a connection to the database. By default, a connection is established for you and the API is provided to you for use within `http-api-v1.js` and `socket-api-v1.js`.

If you need to establish a connection elsewhere, import the `dbReady` function from `backend/db-init.js`. Call it like this:

```javascript
import dbReady from 'path/to/backend/db-init';

dbReady((db, models, api) => { ... });
```

When calling `dbReady`, you'll get access to the database instance itself, all of your defined models, and, of course, the database API, which is what this file is concerned with documenting.

## Extending the database API

What Einlandr provides for you is just a bootstrapping environment. You'll eventually want to write many of your own database queries. To help you do that, Einlandr uses Sequelize as an ORM and provides a space for you to define these queries inside `backend/db-api.js`. Within that file, locate the area labeled...

```javascript
/***********************************
 * Define the rest of your API here
 ***********************************/
```

...and follow the pattern of the `authUser` query written below that. One convenience function that has been provided for you to use in handling Sequelize's inconsistent result data types is the `simplify` function you'll notice is used within the `authUser` function. This function returns a promise and is used to take basic values, arrays, basic objects, Sequelize Instances, arrays of Instances, etc, and break them down into basic objects and values.

## What's in the box

Einlandr creates a number of database API functions for you automatically. For example, for every model you define in the `backend/db-models.js` file, Einlandr will create a `create<ModelName>`, `read<ModelName>`, `readAll<ModelName>`, `update<ModelName>`, `delete<ModelName>`, and `deleteAll<ModelName>`.
