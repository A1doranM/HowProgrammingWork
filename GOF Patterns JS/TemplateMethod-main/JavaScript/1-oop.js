'use strict';

class MoneyTransfer {
  process(request) {
    this.validateAccounts(request);
    this.authorizeTransfer(request);
    this.transferFunds(request);
    this.notifyParties(request);
  }

  validateAccounts(request) {
    console.log('Validating sender and receiver accounts...');
  }

  notifyParties(request) {
    console.log('Notifying sender and receiver of the transaction...');
  }

  authorizeTransfer(request) {
    throw new Error('Authorize method must be implemented');
  }

  transferFunds(request) {
    throw new Error('TransferFunds method must be implemented');
  }
}

class DomesticTransfer extends MoneyTransfer {
  authorizeTransfer(request) {
    console.log('Authorizing domestic transfer...');
  }

  transferFunds(request) {
    console.log('Domestic transfer...');
  }
}

class InternationalTransfer extends MoneyTransfer {
  authorizeTransfer(request) {
    console.log('Authorizing international transfer...');
  }

  transferFunds(request) {
    console.log('International transfer with currency conversion...');
  }
}

// Usage

console.log('--- Abstract: MoneyTransfer ---');
try {
  const moneyTransfer = new MoneyTransfer();
  moneyTransfer.process({ amount: 100 });
} catch (error) {
  console.log(error);
}

console.log('--- DomesticTransfer ---');
const domesticTransfer = new DomesticTransfer();
domesticTransfer.process({ amount: 100 });

console.log('--- InternationalTransfer ---');
const internationalTransfer = new InternationalTransfer();
internationalTransfer.process({ amount: 100 });
