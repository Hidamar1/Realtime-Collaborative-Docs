# 多人实时协作文档 M1 与 MVP 骨架实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 从空项目搭建一个可运行、可测试的实时协作文档 MVP 骨架，覆盖文档创建、模板、文档级权限、公开只读分享、评论、版本快照、Yjs 实时同步和最小 React 编辑器页面。

**架构：** 采用 pnpm monorepo：`apps/api` 提供 Fastify HTTP API 与 WebSocket 协同服务，`apps/web` 提供 React 前端，`packages/shared` 保存共享类型、权限策略和测试夹具。M1 先用内存仓储完成端到端技术验证，同时把仓储接口设计成可替换，下一份计划再接入 PostgreSQL + Redis。

**技术栈：** TypeScript、pnpm、Vitest、Fastify、ws、Yjs、React、Vite、ProseMirror、Playwright。

---

## 范围说明

已批准规格覆盖多个独立子系统。本计划只覆盖 **M1 技术验证 + MVP 骨架**，目标是产出可运行的本地系统，验证核心边界和实时协同风险：

- 项目脚手架与测试环境。
- 共享领域类型与权限策略。
- 文档、成员、模板、分享、评论、版本快照的内存仓储与 HTTP API。
- Yjs WebSocket 房间、权限校验、更新广播、presence 基础能力。
- React + ProseMirror + Yjs 的最小编辑器页面。
- 公开只读预览页。
- 端到端验收测试。

不在本计划中实现：

- PostgreSQL + JSONB 持久化。
- Redis 活跃文档缓存。
- 生产级认证系统。
- 富文本评论锚点自动重定位算法。
- 版本 diff、手动命名版本、离线编辑。
- 团队空间、计费、教育版商业化能力。

这些能力应在 M1 骨架通过后分别写独立实现计划。

## 文件结构

```text
D:/Testdemo/online-docs/
  package.json                         # 根脚本：安装、测试、开发、端到端测试
  pnpm-workspace.yaml                  # monorepo 工作区
  tsconfig.base.json                   # TypeScript 公共配置
  .gitignore                           # 忽略 node_modules、构建产物、.superpowers 等
  apps/
    api/
      package.json                     # API 依赖与脚本
      tsconfig.json                    # API TypeScript 配置
      src/
        server.ts                      # 创建 Fastify 应用并注册 HTTP / WS 路由
        index.ts                       # 本地启动入口
        auth/currentUser.ts            # 测试用请求身份解析
        domain/auditLog.ts             # 审计日志事件类型与内存记录器
        domain/commentService.ts       # 评论创建、回复、解决规则
        domain/documentService.ts      # 文档创建、成员、模板复制规则
        domain/permissionPolicy.ts     # 服务端权限策略封装 shared 策略
        domain/shareService.ts         # 公开只读分享链接规则
        domain/snapshotService.ts      # 快照触发与恢复规则
        repositories/memoryStore.ts    # 内存数据仓储，实现 MVP 骨架数据访问
        routes/comments.ts             # 评论 HTTP API
        routes/documents.ts            # 文档、成员、模板 HTTP API
        routes/share.ts                # 公开分享 HTTP API
        routes/snapshots.ts            # 版本快照 HTTP API
        realtime/collaborationServer.ts# Yjs WebSocket 房间与广播
        realtime/documentRoom.ts       # 单文档 Y.Doc、连接、权限和 presence
        security/sanitize.ts           # 富文本和评论内容清理
      tests/
        commentService.test.ts
        documentService.test.ts
        permissionPolicy.test.ts
        sanitize.test.ts
        shareService.test.ts
        snapshotService.test.ts
        collaborationServer.test.ts
    web/
      package.json                     # Web 依赖与脚本
      tsconfig.json                    # Web TypeScript 配置
      index.html                       # Vite 入口 HTML
      src/
        App.tsx                        # 路由分发
        api/client.ts                  # HTTP API 客户端
        auth/devUsers.ts               # 本地演示用户切换
        editor/schema.ts               # ProseMirror 基础 schema：段落、标题、列表、任务、链接、强调
        editor/createEditor.ts         # 创建 ProseMirror EditorView 与 Yjs 绑定
        pages/DocumentPage.tsx         # 协同编辑页面
        pages/HomePage.tsx             # 模板创建入口
        pages/PublicPreviewPage.tsx    # 公开只读预览页
        pages/__tests__/previewPage.test.tsx
        styles.css                     # 最小样式
      tests/
        editorSchema.test.ts
  e2e/
    collaborative-doc.spec.ts          # Playwright 端到端验收
    playwright.config.ts               # Playwright 配置
  docs/superpowers/specs/2026-06-02-realtime-collaborative-docs-design.md
  docs/superpowers/plans/2026-06-02-realtime-collaborative-docs-m1-plan.md
```

## 任务 0：初始化仓库与工作区

**文件：**
- 创建：`package.json`
- 创建：`pnpm-workspace.yaml`
- 创建：`tsconfig.base.json`
- 创建：`.gitignore`
- 创建：`apps/api/package.json`
- 创建：`apps/api/tsconfig.json`
- 创建：`apps/web/package.json`
- 创建：`apps/web/tsconfig.json`
- 创建：`apps/web/index.html`
- 创建：`e2e/playwright.config.ts`

- [ ] **步骤 1：初始化 Git 仓库**

运行：

```bash
git init
```

预期：输出包含 `Initialized empty Git repository`，或提示已重新初始化现有仓库。

- [ ] **步骤 2：创建根配置文件**

写入 `package.json`：

```json
{
  "name": "online-docs",
  "private": true,
  "packageManager": "pnpm@9.15.0",
  "scripts": {
    "dev": "pnpm --parallel --filter @online-docs/api --filter @online-docs/web dev",
    "test": "pnpm -r test",
    "test:e2e": "pnpm --filter @online-docs/e2e test",
    "typecheck": "pnpm -r typecheck"
  },
  "devDependencies": {
    "@playwright/test": "^1.44.0",
    "typescript": "^5.5.0"
  }
}
```

写入 `pnpm-workspace.yaml`：

```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "e2e"
```

写入 `tsconfig.base.json`：

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "baseUrl": "."
  }
}
```

写入 `.gitignore`：

```gitignore
node_modules/
dist/
coverage/
.env
.env.local
.superpowers/
playwright-report/
test-results/
```

- [ ] **步骤 3：创建 API 包配置**

写入 `apps/api/package.json`：

```json
{
  "name": "@online-docs/api",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@fastify/websocket": "^10.0.0",
    "fastify": "^4.28.0",
    "nanoid": "^5.0.7",
    "ws": "^8.17.0",
    "yjs": "^13.6.18"
  },
  "devDependencies": {
    "@types/ws": "^8.5.10",
    "tsx": "^4.16.0",
    "typescript": "^5.5.0",
    "vitest": "^1.6.0"
  }
}
```

写入 `apps/api/tsconfig.json`：

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "types": ["node", "vitest"]
  },
  "include": ["src", "tests"]
}
```

- [ ] **步骤 4：创建 Web 包配置**

写入 `apps/web/package.json`：

```json
{
  "name": "@online-docs/web",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1 --port 5173",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "prosemirror-model": "^1.21.0",
    "prosemirror-schema-list": "^1.4.0",
    "prosemirror-state": "^1.4.3",
    "prosemirror-view": "^1.33.8",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "vite": "^5.3.0",
    "y-prosemirror": "^1.2.5",
    "y-websocket": "^2.0.3",
    "yjs": "^13.6.18"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.6",
    "@testing-library/react": "^15.0.7",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "jsdom": "^24.1.0",
    "typescript": "^5.5.0",
    "vitest": "^1.6.0"
  }
}
```

写入 `apps/web/tsconfig.json`：

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "types": ["vitest", "jsdom"]
  },
  "include": ["src", "tests"]
}
```

写入 `apps/web/index.html`：

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>实时协作文档</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/App.tsx"></script>
  </body>
</html>
```

- [ ] **步骤 5：创建 Playwright 包配置**

创建 `e2e/package.json`：

```json
{
  "name": "@online-docs/e2e",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "playwright test"
  },
  "devDependencies": {
    "@playwright/test": "^1.44.0"
  }
}
```

