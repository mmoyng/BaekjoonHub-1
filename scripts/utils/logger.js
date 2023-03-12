
class LogLevel{
  static DEBUG = 0;
  static INFO = 1;
  static WARN = 2;
  static ERROR = 3;
  static NONE = 4;
}

class Logger {

  constructor(logLevel=LogLevel.INFO) {
    this.logLevel = logLevel;
  }

  debug(...args) {
    if (this.logLevel==LogLevel.DEBUG) console.log(args);
  }

  info(...args) {
    if (this.logLevel==LogLevel.INFO) console.log(args);
  }

  error(...args) {
    console.log(error)
  }
}

const log = new Logger(true);

export { log };