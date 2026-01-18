// =========================
// 0) BASE UTILS
// =========================
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function toast(msg) {
  const t = $("toast");
  $("toastMsg").innerText = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2200);
}

// =========================
// 1) STATE & STORAGE
// =========================
let state = {
  files: { "payload.txt": "#!/bin/bash\n# Test logic\nif [ 1 -eq 1 ]; then\n  echo \"Math works!\"\n  LED G\nelse\n  LED R\nfi\n" },
  active: "payload.txt",
  theme: "dark",
  settings: { fontSize: 14, indent: 2, wrap: "off", ac: "on", err: "on", accent: "#fb923c", apiKey: "" }
};

const isShell = n => (n||"").toLowerCase().endsWith(".sh");

function loadFromLocal() {
  try {
    const s = localStorage.getItem('bb_studio');
    if (s) {
      const loaded = JSON.parse(s);
      state = { ...state, ...loaded, settings: { ...state.settings, ...loaded.settings } };
      if(state.theme) document.documentElement.setAttribute("data-theme", state.theme);
    }
  } catch(e) { console.error("Load failed", e); }
}

function saveToLocal() {
  try {
    if(state.active && state.files[state.active] !== undefined) {
          state.files[state.active] = $("editor").value;
    }
    localStorage.setItem('bb_studio', JSON.stringify(state));
    const ind = $("saveInd");
    ind.classList.add("saving");
    setTimeout(() => ind.classList.remove("saving"), 1200);
  } catch(e) { console.error("Save failed", e); }
}

// =========================
// 2) COLOR & THEME
// =========================
function setAccent(hex) {
  let r=251, g=146, b=60;
  if(/^#[0-9A-F]{6}$/i.test(hex)) {
    r = parseInt(hex.slice(1,3), 16);
    g = parseInt(hex.slice(3,5), 16);
    b = parseInt(hex.slice(5,7), 16);
  }
  const s = document.documentElement.style;
  s.setProperty("--btn-active", hex);
  s.setProperty("--accent-tint", `rgba(${r},${g},${b},0.12)`);
  s.setProperty("--border-focus", `rgba(${r},${g},${b},0.55)`);
  s.setProperty("--sel-border", `rgba(${r},${g},${b},0.42)`);
}

// =========================
// 3) COMMANDS DEFINITIONS
// =========================
let CMD_LIST = [];
let CMD_MAP = new Map();
let CMD_READY = false;

const ATK_W = new Set(["HID","STORAGE","RNDIS_ETHERNET","SERIAL"]);
const LED_W = new Set(["R","G","B","Y","C","M","W","OFF","SPECIAL"]);
const Q_W = new Set(["STRING","ENTER","DELAY","GUI","ALT","CTRL","SHIFT"]);
const BB_DIR = new Set(["ATTACKMODE","LED","QUACK","Q","DELAY","RUN","GET","REQUIRETOOL","WAIT_FOR_PRESENT","WAIT_FOR_TARGET"]);
const CMN_CMD = new Set(["cp","mv","rm","mkdir","chmod","chown","cat","head","tail","grep","sed","awk","curl","wget","ssh","scp","ls","cd","pwd","whoami","id","uname","ps","kill","tar","zip","python","bash","sh","apt","systemctl","echo","sleep","clear"]);

async function loadCommands() {
  try {
    const res = await fetch("./commands.txt", {cache:"no-store"});
    if(!res.ok) throw 0;
    const txt = await res.text();
    CMD_LIST = txt.split(/\r?\n/).filter(l=>l.trim()&&!l.startsWith("#")).map(l => {
      const p = l.includes("|") ? l.split("|") : l.split(",");
      return { name:p[0].trim(), type:(p[1]||"other").trim().toLowerCase(), desc:p.slice(2).join(" ") };
    }).filter(c=>c.name);
    CMD_MAP = new Map(CMD_LIST.map(c=>[c.name.toUpperCase(),c]));
    CMD_READY = true;
  } catch(e) {
    CMD_READY = false;
    const w = $("warn"); w.classList.add("show");
    setTimeout(()=>{ w.classList.add("hide"); setTimeout(()=>w.classList.remove("show","hide"),250); }, 3000);
  }
}

// =========================
// 4) METRICS & SELECTION
// =========================
let metricsCache = null;
function getEditorMetrics(){
  const e = $("editor");
  const cs = getComputedStyle(e);
  const lh = parseFloat(cs.lineHeight) || 24;
  const pl = parseFloat(cs.paddingLeft) || 12;
  const pt = parseFloat(cs.paddingTop) || 12;
  const font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;

  if (metricsCache && metricsCache.font === font && metricsCache.lh === lh) return metricsCache;

  const span = document.createElement("span");
  span.style.font = font; span.style.position="absolute"; span.style.visibility="hidden";
  span.textContent = "MMMMMMMMMM";
  document.body.appendChild(span);
  const cw = span.getBoundingClientRect().width / 10;
  document.body.removeChild(span);

  metricsCache = { cw, lh, pl, pt, font };
  return metricsCache;
}

