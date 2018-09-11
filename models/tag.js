'use strict';
module.exports = (sequelize, DataTypes) => {
  var Tag = sequelize.define('Tag', {
    name: {
      type: DataTypes.STRING,
      unique: false,
      allowNull: false,
      validate: {
        len: [3, 40]
      }
    }
  }, {});
  Tag.associate = function(models) {
    // associations can be defined here
    Tag.belongsTo(models.Board);
    Tag.belongsToMany(models.Link,{through: 'linkTags'});
  };
  return Tag;
};