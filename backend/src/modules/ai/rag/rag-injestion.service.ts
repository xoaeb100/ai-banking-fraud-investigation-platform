import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmbeddingService } from '../embedding/embedding.service';
import { ChunkingService } from '../chunking/chunking.service';
import { PolicyChunk } from './entities/policy-chunk.entity';
@Injectable()
export class RagIngestionService {
  constructor(
    @InjectRepository(PolicyChunk)
    private readonly policyChunkRepository: Repository<PolicyChunk>,
    private readonly embeddingService: EmbeddingService,
    private readonly chunkingService: ChunkingService,
  ) {}
  async ingestDocument(
    documentName: string,
    content: string,
  ): Promise<PolicyChunk[]> {
    await this.policyChunkRepository.delete({
      documentName,
    });

    const chunks = this.chunkingService.chunkDocument(content);
    const policyChunks: PolicyChunk[] = [];
    for (const chunk of chunks) {
      const embedding = await this.embeddingService.generateEmbedding(
        chunk.content,
      );
      const policyChunk = this.policyChunkRepository.create({
        documentName,
        section: chunk.section,
        content: chunk.content,
        embedding,
      });
      policyChunks.push(policyChunk);
    }
    return this.policyChunkRepository.save(policyChunks);
  }
}
