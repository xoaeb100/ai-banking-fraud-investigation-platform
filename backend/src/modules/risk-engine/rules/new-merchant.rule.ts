export interface NewMerchantRuleResult {
  triggered: boolean;
  score: number;
  reason?: string;
}

export class NewMerchantRule {
  private readonly score = 15;

  evaluate(isNewMerchant: boolean): NewMerchantRuleResult {
    if (isNewMerchant) {
      return {
        triggered: true,
        score: this.score,
        reason: 'New merchant',
      };
    }

    return {
      triggered: false,
      score: 0,
    };
  }
}