function idxToLineCol(txt, idx){
  let l = 0, lastNL = -1;
  for(let i=0; i<idx; i++) if(txt.charCodeAt(i)===10) { l++; lastNL=i; }
  return { line:l, col:idx-(lastNL+1) };
}

function buildSelectionPath(lefts, rights, top0, lh){
  const n = lefts.length;
  if (!n) return "";
  const y0 = top0;
  let d = `M ${lefts[0]} ${y0} L ${rights[0]} ${y0}`;
  for (let i = 0; i < n; i++){
    const yB = y0 + (i + 1) * lh;
    d += ` L ${rights[i]} ${yB}`;
    if (i < n - 1) d += ` L ${rights[i+1]} ${yB}`;
  }
  const yBottom = y0 + n * lh;
  d += ` L ${lefts[n-1]} ${yBottom}`;
  for (let i = n - 1; i >= 0; i--){
    const yT = y0 + i * lh;
    d += ` L ${lefts[i]} ${yT}`;
    if (i > 0) d += ` L ${lefts[i-1]} ${yT}`;
  }
  d += " Z";
  return d;
}

let isSearchSel = false;

function updateSelectionOverlay(){
  const ed = $("editor");
  const sel = $("selLayer");
  const txt = ed.value;
  const a = ed.selectionStart, b = ed.selectionEnd;
  sel.innerHTML = "";
  if(a === b) return;

  const start = Math.min(a,b);
  const end = Math.max(a,b);
  const m = getEditorMetrics();
  const sLC = idxToLineCol(txt, start);
  const eLC = idxToLineCol(txt, end);
  const lines = txt.split("\n");
  const endLine = (eLC.col===0 && eLC.line>sLC.line) ? eLC.line-1 : eLC.line;

  const lefts=[], rights=[], top0 = m.pt + (sLC.line * m.lh) - ed.scrollTop;

  for(let l=sLC.line; l<=endLine; l++){
    const lineText = lines[l]||"";
    const c1 = (l===sLC.line) ? sLC.col : 0;
    let c2;
    if(l===endLine) c2 = (l===eLC.line) ? eLC.col : lineText.length;
    else c2 = Math.max(1, lineText.length);

    if(c2 <= c1) c2 = c1 + 1;

    const lPx = m.pl + (c1 * m.cw) - ed.scrollLeft - 6;
    const rPx = m.pl + (c2 * m.cw) - ed.scrollLeft + 6;
    lefts.push(lPx); rights.push(rPx);
  }
  if(!lefts.length) return;
  const d = buildSelectionPath(lefts, rights, top0, m.lh);
  const cls = isSearchSel ? "sel-path search" : "sel-path";
  sel.innerHTML = `<svg class="sel-svg"><path class="${cls}" d="${d}"></path></svg>`;
}

let selRAF = 0;
function scheduleSel(){ if(!selRAF) selRAF=requestAnimationFrame(()=>{ selRAF=0; updateSelectionOverlay(); }); }

function ensureVisible(charIdx) {
  const ed = $("editor");
  const m = getEditorMetrics();
  const { line } = idxToLineCol(ed.value, charIdx);
  const topY = m.pt + (line * m.lh);
  const bottomY = topY + m.lh;

  const viewTop = ed.scrollTop;
  const viewBottom = ed.scrollTop + ed.clientHeight;

  if (topY < viewTop) {
    ed.scrollTop = topY - 50;
  } else if (bottomY > viewBottom) {
    ed.scrollTop = bottomY - ed.clientHeight + 50;
  }
}

// =========================
// 5) LEXER & LINTER
// =========================
let LINT = { errs:[], byLn:[], starts:[] };
let lintTimer = 0;
let suspend = false;

const canLint = () => state.settings.err==="on" && !suspend;

function lex(line) {
  let out = [];
  let i = 0;
  while(i < line.length) {
    while(i < line.length && /\s/.test(line[i])) i++;
    if(i >= line.length || line[i] === "#") break;

    let start = i;
    if(line[i] === '"' || line[i] === "'") {
      let q = line[i++];
      while(i < line.length && (line[i] !== q || line[i-1] === "\\")) i++;
      out.push({ value: line.slice(start, ++i), start, end: i });
    } else {
      while(i < line.length && !/\s/.test(line[i])) i++;
      out.push({ value: line.slice(start, i), start, end: i });
    }
  }
  return out;
}

