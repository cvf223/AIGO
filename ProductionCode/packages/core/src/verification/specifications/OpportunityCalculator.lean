-- Formal Specification for the Opportunity Profit Calculator
-- Language: Lean 4

/-
  This file defines the formal mathematical properties of our arbitrage profit
  calculation. It serves as the absolute source of truth. The FormalProofService
  will verify that the JavaScript implementation adheres to these theorems.

  We use `Int` (arbitrary-precision integers) to perfectly model the `BigInt`
  used in our JavaScript/ethers.js implementation, avoiding floating-point errors.
-/

-- Define a function signature for calculating net profit.
-- It takes gross revenue and total costs and returns the net profit.
def calculate_net_profit (grossRevenue : Int) (totalCosts : Int) : Int :=
  grossRevenue - totalCosts

-- Theorem 1: The core logic of profit calculation.
-- It states that for any non-negative gross revenue and total costs, the
-- calculated net profit must equal the gross revenue minus the total costs.
theorem net_profit_is_always_gross_minus_costs :
  ∀ (grossRevenue totalCosts : Int),
    (grossRevenue ≥ 0 ∧ totalCosts ≥ 0) →
    calculate_net_profit grossRevenue totalCosts = grossRevenue - totalCosts :=
by
  -- The proof is trivial by definition. `simp` simplifies the goal using the definition.
  intro grossRevenue totalCosts
  intro h
  simp [calculate_net_profit]

-- Theorem 2: Profitability condition.
-- An opportunity is only profitable if the net profit is greater than zero.
theorem is_profitable_iff_net_profit_is_positive :
  ∀ (grossRevenue totalCosts : Int),
    (grossRevenue ≥ 0 ∧ totalCosts ≥ 0) →
    (calculate_net_profit grossRevenue totalCosts > 0 ↔ grossRevenue > totalCosts) :=
by
  intro grossRevenue totalCosts
  intro h
  simp [calculate_net_profit]
  -- We need to show that (a - b > 0) is equivalent to (a > b) for integers.
  apply Int.sub_pos
