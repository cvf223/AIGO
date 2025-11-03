export interface FinancialCapabilities {
    profitCalculation: (options: any) => Promise<any>;
    riskAssessment: (options: any) => Promise<any>;
    portfolioAnalysis: (options: any) => Promise<any>;
    arbitrageAnalysis: (options: any) => Promise<any>;
}

declare const financialCapabilities: FinancialCapabilities;
export = financialCapabilities; 