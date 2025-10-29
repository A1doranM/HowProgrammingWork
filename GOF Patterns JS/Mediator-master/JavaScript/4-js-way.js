'use strict';

// Auth service
// can be placed in a separate file and imported here

const auth = (() => {
  const users = new Map();

  const createUser = (login, password, group) => {
    users.set(login, { login, password, group });
  };

  const checkUserPassword = (login, password) => {
    const account = users.get(login);
    if (!account) return false;
    return account.password === password;
  };

  const getUserGroup = (login) => {
    const account = users.get(login);
    if (!account) return null;
    return account.group;
  };

  return { createUser, checkUserPassword, getUserGroup };
})();

// Logger service
// can be placed in a separate file and imported here

class Logger {
  static #COLORS = {
    warn: '\x1b[1;33m',
    error: '\x1b[0;31m',
    info: '\x1b[1;37m',
  };

  static color(level) {
    return Logger.#COLORS[level] || Logger.#COLORS.info;
  }

  constructor() {
    this.log = (level, s) => {
      const date = new Date().toISOString();
      const color = Logger.color(level);
      console.log(color + date + '\t' + s + '\x1b[0m');
    };
  }

  warn(s) {
    this.log('warn', s);
  }

  error(s) {
    this.log('error', s);
  }

  info(s) {
    this.log('info', s);
  }
}

// Mediator

class Security {
  constructor(auth, logger) {
    this.auth = auth;
    this.logger = logger;
  }

  check(login, password) {
    if (!login || !password) {
      this.logger.error('No login or password passed to auth');
      return false;
    }
    const valid = this.auth.checkUserPassword(login, password);
    if (!valid) {
      this.logger.warn(`Password is not valid for ${login}`);
      return false;
    }
    this.logger.info(`User ${login} logged in`);
    return true;
  }
}

// Usage

auth.createUser('marcus', '12345', 'emperors');
const logger = new Logger();
const sec = new Security(auth, logger);
console.dir(sec);

sec.check('marcus');
sec.check('marcus', 'qwerty');
sec.check('marcus', '12345');
