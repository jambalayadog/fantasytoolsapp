var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var { exec } = require('child_process');

// Serve the admin page
router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

// Get current status and metadata
router.get('/api/status', function(req, res, next) {
  try {
    // Read metadata
    const metadataPath = path.join(__dirname, '../files/new/_metadata.json');
    let metadata = {};
    if (fs.existsSync(metadataPath)) {
      metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    }
    
    // Read scheduler config
    const configPath = path.join(__dirname, '../config/scheduler-config.json');
    let schedulerConfig = { enabled: false, interval: 30 };
    if (fs.existsSync(configPath)) {
      schedulerConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    
    // Read logs (if exists)
    const logsPath = path.join(__dirname, '../logs/update-history.json');
    let logs = [];
    if (fs.existsSync(logsPath)) {
      logs = JSON.parse(fs.readFileSync(logsPath, 'utf8'));
      logs = logs.slice(-10); // Last 10 entries
    }
    
    res.json({
      metadata,
      scheduler: schedulerConfig,
      logs
    });
  } catch (error) {
    console.error('Error reading status:', error);
    res.status(500).json({ error: 'Failed to read status' });
  }
});

// Run full backfill
router.post('/api/backfill', function(req, res, next) {
  const scriptPath = path.join(__dirname, '../scripts/updateHockeyData.js');
  
  exec(`node "${scriptPath}" backfill`, (error, stdout, stderr) => {
    if (error) {
      console.error('Backfill error:', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message,
        output: stderr 
      });
    }
    
    // Log the update
    logUpdate('backfill', stdout);
    
    res.json({ 
      success: true, 
      message: 'Backfill completed successfully',
      output: stdout 
    });
  });
});

// Run update now
router.post('/api/update', function(req, res, next) {
  const scriptPath = path.join(__dirname, '../scripts/updateHockeyData.js');
  
  exec(`node "${scriptPath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error('Update error:', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message,
        output: stderr 
      });
    }
    
    // Log the update
    logUpdate('manual', stdout);
    
    res.json({ 
      success: true, 
      message: 'Update completed successfully',
      output: stdout 
    });
  });
});

// Run update week (current week only)
router.post('/api/update-week', function(req, res, next) {
  const scriptPath = path.join(__dirname, '../scripts/updateHockeyData.js');
  
  exec(`node "${scriptPath}" current`, (error, stdout, stderr) => {
    if (error) {
      console.error('Update week error:', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message,
        output: stderr 
      });
    }
    
    // Log the update
    logUpdate('week', stdout);
    
    res.json({ 
      success: true, 
      message: 'Week update completed successfully',
      output: stdout 
    });
  });
});

// Update scheduler settings
router.post('/api/scheduler/config', function(req, res, next) {
  try {
    const { enabled, interval, smartMode } = req.body;
    const configPath = path.join(__dirname, '../config/scheduler-config.json');
    
    // Read current config
    let config = {};
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    
    // Update config
    if (enabled !== undefined) config.enabled = enabled;
    if (interval !== undefined) config.interval = interval;
    if (smartMode !== undefined) config.smartMode = smartMode;
    
    // Save config
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    
    // TODO: Trigger scheduler reconfiguration
    // This will be implemented when we add the actual scheduler module
    
    res.json({ 
      success: true, 
      message: 'Scheduler configuration updated',
      config 
    });
  } catch (error) {
    console.error('Error updating scheduler config:', error);
    res.status(500).json({ error: 'Failed to update scheduler configuration' });
  }
});

// Helper function to log updates
function logUpdate(type, output) {
  try {
    const logsDir = path.join(__dirname, '../logs');
    const logsPath = path.join(logsDir, 'update-history.json');
    
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    // Read existing logs
    let logs = [];
    if (fs.existsSync(logsPath)) {
      logs = JSON.parse(fs.readFileSync(logsPath, 'utf8'));
    }
    
    // Extract fetched game count from output (not total library size)
    // Look for "✅ Processed X games" which shows games in the update window
    const processedMatch = output.match(/✅ Processed (\d+) games/);
    const gamesCount = processedMatch ? parseInt(processedMatch[1]) : 0;
    
    // Add new log entry
    logs.push({
      timestamp: new Date().toISOString(),
      type: type,
      gamesProcessed: gamesCount,
      success: true
    });
    
    // Keep only last 100 entries
    if (logs.length > 100) {
      logs = logs.slice(-100);
    }
    
    // Save logs
    fs.writeFileSync(logsPath, JSON.stringify(logs, null, 2));
  } catch (error) {
    console.error('Error logging update:', error);
  }
}

module.exports = router;

