import type { DailyEntry } from "../../../domain/daily/daily.model";

export type CashStatus = "missing" | "check" | "ok";

const n = (value: number | null | undefined): number => value ?? 0;

const isFilled = (value: number | null | undefined): boolean =>
  value !== null && value !== undefined && Number.isFinite(value);

export const DENOMINATIONS = {
  five: 5,
  ten: 10,
  twenty: 20,
  fifty: 50,
  hundred: 100,
  usdRate: 1.15,
} as const;

export const computeBillDropTotal = (counts: {
  five?: number | null;
  ten?: number | null;
  twenty?: number | null;
  fifty?: number | null;
  hundred?: number | null;
}): number => {
  return (
    n(counts.five) * DENOMINATIONS.five +
    n(counts.ten) * DENOMINATIONS.ten +
    n(counts.twenty) * DENOMINATIONS.twenty +
    n(counts.fifty) * DENOMINATIONS.fifty +
    n(counts.hundred) * DENOMINATIONS.hundred
  );
};

export const computeUsdDropTotal = (
  usdAmount: number | null | undefined
): number => {
  return n(usdAmount) * DENOMINATIONS.usdRate;
};

/*
---------------------------------------
Morning
---------------------------------------
*/

export const computeCashMorningDrop1Total = (entry: DailyEntry): number => {
  return computeBillDropTotal({
    five: entry.cashMorningDrop1_5,
    ten: entry.cashMorningDrop1_10,
    twenty: entry.cashMorningDrop1_20,
    fifty: entry.cashMorningDrop1_50,
    hundred: entry.cashMorningDrop1_100,
  });
};

export const computeCashMorningDrop2Total = (entry: DailyEntry): number => {
  return computeBillDropTotal({
    five: entry.cashMorningDrop2_5,
    ten: entry.cashMorningDrop2_10,
    twenty: entry.cashMorningDrop2_20,
    fifty: entry.cashMorningDrop2_50,
    hundred: entry.cashMorningDrop2_100,
  });
};

export const computeCashMorningUsdDropTotal = (entry: DailyEntry): number => {
  return computeUsdDropTotal(entry.cashMorningUsDrop);
};

export const computeCashMorningSafeDropBills = (entry: DailyEntry): number => {
  return (
    computeCashMorningDrop1Total(entry) +
    computeCashMorningDrop2Total(entry) +
    computeCashMorningUsdDropTotal(entry)
  );
};

export const computeCashMorningSafeDropCoins = (entry: DailyEntry): number => {
  return (
    n(entry.cashMorningCoinsDrop1) +
    n(entry.cashMorningCoinsDrop2) +
    n(entry.cashMorningCoinsDrop3)
  );
};

/*
Excel logic:
Balance = Safe Drop Bills + Safe Drop Coins + Other + Ending Tray - Begin Tray
*/
export const computeCashMorningBalance = (entry: DailyEntry): number => {
  return (
    computeCashMorningSafeDropBills(entry) +
    computeCashMorningSafeDropCoins(entry) +
    n(entry.cashMorningOther) +
    n(entry.cashMorningEndingTray) -
    n(entry.cashMorningBeginTray)
  );
};

/*
Excel logic:
Over / Short = Balance - Canadian Cash
*/
export const computeCashMorningOverShort = (entry: DailyEntry): number => {
  return computeCashMorningBalance(entry) - n(entry.cashMorningCanadianCash);
};

/*
---------------------------------------
Evening
---------------------------------------
*/

export const computeCashEveningDrop1Total = (entry: DailyEntry): number => {
  return computeBillDropTotal({
    five: entry.cashEveningDrop1_5,
    ten: entry.cashEveningDrop1_10,
    twenty: entry.cashEveningDrop1_20,
    fifty: entry.cashEveningDrop1_50,
    hundred: entry.cashEveningDrop1_100,
  });
};

