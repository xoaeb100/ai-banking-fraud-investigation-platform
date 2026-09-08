import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { InvestigationCaseService } from './investigation-case.service';
import { UpdateCaseStatusDto } from './dto/update-case-status.dto';
import { AssignCaseDto } from './dto/assign-case.dto';
@Controller('investigation-cases')
export class InvestigationCaseController {
  constructor(
    private readonly investigationCaseService: InvestigationCaseService,
  ) {}
  @Get() getAllCases() {
    return this.investigationCaseService.getAllCases();
  }
  @Get(':id') getCase(@Param('id') id: string) {
    return this.investigationCaseService.getCaseById(id);
  }
  @Patch(':id/status') updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateCaseStatusDto,
  ) {
    return this.investigationCaseService.updateStatus(id, dto.status);
  }

  @Patch(':id/assign')
  assignCase(@Param('id') id: string, @Body() dto: AssignCaseDto) {
    return this.investigationCaseService.assignCase(id, dto.assignedTo);
  }
}
