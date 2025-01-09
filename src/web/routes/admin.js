var express = require('express');
var router = express.Router();
const BasketModel = require('../models/basket-model');
const asyncRoute = require('../util/async-wrapper');
const config = require('../util/config');

router.get('/', asyncRoute(async (req, res, next) => {
  const baskets = await BasketModel.find();
  const total = baskets.reduce((v, c) => v + c.total, 0.0);
  const payed = baskets.filter(b => b.payed).length;

  res.render('admin/admin', { baskets: baskets, total: total, numberOfOrders: baskets.length, numberOfPayed: payed, locked: config.ordersLocked });
}));

router.post('/set-payed', asyncRoute(async (req, res, next) => {
  if(req.body.code === undefined || typeof req.body.code !== 'string')  {
    res.status(400).send('Bad Request (code)');
    return;
  }

  if(req.body.payed === undefined || typeof req.body.payed !== 'boolean')  {
    res.status(400).send('Bad Request (payed)');
    return;
  }

  const basket = await BasketModel.findOne({code: req.body.code});
  if(!basket) {
    res.status(400).send(`Unknown Code ${req.body.code}`);
  }

  basket.payed = req.body.payed;
  basket.manuallySetPayed = true;
  basket.save();

  res.send();
}));

router.post('/lock', (req, res, next) => {
  if(req.body.locked === undefined || typeof req.body.locked !== 'boolean')  {
    res.status(400).send('Bad Request');
    return;
  }

  config.ordersLocked = req.body.locked;
  res.send();
});

router.delete('/delete', asyncRoute(async (req, res, next) => {
  await BasketModel.deleteMany();
  res.send('OK');
}));

router.get('/download', asyncRoute(async (req, res, next) => {
  const baskets = await BasketModel.find();

  if(!baskets) {
    res.status(500).send('No Baskets In DB');
    return;
  }

  var output = `Bestellung vom ${new Date().toLocaleDateString('de')}\n\n`;

  var productMap = {}; 

  for(const basket of baskets) {
    for(const item of basket.items) {
      const entry = productMap[`${item.categoryId}-${item.dishId}`];
      if(!entry) {
        productMap[`${item.categoryId}-${item.dishId}`] = {
          count: 1,
          name: item.dish,
          price: item.price
        }

        continue;
      }

      entry.count += 1;
    }
  }

  for(item of Object.values(productMap)) {
    output += `- ${item.count}x ${item.name}\n`
  }

  res.send(output);
}));


module.exports = router;
