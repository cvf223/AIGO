A Foundational Data Framework for an AI-Powered Crypto-Asset World Model: The Top 50 Factors for Analysis


Introduction

The crypto-asset market represents a complex adaptive system, fundamentally distinct from traditional financial markets. It is characterized by high reflexivity, where investor perceptions directly influence fundamentals; rapid, self-reinforcing narrative cycles; and an increasing, non-linear interconnectedness with the global financial system. Consequently, constructing an effective analytical and predictive model for this domain requires moving beyond simplistic, single-domain approaches. A linear regression model trained on price history or a sentiment analysis tool operating in isolation is insufficient to capture the intricate, multi-layered dynamics that govern market behavior.
The objective of this report is to outline a foundational data architecture for a sophisticated, AI-powered "world model." Such a model does not merely seek to predict price but to understand the deep, causal relationships within the entire crypto-asset ecosystem. By pretraining on a comprehensive and multi-domain dataset, the AI can learn to identify market regimes, capital flows, systemic risks, and fundamental value shifts, enabling more robust decision-making and prediction.
This report details the 50 essential factors, indicators, and market conditions required for this endeavor. These factors are organized into seven critical domains of analysis, which form the essential data layers for the AI's pretraining:
On-Chain Network Fundamentals: The immutable "ground truth" of blockchain activity.
Market-Based Technical Indicators: The quantitative reflection of market psychology in price and volume.
Derivatives Market Intelligence: Forward-looking data on leverage, sentiment, and institutional positioning.
DeFi Ecosystem Health & Capital Flows: Metrics defining the on-chain economy.
Project-Level Fundamental Attributes: The qualitative and quantitative drivers of long-term intrinsic value.
Market Sentiment & Narrative Analysis: The quantification of crowd psychology and hype cycles.
Macroeconomic & Cross-Asset Linkages: The growing influence of the traditional financial system.
By integrating these disparate data streams, it becomes possible to construct a world model that comprehends the crypto-asset market not as a series of isolated events, but as a cohesive, dynamic, and evolving system.

Executive Summary: The 50 Core Factors

The following table provides a high-level map of the 50 factors detailed in this report. It serves as a practical checklist for data acquisition and feature engineering, outlining each factor's category, its primary signal, and key data sources.


1. On-Chain Network Fundamentals

On-chain data represents the foundational layer of analysis for any crypto-asset world model. Derived directly from the public, immutable ledger of a blockchain, this data provides an unparalleled, transparent view into the network's economic activity, user behavior, and security. Unlike market-based indicators, which reflect sentiment and speculation, on-chain metrics quantify the "ground truth" of a network's health and utility. They are the most crypto-native signals available, offering a means to assess intrinsic value independent of price action.   





1.1. Realized Capitalization (Realized Cap)

Realized Capitalization is a more nuanced valuation metric than the standard Market Capitalization. While Market Cap values every coin in circulation at the current market price, Realized Cap values each unit of a cryptocurrency at the price it was last moved on-chain. This methodology effectively filters out lost coins and coins held by long-term investors, providing a more accurate representation of the aggregate cost basis—or the total capital stored in and paid for—the asset. It serves as a foundational component for many advanced on-chain indicators.   



1.2. Market Value to Realized Value (MVRV) Ratio

The MVRV Ratio is calculated by dividing the Market Capitalization by the Realized Capitalization (MVRV=RealizedCapMarketCap ). This ratio is one of the most powerful and historically reliable indicators for identifying the macro tops and bottoms of market cycles. It essentially quantifies the average unrealized profit or loss held by all market participants.   



An MVRV ratio greater than 1 indicates that, on average, holders are in profit. An MVRV ratio less than 1 signifies that holders are, on average, at an unrealized loss. Historically, MVRV values exceeding 3.5-4.0 have coincided with cycle peaks, suggesting the market is overheated and holders have a massive incentive to sell and realize profits. Conversely, values below 1 have consistently marked periods of maximum financial opportunity, indicating market capitulation and undervaluation where selling pressure is exhausted.   



1.3. Net Unrealized Profit/Loss (NUPL)

NUPL measures the total amount of profit or loss in the network as a proportion of the market capitalization, calculated as NUPL=MarketCap(MarketCap−RealizedCap) . This metric provides a clear gauge of overall market sentiment by visualizing the profitability of the average holder. Data providers like Glassnode often color-code NUPL into distinct zones that correspond to phases of a market cycle: Euphoria/Greed (high profit), Optimism/Denial, Hope/Fear, and Capitulation (high loss). A NUPL value nearing euphoric levels suggests the market is at high risk of a correction as incentives to realize gains grow.   




1.4. Spent Output Profit Ratio (SOPR)

SOPR is a real-time indicator that measures the aggregate profit or loss of all coins being transacted on-chain on a given day. It is calculated by dividing the selling price of a coin by the price at which it was originally acquired on-chain. A SOPR value greater than 1 indicates that coins are, on average, being sold at a profit. A value less than 1 indicates they are being sold at a loss. During bull markets, the SOPR=1 line often acts as a strong level of support, as investors are reluctant to sell their assets at a loss. A sustained break below 1 during an uptrend can signal a major shift in trend. Conversely, in bear markets, the SOPR=1 line acts as resistance.   



1.5. Active Addresses

The number of unique blockchain addresses that are active as either a sender or receiver in transactions over a given period (e.g., daily) is a direct measure of network usage and user adoption. A consistently rising number of active addresses is a fundamentally bullish sign, indicating a growing network effect. A powerful signal for the AI model to learn is a divergence between price and active addresses. If price is rising to new highs but the number of active addresses is declining, it suggests that the rally is not supported by fundamental network growth and may be unsustainable.   





1.6. Transaction Count & Volume

This metric tracks the total number of transactions and the total value (e.g., in USD) settled on the network. It serves as a direct measure of the blockchain's utility as a value transfer or settlement layer. A sophisticated analysis should differentiate transaction types. For example, separating large "whale" transfers from smaller retail transactions can provide a more granular understanding of who is using the network. A rising transaction volume confirms strong network usage and economic throughput.   



1.7. Network Value to Transactions (NVT) Ratio

Often described as the "Price-to-Earnings (P/E) ratio for crypto," the NVT Ratio is calculated by dividing the network's Market Cap by its daily on-chain transaction volume. NVT assesses whether the network's valuation is justified by its utility as a settlement layer. A high NVT ratio can suggest that the network's valuation is outpacing its on-chain economic activity, potentially signaling an overvalued state or a "bubble." A low NVT ratio may indicate that the asset is undervalued relative to its usage.   



1.8. Exchange Flows (Inflows/Outflows)

Tracking the movement of assets between private wallets and centralized exchange wallets is a critical short-to-medium term indicator of market sentiment and potential supply/demand shifts.   



Exchange Inflows: A large volume of coins moving onto exchanges typically signals an intent to sell, increasing the immediately available supply and thus exerting downward pressure on price. This is a bearish signal.
Exchange Outflows: A large volume of coins moving off exchanges into private or cold storage wallets indicates an intent to hold for the long term (HODL). This removes supply from the market, reducing potential sell pressure and is considered a bullish signal.

1.9. Hash Rate & Mining Difficulty

For Proof-of-Work (PoW) blockchains like Bitcoin, the hash rate represents the total computational power dedicated by miners to securing the network. A high and rising hash rate indicates a robust and secure network, reflecting miner confidence in the long-term profitability of their operations. Mining difficulty is a network parameter that automatically adjusts (e.g., every two weeks for Bitcoin) to ensure block production times remain stable as hash rate changes. It is a proxy for the cost of production. Research has also shown that macroeconomic factors, such as the price of gold and changes in the Federal Funds Rate, can have a statistically significant impact on the hash rate.   




1.10. Miner Outflows & Revenue

This metric tracks the volume of coins moving out of wallets associated with miners. Miners must sell their block rewards to cover operational costs (electricity, hardware). Periods of high miner outflows can introduce significant sell pressure into the market. A "miner capitulation" event, where falling prices make mining unprofitable for many, can lead to a spike in outflows and often coincides with market bottoms. Miner revenue, the total value of block rewards and transaction fees, is the primary economic incentive that underpins the security of a PoW network.   


