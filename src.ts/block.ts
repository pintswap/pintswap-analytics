import { ethers } from "ethers";
import { EventEmitter } from "events";

export function valueHexFromBeHex(v: string): string {
  if (v.substr(0, 3) === "0x0") return "0x" + v.substr(3);
  return v;
}

export async function getDunklesForBlockHashes(provider, hashes) {
  let dunkles = [];
  for (const dunkleHash of hashes) {
    dunkles = dunkles.concat(
      await getDunklesForBlockHash(provider, dunkleHash)
    );
  }
  return dunkles;
}
export async function getDunklesForBlockHash(provider, hash) {
  const dunkleCount = await provider.send("eth_getUncleCountByBlockHash", [
    hash,
  ]);
  let dunkles = [];
  for (const i of Array(dunkleCount)
    .fill(0)
    .map((_, i) => i)) {
    const dunkle = await provider.send("eth_getUncleByBlockHashAndIndex", [
      hash,
      valueHexFromBeHex(ethers.toBeHex(ethers.getUint(i))),
      true,
    ]);
    dunkles = dunkles
      .concat(dunkle)
      .concat(await getDunklesForBlockHashes(provider, dunkle.uncles || []));
  }
  return dunkles;
}

export async function getBlockTransactions(provider, n: number) {
  const block = await provider.send("eth_getBlockByNumber", [
    valueHexFromBeHex(ethers.toBeHex(ethers.getUint(n))),
    true,
  ]);
  if (!block) return null;
  const { hash, transactions, uncles } = block;
  const dunkles = await getDunklesForBlockHashes(provider, uncles);
  return (block.transactions || []).concat(
    dunkles.map((v) => v.transactions || [])
  );
}

export const UnsubscriberPrototype = (function createUnsubscriberPrototype() {
  const proto = Object.create(EventEmitter.prototype);
  Object.getOwnPropertyNames(Function.prototype).forEach((key) => {
    if (!["caller", "callee", "arguments"].includes(key))
      proto[key] = Function.prototype[key];
  });
  return proto;
})();

export function createUnsubscribe(unsubscribe) {
  const fn = () => unsubscribe();
  EventEmitter.call(fn);
  return Object.setPrototypeOf(fn, UnsubscriberPrototype);
}

export function toProvider(providerOrSigner: any) {
  if (
    providerOrSigner.addressPromise &&
    providerOrSigner.getAddress &&
    providerOrSigner.sendTransaction
  )
    return providerOrSigner.provider;
  return providerOrSigner;
}

export async function subscribeTransactions(
  providerOrSigner: any,
  startBlock: any = "latest",
  listener: any
) {
  const provider = toProvider(providerOrSigner);
  if (startBlock === "latest") startBlock = await provider.getBlockNumber();
  let interrupt = false;
  let swapMe = () => (interrupt = true);
  const unsubscribe = createUnsubscribe(() => swapMe());
  (async () => {
    while (startBlock < (await provider.getBlockNumber()) && !interrupt) {
      listener(await getBlockTransactions(provider, startBlock));
      startBlock++;
    }
    if (!interrupt) {
      const blockListener = (block) => {
        (async () => {
          listener(await getBlockTransactions(provider, block));
        })().catch((err) => unsubscribe.emit("error", err));
      };
      provider.on("block", blockListener);
      swapMe = () => provider.removeListener("block", blockListener);
    }
  })().catch((err) => unsubscribe.emit("error", err));
  return unsubscribe;
}
