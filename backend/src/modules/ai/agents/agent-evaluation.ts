export interface AgentEvaluationCase {
  name: string;
  description: string;
  input: {
    transactionId: string;
    riskScore: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    riskReasons: string[];
  };
  expectedRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  requiresPolicySearch: boolean;
  expectedTools: string[];
}

export const AGENT_EVALUATION_CASES: AgentEvaluationCase[] = [
  {
    name: 'High risk investigation',
    description:
      'Agent should investigate a HIGH risk transaction and preserve the backend risk level.',
    input: {
      transactionId: 'c74645e0-5eb8-451a-adb8-63033f4d9810',
      riskScore: 92,
      riskLevel: 'HIGH',
      riskReasons: [
        'High transaction velocity',
        'New merchant',
        'Unusual transaction time',
      ],
    },
    expectedRiskLevel: 'HIGH',
    expectedTools: ['get_transaction', 'get_customer_history'],
    requiresPolicySearch: true,
  },
];