function doLint(txt) {
  const lines = txt.split("\n");
  const starts = [];
  const byLn = lines.map(() => []);
  const errs = [];
  let acc = 0;

  lines.forEach(l => { starts.push(acc); acc += l.length + 1; });

  const isPayloadMode = !isShell(state.active);

  lines.forEach((raw, li) => {
    if(!raw.trim() || (li === 0 && raw.startsWith("#!"))) return;
    const toks = lex(raw);
    if(!toks.length) return;
    const t0 = toks[0];
    const v0 = t0.value.toUpperCase();
    const add = (t, msg) => {
      byLn[li].push({ s: t.start, e: t.end, msg });
      errs.push({ line: li, msg, absStart: starts[li] + t.start, absEnd: starts[li] + t.end });
    };

    if(v0 === "ATTACKMODE") {
      if(toks.length < 2) add(t0, "Missing argument");
      else toks.slice(1).forEach(t => !ATK_W.has(t.value.toUpperCase()) && add(t, "Unknown mode"));
    } else if(["LED", "QUACK", "Q"].includes(v0)) {
      const set = v0 === "LED" ? LED_W : Q_W;
      if(toks.length < 2) add(t0, "Missing argument");
      else if(!set.has(toks[1].value.toUpperCase()) && (v0 !== "LED" && v0 !== "Q" && v0 !== "QUACK")) add(toks[1], "Unknown arg");
    } else if(v0 === "DELAY") {
      if(toks.length < 2 || !/^\d+$/.test(toks[1].value)) add(t0, "Invalid delay");
    } else if(isPayloadMode) {
       const low = t0.value.toLowerCase();
       const isAssignment = /^[A-Za-z_][A-Za-z0-9_]*=/.test(t0.value);
       const isVar = t0.value.startsWith("$");
       const isPath = t0.value.startsWith("./") || t0.value.startsWith("/");

       if(!CMD_MAP.has(v0) && !BB_DIR.has(v0) && !CMN_CMD.has(low) && !isAssignment && !isVar && !isPath && low !== "export"
         && !["if","fi","then","else","elif","for","do","done","while","esac","case","function"].includes(low)) {
         add(t0, "Unknown command");
       }
    }
  });
  return { errs, byLn, starts };
}

// =========================
// 6) TOKENIZER (HIGHLIGHTER)
// =========================
function getClass(word, prev) {
  if(!word) return "t-txt";
  if(word.startsWith("$")) return "t-var";
  if(!isNaN(word)) return "t-num";

  const U = word.toUpperCase();
  if(ATK_W.has(U) || (prev||"").toUpperCase() === "ATTACKMODE") return "t-word";

  const hit = CMD_MAP.get(U);
  if(hit) {
    const t = hit.type;
    // Updated switch to handle new types
    return t==="function"?"t-bbfn" : 
           t==="arg"?"t-bbarg" : 
           t==="bash"?"t-bashkw" : 
           (t==="condition"||t==="loop")?"t-flow" : /* NEW */
           t==="word"?"t-word" : "t-txt";
  }
  return BB_DIR.has(U) ? "t-bbfn" : "t-txt";
}

function tokenize(txt) {
  const show = canLint();
  return txt.split("\n").map((ln, i) => {
    let html = "";
    let col = 0;
    let word = "";
    let prev = "";
    let inStr = false;
    let quote = null;
    let inCom = false;

    const flush = () => {
      if(!word) return;
      const start = col - word.length;
      const cls = getClass(word, prev);
      const err = show ? LINT.byLn[i]?.find(x => start < x.e && col > x.s) : null;
      html += `<span class="${cls} ${err ? 't-err' : ''}">${esc(word)}</span>`;
      prev = word;
      word = "";
    };

    for(let j=0; j<ln.length; j++) {
      const c = ln[j];
      if(inCom) { html += esc(c); col++; continue; }

      if(inStr) {
        html += esc(c); col++;
        if(c === quote && ln[j-1] !== "\\") { html += "</span>"; inStr = false; }
        continue;
      }

      if(c === "#") {
        flush(); inCom = true; html += '<span class="t-com">#'; col++; continue;
      }
      if(c === '"' || c === "'") {
        flush(); inStr = true; quote = c; html += `<span class="t-str">${esc(c)}`; col++; continue;
      }

      if(/[A-Za-z0-9_$]/.test(c)) {
        word += c; col++;
      } else {
        flush();
        html += `<span class="t-op">${esc(c)}</span>`;
        col++;
      }
    }
    flush();
    if(inStr) html += "</span>";
    if(inCom) html += "</span>";
    return html;
  }).join("\n");
}

