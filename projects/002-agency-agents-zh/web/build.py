"""Build this project's offline-capable research page from its reviewed snapshot."""
import html
import json
import shutil
from pathlib import Path
from string import Template

HERE = Path(__file__).resolve().parent
OUT = HERE.parents[2] / "site/apps/002-agency-agents-zh"
GROUPS = {
    "company": ("公司经营", "战略、技术、产品、营销与运营决策视角。"),
    "engineering": ("工程开发", "软件架构、编码、文档、企业平台集成与工业开发。"),
    "design": ("设计与体验", "界面、用户研究、品牌与图像视频提示方法。"),
    "marketing": ("营销与内容", "内容策划、平台运营、搜索增长与中国市场场景。"),
    "paid-media": ("付费媒体", "广告账户分析、投放策略与创意评估。"),
    "sales": ("销售支持", "客户研究、售前方案与销售过程管理。"),
    "finance": ("金融与财务", "财务分析、金融研究与规划工作方法。"),
    "hr": ("人力资源", "招聘与绩效管理相关的工作指引。"),
    "legal": ("法务", "合同与法律事务的分析、检查和文档组织。"),
    "supply-chain": ("供应链", "采购、供应商与物流协同的工作方法。"),
    "product": ("产品规划", "需求、反馈、优先级与产品方向分析。"),
    "project-management": ("项目管理", "任务拆解、进度协调、交付与实验跟踪。"),
    "testing": ("测试与验收", "测试方案、证据收集与完成情况核验。"),
    "support": ("运营与支持", "客户支持、业务分析与日常运营流程。"),
    "specialized": ("专项角色", "编排、知识管理及多种细分行业工作方法。"),
    "spatial-computing": ("空间计算", "XR、沉浸式界面与空间交互开发。"),
    "game-development": ("游戏开发", "游戏设计、引擎、技术美术、音频与叙事。"),
    "academic": ("学术领域", "不同学科的专业分析与研究表达。"),
    "gis": ("地理信息", "空间数据、遥感、地图与三维地理场景。"),
    "security": ("安全工程", "威胁分析、安全审查与防护流程。"),
}


def build():
    data = json.loads((HERE / "catalog.json").read_text(encoding="utf-8"))
    groups = {g["id"]: g for g in data["divisions"]}
    assert set(groups) == set(GROUPS), "Review department summaries before updating snapshot"
    base = data["repository"] + "/blob/" + data["commit"] + "/"
    cards, options = [], []
    for key, (name, summary) in GROUPS.items():
        agents = groups[key]["agents"]
        items = []
        for agent in agents:
            search = html.escape(agent["name"] + " " + agent["path"], quote=True)
            items.append(f'<li data-search="{search}"><a href="{base}{agent["path"]}" target="_blank" rel="noopener noreferrer">{html.escape(agent["name"])} <span aria-hidden="true">↗</span></a></li>')
        cards.append(f'<article class="division" data-group="{key}"><div class="card-meta"><span>{key}</span><span class="count">{len(agents)} 个角色</span></div><h3>{name}</h3><p>{summary}</p><details><summary>查看角色清单<span aria-hidden="true">＋</span></summary><ul class="agent-list">{"".join(items)}</ul></details></article>')
        options.append(f'<option value="{key}">{name} · {len(agents)}</option>')
    tokens = {"total": sum(len(g["agents"]) for g in groups.values()), "divisions": len(groups),
              "commit": data["commit"], "short_commit": data["commit"][:12], "date": data["reviewed_on"],
              "base": base, "cards": "\n".join(cards), "options": "".join(options)}
    page = Template((HERE / "index.template.html").read_text(encoding="utf-8")).substitute(tokens)
    tokens["summary_domains"] = "".join(
        f'<div class="domain"><span>{name}</span><strong>{len(groups[key]["agents"])}</strong></div>'
        for key, (name, _) in GROUPS.items()
    )
    summary = Template((HERE / "capability-summary.template.html").read_text(encoding="utf-8")).substitute(tokens)
    (HERE / "capability-summary.html").write_text(summary, encoding="utf-8", newline="\n")
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "index.html").write_text(page, encoding="utf-8", newline="\n")
    (OUT / "capability-summary.html").write_text(summary, encoding="utf-8", newline="\n")
    summary_image = HERE.parent / "assets/capability-summary.png"
    if summary_image.is_file():
        shutil.copyfile(summary_image, OUT / "capability-summary.png")
    for filename in ("styles.css", "app.js", "catalog.json", "UPSTREAM-LICENSE.txt"):
        shutil.copyfile(HERE / filename, OUT / filename)
    print(f"Built {OUT}")


if __name__ == "__main__":
    build()
