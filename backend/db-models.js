import Sequelize from 'sequelize';

const S = Sequelize;

export default function defineModels(db) {

  const models = {};

  // Example.
  // A user table with email and password is necessary for authentication
  // to work. Feel free to modify any other fields.
  models.User = db.define('user', {
    id:            { type: S.INTEGER, primaryKey: true, autoIncrement: true },
    firstName:     { type: S.STRING,           defaultValue: 'User' },
    lastName:      { type: S.STRING,           defaultValue: 'McUserface' },
    email:         { type: S.STRING,           validate: { notEmpty: true }, unique: true },
    password:      { type: S.STRING(1024),     validate: { notEmpty: true } },
    pwdSalt:       { type: S.ARRAY(S.INTEGER), validate: { notEmpty: true } },
    pwdIterations: { type: S.INTEGER,          validate: { notEmpty: true } }
  });

  // Example.
  // A session table is necessary for authentication to work.
  models.Session = db.define('session', {
    id:        { type: S.STRING(750), primaryKey: true, unique: true, validate: { notEmpty: true } },
    expiresAt: { type: S.DATE(), validate: { notEmpty: true } }
  });

  /******************************
   * Define your models here
   ******************************/

  return models;

}
