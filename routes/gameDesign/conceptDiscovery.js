var express = require('express');
var router = express.Router();
var fs = require('fs')

console.log('conceptDiscovery.js ---> ')

router.get('/', function(req, res, next) {
    res.render('./gameDesign/conceptDiscovery', { title: 'Concept Discovery', message: 'Hello there!' });
});


module.exports = router;
