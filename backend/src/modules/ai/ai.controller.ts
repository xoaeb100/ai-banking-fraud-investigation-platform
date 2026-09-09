import { Body, Controller, Get, Post } from '@nestjs/common';

import { AiService } from './ai.service';
import { EmbeddingService } from './embedding/embedding.service';
import { InvestigationInput } from './dto/investigation-input.dto';
import { RagIngestionService } from './rag/rag-injestion.service';
import { IngestPolicyDto } from './dto/ingest-policy.dto';
import { Query } from '@nestjs/common';
import { RagRetrievalService } from './rag/rag-retrieval.service';

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly embeddingService: EmbeddingService,
    private readonly ragIngestionService: RagIngestionService,
    private readonly ragRetrievalService: RagRetrievalService,
  ) {}

  @Post('investigate')
  investigate(@Body() input: InvestigationInput) {
    return this.aiService.generateInvestigationSummary(input);
  }

  @Post('test-embedding')
  testEmbedding() {
    return this.embeddingService.testEmbedding();
  }

  @Post('test-similarity')
  testSimilarity() {
    return this.embeddingService.testSimilarity();
  }

  @Post('rag/ingest')
  ingestPolicy(@Body() input: IngestPolicyDto) {
    return this.ragIngestionService.ingestDocument(
      input.documentName,
      input.content,
    );
  }

  @Get('rag/search')
  searchPolicy(@Query('q') query: string, @Query('topK') topK = '3') {
    return this.ragRetrievalService.search(query, Number(topK));
  }
}
