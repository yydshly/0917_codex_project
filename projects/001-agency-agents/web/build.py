"""Build a dependency-free, subpath-safe static research page from a pinned catalog."""
import html
import json
import shutil
from pathlib import Path
from string import Template

HERE = Path(__file__).resolve().parent
OUT = HERE.parents[2] / "site" / "apps" / "001-agency-agents"
GROUPS = {
    "engineering": ("工程开发", "架构设计、前后端实现、数据工程、开发工具与代码维护。", "构建与交付"),
    "design": ("设计与体验", "界面设计、用户研究、品牌规范与可访问的视觉体验。", "构建与交付"),
    "testing": ("测试与验收", "视觉证据、接口测试、性能评估与上线前的质量检查。", "构建与交付"),
    "security": ("安全工程", "威胁分析、安全评审与防护流程，支持安全相关任务。", "构建与交付"),
    "product": ("产品规划", "需求与反馈分析、优先级判断、趋势研究和产品决策。", "规划与协作"),
    "project-management": ("项目管理", "任务拆解、实验跟踪、进度协调与跨角色交接。", "规划与协作"),
    "research": ("研究与证据", "检索范围定义、来源质量评价、引用追溯和证据综合。", "规划与协作"),
    "specialized": ("专项与编排", "角色协调、知识管理、MCP 工具与其他专项工作流程。", "规划与协作"),
    "marketing": ("营销与内容", "内容策略、社交平台运营、搜索优化和增长实验。", "业务与运营"),
    "paid-media": ("广告投放", "广告策略、账户审计、创意方案与转化追踪。", "业务与运营"),
    "sales": ("销售支持", "客户研究、需求发现、售前方案、销售机会与管道分析。", "业务与运营"),
    "support": ("运营与支持", "客户支持、业务分析、基础设施维护与运营事务。", "业务与运营"),
    "finance": ("金融研究", "金融场景中的分析与工作流程；输出仍需专业复核。", "垂直领域"),
    "academic": ("学术领域", "按学科组织的专业分析、研究视角与知识表达。", "垂直领域"),
    "game-development": ("游戏开发", "游戏设计、引擎开发、技术美术、音频和叙事。", "垂直领域"),
    "gis": ("地理信息", "空间数据、地图应用、遥感、三维场景和地理分析。", "垂直领域"),
    "spatial-computing": ("空间计算", "XR 界面、沉浸式交互与空间计算应用开发。", "垂直领域"),
    "healthcare": ("医疗健康", "临床证据表达、医疗创新策略和健康系统相关分析。", "垂直领域"),
}

def build():
    data = json.loads((HERE / "catalog.json").read_text(encoding="utf-8"))
    groups = {g["id"]: g for g in data["divisions"]}
    assert set(groups) == set(GROUPS), "Update Chinese summaries for changed upstream divisions"
    base = data["repository"] + "/blob/" + data["commit"] + "/"
    cards = []
    for i, (key, (name, summary, family)) in enumerate(GROUPS.items(), 1):
        group = groups[key]
        links = "".join(f'<li><a href="{html.escape(base + a["path"], quote=True)}" target="_blank" rel="noopener noreferrer">{html.escape(a["name"])} <span aria-hidden="true">↗</span></a></li>' for a in group["agents"])
        cards.append(f'''<article class="division"><div class="card-meta"><span>{i:02d} / {family}</span><span class="count">{len(group['agents'])} 个角色</span></div><h3>{name}</h3><p>{summary}</p><details><summary>查看角色清单<span aria-hidden="true">＋</span></summary><ul class="agent-list">{links}</ul></details></article>''')
    tokens = {"total": sum(len(g["agents"]) for g in groups.values()), "divisions": len(groups),
              "commit": data["commit"], "short_commit": data["commit"][:12], "date": data["reviewed_on"],
              "base": base, "cards": "\n".join(cards)}
    page = Template((HERE / "index.template.html").read_text(encoding="utf-8")).substitute(tokens)
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "index.html").write_text(page, encoding="utf-8", newline="\n")
    for file in ("styles.css", "app.js", "UPSTREAM-LICENSE.txt", "catalog.json"):
        shutil.copyfile(HERE / file, OUT / file)
    shutil.copyfile(HERE / "capability-summary.html", OUT / "capability-summary.html")
    summary_image = HERE.parent / "assets" / "capability-summary.png"
    if summary_image.is_file():
        shutil.copyfile(summary_image, OUT / "capability-summary.png")
    print(f"Built {OUT}")

if __name__ == "__main__":
    build()
