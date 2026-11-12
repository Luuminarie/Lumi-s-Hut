const desktop = document.querySelector(".desktop");
const windowLayer = document.querySelector("#window-layer");
const themeToggle = document.querySelector(".theme-toggle");
const themeLabel = document.querySelector(".theme-label");
const themeColor = document.querySelector('meta[name="theme-color"]');
const dockApps = [...document.querySelectorAll(".dock-app")];
const windows = new Map([["about", document.querySelector("#window-about")]]);

const windowContent = {
  projects: {
    title: "now-learning.txt",
    label: "A WORK IN PROGRESS",
    heading: "Curious by nature.",
    intro: "I like building little things that solve real problems and feel nice to use.",
    cards: [
      { title: "Learning Python", status: "IN PROGRESS", description: "Exploring Python one project and one new idea at a time." },
      { title: "Next up", status: "ON THE LIST", description: "TypeScript and React — learning by making things, not just reading about them." }
    ]
  },
  fun: {
    title: "little-things.txt",
    label: "A FEW LITTLE THINGS",
    heading: "A person, not just a keyboard.",
    facts: [
      { emoji: "🐾", text: "I love animals." },
      { emoji: "🗡️", text: "My favourite game is Zelda: Tears of the Kingdom." },
      { emoji: "🎮", text: "Hobbies: games, coding, and anime." }
    ]
  },
  contact: {
    title: "find-me.txt",
    label: "OUT THERE SOMEWHERE",
    heading: "Say hello, or just say hi.",
    intro: "I’m Lumi, a developer in Perth. You can find me around GitHub.",
    github: true
  }
};

function updateDock(activeId) {
  for (const app of dockApps) {
    const active = app.dataset.open === activeId;
    app.classList.toggle("is-selected", active);
    app.setAttribute("aria-pressed", String(active));
  }
}

function focusWindow(win, appId) {
  const allWindows = [...document.querySelectorAll(".window")];
  for (const item of allWindows) {
    item.classList.remove("is-active");
    item.style.zIndex = "";
  }
  win.classList.add("is-active");
  win.style.zIndex = String(Math.max(1, ...allWindows.map(item => Number(item.style.zIndex) || 1)) + 1);
  updateDock(appId);
}

function makeWindow(appId) {
  const content = windowContent[appId];
  const win = document.createElement("section");
  win.className = "window";
  win.id = `window-${appId}`;
  win.dataset.window = appId;
  win.setAttribute("aria-labelledby", `${appId}-title`);

  const bar = document.createElement("div");
  bar.className = "window-bar";
  bar.innerHTML = `
    <div class="window-controls">
      <button class="window-control close-control" type="button" aria-label="Close ${content.title} window" data-action="close"><span></span></button>
      <button class="window-control minimize-control" type="button" aria-label="Minimize ${content.title} window" data-action="minimize"><span></span></button>
      <button class="window-control maximize-control" type="button" aria-label="Maximize ${content.title} window" data-action="maximize"><span></span></button>
    </div>
    <span class="window-title"><span class="title-emoji" aria-hidden="true">✳</span> ${content.title}</span>
    <span class="bar-spacer" aria-hidden="true"></span>`;

  const body = document.createElement("div");
  body.className = "window-body";
  const kicker = document.createElement("div");
  kicker.className = "window-kicker";
  kicker.innerHTML = '<span class="status-dot" aria-hidden="true"></span>';
  kicker.append(document.createTextNode(content.label));
  body.append(kicker);

  const heading = document.createElement("h2");
  heading.id = `${appId}-title`;
  heading.textContent = content.heading;
  body.append(heading);

  if (content.intro) {
    const intro = document.createElement("p");
    intro.textContent = content.intro;
    body.append(intro);
  }

  if (content.cards) {
    for (const item of content.cards) {
      const card = document.createElement("article");
      card.className = "project-card";
      card.innerHTML = `<div class="project-card-heading"><span></span><span class="project-status"></span></div>`;
      card.querySelector(".project-card-heading > span").textContent = item.title;
      card.querySelector(".project-status").textContent = item.status;
      const description = document.createElement("p");
      description.textContent = item.description;
      card.append(description);
      body.append(card);
    }
  }

  if (content.facts) {
    const list = document.createElement("ul");
    list.className = "fact-list";
    for (const fact of content.facts) {
      const item = document.createElement("li");
      const emoji = document.createElement("span");
      emoji.className = "fact-emoji";
      emoji.setAttribute("aria-hidden", "true");
      emoji.textContent = fact.emoji;
      item.append(emoji, document.createTextNode(fact.text));
      list.append(item);
    }
    body.append(list);
  }

  if (content.github) {
    const link = document.createElement("a");
    link.className = "github-link";
    link.href = "https://github.com/Luuminarie";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.innerHTML = '<span aria-hidden="true">↗</span> Find me on GitHub';
    body.append(link);
  }

  win.append(bar, body);
  windowLayer.append(win);
  windows.set(appId, win);
  return win;
}

