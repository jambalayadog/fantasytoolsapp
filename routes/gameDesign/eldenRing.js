var express = require('express');
var router = express.Router();
var fs = require('fs')



router.get('/', function(req, res, next) {
    res.render('./gameDesign/eldenRing', { title: 'Elden Ring Accessibility', message: 'Hello there!' });
});


module.exports = router;
