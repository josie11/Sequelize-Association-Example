'use strict';
module.exports = function(sequelize, DataTypes) {
  var order = sequelize.define('order', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });

  order.associate = function(models) {
    order.belongsTo(models.user);
    order.belongsToMany(models.product, { through: 'product_order', as: 'product' });
  };

  return order;
};
