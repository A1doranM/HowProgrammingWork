'use strict';

const AGENTS = new Map(); // Notification agent strategies

const registerAgent = (name, behaviour) => {
  if (typeof name !== 'string') {
    throw new Error('Agent name expected to be string');
  }
  const { notify, multicast } = behaviour;
  if (typeof notify !== 'function') {
    throw new Error('Key "notify" expected to be function');
  }
  if (typeof multicast !== 'function') {
    throw new Error('Key "multicast" expected to be function');
  }
  AGENTS.set(name, { notify, multicast });
};

const getAgent = (name, action) => {
  const behaviour = AGENTS.get(name);
  if (!behaviour) {
    throw new Error(`Strategy "${name}" is not found`);
  }
  const handler = behaviour[action];
  if (!handler) {
    throw new Error(`Action "${action}" for strategy "${name}" is not found`);
  }
  return handler;
};

// Usage

registerAgent('email', {
  notify: (to, message) => {
    console.log(`Sending "email" notification to <${to}>`);
    console.log(`message length: ${message.length}`);
  },
  multicast: (message) => {
    console.log(`Sending "email" notification to all`);
    console.log(`message length: ${message.length}`);
  },
});

registerAgent('sms', {
  notify: (to, message) => {
    console.log(`Sending "sms" notification to <${to}>`);
    console.log(`message length: ${message.length}`);
  },
  multicast: (message) => {
    console.log(`Sending "sms" notification to all`);
    console.log(`message length: ${message.length}`);
  },
});

const notify = getAgent('sms', 'notify');
notify('+380501234567', 'Hello world');
