var express = require('express');
var router = express.Router();
const BasketModel = require('../models/basket-model');
const asyncRoute = require('../util/async-wrapper');

router.get('/', asyncRoute(async (req, res, next) => {
  const baskets = await BasketModel.find();
  res.render('admin/admin', { baskets: baskets });
}));

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