The true analytical power of these on-chain metrics emerges when they are viewed not as independent variables but as components of a causal chain that describes the narrative of market cycles and investor psychology. An AI model must be trained to recognize the sequence and interplay of these signals. A bull market typically begins with conditions of undervaluation, marked by an MVRV ratio below 1 and a negative NUPL, where smart money accumulates from capitulated sellers. As the price begins to recover and rise, MVRV and NUPL transition from "Capitulation" to "Hope" and then "Optimism," while fundamental adoption is confirmed by a steady increase in active addresses and transaction volume.   




As the cycle matures, MVRV and NUPL enter the "Greed" and "Euphoria" zones. During this phase, SOPR remains consistently above 1, as every market dip is aggressively bought and the vast majority of holders are in significant profit.The cycle peak is often characterized by a confluence of extreme MVRV and NUPL readings, a sharp spike in exchange inflows as long-term holders finally move their coins to sell and take profits, and a critical bearish divergence where price makes a new high but on-chain activity metrics like active addresses fail to follow, signaling waning fundamental support.This sequence creates a powerful feedback loop: widespread profit-taking (high SOPR) leads to an oversupply on exchanges (high inflows), which eventually overwhelms demand and triggers a major price correction. The world model's task is to identify the current state of this entire causal chain, providing a far deeper understanding than the value of any single metric could offer.   




2. Market-Based Technical Indicators

While on-chain data provides a fundamental view of network health, technical indicators derived from market price and volume data are essential for understanding market structure, momentum, volatility, and the collective psychology of participants. These mathematical tools process historical market data to forecast potential future price movements. Their widespread use can lead to self-fulfilling prophecies, as a large number of traders acting on the same signals can influence the market in the predicted direction.   





2.11. Simple & Exponential Moving Averages (SMA/EMA)

Moving Averages (MAs) are foundational trend-following indicators that smooth out price data to clarify the direction of the trend over a specified period.   


Simple Moving Average (SMA): Calculates the average price over a given period (e.g., 50 days). Key SMAs, particularly the 200-day, often act as significant dynamic support or resistance levels.
Exponential Moving Average (EMA): Gives more weight to recent price action, making it more responsive to new information and better suited for analyzing shorter-term trends.        
A common and powerful signal is the "moving average crossover." For instance, a "Golden Cross," where the 50-day SMA crosses above the 200-day SMA, is a widely recognized, albeit lagging, signal of a long-term bullish trend shift.Conversely, a "Death Cross" (50-day SMA crossing below the 200-day SMA) signals a bearish trend.   



2.12. Moving Average Convergence Divergence (MACD)

The MACD is a versatile indicator that serves as both a trend-following and momentum tool. It is calculated using three components:   



MACD Line: The difference between two Exponential Moving Averages (typically the 12-period and 26-period EMAs).
Signal Line: A 9-period EMA of the MACD line.
Histogram: The difference between the MACD Line and the Signal Line, visualizing the strength and direction of momentum.        
Trading signals are generated through crossovers (e.g., a bullish signal when the MACD line crosses above the signal line) and divergences between the MACD histogram and price action.

2.13. Relative Strength Index (RSI)

The RSI is a momentum oscillator that measures the magnitude of recent price changes to evaluate overbought or oversold conditions in the price of an asset. It oscillates between 0 and 100.   



Overbought: An RSI reading above 70 suggests that an asset is overbought and may be due for a price correction.        
Oversold: An RSI reading below 30 suggests that an asset is oversold and may be poised for a rebound.        
One of the most potent applications of the RSI is identifying divergences. A bullish divergence occurs when the price makes a new low, but the RSI makes a higher low, indicating that selling momentum is weakening and a potential reversal is imminent.   



2.14. Bollinger Bands

Bollinger Bands are a volatility indicator consisting of three lines plotted in relation to an asset's price.   



Middle Band: A Simple Moving Average (typically 20-period).
Upper and Lower Bands: Plotted at two standard deviations above and below the middle band.
The bands widen during periods of high volatility and contract during periods of low volatility. This contraction, known as a "Bollinger Squeeze," often precedes a significant price breakout. The price touching the upper band can be interpreted as an overbought signal, while touching the lower band can signal an oversold condition.   




2.15. On-Balance Volume (OBV)

OBV is a cumulative momentum indicator that uses volume flow to predict changes in stock price. The logic is that volume precedes price. OBV adds volume on days when the price closes up and subtracts volume on days when the price closes down. A rising OBV confirms a price uptrend by indicating that volume is flowing into the asset. A divergence between price and OBV, where the price is rising but OBV is flat or falling, can signal that the trend lacks conviction and may reverse.   




2.16. Support & Resistance Levels

Support and resistance are key price levels on a chart that tend to act as barriers, preventing the price of an asset from getting pushed in a certain direction.   


Support: A price level where a downtrend can be expected to pause due to a concentration of demand.
Resistance: A price level where an uptrend can be expected to pause temporarily, due to a concentration of supply.
These levels are identified by looking at historical price action, such as previous peaks and troughs. They represent critical psychological points where market participants have made decisions in the past, and are likely to do so again.

2.17. Chart Patterns

Chart patterns are recognizable geometric shapes that form in price data and have predictive value. These patterns are visual representations of the forces of supply and demand and the collective psychology of market participants.   


Reversal Patterns: Signal a potential change in the prevailing trend. Examples include the Head and Shoulders and Double Top (bearish reversals), and the Inverse Head and Shoulders and Double Bottom (bullish reversals).        
Continuation Patterns: Suggest that the market will pause for a period before continuing in the direction of the prevailing trend. Examples include triangles, flags, and pennants.
The true predictive power of technical indicators is realized not when they are used in isolation, but when multiple, non-correlated indicators provide a confirming signal at a significant market structure level. This concept of "confluence" is critical for an AI model to learn. For example, a single RSI oversold signal (a value below 30) is a frequent and often unreliable event, especially within a strong downtrend where an asset can remain "oversold" for extended periods.   


However, the reliability of this signal increases exponentially when it occurs in a context of confluence. Consider a scenario where the RSI drops below 30 just as the price reaches a major historical support level and simultaneously touches the lower Bollinger Band. This alignment of three distinct signals—momentum, market structure, and volatility—creates a high-probability setup for a price bounce. The signal is further strengthened if this confluence is accompanied by a bullish divergence on the RSI, where the price has just made a lower low but the RSI has formed a higher low, indicating a clear exhaustion of selling momentum. The final confirmation would be a subsequent price bounce that is validated by a sharp increase in On-Balance Volume, proving that strong buying pressure is driving the move. The AI world model should be trained not on individual indicator values, but on these multi-indicator "setups." It must learn the grammar of technical analysis, where indicators are words and states of confluence are meaningful sentences that predict future market behavior.   







3. Derivatives Market Intelligence

The cryptocurrency derivatives market, encompassing futures and options, provides critical, forward-looking insights into institutional positioning, market leverage, and aggregate sentiment. This data often leads movements in the spot market and can be used to identify areas of systemic risk and potential volatility. An analysis of the derivatives landscape is therefore essential for a comprehensive world model.   




3.18. Open Interest (OI)

Open Interest represents the total number of outstanding derivative contracts (futures or options) that have not been settled or closed. It is a direct measure of the total capital and number of active positions in the market. Unlike volume, which counts all trades, OI reflects the net number of active contracts. An increase in OI indicates that new money is flowing into the market, which confirms the strength of the prevailing price trend (i.e., rising OI alongside a rising price is bullish). Conversely, a decrease in OI suggests that traders are closing their positions, signaling that the current trend may be losing momentum.   







3.19. Perpetual Swap Funding Rates

Perpetual swaps are a type of futures contract without an expiration date. To keep their price tethered to the underlying spot price, a mechanism called the "funding rate" is used. This involves periodic payments exchanged between traders holding long and short positions.   



