var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var scheduleRouter = require('./routes/schedule2');
var schedulePlusRouter = require('./routes/schedulePlus');
var scheduleWeeklyRouter = require('./routes/scheduleWeekly');
var teamsRouter = require('./routes/teams');
var playersRouter = require('./routes/players');
var gameRouter = require('./routes/game');
var testRouter = require('./routes/test');
var seasonScheduleRouter = require('./routes/schedule2');
var weeklyScheduleRouter = require('./routes/test');
//
// game design book and chapters
var gameDesignRouter = require('./routes/gameDesign/gameDesign');
var gameDesignPowerFantasyRouter = require('./routes/gameDesign/powerFantasy');
var gameDesign_projectPillars_Router = require('./routes/gameDesign/projectPillars');
var gameDesign_expression_Router = require('./routes/gameDesign/expression');
var gameDesign_pivotPivot_Router = require('./routes/gameDesign/pivotPivot');
var gameDesign_whatsAGame_Router = require('./routes/gameDesign/whatsAGame');
var gameDesign_selfDeterminationTheory_Router = require('./routes/gameDesign/selfDeterminationTheory');
var gameDesign_retentionMechanics_Router = require('./routes/gameDesign/retentionMechanics');
var gameDesign_accessibility_Router = require('./routes/gameDesign/accessibility');
var gameDesign_conceptdiscovery_Router = require('./routes/gameDesign/conceptDiscovery');
var gameDesign_pipelinediscovery_Router = require('./routes/gameDesign/pipelineDiscovery');
var gameDesign_productionDelivery_Router = require('./routes/gameDesign/productionDelivery');
var gameDesign_shipAndLiveService_Router = require('./routes/gameDesign/shipAndLiveService');
var gameDesign_eldenRing_Router = require('./routes/gameDesign/eldenRing');

// games and stuff
var games_helloWordle_Router = require('./routes/game_helloWordle');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'files')));

//app.use('/', indexRouter);
app.use('/', weeklyScheduleRouter);
app.use('/users', usersRouter);
app.use('/schedule', scheduleRouter);
//app.use('/schedulePlus', schedulePlusRouter);
app.use('/scheduleWeekly', scheduleWeeklyRouter);
app.use('/teams', teamsRouter);
app.use('/players', playersRouter);
app.use('/game', gameRouter);
app.use('/test', testRouter);
app.use('/SeasonSchedule', seasonScheduleRouter);
app.use('/WeeklySchedule', weeklyScheduleRouter);
//
// game design book and chapters
app.use('/gameDesign', gameDesignRouter);
app.use('/gameDesign/powerFantasy', gameDesignPowerFantasyRouter);
app.use('/gameDesign/projectPillars', gameDesign_projectPillars_Router);
app.use('/gameDesign/expression', gameDesign_expression_Router);
app.use('/gameDesign/pivotPivot', gameDesign_pivotPivot_Router);
app.use('/gameDesign/whatsAGame', gameDesign_whatsAGame_Router);
app.use('/gameDesign/selfDeterminationTheory', gameDesign_selfDeterminationTheory_Router);
app.use('/gameDesign/retentionMechanics', gameDesign_retentionMechanics_Router);
app.use('/gameDesign/accessibility', gameDesign_accessibility_Router);
app.use('/gameDesign/conceptdiscovery', gameDesign_conceptdiscovery_Router);
app.use('/gameDesign/pipelinediscovery', gameDesign_pipelinediscovery_Router);
app.use('/gameDesign/productionDelivery', gameDesign_productionDelivery_Router);
app.use('/gameDesign/shipAndLiveService', gameDesign_shipAndLiveService_Router);
app.use('/gameDesign/eldenRingAccessibility', gameDesign_eldenRing_Router);

// games and stuff
app.use('/game_helloWordle', games_helloWordle_Router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
