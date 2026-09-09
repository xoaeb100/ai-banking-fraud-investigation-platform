import { IsNotEmpty, IsString } from 'class-validator';

export class IngestPolicyDto {
  @IsString()
  @IsNotEmpty()
  documentName!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;
}
