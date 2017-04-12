import assert from 'assert';
import { log } from 'gulp-util';
import dbReady from '../../backend/db-init';

describe('Database', function () {

  describe('Availability', function () {

    it('should connect', function () {
      dbReady(() => assert.ok(true));
    });

    it('should be handed the correct 3 arguments', function (done) {
      dbReady((queries, models, db) => {
        assert.ok(queries.readUser);
        assert.ok(models.User);
        assert.equal(db.constructor.name, 'Sequelize');
        done();
      });
    });

  });

  describe('CRUD Operations', function () {
    let createdUserId;

    it('should create a record', function (done) {
      dbReady(queries => {
        queries.createUser({
          firstName: 'Test',
          lastName: 'User',
          email: 'testuser@testuser.com',
          password: 'password'
        })
        .then(user => {
          assert.ok(user);
          createdUserId = user.id;
          done();
        });
      });
    });

    it('should read a single record', function (done) {
      dbReady(queries => {
        queries.readUser(createdUserId).then(user => {
          assert.equal(user.id, createdUserId);
          done();
        });
      });
    });

    it('should read many records', function (done) {
      dbReady(queries => {
        queries.readAllUser({ email: 'testuser@testuser.com' }).then(userList => {
          assert.equal(userList.length, 1);
          done();
        });
      });
    });

    it('should remove password field from a read record', function (done) {
      dbReady(queries => {
        queries.readUser(createdUserId).then(user => {
          assert.equal(user.password, undefined);
          done();
        });
      });
    });

    it('should update a record', function (done) {
      dbReady(queries => {
        queries.updateUser(createdUserId, { firstName: 'Updated' }).then(() => {
          queries.readUser(createdUserId).then(user => {
            assert.equal(user.firstName, 'Updated');
            done();
          });
        });
      });
    });

    it('should delete a record', function (done) {
      dbReady(queries => {
        queries.deleteUser(createdUserId).then(amountRemoved => {
          assert.equal(amountRemoved, 1);
          done();
        });
      });
    });

  });

});