写入 `e2e/playwright.config.ts`：

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  use: {
    baseURL: 'http://127.0.0.1:5173'
  },
  webServer: [
    {
      command: 'pnpm --filter @online-docs/api dev',
      port: 3000,
      reuseExistingServer: true
    },
    {
      command: 'pnpm --filter @online-docs/web dev',
      port: 5173,
      reuseExistingServer: true
    }
  ]
});
```

- [ ] **步骤 6：安装依赖**

运行：

```bash
pnpm install
```

预期：依赖安装成功，生成 `pnpm-lock.yaml`。

- [ ] **步骤 7：运行空测试验证脚本可执行**

运行：

```bash
pnpm test
```

预期：各包没有测试文件时退出码可能为非零。如果 Vitest 输出 `No test files found`，接受该结果，后续任务会补充测试。

- [ ] **步骤 8：Commit**

```bash
git add .
git commit -m "chore: initialize collaborative docs workspace"
```

## 任务 1：共享领域类型与权限策略

**文件：**
- 创建：`packages/shared/package.json`
- 创建：`packages/shared/tsconfig.json`
- 创建：`packages/shared/src/types.ts`
- 创建：`packages/shared/src/permissionPolicy.ts`
- 创建：`packages/shared/tests/permissionPolicy.test.ts`
- 修改：`apps/api/package.json`
- 修改：`apps/web/package.json`

- [x] **步骤 1：编写失败的权限测试**

写入 `packages/shared/tests/permissionPolicy.test.ts`：

```typescript
import { describe, expect, test } from 'vitest';
import { canPerform } from '../src/permissionPolicy';

const actions = [
  'viewDocument',
  'editDocument',
  'manageMembers',
  'deleteDocument',
  'createComment',
  'replyComment',
  'resolveComment',
  'viewSnapshots',
  'restoreSnapshot',
  'togglePublicPreview',
  'joinRealtimeRoom'
] as const;

describe('canPerform', () => {
  test('allows owner to perform every authenticated document action', () => {
    for (const action of actions) {
      expect(canPerform('owner', action)).toBe(true);
    }
  });

  test('allows editor to edit, comment, view snapshots, restore snapshots, and join realtime room', () => {
    expect(canPerform('editor', 'editDocument')).toBe(true);
    expect(canPerform('editor', 'createComment')).toBe(true);
    expect(canPerform('editor', 'restoreSnapshot')).toBe(true);
    expect(canPerform('editor', 'joinRealtimeRoom')).toBe(true);
    expect(canPerform('editor', 'manageMembers')).toBe(false);
    expect(canPerform('editor', 'togglePublicPreview')).toBe(false);
  });

  test('keeps viewer read-only but allows joining realtime room', () => {
    expect(canPerform('viewer', 'viewDocument')).toBe(true);
    expect(canPerform('viewer', 'viewSnapshots')).toBe(true);
    expect(canPerform('viewer', 'joinRealtimeRoom')).toBe(true);
    expect(canPerform('viewer', 'editDocument')).toBe(false);
    expect(canPerform('viewer', 'createComment')).toBe(false);
    expect(canPerform('viewer', 'restoreSnapshot')).toBe(false);
  });

  test('limits anonymous viewer to public preview only', () => {
    expect(canPerform('anonymousViewer', 'viewPublicPreview')).toBe(true);
    expect(canPerform('anonymousViewer', 'viewDocument')).toBe(false);
    expect(canPerform('anonymousViewer', 'joinRealtimeRoom')).toBe(false);
    expect(canPerform('anonymousViewer', 'createComment')).toBe(false);
  });
});
```

- [x] **步骤 2：运行测试验证失败**

运行：

```bash
pnpm --filter @online-docs/shared test
```

预期：FAIL，报错包含 `Cannot find module '../src/permissionPolicy'`。

- [x] **步骤 3：创建 shared 包和最小实现**

写入 `packages/shared/package.json`：

```json
{
  "name": "@online-docs/shared",
  "private": true,
  "type": "module",
  "main": "src/types.ts",
  "scripts": {
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "vitest": "^1.6.0"
  }
}
```

写入 `packages/shared/tsconfig.json`：

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "types": ["vitest"]
  },
  "include": ["src", "tests"]
}
```

写入 `packages/shared/src/types.ts`：

```typescript
export type AuthenticatedRole = 'owner' | 'editor' | 'viewer';
export type Role = AuthenticatedRole | 'anonymousViewer';

export type PermissionAction =
  | 'viewDocument'
  | 'viewPublicPreview'
  | 'editDocument'
  | 'manageMembers'
  | 'deleteDocument'
  | 'createComment'
  | 'replyComment'
  | 'resolveComment'
  | 'viewSnapshots'
  | 'restoreSnapshot'
  | 'togglePublicPreview'
  | 'joinRealtimeRoom';

export type DocumentVisibility = 'private' | 'public_readonly';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface DocumentRecord {
  id: string;
  title: string;
  ownerId: string;
  visibility: DocumentVisibility;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  lastSavedAt?: string;
}
```

写入 `packages/shared/src/permissionPolicy.ts`：

```typescript
import type { PermissionAction, Role } from './types';

const permissions: Record<Role, ReadonlySet<PermissionAction>> = {
  owner: new Set([
    'viewDocument',
    'editDocument',
    'manageMembers',
    'deleteDocument',
    'createComment',
    'replyComment',
    'resolveComment',
    'viewSnapshots',
    'restoreSnapshot',
    'togglePublicPreview',
    'joinRealtimeRoom'
  ]),
  editor: new Set([
    'viewDocument',
    'editDocument',
    'createComment',
    'replyComment',
    'resolveComment',
    'viewSnapshots',
    'restoreSnapshot',
    'joinRealtimeRoom'
  ]),
  viewer: new Set(['viewDocument', 'viewSnapshots', 'joinRealtimeRoom']),
  anonymousViewer: new Set(['viewPublicPreview'])
};

export function canPerform(role: Role, action: PermissionAction): boolean {
  return permissions[role].has(action);
}
```

- [x] **步骤 4：声明 API 和 Web 对 shared 的依赖**

在 `apps/api/package.json` 的 `dependencies` 中加入：

```json
"@online-docs/shared": "workspace:*"
```

在 `apps/web/package.json` 的 `dependencies` 中加入：

```json
"@online-docs/shared": "workspace:*"
```

- [x] **步骤 5：运行测试验证通过**

运行：

```bash
pnpm --filter @online-docs/shared test
```

预期：PASS，4 个测试通过。

- [x] **步骤 6：运行类型检查**

运行：

```bash
pnpm --filter @online-docs/shared typecheck
```

预期：PASS，无 TypeScript 错误。

- [x] **步骤 7：Commit**

```bash
git add packages/shared apps/api/package.json apps/web/package.json pnpm-lock.yaml
git commit -m "feat: add shared document permission policy"
```

## 任务 2：服务端安全清理函数

**文件：**
- 创建：`apps/api/src/security/sanitize.ts`
- 创建：`apps/api/tests/sanitize.test.ts`

- [x] **步骤 1：编写失败的清理测试**

写入 `apps/api/tests/sanitize.test.ts`：

```typescript
import { describe, expect, test } from 'vitest';
import { sanitizeCommentText, sanitizeRichTextHtml, sanitizeUrl } from '../src/security/sanitize';

describe('sanitizeCommentText', () => {
  test('escapes html in comment text', () => {
    expect(sanitizeCommentText('<img src=x onerror=alert(1)>')).toBe('&lt;img src=x onerror=alert(1)&gt;');
  });
});

describe('sanitizeUrl', () => {
  test('allows http and https urls', () => {
    expect(sanitizeUrl('https://example.com/a')).toBe('https://example.com/a');
    expect(sanitizeUrl('http://example.com/a')).toBe('http://example.com/a');
  });

  test('rejects javascript urls', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe(null);
  });
});

describe('sanitizeRichTextHtml', () => {
  test('removes script tags and inline event handlers', () => {
    const html = '<p onclick="alert(1)">Hi<script>alert(1)</script></p>';
    expect(sanitizeRichTextHtml(html)).toBe('<p>Hi</p>');
  });
});
```

- [x] **步骤 2：运行测试验证失败**

运行：

```bash
pnpm --filter @online-docs/api test tests/sanitize.test.ts
```

预期：FAIL，报错包含 `Cannot find module '../src/security/sanitize'`。

- [x] **步骤 3：编写最少实现代码**

写入 `apps/api/src/security/sanitize.ts`：

```typescript
const entityMap: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

export function sanitizeCommentText(input: string): string {
  return input.replace(/[&<>"']/g, (char) => entityMap[char]);
}

export function sanitizeUrl(input: string): string | null {
  try {
    const url = new URL(input);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

export function sanitizeRichTextHtml(input: string): string {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\s+on[a-z]+="[^"]*"/gi, '')
    .replace(/\s+on[a-z]+='[^']*'/gi, '');
}
```