Positive Funding Rate: When the perpetual contract trades at a premium to the spot price (contango), long position holders pay short position holders. This indicates a dominance of bullish sentiment and leverage.         
Negative Funding Rate: When the contract trades at a discount (backwardation), short position holders pay long position holders, signaling bearish dominance.        
Persistently high positive funding rates suggest that the long side of the trade is overcrowded and over-leveraged, making the market vulnerable to a "long squeeze" if prices dip.   



3.20. Liquidations (Long vs. Short)

A liquidation is the forced closure of a trader's leveraged position when their margin balance is insufficient to cover their unrealized losses. Large-scale liquidation events, often called "cascades," occur when an initial price move triggers a wave of liquidations, which in turn pushes the price further in the same direction, triggering more liquidations. These events are a primary source of short-term volatility and often mark local price tops or bottoms by flushing excess leverage from the system. Analyzing the ratio of long versus short liquidations reveals which side of the market is over-extended and vulnerable.   



3.21. Options Put/Call Ratio

The Put/Call Ratio is a sentiment indicator calculated by dividing the trading volume of put options by the trading volume of call options. Put options are a bet on a price decline, while call options are a bet on a price increase.   


A high ratio indicates that traders are buying more puts than calls, signaling bearish sentiment and a desire for downside protection.
A low ratio signals bullish sentiment.
At its extremes, the Put/Call Ratio is often used as a contrarian indicator. An extremely high ratio can suggest that fear has peaked and a market bottom may be near, while an extremely low ratio can indicate excessive greed and a potential market top.   



3.22. Implied Volatility (IV)

Implied Volatility is the market's forecast of the likely future volatility of an asset's price, as derived from the price of its options contracts. It is a forward-looking measure. High IV reflects a market expectation of large price swings, often associated with uncertainty or fear, and results in higher options premiums. Low IV suggests the market expects a period of stability. IV is a critical input for options pricing models like the Black-Scholes model.   




3.23. Volatility Smile/Skew

The Volatility Smile is a graphical pattern that arises when plotting the implied volatility of options with the same expiration date against their different strike prices. Contrary to the assumptions of the Black-Scholes model, the resulting curve is not flat but U-shaped, or a "smile." This indicates that deep in-the-money (ITM) and out-of-the-money (OTM) options have higher implied volatility than at-the-money (ATM) options.   




The asymmetry of this smile is called the "skew." In equity and crypto markets, a "reverse" or "negative" skew is common, where OTM put options have a higher IV than equidistant OTM call options. This reflects a greater market demand for downside protection (puts) than for upside speculation (calls), indicating a persistent fear of a market crash. The steepness of the skew can quantify the degree of fear in the market.   


Derivatives data provides a window into the market's underlying "leverage structure," which can be used to model and predict volatility events driven by the unwinding of that leverage. A predictable, cyclical pattern of leverage build-up and collapse can be identified through the interplay of Open Interest, Funding Rates, and Liquidations. During a sustained market rally, bullish sentiment encourages traders to take on more leveraged long positions, causing Open Interest to rise in tandem with price. This surge in demand for longs pushes the perpetual futures price above the spot price, causing Funding Rates to become highly and persistently positive. Holding a long position becomes progressively more expensive.   



This market state, characterized by high Open Interest and high positive funding, is inherently fragile. A relatively small dip in the spot price can be enough to trigger the initial liquidations of the most over-leveraged long positions. These forced sales add further downward pressure on the price, which in turn triggers a cascade of more liquidations in a feedback loop known as a "long squeeze." This event culminates in a rapid price crash and a dramatic "reset" in both Open Interest and Funding Rates as the excess leverage is violently flushed from the system. The AI model should be trained to recognize this pattern of rising leverage not merely as a sentiment indicator, but as a quantitative measure of systemic risk—a measure of the fuel available for a potential liquidation cascade. The magnitude of a potential price move can be estimated by the size of the Open Interest that is at risk of liquidation.   



4. DeFi Ecosystem Health & Capital Flows

The Decentralized Finance (DeFi) ecosystem represents a burgeoning on-chain economy built upon smart contract platforms like Ethereum. The health, growth, and risk within this ecosystem are primary drivers of demand for the underlying base-layer assets and provide a real-time view of capital allocation and innovation in the crypto space.Analyzing these metrics is crucial for understanding the utility and demand drivers beyond simple speculation.   




4.24. Total Value Locked (TVL)

Total Value Locked is the primary metric used to gauge the size and adoption of the DeFi ecosystem. It represents the aggregate U.S. dollar value of all crypto assets that users have deposited, or "locked," into DeFi protocols to be used for activities like lending, staking, or providing liquidity. A rising TVL indicates growing user trust and capital commitment to DeFi. A comprehensive analysis requires a granular view:   




Aggregate TVL: The total TVL across all blockchains.
Chain-Specific TVL: Comparing the TVL of different Layer 1s (e.g., Ethereum vs. Solana) and Layer 2s (e.g., Arbitrum vs. Optimism) to identify which ecosystems are attracting the most capital.        
Protocol-Specific TVL: Tracking the TVL of individual applications to identify market leaders and emerging projects.

4.25. DEX Trading Volume

Decentralized Exchanges (DEXs) like Uniswap are the cornerstones of DeFi, enabling permissionless, on-chain trading of assets. DEX trading volume measures the total value of assets swapped on these platforms over a given period. It is a direct measure of on-chain economic activity and serves as a key source of fee generation for liquidity providers and protocols. Comparing DEX volume to the volume on centralized exchanges (CEXs) can also indicate shifts in user preference towards decentralization.   




4.26. Protocol Revenue & Fees

This metric moves beyond simple activity measures to assess the economic sustainability of a DeFi protocol. It involves tracking two key figures :   


Total Fees: The gross fees generated by a protocol from its users (e.g., trading fees on a DEX, interest paid on a lending platform).
Protocol Revenue: The portion of the total fees that accrues to the protocol's treasury or is distributed to its token holders, after paying out liquidity providers or lenders.
Protocol revenue is analogous to corporate earnings in traditional finance and is a critical metric for valuing a protocol's governance or utility token.   



4.27. Stablecoin Market Cap & Velocity

Stablecoins (e.g., USDT, USDC, DAI) are the lifeblood of the DeFi ecosystem, acting as the primary medium of exchange and unit of account. The total market capitalization of all stablecoins serves as a proxy for the amount of liquid capital sitting on the sidelines of the crypto market, ready to be deployed into volatile assets. A rising stablecoin supply is generally considered a bullish precursor for the broader market, as it indicates new fiat capital is entering the ecosystem. Stablecoin velocity measures how frequently these tokens are being transacted, indicating the pace of economic activity.   




4.28. Lending & Borrowing Utilization Rates

On DeFi lending platforms like Aave and Compound, the utilization rate measures the percentage of assets in a given liquidity pool that has been borrowed by users. A high utilization rate indicates strong demand for leverage within the ecosystem. While this can be a sign of a healthy and active market, extremely high utilization rates also increase systemic risk. They can lead to volatile interest rates and raise the probability of cascading liquidations if the value of the underlying collateral assets were to fall sharply.

4.29. Cross-Chain Bridge TVL & Volume

As the crypto ecosystem has become increasingly multi-chain, cross-chain bridges have become critical infrastructure for transferring assets between different blockchains. Tracking the Total Value Locked within these bridges and the daily volume of assets flowing through them provides a clear picture of capital rotation between ecosystems. For example, a large and sustained flow of capital from Ethereum to a Layer 2 network like Arbitrum would be a strong indicator of that L2's growing adoption and economic activity.   


The flow of capital within and between DeFi ecosystems reveals the market's evolving narratives and risk appetite, with stablecoin flows acting as the bloodstream of this on-chain economy. An AI model can be trained to follow this flow in a structured manner. The first signal is an increase in the total stablecoin market cap, which indicates new fiat capital entering the digital asset space—a macro bullish sign. The model should then track where this new capital is deployed. A disproportionate increase in a specific chain's TVL signals that it is the focus of the current market narrative.   



