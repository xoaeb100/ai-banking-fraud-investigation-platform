import { beforeEach, describe, expect, it } from '@jest/globals';
import { VelocityRule } from './velocity.rule';

describe('VelocityRule', () => {
  let rule: VelocityRule;

  beforeEach(() => {
    rule = new VelocityRule();
  });

  it('should not trigger when transaction velocity is below the threshold', () => {
    const result = rule.evaluate(2);

    expect(result.triggered).toBe(false);
    expect(result.score).toBe(0);
    expect(result.reason).toBeUndefined();
  });

  it('should trigger when transaction velocity reaches the threshold', () => {
    const result = rule.evaluate(5);

    expect(result.triggered).toBe(true);
    expect(result.score).toBe(20);
    expect(result.reason).toBe('High transaction velocity');
  });
});
