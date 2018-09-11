'use strict';
module.exports = (sequelize, DataTypes) => {
  var Message = sequelize.define('Message', {
    msg: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: {
          max: 500,
        }
      }
    },
    author: {
      type:DataTypes.STRING,
      allowNull: false,
      defaultValue: 'anonymous',
      validate: {
        notEmpty: true,
        len: {
          max: 100
        }
      }
    }
  }, {});
  Message.associate = function(models) {
    // associations can be defined here
    Message.belongsTo(models.Board);
  };
  return Message;
};