Within that "hot" ecosystem, the model must further analyze the destination of the capital. Is it flowing primarily into established blue-chip DEXs and lending platforms, or into new, highly speculative protocols? This reveals the market's current risk tolerance. A crucial third-order analysis is to compare a protocol's TVL to its actual fee generation and protocol revenue. A protocol may attract a high TVL by offering unsustainable, inflationary token rewards, attracting "mercenary capital" that will leave as soon as incentives dry up. In contrast, a protocol that generates significant real fee revenue from its TVL demonstrates genuine utility and is attracting more "sticky capital." The AI must learn to differentiate between these two types of capital flow to assess the true health and sustainability of a DeFi protocol or ecosystem.   



5. Project-Level Fundamental Attributes

This category of analysis focuses on the qualitative and quantitative factors that determine the intrinsic, long-term value of an individual cryptocurrency project. This process is analogous to fundamental analysis in traditional equity markets but is adapted to the unique characteristics of decentralized, open-source projects. It involves moving beyond market data to assess the project's technology, team, economic model, and community.   





5.30. Tokenomics: Supply & Distribution

Tokenomics refers to the economic model of a token, governing its supply, distribution, and utility. A thorough analysis of a token's supply dynamics is critical. This includes understanding whether the supply is fixed and capped, like Bitcoin's 21 million coins, which creates digital scarcity and deflationary pressure over time. Alternatively, a token may have an inflationary supply schedule to fund ongoing development or staking rewards. The initial distribution and vesting schedules for insiders and early investors are also crucial. A fair distribution that avoids a heavy concentration of tokens in the hands of a few, coupled with long vesting periods for the team, aligns incentives and reduces the risk of early sell-offs.   





5.31. Tokenomics: Utility & Value Accrual

A token's long-term value is intrinsically linked to its utility within its native protocol. The analysis must answer the question: "What can you do with this token?" Use cases can include governance rights (voting on protocol upgrades), paying for network transaction fees, staking to secure the network and earn rewards, or accessing special features.Critically, there must be a clear "value accrual" mechanism that links the success of the protocol to the value of the token. For example, some protocols use a portion of the fees they generate to buy back and burn their native token, reducing the supply and creating value for holders. Without clear utility and value accrual, a token is purely speculative.   




5.32. Team & Developers

The quality and experience of the core team behind a project are often a leading indicator of its potential for success. The analysis should assess the team's background, technical expertise, and track record in previous ventures. Publicly known teams with a history of successful execution are generally a positive signal. Transparency and consistent communication with the community are also vital for building trust.   




5.33. Developer Activity (GitHub Analysis)

Developer activity provides an objective, quantifiable measure of a project's ongoing development and maintenance. By analyzing a project's public code repositories (e.g., on GitHub), one can track key metrics such as the number of code commits, the number of unique active developers, the frequency of updates, and the speed at which issues are resolved.Consistent and high levels of developer activity indicate that a project is actively being built and improved, lending credibility to its long-term vision. A project with a high market capitalization but little to no recent developer activity is a significant red flag.   



5.34. Whitepaper & Roadmap Analysis

The project's whitepaper is the foundational document that outlines its purpose, underlying technology, tokenomics, and strategic vision. It should clearly articulate the problem the project aims to solve and why its solution is unique or superior to existing alternatives. The project's roadmap provides a timeline of planned features, upgrades, and milestones. The AI model should be trained to track a team's historical performance against its stated roadmap, as a consistent ability to meet deadlines is a strong indicator of execution capability.   




5.35. Community & Governance

In the world of open-source, decentralized networks, a strong, active, and engaged community can be one of a project's most powerful assets and competitive moats. The analysis should measure community size and engagement across platforms like Twitter, Discord, and Telegram. For projects governed by a Decentralized Autonomous Organization (DAO), metrics such as the number of governance proposals submitted, the level of voter participation, and the vibrancy of forum discussions are key indicators of a healthy, decentralized governance process.   



5.36. Competitive Landscape

No project exists in a vacuum. A fundamental analysis must include an assessment of the project's position within its specific market niche (e.g., Layer 1 blockchain, DEX, lending protocol). This involves identifying its main competitors and evaluating its unique value proposition. Does the project offer superior technology, a better user experience, stronger network effects, or a more sustainable economic model? Understanding a project's market share and its key differentiators is vital for assessing its long-term viability.   


A project's long-term success is often a function of a reflexive, positive feedback loop between its fundamental strength and its market valuation. An AI model can be trained to identify the conditions that foster this virtuous cycle. The process typically begins with a project launching with strong initial fundamentals: a credible team, a well-reasoned whitepaper, and robust tokenomics. This initial strength attracts early investors and helps build a core community. As the team begins to execute on its vision, evidenced by consistent developer activity on GitHub, it builds further credibility.   



Once the protocol goes live, it starts attracting real users and generating on-chain activity and fees. If the token has a well-designed value accrual mechanism, this fundamental success translates directly into a higher token price. This rising price, in turn, attracts wider media attention, a larger community, and more developers, creating a powerful network effect. Furthermore, a higher token price increases the value of the project's treasury, providing more resources to fund further development, marketing, and ecosystem grants, which strengthens the fundamentals even more. The AI model must understand this reflexivity. A project with a low market valuation but strong and improving fundamentals (e.g., high developer activity, growing protocol revenue) is a prime candidate for entering this positive feedback loop. Conversely, a project with a high valuation but stagnant or deteriorating fundamentals is at high risk of entering a negative feedback loop, where a falling price drains community engagement, developer motivation, and treasury resources.   



6. Market Sentiment & Narrative Analysis

In the cryptocurrency market, crowd psychology, hype cycles, and prevailing narratives are exceptionally powerful, and often irrational, drivers of price action. The ability to quantify these intangible factors is therefore critical for any comprehensive world model. This involves moving beyond traditional financial data to analyze social media, search trends, and the thematic flows of market attention.   



6.37. Fear & Greed Index

The Fear & Greed Index is a composite indicator that aggregates multiple data sources—including market volatility, volume, social media trends, and market dominance—into a single, easy-to-interpret score ranging from 0 (Extreme Fear) to 100 (Extreme Greed). Its primary purpose is to gauge the current emotional state of the market. The index is most powerful when used as a contrarian indicator. Periods of "Extreme Fear" often coincide with market bottoms, representing points of maximum financial opportunity for buyers. Conversely, periods of "Extreme Greed" frequently signal that the market is overheated and due for a correction.   




6.38. Social Volume

Social Volume measures the raw number of mentions of a specific cryptocurrency or keyword across major social media platforms like Twitter (X), Reddit, Telegram, and others. It is a direct measure of the level of "chatter" or attention a particular asset is receiving. Spikes in social volume are highly correlated with periods of high price volatility. A sudden surge in social mentions can indicate an emerging trend, a major news event, or the beginning of a speculative frenzy.   




6.39. Weighted Sentiment

While social volume tracks the quantity of conversation, weighted sentiment analysis assesses the quality. Using Natural Language Processing (NLP) algorithms, this metric scans social media posts and classifies them as positive, negative, or neutral. By aggregating these classifications, it provides a more nuanced view of crowd psychology than raw volume alone. A high social volume accompanied by overwhelmingly positive sentiment is a strong indicator of bullish excitement (or "FOMO"), while a spike in volume with negative sentiment can signal panic or "FUD" (Fear, Uncertainty, and Doubt).   



6.40. Google Trends

Google Trends data measures the relative popularity of search queries over time, providing a valuable proxy for retail investor interest. A significant and sustained increase in search volume for a term like "buy Bitcoin" or the name of a specific altcoin often indicates that the asset is capturing the attention of the general public. Historically, major peaks in Google search interest have coincided closely with the tops of bull market cycles, as they mark the point of maximum retail FOMO just before the market reverses.   



6.41. Narrative Tracking

The crypto market often moves in thematic waves, or "narratives," where a specific category of assets (e.g., "Layer 2 scaling solutions," "AI Coins," "Real World Assets (RWAs)") captures the market's collective attention and capital for a period. Advanced analytics platforms can track the emergence and strength of these narratives by monitoring the frequency of related keywords in social media discussions. Identifying a nascent, strengthening narrative early can provide a significant analytical edge, as capital tends to rotate from fading narratives to emerging ones.   


