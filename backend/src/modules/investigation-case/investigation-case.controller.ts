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
  @Get(':alertId')
  getCase(@Param('alertId') alertId: string) {
    return this.investigationCaseService.getCaseByAlertId(alertId);
  }

  @Patch(':alertId/status')
  updateStatus(
    @Param('alertId') alertId: string,
    @Body() dto: UpdateCaseStatusDto,
  ) {
    return this.investigationCaseService.updateStatus(alertId, dto.status);
  }

  @Patch(':alertId/assign')
  assignCase(@Param('alertId') alertId: string, @Body() dto: AssignCaseDto) {
    return this.investigationCaseService.assignCase(alertId, dto.assignedTo);
  }
}
