# Database Queries

This file documents the provided functions that assist you in accessing your database.

## Accessing the database queries

To access the database queries, you'll need to establish a connection to the database. By default, a connection is established for you and the queries are provided to you for use within `http-api-v1.js` and `socket-api-v1.js`.

If you need to establish a connection elsewhere, import the `dbReady` function from `backend/db-init.js`. Call it like this:

```javascript
import dbReady from 'path/to/backend/db-init';

dbReady((queries, models, db) => { ... });
```

When calling `dbReady`, you'll get access to all the database queries as well as all of your defined models and the database instance itself. This file is concerned with documenting just the queries.

## Extending database queries

What Einlandr provides for you is just a bootstrapping environment. You'll eventually want to write many of your own database queries. To help you do that, Einlandr uses Sequelize as an ORM and provides a space for you to define these queries inside `backend/db-queries.js`. Within that file, locate the area labeled...

```javascript
/****************************************
 * Define the rest of your queries here
 ****************************************/
```

...and follow the pattern of the `authUser` query written below that. One convenience function that has been provided for you to use in handling Sequelize's inconsistent result data types is the `simplify` function you'll notice is used within the `authUser` function. This function returns a promise and is used to take basic values, arrays, basic objects, Sequelize Instances, arrays of Instances, etc, and break them down into basic objects and values.

## What's in the box

Einlandr creates a number of database query functions for you automatically. For example, for every model you define in the `backend/db-models.js` file, Einlandr will create a `create<ModelName>`, `read<ModelName>`, `readAll<ModelName>`, `update<ModelName>`, `delete<ModelName>`, and `deleteAll<ModelName>`. It also comes with an `authUser` method for retrieving a user by email and password.

In describing the automatically generated functions, we'll be using the User's table, even though these methods exist for all tables. For example, we'll describe the `createUser` function but you should know that there is also a `createSession` function that works the exact same way. Here's how it all works:

### `createUser(values [, res])`

Creates a new User record.

- `values` - Object. By default, containing firstName, lastName, email, and password fields.
- `res` - Optional Response Object. If provided, the query will automatically return a 500 in the result of a server error.

Returns a promise that resolves with the newly created User record. Password field is removed by default.

### `readUser(primaryKey [, res])`

Retrieves a User record from the database.

- `primaryKey` - Number. The identifier of the record to retrieve.
- `res` - Optional Response Object. If provided, the query will automatically return a 500 in the result of a server error.

Returns a promise that resolves with the User record. Password field is removed by default.

### `readAllUser(params [, res])`

Retrieves a collection of User records from the database.

- `params` - Optional Object.. Values passed to Sequelize's `where` property.
- `res` - Optional Response Object. If provided, the query will automatically return a 500 in the result of a server error.

If `params` is not provided, will retrieve _all_ records so **be careful**.

Returns a promise that resolves with an array of records where password fields have been removed.

### `updateUser(primaryKey, values [, res])`

Modifies a User record in the database.

- `primaryKey` - Number. The identifier of the record to modify.
- `values` - Object. Containing each field to be updated on the record.
- `res` - Optional Response Object. If provided, the query will automatically return a 500 in the result of a server error.

Returns a promise that resolves with the updated record.

### `deleteUser(primaryKey [, res])`

Removes a User record from the database.

- `primaryKey` - Number. The identifier of the record to be removed.
- `res` - Optional Response Object. If provided, the query will automatically return a 500 in the result of a server error.

Returns a promise that resolves with a number indicating how many records were removed. If successful, this will be 1.

### `deleteAllUser(params [, res])`

Removes a collection of User records from the database.

- `params` - Object. Optional. Values passed to Sequelize's `where` property.
- `res` - Optional Response Object. If provided, the query will automatically return a 500 in the result of a server error.

If `params` is not provided, will remove _all_ records so **be careful**.

Returns a promise that resolves with a number indicating how many records were removed. If successful, this will be 1.

### `authUser(email, password)`

Retrieves a User record by email and password.

- `email` - String. An email associated with the desired record.
- `password` - String. A password associated with the desired record.

Returns a promise that resolves with the user record if found.