Market narratives exhibit a distinct and modelable lifecycle, and their sustainability is determined by the interplay between social media hype and tangible on-chain capital flows. An AI model can be trained to track this lifecycle and assess its strength. The cycle typically begins with a new narrative, for example "AI Coins," gaining traction in niche crypto circles on platforms like Twitter and Telegram. As early adopters discuss the theme, the social volume and positive sentiment for tokens within that category begin to rise, and their prices start to move.   


This initial price action attracts wider attention, leading to coverage by crypto influencers and media, which in turn causes a spike in Google Trends search interest and a surge of retail capital into the narrative's associated tokens. At this stage, the overall Fear & Greed Index will likely shift towards "Greed" or "Extreme Greed." The critical question for the AI model at this point is whether this social hype is being validated by fundamental on-chain activity. The model must cross-reference the sentiment data with the on-chain and DeFi metrics discussed previously. Are the active addresses for these "AI Coins" increasing? Is Total Value Locked flowing into their associated DeFi ecosystems? Is there a tangible increase in their on-chain transaction volume? If the social hype is not accompanied by a corresponding growth in fundamental on-chain usage, the rally is likely built on pure speculation and is highly susceptible to a sharp and sudden collapse once the narrative's novelty fades. By combining sentiment momentum with fundamental momentum, the AI can generate a "Narrative Strength Score" to differentiate between sustainable, utility-driven trends and fragile, hype-driven bubbles.

7. Macroeconomic & Cross-Asset Linkages

As the cryptocurrency market matures and attracts significant institutional capital, its isolation from the traditional global financial system has diminished. Crypto-assets, particularly Bitcoin and Ethereum, are now increasingly sensitive to macroeconomic factors, monetary policy, and the performance of other asset classes. A robust world model must therefore incorporate these external linkages to understand the broader context in which the crypto market operates.   




7.42. Federal Reserve Interest Rates

The interest rates set by the U.S. Federal Reserve, particularly the Federal Funds Rate, represent the foundational cost of capital in the global financial system. Monetary policy decisions have a profound impact on investor risk appetite.
Lower Interest Rates / Easing Policy: When the Fed cuts rates, it lowers the cost of borrowing and increases liquidity in the system. This makes safer investments like bonds less attractive and encourages capital to flow into higher-risk, higher-reward assets, including cryptocurrencies.          
Higher Interest Rates / Tightening Policy: When the Fed raises rates to combat inflation, it makes borrowing more expensive and tightens financial conditions. This typically leads to a "risk-off" environment where investors sell speculative assets and move into safer havens, creating a significant headwind for crypto prices.         

7.43. Inflation (CPI, Breakeven Rates)

While Bitcoin is often described as a hedge against inflation due to its fixed supply, its real-world performance has been complex. The market's reaction is more nuanced than a simple response to Consumer Price Index (CPI) data. Research indicates that Bitcoin's price has become more correlated with forward-looking market-based inflation expectations (like Treasury breakeven inflation rates) than with lagging government CPI reports. Persistently high inflation is a double-edged sword: while it strengthens the long-term "store of value" narrative for assets like Bitcoin, it also forces central banks to enact tighter monetary policies (higher rates), which is a powerful short-to-medium term negative for risk assets.  







7.44. US Dollar Index (DXY)

The DXY measures the strength of the U.S. dollar against a basket of major foreign currencies. There is a strong and historically consistent inverse correlation between the DXY and the price of Bitcoin and other crypto-assets. A rising DXY (a stronger dollar) signifies a tightening of global USD liquidity, which makes it more expensive for international actors to service dollar-denominated debt and generally leads to a global "risk-off" sentiment. Conversely, a falling DXY (a weaker dollar) tends to coincide with periods of high risk appetite and bullish performance for assets like crypto.   




7.45. Stock Market Correlation (S&P 500, NASDAQ)

In its early years, Bitcoin was largely uncorrelated with the stock market. However, as institutional adoption has grown, this has changed dramatically. Cryptocurrencies, particularly Bitcoin, now frequently trade with a high positive correlation to U.S. equity indices, especially the tech-heavy NASDAQ 100. This means that crypto often behaves as a "high-beta" risk asset, amplifying the moves of the broader stock market. During risk-on periods, crypto tends to outperform stocks, and during risk-off periods, it tends to underperform.   






7.46. VIX Index (Fear Index)

The CBOE Volatility Index (VIX) measures the market's expectation of 30-day volatility in the S&P 500, derived from options prices. It is widely known as the "fear index." A high or spiking VIX indicates heightened fear and uncertainty in traditional financial markets. This risk-off sentiment typically spills over directly into the crypto market, leading to price declines as investors de-risk their portfolios across the board.   



7.47. Spot ETF Inflows/Outflows

The approval and launch of spot Bitcoin and Ethereum Exchange-Traded Funds (ETFs) in major markets like the U.S. has created a direct, regulated bridge for traditional capital to enter the crypto ecosystem. Tracking the daily net flows of capital into and out of these ETF products is now one of the most direct and transparent measures of institutional and retail demand from the traditional finance world. Sustained inflows provide a strong tailwind for price, while significant outflows can signal a shift in institutional sentiment.   





7.48. Geopolitical Events & Regulation

The crypto market is highly sensitive to major geopolitical events and shifts in the regulatory landscape. Events such as the outbreak of conflicts, trade wars, or major elections can introduce significant uncertainty and volatility. Similarly, regulatory news—such as lawsuits from agencies like the SEC, government bans on mining or trading, or, conversely, the passage of favorable legislation—can act as powerful catalysts for large and sudden price movements.   




The crypto market's behavior is not static; it is "regime-dependent." Its sensitivity to the macroeconomic factors listed above changes based on the dominant market narrative and prevailing liquidity conditions. A truly intelligent world model must first be a "regime detection" model, capable of identifying the current state of the market to appropriately weight the influence of different factors. Three primary regimes can be identified:
Regime 1: "Risk-On / High Liquidity." In an environment of monetary easing by central banks (low interest rates, quantitative easing), liquidity is abundant. In this regime, crypto behaves primarily as a high-beta tech stock. Its price action is heavily influenced by the overall appetite for risk, and it exhibits a high positive correlation with the NASDAQ. During this regime, macroeconomic factors like interest rate expectations and the DXY are paramount.         
Regime 2: "Crypto-Specific Narrative." During periods of intense, internally generated narratives—such as the "DeFi Summer" of 2020 or the launch of a highly anticipated new blockchain—the crypto market can temporarily decouple from broader macro trends. In this regime, the primary drivers of price action are the internal capital rotations and hype cycles described in the DeFi and Sentiment sections. On-chain data and narrative tracking become more important than macroeconomic indicators.
Regime 3: "Safe-Haven / Crisis." During specific types of crises, particularly those that threaten the stability of the traditional banking system or fiat currencies (e.g., the U.S. regional banking crisis in March 2023), Bitcoin can exhibit "safe-haven" properties. In this regime, it can rally even as traditional markets fall, acting as a hedge against systemic financial risk.        
The AI model must first classify the current market environment into one of these (or other identified) regimes. This classification then acts as a dynamic switch, instructing the model on which set of factors—macro, narrative-driven, or crisis-response—should be weighted most heavily in its analysis and predictions. This moves beyond simple correlation analysis to a more sophisticated, state-based understanding of the market.

8. Synthesis & World Model Integration

The final step in constructing the AI world model is to synthesize the 48 distinct factors from the seven analytical domains into a cohesive and intelligent framework. This process moves from raw data collection to sophisticated feature engineering and model architecture, enabling the AI to understand the complex interplay between all layers of the crypto-asset ecosystem.

8.49. Composite Index Creation

