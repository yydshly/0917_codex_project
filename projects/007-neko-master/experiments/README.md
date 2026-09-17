# 验证与复现

这些实验验证本地教学模型和静态研究页，不是上游端到端运行记录。

```powershell
node --test projects/007-neko-master/experiments/model.test.mjs
python projects/007-neko-master/web/build.py
python projects/007-neko-master/experiments/verify.py
python scripts/projects.py check
python scripts/build_site.py
```

模型检查覆盖初见计数、差分、重复 / 空闲、计数回退、写入守恒与重置。资源检查覆盖固定版本 PNG 哈希、许可和发布白名单，以及 HTML 相对链接和锚点。检查结果记录于 `validation.json`。

浏览器检查覆盖截图切换、实验推进 / 落盘 / 重置、模式切换和移动布局；完成后的具体观察记录于 `browser-validation.md`。真实网关、Docker、Agent 与 ClickHouse 尚未运行。
