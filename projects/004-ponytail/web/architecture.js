"use strict";
const routes = {
  plugin: {
    steps: ["插件清单", "宿主事件 → Hook 脚本", "读取 Skill → 构建上下文"],
    title: "Skill 提供内容，Hooks 提供自动送达。",
    description: "插件把两者登记给宿主。启动事件触发脚本，脚本直接读取核心 SKILL.md 并输出文本；这条路径不要求模型先主动选择或调用该 Skill。",
    exclusion: "此路径不依赖 MCP，也不要求再复制一份 AGENTS.md。",
  },
  skill: {
    steps: ["宿主发现技能元数据", "显式调用 / 按任务选择", "宿主加载 Skill 正文"],
    title: "只用 Skill，就能提供核心开发指导。",
    description: "宿主根据 name、description 和用户选择加载正文，模型获得决策阶梯和边界。这里通常由宿主管理 Skill 加载，不必经过 Ponytail 的 Node.js 规则构建器。",
    exclusion: "不必配置 MCP 或 Hooks，但也不能因此假定获得自动激活、模式状态管理和子代理传递。",
  },
  rules: {
    steps: ["项目中的规则文件", "宿主按自身规则读取", "紧凑规则加入上下文"],
    title: "静态文件提供原则，宿主负责读取。",
    description: "AGENTS.md 等文件包含核心工程原则的紧凑版本。它不注册六项 Skill，也不运行模式跟踪脚本；是否自动读取，以及适用范围，都由宿主约定决定。",
    exclusion: "不需要 MCP 或动态插件；静态规则仍存在时，插件 off 命令不能删除该文件里的要求。",
  },
  mcp: {
    steps: ["宿主连接 MCP 服务", "请求 Prompt / 规则工具", "共用构建器 → 返回文本"],
    title: "MCP 在这里提供规则文本，不承担编程。",
    description: "服务复用 getPonytailInstructions()，返回 Prompt 消息或工具结果。宿主将结果提供给模型后，仍使用自己的文件和终端工具开发。服务本身没有项目扫描或补丁执行能力。",
    exclusion: "不需要共用事件 Hooks；仅连接服务不等于规则已被请求，更不等于每轮自动生效。",
  },
};
for (const radio of document.querySelectorAll('input[name="route"]')) {
  radio.addEventListener("change", () => {
    const route = routes[radio.value];
    for (const [i, id] of ["route-a", "route-b", "route-c"].entries()) {
      document.getElementById(id).textContent = route.steps[i];
    }
    document.getElementById("route-title").textContent = route.title;
    document.getElementById("route-description").textContent = route.description;
    document.getElementById("route-exclusion").textContent = route.exclusion;
  });
}
