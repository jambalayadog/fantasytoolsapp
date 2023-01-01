var express = require('express');
var router = express.Router();
var fs = require('fs')


const schedule_file = "files/01_NHLScheduleByTeam.json"
//const schedule_url = "https://fantasyhockeycentral.com/fantasytoolsapp/files/01_NHLScheduleByTeam.json"
const schedule_url = "https://fantasyhockeycentral.com/fantasytoolsapp/files/01_NHLScheduleByTeam.json"
const schedule_url_2 = "https://raw.githubusercontent.com/jambalayadog/fantasytoolsapp/main/files/01_NHLScheduleByTeam.json"
var schedule_data

const teamStats_file = "files/02_NHLTeamStats.json"
const teamStats_url = "https://fantasyhockeycentral.com/fantasytoolsapp/files/02_NHLTeamStats.json"
const teamStats_url_2 = "https://raw.githubusercontent.com/jambalayadog/fantasytoolsapp/main/files/02_NHLTeamStats.json"

var teamstats_data


/*
router.get('/', function(req, res, next) {

    fetch(schedule_url, {
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
        
        fetch(teamStats_url)
        .then((response) => response.json())
        .then((data) => {
            teamstats_data = data
            //console.log('2a ', {teamstats_data})
            res.render('schedule2', {schedule_data: schedule_data, teamstats_data: teamstats_data});
        }).catch((err) => {
            console.log(err);    
        })
    }).catch((err) => {
        console.log(schedule_url, err);
    });

});
*/

console.log('Fetch test here ---> ')

/* GET home page. 
router.get('/', function(req, res, next) {
    res.render('schedule', { title: 'Express2' });
});*/


/*
/* GET home page. */

/*
router.get('/', function(req, res, next) {
    fs.readFile(schedule_file, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        //console.log(data);
        schedule_data = data
        //res.render('schedule', {schedule_data: schedule_data});
        fs.readFile(teamStats_file, 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                return;
            }
            //console.log(data);
            teamstats_data = data
            var combined_data = JSON.stringify({schedule_data: schedule_data, teamstats_data: teamstats_data})
            console.log('1 ', (schedule_data).substring(0,50))
            console.log('2 ', (teamstats_data).substring(0,55))
            console.log('3b ', (combined_data).substring(0,60))
            res.render('players', {schedule_data: schedule_data, teamstats_data: teamstats_data});
            //res.render('schedule2', JSON.stringify({schedule_data: schedule_data, teamstats_data: teamstats_data}));
        });
    });
});


*/

router.get('/', function(req, res, next) {

    fetch(schedule_url_2, {
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
            res.render('schedule2', {schedule_data: schedule_data, teamstats_data: teamstats_data});
        }).catch((err) => {
            console.log(err);    
        })
    }).catch((err) => {
        console.log(schedule_url, err);
    });

});



module.exports = router;