- [x] **步骤 4：运行测试验证通过**

运行：

```bash
pnpm --filter @online-docs/api test tests/sanitize.test.ts
```

预期：PASS，4 个测试通过。

- [x] **步骤 5：Commit**

```bash
git add apps/api/src/security/sanitize.ts apps/api/tests/sanitize.test.ts
git commit -m "feat: add server-side content sanitizers"
```

## 任务 3：内存仓储与文档创建规则

**文件：**
- 创建：`apps/api/src/repositories/memoryStore.ts`
- 创建：`apps/api/src/domain/documentService.ts`
- 创建：`apps/api/src/domain/auditLog.ts`
- 创建：`apps/api/tests/documentService.test.ts`

- [x] **步骤 1：编写失败的文档服务测试**

写入 `apps/api/tests/documentService.test.ts`：

```typescript
import { describe, expect, test } from 'vitest';
import { createMemoryStore } from '../src/repositories/memoryStore';
import { createDocumentFromTemplate, createEmptyDocument } from '../src/domain/documentService';

describe('documentService', () => {
  test('creates an empty document and assigns owner role', () => {
    const store = createMemoryStore();

    const document = createEmptyDocument(store, {
      title: '课程报告',
      ownerId: 'user-a'
    });

    expect(document.title).toBe('课程报告');
    expect(document.ownerId).toBe('user-a');
    expect(document.visibility).toBe('private');
    expect(store.members.get(`${document.id}:user-a`)?.role).toBe('owner');
    expect(store.contents.get(document.id)?.contentState).toEqual({ type: 'doc', content: [] });
  });

  test('copies system template content into a new owner document', () => {
    const store = createMemoryStore();
    const template = store.templates.find((item) => item.title === '课程小组报告');

    const document = createDocumentFromTemplate(store, {
      templateId: template!.id,
      ownerId: 'user-a'
    });

    expect(document.title).toBe('课程小组报告');
    expect(store.members.get(`${document.id}:user-a`)?.role).toBe('owner');
    expect(store.contents.get(document.id)?.contentState).toEqual(template!.contentState);
  });
});
```

- [x] **步骤 2：运行测试验证失败**

运行：

```bash
pnpm --filter @online-docs/api test tests/documentService.test.ts
```

预期：FAIL，报错包含 `Cannot find module '../src/repositories/memoryStore'`。

- [x] **步骤 3：编写内存仓储和文档服务**

写入 `apps/api/src/repositories/memoryStore.ts`：

```typescript
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
```

写入 `apps/api/src/domain/auditLog.ts`：

```typescript
import { nanoid } from 'nanoid';
import type { MemoryStore } from '../repositories/memoryStore';
import { nowIso } from '../repositories/memoryStore';

export function recordAuditEvent(store: MemoryStore, input: { actorId: string; action: string; documentId?: string }): void {
  store.auditEvents.push({
    id: nanoid(),
    actorId: input.actorId,
    action: input.action,
    documentId: input.documentId,
    createdAt: nowIso()
  });
}
```

写入 `apps/api/src/domain/documentService.ts`：

```typescript
import { createDocumentRecord, nowIso, type MemoryStore } from '../repositories/memoryStore';
import { recordAuditEvent } from './auditLog';

const emptyContent = { type: 'doc', content: [] };

export function createEmptyDocument(store: MemoryStore, input: { title: string; ownerId: string }) {
  const document = createDocumentRecord({ title: input.title, ownerId: input.ownerId });
  const now = nowIso();
  store.documents.set(document.id, document);
  store.contents.set(document.id, {
    documentId: document.id,
    contentState: emptyContent,
    collaborationState: new Uint8Array(),
    version: 1,
    updatedAt: now
  });
  store.members.set(`${document.id}:${input.ownerId}`, {
    documentId: document.id,
    userId: input.ownerId,
    role: 'owner',
    createdAt: now,
    updatedAt: now
  });
  recordAuditEvent(store, { actorId: input.ownerId, action: 'document.created', documentId: document.id });
  return document;
}

export function createDocumentFromTemplate(store: MemoryStore, input: { templateId: string; ownerId: string }) {
  const template = store.templates.find((item) => item.id === input.templateId);
  if (!template) {
    throw new Error('Template not found');
  }

  const document = createDocumentRecord({ title: template.title, ownerId: input.ownerId });
  const now = nowIso();
  store.documents.set(document.id, document);
  store.contents.set(document.id, {
    documentId: document.id,
    contentState: structuredClone(template.contentState),
    collaborationState: new Uint8Array(),
    version: 1,
    updatedAt: now
  });
  store.members.set(`${document.id}:${input.ownerId}`, {
    documentId: document.id,
    userId: input.ownerId,
    role: 'owner',
    createdAt: now,
    updatedAt: now
  });
  recordAuditEvent(store, { actorId: input.ownerId, action: 'document.created_from_template', documentId: document.id });
  return document;
}
```

- [x] **步骤 4：运行测试验证通过**

运行：

```bash
pnpm --filter @online-docs/api test tests/documentService.test.ts
```

预期：PASS，2 个测试通过。

- [x] **步骤 5：Commit**

```bash
git add apps/api/src/repositories/memoryStore.ts apps/api/src/domain apps/api/tests/documentService.test.ts
git commit -m "feat: add in-memory document creation service"
```

## 任务 4：分享链接、评论和快照领域服务

**文件：**
- 创建：`apps/api/src/domain/shareService.ts`
- 创建：`apps/api/src/domain/commentService.ts`
- 创建：`apps/api/src/domain/snapshotService.ts`
- 创建：`apps/api/tests/shareService.test.ts`
- 创建：`apps/api/tests/commentService.test.ts`
- 创建：`apps/api/tests/snapshotService.test.ts`
- 修改：`apps/api/src/repositories/memoryStore.ts`

- [ ] **步骤 1：编写失败的分享服务测试**

写入 `apps/api/tests/shareService.test.ts`：

```typescript
import { describe, expect, test } from 'vitest';
import { createEmptyDocument } from '../src/domain/documentService';
import { createMemoryStore } from '../src/repositories/memoryStore';
import { disablePublicPreview, enablePublicPreview, getPublicPreview } from '../src/domain/shareService';

describe('shareService', () => {
  test('owner can enable and disable public readonly preview', () => {
    const store = createMemoryStore();
    const document = createEmptyDocument(store, { title: '报告', ownerId: 'owner-a' });

    const link = enablePublicPreview(store, { documentId: document.id, actorId: 'owner-a' });

    expect(getPublicPreview(store, link.token)?.document.id).toBe(document.id);
    expect(store.documents.get(document.id)?.visibility).toBe('public_readonly');

    disablePublicPreview(store, { documentId: document.id, actorId: 'owner-a' });

    expect(getPublicPreview(store, link.token)).toBe(null);
    expect(store.documents.get(document.id)?.visibility).toBe('private');
  });
});
```

- [ ] **步骤 2：编写失败的评论服务测试**

写入 `apps/api/tests/commentService.test.ts`：

```typescript
import { describe, expect, test } from 'vitest';
import { createCommentThread, replyToCommentThread, resolveCommentThread } from '../src/domain/commentService';
import { createEmptyDocument } from '../src/domain/documentService';
import { createMemoryStore } from '../src/repositories/memoryStore';

describe('commentService', () => {
  test('creates, replies, and resolves a comment thread with sanitized body', () => {
    const store = createMemoryStore();
    const document = createEmptyDocument(store, { title: '报告', ownerId: 'owner-a' });

    const thread = createCommentThread(store, {
      documentId: document.id,
      actorId: 'owner-a',
      selectedText: '研究目标',
      body: '<script>alert(1)</script>需要更明确',
      anchor: { from: 1, to: 5, text: '研究目标' }
    });

    expect(thread.status).toBe('open');
    expect(store.commentReplies[0].body).toBe('&lt;script&gt;alert(1)&lt;/script&gt;需要更明确');

    replyToCommentThread(store, { threadId: thread.id, actorId: 'owner-a', body: '已补充' });
    resolveCommentThread(store, { threadId: thread.id, actorId: 'owner-a' });

    expect(store.commentThreads.get(thread.id)?.status).toBe('resolved');
    expect(store.commentReplies).toHaveLength(2);
  });
});
```

- [ ] **步骤 3：编写失败的快照服务测试**

