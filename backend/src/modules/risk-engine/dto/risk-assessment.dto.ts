import { RiskLevel } from '../enums/risk-level.enum';

export class RiskAssessmentDto {
  riskScore!: number;
  riskLevel!: RiskLevel;
  reasons!: string[];
  mlFraudProbability!: number;
}
