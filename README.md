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
