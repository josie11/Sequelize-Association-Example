'use strict';
module.exports = function(sequelize, DataTypes) {
  var user = sequelize.define('user', {
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING
  });

  user.associate = function(models) {
    user.hasMany(models.order);
  };
  return user;
};
