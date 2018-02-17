import assert from 'assert';
import { log } from 'gulp-util';
import dbReady from '../../backend/db-init';
import config from '../../config';
import promiser from 'stateful-promise';

const passwordVals = {
  password: [ // Password0!!!
    '80faf27d9f9cf1d549949135e598f60364518464c534865028ec86e7270efd3b8d5739f',
    '5429e9c153d46b02467f7fa1159beaf55dbe9618afac73f8cfb101b07806eff7a509033',
    '2a5a6736fd7dee78255805bedbba9c1c0d666164337975e54605b627cac2838d12df48e',
    'e84c0994ea5a2d3ddde73d6117df0ac5b746600814114ea39501f61da691a342026e436',
    '809a3120ca0d8d0591a42df17535dc0b93ca5dc75dbab542eaf3d319b5c92c5d6414495',
    '770c10f60895cd2b49678d6796b845e14b3de05f0a5dc34e290d231aac1781b13f6ed53',
    '6239e2a108cef7d077b716ff89d0ad2b6509e9c947529c57b03060fc3a6dc398a70f036',
    '28aab5dbba24540dd88bb9afa185dbc1620938b314504f570012e2b665a59ad53a444f3',
    '5591ca55d30c0a5db4538c3ce2fe9cbce0c468bba1610043f194eead9af6076fe62d04b',
    'c002a0d3c7ed05280000180f310c307f3e3ed0ee2202e0f1a4ce76cc4d20b3ca4ce26a1',
    'ef42ed33f617b6d2899229d1e3c023c7d886d31766d3605d22b186d36ac7fd696a2c037',
    '336eb8b81da5f7b1cec2491c5b6736a549a3cb809c4d8ef0c1cef0412c5977477c8ad68',
    '256d086fa19b63ab4992bef83b0818c7c2af5f649162fb9c227e9d9a963cc4c76f44e20',
    'f0163b8fa43979861ab139e4c782f3b421c16dffcbf42ed1f419d9f8c5cdf088e506728',
    'f0d09945967a10bac9e155e60df249'
  ].join(''),
  pwdSalt: [ 203, 70, 171, 204, 188, 88, 218, 254, 168, 59, 72, 86, 242, 96, 4, 160 ],
  pwdIterations: 100000
}

const origSuppression = config.backend.sessionSuppression;

describe('Database', function () {

  describe('Availability', function () {

    it('should connect', function () {
      dbReady(() => assert.ok(true));
    });

    it('should be handed the db', function (done) {
      dbReady(db => {
        assert.ok(db);
        done();
      });
    });

  });

  describe('Session Handling', function () {
    let createdUserId;
    let createdSessionId;
    let createdSessionExpires;

    it('should create a session', function (done) {
      dbReady(({ Users, Sessions }) => {

        Users.saveCreate(Object.assign({}, {
          firstName: 'Test',
          lastName: 'User',
          email: 'testuser@testuser.com'
        }, passwordVals))
        .then(user => {
          createdUserId = user.id;
          config.backend.sessionSuppression = 0;

          Sessions.start(user).then(session => {
            createdSessionId = session.id;
            createdSessionExpires = session.expiresAt;
            config.backend.sessionSuppression = origSuppression;
            assert.ok(session.id);
            assert.ok(session.expiresAt);
            user.destroy().then(() => {
              done();
            });
          });
        });

      });
    });

    it('should validate/update a session', function (done) {
      dbReady(({ Sessions }) => {
        Sessions.validate(createdSessionId).then(session => {
          assert.equal(session.id, createdSessionId);
          assert.notEqual(session.expiresAt, createdSessionExpires);
          session.destroy().then(() => {
            done();
          });
        });

      });
    });

    it('should delete an invalid session', function (done) {
      dbReady(({ Sessions, Users }) => {

        Users.saveCreate(Object.assign({}, {
          firstName: 'Test',
          lastName: 'User',
          email: 'testuser@testuser.com'
        }, passwordVals)).then(user => {
          createdUserId = user.id;
          config.backend.sessionSuppression = 0;

          Sessions.start(user).then(session => {
            const now = new Date();
            now.setHours(now.getHours() - 1000);
            createdSessionId = session.id;
            createdSessionExpires = session.expiresAt;
            config.backend.sessionSuppression = origSuppression;
            session.expiresAt = now;

            session.save().then(updated => {
              Sessions.validate(session.id).catch(() => {
                Users.destroy(createdUserId).then(() => {
                  Sessions.get(session.id).then(nothing => {
                    assert.equal(nothing.isNull(), true);
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
      dbReady(({ Sessions, Users }) => {
        const now = new Date();

        // We'll use this date to artificially expire some sessions
        now.setHours(now.getHours() - 1000);
        config.backend.sessionSuppression = 0;

        promiser()

        // Create 3 users as userList
        .then(state => {
          const userList = [];
          return state.set('userList', promiser.recur((next, resolve, reject) => {
            Users.saveCreate(Object.assign({}, {
              firstName: 'Test',
              lastName: 'User',
              email: Math.random() + '@testuser.com'
            }, passwordVals))
            .then(user => {
              userList.push(user);
              userList.length === 3 ? resolve(userList) : next();
            })
            .catch(err => reject(err));
          }))
        })

        // Create a session per user (3 sessions) as sessionList
        .then(state => {
          const sessionList = [];
          return state.set('sessionList', promiser.recur((next, resolve, reject) => {
            Sessions.start(state.userList[sessionList.length]).then(session => {
              sessionList.push(session);
              sessionList.length === 3 ? resolve(sessionList) : next();
            })
            .catch(err => reject(err));
          }))
        })

        // Expire all 3 sessions
        .then(state => {
          return state.map('sessionList', session => {
            session.expiresAt = now;
            return session.save();
          })
        })

        // Add a 4th user
        .then(state => {
          config.backend.sessionSuppression = 2;
          return state.setTo(state.userList, 3, Users.saveCreate(Object.assign({}, {
            firstName: 'Test',
            lastName: 'User',
            email: Math.random() + '@testuser.com'
          }, passwordVals)))
        })

        // Add a 4th session. The idea is that this should remove
        // 2 of our pre-created sessions from the db automatically.
        .then(state => {
          return state.setTo(state.sessionList, 3, Sessions.start(state.userList[3]))
        })

        // Read in all sessions that expired at the date we previously set.
        // Suppression is async so give it a second to complete
        .then(state => {
          return new Promise(resolve => {
            setTimeout(() => {
              const prom = state.set('expiredSessions', Sessions.getMany({ expiresAt: now }));
              resolve(prom);
            }, 1000);
          })
        })

        // Execute our assertion.
        .then(state => {
          // 2 of our 3 expired sessions should have been deleted
          assert.equal(state.expiredSessions.length, 1);
          config.backend.sessionSuppression = origSuppression;
        })

        // Cleanup users
        .then(state => {
          return state.forEach('userList', user => {
            return user.destroy();
          })
        })

        // Cleanup sessions
        .then(state => {
          return state.forEach('sessionList', session => {
            return session.destroy();
          })
        })

        .then(() => done());

      }); // dbready
    }); // it should


  });

  /***************************************
   * Describe more tests here
   ***************************************/

  after(function () {
    dbReady(db => db.getSQConnection().close());
  });

});
