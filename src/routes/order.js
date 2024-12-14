var express = require('express');
var router = express.Router();

const menu = require('../models/vabene.json');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('order/order', menu);
});

router.get('/status', function(req, res, next) {
    res.render('order/status');
  });

module.exports = router;
