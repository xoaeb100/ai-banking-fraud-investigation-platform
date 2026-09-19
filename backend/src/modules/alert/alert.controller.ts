import { Controller, Get } from '@nestjs/common';
import { AlertService } from './alert.service';
import { Param, ParseUUIDPipe } from '@nestjs/common';
@Controller('alerts')
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @Get()
  async findAll() {
    console.log('Fetching all alerts...');
    return this.alertService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.alertService.findOne(id);
  }
}
