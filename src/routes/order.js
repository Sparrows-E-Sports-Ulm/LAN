const express = require('express');
const router = express.Router();
const menu = require('../models/vabene.json');
const validate = require('jsonschema').validate;
const submitSchema = require('../models/order-submit-schema.json');

router.get('/', function(req, res, next) {
  const basket = req.session.basket ?? [];
  const friendlyBasket = basket.map(v => ({
    dishIndex: v.dish,
    catIndex: v.category,
    category: menu.categories[v.category].name,
    dish: menu.categories[v.category].dishes[v.dish].name,
    price: menu.categories[v.category].dishes[v.dish].price
  }));

  res.render('order/order', {menu: menu, basket: friendlyBasket});
});

router.post('/submit', function(req, res, next) {
  if(!validate(req.body, submitSchema, {required: true}).valid) {
    console.log(req.body);
    res.status(400).send('Bad Request');
    return;
  }

  for(const item of req.body.basket) {
    if(menu.categories[item.category] === undefined || menu.categories[item.category].dishes[item.dish] === undefined) {
      res.status(400).send('Bad Request (Unknown Menu Item)');
      return;
    }
  }

  req.session.basket = req.body.basket;
  req.session.name = req.body.name;

  res.status(200).send();
});

router.get('/status', function(req, res, next) {
  const basket = req.session.basket;
  if(basket === undefined || basket.length === 0) {
    res.redirect('/order');
    return;
  }
  
  const friendlyBasket = basket.map(v => ({
    name: menu.categories[v.category].dishes[v.dish].name,
    price: menu.categories[v.category].dishes[v.dish].price
  }));

  const total = friendlyBasket.reduce((acc, curr) => acc + curr.price, 0);

  res.render('order/status', {total: total, reason: 'UL-LOL-TEST', account: process.env.PAYPAL_ACC, basket: friendlyBasket});
});

module.exports = router;
