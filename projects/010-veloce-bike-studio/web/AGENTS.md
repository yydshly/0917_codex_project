# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## 用户确认的细节方向（2026-09-17）

- 用户指出链条等能力细节不足，要求优化并分析细节模块。以后优先保证传动链路、可辨识的零件结构与可检视的运动联动，不将整体轮廓或开关存在等同于细节完成。
- 保留现有工业风和配置流程，细节增强围绕链条、牙盘、飞轮、后拨、轮组与制动展开。

- 用户要求补全车把、座椅、前部手机支架、铃铛和装水位置。配件默认装配，保留独立检视、装卸开关及随父部件转向 / 分解的连接关系。

- 刹车与滑行使用独立车轮速度状态；暂停模拟冻结时间，停止踩踏允许滑行，不把暂停当制动。检视单步只改变机构相位。动力学是明确标注的一维教学模型。

- 用户确认完善变速与链条，并要求车灯和座椅升降卡扣。前灯随车把、尾灯随座管移动；快拆夹环留在车架上。只有打开卡扣才能调高度，打开时暂停骑行。链条保留固定销距与导板长度，换档后车速不瞬间跳变。
