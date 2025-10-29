// Simulated DB

const ACCOUNTS: Record<string, { id: string; balance: number }> = {
  A: { id: 'A', balance: 1000 },
  B: { id: 'B', balance: 500 }
};

// Transaction script (procedural service)

const transferFunds = async (fromId: string, toId: string, amount: number) => {
  const from = ACCOUNTS[fromId];
  const to = ACCOUNTS[toId];

  if (!from || !to) throw new Error('Account not found');
  if (from === to) throw new Error('Cannot transfer to the same account');
  if (from.balance < amount) throw new Error('Insufficient funds');

  from.balance -= amount;
  to.balance += amount;
};

// Usage

const main = async () => {
  console.log(ACCOUNTS);
  await transferFunds('A', 'B', 200);
  console.log(ACCOUNTS);
};

main();
