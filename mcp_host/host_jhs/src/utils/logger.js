// src/utils/logger.js
class Logger {
    constructor() {
      this.level = process.env.LOG_LEVEL || 'info';
      this.levels = {
        error: 0,
        warn: 1,
        info: 2,
        debug: 3
      };
    }
    
    shouldLog(level) {
      return this.levels[level] <= this.levels[this.level];
    }
    
    formatMessage(level, message) {
      const timestamp = new Date().toISOString();
      return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    }
    
    log(level, message) {
      if (!this.shouldLog(level)) return;
      
      const formatted = this.formatMessage(level, message);
      
      switch (level) {
        case 'error':
          console.error(formatted);
          break;
        case 'warn':
          console.warn(formatted);
          break;
        case 'info':
          console.info(formatted);
          break;
        case 'debug':
          console.debug(formatted);
          break;
      }
    }
    
    error(message) {
      this.log('error', message);
    }
    
    warn(message) {
      this.log('warn', message);
    }
    
    info(message) {
      this.log('info', message);
    }
    
    debug(message) {
      this.log('debug', message);
    }
  }
  
  export const logger = new Logger();
  export default logger;