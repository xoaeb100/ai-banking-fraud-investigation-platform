import { Injectable } from '@nestjs/common';

@Injectable()
export class ChunkingService {
  chunkDocument(document: string): string[] {
    return document
      .split(/\n\s*\n/)
      .map((chunk) => chunk.trim())
      .filter((chunk) => chunk.length > 0);
  }
}
