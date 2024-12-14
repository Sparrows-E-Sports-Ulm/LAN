var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('order/order');
});

router.get('/status', function(req, res, next) {
    res.render('order/status');
  });

module.exports = router;