function updateEditor(opt={}) {
  const v = $("editor").value;
  if(opt.lint && state.settings.err === "on") LINT = doLint(v);
  else if(state.settings.err !== "on") $("errTip").style.display = "none";

  $("highlight").innerHTML = tokenize(v);

  const count = v.split('\n').length;
  $("gutter").innerHTML = Array(count).fill(0).map((_,i) =>
    `<div class="${canLint() && LINT.byLn[i]?.length ? "gerr" : ""}">${i+1}</div>`
  ).join('');

  const p = $("editor").selectionStart;
  const sub = v.substring(0,p);
  const l = sub.split('\n').length;
  const c = sub.length - sub.lastIndexOf('\n');
  $("stLineCol").innerText = `Ln ${l}, Col ${c}`;

  $("highlight").scrollTop = $("gutter").scrollTop = $("editor").scrollTop;
  $("highlight").scrollLeft = $("editor").scrollLeft;
  scheduleSel();
}

// =========================
// 7) UI & ACTIONS
// =========================
function renFiles() {
  const l = $("fileList");
  l.innerHTML = "";
  Object.keys(state.files).forEach(f => {
    const d = document.createElement("div");
    d.className = `list-item ${state.active === f ? 'active' : ''}`;
    d.innerHTML = (isShell(f) ? `<span class="file-icon">$</span>` :
      `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`) + ` ${esc(f)}`;
    d.onclick = () => {
      state.files[state.active] = $("editor").value;
      state.active = f;
      loadFile();
      renFiles();
    };
    l.appendChild(d);
  });
}

function renSnips() {
  const snips = [
    {n:"Hello World (HID)", c:"ATTACKMODE HID\nLED G\nQUACK STRING Hello World\nQUACK ENTER"},
    {n:"Mass Storage", c:"ATTACKMODE STORAGE\nLED B"},
    {n:"Exfiltrate", c:"ATTACKMODE STORAGE\nLED M\ncp /root/secret.txt /root/udisk/loot/\nLED G"}
  ];
  $("snippetList").innerHTML = snips.map(s =>
    `<div class="list-item" onclick="ins('${esc(s.c).replace(/\n/g,"\\n")}')">
       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg> ${esc(s.n)}
     </div>`
  ).join("");
}

function ins(c) {
  const e = $("editor");
  const s = e.selectionStart;
  const v = e.value;
  e.value = v.slice(0,s) + c + v.slice(s);
  e.focus();
  e.selectionStart = e.selectionEnd = s + c.length;
  suspend = true;
  setTimeout(() => updateEditor({lint:true}), 500);
  updateEditor();
}

function loadFile() {
  suspend = false;
  $("editor").value = state.files[state.active];
  $("activeFileName").innerText = state.active;
  updateEditor({lint:true});
}

// =========================
// 8) AUTOCOMPLETE
// =========================
let acS = { m:[], i:0 };

function acCheck() {
  if(state.settings.ac === "off" || !CMD_READY) return $("ac").style.display = "none";
  const e = $("editor");
  const v = e.value;
  const p = e.selectionStart;

  let s = p - 1;
  while(s >= 0 && /[A-Za-z0-9_]/.test(v[s])) s--;
  s++;

  const w = v.substring(s, p).toUpperCase();
  if(w.length < 1) return $("ac").style.display = "none";

  const m = CMD_LIST.filter(c => c.name.toUpperCase().startsWith(w)).slice(0, 10);
  if(!m.length) return $("ac").style.display = "none";

  acS = { m, i:0 };

  $("ac").innerHTML = m.map((c, i) => `
    <div class="ac-item ${i===0?'active':''}" onmousedown="acIns('${c.name}')">
      <span class="ac-label type-${ATK_W.has(c.name.toUpperCase())?'word':c.type}">${esc(c.name)}</span>
      <span class="ac-type">${esc(c.desc)}</span>
    </div>`
  ).join("");

  // Calculate position
  const cs = getComputedStyle(e);
  const rect = e.getBoundingClientRect();
  const span = document.createElement("span");
  span.style.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  span.textContent = v.substring(0, p).replace(/\n/g, "\u0000");
  document.body.appendChild(span);
  const lines = v.substring(0, p).split("\n");
  const cw = span.getBoundingClientRect().width / span.textContent.length || 8;
  document.body.removeChild(span);

  const met = getEditorMetrics();
  const top = rect.top + met.pt + ((lines.length - 1) * met.lh) - e.scrollTop + met.lh;
  const left = rect.left + met.pl + (lines[lines.length - 1].length * met.cw) - e.scrollLeft;

  const ac = $("ac");
  ac.style.display = "block";
  ac.style.top = top + "px";
  ac.style.left = left + "px";
}

