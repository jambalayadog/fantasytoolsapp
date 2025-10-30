const fetch = require('cross-fetch');
const fs = require('fs');
const path = require('path');

console.log('🏒 NHL Data Update Script Starting...');

// Configuration
const OUTPUT_DIR = path.join(__dirname, '../files');
const NHL_TEAMS = ['ANA', 'BOS', 'BUF', 'CGY', 'CAR', 'CHI', 'COL', 'CBJ', 
                   'DAL', 'DET', 'EDM', 'FLA', 'LAK', 'MIN', 'MTL', 'NSH', 
                   'NJD', 'NYI', 'NYR', 'OTT', 'PHI', 'PIT', 'SJS', 'SEA', 
                   'STL', 'TBL', 'TOR', 'UTA', 'VAN', 'VGK', 'WSH', 'WPG'];

// Season configuration
const SEASON_START = new Date('2025-10-07');
const SEASON_END = new Date('2026-04-16');
const FIRST_MONDAY = new Date('2025-10-06T00:00:00');

// Run mode: 'backfill', 'daily', 'current', or 'update' (legacy)
const MODE = process.argv[2] || 'update';
const VALID_MODES = ['backfill', 'daily', 'current', 'update'];

if (!VALID_MODES.includes(MODE)) {
    console.error(`❌ Invalid mode: ${MODE}`);
    console.error(`   Valid modes: ${VALID_MODES.join(', ')}`);
    process.exit(1);
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

async function main() {
    const startTime = Date.now();
    
    const modeNames = {
        'backfill': '🔄 BACKFILL (Full Season)',
        'daily': '📆 DAILY CHECK (3 Weeks)',
        'current': '⚡ CURRENT WEEK',
        'update': '⚡ UPDATE (Recent Games)'
    };
    console.log(`Mode: ${modeNames[MODE]}`);
    
    try {
        // Step 1: Fetch schedule data
        console.log('📅 Fetching schedule data...');
        const scheduleData = await fetchScheduleData();
        console.log(`   ✅ Fetched ${scheduleData.length} API responses (each contains 1 week)`);
        
        // Step 2: Fetch standings/team stats
        console.log('📊 Fetching team standings...');
        const teamStats = await fetchTeamStats();
        console.log(`   ✅ Fetched stats for ${Object.keys(teamStats).length} teams`);
        
        // Step 3: Build game library from schedule data
        console.log('🔨 Building game library...');
        let gameLibrary = buildGameLibrary(scheduleData);
        console.log(`   ✅ Processed ${gameLibrary.length} games`);
        
        // Show the update window date range
        if (gameLibrary.length > 0) {
            const sortedGames = [...gameLibrary].sort((a, b) => 
                new Date(a.gameSummaryDate) - new Date(b.gameSummaryDate)
            );
            const firstGameDate = new Date(sortedGames[0].gameSummaryDate);
            const lastGameDate = new Date(sortedGames[sortedGames.length - 1].gameSummaryDate);
            const dateFormat = { month: 'short', day: 'numeric' };
            console.log(`📅 Update window: ${firstGameDate.toLocaleDateString('en-US', dateFormat)} to ${lastGameDate.toLocaleDateString('en-US', dateFormat)}`);
            console.log(`   ${gameLibrary.length} games in this window:`);
            console.log('═══════════════════════════════════════════════════════════════');
            
            gameLibrary.forEach(game => {
                const away = game.gameSummaryAwayTeamShort || 'TBD';
                const home = game.gameSummaryHomeTeamShort || 'TBD';
                const awayScore = game.gameSummaryAwayScore || 0;
                const homeScore = game.gameSummaryHomeScore || 0;
                const gameDate = new Date(game.gameSummaryDate);
                const gameTime = gameDate.toLocaleString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                });
                const result = game.gameSummaryDetailedState || 'Scheduled';
                
                console.log(`   #${game.gameSummaryGameNumber}: ${away} ${awayScore} @ ${home} ${homeScore} - ${result} (${gameTime})`);
            });
            console.log('═══════════════════════════════════════════════════════════════');
        }
        
        // Step 3.5: For BACKFILL mode, show 5 random game samples
        if (MODE === 'backfill') {
            const finalGames = gameLibrary.filter(g => 
                g.gameSummaryGameNumber && 
                (g.gameSummaryAwayTeamShort || g.gameSummaryHomeTeamShort) && 
                g.gameSummaryDetailedState && 
                g.gameSummaryDetailedState !== 'TBD' &&
                g.gameSummaryDetailedState === 'Final'
            );
            
            if (finalGames.length > 0) {
                // Pick 5 random games to display
                const sampleSize = Math.min(5, finalGames.length);
                const randomGames = [];
                const usedIndices = new Set();
                
                while (randomGames.length < sampleSize) {
                    const randomIndex = Math.floor(Math.random() * finalGames.length);
                    if (!usedIndices.has(randomIndex)) {
                        usedIndices.add(randomIndex);
                        randomGames.push(finalGames[randomIndex]);
                    }
                }
                
                // Sort samples by game number for cleaner display
                randomGames.sort((a, b) => a.gameSummaryGameNumber - b.gameSummaryGameNumber);
                
                console.log('🎲 Random sample of game results (5 games):');
                console.log('═══════════════════════════════════════════════════════════════');
                randomGames.forEach(game => {
                    const away = game.gameSummaryAwayTeamShort || 'TBD';
                    const home = game.gameSummaryHomeTeamShort || 'TBD';
                    const awayScore = game.gameSummaryAwayScore || 0;
                    const homeScore = game.gameSummaryHomeScore || 0;
                    const gameDate = new Date(game.gameSummaryDate);
                    const gameTime = gameDate.toLocaleString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        hour: 'numeric', 
                        minute: '2-digit',
                        hour12: true 
                    });
                    const result = game.gameSummaryDetailedState || 'Scheduled';
                    
                    console.log(`   Game ${game.gameSummaryGameNumber}: ${away} ${awayScore} @ ${home} ${homeScore} - ${result}`);
                    console.log(`   └─ ${gameTime}`);
                });
                console.log('═══════════════════════════════════════════════════════════════');
            }
        }
        
        // Step 3.6: MERGE with existing data if in DAILY or CURRENT mode
        if (MODE === 'daily' || MODE === 'current' || MODE === 'update') {
            console.log('🔀 Merging with existing data...');
            const mergeResult = mergeWithExistingData(gameLibrary);
            gameLibrary = mergeResult.games;
            console.log(`   ✅ Merged: ${gameLibrary.length} total games`);
            console.log(`   ✏️  Updated: ${mergeResult.updatedGames.length} games changed from previous data`);
        }
        
        // Step 4: Organize by team (01_NHLScheduleByTeam.json)
        console.log('👥 Organizing schedule by team...');
        const scheduleByTeam = organizeByTeam(gameLibrary);
        console.log(`   ✅ Organized for ${Object.keys(scheduleByTeam).length} teams`);
        
        // Step 5: Organize by week (03_NHLWeeklySchedules.json)
        console.log('📆 Organizing schedule by week...');
        const scheduleByWeek = organizeByWeek(scheduleByTeam);
        console.log(`   ✅ Organized into weeks`);
        
        // Step 6: Save all files
        console.log('💾 Saving data files...');
        
        // Ensure output directory exists
        if (!fs.existsSync(OUTPUT_DIR)) {
            fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        }
        
        saveDataFile('00_GameSummaryLibrary.json', gameLibrary);
        saveDataFile('01_NHLScheduleByTeam.json', scheduleByTeam);
        saveDataFile('02_NHLTeamStats.json', teamStats);
        saveDataFile('03_NHLWeeklySchedules.json', scheduleByWeek);
        
        // Calculate game statistics
        const gamesCompleted = gameLibrary.filter(g => 
            g.gameSummaryDetailedState === 'Final' || g.gameSummaryStatus === 'OFF' || g.gameState === 'OFF'
        ).length;
        const gamesInProgress = gameLibrary.filter(g => 
            g.gameSummaryStatus === 'LIVE' || g.gameState === 'LIVE'
        ).length;
        
        // Calculate current week
        const today = new Date();
        const currentWeek = Math.floor((today - FIRST_MONDAY) / (7 * 24 * 60 * 60 * 1000));
        const totalWeeks = Math.ceil((SEASON_END - FIRST_MONDAY) / (7 * 24 * 60 * 60 * 1000));
        
        // Save metadata
        const metadata = {
            generatedAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            totalGames: gameLibrary.length,
            gamesCompleted: gamesCompleted,
            gamesInProgress: gamesInProgress,
            gamesScheduled: gameLibrary.length - gamesCompleted - gamesInProgress,
            seasonStart: SEASON_START.toISOString().substring(0, 10),
            seasonEnd: SEASON_END.toISOString().substring(0, 10),
            currentDate: today.toISOString().substring(0, 10),
            currentWeek: currentWeek,
            totalWeeks: totalWeeks,
            teamsProcessed: Object.keys(teamStats).length,
            executionTime: `${((Date.now() - startTime) / 1000).toFixed(2)}s`,
            version: '2.0'
        };
        saveDataFile('_metadata.json', metadata);
        console.log(`   ✅ Saved 5 files to ${OUTPUT_DIR}`);
        
        // Summary
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log('✅ Update Complete!');
        console.log(`   Execution time: ${duration}s`);
        console.log(`   Games: ${gameLibrary.length}`);
        console.log(`   Teams: ${Object.keys(teamStats).length}`);
        console.log(`   Output: ${OUTPUT_DIR}`);
        
    } catch (error) {
        console.error('❌ Error during update:', error);
        process.exit(1);
    }
}

