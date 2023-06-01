export declare function valueHexFromBeHex(v: string): string;
export declare function getDunklesForBlockHashes(provider: any, hashes: any): Promise<any[]>;
export declare function getDunklesForBlockHash(provider: any, hash: any): Promise<any[]>;
export declare function getBlockTransactions(provider: any, n: number): Promise<any>;
export declare const UnsubscriberPrototype: any;
export declare function createUnsubscribe(unsubscribe: any): any;
export declare function toProvider(providerOrSigner: any): any;
export declare function subscribeTransactions(providerOrSigner: any, startBlock: any, listener: any): Promise<any>;
