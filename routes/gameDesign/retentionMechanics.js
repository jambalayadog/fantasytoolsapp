var express = require('express');
var router = express.Router();
var fs = require('fs')



router.get('/', function(req, res, next) {
    res.render('./gameDesign/retentionMechanics', { title: 'Retention Mechanics', message: 'Hello there!' });
});


module.exports = router;
