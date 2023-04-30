var express = require('express');
var router = express.Router();
var fs = require('fs')



router.get('/', function(req, res, next) {
    res.render('./gameDesign/selfDeterminationTheory', { title: 'Self Determination Theory', message: 'Hello there!' });
});


module.exports = router;