window.acIns = (t) => {
  const e = $("editor");
  const v = e.value;
  const p = e.selectionStart;
  let s = p - 1;
  while(s >= 0 && /[A-Za-z0-9_]/.test(v[s])) s--;
  s++;
  e.value = v.substring(0, s) + t + " " + v.substring(p);
  e.focus();
  e.selectionStart = e.selectionEnd = s + t.length + 1;
  $("ac").style.display = "none";
  updateEditor({lint:false});
};

// =========================
// 9) EVENT LISTENERS
// =========================
const ed = $("editor");

ed.addEventListener("input", () => {
  suspend = true;
  clearTimeout(lintTimer);
  lintTimer = setTimeout(() => { suspend = false; updateEditor({lint:true}); }, 1500);
  updateEditor();
  acCheck();
});

ed.addEventListener("scroll", () => updateEditor());

ed.addEventListener("click", () => {
  isSearchSel = false;
  scheduleSel();
  $("ac").style.display = "none";
  $("errTip").style.display = "none";
});

ed.addEventListener("keydown", e => {
  isSearchSel = false;

  if($("ac").style.display === "block") {
    if(e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const items = document.querySelectorAll(".ac-item");
      items[acS.i].classList.remove("active");
      acS.i = (acS.i + (e.key === "ArrowDown" ? 1 : -1) + acS.m.length) % acS.m.length;
      items[acS.i].classList.add("active");
      items[acS.i].scrollIntoView({block:"nearest"});
      return;
    }
    
    // MODIFICATION: Only use Tab for autocomplete, removed || e.key === "Enter"
    if(e.key === "Tab") {
      e.preventDefault();
      acIns(acS.m[acS.i].name);
      return;
    }
    
    if(e.key === "Escape") {
      $("ac").style.display = "none";
      return;
    }
  }

  if(e.key === "Tab") {
    e.preventDefault();
    const s = ed.selectionStart, end = ed.selectionEnd;
    ed.value = ed.value.substring(0, s) + "  " + ed.value.substring(end);
    ed.selectionStart = ed.selectionEnd = s + 2;
    updateEditor();
  }

  // Save: Ctrl + S
  if(e.ctrlKey && e.key.toLowerCase() === "s") {
    e.preventDefault();
    state.files[state.active] = ed.value;
    toast("File Saved");
    saveToLocal();
  }

  // Run: Ctrl + M
  if(e.ctrlKey && e.key.toLowerCase() === "m") {
    e.preventDefault();
    runPiston(ed.value, true);
  }
});

ed.addEventListener("pointermove", e => {
  if(state.settings.err !== "on") return;
  const r = ed.getBoundingClientRect();
  const m = getEditorMetrics();
  const x = e.clientX - r.left + ed.scrollLeft - m.pl;
  const y = e.clientY - r.top + ed.scrollTop - m.pt;
  const l = Math.floor(y / m.lh);
  const c = Math.floor(x / m.cw);
  const abs = (LINT.starts[l] || 0) + c;
  const err = LINT.errs.find(z => abs >= z.absStart && abs <= z.absEnd);
  const tip = $("errTip");
  if(err) {
    tip.style.display = "block";
    $("errMsg").innerText = err.msg;
    tip.style.left = (e.clientX + 15) + "px";
    tip.style.top = (e.clientY + 15) + "px";
  } else {
    tip.style.display = "none";
  }
});

ed.addEventListener("pointerdown", () => { isSearchSel = false; scheduleSel(); });
document.addEventListener("selectionchange", scheduleSel);

// Sidebar & Toolbar Actions
document.querySelectorAll(".activity-icon[data-target]").forEach(b => b.onclick = () => {
  const t = b.dataset.target;
  const same = b.classList.contains("active");
  document.querySelectorAll(".activity-icon").forEach(x => x.classList.remove("active"));
  document.querySelectorAll(".sidebar-content").forEach(x => x.classList.remove("active"));
  if(same && document.body.classList.contains("sidebar-collapsed")) {
    document.body.classList.remove("sidebar-collapsed");
  } else if(same) {
    document.body.classList.add("sidebar-collapsed");
  } else {
    document.body.classList.remove("sidebar-collapsed");
    b.classList.add("active");
    $(`view-${t}`).classList.add("active");

    // Init console prompt if needed
    if(t === "console") {
      setTimeout(()=> {
        if(!$(".console-prompt-line")) initConsolePrompt();
        focusConsole();
      }, 100);
    }
  }
});

