var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


var gameRouter = require('./routes/game');    // game page for future game development
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
var gameDesign_coreLoops_Router = require ('./routes/gameDesign/coreLoops');
var gameDesign_eldenRing_Router = require('./routes/gameDesign/eldenRing');

//portfolia
var portfolio_Router = require('./routes/portfolio/portfolio');
var portfolio_skate123_Router = require('./routes/portfolio/skate123');
var portfolio_nfstherun_Router = require('./routes/portfolio/nfstherun');
var portfolio_pvzgw2_Router = require('./routes/portfolio/pvzgw2')
var portfolio_fifa2017_Router = require('./routes/portfolio/fifa2017');
var portfolio_bfhardline_Router = require('./routes/portfolio/bfhardline')
//var portfolio_nfsrivals_Router = require('./routes/portfolio/nfsrivals')
var portfolio_nfs_rivals_Router = require('./routes/portfolio/nfs_rivals')
var portfolio_warfighter_Router = require('./routes/portfolio/warfighter');
var portfolio_ao2dc_Router = require('./routes/portfolio/ao2dc')
var portfolio_rAndD_Router = require('./routes/portfolio/randd')
var portfolio_gears5_Router = require('./routes/portfolio/gears5')
var portfolio_qamanager_Router = require('./routes/portfolio/qamanager');
var portfolio_qatester_Router = require('./routes/portfolio/qatester')
var portfolio_swbf2_Router = require('./routes/portfolio/swbf2')
var portfolio_pvzbfn_Router = require('./routes/portfolio/pvzbfn')
var portfolio_summary_Router = require('./routes/portfolio/summary')
var portfolio_misc_Router = require('./routes/portfolio/misc')
var portfolio_highlights_Router = require('./routes/portfolio/highlights')
var portfolio_accomplishments_Router = require('./routes/portfolio/accomplishments')
var portfolio_credits_Router = require('./routes/portfolio/credits')

// games and stuff
var games_helloWordle_Router = require('./routes/game_helloWordle');

// modernized hockey schedule
var hockeytestRouter = require('./routes/hockeytest');

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

app.use('/', weeklyScheduleRouter);    // default main page; currently pointing at hockey schedule page
app.use('/game', gameRouter);   // game page for future game development
app.use('/SeasonSchedule', seasonScheduleRouter);   // hockey schedule page - season schedule
app.use('/WeeklySchedule', weeklyScheduleRouter);   // hockey schedule page - weekly schedule
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
app.use('/gameDesign/coreLoops', gameDesign_coreLoops_Router);

//portfolio
app.use('/portfolio', portfolio_Router);
app.use('/portfolio/skate123', portfolio_skate123_Router);
app.use('/portfolio/nfstherun', portfolio_nfstherun_Router);
app.use('/portfolio/pvzgw2', portfolio_pvzgw2_Router);
app.use('/portfolio/fifa2017', portfolio_fifa2017_Router);
app.use('/portfolio/bfhardline', portfolio_bfhardline_Router);
//app.use('/portfolio/nfsrivals', portfolio_nfsrivals_Router);
app.use('/portfolio/nfs_rivals', portfolio_nfs_rivals_Router);
app.use('/portfolio/warfighter', portfolio_warfighter_Router);
app.use('/portfolio/ao2dc', portfolio_ao2dc_Router);
app.use('/portfolio/randd', portfolio_rAndD_Router)
app.use('/portfolio/gears5', portfolio_gears5_Router)
app.use('/portfolio/qamanager', portfolio_qamanager_Router);
app.use('/portfolio/qatester', portfolio_qatester_Router);
app.use('/portfolio/swbf2', portfolio_swbf2_Router)
app.use('/portfolio/pvzbfn', portfolio_pvzbfn_Router)
app.use('/portfolio/summary', portfolio_summary_Router)
app.use('/portfolio/misc', portfolio_misc_Router)
app.use('/portfolio/highlights', portfolio_highlights_Router)
app.use('/portfolio/accomplishments', portfolio_accomplishments_Router)
app.use('/portfolio/credits', portfolio_credits_Router)


// games and stuff
app.use('/game_helloWordle', games_helloWordle_Router);

// modernized hockey schedule
app.use('/hockeytest', hockeytestRouter);

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
