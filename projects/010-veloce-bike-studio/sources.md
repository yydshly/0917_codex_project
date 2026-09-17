# 参考来源与许可证

- 参考网页：[VELOCE R9 / Aero-Carbon 3D Bicycle Studio](https://01a0adea-b123-7107-885c-42cf51379f50.arena.site/)
- 观察日期：2026-09-17。
- 网页未发现公开 GitHub 仓库、原始工程下载、Source Map 或明确的开源许可证。上游 commit **不适用 / 未提供**，不能以网页 URL 冒充代码仓库。
- 参考证据：`assets/desktop.png`、`assets/mobile.png`、`assets/exploded.png` 与各视角截图，均为浏览器实拍。图片仅用于研究与比较，权利归原作者；没有把截图用作应用中的模型或贴图。
- 实现方法：根据公开可见的功能与交互独立编写 React UI、场景几何、状态管理和演示公式。没有复制或反编译原站 82 万字符的打包 JavaScript，没有使用其模型、品牌图标或远程资产。
- 标题保留 Veloce / R9 作为参考项目识别，页面注明独立能力研究；不声称为原站、真实品牌官方工具或其开源镜像。

## 依赖

| 依赖 | 固定版本 | 许可证 | 用途 |
| --- | --- | --- | --- |
| Three.js | 0.180.0 | MIT | WebGL 渲染、程序化模型、OrbitControls、RoomEnvironment |
| React / React DOM | 19.2.0 | MIT | 配置界面与状态管理 |
| Lucide React | 0.468.0 | ISC | 控件图标（参考页同类线性图标的替代） |
| Space Grotesk / Fontsource | 5.2.10（分发包） | SIL OFL 1.1（字体） | 本地字体；中文使用系统字体 |
| Vite | 6.4.2 | MIT | 开发与静态打包 |

依赖来源为 npm 官方注册表，通过 `package-lock.json` 固定解析结果。构建脚本将运行时依赖许可证复制到 `site/apps/010-veloce-bike-studio/licenses/`。中文字体采用系统回退，不额外下载。

技术参考：[Three.js 文档](https://threejs.org/docs/)、[React 文档](https://react.dev/)。模型是本项目程序化构建的近似公路车，不是制造级 CAD，不使用原站商业部件型号背书。

## 第二轮机械细节资料

- https://www.kmcchain.eu/service/glossary
- https://www.parktool.com/en-us/blog/repair-help/how-a-rear-derailleur-works
- https://www.parktool.com/en-us/blog/repair-help/chain-replacement-derailleur-bikes

以上用于核对名义节距、上下导轮作用及链条绕行关系；未复制任何厂商 CAD 或图片。