$("btnNew").onclick = () => { $("dlgNewFile").showModal(); $("newFileName").focus(); };
$("btnCreateNew").onclick = () => {
  let n = $("newFileName").value.trim().replace(/[\\/:*?"<>|]/g, "_") || "untitled.txt";
  if(!n.includes(".")) n += ".txt";
  if(state.files[n]) return toast("File exists");
  state.files[state.active] = ed.value;
  state.files[n] = "";
  state.active = n;
  $("dlgNewFile").close();
  renFiles();
  loadFile();
};
$("btnDelete").onclick = () => {
  if(confirm("Delete file?")) {
    delete state.files[state.active];
    const k = Object.keys(state.files);
    state.active = k[0] || "new.txt";
    if(!k.length) state.files[state.active] = "";
    renFiles();
    loadFile();
  }
};
$("btnSave").onclick = () => { state.files[state.active] = ed.value; toast("Saved"); saveToLocal(); };
$("btnExport").onclick = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([ed.value])); a.download = state.active; a.click(); };
$("btnLint").onclick = () => { suspend = false; updateEditor({lint:true}); toast((LINT.errs.length || 0) + " issues found"); };

// Search & Replace
$("findInput").addEventListener("input", e => {
  const q = e.target.value;
  if(!q) return;
  let i = ed.value.indexOf(q, ed.selectionStart);
  if(i === -1) i = ed.value.indexOf(q);
  if(i >= 0) {
    isSearchSel = true;
    ed.setSelectionRange(i, i + q.length);
    ensureVisible(i);
    scheduleSel();
  }
});
$("btnFindNext").onclick = () => {
  const q = $("findInput").value; if(!q) return;
  const i = ed.value.indexOf(q, ed.selectionEnd);
  if(i >= 0) { ed.focus(); isSearchSel = true; ed.setSelectionRange(i, i + q.length); ensureVisible(i); scheduleSel(); } else { toast("EOF Reached"); }
};
$("btnReplace").onclick = () => {
  const s = ed.selectionStart, e = ed.selectionEnd, v = ed.value;
  if(v.substring(s, e) === $("findInput").value) { ed.setRangeText($("replaceInput").value); updateEditor(); } else { $("btnFindNext").click(); }
};
$("btnReplaceAll").onclick = () => {
  const q = $("findInput").value, r = $("replaceInput").value; if(!q) return;
  ed.value = ed.value.split(q).join(r); updateEditor({lint:true}); toast("Replaced All");
};

// Settings
window.closeDlg = id => $(id).close();
$("btnSettings").onclick = () => {
  $("prefTheme").value = state.theme; $("prefFontSize").value = state.settings.fontSize;
  $("prefAC").checked = (state.settings.ac === "on"); $("prefWrap").checked = (state.settings.wrap === "on"); $("prefErr").checked = (state.settings.err === "on");
  $("prefAiKey").value = state.settings.apiKey || "";
  $("dlgSettings").showModal();
};
$("btnSavePrefs").onclick = () => {
  state.theme = $("prefTheme").value; state.settings.fontSize = $("prefFontSize").value;
  state.settings.ac = $("prefAC").checked ? "on" : "off"; state.settings.wrap = $("prefWrap").checked ? "on" : "off"; state.settings.err = $("prefErr").checked ? "on" : "off"; state.settings.accent = $("prefAccent").value;
  state.settings.apiKey = $("prefAiKey").value.trim();
  document.documentElement.setAttribute("data-theme", state.theme); setAccent(state.settings.accent);
  ed.style.fontSize = $("highlight").style.fontSize = $("gutter").style.fontSize = state.settings.fontSize + "px";
  ed.style.whiteSpace = $("highlight").style.whiteSpace = (state.settings.wrap === "on") ? "pre-wrap" : "pre";
  metricsCache = null; $("dlgSettings").close(); updateEditor({lint:true});
};

// =========================
// 10) PISTON API & CONSOLE
// =========================
function toggleTerm(show) {
  const p = $("term-panel");
  if(show) { p.style.display = "flex"; setTimeout(() => p.classList.add("open"), 10); }
  else { p.classList.remove("open"); setTimeout(() => p.style.display = "none", 200); }
}

