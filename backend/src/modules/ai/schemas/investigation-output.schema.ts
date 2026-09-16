import { z } from 'zod';

export const InvestigationOutputSchema = z.object({
  riskAssessment: z.enum(['LOW', 'MEDIUM', 'HIGH']),

  summary: z.string(),

  evidence: z.array(
    z.object({
      type: z.enum(['OBSERVED_FACT', 'POLICY', 'INTERPRETATION']),
      source: z.string(),
      content: z.string(),
    }),
  ),
  policyReferences: z.array(z.string()),

  recommendedAction: z.enum(['MONITOR', 'REVIEW', 'ESCALATE']),

  confidence: z.number().min(0).max(1),
});

export type InvestigationOutput = z.infer<typeof InvestigationOutputSchema>;
