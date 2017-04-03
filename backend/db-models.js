import Sequelize from 'sequelize';

const S = Sequelize;

export default function defineModels(db) {

  const models = {};

  /******************************
   * Define your models here
   ******************************/

  models.User = db.define('user', {
    id:           { type: S.INTEGER, primaryKey: true, autoIncrement: true },
    firstName:    { type: S.STRING, defaultValue: 'User' },
    lastName:     { type: S.STRING, defaultValue: 'McUserface' },
    email:        { type: S.STRING, validate: { notEmpty: true }, unique: true },
    password:     { type: S.STRING, validate: { notEmpty: true } }
  });

  return models;

}
