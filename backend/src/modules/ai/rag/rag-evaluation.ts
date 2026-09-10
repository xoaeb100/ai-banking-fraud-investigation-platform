export interface RagEvaluationCase {
  query: string;
  expectedDocument: string;
  expectedSection: string;
}

export const RAG_EVALUATION_CASES: RagEvaluationCase[] = [
  {
    query: 'Should multiple transactions in a short period be investigated?',
    expectedDocument: 'Transaction Monitoring Policy',
    expectedSection: 'Transaction Velocity',
  },
  {
    query:
      'Who is responsible for making the final decision about whether a suspicious transaction is fraud?',
    expectedDocument: 'Escalation Policy',
    expectedSection: 'Final Decision',
  },
  {
    query:
      'What information should an investigator review before assessing a suspicious transaction?',
    expectedDocument: 'Investigation Procedures',
    expectedSection: 'Supporting Evidence',
  },
  {
    query: 'What should happen when a transaction is classified as HIGH risk?',
    expectedDocument: 'Transaction Monitoring Policy',
    expectedSection: 'High Risk Transactions',
  },
];
