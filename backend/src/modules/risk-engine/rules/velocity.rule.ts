export interface VelocityRuleResult {
  triggered: boolean;
  score: number;
  reason?: string;
}
export class VelocityRule {
  private readonly threshold = 5;
  private readonly score = 20;

  evaluate(transactionsLast10Min: number): VelocityRuleResult {
    if (transactionsLast10Min >= this.threshold) {
      return {
        triggered: true,
        score: this.score,
        reason: 'High transaction velocity',
      };
    }

    return {
      triggered: false,
      score: 0,
    };
  }
}
