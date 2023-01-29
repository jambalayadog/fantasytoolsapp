var week_select_elem = document.getElementById('week_selector')
var table_elem = document.getElementById('table_display')
var data_source_elem = document.getElementById('data_source')
var data = data_source_elem.getAttribute("scheduleDat")
console.log({data}, typeof(data))



for (schedule_data in data) {
    console.log(data[schedule_data])
    for (const [team, teamSchedule] of Object.entries(data[schedule_data][0])) {
 
    }
}

console.log('hello')


initialize()


function initialize() {
    console.log('hello')
    console.log(teamdata)
}