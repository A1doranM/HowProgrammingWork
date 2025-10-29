type Request = { amount: number };

abstract class MoneyTransfer {
  public process(request: Request): void {
    this.validateAccounts(request);
    this.authorizeTransfer(request);
    this.transferFunds(request);
    this.notifyParties(request);
  }

  protected validateAccounts(request: Request): void {
    console.log('Validating sender and receiver accounts...');
  }

  protected notifyParties(request: Request): void {
    console.log('Notifying sender and receiver of the transaction...');
  }

  protected abstract authorizeTransfer(request: Request): void;
  protected abstract transferFunds(request: Request): void;
}

class DomesticTransfer extends MoneyTransfer {
  protected authorizeTransfer(request: Request): void {
    console.log('Authorizing domestic transfer...');
  }

  protected transferFunds(request: Request): void {
    console.log('Domestic transfer...');
  }
}

class InternationalTransfer extends MoneyTransfer {
  protected authorizeTransfer(request: Request): void {
    console.log('Authorizing international transfer...');
  }

  protected transferFunds(request: Request): void {
    console.log('International transfer with currency conversion...');
  }
}

// Usage

console.log('--- DomesticTransfer ---');
const domesticTransfer = new DomesticTransfer();
domesticTransfer.process({ amount: 100 });

console.log('--- InternationalTransfer ---');
const internationalTransfer = new InternationalTransfer();
internationalTransfer.process({ amount: 100 });