export const computeCashEveningDrop2Total = (entry: DailyEntry): number => {
  return computeBillDropTotal({
    five: entry.cashEveningDrop2_5,
    ten: entry.cashEveningDrop2_10,
    twenty: entry.cashEveningDrop2_20,
    fifty: entry.cashEveningDrop2_50,
    hundred: entry.cashEveningDrop2_100,
  });
};

export const computeCashEveningUsdDropTotal = (entry: DailyEntry): number => {
  return computeUsdDropTotal(entry.cashEveningUsDrop);
};

export const computeCashEveningSafeDropBills = (entry: DailyEntry): number => {
  return (
    computeCashEveningDrop1Total(entry) +
    computeCashEveningDrop2Total(entry) +
    computeCashEveningUsdDropTotal(entry)
  );
};

export const computeCashEveningSafeDropCoins = (entry: DailyEntry): number => {
  return (
    n(entry.cashEveningCoinsDrop1) +
    n(entry.cashEveningCoinsDrop2) +
    n(entry.cashEveningCoinsDrop3)
  );
};

/*
Excel logic:
Balance = Safe Drop Bills + Safe Drop Coins + Other + Ending Tray - Begin Tray
*/
export const computeCashEveningBalance = (entry: DailyEntry): number => {
  return (
    computeCashEveningSafeDropBills(entry) +
    computeCashEveningSafeDropCoins(entry) +
    n(entry.cashEveningOther) +
    n(entry.cashEveningEndingTray) -
    n(entry.cashEveningBeginTray)
  );
};

/*
Excel logic:
Over / Short = Balance - Canadian Cash
*/
export const computeCashEveningOverShort = (entry: DailyEntry): number => {
  return computeCashEveningBalance(entry) - n(entry.cashEveningCanadianCash);
};

/*
---------------------------------------
Total for day
---------------------------------------
*/

export type CashTotalForDay = {
  beginTray: number;
  safeDropBills: number;
  safeDropCoins: number;
  other: number;
  endingTray: number;
  balance: number;
  canadianCash: number;
  overShort: number;
};

export const computeCashTotalForDay = (entry: DailyEntry): CashTotalForDay => {
  const morningSafeDropBills = computeCashMorningSafeDropBills(entry);
  const eveningSafeDropBills = computeCashEveningSafeDropBills(entry);

  const morningSafeDropCoins = computeCashMorningSafeDropCoins(entry);
  const eveningSafeDropCoins = computeCashEveningSafeDropCoins(entry);

  const morningBalance = computeCashMorningBalance(entry);
  const eveningBalance = computeCashEveningBalance(entry);

  const morningOverShort = computeCashMorningOverShort(entry);
  const eveningOverShort = computeCashEveningOverShort(entry);

  return {
    beginTray: n(entry.cashMorningBeginTray) + n(entry.cashEveningBeginTray),
    safeDropBills: morningSafeDropBills + eveningSafeDropBills,
    safeDropCoins: morningSafeDropCoins + eveningSafeDropCoins,
    other: n(entry.cashMorningOther) + n(entry.cashEveningOther),
    endingTray: n(entry.cashMorningEndingTray) + n(entry.cashEveningEndingTray),
    balance: morningBalance + eveningBalance,
    canadianCash:
      n(entry.cashMorningCanadianCash) + n(entry.cashEveningCanadianCash),
    overShort: morningOverShort + eveningOverShort,
  };
};

/*
Required fields:
- Morning Ending Tray
- Morning Canadian Cash
- Evening Ending Tray
- Evening Canadian Cash

Rules:
- missing => all 4 empty
- check   => at least 1 filled, but not all 4
- ok      => all 4 filled
*/
export const computeCashStatus = (
  entry: DailyEntry | null | undefined
): CashStatus => {
  if (!entry) return "missing";

  const requiredFields = [
    entry.cashMorningEndingTray,
    entry.cashMorningCanadianCash,
    entry.cashEveningEndingTray,
    entry.cashEveningCanadianCash,
  ];

  const filledCount = requiredFields.filter(isFilled).length;

  if (filledCount === 0) {
    return "missing";
  }

  if (filledCount === 4) {
    return "ok";
  }

  return "check";
};