// =============================================================================
// DATA FETCHING
// =============================================================================

async function fetchScheduleData() {
    const dates = [];
    const today = new Date();
    
    // Calculate current week's Monday for all modes that need it
    const currentWeekMonday = new Date(today);
    const daysSinceMonday = (currentWeekMonday.getDay() + 6) % 7; // 0 = Monday
    currentWeekMonday.setDate(currentWeekMonday.getDate() - daysSinceMonday);
    
    if (MODE === 'backfill') {
        // Backfill mode: Fetch entire season (one call per week = 7 days each)
        const totalWeeks = Math.ceil((SEASON_END - FIRST_MONDAY) / (7 * 24 * 60 * 60 * 1000));
        
        console.log(`   Fetching ${totalWeeks} weeks (${FIRST_MONDAY.toISOString().substring(0,10)} to ${SEASON_END.toISOString().substring(0,10)})`);
        console.log(`   ℹ️  Each API call fetches 1 week (7 days) of games`);
        
        // Pick one date from each week (Monday of each week)
        for (let week = 0; week < totalWeeks; week++) {
            const weekDate = new Date(FIRST_MONDAY);
            weekDate.setDate(weekDate.getDate() + (week * 7));
            dates.push(weekDate.toISOString().substring(0, 10));
        }
        
    } else if (MODE === 'daily') {
        // Daily mode: Fetch last week, current week, next week (3 calls = 21 days)
        console.log(`   Fetching 3 weeks (21 days)`);
        console.log(`   ℹ️  Last week + Current week + Next week`);
        
        // Last week's Monday
        const lastWeekMonday = new Date(currentWeekMonday);
        lastWeekMonday.setDate(lastWeekMonday.getDate() - 7);
        dates.push(lastWeekMonday.toISOString().substring(0, 10));
        
        // Current week's Monday
        dates.push(currentWeekMonday.toISOString().substring(0, 10));
        
        // Next week's Monday
        const nextWeekMonday = new Date(currentWeekMonday);
        nextWeekMonday.setDate(nextWeekMonday.getDate() + 7);
        dates.push(nextWeekMonday.toISOString().substring(0, 10));
        
    } else if (MODE === 'current') {
        // Current week only: Fetch just this week (1 call = 7 days)
        console.log(`   Fetching current week (7 days)`);
        
        // Current week's Monday
        dates.push(currentWeekMonday.toISOString().substring(0, 10));
        
    } else {
        // Update mode: Fetch last week, current week, next week (same as daily)
        console.log(`   Fetching 3 weeks (21 days)`);
        console.log(`   ℹ️  Last week + Current week + Next week`);
        
        const lastWeekMonday = new Date(currentWeekMonday);
        lastWeekMonday.setDate(lastWeekMonday.getDate() - 7);
        dates.push(lastWeekMonday.toISOString().substring(0, 10));
        
        dates.push(currentWeekMonday.toISOString().substring(0, 10));
        
        const nextWeekMonday = new Date(currentWeekMonday);
        nextWeekMonday.setDate(nextWeekMonday.getDate() + 7);
        dates.push(nextWeekMonday.toISOString().substring(0, 10));
    }
    
    // Fetch with rate limiting to avoid 429 errors
    const scheduleData = [];
    const delayMs = MODE === 'backfill' ? 500 : 0; // 500ms delay for backfill, none for updates
    
    for (let i = 0; i < dates.length; i++) {
        const date = dates[i];
        const url = `https://api-web.nhle.com/v1/schedule/${date}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.log(`   ⚠️  Failed to fetch ${date}: ${response.status}`);
                continue; // Skip this date
            }
            const data = await response.json();
            scheduleData.push(data);
            
            // Progress indicator for backfill
            if (MODE === 'backfill' && (i + 1) % 5 === 0) {
                console.log(`   Progress: ${i + 1}/${dates.length} weeks fetched (${(i + 1) * 7} days)`);
            }
            
            // Rate limiting delay
            if (delayMs > 0 && i < dates.length - 1) {
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
        } catch (error) {
            console.log(`   ⚠️  Error fetching ${date}: ${error.message}`);
            continue;
        }
    }
    
    return scheduleData;
}

async function fetchTeamStats() {
    const url = 'https://api-web.nhle.com/v1/standings/now';
    console.log(`   Fetching: ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch standings: ${response.status}`);
    }
    const data = await response.json();
    
    // Transform to old format
    const teamStats = {};
    for (const standing of data.standings) {
        const abbrev = standing.teamAbbrev.default;
        teamStats[abbrev] = {
            teamRecord_Name: abbrev,
            teamRecord_Wins: standing.wins,
            teamRecord_Losses: standing.losses,
            teamRecord_Overtimes: standing.otLosses,
            teamRecord_RegulationWins: standing.regulationWins,
            teamRecord_GoalsFor: standing.goalFor,
            teamRecord_GoalsAgainst: standing.goalAgainst,
            teamRecord_Points: standing.points,
            teamRecord_GamesPlayed: standing.gamesPlayed,
            teamRecord_Streak: standing.streakCode,
            teamRecord_Home: `${standing.homeWins}-${standing.homeLosses}-${standing.homeOtLosses}`,
            teamRecord_Away: `${standing.roadWins}-${standing.roadLosses}-${standing.roadOtLosses}`,
            teamRecord_Shootouts: `${standing.shootoutWins}-${standing.shootoutLosses}`,
            teamRecord_LastTen: `${standing.l10Wins}-${standing.l10Losses}-${standing.l10OtLosses}`,
            teamRecord_LastTenGoals: `${standing.l10GoalsFor}-${standing.l10GoalsAgainst}`,
            teamRecord_2PtGamesPoints: (standing.regulationPlusOtWins * 2) + standing.shootoutLosses + standing.shootoutWins,
            teamRecord_2PtGamesRecord: `${standing.regulationPlusOtWins}-${standing.otLosses + standing.losses}-${standing.shootoutWins}`,
            teamRecord_60minPoints: (standing.regulationWins * 2) + (standing.gamesPlayed - standing.regulationWins - standing.losses),
            teamRecord_60minRecord: `${standing.regulationWins}-${standing.losses}-${standing.gamesPlayed - standing.regulationWins - standing.losses}`
        };
    }
    
    return teamStats;
}

// =============================================================================
// DATA MERGING (for UPDATE mode)
// =============================================================================

function mergeWithExistingData(newGames) {
    const existingFilePath = path.join(OUTPUT_DIR, '00_GameSummaryLibrary.json');
    
    // If no existing file, return new games as-is
    if (!fs.existsSync(existingFilePath)) {
        console.log('   ℹ️  No existing data found, using new games only');
        return { games: newGames, updatedGames: newGames };
    }
    
    try {
        // Load existing games
        const existingGames = JSON.parse(fs.readFileSync(existingFilePath, 'utf8'));
        console.log(`   📂 Loaded ${existingGames.length} existing games`);
        
        // Create a map of new games by game number for quick lookup
        const newGamesMap = new Map();
        newGames.forEach(game => {
            newGamesMap.set(game.gameSummaryGameNumber, game);
        });
        console.log(`   🆕 ${newGames.length} games in update window`);
        
        // Merge: Update existing games or keep them, then add any new games
        const mergedGames = [];
        const updatedGames = [];
        const updatedCount = { updated: 0, kept: 0, added: 0 };
        
        // Process existing games
        existingGames.forEach(existingGame => {
            if (newGamesMap.has(existingGame.gameSummaryGameNumber)) {
                // Game is in update window - check if it actually changed
                const newGame = newGamesMap.get(existingGame.gameSummaryGameNumber);
                const hasChanged = JSON.stringify(existingGame) !== JSON.stringify(newGame);
                
                mergedGames.push(newGame);
                newGamesMap.delete(existingGame.gameSummaryGameNumber); // Mark as processed
                
                if (hasChanged) {
                    updatedGames.push(newGame);
                    updatedCount.updated++;
                } else {
                    updatedCount.kept++;
                }
            } else {
                // Game is outside update window - keep existing data
                mergedGames.push(existingGame);
                updatedCount.kept++;
            }
        });
        
        // Add any truly new games that weren't in existing data
        newGamesMap.forEach(game => {
            mergedGames.push(game);
            updatedGames.push(game);
            updatedCount.added++;
        });
        
        // Sort by date to maintain order
        mergedGames.sort((a, b) => {
            const dateA = new Date(a.gamedate);
            const dateB = new Date(b.gamedate);
            return dateA - dateB;
        });
        
        console.log(`   ✏️  Updated: ${updatedCount.updated}, Kept: ${updatedCount.kept}, Added: ${updatedCount.added}`);
        
        return { games: mergedGames, updatedGames };
        
    } catch (error) {
        console.error('   ⚠️  Error loading existing data, using new games only:', error.message);
        return { games: newGames, updatedGames: newGames };
    }
}

// =============================================================================
// DATA TRANSFORMATION
// =============================================================================

function buildGameLibrary(scheduleDataArray) {
    const library = [];
    
    for (const scheduleData of scheduleDataArray) {
        if (!scheduleData.gameWeek) continue;
        
        for (const gameWeek of scheduleData.gameWeek) {
            for (const game of gameWeek.games) {
                // Create game summary object (NHL API format + old format)
                const gameSummary = {
                    // Core identifiers
                    gameSummaryGameNumber: getGameNumber(game.id),
                    gameSummaryDate: game.startTimeUTC,
                    
                    // Team info (old format)
                    gameSummaryHomeTeam: game.homeTeam.placeName?.default || game.homeTeam.commonName?.default || '',
                    gameSummaryAwayTeam: game.awayTeam.placeName?.default || game.awayTeam.commonName?.default || '',
                    gameSummaryHomeTeamShort: game.homeTeam.abbrev,
                    gameSummaryAwayTeamShort: game.awayTeam.abbrev,
                    gameSummaryHomeTeamID: game.homeTeam.id,
                    gameSummaryAwayTeamID: game.awayTeam.id,
                    
                    // Scores
                    gameSummaryHomeScore: game.homeTeam.score || 0,
                    gameSummaryAwayScore: game.awayTeam.score || 0,
                    gameSummaryHomeShots: game.homeTeam.sog || 0,
                    gameSummaryAwayShots: game.awayTeam.sog || 0,
                    
                    // Power play (placeholder - would need boxscore API)
                    gameSummaryHomePowerPlays: 0,
                    gameSummaryAwayPowerPlays: 0,
                    gameSummaryHomePowerPlayGoals: 0,
                    gameSummaryAwayPowerPlayGoals: 0,
                    
                    // Game state
                    gameSummaryDetailedState: game.gameState === 'OFF' ? 'Final' : game.gameScheduleState,
                    gameSummaryStatus: game.gameState,
                    gameSummaryPeriod: game.periodDescriptor?.periodType || '-',
                    gameSummaryPeriodRemaining: '20:00',
                    
                    // Links
                    gameSummaryAPILink: game.gameCenterLink || '-',
                    gameSummaryNHLStatsPage: `http://www.nhl.com/scores/htmlreports/20252026/ES02${stringifyGameNumber(getGameNumber(game.id))}.HTM`,
                    
                    // Metadata
                    gameSummaryLastUpdated: new Date().toISOString(),
                    gameSummaryEmptyNetGoals: 0,
                    
                    // NEW FIELDS (for future features)
                    startTimeUTC: game.startTimeUTC,
                    gameState: game.gameState,
                    gameScheduleState: game.gameScheduleState
                };
                
                library.push(gameSummary);
            }
        }
    }
    
    // Sort by date
    library.sort((a, b) => new Date(a.gameSummaryDate) - new Date(b.gameSummaryDate));
    
    return library;
}