写入 `apps/api/tests/snapshotService.test.ts`：

```typescript
import { describe, expect, test } from 'vitest';
import { createEmptyDocument } from '../src/domain/documentService';
import { createSnapshot, restoreSnapshot } from '../src/domain/snapshotService';
import { createMemoryStore } from '../src/repositories/memoryStore';

describe('snapshotService', () => {
  test('creates a snapshot and restores it as a new document state', () => {
    const store = createMemoryStore();
    const document = createEmptyDocument(store, { title: '报告', ownerId: 'owner-a' });
    store.contents.get(document.id)!.contentState = { type: 'doc', content: [{ type: 'paragraph', text: 'v1' }] };

    const snapshot = createSnapshot(store, {
      documentId: document.id,
      actorId: 'owner-a',
      reason: 'significant_change'
    });

    store.contents.get(document.id)!.contentState = { type: 'doc', content: [{ type: 'paragraph', text: 'v2' }] };
    restoreSnapshot(store, { snapshotId: snapshot.id, actorId: 'owner-a' });

    expect(store.contents.get(document.id)?.contentState).toEqual(snapshot.contentState);
    expect(store.snapshots.filter((item) => item.documentId === document.id)).toHaveLength(2);
  });
});
```

- [ ] **步骤 4：运行测试验证失败**

运行：

```bash
pnpm --filter @online-docs/api test tests/shareService.test.ts tests/commentService.test.ts tests/snapshotService.test.ts
```

预期：FAIL，报错包含缺少 `shareService`、`commentService` 或 `snapshotService` 模块。

- [ ] **步骤 5：扩展内存仓储类型**

在 `apps/api/src/repositories/memoryStore.ts` 增加以下类型和字段：

```typescript
export interface ShareLinkRecord {
  id: string;
  documentId: string;
  token: string;
  enabled: boolean;
  createdBy: string;
  createdAt: string;
  disabledAt?: string;
}

export interface CommentThreadRecord {
  id: string;
  documentId: string;
  anchor: unknown;
  status: 'open' | 'resolved';
  createdBy: string;
  createdAt: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface CommentReplyRecord {
  id: string;
  threadId: string;
  body: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface DocumentSnapshotRecord {
  id: string;
  documentId: string;
  contentState: unknown;
  collaborationState: Uint8Array;
  documentVersion: number;
  createdAt: string;
  createdBy: string;
  reason: 'time_interval' | 'significant_change' | 'restore' | 'last_editor_left';
}
```

把 `MemoryStore` 扩展为：

```typescript
export interface MemoryStore {
  documents: Map<string, DocumentRecord>;
  contents: Map<string, DocumentContentRecord>;
  members: Map<string, DocumentMemberRecord>;
  templates: TemplateRecord[];
  shareLinks: Map<string, ShareLinkRecord>;
  commentThreads: Map<string, CommentThreadRecord>;
  commentReplies: CommentReplyRecord[];
  snapshots: DocumentSnapshotRecord[];
  auditEvents: AuditEvent[];
}
```

在 `createMemoryStore()` 返回值中加入：

```typescript
shareLinks: new Map(),
commentThreads: new Map(),
commentReplies: [],
snapshots: [],
```

- [ ] **步骤 6：实现分享、评论和快照服务**

写入 `apps/api/src/domain/shareService.ts`：

```typescript
import { nanoid } from 'nanoid';
import type { MemoryStore } from '../repositories/memoryStore';
import { nowIso } from '../repositories/memoryStore';
import { recordAuditEvent } from './auditLog';

export function enablePublicPreview(store: MemoryStore, input: { documentId: string; actorId: string }) {
  const document = store.documents.get(input.documentId);
  if (!document || document.ownerId !== input.actorId) {
    throw new Error('Only owner can enable public preview');
  }
  const now = nowIso();
  document.visibility = 'public_readonly';
  document.updatedAt = now;
  const link = {
    id: nanoid(),
    documentId: input.documentId,
    token: nanoid(24),
    enabled: true,
    createdBy: input.actorId,
    createdAt: now
  };
  store.shareLinks.set(link.token, link);
  recordAuditEvent(store, { actorId: input.actorId, action: 'share.enabled', documentId: input.documentId });
  return link;
}

export function disablePublicPreview(store: MemoryStore, input: { documentId: string; actorId: string }): void {
  const document = store.documents.get(input.documentId);
  if (!document || document.ownerId !== input.actorId) {
    throw new Error('Only owner can disable public preview');
  }
  const now = nowIso();
  document.visibility = 'private';
  document.updatedAt = now;
  for (const link of store.shareLinks.values()) {
    if (link.documentId === input.documentId && link.enabled) {
      link.enabled = false;
      link.disabledAt = now;
    }
  }
  recordAuditEvent(store, { actorId: input.actorId, action: 'share.disabled', documentId: input.documentId });
}

export function getPublicPreview(store: MemoryStore, token: string) {
  const link = store.shareLinks.get(token);
  if (!link?.enabled) return null;
  const document = store.documents.get(link.documentId);
  const content = store.contents.get(link.documentId);
  if (!document || !content || document.visibility !== 'public_readonly') return null;
  return { document, content };
}
```

写入 `apps/api/src/domain/commentService.ts`：

```typescript
import { nanoid } from 'nanoid';
import type { MemoryStore } from '../repositories/memoryStore';
import { nowIso } from '../repositories/memoryStore';
import { sanitizeCommentText } from '../security/sanitize';

export function createCommentThread(store: MemoryStore, input: {
  documentId: string;
  actorId: string;
  selectedText: string;
  body: string;
  anchor: unknown;
}) {
  const now = nowIso();
  const thread = {
    id: nanoid(),
    documentId: input.documentId,
    anchor: input.anchor,
    status: 'open' as const,
    createdBy: input.actorId,
    createdAt: now
  };
  store.commentThreads.set(thread.id, thread);
  store.commentReplies.push({
    id: nanoid(),
    threadId: thread.id,
    body: sanitizeCommentText(input.body),
    createdBy: input.actorId,
    createdAt: now
  });
  return thread;
}

export function replyToCommentThread(store: MemoryStore, input: { threadId: string; actorId: string; body: string }) {
  const thread = store.commentThreads.get(input.threadId);
  if (!thread || thread.status !== 'open') {
    throw new Error('Open comment thread not found');
  }
  const reply = {
    id: nanoid(),
    threadId: input.threadId,
    body: sanitizeCommentText(input.body),
    createdBy: input.actorId,
    createdAt: nowIso()
  };
  store.commentReplies.push(reply);
  return reply;
}

export function resolveCommentThread(store: MemoryStore, input: { threadId: string; actorId: string }) {
  const thread = store.commentThreads.get(input.threadId);
  if (!thread) {
    throw new Error('Comment thread not found');
  }
  thread.status = 'resolved';
  thread.resolvedBy = input.actorId;
  thread.resolvedAt = nowIso();
  return thread;
}
```

写入 `apps/api/src/domain/snapshotService.ts`：

```typescript
import { nanoid } from 'nanoid';
import type { MemoryStore, DocumentSnapshotRecord } from '../repositories/memoryStore';
import { nowIso } from '../repositories/memoryStore';
import { recordAuditEvent } from './auditLog';

export function createSnapshot(store: MemoryStore, input: {
  documentId: string;
  actorId: string;
  reason: DocumentSnapshotRecord['reason'];
}) {
  const content = store.contents.get(input.documentId);
  if (!content) {
    throw new Error('Document content not found');
  }
  const snapshot: DocumentSnapshotRecord = {
    id: nanoid(),
    documentId: input.documentId,
    contentState: structuredClone(content.contentState),
    collaborationState: new Uint8Array(content.collaborationState),
    documentVersion: content.version,
    createdAt: nowIso(),
    createdBy: input.actorId,
    reason: input.reason
  };
  store.snapshots.push(snapshot);
  return snapshot;
}

export function restoreSnapshot(store: MemoryStore, input: { snapshotId: string; actorId: string }) {
  const snapshot = store.snapshots.find((item) => item.id === input.snapshotId);
  if (!snapshot) {
    throw new Error('Snapshot not found');
  }
  const content = store.contents.get(snapshot.documentId);
  if (!content) {
    throw new Error('Document content not found');
  }
  content.contentState = structuredClone(snapshot.contentState);
  content.collaborationState = new Uint8Array(snapshot.collaborationState);
  content.version += 1;
  content.updatedAt = nowIso();
  recordAuditEvent(store, { actorId: input.actorId, action: 'snapshot.restored', documentId: snapshot.documentId });
  return createSnapshot(store, {
    documentId: snapshot.documentId,
    actorId: input.actorId,
    reason: 'restore'
  });
}
```

