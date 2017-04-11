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

Einlandr creates a number of database API functions for you automatically. For example, for every model you define in the `backend/db-models.js` file, Einlandr will create a `create<ModelName>`, `read<ModelName>`, `readAll<ModelName>`, `update<ModelName>`, `delete<ModelName>`, and `deleteAll<ModelName>`. It also comes with an `authUser` method for retrieving a user by email and password.

In describing the automatically generated functions, we'll be using the User's table, even though these methods exist for all tables. For example, we'll describe the `createUser` function but you should know that there is also a `createSession` function that works the exact same way. Here's how it all works:

### `createUser(values)`

Creates a new User record.

- `values` - Object. By default, containing firstName, lastName, email, and password fields.

Returns a promise that resolves with the newly created User record. Password field is removed by default.

### `readUser(primaryKey)`

Retrieves a User record from the database.

- `primaryKey` - Number. The identifier of the record to retrieve.

Returns a promise that resolves with the User record. Password field is removed by default.

### `readAllUser(params)`

Retrieves a collection of User records from the database.

- `params` - Object. Optional. Values passed to Sequelize's `where` property.

If `params` is not provided, will retrieve _all_ records so **be careful**.

Returns a promise that resolves with an array of records where password fields have been removed.

### `updateUser(primaryKey, values)`

Modifies a User record in the database.

- `primaryKey` - Number. The identifier of the record to modify.
- `values` - Object. Containing each field to be updated on the record.

Returns a promise that resolves with the updated record.

### `deleteUser(primaryKey)`

Removes a User record from the database.

- `primaryKey` - Number. The identifier of the record to be removed.

Returns a promise that resolves with a number indicating how many records were removed. If successful, this will be 1.

### `deleteAllUser(params)`

Removes a collection of User records from the database.

- `params` - Object. Optional. Values passed to Sequelize's `where` property.

If `params` is not provided, will remove _all_ records so **be careful**.

Returns a promise that resolves with a number indicating how many records were removed. If successful, this will be 1.

### `authUser(email, password)`

Retrieves a User record by email and password.

- `email` - String. An email associated with the desired record.
- `password` - String. A password associated with the desired record.

Returns a promise that resolves with the user record if found.