Feeding 48 raw data streams directly into a model can be inefficient and noisy. A more effective approach is to first create composite indices that aggregate related factors into higher-level, more abstract concepts. This process of dimensionality reduction helps the model identify more meaningful signals. For example:
Network Health Index: A weighted combination of Active Addresses, Transaction Volume, and Hash Rate to provide a single score for a blockchain's fundamental adoption and security.
Holder Profitability Index: An aggregation of MVRV, NUPL, and SOPR to gauge the overall financial state of the market's participants.
Leverage Risk Index: A composite of Open Interest, Funding Rates, and the ratio of long-to-short liquidations to quantify the systemic risk from excess leverage in the derivatives market.
Narrative Momentum Index: A score that combines Social Volume, Weighted Sentiment, and Google Trends to measure the strength of a prevailing market narrative.
These indices distill complex, multi-faceted concepts into single, analyzable time series, making it easier for the model to learn the relationships between high-level market states.

8.50. Feature Engineering & Regime Detection

Feature engineering is the process of transforming the raw and composite data into a format that is optimal for the AI model. This includes calculating rates of change (momentum), moving averages (trends), and standard deviations (volatility) for each data stream. It also involves creating more complex, relational features, such as signals for divergences (e.g., a feature that flags a condition where price is rising but RSI is falling) or spreads (e.g., the difference between the perpetual futures price and the spot price).
The most critical feature to engineer is the "Market Regime" itself, as identified in the previous section. The model can be trained on historical data to classify the market into states like "Risk-On Macro," "Narrative-Driven," or "Crisis-Hedge." This regime classification then becomes a primary input for the main predictive model, acting as a dynamic switch that alters the weighting and importance of all other features based on the current market context.

Modeling Approach and Conclusion

The architectural design of the world model should reflect the multi-modal nature of the input data. A hybrid architecture would likely be most effective. This could involve using:
Long Short-Term Memory (LSTM) networks or Transformers for processing the time-series data from on-chain, market, and macroeconomic indicators.
Transformers with Natural Language Processing (NLP) capabilities to analyze the text-based data from social media and news sources for sentiment and narrative tracking.
Graph Neural Networks (GNNs) to model the complex relationships and capital flows between different protocols and blockchains within the DeFi ecosystem.
The ultimate goal is to build a model that can not only make predictions but also run simulations to understand second and third-order effects. For instance, the model could be queried: "Given the current state of market leverage and a high positive correlation to the NASDAQ, what is the probable impact of a surprise 50-basis-point Fed rate hike on Bitcoin's price and the TVL of the Solana DeFi ecosystem?"
In conclusion, building a true AI world model for the crypto-asset market is a formidable but achievable challenge. It requires a departure from narrow, single-domain analysis and an embrace of a holistic, multi-layered approach. The 50 factors detailed in this report provide the comprehensive, cross-disciplinary data foundation necessary for this endeavor. The process is iterative, involving continuous data integration, feature discovery, and model refinement. However, by grounding the AI in this rich and diverse data landscape, it becomes possible to create a system that possesses a deep, causal understanding of one of the most dynamic and complex markets in the world today.

Sources used in the report

blog.obiex.finance
On-Chain Metrics That Matter in Crypto Trading - Obiex Blog
Opens in a new window 

fxtrendo.com
Practical and Important Indicators for Fundamental Analysis in Cryptocurrencies - Trendo
Opens in a new window 

insights.glassnode.com
Glassnode Insights - On-Chain Market Intelligence
Opens in a new window 

artemis.xyz
Artemis
Opens in a new window 

youhodler.com
Fundamental Analysis in Cryptocurrency: How to Evaluate Crypto Projects - YouHodler
Opens in a new window 

kraken.com
Crypto technical indicators: A beginners guide | Kraken
Opens in a new window 

cryptohopper.com
Technical Analysis 101 | Best Technical Indicators for Crypto Trading - Cryptohopper
Opens in a new window 

kriptomat.io
What Are the Most Popular Technical Indicators in Crypto Trading? - Kriptomat
Opens in a new window 

youhodler.com
Technical Indicators in Crypto Trading: RSI, MACD, Bollinger & More | YouHodler
Opens in a new window 

trakx.io
Technical Analysis in Crypto: Guide for Traders - Trakx
Opens in a new window 

rain.com
Understanding Open Interest in Bitcoin (BTC) Markets - Rain
Opens in a new window 

osl.com
What Is Open Interest in Crypto Trading? - OSL
Opens in a new window 

medium.com
What is the funding rate for perpetual swaps? | by Aditya Palepu | DerivaDEX - Medium
Opens in a new window 

blog.amberdata.io
Funding Rates: How They Impact Perpetual Swap Positions - Amberdata Blog
Opens in a new window 

amberdata.io
Crypto Market Data | Amberdata
Opens in a new window 

coinmarketcap.com
Crypto Fear and Greed Index | CoinMarketCap
Opens in a new window 

coinmetro.com
Crypto Market Sentiment Indicators: Beyond the Fear and Greed Index
Opens in a new window 

investopedia.com
How Implied Volatility (IV) Works With Options and Examples - Investopedia
Opens in a new window 

en.wikipedia.org
Volatility smile - Wikipedia
Opens in a new window 

investopedia.com
Volatility Skew: How it Can Signal Market Sentiment - Investopedia
Opens in a new window 

osl.com
What Is DefiLlama: A DeFi Analytics Essential - OSL
Opens in a new window 

bitwiseinvestments.com
Six Fundamental Metrics to Evaluate DeFi Assets - Bitwise
Opens in a new window 

defillama.com
DefiLlama - DeFi Dashboard
Opens in a new window 

dev.to
How to Read and Analyze TVL Data Using DeFiLlama - DEV Community
Opens in a new window 

tastycrypto.com
What Is DeFiLlama and How Does it Work? 2024 Guide - tastycrypto
Opens in a new window 

trakx.io
Fundamental Analysis In Crypto Trading: Guide For Investors - Trakx
Opens in a new window 

altrady.com
Case Studies of Successful Crypto Fundamental Analysis Projects - Altrady
Opens in a new window 

research.binance.com
A Guide to Fundamental Analysis in Crypto | Binance Research
Opens in a new window 

app.santiment.net
Social Trends - Crypto Sentiment Analysis Tool
Opens in a new window 

app.santiment.net
Crypto Analysis Tools: On-Chain, Social, & Development Data
Opens in a new window 

nasdaq.com
There Could Be an Interest Rate Cut on the Horizon. Here's How That Might Affect Cryptocurrency Prices. | Nasdaq
Opens in a new window 

coinledger.io
How Do Interest Rates Impact Crypto Prices? (2025) - CoinLedger
Opens in a new window 

fidelity.ca
What rising inflation means for bitcoin - Fidelity Investments
Opens in a new window 

repository.upenn.edu
EXPLORING THE RELATIONSHIP BETWEEN BITCOIN AND INFLATION EXPECTATIONS: AN EMPIRICAL ANALYSIS - University of Pennsylvania
Opens in a new window 

frontiersin.org
Long-term nexus of macroeconomic and financial ... - Frontiers
Opens in a new window 

tradingeconomics.com
DXY Dollar Index - Currency Exchange Rate Live Price Chart - Trading Economics
Opens in a new window 

scirp.org
Stock Market Response to Investment in Cryptocurrencies in United State: A Dynamic ARDL Simulation Approach - Scientific Research Publishing
Opens in a new window 

timesofindia.indiatimes.com
Crypto surge: Bitcoin hits record high, smashing past $124,000; Trump policies, Wall Street rally drive rise
Opens in a new window 

spglobal.com
Are crypto markets correlated with macroeconomic ... - S&P Global
Opens in a new window 

investopedia.com
Is There a Cryptocurrency Price Correlation to the Stock Market? - Investopedia
Opens in a new window 

glassnode.com
Glassnode - On-chain market intelligence
Opens in a new window 

finestel.com
Top 12 Onchain Analysis Tools in 2025: All You Need to Know - Finestel
Opens in a new window 

en.wikipedia.org
en.wikipedia.org
Opens in a new window 

investopedia.com
Open Interest: Definition, How It Works, and Example - Investopedia
Opens in a new window 

cmegroup.com
Open Interest - CME Group
Opens in a new window 

