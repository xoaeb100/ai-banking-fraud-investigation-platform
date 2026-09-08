import { InvestigationOutputSchema } from './investigation-output.schema';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
describe('InvestigationOutputSchema', () => {
  it('should accept valid investigation output', () => {
    const validOutput = {
      riskAssessment: 'HIGH',
      summary: 'Transaction requires human analyst review.',
      evidence: ['High transaction velocity', 'New merchant'],
      policyReferences: [],
      recommendedAction: 'ESCALATE',
      confidence: 0.92,
    };

    const result = InvestigationOutputSchema.safeParse(validOutput);

    expect(result.success).toBe(true);
  });

  it('should reject an invalid risk assessment', () => {
    const invalidOutput = {
      riskAssessment: 'CRITICAL',
      summary: 'Transaction requires human analyst review.',
      evidence: ['High transaction velocity'],
      policyReferences: [],
      recommendedAction: 'ESCALATE',
      confidence: 0.92,
    };

    const result = InvestigationOutputSchema.safeParse(invalidOutput);

    expect(result.success).toBe(false);
  });

  it('should reject invalid confidence', () => {
    const invalidOutput = {
      riskAssessment: 'HIGH',
      summary: 'Transaction requires human analyst review.',
      evidence: ['High transaction velocity'],
      policyReferences: [],
      recommendedAction: 'ESCALATE',
      confidence: 1.5,
    };

    const result = InvestigationOutputSchema.safeParse(invalidOutput);

    expect(result.success).toBe(false);
  });

  it('should reject missing required fields', () => {
    const invalidOutput = {
      riskAssessment: 'HIGH',
      summary: 'Transaction requires human analyst review.',
    };

    const result = InvestigationOutputSchema.safeParse(invalidOutput);

    expect(result.success).toBe(false);
  });
});
