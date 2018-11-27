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
    }
  }, {});
  Message.associate = function (models) {
    // associations can be defined here
    Message.belongsTo(models.Board);
    Message.belongsTo(models.User);
  };
  return Message;
};