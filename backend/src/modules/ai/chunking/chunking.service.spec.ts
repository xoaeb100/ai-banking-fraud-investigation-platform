import { describe, expect, it } from '@jest/globals';

import { ChunkingService } from './chunking.service';

describe('ChunkingService', () => {
  it('should split a document into chunks and preserve section metadata', () => {
    const service = new ChunkingService();

    const document = `
# Transaction Monitoring Policy

## General Monitoring

The bank monitors transactions for unusual patterns.

## Velocity Monitoring

Multiple transactions within a short period may require investigation.

## Escalation

HIGH risk transactions must be reviewed by a fraud investigator.
`;

    const chunks = service.chunkDocument(document);

    expect(chunks).toEqual([
      {
        section: 'General Monitoring',
        content: 'The bank monitors transactions for unusual patterns.',
      },
      {
        section: 'Velocity Monitoring',
        content:
          'Multiple transactions within a short period may require investigation.',
      },
      {
        section: 'Escalation',
        content:
          'HIGH risk transactions must be reviewed by a fraud investigator.',
      },
    ]);
  });

  it('should ignore empty chunks', () => {
    const service = new ChunkingService();

    const document = `
# Transaction Monitoring Policy

## General Monitoring


## Velocity Monitoring

Multiple transactions within a short period may require investigation.


## Escalation

HIGH risk transactions must be reviewed by a fraud investigator.
`;

    const chunks = service.chunkDocument(document);

    expect(chunks).toEqual([
      {
        section: 'Velocity Monitoring',
        content:
          'Multiple transactions within a short period may require investigation.',
      },
      {
        section: 'Escalation',
        content:
          'HIGH risk transactions must be reviewed by a fraud investigator.',
      },
    ]);
  });

  it('should assign null section when content appears before a section heading', () => {
    const service = new ChunkingService();

    const document = `
# Transaction Monitoring Policy

General introductory information about transaction monitoring.

## Escalation

HIGH risk transactions must be reviewed by a fraud investigator.
`;

    const chunks = service.chunkDocument(document);

    expect(chunks).toEqual([
      {
        section: null,
        content:
          'General introductory information about transaction monitoring.',
      },
      {
        section: 'Escalation',
        content:
          'HIGH risk transactions must be reviewed by a fraud investigator.',
      },
    ]);
  });
});
