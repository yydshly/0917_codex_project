"""Create numbered research projects and maintain the root README (stdlib only)."""

import argparse
import html
import json
import re
import shutil
import sys
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
STATUSES = {"待研究", "研究中", "已完成", "已归档"}
SLUG = re.compile(r"[a-z0-9]+(?:-[a-z0-9]+)*")


def require(condition, message):
    if not condition:
        raise ValueError(message)


def valid_url(value, github=False):
    parsed = urlparse(value)
    return (
        parsed.scheme in ({"https"} if github else {"http", "https"})
        and bool(parsed.netloc)
        and not any(char.isspace() for char in value)
        and (not github or (parsed.netloc == "github.com" and len(parsed.path.strip("/").split("/")) == 2))
    )


def read_projects():
    projects = []
    seen = set()
    for folder in sorted((ROOT / "projects").iterdir()):
        if not folder.is_dir() or folder.name.startswith("."):
            continue
        meta = folder / "project.json"
        require(meta.is_file(), f"{folder.name}: 缺少 project.json")
        data = json.loads(meta.read_text(encoding="utf-8"))
        require(isinstance(data, dict), f"{folder.name}: 元数据必须是 JSON 对象")
        number = data.get("id")
        require(type(number) is int and number > 0, f"{folder.name}: id 必须是正整数")
        require(number not in seen, f"重复编号: {number}")
        seen.add(number)
        for key in ("slug", "name", "summary", "repo", "status", "demo", "cover", "cover_alt"):
            require(isinstance(data.get(key), str), f"{folder.name}: {key} 必须是字符串")
            require("\n" not in data[key] and "\r" not in data[key], f"{folder.name}: {key} 不能换行")
        require(SLUG.fullmatch(data["slug"]), f"{folder.name}: slug 格式错误")
        require(folder.name == f"{number:03d}-{data['slug']}", f"{folder.name}: 目录与编号或 slug 不一致")
        require(data["name"].strip() and data["summary"].strip(), f"{folder.name}: 名称和摘要不能为空")
        require(data["status"] in STATUSES, f"{folder.name}: 未知研究状态")
        require(not data["repo"] or valid_url(data["repo"], github=True), f"{folder.name}: 上游仓库地址无效")
        source = data.get("source", "")
        require(isinstance(source, str) and (not source or valid_url(source)), f"{folder.name}: 网页来源无效")
        require(data["repo"] or source, f"{folder.name}: 必须提供上游仓库或网页来源")
        require(not data["demo"] or valid_url(data["demo"]), f"{folder.name}: 演示地址无效")
        require((folder / "README.md").is_file(), f"{folder.name}: 缺少 README.md")
        if data["cover"]:
            cover = (folder / data["cover"]).resolve()
            require(cover.is_relative_to(folder.resolve()), f"{folder.name}: 封面必须位于项目目录内")
            require(cover.is_file(), f"{folder.name}: 封面文件不存在")
            require(cover.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"}, f"{folder.name}: 封面格式不支持")
            require(data["cover_alt"].strip(), f"{folder.name}: 请填写封面替代文本")
            data["cover"] = cover.relative_to(folder.resolve()).as_posix()
        data["folder"] = folder.name
        projects.append(data)
    return sorted(projects, key=lambda item: item["id"])


def escape(value):
    # Escape Markdown punctuation and HTML so metadata cannot break generated rows.
    return re.sub(r"([\\`*_{}\[\]()#+.!|>~-])", r"\\\1", html.escape(value, quote=True))


def link(label, target):
    return f'<a href="{html.escape(target, quote=True)}">{html.escape(label)}</a>'


def source_link(project):
    target = project["repo"] or project.get("source", "")
    label = urlparse(target).path.strip('/') if project["repo"] else "参考网页"
    return link(label, target)


def render(projects):
    if not projects:
        return {
            "PROJECT_INDEX": "暂无研究项目。使用下方命令创建第一个项目，编号从 `001` 开始。",
            "PROJECT_GALLERY": "暂无项目图片。为子项目添加封面后，这里会自动展示预览。",
        }
    rows = ["| 编号 | 项目 | 研究摘要 | 状态 | 上游 | Web 演示 |", "| --- | --- | --- | --- | --- | --- |"]
    gallery = []
    for project in projects:
        path = f"projects/{project['folder']}"
        demo = link("访问演示", project["demo"]) if project["demo"] else "—"
        rows.append(
            f"| {project['id']:03d} | [{escape(project['name'])}]({path}/README.md) | "
            f"{escape(project['summary'])} | {project['status']} | {source_link(project)} | {demo} |"
        )
        if project["cover"]:
            image_path = html.escape(f"{path}/{project['cover']}", quote=True)
            alt = html.escape(project["cover_alt"], quote=True)
            gallery.append(
                f"### {project['id']:03d} · {escape(project['name'])}\n\n"
                f'<a href="{path}/README.md"><img src="{image_path}" alt="{alt}" width="640"></a>\n\n'
                f"{escape(project['summary'])}"
            )
    return {
        "PROJECT_INDEX": "\n".join(rows),
        "PROJECT_GALLERY": "\n\n".join(gallery) or "暂无项目图片。为子项目添加封面后，这里会自动展示预览。",
    }


def readme_content(projects):
    content = (ROOT / "README.md").read_text(encoding="utf-8")
    for marker, replacement in render(projects).items():
        start = f"<!-- {marker}:START -->"
        end = f"<!-- {marker}:END -->"
        require(content.count(start) == content.count(end) == 1, f"README 缺少或重复标记: {marker}")
        require(content.index(start) < content.index(end), f"README 标记顺序错误: {marker}")
        before, rest = content.split(start)
        _, after = rest.split(end)
        content = before + start + "\n" + replacement + "\n" + end + after
    return content


def sync(check=False):
    projects = read_projects()
    expected = readme_content(projects)
    path = ROOT / "README.md"
    if check:
        require(path.read_text(encoding="utf-8") == expected, "首页索引已过期，请运行 python scripts/projects.py sync")
        print(f"检查通过，共 {len(projects)} 个研究项目。")
    else:
        path.write_text(expected, encoding="utf-8", newline="\n")
        print(f"首页已同步，共 {len(projects)} 个研究项目。")


def create(args):
    projects = read_projects()
    readme_content(projects)  # Check markers before creating any files.
    require(SLUG.fullmatch(args.slug), "slug 仅支持小写英文、数字和中划线")
    require(all(item["slug"] != args.slug for item in projects), "该 slug 已存在")
    require(not args.repo or valid_url(args.repo, github=True), "请提供 https://github.com/owner/repo 格式的上游地址")
    require(not args.source or valid_url(args.source), "请提供有效的网页来源地址")
    require(args.repo or args.source, "请提供 --repo 或 --source")
    for label, value in (("名称", args.name), ("摘要", args.summary)):
        require(value.strip() and "\n" not in value and "\r" not in value, f"{label} 不能为空或包含换行")
    number = max((item["id"] for item in projects), default=0) + 1
    folder = ROOT / "projects" / f"{number:03d}-{args.slug}"
    require(not folder.exists(), "目标目录已经存在")
    shutil.copytree(ROOT / "templates" / "project", folder)
    values = {"id": f"{number:03d}", "name": escape(args.name), "repo": args.repo or args.source, "summary": escape(args.summary)}
    for path in folder.rglob("*.md"):
        content = path.read_text(encoding="utf-8")
        content = re.sub(r"\{\{(id|name|repo|summary)\}\}", lambda match: values[match[1]], content)
        path.write_text(content, encoding="utf-8", newline="\n")
    metadata = {
        "id": number, "slug": args.slug, "name": args.name, "summary": args.summary,
        "repo": args.repo, "status": "待研究", "demo": "", "cover": "", "cover_alt": "",
    }
    if args.source:
        metadata["source"] = args.source
    (folder / "project.json").write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    sync()
    print(f"已创建 projects/{folder.name}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    new = commands.add_parser("new", help="创建带编号的研究项目并同步首页")
    new.add_argument("slug")
    new.add_argument("--name", required=True)
    new.add_argument("--repo", default="")
    new.add_argument("--source", default="", help="没有公开仓库时填写参考网页")
    new.add_argument("--summary", required=True)
    commands.add_parser("sync", help="更新首页索引和封面预览")
    commands.add_parser("check", help="检查项目元数据与首页是否一致")
    args = parser.parse_args()
    try:
        if args.command == "new":
            create(args)
        else:
            sync(check=args.command == "check")
    except (ValueError, OSError) as error:
        print(f"错误: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
