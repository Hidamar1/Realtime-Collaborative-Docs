import { nanoid } from 'nanoid';
import type { DocumentRecord, DocumentVisibility } from '@online-docs/shared/src/types';

export interface DocumentContentRecord {
  documentId: string;
  contentState: unknown;
  collaborationState: Uint8Array;
  version: number;
  updatedAt: string;
}

export interface DocumentMemberRecord {
  documentId: string;
  userId: string;
  role: 'owner' | 'editor' | 'viewer';
  invitedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateRecord {
  id: string;
  title: string;
  description: string;
  category: string;
  contentState: unknown;
  isSystem: true;
  createdAt: string;
  updatedAt: string;
}

export interface AuditEvent {
  id: string;
  actorId: string;
  action: string;
  documentId?: string;
  createdAt: string;
}

export interface MemoryStore {
  documents: Map<string, DocumentRecord>;
  contents: Map<string, DocumentContentRecord>;
  members: Map<string, DocumentMemberRecord>;
  templates: TemplateRecord[];
  auditEvents: AuditEvent[];
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function createDocumentRecord(input: {
  title: string;
  ownerId: string;
  visibility?: DocumentVisibility;
}): DocumentRecord {
  const now = nowIso();
  return {
    id: nanoid(),
    title: input.title,
    ownerId: input.ownerId,
    visibility: input.visibility ?? 'private',
    createdAt: now,
    updatedAt: now,
    lastSavedAt: now
  };
}

export function createMemoryStore(): MemoryStore {
  const createdAt = nowIso();
  return {
    documents: new Map(),
    contents: new Map(),
    members: new Map(),
    templates: [
      {
        id: 'template-course-report',
        title: '课程小组报告',
        description: '用于课程项目的小组协作报告。',
        category: 'education',
        contentState: {
          type: 'doc',
          content: [
            { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: '课程小组报告' }] },
            { type: 'taskList', content: [] }
          ]
        },
        isSystem: true,
        createdAt,
        updatedAt: createdAt
      }
    ],
    auditEvents: []
  };
}