- [ ] **步骤 7：运行测试验证通过**

运行：

```bash
pnpm --filter @online-docs/api test tests/shareService.test.ts tests/commentService.test.ts tests/snapshotService.test.ts
```

预期：PASS，3 个测试通过。

- [ ] **步骤 8：Commit**

```bash
git add apps/api/src apps/api/tests/shareService.test.ts apps/api/tests/commentService.test.ts apps/api/tests/snapshotService.test.ts
git commit -m "feat: add share comment and snapshot services"
```

## 任务 5：HTTP API 与测试用身份解析

**文件：**
- 创建：`apps/api/src/auth/currentUser.ts`
- 创建：`apps/api/src/routes/documents.ts`
- 创建：`apps/api/src/routes/share.ts`
- 创建：`apps/api/src/routes/comments.ts`
- 创建：`apps/api/src/routes/snapshots.ts`
- 创建：`apps/api/src/server.ts`
- 创建：`apps/api/src/index.ts`
- 创建：`apps/api/tests/httpApi.test.ts`

- [ ] **步骤 1：编写失败的 HTTP API 测试**

写入 `apps/api/tests/httpApi.test.ts`：

```typescript
import { afterEach, describe, expect, test } from 'vitest';
import { buildServer } from '../src/server';

const servers: Array<{ close: () => Promise<void> }> = [];

afterEach(async () => {
  await Promise.all(servers.map((server) => server.close()));
  servers.length = 0;
});

describe('HTTP API', () => {
  test('creates a document from template and exposes public preview only after sharing is enabled', async () => {
    const server = buildServer();
    servers.push(server);

    const templatesResponse = await server.inject({ method: 'GET', url: '/api/templates', headers: { 'x-user-id': 'user-a' } });
    const templates = templatesResponse.json();

    const createResponse = await server.inject({
      method: 'POST',
      url: '/api/documents/from-template',
      headers: { 'x-user-id': 'user-a' },
      payload: { templateId: templates[0].id }
    });
    const document = createResponse.json();

    const shareResponse = await server.inject({
      method: 'POST',
      url: `/api/documents/${document.id}/share`,
      headers: { 'x-user-id': 'user-a' }
    });
    const share = shareResponse.json();

    const previewResponse = await server.inject({ method: 'GET', url: `/api/public/${share.token}` });
    expect(previewResponse.statusCode).toBe(200);
    expect(previewResponse.json().document.id).toBe(document.id);
    expect(previewResponse.json().comments).toBeUndefined();
  });
});
```

- [ ] **步骤 2：运行测试验证失败**

运行：

```bash
pnpm --filter @online-docs/api test tests/httpApi.test.ts
```

预期：FAIL，报错包含 `Cannot find module '../src/server'`。

- [ ] **步骤 3：实现测试身份解析**

写入 `apps/api/src/auth/currentUser.ts`：

```typescript
import type { FastifyRequest } from 'fastify';

export interface CurrentUser {
  id: string;
  name: string;
}

export function getCurrentUser(request: FastifyRequest): CurrentUser {
  const userId = request.headers['x-user-id'];
  if (typeof userId !== 'string' || !userId.trim()) {
    throw new Error('Missing x-user-id header');
  }
  return { id: userId, name: userId };
}
```

- [ ] **步骤 4：实现 HTTP 路由**

写入 `apps/api/src/routes/documents.ts`：

```typescript
import type { FastifyInstance } from 'fastify';
import { getCurrentUser } from '../auth/currentUser';
import { createDocumentFromTemplate, createEmptyDocument } from '../domain/documentService';
import type { MemoryStore } from '../repositories/memoryStore';

export async function registerDocumentRoutes(app: FastifyInstance, store: MemoryStore) {
  app.get('/api/templates', async () => store.templates);

  app.post('/api/documents', async (request) => {
    const user = getCurrentUser(request);
    const body = request.body as { title: string };
    return createEmptyDocument(store, { title: body.title, ownerId: user.id });
  });

  app.post('/api/documents/from-template', async (request) => {
    const user = getCurrentUser(request);
    const body = request.body as { templateId: string };
    return createDocumentFromTemplate(store, { templateId: body.templateId, ownerId: user.id });
  });

  app.get('/api/documents/:documentId', async (request) => {
    getCurrentUser(request);
    const params = request.params as { documentId: string };
    const document = store.documents.get(params.documentId);
    const content = store.contents.get(params.documentId);
    if (!document || !content) {
      return app.httpErrors.notFound('Document not found');
    }
    return { document, content };
  });
}
```

写入 `apps/api/src/routes/share.ts`：

```typescript
import type { FastifyInstance } from 'fastify';
import { getCurrentUser } from '../auth/currentUser';
import { disablePublicPreview, enablePublicPreview, getPublicPreview } from '../domain/shareService';
import type { MemoryStore } from '../repositories/memoryStore';

export async function registerShareRoutes(app: FastifyInstance, store: MemoryStore) {
  app.post('/api/documents/:documentId/share', async (request) => {
    const user = getCurrentUser(request);
    const params = request.params as { documentId: string };
    return enablePublicPreview(store, { documentId: params.documentId, actorId: user.id });
  });

  app.delete('/api/documents/:documentId/share', async (request) => {
    const user = getCurrentUser(request);
    const params = request.params as { documentId: string };
    disablePublicPreview(store, { documentId: params.documentId, actorId: user.id });
    return { ok: true };
  });

  app.get('/api/public/:token', async (request, reply) => {
    const params = request.params as { token: string };
    const preview = getPublicPreview(store, params.token);
    if (!preview) {
      reply.code(404);
      return { error: 'Public preview not found' };
    }
    return { document: preview.document, content: preview.content };
  });
}
```

写入 `apps/api/src/routes/comments.ts`：

```typescript
import type { FastifyInstance } from 'fastify';
import { getCurrentUser } from '../auth/currentUser';
import { createCommentThread, replyToCommentThread, resolveCommentThread } from '../domain/commentService';
import type { MemoryStore } from '../repositories/memoryStore';

export async function registerCommentRoutes(app: FastifyInstance, store: MemoryStore) {
  app.post('/api/documents/:documentId/comments', async (request) => {
    const user = getCurrentUser(request);
    const params = request.params as { documentId: string };
    const body = request.body as { selectedText: string; body: string; anchor: unknown };
    return createCommentThread(store, { documentId: params.documentId, actorId: user.id, ...body });
  });

  app.post('/api/comments/:threadId/replies', async (request) => {
    const user = getCurrentUser(request);
    const params = request.params as { threadId: string };
    const body = request.body as { body: string };
    return replyToCommentThread(store, { threadId: params.threadId, actorId: user.id, body: body.body });
  });

  app.post('/api/comments/:threadId/resolve', async (request) => {
    const user = getCurrentUser(request);
    const params = request.params as { threadId: string };
    return resolveCommentThread(store, { threadId: params.threadId, actorId: user.id });
  });
}
```

写入 `apps/api/src/routes/snapshots.ts`：

```typescript
import type { FastifyInstance } from 'fastify';
import { getCurrentUser } from '../auth/currentUser';
import { createSnapshot, restoreSnapshot } from '../domain/snapshotService';
import type { MemoryStore } from '../repositories/memoryStore';

export async function registerSnapshotRoutes(app: FastifyInstance, store: MemoryStore) {
  app.get('/api/documents/:documentId/snapshots', async (request) => {
    getCurrentUser(request);
    const params = request.params as { documentId: string };
    return store.snapshots.filter((item) => item.documentId === params.documentId);
  });

  app.post('/api/documents/:documentId/snapshots', async (request) => {
    const user = getCurrentUser(request);
    const params = request.params as { documentId: string };
    return createSnapshot(store, { documentId: params.documentId, actorId: user.id, reason: 'significant_change' });
  });

  app.post('/api/snapshots/:snapshotId/restore', async (request) => {
    const user = getCurrentUser(request);
    const params = request.params as { snapshotId: string };
    return restoreSnapshot(store, { snapshotId: params.snapshotId, actorId: user.id });
  });
}
```

- [ ] **步骤 5：创建服务器入口**

写入 `apps/api/src/server.ts`：

