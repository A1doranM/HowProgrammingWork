'use strict';

const COLORS = {
  warning: '\x1b[1;33m',
  error: '\x1b[0;31m',
  info: '\x1b[1;37m',
};

const logger = (level = 'info') => {
  const color = COLORS[level];
  return (message) => {
    const date = new Date().toISOString();
    console.log(`${color}${date}\t${message}`);
  };
};

/*
const logger = (level = 'info', color = COLORS[level]) => (message) => {
  const date = new Date().toISOString();
  console.log(`${color}${date}\t${message}`);
};
*/

const warning = logger('warning');
warning('Hello warning');

const error = logger('error');
error('Hello error');

const info = logger('info');
info('Hello info');
