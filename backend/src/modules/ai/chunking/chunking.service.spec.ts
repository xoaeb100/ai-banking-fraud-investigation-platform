import { describe, expect, it } from '@jest/globals';

import { ChunkingService } from './chunking.service';

describe('ChunkingService', () => {
  it('should split a document into non-empty chunks', () => {
    const service = new ChunkingService();

    const document = `
Transaction Monitoring Policy

The bank monitors transactions for unusual patterns.

Velocity Monitoring

Multiple transactions within a short period may require investigation.

Escalation

HIGH risk transactions must be reviewed by a fraud investigator.
`;

    const chunks = service.chunkDocument(document);

    expect(chunks).toEqual([
      'Transaction Monitoring Policy',
      'The bank monitors transactions for unusual patterns.',
      'Velocity Monitoring',
      'Multiple transactions within a short period may require investigation.',
      'Escalation',
      'HIGH risk transactions must be reviewed by a fraud investigator.',
    ]);
  });

  it('should ignore empty chunks', () => {
    const service = new ChunkingService();

    const document = `
First section


Second section


Third section
`;

    const chunks = service.chunkDocument(document);

    expect(chunks).toEqual([
      'First section',
      'Second section',
      'Third section',
    ]);
  });
});
