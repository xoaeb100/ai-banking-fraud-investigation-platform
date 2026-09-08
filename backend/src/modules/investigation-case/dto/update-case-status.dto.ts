import { IsEnum } from 'class-validator';

import { InvestigationCaseStatus } from '../enums/investigation-case-status.enum';

export class UpdateCaseStatusDto {
  @IsEnum(InvestigationCaseStatus)
  status!: InvestigationCaseStatus;
}
