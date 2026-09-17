"use strict";

const dateInput = document.getElementById("due-date");
const taskRows = Array.from(document.querySelectorAll("#task-list > li"));
const count = document.getElementById("result-count");
const emptyState = document.getElementById("empty-state");
const dateButtons = Array.from(document.querySelectorAll("[data-date]"));

function applyDateFilter() {
  const selected = dateInput.value;
  let visible = 0;
  for (const row of taskRows) {
    row.hidden = Boolean(selected && row.dataset.due !== selected);
    if (!row.hidden) visible += 1;
  }
  count.textContent = `共 ${visible} 项任务`;
  emptyState.hidden = visible !== 0;
}

function updateFilter() {
  applyDateFilter();
  for (const button of dateButtons) {
    button.setAttribute("aria-pressed", String(button.dataset.date === dateInput.value));
  }
}

dateInput.addEventListener("input", updateFilter);
dateInput.addEventListener("change", updateFilter);
document.getElementById("filter-form").addEventListener("submit", (event) => event.preventDefault());
document.getElementById("filter-form").addEventListener("reset", (event) => {
  event.preventDefault();
  dateInput.value = "";
  updateFilter();
  dateInput.focus();
});
for (const button of dateButtons) {
  button.addEventListener("click", () => {
    dateInput.value = button.dataset.date;
    updateFilter();
  });
}
updateFilter();

for (const radio of document.querySelectorAll('input[name="context"]')) {
  radio.addEventListener("change", () => {
    const reuse = radio.value === "reuse";
    const stop = reuse ? 2 : 4;
    for (const row of document.querySelectorAll("[data-rung]")) {
      const rung = Number(row.dataset.rung);
      row.classList.toggle("is-stop", rung === stop);
      row.classList.toggle("is-skipped", rung > stop);
      row.querySelector(".rung-state").textContent = rung === stop ? "采用" : rung > stop ? "无需继续" : "继续";
    }
    document.getElementById("reuse-explanation").textContent = reuse
      ? "已有符合要求的 DateFilter，直接接入现有列表。"
      : "列表和渲染逻辑可以复用，日期控件尚缺。";
    document.getElementById("decision-title").textContent = reuse
      ? "复用 DateFilter，接入现有列表"
      : "原生日期输入 + 现有列表";
    document.getElementById("decision-detail").textContent = reuse
      ? "在第 2 步停止：已有组件满足明确需求，就不再写一份日期控件。这里是假设前提的决策说明，没有加载一个真实的 DateFilter 库。"
      : "增加一个原生日期输入框，接入现有列表过滤与渲染。这个演示无需新增第三方依赖。";
  });
}

const modeCopy = {
  lite: ["LITE / 提出更简单的备选", "完成日期筛选，同时提示原生控件已足够。", "保留用户选择空间，说明更轻的方案。如果用户明确要求某种日历交互，仍按需求实现。"],
  full: ["FULL / 采用最小的充分方案", "原生日期输入框满足要求，就直接采用。", "复用列表渲染，增加日期筛选和空状态，不引入日历库。需求、标签和必要检查都保留。"],
  ultra: ["ULTRA / 进一步质疑额外复杂度", "筛选是明确需求，先删掉未来日历框架的设想。", "不为尚未提出的区间、主题系统和时区预约搭框架。仍完成当前筛选；明确要求的复杂能力不能擅自省略。"],
};
for (const radio of document.querySelectorAll('input[name="mode"]')) {
  radio.addEventListener("change", () => {
    const [label, title, detail] = modeCopy[radio.value];
    document.getElementById("mode-label").textContent = label;
    document.getElementById("mode-title").textContent = title;
    document.getElementById("mode-detail").textContent = detail;
  });
}
