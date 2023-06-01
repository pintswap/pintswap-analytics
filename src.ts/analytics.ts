import { subscribeTransactions } from "./block";
import { parseTrade } from "@pintswap/sdk/lib/trade";

import { logger } from "./logger";

export async function runAnalytics(providerOrSigner: any, startBlock: any) {
  const unsubscribe = subscribeTransactions(
    providerOrSigner,
    startBlock,
    (transactions) => {
      const parsed = transactions.map((v) => parseTrade(v)).filter(Boolean);
      if (parsed.length) parsed.forEach((v) => logger.info(v));
    }
  );
  return unsubscribe;
}