function organizeByTeam(gameLibrary) {
    const byTeam = {};
    
    // Initialize all teams
    for (const team of NHL_TEAMS) {
        byTeam[team] = {};
    }
    
    // Organize games by team
    for (const game of gameLibrary) {
        const homeTeam = game.gameSummaryHomeTeamShort;
        const awayTeam = game.gameSummaryAwayTeamShort;
        const gameDate = new Date(game.gameSummaryDate).toDateString();
        
        // Add to home team schedule
        if (NHL_TEAMS.includes(homeTeam)) {
            const homeScore = game.gameSummaryHomeScore;
            const awayScore = game.gameSummaryAwayScore;
            const teamResult = game.gameSummaryDetailedState === 'Final' 
                ? (homeScore > awayScore ? 'W' : 'L')
                : '';
            
            // Score format: Always show higher score first (hockey convention)
            // Win: home-away (home scored more), Loss: away-home (away scored more)
            const scoreResult = game.gameSummaryDetailedState === 'Final' 
                ? (homeScore > awayScore ? `${homeScore}-${awayScore}` : `${awayScore}-${homeScore}`)
                : '';
            
            byTeam[homeTeam][gameDate] = {
                hometeam: homeTeam,
                awayteam: awayTeam,
                gamedate: gameDate,
                gamenumber: game.gameSummaryGameNumber,
                result: game.gameSummaryDetailedState,
                periodResult: game.gameSummaryPeriod,
                scoreResult: scoreResult,
                teamResult: teamResult,
                goalsFor: homeScore,
                goalsAgainst: awayScore,
                
                // NEW FIELDS
                startTimeUTC: game.startTimeUTC,
                gameState: game.gameState
            };
        }
        
        // Add to away team schedule
        if (NHL_TEAMS.includes(awayTeam)) {
            const homeScore = game.gameSummaryHomeScore;
            const awayScore = game.gameSummaryAwayScore;
            const teamResult = game.gameSummaryDetailedState === 'Final'
                ? (awayScore > homeScore ? 'W' : 'L')
                : '';
            
            // Score format: Always show higher score first (hockey convention)
            // Win: away-home (away scored more), Loss: home-away (home scored more)
            const scoreResult = game.gameSummaryDetailedState === 'Final'
                ? (awayScore > homeScore ? `${awayScore}-${homeScore}` : `${homeScore}-${awayScore}`)
                : '';
            
            byTeam[awayTeam][gameDate] = {
                hometeam: homeTeam,
                awayteam: awayTeam,
                gamedate: gameDate,
                gamenumber: game.gameSummaryGameNumber,
                result: game.gameSummaryDetailedState,
                periodResult: game.gameSummaryPeriod,
                scoreResult: scoreResult,
                teamResult: teamResult,
                goalsFor: awayScore,
                goalsAgainst: homeScore,
                
                // NEW FIELDS
                startTimeUTC: game.startTimeUTC,
                gameState: game.gameState
            };
        }
    }
    
    return byTeam;
}

