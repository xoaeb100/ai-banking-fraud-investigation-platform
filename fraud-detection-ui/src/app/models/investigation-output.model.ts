export interface InvestigationEvidence {
  type: 'OBSERVED_FACT' | 'POLICY' | 'INTERPRETATION';
  source: string;
  content: string;
}

export interface InvestigationOutput {
  riskAssessment: 'LOW' | 'MEDIUM' | 'HIGH';
  summary: string;
  evidence: InvestigationEvidence[];
  policyReferences: string[];
  recommendedAction: 'MONITOR' | 'REVIEW' | 'ESCALATE';
  confidence: number;
}