```typescript
import fastify from 'fastify';
import websocket from '@fastify/websocket';
import { createMemoryStore } from './repositories/memoryStore';
import { registerCommentRoutes } from './routes/comments';
import { registerDocumentRoutes } from './routes/documents';
import { registerShareRoutes } from './routes/share';
import { registerSnapshotRoutes } from './routes/snapshots';

export function buildServer() {
  const app = fastify();
  const store = createMemoryStore();
  app.register(websocket);

  app.decorate('store', store);
  app.get('/health', async () => ({ ok: true }));
  app.register(async (instance) => {
    await registerDocumentRoutes(instance, store);
    await registerShareRoutes(instance, store);
    await registerCommentRoutes(instance, store);
    await registerSnapshotRoutes(instance, store);
  });

  return app;
}
```

写入 `apps/api/src/index.ts`：

```typescript
import { buildServer } from './server';

const server = buildServer();
await server.listen({ host: '127.0.0.1', port: 3000 });
console.log('API listening on http://127.0.0.1:3000');
```

- [ ] **步骤 6：运行测试验证通过**

运行：

```bash
pnpm --filter @online-docs/api test tests/httpApi.test.ts
```

预期：PASS，1 个测试通过。

- [ ] **步骤 7：Commit**

```bash
git add apps/api/src apps/api/tests/httpApi.test.ts
git commit -m "feat: expose document collaboration HTTP API"
```

## 任务 6：Yjs WebSocket 协同服务

**文件：**
- 创建：`apps/api/src/realtime/documentRoom.ts`
- 创建：`apps/api/src/realtime/collaborationServer.ts`
- 创建：`apps/api/tests/collaborationServer.test.ts`
- 修改：`apps/api/src/server.ts`

- [ ] **步骤 1：编写失败的协同服务测试**

写入 `apps/api/tests/collaborationServer.test.ts`：

```typescript
import { describe, expect, test } from 'vitest';
import * as Y from 'yjs';
import { createDocumentRoom } from '../src/realtime/documentRoom';

describe('documentRoom', () => {
  test('applies Yjs updates and stores latest collaboration state', () => {
    const room = createDocumentRoom('doc-1');
    const clientDoc = new Y.Doc();
    clientDoc.getText('body').insert(0, 'hello');
    const update = Y.encodeStateAsUpdate(clientDoc);

    room.applyUpdate(update, 'user-a');

    const syncedDoc = new Y.Doc();
    Y.applyUpdate(syncedDoc, room.encodeState());
    expect(syncedDoc.getText('body').toString()).toBe('hello');
  });
});
```

- [ ] **步骤 2：运行测试验证失败**

运行：

```bash
pnpm --filter @online-docs/api test tests/collaborationServer.test.ts
```

预期：FAIL，报错包含 `Cannot find module '../src/realtime/documentRoom'`。

- [ ] **步骤 3：实现单文档房间**

写入 `apps/api/src/realtime/documentRoom.ts`：

```typescript
import * as Y from 'yjs';

export interface AwarenessState {
  userId: string;
  cursor?: unknown;
  selection?: unknown;
  color: string;
  lastSeenAt: string;
}

export function createDocumentRoom(documentId: string) {
  const doc = new Y.Doc();
  const awareness = new Map<string, AwarenessState>();

  return {
    documentId,
    applyUpdate(update: Uint8Array, userId: string) {
      Y.applyUpdate(doc, update);
      awareness.set(userId, {
        userId,
        color: colorForUser(userId),
        lastSeenAt: new Date().toISOString()
      });
    },
    encodeState() {
      return Y.encodeStateAsUpdate(doc);
    },
    setPresence(userId: string, state: Omit<AwarenessState, 'userId' | 'lastSeenAt'>) {
      awareness.set(userId, { userId, ...state, lastSeenAt: new Date().toISOString() });
    },
    removePresence(userId: string) {
      awareness.delete(userId);
    },
    listPresence() {
      return [...awareness.values()];
    }
  };
}

function colorForUser(userId: string): string {
  const colors = ['#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c'];
  const index = [...userId].reduce((sum, char) => sum + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
}
```

- [ ] **步骤 4：实现 WebSocket 路由注册**

写入 `apps/api/src/realtime/collaborationServer.ts`：

```typescript
import type { FastifyInstance } from 'fastify';
import { createDocumentRoom } from './documentRoom';
import type { MemoryStore } from '../repositories/memoryStore';

const rooms = new Map<string, ReturnType<typeof createDocumentRoom>>();

export function getRoom(documentId: string) {
  let room = rooms.get(documentId);
  if (!room) {
    room = createDocumentRoom(documentId);
    rooms.set(documentId, room);
  }
  return room;
}

export async function registerCollaborationRoutes(app: FastifyInstance, store: MemoryStore) {
  app.get('/ws/documents/:documentId', { websocket: true }, (connection, request) => {
    const params = request.params as { documentId: string };
    const userId = String(request.headers['x-user-id'] ?? '');
    const member = store.members.get(`${params.documentId}:${userId}`);

    if (!member) {
      connection.socket.close(1008, 'Permission denied');
      return;
    }

    const room = getRoom(params.documentId);
    connection.socket.send(room.encodeState());

    connection.socket.on('message', (message) => {
      if (member.role === 'viewer') {
        connection.socket.send(JSON.stringify({ type: 'error', reason: 'Viewer cannot edit' }));
        return;
      }
      const update = message instanceof Buffer ? new Uint8Array(message) : new Uint8Array(message as ArrayBuffer);
      room.applyUpdate(update, userId);
      for (const client of connection.socket.clients ?? []) {
        if (client !== connection.socket && client.readyState === client.OPEN) {
          client.send(update);
        }
      }
    });

    connection.socket.on('close', () => {
      room.removePresence(userId);
    });
  });
}
```

在 `apps/api/src/server.ts` 中注册协同路由：

```typescript
import { registerCollaborationRoutes } from './realtime/collaborationServer';
```

并在其他路由注册后加入：

```typescript
await registerCollaborationRoutes(instance, store);
```

- [ ] **步骤 5：运行测试验证通过**

运行：

```bash
pnpm --filter @online-docs/api test tests/collaborationServer.test.ts
```

预期：PASS，1 个测试通过。

- [ ] **步骤 6：Commit**

```bash
git add apps/api/src/realtime apps/api/src/server.ts apps/api/tests/collaborationServer.test.ts
git commit -m "feat: add yjs collaboration room service"
```

## 任务 7：前端编辑器 schema 与页面骨架

**文件：**
- 创建：`apps/web/src/editor/schema.ts`
- 创建：`apps/web/tests/editorSchema.test.ts`
- 创建：`apps/web/src/api/client.ts`
- 创建：`apps/web/src/auth/devUsers.ts`
- 创建：`apps/web/src/pages/HomePage.tsx`
- 创建：`apps/web/src/pages/DocumentPage.tsx`
- 创建：`apps/web/src/pages/PublicPreviewPage.tsx`
- 创建：`apps/web/src/App.tsx`
- 创建：`apps/web/src/styles.css`

- [ ] **步骤 1：编写失败的编辑器 schema 测试**

写入 `apps/web/tests/editorSchema.test.ts`：

```typescript
import { describe, expect, test } from 'vitest';
import { collaborativeDocSchema } from '../src/editor/schema';

describe('collaborativeDocSchema', () => {
  test('supports required MVP nodes and marks', () => {
    expect(collaborativeDocSchema.nodes.paragraph).toBeDefined();
    expect(collaborativeDocSchema.nodes.heading).toBeDefined();
    expect(collaborativeDocSchema.nodes.bullet_list).toBeDefined();
    expect(collaborativeDocSchema.nodes.task_item).toBeDefined();
    expect(collaborativeDocSchema.marks.strong).toBeDefined();
    expect(collaborativeDocSchema.marks.em).toBeDefined();
    expect(collaborativeDocSchema.marks.link).toBeDefined();
  });
});
```

- [ ] **步骤 2：运行测试验证失败**

运行：

```bash
pnpm --filter @online-docs/web test tests/editorSchema.test.ts
```

预期：FAIL，报错包含 `Cannot find module '../src/editor/schema'`。

- [ ] **步骤 3：实现 ProseMirror schema**

写入 `apps/web/src/editor/schema.ts`：

