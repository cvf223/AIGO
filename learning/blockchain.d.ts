export interface BlockchainCapabilities {
    gasOptimization: (options: any) => Promise<any>;
    contractAnalysis: (address: string) => Promise<any>;
    transactionAnalysis: (txHash: string) => Promise<any>;
    mevDetection: (options: any) => Promise<any>;
}

declare const blockchainCapabilities: BlockchainCapabilities;
export = blockchainCapabilities; 