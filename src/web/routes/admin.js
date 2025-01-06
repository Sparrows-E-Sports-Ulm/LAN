var express = require('express');
var router = express.Router();
const BasketModel = require('../models/basket-model');
const asyncRoute = require('../util/async-wrapper');

router.get('/', asyncRoute(async (req, res, next) => {
  const baskets = await BasketModel.find();
  res.render('admin/admin', { baskets: baskets });
}));

module.exports = router;
