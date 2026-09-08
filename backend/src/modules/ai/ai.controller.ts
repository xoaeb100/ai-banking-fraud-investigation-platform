import { Body, Controller, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import { InvestigationInput } from './dto/investigation-input.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('investigate')
  investigate(@Body() input: InvestigationInput) {
    return this.aiService.generateInvestigationSummary(input);
  }
}
