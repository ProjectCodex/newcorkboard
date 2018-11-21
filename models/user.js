'use strict';
module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define('User', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    email: DataTypes.STRING,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING
  }, {});
  User.associate = function(models) {
    // associations can be defined here
    User.belongsToMany(models.Board, {through: models.BoardUsers});
    User.hasMany(models.Link);
    User.hasMany(models.Tag);
    User.hasMany(models.Message);
  };
  return User;
};