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
import { TransactionModule } from '../transaction/transaction.module';
import { InvestigationAgent } from './agents/investigation.agent';
import { AgentEvaluationService } from './agents/agent-evaluation.service';
@Module({
  controllers: [AiController],
  providers: [
    AiService,
    EmbeddingService,
    ChunkingService,
    RagIngestionService,
    RagRetrievalService,
    RagEvaluationService,
    InvestigationAgent,
    AgentEvaluationService,
  ],
  exports: [EmbeddingService, ChunkingService],
  imports: [TypeOrmModule.forFeature([PolicyChunk]), TransactionModule],
})
export class AiModule {}
