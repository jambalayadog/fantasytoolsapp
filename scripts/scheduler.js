const cron = require('node-cron');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Paths
const CONFIG_PATH = path.join(__dirname, '../config/scheduler-config.json');
const DATA_PATH = path.join(__dirname, '../files/03_NHLWeeklySchedules.json');
const LOGS_DIR = path.join(__dirname, '../logs');
const LOGS_PATH = path.join(LOGS_DIR, 'update-history.json');

// State
let currentSchedule = null;
let lastDailyCheck = null;

// =============================================================================
// SCHEDULER CORE
// =============================================================================

function start() {
    console.log('🏒 NHL Data Scheduler starting...');
    
    // Ensure logs directory exists
    if (!fs.existsSync(LOGS_DIR)) {
        fs.mkdirSync(LOGS_DIR, { recursive: true });
    }
    
    // Load config and start scheduler
    const config = loadConfig();
    if (config.enabled) {
        scheduleUpdates(config);
        console.log(`   ✅ Scheduler enabled (${config.interval} min intervals)`);
    } else {
        console.log(`   ℹ️  Scheduler disabled (can be enabled via /admin)`);
    }
    
    // Watch config file for changes
    watchConfig();
}

function stop() {
    if (currentSchedule) {
        currentSchedule.stop();
        currentSchedule = null;
        console.log('🏒 Scheduler stopped');
    }
}

// =============================================================================
// CONFIG MANAGEMENT
// =============================================================================

function loadConfig() {
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
        }
    } catch (error) {
        console.error('Error loading scheduler config:', error);
    }
    
    // Default config
    return {
        enabled: false,
        interval: 60,
        smartMode: true,
        liveGameInterval: 5,
        pregameWindow: 30
    };
}

function saveConfig(config) {
    try {
        // Ensure config directory exists
        const configDir = path.dirname(CONFIG_PATH);
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
        }
        
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    } catch (error) {
        console.error('Error saving scheduler config:', error);
    }
}

function watchConfig() {
    // Watch for config changes and restart scheduler
    // Only watch if config file exists
    if (!fs.existsSync(CONFIG_PATH)) {
        console.log('⚠️ Scheduler config not found, using defaults');
        return;
    }
    
    fs.watch(CONFIG_PATH, (eventType) => {
        if (eventType === 'change') {
            console.log('🔄 Config changed, reloading scheduler...');
            const config = loadConfig();
            
            if (config.enabled) {
                scheduleUpdates(config);
            } else {
                stop();
            }
        }
    });
}

// =============================================================================
// SCHEDULING LOGIC
// =============================================================================

function scheduleUpdates(config) {
    // Stop existing schedule
    if (currentSchedule) {
        currentSchedule.stop();
    }
    
    let interval = config.interval;
    
    // Smart mode: Check for live/upcoming games and adjust interval
    if (config.smartMode) {
        const hasActiveGames = checkForUpcomingOrLiveGames(config);
        if (hasActiveGames) {
            interval = config.liveGameInterval || 5; // Use configured fast interval
            console.log(`   🎮 Active/upcoming games detected! Using ${interval} min interval`);
        } else {
            console.log(`   😴 No active games. Using ${interval} min interval`);
        }
    }
    
    // Convert minutes to cron format
    const cronExpression = `*/${interval} * * * *`;
    
    // Create new schedule
    currentSchedule = cron.schedule(cronExpression, () => {
        runUpdate(config);
    });
    
    console.log(`   ⏰ Next update in ${interval} minutes`);
}

// =============================================================================
// UPDATE EXECUTION
// =============================================================================

function runUpdate(config) {
    const now = new Date();
    const today = now.toISOString().substring(0, 10);
    
    // Always use current week mode (1 week only)
    const mode = 'current';
    
    // Track first run of day for logging purposes
    if (!lastDailyCheck || lastDailyCheck !== today) {
        lastDailyCheck = today;
        console.log('📆 First run of the day - running CURRENT week update');
    } else {
        console.log('⚡ Running CURRENT week update');
    }
    
    // Run the update script
    const scriptPath = path.join(__dirname, 'updateHockeyData.js');
    const command = `node "${scriptPath}" ${mode}`;
    
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error('❌ Update failed:', error.message);
            logUpdate(mode, false, 0, error.message);
            return;
        }
        
        if (stderr && !stderr.includes('DeprecationWarning')) {
            console.error('⚠️  Update warnings:', stderr);
        }
        
        // Extract fetched game count from output (not total library size)
        const processedMatch = stdout.match(/✅ Processed (\d+) games/);
        const gamesCount = processedMatch ? parseInt(processedMatch[1]) : 0;
        
        console.log('✅ Update completed successfully');
        logUpdate(mode, true, gamesCount);
        
        // Re-check smart mode after update (games may have finished)
        if (config.smartMode) {
            const newConfig = loadConfig();
            scheduleUpdates(newConfig);
        }
    });
}

// =============================================================================
// LIVE/UPCOMING GAME DETECTION
// =============================================================================

function checkForUpcomingOrLiveGames(config) {
    try {
        if (!fs.existsSync(DATA_PATH)) {
            return false;
        }
        
        const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
        const now = new Date();
        const pregameWindowMs = (config.pregameWindow || 30) * 60 * 1000; // Convert to milliseconds
        
        let liveGames = [];
        let upcomingGames = [];
        
        // Check all weeks for today's and upcoming games
        for (const week in data) {
            for (const team in data[week]) {
                const games = data[week][team];
                
                for (const game of games) {
                    const gameState = game.gameState;
                    
                    // Check for currently LIVE games
                    if (gameState === 'LIVE' || gameState === 'CRIT') {
                        liveGames.push(`${game.awayteam} @ ${game.hometeam}`);
                    }
                    
                    // Check for upcoming games (FUT state)
                    if (gameState === 'FUT' && game.startTimeUTC) {
                        const startTime = new Date(game.startTimeUTC);
                        const timeUntilStart = startTime - now;
                        
                        // Game starts within the pregame window
                        if (timeUntilStart > 0 && timeUntilStart <= pregameWindowMs) {
                            const minutesUntil = Math.floor(timeUntilStart / 60000);
                            upcomingGames.push(`${game.awayteam} @ ${game.hometeam} (in ${minutesUntil}m)`);
                        }
                    }
                }
            }
        }
        
        // Log findings
        if (liveGames.length > 0) {
            console.log(`   🎮 ${liveGames.length} live game(s): ${liveGames.join(', ')}`);
        }
        if (upcomingGames.length > 0) {
            console.log(`   ⏰ ${upcomingGames.length} upcoming game(s): ${upcomingGames.join(', ')}`);
        }
        
        return liveGames.length > 0 || upcomingGames.length > 0;
    } catch (error) {
        console.error('Error checking for active games:', error.message);
        return false;
    }
}

// =============================================================================
// LOGGING
// =============================================================================

function logUpdate(type, success, gamesProcessed, error = null) {
    try {
        let logs = [];
        if (fs.existsSync(LOGS_PATH)) {
            logs = JSON.parse(fs.readFileSync(LOGS_PATH, 'utf8'));
        }
        
        logs.push({
            timestamp: new Date().toISOString(),
            type: type,
            gamesProcessed: gamesProcessed,
            success: success,
            error: error
        });
        
        // Keep only last 100 entries
        if (logs.length > 100) {
            logs = logs.slice(-100);
        }
        
        fs.writeFileSync(LOGS_PATH, JSON.stringify(logs, null, 2));
    } catch (error) {
        console.error('Error logging update:', error.message);
    }
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
    start,
    stop,
    loadConfig,
    saveConfig,
    runUpdate
};

