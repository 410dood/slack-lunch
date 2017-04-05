var express = require('express');
var router = express.Router();
var showPlaces = require('../router/showPlaces');

router.post('/show', (req, res, next) => {
  return showPlaces(req, res);
});

module.exports = router;
