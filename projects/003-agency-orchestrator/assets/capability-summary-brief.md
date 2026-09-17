# Agency Orchestrator 完整理解图

此图为本研究对固定版本的解释性整理，**不是官方截图，也不是 AI 模型生成的业务结果**。2026-09-17 制作，基准版本 0.19.2，commit `1f36dba95ef70a0f3c3559cac16acd9898622ad9`。

## 文件与用途

- [capability-summary.png](capability-summary.png)：2600 × 5748 像素，完整中文单图，适合下载、转发与放大阅读。
- [capability-summary.svg](capability-summary.svg)：相同内容的可编辑矢量版，保留文字；跨设备显示依赖本机中文字体，PNG 保留确定的字形。
- [capability-summary-text.md](capability-summary-text.md)：完整文字替代版本，便于检索、复制与无障碍阅读。
- [capability-summary-layout.json](capability-summary-layout.json)：尺寸、内容统计和版面边界检查记录。

替代文本：Agency Orchestrator 完整理解图，包含定位与角色关系、六类能力、五阶段执行及反馈循环、四步使用方法与命令、五角色真实案例、六类限制、适用价值与研究证据范围。

## 内容结构

1. 角色与方法、AO 引擎、模型和外部工具分别负责什么。
2. 建立流程、依赖调度、人工参与、模型媒体、输出、入口集成六类能力。
3. 解析校验 → 依赖调度 → 上下文组装 → 连接器调用 → 检查保存，以及反馈续跑回路。
4. 准备条件、写完整需求、预查执行、核对返工；附现有内容模板的最小命令示例。
5. 「下班前十分钟」五角色实际调用：329.9 秒首轮与 125.4 秒定向返工，偏差和修订结果。
6. 工具与事实、审批验收、资源、执行媒体、环境数据、格式质量六类边界。
7. 适合与不宜直接使用的场景，以及对研究仓库的价值和建议流程。
8. 源码和选定测试、真实案例、尚未验证部分，分别陈述证据。

## 来源与重要区分

- 能力和规模：[capabilities.md](../capabilities.md)、[notes.md](../notes.md)、固定版本上游源码。
- 内部顺序、命令和恢复输入：固定版本 `src/index.ts`、`src/core/executor.ts`、`src/cli.ts`。
- 实测数字与反馈：[run.json](../cases/content-launch/run.json)、[revision.json](../cases/content-launch/revision.json)、[反馈原文](../cases/content-launch/feedback.txt)。
- [本地验证摘要](../verification.json)：158 项指选定的核心测试，不代表全量测试或真实业务质量验收。
- 上游有限质量评测只用于说明结果并不一致；图不宣称多角色普遍优于单次生成。
- 使用建议与核心判断是研究归纳；未将实际未做的账号运营、媒体生成、界面体验标为已验证。

上游：[jnMetaCode/agency-orchestrator 固定 commit](https://github.com/jnMetaCode/agency-orchestrator/tree/1f36dba95ef70a0f3c3559cac16acd9898622ad9)。图没有复制角色全文或上游图像，采用本项目编写的说明文字与结构图形。

## 维护

在 Windows、已安装 Pillow 且有 Microsoft YaHei 字体的环境中，从仓库根目录执行：

```powershell
python projects/003-agency-orchestrator/web/render_summary.py
python projects/003-agency-orchestrator/web/build.py
```

制图采用程序排版以保留准确中文、命令和数字；已查看完整成图与关键区块，检查文字、箭头和边界。网页构建只复制现有图像，不依赖 Pillow，也不会调用模型或重新运行实验。更新图像尺寸时同步网页 img 的 width / height。
