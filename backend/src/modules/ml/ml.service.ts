import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

import { MlPredictRequestDto } from './dto/ml-predict-request.dto';
import { MlPredictResponseDto } from './dto/ml-predict-response.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MlService {
  private readonly logger = new Logger(MlService.name);

  private readonly maxAttempts = 3;
  private readonly requestTimeout = 3000;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private get mlServiceUrl(): string {
    return this.configService.get<string>(
      'ml.serviceUrl',
      'http://localhost:8000',
    );
  }

  async predict(request: MlPredictRequestDto): Promise<MlPredictResponseDto> {
    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      try {
        this.logger.log(
          `Calling ML service (attempt ${attempt}/${this.maxAttempts})`,
        );

        const response = await firstValueFrom(
          this.httpService.post<MlPredictResponseDto>(
            `${this.mlServiceUrl}/predict`,
            request,
            {
              timeout: this.requestTimeout,
            },
          ),
        );

        this.logger.log(`ML prediction received: ${response.data.prediction}`);

        return response.data;
      } catch (error) {
        const shouldRetry = this.shouldRetry(error);

        this.logger.warn(`ML service attempt ${attempt} failed`);

        if (!shouldRetry || attempt === this.maxAttempts) {
          this.logger.error(
            'ML service unavailable',
            error instanceof Error ? error.stack : undefined,
          );

          throw new ServiceUnavailableException(
            'ML service is currently unavailable',
          );
        }

        await this.sleep(attempt * 300);
      }
    }

    throw new ServiceUnavailableException(
      'ML service is currently unavailable',
    );
  }

  private shouldRetry(error: unknown): boolean {
    if (!(error instanceof AxiosError)) {
      return false;
    }

    if (!error.response) {
      return true;
    }

    return error.response.status >= 500;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
