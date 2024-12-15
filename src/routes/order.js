var express = require('express');
var router = express.Router();

const menu = require('../models/vabene.json');

router.get('/', function(req, res, next) {
  res.render('order/order', menu);
});

router.post('/submit', function(req, res, next) {
  console.log(JSON.stringify(req.body));
  res.status(500).send('not implemented yet');
});

router.get('/status', function(req, res, next) {
    res.render('order/status', {total: 10.40, reason: 'UL-LOL-TEST', account: '@lpfrenger'});
});

module.exports = router;
