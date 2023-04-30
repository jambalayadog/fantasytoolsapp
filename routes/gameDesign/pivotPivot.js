var express = require('express');
var router = express.Router();
var fs = require('fs')



console.log('pivotPivot.js ---> ')

router.get('/', function(req, res, next) {
    res.render('./gameDesign/pivotPivot', { title: 'Pivot Pivot', message: 'Hello there!' });
});


module.exports = router;
