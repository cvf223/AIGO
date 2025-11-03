# Top 50 Crypto/DeFi World Model Factors for AI Analysis

## Price & Market Structure (1-12)

1. **Price Action & Technical Patterns** - Candlestick patterns, support/resistance, trend lines
1. **Volume Analysis** - Trading volume, volume-weighted average price (VWAP), volume oscillators
1. **Market Capitalization Dynamics** - Total market cap, individual asset market caps, dominance ratios
1. **Volatility Metrics** - Historical volatility, implied volatility, volatility clustering
1. **Liquidity Conditions** - Order book depth, bid-ask spreads, slippage analysis
1. **Market Microstructure** - Order flow, transaction costs, market maker behavior
1. **Cross-Asset Correlations** - Crypto-to-crypto, crypto-to-traditional asset correlations
1. **Market Sentiment Indicators** - Fear & Greed Index, sentiment analysis from social media
1. **Exchange Flows** - Inflows/outflows to exchanges, exchange reserves
1. **Whale Activity** - Large wallet movements, distribution patterns
1. **Funding Rates** - Perpetual swap funding rates across exchanges
1. **Futures Basis** - Contango/backwardation in futures markets

## On-Chain Metrics (13-25)

1. **Network Activity** - Transaction count, active addresses, new address creation
1. **Hash Rate & Mining Metrics** - Network hash rate, mining difficulty, miner capitulation
1. **Staking Metrics** - Total value staked, staking rewards, validator behavior
1. **Token Velocity** - How frequently tokens change hands
1. **HODL Metrics** - Long-term holder behavior, coin age, UTXO age distribution
1. **Network Value to Transactions (NVT)** - Network valuation relative to transaction volume
1. **Realized Cap & MVRV** - Market value to realized value ratios
1. **Supply Distribution** - Concentration metrics, Gini coefficient
1. **Smart Contract Activity** - Contract deployments, gas usage patterns
1. **MEV (Maximal Extractable Value)** - MEV extraction patterns and impact
1. **Bridge Activity** - Cross-chain bridge volumes and patterns
1. **Token Unlocks & Vesting** - Scheduled token releases and their timing
1. **Network Congestion** - Gas prices, transaction confirmation times

## DeFi-Specific Indicators (26-35)

1. **Total Value Locked (TVL)** - Across protocols and chains
1. **Yield Farming Dynamics** - APY changes, yield chasing behavior
1. **Liquidity Pool Metrics** - Pool sizes, impermanent loss, LP token behavior
1. **DEX Volume & Market Share** - Decentralized exchange trading patterns
1. **Lending Protocol Health** - Utilization rates, liquidation events
1. **Derivatives Activity** - Options flow, perpetuals open interest
1. **Flash Loan Activity** - Usage patterns and arbitrage opportunities
1. **Governance Token Dynamics** - Voting participation, proposal outcomes
1. **Protocol Revenue & Fees** - Fee generation and distribution patterns
1. **Cross-Protocol Composability** - Integration patterns and dependencies

## Macro & External Factors (36-45)

1. **Traditional Market Conditions** - Stock market performance, bond yields
1. **Dollar Strength (DXY)** - USD index impact on crypto prices
1. **Inflation Metrics** - CPI, PPI, and their crypto market impact
1. **Interest Rate Environment** - Federal funds rate, yield curve dynamics
1. **Geopolitical Events** - Wars, sanctions, political instability
1. **Regulatory Developments** - New rules, enforcement actions, legal clarity
1. **Institutional Adoption** - Corporate treasury adoption, ETF flows
1. **Central Bank Digital Currencies (CBDCs)** - Development and implementation
1. **Energy Prices** - Impact on mining costs and network security
1. **Global Economic Health** - GDP growth, unemployment, recession indicators

## Social & News Factors (46-50)

1. **Social Media Sentiment** - Twitter, Reddit, Discord activity analysis
1. **News Flow Analysis** - Breaking news impact, narrative shifts
1. **Developer Activity** - GitHub commits, developer hiring, ecosystem growth
1. **Adoption Metrics** - User growth, merchant acceptance, real-world usage
1. **Black Swan Event Indicators** - Exchange hacks, protocol exploits, systemic risks

## Additional Considerations for Your AI Model

### Data Sources Integration

- **Real-time APIs**: CoinGecko, CoinMarketCap, DeFiPulse, The Graph
- **On-chain data**: Dune Analytics, Nansen, Glassnode, IntoTheBlock
- **Social sentiment**: LunarCrush, Santiment, Alternative.me
- **News aggregation**: CryptoPanic, CoinDesk, The Block

### Time Series Considerations

- **Multiple timeframes**: 1m, 5m, 1h, 4h, 1d, 1w, 1M intervals
- **Historical depth**: At least 4-5 years for major cryptocurrencies
- **Real-time updates**: Sub-second for high-frequency factors
- **Event-driven data**: Irregular but critical incidents

### Feature Engineering Recommendations

- **Lagged variables**: Multiple time lags for each indicator
- **Moving averages**: Various periods (7, 14, 30, 50, 200 days)
- **Rate of change**: Velocity and acceleration of key metrics
- **Volatility windows**: Short and long-term volatility measures
- **Ratio calculations**: Relative strength between assets/metrics

### Model Architecture Considerations

- **Multi-modal inputs**: Numerical, text, and categorical data
- **Attention mechanisms**: For weighing factor importance dynamically
- **Regime detection**: Bull/bear/sideways market classification
- **Ensemble methods**: Combining multiple model predictions
- **Risk management**: Position sizing and drawdown controls