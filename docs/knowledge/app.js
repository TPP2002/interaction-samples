"use strict";
const queryInput = document.querySelector("#query");
const categoryInput = document.querySelector("#category");
const resultBox = document.querySelector("#results");
const statusLine = document.querySelector("#status");
const sourcePanel = document.querySelector("#source");
let selectedId = "S002";
let terms = [];

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function showSource(doc, moveFocus = false) {
  selectedId = doc.id;
  document.querySelector("#source-meta").textContent = `${doc.id} · ${doc.state} · ${doc.date}`;
  document.querySelector("#source-title").textContent = doc.title;
  document.querySelector("#source-file").textContent = `原文件：${doc.filename}`;
  document.querySelector("#source-hash").textContent = doc.sha256;
  const list = document.querySelector("#source-lines");
  list.replaceChildren(...doc.lines.map(line => element("li", line, terms.some(term => line.toLowerCase().includes(term)) ? "hit" : "")));
  const download = document.querySelector("#download");
  download.href = "演示资料/" + encodeURIComponent(doc.filename);
  download.download = doc.filename;
  download.setAttribute("aria-label", `下载 ${doc.id} 原文`);
  for (const button of resultBox.querySelectorAll("button")) button.setAttribute("aria-pressed", String(button.dataset.id === doc.id));
  if (moveFocus) sourcePanel.focus();
}
function search() {
  terms = queryInput.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matches = window.DOCS.filter(doc => {
    const text = [doc.id, doc.title, ...doc.lines].join("\n").toLowerCase();
    return (!categoryInput.value || doc.category === categoryInput.value) && terms.every(term => text.includes(term));
  }).sort((a, b) => b.date.localeCompare(a.date));
  resultBox.replaceChildren();
  for (const doc of matches) {
    const section = element("section", undefined, "result");
    const heading = element("div", undefined, "result-head");
    heading.append(element("span", doc.id, "source-id"), element("h3", doc.title));
    const matchingLines = doc.lines.map((text, index) => ({text, line:index + 1})).filter(item => terms.some(term => item.text.toLowerCase().includes(term)));
    const preview = matchingLines.length ? matchingLines.slice(0, 2).map(item => `第 ${item.line} 行：${item.text}`).join("\n") : doc.lines.filter(line => line && !line.startsWith("#")).slice(0,2).join("\n");
    const button = element("button", `查看 ${doc.id} 原文`);
    button.type = "button";
    button.dataset.id = doc.id;
    button.addEventListener("click", () => showSource(doc, true));
    section.append(heading, element("p", `${doc.category} · ${doc.state} · ${doc.date}`, "meta"), element("p", preview), button);
    resultBox.append(section);
  }
  statusLine.textContent = matches.length ? `找到 ${matches.length} 份资料，共 ${window.DOCS.length} 份。以下显示原文片段。` : "当前关键词未命中。可换词，或点“查看全部”。";
  sourcePanel.hidden = !matches.length;
  if (matches.length) showSource(matches.find(doc => doc.id === selectedId) || matches[0]);
}
if (!Array.isArray(window.DOCS) || !window.DOCS.length) {
  statusLine.textContent = "资料文件未载入。请刷新；仍失败时核对 data.js 文件。";
  sourcePanel.hidden = true;
} else {
  document.querySelector("#search-form").addEventListener("submit", event => {event.preventDefault(); search();});
  categoryInput.addEventListener("change", search);
  document.querySelector("#reset").addEventListener("click", () => {queryInput.value = ""; categoryInput.value = ""; search(); queryInput.focus();});
  search();
}
