'use strict';

const workflow =
  (defaults = {}) =>
  (steps = {}) =>
  (target) => {
    const names = Object.keys(defaults);
    const flow = Object.values(defaults);
    for (let i = 0; i < names.length; i++) {
      const name = names[i];
      const step = steps[name] || flow[i];
      step(target);
    }
    return target;
  };

const validateAccounts = (request) => {
  console.log('Validating sender and receiver accounts...');
};

const notifyParties = (request) => {
  console.log('Notifying sender and receiver of the transaction...');
};

const authorizeTransfer = (request) => {
  throw new Error('Authorize method must be implemented');
};

const transferFunds = (request) => {
  throw new Error('TransferFunds method must be implemented');
};

const authorizeTransferDomestic = (request) => {
  console.log('Authorizing domestic transfer...');
};

const transferFundsDomestic = (request) => {
  console.log('Domestic transfer...');
};

const authorizeTransferInternational = (request) => {
  console.log('Authorizing international transfer...');
};

const transferFundsInternational = (request) => {
  console.log('International transfer with currency conversion...');
};

// Usage

const moneyTransfer = workflow({
  validateAccounts,
  notifyParties,
  authorizeTransfer,
  transferFunds,
});

const defaultWorkflow = moneyTransfer();

const domesticWorkflow = moneyTransfer({
  authorizeTransfer: authorizeTransferDomestic,
  transferFunds: transferFundsDomestic,
});

const internationalWorkflow = moneyTransfer({
  authorizeTransfer: authorizeTransferInternational,
  transferFunds: transferFundsInternational,
});

console.log('--- Default ---');
try {
  defaultWorkflow({ amount: 100 });
} catch (error) {
  console.log(error);
}

console.log('--- Domestic Workflow ---');
domesticWorkflow({ amount: 100 });

console.log('--- International Workflow ---');
internationalWorkflow({ amount: 100 });