function openWindow(appId) {
  let win = windows.get(appId);
  if (!win && windowContent[appId]) win = makeWindow(appId);
  if (!win) return;
  win.classList.remove("is-minimizing");
  focusWindow(win, appId);
}

function closeWindow(win) {
  const appId = win.dataset.window;
  if (appId === "about") {
    win.classList.remove("is-active");
    const next = [...document.querySelectorAll(".window")].find(item => item !== win && item.classList.contains("is-active"));
    if (next) focusWindow(next, next.dataset.window);
    else updateDock(null);
    return;
  }
  windows.delete(appId);
  win.remove();
  const next = [...document.querySelectorAll(".window")].find(item => item.classList.contains("is-active"));
  if (next) focusWindow(next, next.dataset.window);
  else updateDock(null);
}

function setTheme(theme) {
  const isDark = theme === "dark";
  document.body.dataset.theme = isDark ? "dark" : "light";
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} mode`);
  themeLabel.textContent = `${isDark ? "Light" : "Dark"} mode`;
  themeColor.content = isDark ? "#191923" : "#f5f4f0";
}

let savedTheme = null;
try {
  savedTheme = localStorage.getItem("lumi-theme");
} catch (error) {
  console.warn("Could not read the saved theme preference.", error);
}
setTheme(savedTheme === "light" || savedTheme === "dark"
  ? savedTheme
  : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

themeToggle.addEventListener("click", () => {
  const nextTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
  setTheme(nextTheme);
  try {
    localStorage.setItem("lumi-theme", nextTheme);
  } catch (error) {
    console.warn("Could not save the theme preference.", error);
  }
});

document.querySelector(".brand").addEventListener("click", event => {
  event.preventDefault();
  openWindow("about");
});

document.addEventListener("click", event => {
  const opener = event.target.closest("[data-open]");
  if (opener) {
    openWindow(opener.dataset.open);
    return;
  }

  const control = event.target.closest("[data-action]");
  if (control) {
    const win = control.closest(".window");
    if (control.dataset.action === "close") closeWindow(win);
    if (control.dataset.action === "minimize") {
      win.classList.remove("is-active");
      win.classList.add("is-minimizing");
      updateDock(null);
    }
    if (control.dataset.action === "maximize") {
      win.classList.toggle("is-maximized");
      control.setAttribute("aria-label", `${win.classList.contains("is-maximized") ? "Restore" : "Maximize"} ${win.dataset.window} window`);
    }
    return;
  }

  const win = event.target.closest(".window");
  if (win) focusWindow(win, win.dataset.window);
});

let dragState = null;
desktop.addEventListener("pointerdown", event => {
  const bar = event.target.closest(".window-bar");
  const win = bar?.closest(".window");
  if (!bar || !win || event.target.closest("button") || win.classList.contains("is-maximized")) return;
  focusWindow(win, win.dataset.window);
  const rect = win.getBoundingClientRect();
  dragState = { win, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, left: rect.left, top: rect.top };
  bar.setPointerCapture(event.pointerId);
});

desktop.addEventListener("pointermove", event => {
  if (!dragState || dragState.pointerId !== event.pointerId) return;
  const { win, startX, startY, left, top } = dragState;
  const area = document.querySelector(".desktop-area").getBoundingClientRect();
  const rect = win.getBoundingClientRect();
  const nextLeft = Math.min(Math.max(8, left + event.clientX - startX), Math.max(8, area.right - rect.width - 8));
  const nextTop = Math.min(Math.max(area.top + 8, top + event.clientY - startY), Math.max(area.top + 8, area.bottom - rect.height - 8));
  win.style.left = `${nextLeft - area.left + rect.width / 2}px`;
  win.style.top = `${nextTop - area.top + rect.height / 2}px`;
});

desktop.addEventListener("pointerup", event => {
  if (dragState?.pointerId === event.pointerId) dragState = null;
});
desktop.addEventListener("pointercancel", () => { dragState = null; });

window.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    const active = document.querySelector(".window.is-active");
    if (active) closeWindow(active);
  }
});
