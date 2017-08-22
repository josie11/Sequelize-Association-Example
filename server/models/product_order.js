'use strict';
module.exports = function(sequelize, DataTypes) {
  var product_order = sequelize.define('product_order', {
    orderId: DataTypes.INTEGER,
    productId: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
  });

  return product_order;
};
