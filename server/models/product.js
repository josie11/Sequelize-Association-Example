'use strict';
module.exports = function(sequelize, DataTypes) {
  var product = sequelize.define('product', {
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
  });

  product.associate = function(models) {
    product.belongsToMany(models.order, { through: 'product_order', as: 'order' });
  };

  return product;
};
