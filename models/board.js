'use strict';
module.exports = (sequelize, DataTypes) => {
  var Board = sequelize.define('Board', {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [4, 100]
      }
    }
  }, {});
  Board.associate = function(models) {
    // associations can be defined here
    Board.hasMany(models.Link, {as: 'links', onDelete: 'CASCADE'});
    Board.hasMany(models.Tag, {as: 'tags', onDelete: 'CASCADE'});
    Board.hasMany(models.Message, {as: 'messages', onDelete: 'CASCADE'});
  };
  return Board;
};