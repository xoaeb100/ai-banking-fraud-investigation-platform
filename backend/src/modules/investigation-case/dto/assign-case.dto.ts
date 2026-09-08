import { IsUUID } from 'class-validator';
export class AssignCaseDto {
  @IsUUID() assignedTo!: string;
}
