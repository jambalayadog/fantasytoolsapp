var express = require('express');
var router = express.Router();
var fs = require('fs')



router.get('/', function(req, res, next) {
    res.render('./gameDesign/whatsAGame', { title: 'What is a game, anyways?', message: 'Hello there!' });
});


module.exports = router;