en.wikipedia.org
Open interest - Wikipedia
Opens in a new window 

coinbase.com
www.coinbase.com
Opens in a new window 

investopedia.com
Perpetual Futures: What They Are and How They Work - Investopedia
Opens in a new window 

coinbase.com
Understanding Funding Rates in Perpetual Futures and Their Impact | Coinbase
Opens in a new window 

coinbase.com
Understanding Funding Rates in Perpetual Futures and Their Impact - Coinbase
Opens in a new window 

corporatefinanceinstitute.com
Volatility Smile - Overview, When It is Observed, and Limitations
Opens in a new window 

corporatefinanceinstitute.com
corporatefinanceinstitute.com
Opens in a new window 

moomoo.com
What Is a Volatility Smile? - Moomoo
Opens in a new window 

phemex.com
What Is DeFi Llama: Professional Analytics Dashboard - Phemex Academy
Opens in a new window 

investopedia.com
Fundamental Analysis: Principles, Types, and How to Use It - Investopedia
Opens in a new window 

mudrex.com
How The US Fed Rates Impact Crypto Market | Mudrex Learn
Opens in a new window 

fidelity.com
What affects crypto's price? | Crypto volatility - Fidelity Investments
Opens in a new window 

bankrate.com
How The Fed Impacts Stocks, Crypto And Other Investments | Bankrate
Opens in a new window 

coinbase.com
What is inflation? - Coinbase
Opens in a new window 

bitwiseinvestments.com
Unpacking the Intricate Relationship Between Bitcoin and Inflation - Bitwise
Opens in a new window 

wuab.org
INFLATION AND CRYPTO, WHAT RELATIONSHIP? - WUAB
Opens in a new window 
corporatefinanceinstitute.com
Cryptocurrency vs Stocks - Similarities, Differences - Corporate Finance Institute
Opens in a new window 
Sources read but not used in the report
arxiv.org
Blockchain Data Analytics: Review and Challenges - arXiv
Opens in a new window 
corporatefinanceinstitute.com
Cryptocurrency Inflation and Deflation - How It Works - Corporate Finance Institute
Opens in a new window 
economictimes.indiatimes.com
Bitcoin at $124K, reaches all-time high. Here's what experts say
Opens in a new window 
repository.upenn.edu
EXPLORING THE RELATIONSHIP BETWEEN BITCOIN AND INFLATION EXPECTATIONS: AN EMPIRICAL ANALYSIS - University of Pennsylvania
Opens in a new window 
bis.org
Determinants of the price of bitcoin: An analysis with machine learning and interpretability techniques - Bank for International Settlements
Opens in a new window 
newyorkfed.org
The Bitcoin–Macro Disconnect - Federal Reserve Bank of New York
Opens in a new window 
fdic.gov
The Efects of Cryptocurrency Wealth on Household Consumption and Investment - FDIC
Opens in a new window 
economictimes.indiatimes.com
BlackRock’s crypto holdings top $100 billion; Bitcoin dominates portfolio
Opens in a new window 
economictimes.indiatimes.com
Peter Thiel, who backs Bullish, once gave Mark Zuckerberg $500,000 and later turned it into $400 million jackpot
Opens in a new window 
theblock.co
Crypto Futures Data and Charts for Open Interest, Volume and ...
Opens in a new window 
Thoughts

Research Goal
I'm starting to research the top 50 factors, indicators, and market conditions an AI would need to analyze to build a comprehensive 'world model' for the cryptocurrency, blockchain, and DeFi markets. My approach is to break down the user's request into several key research areas.

Initial Research Strategy
I'm beginning with a broad search across several categories to get a general overview and identify key resources. These categories include standard financial indicators and technical analysis, on-chain metrics, fundamental analysis, DeFi-specific metrics, market sentiment and social trends, macroeconomic factors, and derivatives market metrics. This initial phase will help me pinpoint high-quality sources for deeper investigation.

Next Steps
After this initial broad search, I will analyze the results to identify reputable sources such as Messari, Glassnode, DeFi Llama, and established financial education websites. I will then use these sources to delve deeper into each topic, gathering specific indicators and their definitions. I will also look for academic papers or research from crypto analysis firms to ensure a comprehensive understanding.
Researching websites 
amberdata.io
Crypto Market Data | Amberdata
theblock.co
Crypto Futures Data and Charts for Open Interest, Volume and Funding Rates - The Block
blog.obiex.finance
On-Chain Metrics That Matter in Crypto Trading - Obiex Blog
coinmarketcap.com
CMC Crypto Fear and Greed Index - CoinMarketCap
glassnode.com
Glassnode - On-chain market intelligence
fxtrendo.com
Practical and Important Indicators for Fundamental Analysis in Cryptocurrencies - Trendo
arxiv.org
Blockchain Data Analytics: Review and Challenges - arXiv
finestel.com
Top 12 Onchain Analysis Tools in 2025: All You Need to Know - Finestel

app.santiment.net
Social Trends - Crypto Sentiment Analysis Tool

youhodler.com
Fundamental Analysis in Cryptocurrency: How to Evaluate Crypto Projects - YouHodler

kraken.com
Crypto technical indicators: A beginners guide | Kraken

coinmetro.com
Crypto Market Sentiment Indicators: Beyond the Fear and Greed Index - Coinmetro

artemis.xyz
Artemis

trakx.io
Fundamental Analysis In Crypto Trading: Guide For Investors - Trakx

app.santiment.net
Crypto Analysis Tools: On-Chain, Social, & Development Data

insights.glassnode.com
Glassnode Insights - On-Chain Market Intelligence

research.binance.com
A Guide to Fundamental Analysis in Crypto | Binance Research

investopedia.com
Fundamental Analysis: Principles, Types, and How to Use It - Investopedia

altrady.com
Case Studies of Successful Crypto Fundamental Analysis Projects - Altrady

kriptomat.io
What Are the Most Popular Technical Indicators in Crypto Trading? - Kriptomat

youhodler.com
Technical Indicators in Crypto Trading: RSI, MACD, Bollinger & More | YouHodler

cryptohopper.com
Technical Analysis 101 | Best Technical Indicators for Crypto Trading - Cryptohopper

trakx.io
Technical Analysis in Crypto: Guide for Traders - Trakx

osl.com
What Is DefiLlama: A DeFi Analytics Essential - OSL

dev.to
How to Read and Analyze TVL Data Using DeFiLlama - DEV Community

defillama.com
DefiLlama - DeFi Dashboard

tastycrypto.com
What Is DeFiLlama and How Does it Work? 2024 Guide - tastycrypto

bitwiseinvestments.com
Six Fundamental Metrics to Evaluate DeFi Assets - Bitwise

phemex.com
What Is DeFi Llama: Professional Analytics Dashboard - Phemex Academy

Gathering Key Market Indicators
I've initiated a broad search to identify crucial factors across various categories that an AI would need to analyze for a cryptocurrency world model. My initial searches have provided a wealth of information on technical analysis indicators (like Moving Averages, RSI, MACD, Bollinger Bands, and Volume indicators), on-chain metrics (such as MVRV, Exchange Flows, NUPL, and SOPR), and fundamental analysis frameworks (including project team, whitepaper, tokenomics, market capitalization, and liquidity). I've also started gathering data on DeFi-specific metrics (like Total Value Locked, stablecoin market dominance, and yield opportunities) and market sentiment indicators (such as the Fear and Greed Index, social media trends, and derivatives market data like open interest and funding rates).

Identifying Key Data Sources
I'm identifying prominent platforms and resources that specialize in these areas. For technical indicators, Kraken, Kriptomat, and YouHodler have provided good overviews. For on-chain data, Glassnode and Obiex Blog are proving to be valuable. For fundamental analysis, YouHodler, Trakx, and Binance Research offer comprehensive frameworks. DeFiLlama is a central hub for DeFi metrics, and CoinMarketCap, Santiment, and Coinmetro are useful for market sentiment. I'm also looking into derivatives market data from Amberdata and The Block.

