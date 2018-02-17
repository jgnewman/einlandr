import { log, colors } from 'gulp-util';
import jwt from 'jsonwebtoken';
import { verifyPassword } from './password-tools';
import config from '../config';

// Each model is set up with static get, getOne, getMany, create, saveCreate,
// update, updateMany, destroy, destroyMany, and count methods. You can
// add additional methods by calling augment on the model.
export default function defineInterface(db) {
  const { Users, Sessions } = db;

  /*******************************************
   * Augment your models here
   *******************************************/

  /*
   * Example:
   * db.Users.augment({
   *   getAdults() {
   *     return db.Users.getMany({ age: { $gte: 18 }})
   *   }
   * })
   */

  /*******************************************
   * The following augmentations are needed
   * for built-in authentication.
   *******************************************/

  Users.augment({

    authenticate: async(email, password) => {

      let user = await Users.getOne({ email: email });
      if (!user) throw 401;

      const authenticated = await verifyPassword(
        password,
        user.password,
        Buffer(user.pwdSalt),
        user.pwdIterations,
        500
      )

      if (!authenticated) throw 401;
      return user;
    }

  });

  Sessions.augment({

    start: async(user) => {
      try {
        const suppression = config.backend.sessionSuppression;
        const expiration = config.backend.sessionExpiry;
        const expirationDate = new Date();
        expirationDate.setHours(expirationDate.getHours() + expiration);

        const token = jwt.sign(
          { data: user.createReduction('id', 'email').raw() },
          config.backend.dbSecret,
          { expiresIn: 60 * 60 * 24 * 365 * 100 } // 100 years-ish; we don't want to expire this way
        );

        const session = await Sessions.saveCreate({ id: token, expiresAt: expirationDate });

        // Remove some amount of sessions for every new session we create.
        // Don't let it slow us down from resolving if the creation was successful.
        suppression && Sessions.suppress(suppression);
        return session;
      } catch (err) {
        throw 500;
      }
    },

    suppress: async(limit = 2) => {
      const now = new Date();
      const destroyed = await Sessions.destroyMany({ expiresAt: { $lt: now }}, limit);
      return destroyed;
    },

    reset: async(token) => {
      try{
        const expiration = config.backend.sessionExpiry;
        const expirationDate = new Date();
        expirationDate.setHours(expirationDate.getHours() + expiration);

        const updated = await Sessions.update(token, {
          updatedAt: null,
          expiresAt: expirationDate // Restart the countdown to expiration
        });

        return updated;
      } catch(_) {
        throw 500;
      }
    },

    validate: async(token) => {
      try {
        const session = await Sessions.get(token);
        if (!session) throw 404;

        const expiresAt = new Date(session.expiresAt);
        const now = new Date();

        // Session has expired if the current time is later than the
        // expiration time.
        if (now >= expiresAt) {
          await session.destroy();
          throw 401;
        }

        return new Promise((resolve, reject) => {
          jwt.verify(session.id, config.backend.dbSecret, async(err) => {
            try {

              if (err) {
                await session.destroy();
                return reject(err);
              }

              const updatedSession = await db.Sessions.reset(session.id);
              return resolve(updatedSession);

            } catch (_) {
              throw 500;
            }
          });
        });

      } catch (err) {
        if (typeof err === 'number') {
          throw err;
        } else {
          throw 500;
        }
      }
    }

  });

  return db;
}
