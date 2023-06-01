"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAnalytics = void 0;
const block_1 = require("./block");
const trade_1 = require("@pintswap/sdk/lib/trade");
const logger_1 = require("./logger");
function runAnalytics(providerOrSigner, startBlock) {
    return __awaiter(this, void 0, void 0, function* () {
        const unsubscribe = (0, block_1.subscribeTransactions)(providerOrSigner, startBlock, (transactions) => {
            const parsed = transactions.map((v) => (0, trade_1.parseTrade)(v)).filter(Boolean);
            if (parsed.length)
                parsed.forEach((v) => logger_1.logger.info(v));
        });
        return unsubscribe;
    });
}
exports.runAnalytics = runAnalytics;
//# sourceMappingURL=analytics.js.map