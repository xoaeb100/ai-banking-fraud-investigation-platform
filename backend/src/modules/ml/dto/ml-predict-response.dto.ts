export class MlPredictResponseDto {
  legitimateProbability!: number;
  fraudProbability!: number;
  riskScore!: number;
  prediction!: string;
}
