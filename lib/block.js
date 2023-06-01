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
exports.subscribeTransactions = exports.toProvider = exports.createUnsubscribe = exports.UnsubscriberPrototype = exports.getBlockTransactions = exports.getDunklesForBlockHash = exports.getDunklesForBlockHashes = exports.valueHexFromBeHex = void 0;
const ethers_1 = require("ethers");
const events_1 = require("events");
function valueHexFromBeHex(v) {
    if (v.substr(0, 3) === "0x0")
        return "0x" + v.substr(3);
    return v;
}
exports.valueHexFromBeHex = valueHexFromBeHex;
function getDunklesForBlockHashes(provider, hashes) {
    return __awaiter(this, void 0, void 0, function* () {
        let dunkles = [];
        for (const dunkleHash of hashes) {
            dunkles = dunkles.concat(yield getDunklesForBlockHash(provider, dunkleHash));
        }
        return dunkles;
    });
}
exports.getDunklesForBlockHashes = getDunklesForBlockHashes;
function getDunklesForBlockHash(provider, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const dunkleCount = yield provider.send("eth_getUncleCountByBlockHash", [
            hash,
        ]);
        let dunkles = [];
        for (const i of Array(dunkleCount)
            .fill(0)
            .map((_, i) => i)) {
            const dunkle = yield provider.send("eth_getUncleByBlockHashAndIndex", [
                hash,
                valueHexFromBeHex(ethers_1.ethers.toBeHex(ethers_1.ethers.getUint(i))),
                true,
            ]);
            dunkles = dunkles
                .concat(dunkle)
                .concat(yield getDunklesForBlockHashes(provider, dunkle.uncles || []));
        }
        return dunkles;
    });
}
exports.getDunklesForBlockHash = getDunklesForBlockHash;
function getBlockTransactions(provider, n) {
    return __awaiter(this, void 0, void 0, function* () {
        const block = yield provider.send("eth_getBlockByNumber", [
            valueHexFromBeHex(ethers_1.ethers.toBeHex(ethers_1.ethers.getUint(n))),
            true,
        ]);
        if (!block)
            return null;
        const { hash, transactions, uncles } = block;
        const dunkles = yield getDunklesForBlockHashes(provider, uncles);
        return (block.transactions || []).concat(dunkles.map((v) => v.transactions || []));
    });
}
exports.getBlockTransactions = getBlockTransactions;
exports.UnsubscriberPrototype = (function createUnsubscriberPrototype() {
    const proto = Object.create(events_1.EventEmitter.prototype);
    Object.getOwnPropertyNames(Function.prototype).forEach((key) => {
        if (!["caller", "callee", "arguments"].includes(key))
            proto[key] = Function.prototype[key];
    });
    return proto;
})();
function createUnsubscribe(unsubscribe) {
    const fn = () => unsubscribe();
    events_1.EventEmitter.call(fn);
    return Object.setPrototypeOf(fn, exports.UnsubscriberPrototype);
}
exports.createUnsubscribe = createUnsubscribe;
function toProvider(providerOrSigner) {
    if (providerOrSigner.addressPromise &&
        providerOrSigner.getAddress &&
        providerOrSigner.sendTransaction)
        return providerOrSigner.provider;
    return providerOrSigner;
}
exports.toProvider = toProvider;
function subscribeTransactions(providerOrSigner, startBlock = "latest", listener) {
    return __awaiter(this, void 0, void 0, function* () {
        const provider = toProvider(providerOrSigner);
        if (startBlock === "latest")
            startBlock = yield provider.getBlockNumber();
        let interrupt = false;
        let swapMe = () => (interrupt = true);
        const unsubscribe = createUnsubscribe(() => swapMe());
        (() => __awaiter(this, void 0, void 0, function* () {
            while (startBlock < (yield provider.getBlockNumber()) && !interrupt) {
                listener(yield getBlockTransactions(provider, startBlock));
                startBlock++;
            }
            if (!interrupt) {
                const blockListener = (block) => {
                    (() => __awaiter(this, void 0, void 0, function* () {
                        listener(yield getBlockTransactions(provider, block));
                    }))().catch((err) => unsubscribe.emit("error", err));
                };
                provider.on("block", blockListener);
                swapMe = () => provider.removeListener("block", blockListener);
            }
        }))().catch((err) => unsubscribe.emit("error", err));
        return unsubscribe;
    });
}
exports.subscribeTransactions = subscribeTransactions;
//# sourceMappingURL=block.js.map