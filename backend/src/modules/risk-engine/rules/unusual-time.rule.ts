export interface UnusualTimeRuleResult {
  triggered: boolean;
  score: number;
  reason?: string;
}

export class UnusualTimeRule {
  private readonly score = 10;

  evaluate(isUnusualTransactionTime: boolean): UnusualTimeRuleResult {
    if (isUnusualTransactionTime) {
      return {
        triggered: true,
        score: this.score,
        reason: 'Unusual transaction time',
      };
    }

    return {
      triggered: false,
      score: 0,
    };
  }
}
