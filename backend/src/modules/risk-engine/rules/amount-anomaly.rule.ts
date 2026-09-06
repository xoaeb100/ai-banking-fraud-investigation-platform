export interface AmountAnomalyRuleResult {
  triggered: boolean;
  score: number;
  reason?: string;
}

export class AmountAnomalyRule {
  private readonly threshold = 5;
  private readonly score = 20;

  evaluate(amountRatio: number): AmountAnomalyRuleResult {
    if (amountRatio >= this.threshold) {
      return {
        triggered: true,
        score: this.score,
        reason: 'Transaction amount significantly exceeds customer baseline',
      };
    }

    return {
      triggered: false,
      score: 0,
    };
  }
}