function logTerm(msg, type="info", target="bottom") {
  const c = target === "sidebar" ? $("console-output") : $("term-content");
  if(!c) return;

  const d = new Date();
  const ts = `[${d.toLocaleTimeString('en-US',{hour12:false})}]`;
  const div = document.createElement("div");

  if(target === "sidebar") {
    div.style.marginBottom = "2px";
    if(type === "cmd") {
       // Ignored in console sidebar (already shown as typed line)
       return;
    } else {
       div.className = "console-line";
       div.style.color = type==="error"?"#ff5555":type==="warn"?"#ffb86c":"#ccc";
       div.innerHTML = esc(msg);
    }

    c.appendChild(div);
  } else {
    div.className = "term-line";
    div.innerHTML = `<span class="term-ts">${ts}</span> <span class="term-msg ${type}">${esc(msg)}</span>`;
    c.appendChild(div);
  }

  c.scrollTop = c.scrollHeight;
}

const MOCK_HEADER = `
LED() { echo "___LED $*"; }
QUACK() { echo "___QUACK $*"; }
Q() { echo "___QUACK $*"; }
ATTACKMODE() { echo "___ATTACKMODE $*"; }
DELAY() { echo "___DELAY $1"; }
`;

async function runPiston(codeToRun, isPayloadMode = false) {
  const targetLog = isPayloadMode ? "bottom" : "sidebar";

  if(isPayloadMode) {
    toggleTerm(true);
    $("term-content").innerHTML = `<div class="term-line"><span class="term-spinner"></span><span class="term-msg">Simulating Payload on Remote Linux...</span></div>`;
  }

  const mainContent = isPayloadMode ? (MOCK_HEADER + "\n" + codeToRun) : codeToRun;

  const filesPayload = [ { content: mainContent } ];
  for (const [fname, fcontent] of Object.entries(state.files)) {
    filesPayload.push({ name: fname, content: fcontent });
  }

  try {
    const res = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: "bash",
        version: "5.2.0",
        files: filesPayload
      })
    });

    if (!res.ok) throw new Error("API Error: " + res.status);
    const data = await res.json();

    if(isPayloadMode) $("term-content").innerHTML = "";

    if (data.run && data.run.stdout) {
      const lines = data.run.stdout.split("\n");
      for (let line of lines) {
        if (!line) continue;

        if (line.startsWith("___")) {
          const cmd = line.split(" ")[0].replace("___", "");
          const args = line.substring(cmd.length + 4);

          if (cmd === "DELAY") {
            const ms = parseInt(args) || 0;
            logTerm(`⏳ Waiting ${ms}ms...`, "warn", targetLog);
            await new Promise(r => setTimeout(r, ms));
          } else if (cmd === "LED") {
            logTerm(`🔌 LED: ${args}`, "success", targetLog);
          } else if (cmd === "QUACK") {
            logTerm(`⌨️ Type: ${args}`, "cmd", targetLog);
          } else if (cmd === "ATTACKMODE") {
            logTerm(`🛡️ Mode: ${args}`, "error", targetLog);
          }
        } else {
          logTerm(line, "info", targetLog);
        }
        if(isPayloadMode) await new Promise(r => setTimeout(r, 50));
      }
    }

    if (data.run && data.run.stderr) {
      logTerm(data.run.stderr, "error", targetLog);
    }

    if(isPayloadMode) logTerm("Execution finished.", "success", targetLog);

  } catch (e) {
    if(isPayloadMode) $("term-content").innerHTML = "";
    logTerm("Error: " + e.message, "error", targetLog);
  }
}

$("btnRun").onclick = () => runPiston($("editor").value, true);

// Sidebar Console Logic
let isConsoleFull = false;
function toggleViewFull(id, btnId) {
  const v = $(id), b = $(btnId), isFull = v.classList.contains("fullscreen");
  if (isFull) { v.classList.remove("fullscreen"); b.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>`; }
  else { v.classList.add("fullscreen"); b.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>`; }
}

// Dynamic Prompt Logic
function createPromptHTML(val="") {
  if(val) {
    // Static text for history
    return `
      <div class="console-prompt-line" style="margin-bottom:2px">
        <span class="console-prompt-text">
          <span style="color:#87d441">root@bunny</span>:<span style="color:#3b8eea">~</span>#
        </span>
        <span style="color:#fff;">${esc(val)}</span>
      </div>
    `;
  } else {
    // Active input
    return `
      <div class="console-prompt-line active-prompt">
        <span class="console-prompt-text">
          <span style="color:#87d441">root@bunny</span>:<span style="color:#3b8eea">~</span>#
        </span>
        <input class="console-input" autocomplete="off" spellcheck="false">
      </div>
    `;
  }
}

function initConsolePrompt() {
  const out = $("console-output");
  // Remove any existing active prompt
  const old = out.querySelector(".active-prompt");
  if(old) old.remove();

  const div = document.createElement("div");
  div.innerHTML = createPromptHTML();
  out.appendChild(div.firstElementChild);
  bindLastInput();
  out.scrollTop = out.scrollHeight;
}

