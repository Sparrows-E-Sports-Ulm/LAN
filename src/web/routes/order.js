const express = require('express');
const router = express.Router();
const menu = require('../models/vabene.json');
const validate = require('jsonschema').validate;
const submitSchema = require('../models/order-submit-schema.json');
const asyncRoute = require('../util/async-wrapper');
const paymentService = require('../services/payment-service');
const BasketModel = require('../models/basket-model');
const config = require('../util/config');


router.get('/', asyncRoute(async (req, res, next) => {
    const basket = await BasketModel.findById(req.session.basket)
    const items = basket ? basket.items : [];

    if(config.ordersLocked) {
      res.render('order/locked', {hasBasket: !!basket});
      return;
    }

    if (basket && basket.payed) {
      res.redirect('/order/status');
      return;
    }

    res.render('order/order', { menu: menu, basket: items });
}));

router.post('/submit', asyncRoute(async (req, res, next) => {
  if(config.ordersLocked) {
    res.status(400).send('Die Bestellungen sind gesperrt.');
    return;
  }

  let basket = await BasketModel.findById(req.session.basket);
  if (!basket) {
    basket = new BasketModel();
  }

  // Redirect to status page if already payed
  if (basket.payed) {
    res.redirect('/order/status');
    return;
  }

  // Reject if the request does not conform to schema
  if (!validate(req.body, submitSchema, { required: true }).valid) {
    console.log(req.body);
    res.status(400).send('Bad Request');
    return;
  }

  // Check if request only contains valid items
  var total = 0.0;
  for (const item of req.body.basket) {
    if (menu.categories[item.category] === undefined || menu.categories[item.category].dishes[item.dish] === undefined) {
      res.status(400).send('Bad Request (Unknown Menu Item)');
      return;
    }

    total += menu.categories[item.category].dishes[item.dish].price;
  }

  // Update Basket
  const extendedBasket = req.body.basket.map(v => ({
    categoryId: v.category,
    dishId: v.dish,
    category: menu.categories[v.category].name,
    dish: menu.categories[v.category].dishes[v.dish].name,
    price: menu.categories[v.category].dishes[v.dish].price
  }));

  basket.name = req.body.name;
  basket.items = extendedBasket;
  basket.payed = false;
  basket.code = paymentService.createCode();
  basket.total = total;
  await basket.save();

  // Links Basket to Session 
  req.session.basket = basket._id;

  res.status(200).send();
}));

router.get('/status', asyncRoute(async (req, res, next) => {
  // Get Basket
  const basket = await BasketModel.findById(req.session.basket);

  if (!basket || basket.length === 0) {
    res.redirect('/order');
    return;
  }

  res.render('order/status', { basket: basket, account: process.env.PAYPAL_ACC });
}));

module.exports = router;
