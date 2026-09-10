import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { EmbeddingService } from './embedding/embedding.service';
import { ChunkingService } from './chunking/chunking.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PolicyChunk } from './rag/entities/policy-chunk.entity';
import { RagIngestionService } from './rag/rag-injestion.service';
import { RagRetrievalService } from './rag/rag-retrieval.service';
import { RagEvaluationService } from './rag/rag-evaluation.service';
@Module({
  controllers: [AiController],
  providers: [
    AiService,
    EmbeddingService,
    ChunkingService,
    RagIngestionService,
    RagRetrievalService,
    RagEvaluationService,
  ],
  exports: [EmbeddingService, ChunkingService],
  imports: [TypeOrmModule.forFeature([PolicyChunk])],
})
export class AiModule {}
