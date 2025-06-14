var express = require('express');
var router = express.Router();
var fs = require('fs')


//const schedule_url = "https://fantasyhockeycentral.com/fantasytoolsapp/files/01_NHLScheduleByTeam.json"
const weekly_schedule_url = "https://raw.githubusercontent.com/jambalayadog/fantasytoolsapp/main/files/03_NHLWeeklySchedules.json"
var schedule_data
const teamStats_url_2 = "https://raw.githubusercontent.com/jambalayadog/fantasytoolsapp/main/files/02_NHLTeamStats.json"
var teamstats_data





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
        schedule_data = data
        //console.log('1a ', schedule_data, typeof(schedule_data))
        
        fetch(teamStats_url_2)
        .then((response) => response.json())
        .then((data) => {
            teamstats_data = data
            //console.log('2a ', {teamstats_data})
            res.render('test', {title: 'HockeyOGpage', schedule_data: schedule_data, teamstats_data: teamstats_data});
        }).catch((err) => {
            console.log(err);    
        })
    }).catch((err) => {
        console.log(weekly_schedule_url, err);
    });

});



module.exports = router;