Next Steps in Data Collection
My next step is to delve deeper into the information provided by these identified sources. I will systematically explore the detailed explanations and examples of each indicator and metric to build a robust understanding of their relevance and application in the crypto market. I will also continue to broaden my search to include macroeconomic factors that influence cryptocurrency prices, ensuring a holistic data set for the AI model.

Researching websites 

tradingeconomics.com
DXY Dollar Index - Currency Exchange Rate Live Price Chart - Trading Economics
coinbase.com
What is inflation? - Coinbase
nasdaq.com
There Could Be an Interest Rate Cut on the Horizon. Here's How That Might Affect Cryptocurrency Prices. | Nasdaq

fidelity.ca
What rising inflation means for bitcoin - Fidelity Investments
coinledger.io
How Do Interest Rates Impact Crypto Prices? (2025) - CoinLedger
wuab.org
INFLATION AND CRYPTO, WHAT RELATIONSHIP? - WUAB
frontiersin.org
Long-term nexus of macroeconomic and financial fundamentals with cryptocurrencies - Frontiers
investopedia.com
Is There a Cryptocurrency Price Correlation to the Stock Market? - Investopedia
fidelity.com
What affects crypto's price? | Crypto volatility - Fidelity Investments
corporatefinanceinstitute.com
Cryptocurrency Inflation and Deflation - How It Works - Corporate Finance Institute
bankrate.com
How The Fed Impacts Stocks, Crypto And Other Investments | Bankrate
repository.upenn.edu
EXPLORING THE RELATIONSHIP BETWEEN BITCOIN AND INFLATION EXPECTATIONS: AN EMPIRICAL ANALYSIS - University of Pennsylvania
spglobal.com
Are crypto markets correlated with macroeconomic factors? - S&P Global

economictimes.indiatimes.com
Bitcoin at $124K, reaches all-time high. Here's what experts say

repository.upenn.edu
EXPLORING THE RELATIONSHIP BETWEEN BITCOIN AND INFLATION EXPECTATIONS: AN EMPIRICAL ANALYSIS - University of Pennsylvania

bitwiseinvestments.com
Unpacking the Intricate Relationship Between Bitcoin and Inflation - Bitwise

mudrex.com
How The US Fed Rates Impact Crypto Market | Mudrex Learn

bis.org
Determinants of the price of bitcoin: An analysis with machine learning and interpretability techniques - Bank for International Settlements

newyorkfed.org
The Bitcoin–Macro Disconnect - Federal Reserve Bank of New York

fdic.gov
The Efects of Cryptocurrency Wealth on Household Consumption and Investment - FDIC

scirp.org
Stock Market Response to Investment in Cryptocurrencies in United State: A Dynamic ARDL Simulation Approach - Scientific Research Publishing

timesofindia.indiatimes.com
Crypto surge: Bitcoin hits record high, smashing past $124,000; Trump policies, Wall Street rally drive rise

corporatefinanceinstitute.com
Cryptocurrency vs Stocks - Similarities, Differences - Corporate Finance Institute

economictimes.indiatimes.com
BlackRock’s crypto holdings top $100 billion; Bitcoin dominates portfolio

economictimes.indiatimes.com
Peter Thiel, who backs Bullish, once gave Mark Zuckerberg $500,000 and later turned it into $400 million jackpot

coinmarketcap.com
Crypto Fear and Greed Index | CoinMarketCap

amberdata.io
Crypto Market Data | Amberdata

tastycrypto.com
What Is DeFiLlama and How Does it Work? 2024 Guide - tastycrypto

kraken.com
Crypto technical indicators: A beginners guide | Kraken

blog.obiex.finance
On-Chain Metrics That Matter in Crypto Trading - Obiex Blog

Progress in Data Collection
I've made significant progress in gathering information across various categories for building a cryptocurrency world model. I have a solid understanding of technical analysis indicators, including their types (overlays, oscillators, leading, lagging) and how they relate to trend, momentum, volume, and volatility. I've also delved into key on-chain metrics like Market Value to Realized Value (MVRV), Net Unrealized Profit or Loss (NUPL), Spent Output Profit Ratio (SOPR), and exchange flows, which provide insights into market valuation and holder behavior. For DeFi, I've identified crucial metrics such as Total Value Locked (TVL), stablecoin market cap, DEX volume, and yield opportunities, primarily through the comprehensive data offered by DeFiLlama. Additionally, I've gained insights into market sentiment through the Fear and Greed Index, which incorporates factors like price momentum, volatility, derivatives market data, and social trends.

Addressing Information Gaps
While I've gathered a substantial amount of data, I've identified a few areas that require further investigation. I need to deepen my understanding of fundamental analysis by exploring additional sources that provide a comprehensive framework for evaluating crypto projects. Similarly, I need to extract more specific details on macroeconomic factors influencing crypto prices and clarify the definitions of key derivatives market terms like 'open interest' and 'funding rates'.

Refining the Research Strategy
To address these gaps, I will focus on browsing specific articles that are likely to contain the missing information on fundamental analysis and macroeconomic factors. I will also conduct more targeted searches for precise definitions of derivatives market metrics. This focused approach will help me consolidate all the necessary data points to compile a comprehensive list of factors for the AI's pre-training phase.

Researching websites 

corporatefinanceinstitute.com
corporatefinanceinstitute.com

moomoo.com
What Is a Volatility Smile? - Moomoo

en.wikipedia.org
en.wikipedia.org

cmegroup.com
Open Interest - CME Group

en.wikipedia.org
Volatility smile - Wikipedia

coinbase.com
www.coinbase.com

corporatefinanceinstitute.com
Volatility Smile - Overview, When It is Observed, and Limitations

en.wikipedia.org
Open interest - Wikipedia

medium.com
What is the funding rate for perpetual swaps? | by Aditya Palepu | DerivaDEX - Medium

rain.com
Understanding Open Interest in Bitcoin (BTC) Markets - Rain

investopedia.com
How Implied Volatility (IV) Works With Options and Examples - Investopedia

coinbase.com
Understanding Funding Rates in Perpetual Futures and Their Impact - Coinbase

investopedia.com
Open Interest: Definition, How It Works, and Example - Investopedia

investopedia.com
Volatility Skew: How it Can Signal Market Sentiment - Investopedia

coinbase.com
Understanding Funding Rates in Perpetual Futures and Their Impact | Coinbase

blog.amberdata.io
Funding Rates: How They Impact Perpetual Swap Positions - Amberdata Blog

osl.com
What Is Open Interest in Crypto Trading? - OSL

investopedia.com
Perpetual Futures: What They Are and How They Work - Investopedia

theblock.co
Crypto Futures Data and Charts for Open Interest, Volume and ...

frontiersin.org
Long-term nexus of macroeconomic and financial ... - Frontiers

coinmetro.com
Crypto Market Sentiment Indicators: Beyond the Fear and Greed Index

spglobal.com
Are crypto markets correlated with macroeconomic ... - S&P Global

trakx.io
Fundamental Analysis In Crypto Trading: Guide For Investors - Trakx

research.binance.com
A Guide to Fundamental Analysis in Crypto | Binance Research

Comprehensive Data Collection Achieved
I have successfully gathered extensive information across all the defined research areas for building a cryptocurrency world model. This includes a robust list of technical analysis indicators, detailed on-chain metrics, a comprehensive framework for fundamental analysis, and a thorough understanding of DeFi-specific metrics. I've also gained significant insights into market sentiment indicators and key macroeconomic factors influencing crypto prices. Furthermore, I have successfully defined and understood crucial derivatives market metrics like open interest and funding rates.

Information Gaps Resolved
My targeted searches and browsing have effectively filled the previously identified information gaps. I now have a complete picture of fundamental analysis components, specific macroeconomic indicators, and clear definitions for derivatives market terms. This iterative process of searching and synthesizing has allowed me to achieve a high level of data saturation for each category.

Next Steps: Synthesizing the Findings
Having completed the data collection phase, I am now ready to synthesize all the gathered information into a structured and categorized list of factors and indicators. My next action will be to compile a comprehensive report that outlines all the identified elements crucial for pre-training an AI model for the cryptocurrency, blockchain, and DeFi markets.