```typescript
import { Schema } from 'prosemirror-model';
import { addListNodes } from 'prosemirror-schema-list';

const baseNodes = {
  doc: { content: 'block+' },
  text: { group: 'inline' },
  paragraph: {
    content: 'inline*',
    group: 'block',
    parseDOM: [{ tag: 'p' }],
    toDOM: () => ['p', 0]
  },
  heading: {
    attrs: { level: { default: 1 } },
    content: 'inline*',
    group: 'block',
    defining: true,
    parseDOM: [
      { tag: 'h1', attrs: { level: 1 } },
      { tag: 'h2', attrs: { level: 2 } }
    ],
    toDOM: (node) => [`h${node.attrs.level}`, 0]
  },
  task_item: {
    attrs: { checked: { default: false } },
    content: 'paragraph block*',
    group: 'block',
    parseDOM: [{ tag: 'li[data-task-item]' }],
    toDOM: (node) => ['li', { 'data-task-item': 'true', 'data-checked': String(node.attrs.checked) }, 0]
  }
};

const nodes = addListNodes(baseNodes as any, 'paragraph block*', 'block');

export const collaborativeDocSchema = new Schema({
  nodes,
  marks: {
    strong: {
      parseDOM: [{ tag: 'strong' }, { style: 'font-weight=bold' }],
      toDOM: () => ['strong', 0]
    },
    em: {
      parseDOM: [{ tag: 'em' }, { style: 'font-style=italic' }],
      toDOM: () => ['em', 0]
    },
    link: {
      attrs: { href: {} },
      inclusive: false,
      parseDOM: [{ tag: 'a[href]', getAttrs: (dom) => ({ href: (dom as HTMLElement).getAttribute('href') }) }],
      toDOM: (node) => ['a', { href: node.attrs.href, rel: 'noopener noreferrer' }, 0]
    }
  }
});
```

- [ ] **步骤 4：运行 schema 测试验证通过**

运行：

```bash
pnpm --filter @online-docs/web test tests/editorSchema.test.ts
```

预期：PASS，1 个测试通过。

- [ ] **步骤 5：创建前端 API 与页面骨架**

写入 `apps/web/src/api/client.ts`：

```typescript
const apiBase = 'http://127.0.0.1:3000';

export async function apiGet<T>(path: string, userId = 'user-a'): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, { headers: { 'x-user-id': userId } });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export async function apiPost<T>(path: string, body: unknown, userId = 'user-a'): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-user-id': userId },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}
```

写入 `apps/web/src/auth/devUsers.ts`：

```typescript
export const devUsers = [
  { id: 'user-a', name: '用户 A' },
  { id: 'user-b', name: '用户 B' },
  { id: 'user-c', name: '用户 C' }
];
```

写入 `apps/web/src/pages/HomePage.tsx`：

```tsx
import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../api/client';

interface TemplateRecord {
  id: string;
  title: string;
  description: string;
}

export function HomePage() {
  const [templates, setTemplates] = useState<TemplateRecord[]>([]);

  useEffect(() => {
    apiGet<TemplateRecord[]>('/api/templates').then(setTemplates).catch(console.error);
  }, []);

  async function createFromTemplate(templateId: string) {
    const document = await apiPost<{ id: string }>('/api/documents/from-template', { templateId });
    window.location.href = `/documents/${document.id}`;
  }

  return (
    <main className="page">
      <h1>实时协作文档</h1>
      <p>从教育与轻项目模板开始协作。</p>
      <section className="cards">
        {templates.map((template) => (
          <button className="card" key={template.id} onClick={() => createFromTemplate(template.id)}>
            <strong>{template.title}</strong>
            <span>{template.description}</span>
          </button>
        ))}
      </section>
    </main>
  );
}
```

写入 `apps/web/src/pages/DocumentPage.tsx`：

```tsx
import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../api/client';

export function DocumentPage({ documentId }: { documentId: string }) {
  const [documentTitle, setDocumentTitle] = useState('加载中');
  const [shareToken, setShareToken] = useState<string | null>(null);

  useEffect(() => {
    apiGet<{ document: { title: string } }>(`/api/documents/${documentId}`).then((data) => setDocumentTitle(data.document.title));
  }, [documentId]);

  async function enableShare() {
    const link = await apiPost<{ token: string }>(`/api/documents/${documentId}/share`, {});
    setShareToken(link.token);
  }

  return (
    <main className="page">
      <header className="toolbar">
        <h1>{documentTitle}</h1>
        <button onClick={enableShare}>开启公开预览</button>
      </header>
      {shareToken ? <p>公开预览：/public/{shareToken}</p> : null}
      <section className="editor-shell" data-testid="editor-shell">
        <p>ProseMirror + Yjs 编辑器将在任务 8 接入。</p>
      </section>
    </main>
  );
}
```

写入 `apps/web/src/pages/PublicPreviewPage.tsx`：

```tsx
import { useEffect, useState } from 'react';

export function PublicPreviewPage({ token }: { token: string }) {
  const [title, setTitle] = useState('加载中');

  useEffect(() => {
    fetch(`http://127.0.0.1:3000/api/public/${token}`)
      .then((response) => {
        if (!response.ok) throw new Error('公开链接已失效');
        return response.json();
      })
      .then((data) => setTitle(data.document.title))
      .catch(() => setTitle('公开链接已失效'));
  }, [token]);

  return (
    <main className="page">
      <p className="badge">公开只读预览</p>
      <h1>{title}</h1>
      <p>登录后可申请加入协作编辑。</p>
    </main>
  );
}
```

写入 `apps/web/src/App.tsx`：

```tsx
import { createRoot } from 'react-dom/client';
import { DocumentPage } from './pages/DocumentPage';
import { HomePage } from './pages/HomePage';
import { PublicPreviewPage } from './pages/PublicPreviewPage';
import './styles.css';

function App() {
  const path = window.location.pathname;
  const documentMatch = path.match(/^\/documents\/([^/]+)$/);
  const publicMatch = path.match(/^\/public\/([^/]+)$/);

  if (documentMatch) return <DocumentPage documentId={documentMatch[1]} />;
  if (publicMatch) return <PublicPreviewPage token={publicMatch[1]} />;
  return <HomePage />;
}

createRoot(document.getElementById('root')!).render(<App />);
```

写入 `apps/web/src/styles.css`：

```css
body {
  margin: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: #f8fafc;
  color: #0f172a;
}

