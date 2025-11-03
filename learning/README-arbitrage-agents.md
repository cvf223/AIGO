# Flash Loan Arbitrage Agent System

## Overview
This system consists of three main agents:
- **Spotter**: Scans all pools for arbitrage opportunities using enriched data.
- **Strategist**: Analyzes opportunities for viability and optimal execution.
- **Executor**: Executes flash loan arbitrage and logs outcomes.

All agents use reinforcement learning (RL) style reward/penalty logic to improve over time, and reference external learning materials for ongoing improvement.

---

## RL Reward/Penalty Logic
- **Spotter**
  - +10: Profitable opportunity detected
  - -5: Unprofitable/false opportunity
- **Strategist**
  - +10: Correct analysis (profitable)
  - -5: False positive/negative
- **Executor**
  - +10: Successful execution (profit > 0)
  - -10: Failed/unprofitable execution

Agents log their score and suggest variable tuning (e.g., minDelta, minProfitAfterGas) based on outcomes.

---

## Variable Tuning
- `minDelta`: Minimum price difference to consider
- `minProfitAfterGas`: Minimum profit after gas/fees
- `cooldownPeriod`: Minimum time between triggers for the same opportunity
- `maxConcurrentExecutions`: Max simultaneous arbitrage attempts

Agents will log suggestions for tuning these based on recent results.

---

## Learning Materials
Agents reference `learning-materials.json` for:
- YouTube videos
- DeFi analytics dashboards
- Protocol whitepapers

### Example Resources
- [Flash Loan Arbitrage 101 (YouTube)](https://www.youtube.com/watch?v=3x1b_S6Qp2Q)
- [DeFiLlama DEX Analytics](https://defillama.com/)
- [Dune Analytics: Arbitrage Dashboards](https://dune.com/)
- [AlphaDay: New Protocols](https://alphaday.com/)
- [Uniswap V3 Whitepaper](https://uniswap.org/whitepaper-v3.pdf)

### Adding New Learning Materials
1. Edit `agent/scripts/learning-materials.json`
2. Add an object:
   ```json
   {
     "title": "New Resource Title",
     "url": "https://...",
     "summary": "Short summary of what this resource teaches."
   }
   ```
3. Agents will automatically reference new materials in their logs and reasoning.

---

## Quickstart
- Ensure `allpools.json` is enriched.
- Add new learning resources to `learning-materials.json` as you discover them.
- Run the agents. They will:
  - Use all enriched pool fields for fast, accurate analysis
  - Log RL rewards/penalties and suggestions for improvement
  - Reference learning materials for ongoing self-improvement

---

For questions or to contribute new strategies, open an issue or PR! 