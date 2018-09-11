'use strict';
module.exports = (sequelize, DataTypes) => {
  var Link = sequelize.define('Link', {
    image_url: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
      validate: {
        max: 255
      }
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true,
        notEmpty: true,
        max: 255
      }
    },
    description: {
      type: DataTypes.TEXT,
      validate: {
        max: 500
      }
    },
    title: {
      type: DataTypes.STRING,
      validate: {
        max: 255
      }
    }
  }, {});
  Link.associate = function(models) {
    // associations can be defined here
    Link.belongsTo(models.Board);
    Link.belongsToMany(models.Tag, {through: 'linkTags'});
  };
  return Link;
};