const express = require('express');
const router = express.Router();
const menu = require('../models/vabene.json');
const validate = require('jsonschema').validate;
const submitSchema = require('../models/order-submit-schema.json');
const asyncRoute = require('../util/async-wrapper');

const BasketModel = require('../models/basket-model');

async function jsonFetch(method, url, body) {
  const rawResponse = await fetch(`http://127.0.0.1:${process.env.PAYMENT_SERVICE_PORT}/${url}`, {
    method: method,
    body: JSON.stringify(body),
    headers: {
        'Accept': 'application/json',
        "Content-Type": "application/json"
    }
  });

  return {
    status: rawResponse.status,
    body: await rawResponse.json()
  };
}


router.get('/', asyncRoute(async (req, res, next) => {
    const basket = await BasketModel.findById(req.session.basket)
    const items = basket ? basket.items : [];

    if (basket && basket.payed) {
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

    res.render('order/order', { menu: menu, basket: friendlyBasket });
}));

router.post('/submit', asyncRoute(async (req, res, next) => {
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

  // Create Payment and Payment Code
  const response = await jsonFetch('post', 'api/payment/create', {amount: total});
  if(response.status != 200) {
    res.status(500).send(`Payment Service Error\n${JSON.stringify(response.body)}`);
    return;
  }

  // Update Basket
  basket.name = req.body.name;
  basket.items = req.body.basket;
  basket.payed = false;
  basket.code = response.body.code;
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

  const friendlyBasket = basket.items.map(v => ({
    name: menu.categories[v.category].dishes[v.dish].name,
    price: menu.categories[v.category].dishes[v.dish].price
  }));

  const total = friendlyBasket.reduce((acc, curr) => acc + curr.price, 0);

  // Get Payment Status
  const response = await jsonFetch('post', 'api/payment/status', {code: basket.code});
  if(response.status != 200) {
    res.status(500).send(`Payment Service Error\n${JSON.stringify(response.body)}`);
    return;
  }

  res.render('order/status', { total: total, reason: basket.code, account: process.env.PAYPAL_ACC, basket: friendlyBasket, payed: response.body.payed });
}));

module.exports = router;