function organizeByWeek(scheduleByTeam) {
    const MS_IN_DAY = 86400000;
    const totalWeeks = Math.trunc((SEASON_END - FIRST_MONDAY) / (7 * MS_IN_DAY));
    
    const byWeek = {};
    
    // Initialize all weeks with all teams
    for (let week = 0; week <= totalWeeks; week++) {
        byWeek[week] = {};
        for (const team of NHL_TEAMS) {
            byWeek[week][team] = [];
        }
    }
    
    // Organize games by week
    for (const team of NHL_TEAMS) {
        const teamSchedule = scheduleByTeam[team];
        
        for (const dateKey in teamSchedule) {
            const gameDate = new Date(dateKey);
            const weekNumber = Math.trunc((gameDate - FIRST_MONDAY) / (7 * MS_IN_DAY));
            
            if (weekNumber >= 0 && weekNumber <= totalWeeks) {
                byWeek[weekNumber][team].push(teamSchedule[dateKey]);
            }
        }
    }
    
    return byWeek;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function getGameNumber(gameId) {
    // Game ID format: 2025020001 -> game number 0001
    return parseInt(gameId.toString().substring(6));
}

function stringifyGameNumber(gameNumber) {
    if (gameNumber < 10) return '000' + gameNumber;
    if (gameNumber < 100) return '00' + gameNumber;
    if (gameNumber < 1000) return '0' + gameNumber;
    return gameNumber.toString();
}

function saveDataFile(filename, data) {
    const filepath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`   ✅ Saved: ${filename}`);
}

// =============================================================================
// RUN
// =============================================================================

main();

