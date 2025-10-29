'use strict';

const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);

const branch = (cases) => (request) => {
  const key = Object.keys(cases)[0];
  const val = request[key];
  const way = cases[key][val];
  if (!way) throw new Error('No matching way found');
  return way(request);
};

const validateAccounts = (request) => {
  console.log('Validating sender and receiver accounts...');
  return { ...request };
};

const notifyParties = (request) => {
  console.log('Notifying sender and receiver of the transaction...');
  return { ...request };
};

const authorizeTransferDomestic = (request) => {
  console.log('Authorizing domestic transfer...');
  return { ...request };
};

const transferFundsDomestic = (request) => {
  console.log('Domestic transfer...');
  return { ...request };
};

const authorizeTransferInternational = (request) => {
  console.log('Authorizing international transfer...');
  return { ...request };
};

const transferFundsInternational = (request) => {
  console.log('International transfer with currency conversion...');
  return { ...request };
};

// Usage

const moneyTransfer = pipe(
  validateAccounts,
  notifyParties,
  branch({
    kind: {
      domestic: pipe(
        authorizeTransferDomestic,
        transferFundsDomestic,
      ),
      international: pipe(
        authorizeTransferInternational,
        transferFundsInternational,
      ),
    },
  }),
);

console.log('--- Wrong kind ---');
try {
  moneyTransfer({ amount: 100 });
} catch (error) {
  console.log(error);
}

console.log('--- Domestic Workflow ---');
moneyTransfer({ amount: 100, kind: 'domestic' });

console.log('--- International Workflow ---');
moneyTransfer({ amount: 100, kind: 'international' });
