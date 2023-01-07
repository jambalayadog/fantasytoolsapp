var express = require('express');
var router = express.Router();
var fs = require('fs')


const weekly_schedule_url = "https://raw.githubusercontent.com/jambalayadog/fantasytoolsapp/main/files/03_NHLWeeklySchedules.json"
var weekly_schedule_data


router.get('/', function(req, res, next) {

    fetch(weekly_schedule_url, {
        method: 'GET',
        credentials: 'same-origin',
        mode: 'cors',
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'http://159.203.66.92',
            'Access-Control-Allow-Credentials': true,
        },
    })
    .then((response) => response.json())
    .then((data) => {
        weekly_schedule_data = data
        //console.log(':: ', weekly_schedule_data)
        res.render('scheduleWeekly', {weekly_schedule_data: weekly_schedule_data});
        
    }).catch((err) => {
        console.log(weekly_schedule_url, err);
    });

});



module.exports = router;
