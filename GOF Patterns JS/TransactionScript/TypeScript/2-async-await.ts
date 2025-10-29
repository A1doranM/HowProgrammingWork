// In-memory data

type AccountRecord = {
  id: string;
  isActive: boolean;
};

type BalanceRecord = {
  id: string;
  amount: number;
};

type LimitRecord = {
  id: string;
  dailyLimit: number;
  transferredToday: number;
};

const ACCOUNTS: Record<string, AccountRecord> = {
  A: { id: 'A', isActive: true },
  B: { id: 'B', isActive: true }
};

const BALANCES: Record<string, BalanceRecord> = {
  A: { id: 'A', amount: 1000 },
  B: { id: 'B', amount: 300 }
};

const LIMITS: Record<string, LimitRecord> = {
  A: { id: 'A', dailyLimit: 500, transferredToday: 0 },
  B: { id: 'B', dailyLimit: 1000, transferredToday: 0 }
};

// Data access layer

type GetById = { id: string };

const getAccount = async ({ id }: GetById): Promise<AccountRecord | null> => {
  return ACCOUNTS[id] ? { ...ACCOUNTS[id] } : null;
};

const getBalance = async ({ id }: GetById): Promise<BalanceRecord | null> => {
  return BALANCES[id] ? { ...BALANCES[id] } : null;
};

const getLimit = async ({ id }: GetById): Promise<LimitRecord | null> => {
  return LIMITS[id] ? { ...LIMITS[id] } : null;
};

type SaveBalance = { id: string; amount: number };

const saveBalance = async (params: SaveBalance): Promise<void> => {
  const { id, amount } = params;
  if (!BALANCES[id]) throw new Error('Balance not found to save');
  BALANCES[id] = { id, amount };
};

type SaveLimit = { id: string; transferred: number };

const saveLimit = async (params: SaveLimit): Promise<void> => {
  const { id, transferred } = params;
  if (!LIMITS[id]) throw new Error('Limit not found to update');
  LIMITS[id].transferredToday = transferred;
};

// Transaction Script

type Transfer = { fromId: string; toId: string; amount: number };

const transferFunds = async (transfer: Transfer): Promise<void> => {
  const { fromId, toId, amount } = transfer;
  if (fromId === toId) throw new Error('Same account transfer is invalid');
  if (amount <= 0) throw new Error('Amount must be positive');
  if (!ACCOUNTS[fromId] || !ACCOUNTS[toId]) {
    throw new Error('Invalid account id');
  }

  const [from, to] = await Promise.all([
    getAccount({ id: fromId }),
    getAccount({ id: toId })
  ]);

  if (!from || !to) throw new Error('Account not found');
  if (!from.isActive) throw new Error('Source account is inactive');
  if (!to.isActive) throw new Error('Destination account is inactive');

  const [fromBal, toBal] = await Promise.all([
    getBalance({ id: fromId }),
    getBalance({ id: toId })
  ]);
  if (!fromBal || !toBal) throw new Error('Balance not found');

  const limit = await getLimit({ id: fromId });
  if (!limit) throw new Error('Transfer limit not configured');

  const feeRate = 0.02;
  const fee = Math.ceil(amount * feeRate);
  const total = amount + fee;

  if (fromBal.amount < total) throw new Error('Insufficient funds');
  if (limit.transferredToday + amount > limit.dailyLimit) {
    throw new Error('Daily transfer limit exceeded');
  }
  if (fee > 100) throw new Error('Excessive transaction fee');
  if (fee === 0 && amount < 50) {
    throw new Error('Small transfers must have minimum fee');
  }

  const newFrom = fromBal.amount - total;
  const newTo = toBal.amount + amount;
  const newTransferred = limit.transferredToday + amount;

  await Promise.all([
    saveBalance({ id: fromId, amount: newFrom }),
    saveBalance({ id: toId, amount: newTo }),
    saveLimit({ id: fromId, transferred: newTransferred }),
  ]);
};


// Usage

const main = async () => {
  console.log({ ACCOUNTS });
  console.log({ BALANCES });
  console.log({ LIMITS });
  await transferFunds({ fromId: 'A', toId: 'B', amount: 200 });
  console.log({ BALANCES });
  console.log({ LIMITS });
};

main();
