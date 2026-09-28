export type AccountType = "Prop" | "Personal";

export type AccountStatus =
  | "ACTIVE"
  | "EVALUATION"
  | "FUNDED"
  | "PAUSED"
  | "PASSED"
  | "FAILED";

export interface TradingAccount {
  id: string;
  name: string;
  firm: string;
  type: AccountType;

  startingBalance: number;
  currentBalance: number;

  dailyProfitLoss: number;
  totalProfitLoss: number;

  dailyLossLimit: number;
  maxDrawdown: number;
  currentDrawdown: number;

  riskPerTrade: number;
  profitTarget: number;

  profitSplit: number;

  status: AccountStatus;
  currency: string;
}

export const accounts: TradingAccount[] = [
  {
    id: "maven-2k",
    name: "Maven $2K",
    firm: "Maven Trading",
    type: "Prop",

    startingBalance: 2000,
    currentBalance: 2084.2,

    dailyProfitLoss: 84.2,
    totalProfitLoss: 84.2,

    dailyLossLimit: 100,
    maxDrawdown: 200,
    currentDrawdown: 0,

    riskPerTrade: 1,
    profitTarget: 160,

    profitSplit: 90,

    status: "ACTIVE",
    currency: "USD",
  },

  {
    id: "personal-1k",
    name: "Personal $1K",
    firm: "Personal",
    type: "Personal",

    startingBalance: 1000,
    currentBalance: 1126.4,

    dailyProfitLoss: 126.4,
    totalProfitLoss: 126.4,

    dailyLossLimit: 50,
    maxDrawdown: 100,
    currentDrawdown: 0,

    riskPerTrade: 1,
    profitTarget: 0,

    profitSplit: 100,

    status: "ACTIVE",
    currency: "USD",
  },

  {
    id: "evaluation-5k",
    name: "Evaluation $5K",
    firm: "Prop Firm",
    type: "Prop",

    startingBalance: 5000,
    currentBalance: 4967.9,

    dailyProfitLoss: -32.1,
    totalProfitLoss: -32.1,

    dailyLossLimit: 250,
    maxDrawdown: 400,
    currentDrawdown: 32.1,

    riskPerTrade: 1,
    profitTarget: 400,

    profitSplit: 90,

    status: "EVALUATION",
    currency: "USD",
  },
];


export const accountAliases: Record<string, string> = {
  "Prop Firm — $5,000": "evaluation-5k",
  "Prop Firm - $5,000": "evaluation-5k",
  "Prop Firm $5,000": "evaluation-5k",
  "Evaluation $5K": "evaluation-5k",

  "Maven — $2,000": "maven-2k",
  "Maven - $2,000": "maven-2k",
  "Maven $2K": "maven-2k",

  "Personal Account": "personal-1k",
  "Personal — $1,000": "personal-1k",
  "Personal - $1,000": "personal-1k",
  "Personal $1K": "personal-1k"
};

export function resolveAccountId(
  storedAccountId: string
): string {
  const directMatch = accounts.find(
    (account) => account.id === storedAccountId
  );

  if (directMatch) {
    return directMatch.id;
  }

  const nameMatch = accounts.find(
    (account) => account.name === storedAccountId
  );

  if (nameMatch) {
    return nameMatch.id;
  }

  return accountAliases[storedAccountId] ?? storedAccountId;
}