function bindLastInput() {
  const inputs = document.querySelectorAll(".console-input");
  const last = inputs[inputs.length - 1];
  if(!last) return;

  last.focus();
  last.addEventListener("keydown", async (e) => {
    if(e.key === "Enter") {
      const cmd = last.value.trim();
      const parent = last.parentElement;

      if(cmd === "clear") {
         $("console-output").innerHTML = "";
         initConsolePrompt();
         return;
      }

      // "Freeze" current line
      const frozenHTML = createPromptHTML(cmd || " ");
      const temp = document.createElement("div");
      temp.innerHTML = frozenHTML;
      // Replace the active prompt div with the frozen one
      parent.replaceWith(temp.firstElementChild);

      // If there was a command, run it
      if(cmd) {
        await runPiston(cmd, false);
      }

      // Create NEW prompt at the very end
      initConsolePrompt();
    }
  });
}

function focusConsole() {
  const inputs = document.querySelectorAll(".console-input");
  if(inputs.length) inputs[inputs.length - 1].focus();
}

/* CHATGPT INTEGRATION */
let systemPrompt = "";
async function loadSystemPrompt() {
  try { const r = await fetch("./prompt.txt"); if(r.ok) systemPrompt = await r.text(); } catch(e){}
}

function addChatMsg(role, text) {
  const box = $("chatgpt-output");
  const d = document.createElement("div");
  d.className = `chat-msg ${role}`;
  d.innerText = text;
  box.appendChild(d);
  box.scrollTop = box.scrollHeight;
}

async function callOpenAI(messages) {
  const key = state.settings.apiKey;
  if(!key) return null;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
      body: JSON.stringify({ model: "gpt-3.5-turbo", messages: messages })
    });
    if(!res.ok) throw new Error("API Error");
    const data = await res.json();
    return data.choices[0].message.content;
  } catch(e) { return "Error: Check API Key or Connection."; }
}

async function sendChat() {
  const inp = $("chatInput");
  const txt = inp.value.trim();
  if(!txt) return;

  if(!state.settings.apiKey) { addChatMsg("ai", "Please set your OpenAI API Key in Settings."); return; }

  addChatMsg("user", txt);
  inp.value = "";

  let context = systemPrompt + "\n\nCURRENT FILES:\n";
  for(const [n,c] of Object.entries(state.files)) { context += `--- FILE: ${n} ---\n${c}\n----------------\n`; }

  const msgs = [{role: "system", content: context}, {role: "user", content: txt}];
  const reply = await callOpenAI(msgs);
  if(reply) {
    parseAndApplyEdits(reply);
  }
}

async function autoFix() {
  if(!state.settings.apiKey) { toast("Set API Key first"); return; }

  const errs = LINT.errs.map(e => `Line ${e.line+1}: ${e.msg}`).join("\n");
  const code = $("editor").value;

  let promptUser;
  if(errs) {
    promptUser = `Fix the following syntax errors:\n${errs}\n\nCode:\n${code}`;
    toast("Fixing errors...");
  } else {
    promptUser = `Review this code for logical errors or best practices. If it is correct, reply exactly: "No errors found."\n\nCode:\n${code}`;
    toast("Reviewing code...");
  }

  const msgs = [{role: "system", content: systemPrompt}, {role: "user", content: promptUser}];
  const reply = await callOpenAI(msgs);
  if(reply) {
    parseAndApplyEdits(reply);
    if(reply.includes("No errors found")) toast("Code looks good!");
    else toast("Applied AI changes");
  }
}

function parseAndApplyEdits(text) {
  // Regex handles <<<FILE>>> and <<FILE>> blocks mixed
  const regex = /<{2,3}FILE:(.*?)>{2,3}\s*([\s\S]*?)\s*<{2,3}END>{2,3}/g;
  let match;
  let cleanText = text;
  let applied = false;

  while ((match = regex.exec(text)) !== null) {
    const filename = match[1].trim();
    const content = match[2].trim();
    state.files[filename] = content;
    if(state.active === filename) {
      $("editor").value = content;
      updateEditor({lint:true});
    }
    applied = true;
    // Remove the code block from the chat display text
    cleanText = cleanText.replace(match[0], `[Updated ${filename}]`);
  }

  if(applied) renFiles();
  // Show the cleaned text response (without the heavy code block)
  if(cleanText.trim()) addChatMsg("ai", cleanText.trim());
}

// =========================
// 12) INIT
// =========================
(async () => {
  loadFromLocal();
  setAccent(state.settings.accent);
  await loadCommands();
  await loadSystemPrompt();
  renFiles();
  renSnips();
  loadFile();

  setInterval(saveToLocal, 10000);
})();