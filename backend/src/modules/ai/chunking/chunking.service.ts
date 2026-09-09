import { Injectable } from '@nestjs/common';
export interface PolicyChunk {
  section: string | null;
  content: string;
}
@Injectable()
export class ChunkingService {
  chunkDocument(document: string): PolicyChunk[] {
    const lines = document.split('\n');
    let currentSection: string | null = null;
    const chunks: PolicyChunk[] = [];
    let currentContent: string[] = [];
    const flushChunk = () => {
      const content = currentContent.join('\n').trim();
      if (content.length > 0) {
        chunks.push({ section: currentSection, content });
      }
      currentContent = [];
    };
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('## ')) {
        flushChunk();
        currentSection = trimmedLine.substring(3).trim();
        continue;
      }
      if (trimmedLine.startsWith('# ')) {
        continue;
      }
      if (trimmedLine.length === 0) {
        flushChunk();
        continue;
      }
      currentContent.push(trimmedLine);
    }
    flushChunk();
    return chunks;
  }
}
