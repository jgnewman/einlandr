import assert from 'assert';
import { log } from 'gulp-util';
import dbReady from '../../backend/db-init';
import config from '../../config';
import { generateSession, validateSession } from '../../backend/server-auth';

const origSuppression = config.backend.sessionSuppression;

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

  describe('Session Handling', function () {
    let createdUserId;
    let createdSessionId;
    let createdSessionExpires;

    it('should create a session', function (done) {
      dbReady(queries => {

        queries.createUser({
          firstName: 'Test',
          lastName: 'User',
          email: 'testuser@testuser.com',
          password: 'password'
        })
        .then(user => {
          createdUserId = user.id;
          config.backend.sessionSuppression = 0;
          generateSession(
            user,
            queries.createSession,
            queries.suppressSession
          ).then(session => {
            createdSessionId = session.id;
            createdSessionExpires = session.expiresAt;
            config.backend.sessionSuppression = origSuppression;
            assert.ok(session.id);
            assert.ok(session.expiresAt);
            queries.deleteUser(createdUserId).then(() => {
              done();
            });
          });
        });

      });
    });

    it('should validate/update a session', function (done) {
      dbReady(queries => {

        validateSession(
          createdSessionId,
          queries.readSession,
          queries.updateSession,
          queries.deleteSession
        ).then(session => {
          assert.equal(session.id, createdSessionId);
          assert.notEqual(session.expiresAt, createdSessionExpires);
          queries.deleteSession(createdSessionId).then(() => {
            done();
          });
        });

      });
    });

    it('should delete an invalid session', function (done) {
      dbReady(queries => {

        queries.createUser({
          firstName: 'Test',
          lastName: 'User',
          email: 'testuser@testuser.com',
          password: 'password'
        }).then(user => {
          createdUserId = user.id;
          config.backend.sessionSuppression = 0;
          generateSession(
            user,
            queries.createSession,
            queries.suppressSession
          ).then(session => {
            const now = new Date();
            now.setHours(now.getHours() - 1000);
            createdSessionId = session.id;
            createdSessionExpires = session.expiresAt;
            config.backend.sessionSuppression = origSuppression;
            queries.updateSession(session.id, { expiresAt: now }).then(updated => {
              validateSession(
                session.id,
                queries.readSession,
                queries.updateSession,
                queries.deleteSession
              ).catch(() => {
                queries.deleteUser(createdUserId).then(() => {
                  queries.readSession(session.id).then(nothing => {
                    assert.equal(nothing, null);
                    done();
                  });
                });
              });
            });
          });
        });

      });
    });

    it('should suppress dead sessions', function (done) {
      dbReady(queries => {
        const userList = [];
        const sessionList = [];
        const now = new Date();

        // We'll use this date to artificially expire some sessions
        now.setHours(now.getHours() - 1000);
        config.backend.sessionSuppression = 0;

        // Make and track 3 users
        function makeUsers(callback) {
          queries.createUser({
            firstName: 'Test',
            lastName: 'User',
            email: Math.random() + '@testuser.com',
            password: 'password'
          }).then(user => {
            userList.push(user);
            if (userList.length < 3) {
              makeUsers(callback);
            } else {
              callback();
            }
          });
        }

        // Make and track 3 sessions
        function makeSessions(callback) {
          userList.forEach(user => {
            generateSession(
              user,
              queries.createSession,
              queries.suppressSession
            ).then(session => {
              sessionList.push(session);
              if (sessionList.length === userList.length) {
                callback();
              }
            });
          });
        }

        // Artificially expire all 3 sessions
        function updateSessions(callback) {
          let finished = 0;
          sessionList.forEach(session => {
            queries.updateSession(session.id, { expiresAt: now }).then(() => {
              finished ++;
              if (finished === sessionList.length) {
                callback();
              }
            });
          });
        }

        // Delete all the users we've made in this test
        function deleteUsers(callback) {
          let finished = 0;
          userList.forEach(user => {
            queries.deleteUser(user.id).then(() => {
              finished ++;
              if (finished === userList.length) {
                callback();
              }
            });
          });
        }

        // Delete all the sessions we've made in this test
        function deleteSessions(callback) {
          let finished = 0;
          sessionList.forEach(session => {
            queries.deleteSession(session.id).then(() => {
              finished ++;
              if (finished === sessionList.length) {
                callback();
              }
            });
          });
        }

        makeUsers(() => {
          makeSessions(() => {
            updateSessions(() => {
              // Make sure we expect 2 of 3 dead sessions to be removed
              config.backend.sessionSuppression = 2;

              // Create a 4th user and a related session
              queries.createUser({
                firstName: 'Test',
                lastName: 'User',
                email: Math.random() + '@testuser.com',
                password: 'password'
              }).then(user => {
                userList.push(user);
                generateSession(
                  user,
                  queries.createSession,
                  queries.suppressSession
                ).then(session => {
                  sessionList.push(session);

                  // If 2 sessions expired, there should be 1 left over with the
                  // correct expiresAt field
                  queries.readAllSession({ expiresAt: now}).then(stillThere => {
                    assert.equal(stillThere.length, 1);

                    // Clean up
                    config.backend.sessionSuppression = origSuppression;
                    deleteUsers(() => {
                      deleteSessions(() => {
                       done();
                      });
                    });
                  });
                });
              });


            });
          });
        });

      });
    });

  });

  /***************************************
   * Describe more tests here
   ***************************************/

});
