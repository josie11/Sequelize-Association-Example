'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const chalk = require('chalk');
const util = require('util');
const app = express();
const db = require('./models');
const User = db.user;
const Product = db.product;
const Order = db.order;
const ProductOrder = db['product_order'];

//parses request body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(function (req, res, next) {
  util.log(('---NEW REQUEST---'));
  console.log(util.format(chalk.red('%s: %s %s'), 'REQUEST ', req.method, req.path));
  console.log(util.format(chalk.yellow('%s: %s'), 'QUERY   ', util.inspect(req.query)));
  console.log(util.format(chalk.cyan('%s: %s'), 'BODY    ', util.inspect(req.body)));
  next();
});

function handleResponse(res) {
  return function(data) {
    console.log(data);
    res.send(data);
  };
}

function handleError(res) {
  return function(error) {
    console.log(error);
    res.send(error);
  };
}

/* routes */

//user routes

//create new order for user
app.post('/user/:id/order', function(req, res) {
  return Order.create({ userId: req.params.id })
    .then(handleResponse(res), handleError(res));
});

app.get('/user/:id', function(req, res) {
  return User.findOne({ where: { id: req.params.id }, include: [{ model: Order, include: ['product'] }] })
    .then(handleResponse(res), handleError(res));
});

//user
app.route('/user')
  .get(function(req, res) {
    return User.findAll({ include: [{ model: Order, include: ['product'] }] })
      .then(handleResponse(res), handleError(res));
  })
  .post(function(req, res) {
    return User.create({ firstName: req.body.firstName, lastName: req.body.lastName })
      .then(handleResponse(res), handleError(res));
  });

  app.get('/product/:id', function(req, res) {
    return Product.findOne({ where: { id: req.params.id }, include: [ 'order' ]})
      .then(handleResponse(res), handleError(res));
  });

  app.route('/product')
    .get(function(req, res) {
      return Product.findAll({ include: [ 'order' ]})
        .then(handleResponse(res), handleError(res));
    })
    .post(function(req, res) {
      return Product.create(req.body)
        .then(handleResponse(res), handleError(res));
    });

//deal with a specific product in order
app.route('/order/:orderId/product/:productId')
  .get(function(req, res) {
    return Order.findOne({ where: { id: req.params.orderId }, include: ['user', 'product'] })
      .then(handleResponse(res), handleError(res));
  })
  .post(function(req, res) {
    return Order.findOne({ where: { id: req.params.orderId } })
      .then(function(order) {
        //associate the product with the order and pass other options via the through
        return order.addProduct(req.params.productId, { through: { quantity: req.body.quantity }});
      })
      .then(handleResponse(res), handleError(res));

    /*

    **can also create with ProductOrder table

    return ProductOrder.create({ orderId: req.params.orderId, productId: req.params.productId, quantity: req.body.quantity })
      .then(handleResponse(res), handleError(res));

    */
  })
  .put(function(req, res) {
    return ProductOrder.findOne({ where: { orderId: req.params.orderId, productId: req.params.productId } })
      .then(function(productOrder) {
        return productOrder.update(req.body);
      })
      .then(handleResponse(res), handleError(res));
  })
  .delete(function(req, res) {
    return Order.findOne({ where: { id: req.params.orderId } })
      .then(function(order) {
        return order.removeProduct(req.params.productId);
      })
      .then(handleResponse(res), handleError(res));

    /*
      **can also delete via ProductOrder table

    return ProductOrder.destroy({where: { orderId: req.params.orderId, productId: req.params.productId } })
      .then(handleResponse(res), handleError(res));

    */

  });

//deal with order as a whole
app.route('/order/:id')
  .get(function(req, res) {
    return Order.findOne({ where: { id: req.params.id }, include: ['user', 'product'] })
      .then(handleResponse(res), handleError(res));
  })
  .put(function(req, res) {
      return Order.findOne({ where: { id: req.params.id } })
        .then(function(order) {
          return order.addProduct(req.body.productId, { through: { quantity: req.body.quantity }});
        })
        .then(handleResponse(res), handleError(res));
  })
  .delete(function(req, res) {
      return ProductOrder.destroy({ where: { orderId: req.params.id } })
        .then(function() {
          return Order.destroy({ where: { id: req.params.id } });
        })
        .then(handleResponse(res), handleError(res));
  });

app.listen(3000);
