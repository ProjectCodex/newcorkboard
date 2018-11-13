'use strict';
module.exports = (sequelize, DataTypes) => {
  var BoardUsers = sequelize.define('BoardUsers', {
    role: DataTypes.STRING
  }, {});
  return BoardUsers;
};