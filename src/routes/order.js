const express = require('express');
const router = express.Router();
const menu = require('../models/vabene.json');
const validate = require('jsonschema').validate;
const submitSchema = require('../models/order-submit-schema.json');

const BasketModel = require('../models/basketModel');

router.get('/', async function(req, res, next) {
  const basket = await BasketModel.findById(req.session.basket);
  const items = basket ? basket.items : [];

  if(basket && basket.payed) {
    res.redirect('/order/status');
    return;
  }

  const friendlyBasket = items.map(v => ({
    dishIndex: v.dish,
    catIndex: v.category,
    category: menu.categories[v.category].name,
    dish: menu.categories[v.category].dishes[v.dish].name,
    price: menu.categories[v.category].dishes[v.dish].price
  }));

  res.render('order/order', {menu: menu, basket: friendlyBasket});
});

router.post('/submit', async function(req, res, next) {
  let basket = await BasketModel.findById(req.session.basket);
  if(!basket) {
    basket = new BasketModel();
    basket.reason = process.env.PAYPAL_PREFIX;
  }

  if(basket.payed) {
    res.redirect('/order/status');
    return;
  }

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

  basket.name = req.body.name;
  basket.items = req.body.basket;
  basket.payed = false;
  await basket.save();

  req.session.basket = basket._id;

  res.status(200).send();
});

router.get('/status', async function(req, res, next) {
  const basket = await BasketModel.findById(req.session.basket);
  
  if(!basket || basket.length === 0) {
    res.redirect('/order');
    return;
  }
  
  const friendlyBasket = basket.items.map(v => ({
    name: menu.categories[v.category].dishes[v.dish].name,
    price: menu.categories[v.category].dishes[v.dish].price
  }));

  const total = friendlyBasket.reduce((acc, curr) => acc + curr.price, 0);

  res.render('order/status', {total: total, reason: basket.reason, account: process.env.PAYPAL_ACC, basket: friendlyBasket});
});

module.exports = router;
