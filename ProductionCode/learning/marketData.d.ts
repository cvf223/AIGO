export interface MarketDataCapabilities {
    getPriceData: (symbol: string) => Promise<any>;
    getMarketTrends: () => Promise<any>;
    getVolumeAnalysis: (symbol: string) => Promise<any>;
    getTechnicalIndicators: (symbol: string) => Promise<any>;
}

declare const marketDataCapabilities: MarketDataCapabilities;
export = marketDataCapabilities; 