.page {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.card,
.toolbar button {
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  background: white;
  padding: 16px;
  text-align: left;
  cursor: pointer;
}

.card span {
  display: block;
  margin-top: 8px;
  color: #475569;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.editor-shell {
  min-height: 360px;
  margin-top: 24px;
  border: 1px solid #cbd5e1;
  border-radius: 16px;
  background: white;
  padding: 24px;
}

.badge {
  display: inline-block;
  border-radius: 999px;
  background: #dbeafe;
  color: #1d4ed8;
  padding: 4px 10px;
}
```

- [ ] **步骤 6：运行前端测试和类型检查**

运行：

```bash
pnpm --filter @online-docs/web test tests/editorSchema.test.ts
pnpm --filter @online-docs/web typecheck
```

预期：PASS，无 TypeScript 错误。

- [ ] **步骤 7：Commit**

```bash
git add apps/web
git commit -m "feat: add collaborative document web shell"
```

## 任务 8：接入 ProseMirror + Yjs 最小编辑器

**文件：**
- 创建：`apps/web/src/editor/createEditor.ts`
- 修改：`apps/web/src/pages/DocumentPage.tsx`

- [ ] **步骤 1：编写失败的编辑器创建测试**

写入 `apps/web/tests/createEditor.test.ts`：

```typescript
import { describe, expect, test } from 'vitest';
import * as Y from 'yjs';
import { createInitialYDocText } from '../src/editor/createEditor';

describe('createInitialYDocText', () => {
  test('creates editable shared text with initial content', () => {
    const doc = new Y.Doc();
    createInitialYDocText(doc, 'body', '课程报告');
    expect(doc.getText('body').toString()).toBe('课程报告');
  });
});
```

- [ ] **步骤 2：运行测试验证失败**

运行：

```bash
pnpm --filter @online-docs/web test tests/createEditor.test.ts
```

预期：FAIL，报错包含 `Cannot find module '../src/editor/createEditor'`。

- [ ] **步骤 3：实现最小编辑器辅助函数**

写入 `apps/web/src/editor/createEditor.ts`：

```typescript
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import * as Y from 'yjs';
import { ySyncPlugin, yCursorPlugin, yUndoPlugin } from 'y-prosemirror';
import { collaborativeDocSchema } from './schema';

export function createInitialYDocText(doc: Y.Doc, field: string, text: string) {
  const sharedText = doc.getText(field);
  if (sharedText.length === 0) {
    sharedText.insert(0, text);
  }
  return sharedText;
}

export function mountEditor(element: HTMLElement, ydoc: Y.Doc, provider: { awareness: unknown }) {
  const sharedType = ydoc.getXmlFragment('prosemirror');
  const state = EditorState.create({
    schema: collaborativeDocSchema,
    plugins: [
      ySyncPlugin(sharedType),
      yCursorPlugin((provider as any).awareness),
      yUndoPlugin()
    ]
  });

  return new EditorView(element, { state });
}
```

- [ ] **步骤 4：接入 DocumentPage**

把 `apps/web/src/pages/DocumentPage.tsx` 替换为：

```tsx
import { useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { apiGet, apiPost } from '../api/client';
import { mountEditor } from '../editor/createEditor';

export function DocumentPage({ documentId }: { documentId: string }) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [documentTitle, setDocumentTitle] = useState('加载中');
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [status, setStatus] = useState('连接中');

  useEffect(() => {
    apiGet<{ document: { title: string } }>(`/api/documents/${documentId}`).then((data) => setDocumentTitle(data.document.title));
  }, [documentId]);

  useEffect(() => {
    if (!editorRef.current) return;
    const ydoc = new Y.Doc();
    const provider = new WebsocketProvider('ws://127.0.0.1:3000', `documents/${documentId}`, ydoc, {
      params: { userId: 'user-a' }
    });
    provider.on('status', (event: { status: string }) => setStatus(event.status === 'connected' ? '已连接' : '连接中'));
    const view = mountEditor(editorRef.current, ydoc, provider);

    return () => {
      view.destroy();
      provider.destroy();
      ydoc.destroy();
    };
  }, [documentId]);

  async function enableShare() {
    const link = await apiPost<{ token: string }>(`/api/documents/${documentId}/share`, {});
    setShareToken(link.token);
  }

  return (
    <main className="page">
      <header className="toolbar">
        <div>
          <h1>{documentTitle}</h1>
          <p>协同状态：{status}</p>
        </div>
        <button onClick={enableShare}>开启公开预览</button>
      </header>
      {shareToken ? <p>公开预览：/public/{shareToken}</p> : null}
      <section className="editor-shell" ref={editorRef} data-testid="editor-shell" />
    </main>
  );
}
```

- [ ] **步骤 5：运行测试验证通过**

运行：

```bash
pnpm --filter @online-docs/web test tests/createEditor.test.ts tests/editorSchema.test.ts
pnpm --filter @online-docs/web typecheck
```

预期：PASS，无 TypeScript 错误。

- [ ] **步骤 6：Commit**

```bash
git add apps/web/src/editor/createEditor.ts apps/web/src/pages/DocumentPage.tsx apps/web/tests/createEditor.test.ts
git commit -m "feat: connect prosemirror editor to yjs document"
```

## 任务 9：端到端协作与公开预览验收

**文件：**
- 创建：`e2e/collaborative-doc.spec.ts`
- 修改：`apps/api/src/server.ts`
- 修改：`apps/api/src/realtime/collaborationServer.ts`

- [ ] **步骤 1：编写失败的端到端测试**

写入 `e2e/collaborative-doc.spec.ts`：

```typescript
import { expect, test } from '@playwright/test';

test('creates a document from template and opens public readonly preview', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /课程小组报告/ }).click();

  await expect(page.getByRole('heading', { name: '课程小组报告' })).toBeVisible();
  await page.getByRole('button', { name: '开启公开预览' }).click();

  const previewText = await page.getByText(/公开预览：\/public\//).textContent();
  const token = previewText!.split('/public/')[1];

  await page.goto(`/public/${token}`);
  await expect(page.getByText('公开只读预览')).toBeVisible();
  await expect(page.getByRole('heading', { name: '课程小组报告' })).toBeVisible();
  await expect(page.getByText('登录后可申请加入协作编辑。')).toBeVisible();
});
```

- [ ] **步骤 2：运行端到端测试验证失败**

运行：

```bash
pnpm test:e2e
```

预期：FAIL。若失败原因是 WebSocket 路径不匹配或 CORS，进入下一步修复。

- [ ] **步骤 3：修复 WebSocket 路径与 CORS**

在 `apps/api/src/server.ts` 创建 Fastify 时允许本地前端访问：

```typescript
const app = fastify();
app.addHook('onRequest', async (_request, reply) => {
  reply.header('access-control-allow-origin', 'http://127.0.0.1:5173');
  reply.header('access-control-allow-headers', 'content-type,x-user-id');
  reply.header('access-control-allow-methods', 'GET,POST,DELETE,OPTIONS');
});
app.options('*', async () => ({}));
```

在 `apps/api/src/realtime/collaborationServer.ts` 确保路由与前端 `documents/${documentId}` 对齐：

```typescript
app.get('/documents/:documentId', { websocket: true }, (connection, request) => {
  // 保持原有处理逻辑
});
```

- [ ] **步骤 4：运行端到端测试验证通过**

运行：

```bash
pnpm test:e2e
```

预期：PASS，公开预览流程通过。

- [ ] **步骤 5：运行全量测试与类型检查**

运行：

```bash
pnpm test
pnpm typecheck
```

预期：PASS，无 TypeScript 错误。

- [ ] **步骤 6：Commit**

```bash
git add e2e apps/api/src/server.ts apps/api/src/realtime/collaborationServer.ts
git commit -m "test: cover collaborative document preview flow"
```

## 任务 10：收尾验证与文档同步

**文件：**
- 创建：`README.md`
- 修改：`docs/superpowers/plans/2026-06-02-realtime-collaborative-docs-m1-plan.md`

- [ ] **步骤 1：编写 README**

写入 `README.md`：

```markdown
# 实时协作文档 MVP

这是一个面向教育与轻项目场景的实时协作文档 MVP 骨架。

## 当前能力

- 从系统模板创建文档。
- 文档级 `Owner` / `Editor` / `Viewer` 权限模型。
- 公开只读分享预览。
- 评论、回复、解决的领域服务。
- 自动快照与恢复的领域服务。
- Yjs 文档房间与最小 ProseMirror 编辑器。
- Vitest 单元测试与 Playwright 端到端测试。

## 本地开发

```bash
pnpm install
pnpm dev
```

访问：

- Web：http://127.0.0.1:5173
- API：http://127.0.0.1:3000/health

## 验证

```bash
pnpm test
pnpm typecheck
pnpm test:e2e
```

## 规格与计划

- 规格：`docs/superpowers/specs/2026-06-02-realtime-collaborative-docs-design.md`
- 计划：`docs/superpowers/plans/2026-06-02-realtime-collaborative-docs-m1-plan.md`
```

- [ ] **步骤 2：运行最终验证**

运行：

```bash
pnpm test
pnpm typecheck
pnpm test:e2e
```

预期：全部 PASS。

- [ ] **步骤 3：检查 Git 状态**

运行：

```bash
git status --short
```

预期：只显示 `README.md` 和计划文档变更。

- [ ] **步骤 4：Commit**

```bash
git add README.md docs/superpowers/plans/2026-06-02-realtime-collaborative-docs-m1-plan.md
git commit -m "docs: add collaborative docs m1 implementation plan"
```

## 自检结果

### 规格覆盖度

本计划覆盖以下规格要求：

- 富文本实时协同编辑：任务 6、7、8、9。
- 在线状态与 presence 基础能力：任务 6。
- 自动保存与协同状态基础：任务 6。
- 文档级权限策略：任务 1、5、6。
- 公开只读分享：任务 4、5、9。
- 评论创建、回复、解决：任务 4、5。
- 版本快照与恢复：任务 4、5。
- 系统内置模板：任务 3、5、9。
- 输入清理与基础安全：任务 2。
- 端到端验收：任务 9。

本计划未覆盖且需要后续独立计划的内容：

- PostgreSQL + JSONB 持久化。
- Redis 活跃文档缓存。
- 生产级认证。
- 完整评论侧边栏 UI。
- 版本历史面板 UI。
- 任务列表完整 ProseMirror 命令。
- 性能压测与 500 ms 指标采集。

### 占位符扫描

计划中没有使用未完成标记、模糊占位或未定义任务引用。

### 类型一致性

核心类型命名保持一致：

- 角色：`owner | editor | viewer | anonymousViewer`。
- 文档可见性：`private | public_readonly`。
- 分享链接：`ShareLinkRecord`。
- 评论线程：`CommentThreadRecord`。
- 快照：`DocumentSnapshotRecord`。
- 协同房间：`createDocumentRoom()`。
