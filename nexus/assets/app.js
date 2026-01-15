// --- DATA & CONFIG ---
const WIFI_KEYS = { 'Skynet_Uplink': 'TERMINATOR_T800', 'FBI_Surveillance_Van': 'J0hn_D0e_1984', 'Corp_Guest': 'Password123!', 'Virus_Free_WiFi': '12345678', 'Neighbor_Net': 'ilovecats2024' };
const NETWORK_DB = [
    { bssid: '00:14:22:01:23:45', ssid: 'Skynet_Uplink', ch: 6, pwr: '-45', enc: 'WPA2', pass: 'TERMINATOR_T800', vendor: 'Cyberdyne Systems', wps: 'Locked', freq: '2.437', packets: 1042, clients: ['AA:BB:CC:11:22:33'] },
    { bssid: 'A2:C5:11:99:88:77', ssid: 'FBI_Surveillance_Van', ch: 11, pwr: '-62', enc: 'WPA2', pass: 'J0hn_D0e_1984', vendor: 'Cisco Systems', wps: 'Ver 1.0', freq: '2.462', packets: 531, clients: [] },
    { bssid: 'DE:AD:BE:EF:00:01', ssid: 'Corp_Guest', ch: 1, pwr: '-55', enc: 'WPA2', pass: 'Password123!', vendor: 'Ubiquiti Networks', wps: 'Disabled', freq: '2.412', packets: 8990, clients: ['11:22:33:44:55:66', '77:88:99:AA:BB:CC'] },
    { bssid: '55:44:33:22:11:00', ssid: 'Virus_Free_WiFi', ch: 3, pwr: '-78', enc: 'WEP', pass: '12345678', vendor: 'TP-Link Technologies', wps: 'Ver 1.0', freq: '2.422', packets: 120, clients: [] },
    { bssid: 'C0:FF:EE:12:34:56', ssid: 'Neighbor_Net', ch: 9, pwr: '-82', enc: 'WPA', pass: 'ilovecats2024', vendor: 'ASUSTek Computer', wps: 'Configured', freq: '2.452', packets: 45, clients: [] }
];

// --- PERSISTENCE LOGIC ---
const STORAGE_KEY = "nexus_os_state_v2";

const DEFAULT_FS_DATA = {
    name: "root", type: "folder",
    children: {
        "home": {
            name: "home", type: "folder", children: {
                "Desktop": {
                    name: "Desktop", type: "folder", children: {
                        "mission_brief.txt": { name: "mission_brief.txt", type: "file", content: "Target: Arasaka Tower\nTime: 2200h\nEntry: Service Tunnel 4B" },
                        "tools": { name: "tools", type: "folder", children: {} }
                    }
                },
                "root": {
                    name: "root", type: "folder", children: {
                        "documents": { name: "documents", type: "folder", children: { "passwords.txt": { name: "passwords.txt", type: "file", content: "admin: admin123\nroot: toor" } } },
                        "downloads": { name: "downloads", type: "folder", children: {} },
                        "handshakes": { name: "handshakes", type: "folder", children: {} },
                        "cracker": { name: "cracker", type: "folder", children: {} }
                    }
                }
            }
        }
    }
};

function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { fs: JSON.parse(JSON.stringify(DEFAULT_FS_DATA)), windows: [], hasSession: false };
        
        const parsed = JSON.parse(raw);
        // Migration check: if old format (just FS), wrap it
        if (!parsed.fs) {
            return { fs: parsed, windows: [], hasSession: true };
        }
        return { ...parsed, hasSession: true };
    } catch (e) {
        console.warn("Error loading state, using default:", e);
        return { fs: JSON.parse(JSON.stringify(DEFAULT_FS_DATA)), windows: [], hasSession: false };
    }
}

// Initial Load
let loadedState = loadState();
let fsData = loadedState.fs;
let savedWindows = loadedState.windows || [];
let hasSavedSession = loadedState.hasSession;

function saveState() {
    // Ensure wm exists before trying to save windows
    if (typeof wm === 'undefined') return;
    
    const state = {
        fs: fsData,
        windows: wm.serializeWindows()
    };
    
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.error("Error saving state:", e);
    }
}

let saveTimeout;
function saveStateDebounced() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveState, 500); 
}

// Global WiFi State
let wifiState = {
    interface: 'wlan0',
    mode: 'managed',
    channel: 1
};
let activeAttacks = {
    deauthTarget: null,
    deauthTime: 0
};

// --- GLOBAL UTILITIES ---
function togglePopup(id, e) { e.stopPropagation(); const el = document.getElementById(id); const isHidden = el.classList.contains('hidden'); hideAllPopups(); if (isHidden) { el.classList.remove('hidden'); if (id === 'start-menu') setTimeout(() => document.getElementById('start-search').focus(), 50); } }
function hideAllPopups() { ['tray-wifi', 'tray-volume', 'tray-battery', 'context-menu', 'start-menu'].forEach(id => { const el = document.getElementById(id); if (el) el.classList.add('hidden'); }); }

// --- FILE MANAGER CLASS ---
class FileManager {
    constructor() {
        this.currentPath = ['home', 'root'];
        this.activeWindow = null;
        this.activeEditorFile = null;
        this.contextTarget = 'desktop';
        this.inlineEdit = null;
        this.pendingInlineEdit = null;
        this.lastContextEl = null;
    }
    getCurrentDirObj(path = this.currentPath) { let current = fsData; for (const p of path) { if (current.children && current.children[p]) current = current.children[p]; else return null; } return current; }
    getTargetPath() { return this.contextTarget === 'desktop' ? ['home', 'Desktop'] : this.currentPath; }
    makeUniqueName(dir, desired) { if (!dir?.children) return desired; if (!dir.children[desired]) return desired; const dot = desired.lastIndexOf('.'); const hasExt = dot > 0 && dot < desired.length - 1; const base = hasExt ? desired.slice(0, dot) : desired; const ext  = hasExt ? desired.slice(dot) : ''; let i = 2; let candidate = `${base} (${i})${ext}`; while (dir.children[candidate]) { i++; candidate = `${base} (${i})${ext}`; } return candidate; }
    init() { this.renderDesktop(); }
    renderDesktop() { const container = document.getElementById('desktop-user-files'); container.innerHTML = ''; const desktopDir = this.getCurrentDirObj(['home', 'Desktop']); if (desktopDir && desktopDir.children) { Object.values(desktopDir.children).forEach(item => { const el = this.createFileIcon(item, true); container.appendChild(el); }); } lucide.createIcons(); }
    renderWindow(winEl) {
        this.activeWindow = winEl;
        const grid = winEl.querySelector('.file-grid');
        const breadcrumb = winEl.querySelector('.breadcrumb');
        const count = winEl.querySelector('.file-count');
        const dir = this.getCurrentDirObj();

        if (breadcrumb) breadcrumb.innerText = '/' + this.currentPath.join('/');
        if (grid) {
            grid.innerHTML = '';
            if (!dir || !dir.children || Object.keys(dir.children).length === 0) {
                grid.innerHTML = '<div class="col-span-full text-center text-gray-600 italic py-10">Carpeta vacía</div>';
                if (count) count.innerText = '0 items';
                return;
            }
            const items = Object.values(dir.children);
            if (count) count.innerText = `${items.length} items`;
            items.forEach(item => {
                const el = this.createFileIcon(item, false);
                grid.appendChild(el);
            });
        }
        lucide.createIcons();
    }
    findIconElementByName(name, isDesktop) { const container = isDesktop ? document.getElementById('desktop-user-files') : this.activeWindow?.querySelector('.file-grid'); if (!container) return null; const children = Array.from(container.children); for (const el of children) { if (el?.dataset?.itemName === name) return el; } return null; }
    createFileIcon(item, isDesktop) {
        const el = document.createElement('div');
        const baseClass = isDesktop ? "flex flex-col items-center gap-1 p-2 rounded hover:bg-white/10 w-24 cursor-pointer group transition-colors select-none" : "flex flex-col items-center gap-2 p-2 hover:bg-[#2a2a35] rounded cursor-pointer group transition-colors select-none border border-transparent hover:border-white/5";
        el.className = baseClass;
        el.title = item.name;
        el.dataset.itemName = item.name;
        el.dataset.isDesktop = isDesktop ? '1' : '0';
        el._item = item;
        let icon = 'file';
        let colorClass = isDesktop ? "text-gray-300 group-hover:text-white" : "text-gray-400 group-hover:text-gray-200";
        if (item.type === 'folder') { icon = 'folder'; colorClass = isDesktop ? "text-blue-300 group-hover:text-blue-200" : "text-blue-400 group-hover:text-blue-300"; }
        else if (item.name.endsWith('.txt')) { icon = 'file-text'; }
        else if (item.name.endsWith('.pcap')) { icon = 'hash'; colorClass = "text-red-400"; }

        const labelClass = isDesktop ? 'text-xs text-center text-gray-200 font-medium drop-shadow-md line-clamp-2' : 'text-[11px] text-center text-gray-400 line-clamp-2 w-full break-all';
        el.innerHTML = `<i data-lucide="${icon}" class="${isDesktop ? 'w-10 h-10' : 'w-8 h-8'} ${colorClass} drop-shadow-sm transition-colors"></i><span class="${labelClass} file-label">${item.name}</span>`;

        el.onclick = (e) => { e.stopPropagation(); hideAllPopups(); this.selectItem(el, isDesktop); };
        el.ondblclick = (e) => {
            e.stopPropagation();
            if (item.type === 'folder') {
                if (isDesktop) { wm.openWindow('files'); this.navigateTo(['home', 'Desktop', item.name]); }
                else { this.currentPath.push(item.name); this.renderWindow(this.activeWindow); }
            } else {
                wm.openEditor(item);
            }
        };
        el.oncontextmenu = (e) => { e.preventDefault(); e.stopPropagation(); hideAllPopups(); this.selectItem(el, isDesktop); this.handleRightClick(e, isDesktop ? 'desktop' : 'window', item, el); };
        return el;
    }
    selectItem(el, isDesktop) { const container = isDesktop ? document.getElementById('desktop-user-files') : this.activeWindow?.querySelector('.file-grid'); if (!container) return; Array.from(container.children).forEach(c => c.classList.remove(isDesktop ? 'bg-white/20' : 'bg-[#2a2a35]', 'border-white/20')); el.classList.add(isDesktop ? 'bg-white/20' : 'bg-[#2a2a35]'); }
    clearSelection() { if (this.activeWindow) { Array.from(this.activeWindow.querySelector('.file-grid').children).forEach(c => c.classList.remove('bg-[#2a2a35]')); } }
    navigateTo(path) { this.currentPath = [...path]; if (this.activeWindow) this.renderWindow(this.activeWindow); }
    startInlineRename(iconEl, item, path, { isNew = false, isDesktop = false } = {}) {
        if (!iconEl) return;
        this.commitInlineRename(true);
        const label = iconEl.querySelector('.file-label');
        if (!label) return;
        const originalName = item.name;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = originalName;
        const isDesktopLabel = (iconEl.dataset.isDesktop === '1');
        input.className = ['inline-rename', 'w-full', 'text-center', 'text-white', 'font-mono', isDesktopLabel ? 'text-xs' : 'text-[11px]'].join(' ');
        input.addEventListener('mousedown', (e) => e.stopPropagation());
        input.addEventListener('click', (e) => e.stopPropagation());
        input.addEventListener('contextmenu', (e) => { e.preventDefault(); e.stopPropagation(); });
        label.replaceWith(input);
        this.inlineEdit = { input, item, path, originalName, isNew, isDesktop };
        requestAnimationFrame(() => {
            input.focus();
            const dot = originalName.lastIndexOf('.');
            const hasExt = dot > 0 && dot < originalName.length - 1;
            if (hasExt) input.setSelectionRange(0, dot);
            else input.select();
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); this.commitInlineRename(true); }
            else if (e.key === 'Escape') { e.preventDefault(); this.commitInlineRename(false); }
        });
        input.addEventListener('blur', () => { if (!this.inlineEdit) return; this.commitInlineRename(true); });
    }
    commitInlineRename(save) {
        const st = this.inlineEdit;
        if (!st) return;
        const { input, item, path, originalName, isNew, isDesktop } = st;
        const dir = this.getCurrentDirObj(path);
        this.inlineEdit = null;

        let newName = save ? (input.value || '').trim() : originalName;
        if (!newName) {
            if (isNew) { if (dir?.children?.[originalName]) delete dir.children[originalName]; this.refreshViews(); return; }
            newName = originalName;
        }
        if (newName === originalName) { this.refreshViews(); return; }
        if (!dir?.children) { this.refreshViews(); return; }
        if (dir.children[newName] && newName !== originalName) newName = this.makeUniqueName(dir, newName);

        if (dir.children[originalName]) {
            dir.children[newName] = dir.children[originalName];
            delete dir.children[originalName];
            item.name = newName;
        } else {
            const key = Object.keys(dir.children).find(k => dir.children[k] === item);
            if (key) { dir.children[newName] = dir.children[key]; delete dir.children[key]; item.name = newName; }
        }
        saveStateDebounced(); // PERSIST
        this.refreshViews();
        requestAnimationFrame(() => { const iconEl = this.findIconElementByName(newName, isDesktop); if (iconEl) this.selectItem(iconEl, isDesktop); });
    }
    createFolder() { this.createAndInlineEdit('folder'); }
    createFile() { this.createAndInlineEdit('file'); }
    createAndInlineEdit(type) {
        const targetPath = this.getTargetPath();
        const dir = this.getCurrentDirObj(targetPath);
        if (!dir?.children) return;
        const defaultName = (type === 'folder') ? 'folder' : 'file.txt';
        const uniqueName = this.makeUniqueName(dir, defaultName);
        dir.children[uniqueName] = { name: uniqueName, type: type, children: type === 'folder' ? {} : undefined, content: type === 'file' ? "" : undefined };
        saveStateDebounced(); // PERSIST
        const isDesktop = (this.contextTarget === 'desktop');
        this.pendingInlineEdit = { path: targetPath, name: uniqueName, isDesktop, isNew: true };
        this.refreshViews();
    }
    deleteItem(item) {
        const targetPath = this.getTargetPath();
        const dir = this.getCurrentDirObj(targetPath);
        if (!dir?.children) return;
        const key = item.name;
        if (dir.children[key]) { delete dir.children[key]; saveStateDebounced(); this.refreshViews(); return; }
        const refKey = Object.keys(dir.children).find(k => dir.children[k] === item);
        if (refKey) { delete dir.children[refKey]; saveStateDebounced(); this.refreshViews(); }
    }
    renameFromContext(item) { const isDesktop = (this.contextTarget === 'desktop'); const path = this.getTargetPath(); const el = this.lastContextEl || this.findIconElementByName(item.name, isDesktop); this.startInlineRename(el, item, path, { isNew: false, isDesktop }); }

    refreshViews() {
        this.renderDesktop();
        if (this.activeWindow && document.body.contains(this.activeWindow)) {
            this.renderWindow(this.activeWindow);
        } else {
            this.activeWindow = null;
        }

        lucide.createIcons();
        if (this.pendingInlineEdit) {
            const { path, name, isDesktop, isNew } = this.pendingInlineEdit;
            this.pendingInlineEdit = null;
            requestAnimationFrame(() => {
                const el = this.findIconElementByName(name, isDesktop);
                const dir = this.getCurrentDirObj(path);
                const item = dir?.children?.[name];
                if (el && item) { this.selectItem(el, isDesktop); this.startInlineRename(el, item, path, { isNew, isDesktop }); }
            });
        }
    }

    handleRightClick(e, location, item = null, itemEl = null) {
        e.preventDefault();
        ['tray-wifi', 'tray-volume', 'tray-battery', 'start-menu'].forEach(id => { const el = document.getElementById(id); if (el) el.classList.add('hidden'); });
        this.contextTarget = (location === 'desktop') ? 'desktop' : 'window';
        this.lastContextEl = itemEl;
        const menu = document.getElementById('context-menu');
        menu.innerHTML = '';
        if (item) {
            this.addMenuItem(menu, 'maximize', 'Abrir', () => {
                if (item.type === 'folder') {
                    if (this.contextTarget === 'desktop') { wm.openWindow('files'); this.navigateTo(['home', 'Desktop', item.name]); }
                    else { this.currentPath.push(item.name); this.renderWindow(this.activeWindow); }
                } else { wm.openEditor(item); }
            });
            this.addMenuItem(menu, 'edit-3', 'Renombrar', () => this.renameFromContext(item));
            menu.appendChild(document.createElement('div')).className = 'context-separator';
            this.addMenuItem(menu, 'trash-2', 'Eliminar', () => this.deleteItem(item), 'text-red-400');
        } else {
            this.addMenuItem(menu, 'folder-plus', 'Nueva Carpeta', () => this.createFolder());
            this.addMenuItem(menu, 'file-plus', 'Nuevo Archivo', () => this.createFile());
            menu.appendChild(document.createElement('div')).className = 'context-separator';
            this.addMenuItem(menu, 'refresh-cw', 'Actualizar', () => this.refreshViews());
        }
        menu.classList.remove('hidden');
        let x = e.pageX, y = e.pageY;
        const approxW = 200;
        if (x + approxW > window.innerWidth) x -= approxW;
        if (y + menu.offsetHeight > window.innerHeight) y -= menu.offsetHeight;
        menu.style.left = x + 'px';
        menu.style.top = y + 'px';
        lucide.createIcons();
    }
    addMenuItem(menu, icon, text, onClick, colorClass = 'text-gray-300') { const div = document.createElement('div'); div.className = `context-item ${colorClass}`; div.innerHTML = `<i data-lucide="${icon}" class="w-4 h-4"></i> ${text}`; div.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); onClick(); requestAnimationFrame(() => hideAllPopups()); }); menu.appendChild(div); }
    saveCurrentFile() { if (this.activeEditorFile) { const area = document.getElementById('code-area'); this.activeEditorFile.content = area.value; saveStateDebounced(); const indicator = document.getElementById('save-indicator'); indicator.classList.remove('hidden'); setTimeout(() => indicator.classList.add('hidden'), 2000); } }
    saveHandshakeFile(filename, content) { let dir = this.getCurrentDirObj(['home', 'root', 'handshakes']); if (!dir) { const root = this.getCurrentDirObj(['home', 'root']); root.children['handshakes'] = { name: 'handshakes', type: 'folder', children: {} }; dir = root.children['handshakes']; } dir.children[filename] = { name: filename, type: 'file', content: content }; saveStateDebounced(); this.refreshViews(); }
    appendToFile(pathArr, content) { let dir = fsData; for (let i = 0; i < pathArr.length - 1; i++) { if (dir.children && dir.children[pathArr[i]]) dir = dir.children[pathArr[i]]; else return; } const fname = pathArr[pathArr.length - 1]; if (dir.children && dir.children[fname]) { dir.children[fname].content += "\n" + content; } else { dir.children[fname] = { name: fname, type: 'file', content: content }; } saveStateDebounced(); this.refreshViews(); }

    getDirByPath(pathArr) { return this.getCurrentDirObj(pathArr); }
}

const fm = new FileManager();

// --- WIFI APP LOGIC ---
class WifiTool {
    constructor() { this.scanning = false; }
    scan(winEl) {
        if (this.scanning) return;
        this.scanning = true;
        const list = winEl.querySelector('#wifi-list');
        const overlay = winEl.querySelector('#wifi-radar-overlay');
        const empty = winEl.querySelector('#wifi-empty');
        list.innerHTML = '';
        empty.classList.add('hidden');
        overlay.classList.remove('hidden');
        setTimeout(() => {
            overlay.classList.add('hidden');
            this.scanning = false;
            NETWORK_DB.forEach((net, index) => {
                const tr = document.createElement('tr');
                tr.className = "border-b border-white/5 hover:bg-white/5 cursor-pointer text-[10px] font-mono transition-colors opacity-0";
                tr.style.animation = `slideUpFade 0.3s ease forwards ${index * 0.1}s`;
                let pwrVal = parseInt(net.pwr);
                let barsHtml = '';
                let barCount = 4;
                if (pwrVal < -80) barCount = 1;
                else if (pwrVal < -70) barCount = 2;
                else if (pwrVal < -60) barCount = 3;
                for (let i = 0; i < 4; i++) { barsHtml += `<div class="signal-bar h-${2 + i * 2} ${i < barCount ? 'signal-active' : 'bg-gray-700'}"></div>`; }
                tr.innerHTML = `<td class="p-3 text-white font-bold flex items-center gap-2"><i data-lucide="wifi" class="w-3 h-3 ${barCount > 2 ? 'text-green-400' : 'text-yellow-500'}"></i>${net.ssid}</td><td class="p-3 text-gray-500 font-mono">${net.bssid}</td><td class="p-3"><div class="flex items-end gap-0.5 h-4 w-8" title="${net.pwr}">${barsHtml}</div></td><td class="p-3">${net.ch}</td><td class="p-3 text-cyber-warning font-bold">${net.enc}</td>`;
                tr.onclick = () => wm.openWifiDetails(net);
                list.appendChild(tr);
            });
            lucide.createIcons();
        }, 2500);
    }
}
const wifiApp = new WifiTool();

// --- WINDOW MANAGER ---
class WindowManager {
    constructor() {
        this.zIndexCounter = 100;
        this.windows = {};
        this.taskbarContainer = document.getElementById('taskbar-apps');
        this.snapPreview = document.getElementById('snap-preview');
    }

    // --- STATE PERSISTENCE METHODS ---
    serializeWindows() {
        const windowsList = [];
        for (const [id, win] of Object.entries(this.windows)) {
            if (win.element.style.display === 'none') continue; // Don't save closed/hidden windows if we want exact restore
            
            const state = {
                id: id,
                appId: win.appId, // We need to store original appId
                left: win.element.style.left,
                top: win.element.style.top,
                width: win.element.style.width,
                height: win.element.style.height,
                isMaximized: win.element.classList.contains('is-maximized'),
                zIndex: win.element.style.zIndex,
                // App Specific Data
                data: {}
            };

            // Terminal History
            if (win.appId === 'terminal') {
                const termContainer = win.element.querySelector('#terminal-container');
                if (termContainer) {
                    // Clone to remove input before saving
                    const clone = termContainer.cloneNode(true);
                    const inputLine = clone.lastElementChild;
                    if (inputLine && inputLine.querySelector('input')) inputLine.remove();
                    state.data.historyHtml = clone.innerHTML;
                }
            }
            
            // Files Path
            if (win.appId === 'files') {
                state.data.currentPath = fm.currentPath;
            }

            windowsList.push(state);
        }
        return windowsList.sort((a, b) => (parseInt(a.zIndex) || 0) - (parseInt(b.zIndex) || 0));
    }

    restoreSession(savedWindows) {
        if (!savedWindows || savedWindows.length === 0) return;
        
        savedWindows.forEach(winState => {
            // Re-create window
            this.createWindow(winState.appId, winState.id, winState);
        });
    }

    openWindow(appId) {
        const multiInstanceApps = new Set(['terminal']);
        const instanceId = multiInstanceApps.has(appId)
            ? `${appId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`
            : appId;

        if (!multiInstanceApps.has(appId) && this.windows[appId]) {
            this.focusWindow(appId);
            if (this.windows[appId].element.style.display === 'none') {
                this.windows[appId].element.style.display = 'flex';
                this.animateOpen(this.windows[appId].element);
            }
            return;
        }
        this.createWindow(appId, instanceId);
        saveStateDebounced();
    }

    openWifiDetails(net) {
        const id = `wifi-details-${Date.now()}`;
        const config = { title: `Network: ${net.ssid}`, icon: 'wifi', width: '600px', height: '400px' };
        const winEl = this.buildWindowDOM(id, config);
        winEl.querySelector('.window-content').innerHTML = document.getElementById('content-wifi-details').innerHTML;
        winEl.querySelector('#wd-ssid').innerText = net.ssid;
        winEl.querySelector('#wd-bssid').innerText = net.bssid;
        winEl.querySelector('#wd-vendor').innerText = net.vendor || "Unknown";
        winEl.querySelector('#wd-ch').innerText = net.ch;
        winEl.querySelector('#wd-freq').innerText = net.freq || "2.4 GHz";
        winEl.querySelector('#wd-enc').innerText = net.enc;
        winEl.querySelector('#wd-wps').innerText = net.wps || "Unknown";
        winEl.querySelector('#wd-wps').className = net.wps === 'Locked' ? 'text-red-400 font-bold' : 'text-green-400 font-bold';
        winEl.querySelector('#wd-signal').innerText = net.pwr;
        winEl.querySelector('#wd-clients').innerText = Math.floor(Math.random() * 8) + 1;

        const btn = winEl.querySelector('#btn-capture');
        const idleState = winEl.querySelector('#capture-idle');
        const activeState = winEl.querySelector('#capture-active');
        const statusLine = winEl.querySelector('#cap-status-line');
        const timerDisplay = winEl.querySelector('#cap-timer');
        const bar = winEl.querySelector('#capture-bar');

        let startTime = 0;
        let timerInt = null;

        btn.onclick = () => {
            btn.disabled = true;
            btn.classList.add('opacity-50', 'cursor-not-allowed');
            idleState.classList.add('hidden');
            activeState.classList.remove('hidden');

            statusLine.innerText = "Status: INJECTING";
            statusLine.classList.add('text-red-400', 'animate-pulse');

            startTime = Date.now();
            timerInt = setInterval(() => {
                const diff = Math.floor((Date.now() - startTime) / 1000);
                const m = Math.floor(diff / 60).toString().padStart(2, '0');
                const s = (diff % 60).toString().padStart(2, '0');
                timerDisplay.innerText = `${m}:${s}`;
            }, 1000);

            let p = 0;
            const stage1 = setInterval(() => {
                p += 0.5;
                bar.style.width = p + '%';

                if (p > 40 && p < 41) {
                    statusLine.innerText = "Status: LISTENING";
                    statusLine.classList.replace('text-red-400', 'text-yellow-400');
                    winEl.querySelector('#capture-text').innerText = "WAITING FOR\nHANDSHAKE";
                    winEl.querySelector('#capture-text').classList.replace('text-red-400', 'text-yellow-400');
                    winEl.querySelector('#capture-icon').classList.replace('text-red-500', 'text-yellow-500');
                }

                if (p >= 100) {
                    clearInterval(stage1);
                    clearInterval(timerInt);

                    statusLine.innerText = "Status: CAPTURED";
                    statusLine.classList.replace('text-yellow-400', 'text-green-400');
                    statusLine.classList.remove('animate-pulse');

                    winEl.querySelector('#capture-text').innerText = "WPA HANDSHAKE\nCAPTURED";
                    winEl.querySelector('#capture-text').classList.replace('text-yellow-400', 'text-green-400');
                    winEl.querySelector('#capture-icon').classList.replace('text-yellow-500', 'text-green-500');
                    winEl.querySelector('#capture-icon').setAttribute('data-lucide', 'lock');
                    lucide.createIcons();

                    bar.classList.replace('bg-red-500', 'bg-green-500');

                    const now = new Date();
                    const timeStr = `${now.getHours()}${now.getMinutes()}`;
                    const filename = `${net.ssid}_${timeStr}.pcap`;
                    fm.saveHandshakeFile(filename, `PCAP DATA\nBSSID: ${net.bssid}\nSSID: ${net.ssid}`);

                    setTimeout(() => {
                        btn.innerHTML = `<i data-lucide="check" class="w-4 h-4"></i> SAVED: ${filename}`;
                        btn.classList.remove('opacity-50', 'bg-white/5', 'text-gray-300');
                        btn.classList.add('bg-green-500/10', 'border-green-500', 'text-green-500');
                        lucide.createIcons();
                    }, 500);
                }
            }, 50);
        };
        this.finalizeWindow(id, winEl, config);
        lucide.createIcons();
    }

    openFilePicker(callback) {
        const id = `picker-${Date.now()}`;
        const config = { title: 'Select File', icon: 'folder-search', width: '500px', height: '400px' };
        const winEl = this.buildWindowDOM(id, config);
        winEl.querySelector('.window-content').innerHTML = document.getElementById('tpl-file-picker').innerHTML;

        let currentPath = ['home', 'root'];
        let selectedItem = null;

        const render = () => {
            const grid = winEl.querySelector('.file-grid');
            const bc = winEl.querySelector('.breadcrumb');
            bc.innerText = '/' + currentPath.join('/');
            grid.innerHTML = '';

            let dir = fsData;
            for (const p of currentPath) dir = dir.children[p];

            if (dir && dir.children) {
                Object.values(dir.children).forEach(item => {
                    const el = document.createElement('div');
                    el.className = "flex flex-col items-center gap-2 p-2 hover:bg-white/10 rounded cursor-pointer border border-transparent";
                    if (selectedItem === item) el.classList.add('bg-white/10', 'border-white/20');

                    let icon = 'file';
                    let color = 'text-gray-400';
                    if (item.type === 'folder') { icon = 'folder'; color = 'text-blue-400'; }
                    else if (item.name.endsWith('.pcap')) { icon = 'hash'; color = 'text-red-400'; }

                    el.innerHTML = `<i data-lucide="${icon}" class="w-8 h-8 ${color}"></i><span class="text-[10px] text-center w-full truncate">${item.name}</span>`;

                    el.onclick = () => { selectedItem = item; winEl.querySelector('.btn-select').disabled = false; render(); };
                    el.ondblclick = () => {
                        if (item.type === 'folder') {
                            currentPath.push(item.name);
                            selectedItem = null;
                            winEl.querySelector('.btn-select').disabled = true;
                            render();
                        }
                    };
                    grid.appendChild(el);
                });
            }
            lucide.createIcons();
        };

        winEl.querySelector('.btn-up').onclick = () => { if (currentPath.length > 1) { currentPath.pop(); render(); } };
        winEl.querySelector('.btn-cancel').onclick = () => this.closeWindow(id);
        winEl.querySelector('.btn-select').onclick = () => { if (selectedItem) { this.closeWindow(id); callback(selectedItem); } };

        this.finalizeWindow(id, winEl, config);
        render();
    }

    openEditor(fileItem) {
        let winId = 'editor-main';
        if (this.windows[winId]) {
            this.focusWindow(winId);
            if (this.windows[winId].element.style.display === 'none') this.windows[winId].element.style.display = 'flex';
        } else {
            const config = { title: 'Code Editor', icon: 'file-code', width: '700px', height: '500px' };
            const winEl = this.buildWindowDOM(winId, config);
            winEl.querySelector('.window-content').innerHTML = document.getElementById('content-editor').innerHTML;
            this.finalizeWindow(winId, winEl, config);
        }
        const winEl = this.windows[winId].element;
        winEl.querySelector('.window-title').innerText = fileItem.name;
        const area = winEl.querySelector('#code-area');
        area.value = fileItem.content || "";
        fm.activeEditorFile = fileItem;
        updateLineNumbers(area);
    }

    createWindow(appId, instanceId = appId, restoredState = null) {
        const config = this.getAppConfig(appId);
        const winEl = this.buildWindowDOM(instanceId, config);
        
        // Restore State if provided
        if (restoredState) {
            if (restoredState.left) winEl.style.left = restoredState.left;
            if (restoredState.top) winEl.style.top = restoredState.top;
            if (restoredState.width) winEl.style.width = restoredState.width;
            if (restoredState.height) winEl.style.height = restoredState.height;
            if (restoredState.zIndex) winEl.style.zIndex = restoredState.zIndex;
            if (restoredState.isMaximized) winEl.classList.add('is-maximized');
        }

        const contentSrc = document.getElementById(`content-${appId}`);
        if (contentSrc) winEl.querySelector('.window-content').innerHTML = contentSrc.innerHTML;
        
        // Pass app-specific data to finalize
        const appData = restoredState ? restoredState.data : {};
        this.finalizeWindow(instanceId, winEl, config, appId, appData);
    }

    buildWindowDOM(id, config) { const template = document.getElementById('tpl-window'); const clone = template.content.cloneNode(true); const winEl = clone.querySelector('.glass-panel'); winEl.id = `win-${id}`; winEl.querySelector('.window-title').innerText = config.title; winEl.querySelector('.window-icon').setAttribute('data-lucide', config.icon); const offset = Object.keys(this.windows).length * 25; winEl.style.left = (100 + offset) + 'px'; winEl.style.top = (60 + offset) + 'px'; winEl.style.width = config.width; winEl.style.height = config.height; return winEl; }

    finalizeWindow(id, winEl, config, appId = id, appData = {}) {
        document.getElementById('window-layer').appendChild(winEl);
        this.windows[id] = { element: winEl, config: config, appId };

        this.addTaskbarItem(id, config);
        this.setupInteractions(winEl, id);
        this.setupResize(winEl, id);
        this.focusWindow(id);

        // Inicializaciones por app
        if (appId === 'terminal') {
            this.initTerminal(winEl, appData.historyHtml);
        }
        if (appId === 'files') {
            // Restore path if exists
            if (appData.currentPath) fm.currentPath = appData.currentPath;
            fm.renderWindow(winEl);
            winEl.querySelector('.btn-up').onclick = () => {
                fm.currentPath.pop();
                if (fm.currentPath.length === 0) fm.currentPath = ['home'];
                fm.renderWindow(winEl);
            };
        }
        if (appId === 'sysmon') this.initSysMon(winEl);
        if (appId === 'network') this.initNetwork(winEl);
        if (appId === 'wifi') {
            const btn = winEl.querySelector('#wifi-scan-btn');
            btn.onclick = () => wifiApp.scan(winEl);
        }
        if (appId === 'cracker') this.initCracker(winEl);

        lucide.createIcons();
        
        // Only animate open if it's a fresh window, not restored (to avoid flicker)
        if (Object.keys(appData).length === 0) {
            this.animateOpen(winEl);
        }
    }

    getAppConfig(id) {
        const configs = {
            'terminal': { title: 'Terminal', icon: 'terminal-square', width: '650px', height: '420px' },
            'sysmon': { title: 'System Monitor', icon: 'cpu', width: '600px', height: '450px' },
            'decrypt': { title: 'Decryptor', icon: 'lock', width: '400px', height: '300px' },
            'network': { title: 'Net Map', icon: 'globe', width: '600px', height: '400px' },
            'files': { title: 'File Explorer', icon: 'folder-open', width: '700px', height: '480px' },
            'wifi': { title: 'WiFi Scanner', icon: 'wifi', width: '550px', height: '450px' },
            'cracker': { title: 'WPA2 Cracker', icon: 'unlock', width: '500px', height: '350px' }
        };
        return configs[id];
    }

    setupInteractions(el, id) {
        const header = el.querySelector('.window-header');
        el.querySelector('.window-close').onclick = (e) => { e.stopPropagation(); this.closeWindow(id); };
        el.querySelector('.window-min').onclick = (e) => { e.stopPropagation(); el.style.display = 'none'; this.toggleTaskbarActive(id, false); };
        
        const maxBtn = el.querySelector('.window-max');
        if (maxBtn) {
            maxBtn.onclick = (e) => {
                e.stopPropagation();
                this.toggleMaximize(id);
            };

            // Doble click en header = maximizar/restaurar
            header.addEventListener('dblclick', (ev) => {
                if (ev.target.closest('button')) return;
                this.toggleMaximize(id);
            });
        }

        el.addEventListener('mousedown', () => this.focusWindow(id));
        let isDragging = false, startX, startY, iLeft, iTop;
        
        header.onmousedown = (e) => {
            if (e.target.closest('button')) return;
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            iLeft = el.offsetLeft;
            iTop = el.offsetTop;
            this.focusWindow(id);
            el.style.transition = 'none';
            // Reset maximize state on drag
            if (el.classList.contains('is-maximized')) {
                this.toggleMaximize(id); 
                iLeft = el.offsetLeft; 
                iTop = el.offsetTop; 
            }
        };

        // SNAP LOGIC
        let snapTarget = null; // { left, top, width, height }

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const newLeft = iLeft + (e.clientX - startX);
            const newTop = iTop + (e.clientY - startY);
            el.style.left = `${newLeft}px`;
            el.style.top = `${newTop}px`;

            // Detect edges for snapping
            const margin = 20; // px threshold
            const screenW = window.innerWidth;
            const tbH = this.getTaskbarHeight();
            const screenH = window.innerHeight - tbH;

            const x = e.clientX;
            const y = e.clientY;

            snapTarget = null;

            // Corners first
            if (y < margin && x < margin) {
                // Top-Left
                snapTarget = { left: 0, top: 0, width: screenW/2, height: screenH/2 };
            } else if (y < margin && x > screenW - margin) {
                // Top-Right
                snapTarget = { left: screenW/2, top: 0, width: screenW/2, height: screenH/2 };
            } else if (y > screenH - margin && x < margin) {
                // Bottom-Left
                snapTarget = { left: 0, top: screenH/2, width: screenW/2, height: screenH/2 };
            } else if (y > screenH - margin && x > screenW - margin) {
                // Bottom-Right
                snapTarget = { left: screenW/2, top: screenH/2, width: screenW/2, height: screenH/2 };
            } 
            // Edges next
            else if (y < margin) {
                // Top (Maximize)
                snapTarget = { left: 0, top: 0, width: screenW, height: screenH };
            } else if (x < margin) {
                // Left Half
                snapTarget = { left: 0, top: 0, width: screenW/2, height: screenH };
            } else if (x > screenW - margin) {
                // Right Half
                snapTarget = { left: screenW/2, top: 0, width: screenW/2, height: screenH };
            }

            if (snapTarget) {
                this.snapPreview.classList.remove('hidden');
                this.snapPreview.style.left = snapTarget.left + 'px';
                this.snapPreview.style.top = snapTarget.top + 'px';
                this.snapPreview.style.width = snapTarget.width + 'px';
                this.snapPreview.style.height = snapTarget.height + 'px';
            } else {
                this.snapPreview.classList.add('hidden');
            }
        });

        document.addEventListener('mouseup', () => { 
            if (isDragging) { 
                isDragging = false; 
                el.style.transition = 'all 0.2s'; 
                saveStateDebounced();
                
                if (snapTarget) {
                    // Apply snap
                    el.style.left = snapTarget.left + 'px';
                    el.style.top = snapTarget.top + 'px';
                    el.style.width = snapTarget.width + 'px';
                    el.style.height = snapTarget.height + 'px';
                    
                    // If full screen, add maximized class for logic consistence
                    if (snapTarget.width === window.innerWidth) {
                        el.classList.add('is-maximized');
                    } else {
                        el.classList.remove('is-maximized');
                    }
                    
                    this.snapPreview.classList.add('hidden');
                    snapTarget = null;
                }
            } 
        });
    }

    setupResize(winEl, id) {
        const minW = 360;
        const minH = 220;
    
        const startResize = (e, dir) => {
            e.preventDefault();
            e.stopPropagation();
    
            const el = winEl;
            if (el.classList.contains('is-maximized')) return;
    
            this.focusWindow(id);
    
            const startX = e.clientX;
            const startY = e.clientY;
    
            const rect = el.getBoundingClientRect();
    
            const startLeft = rect.left;
            const startTop = rect.top;
            const startW = rect.width;
            const startH = rect.height;
    
            const onMove = (ev) => {
                const dx = ev.clientX - startX;
                const dy = ev.clientY - startY;
    
                let newLeft = startLeft;
                let newTop = startTop;
                let newW = startW;
                let newH = startH;
    
                // Horizontal
                if (dir.includes('e')) newW = startW + dx;
                if (dir.includes('w')) {
                    newW = startW - dx;
                    newLeft = startLeft + dx;
                }
    
                // Vertical
                if (dir.includes('s')) newH = startH + dy;
                if (dir.includes('n')) {
                    newH = startH - dy;
                    newTop = startTop + dy;
                }
    
                // min bounds
                if (newW < minW) {
                    if (dir.includes('w')) newLeft -= (minW - newW);
                    newW = minW;
                }
                if (newH < minH) {
                    if (dir.includes('n')) newTop -= (minH - newH);
                    newH = minH;
                }
    
                // clamp dentro del viewport
                const tb = document.getElementById('taskbar');
                const tbH = tb ? tb.offsetHeight : 0;
    
                const maxW = window.innerWidth;
                const maxH = window.innerHeight - tbH;
    
                if (newLeft < 0) { newW += newLeft; newLeft = 0; }
                if (newTop < 0) { newH += newTop; newTop = 0; }
    
                if (newLeft + newW > maxW) newW = Math.max(minW, maxW - newLeft);
                if (newTop + newH > maxH) newH = Math.max(minH, maxH - newTop);
    
                el.style.left = `${newLeft}px`;
                el.style.top = `${newTop}px`;
                el.style.width = `${newW}px`;
                el.style.height = `${newH}px`;
            };
    
            const onUp = () => {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
                saveStateDebounced();
            };
    
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        };
    
        // engancha handlers a todos los resizers
        winEl.querySelectorAll('.window-resizer').forEach(handle => {
            const dir = handle.dataset.dir;
            handle.addEventListener('mousedown', (e) => startResize(e, dir));
        });
    
        // legacy corner resizer
        const legacy = winEl.querySelector('.window-resize');
        if (legacy) legacy.addEventListener('mousedown', (e) => startResize(e, 'se'));
    }

    getTaskbarHeight() {
        const tb = document.getElementById('taskbar');
        if (!tb) return 0;
        const h = tb.offsetHeight || 0;
        return h;
    }
    
    toggleMaximize(id) {
        const win = this.windows[id];
        if (!win) return;
        const el = win.element;
    
        // Guardar estado previo si no estaba maximizada
        const isMax = el.classList.contains('is-maximized');
    
        if (!isMax) {
            el.dataset.prevLeft = el.style.left;
            el.dataset.prevTop = el.style.top;
            el.dataset.prevWidth = el.style.width;
            el.dataset.prevHeight = el.style.height;
    
            const tbH = this.getTaskbarHeight();
    
            el.classList.add('is-maximized');
            el.style.left = '0px';
            el.style.top = '0px';
            el.style.width = '100vw';
            el.style.height = `calc(100vh - ${tbH}px)`;
        } else {
            el.classList.remove('is-maximized');
            el.style.left = el.dataset.prevLeft || '100px';
            el.style.top = el.dataset.prevTop || '60px';
            el.style.width = el.dataset.prevWidth || win.config.width;
            el.style.height = el.dataset.prevHeight || win.config.height;
        }
    
        this.focusWindow(id);
        saveStateDebounced();
    }

    focusWindow(id) {
        this.zIndexCounter++;
        const win = this.windows[id];
        if (win) {
            win.element.style.zIndex = this.zIndexCounter;
            Object.values(this.windows).forEach(w => w.element.classList.remove('window-active'));
            win.element.classList.add('window-active');
            this.toggleTaskbarActive(id, true);
        }
    }

    closeWindow(id) {
        const win = this.windows[id];
        if (win) {
            if (win.element === fm.activeWindow) fm.activeWindow = null;
            win.element.style.opacity = '0';
            win.element.style.transform = 'scale(0.9)';
            setTimeout(() => {
                win.element.remove();
                delete this.windows[id];
                document.getElementById(`task-${id}`)?.remove();
                saveStateDebounced();
            }, 150);
        }
    }

    addTaskbarItem(id, config) {
        const item = document.createElement('div');
        item.id = `task-${id}`;
        item.className = 'flex items-center justify-center p-2 rounded hover:bg-white/10 transition-colors cursor-pointer border-b-2 border-cyber-primary';
        item.innerHTML = `<i data-lucide="${config.icon}" class="w-5 h-5 text-gray-300"></i>`;
        item.onclick = () => this.openWindow(id);
        item.title = config.title;
        this.taskbarContainer.appendChild(item);
    }

    toggleTaskbarActive(id, isActive) {
        const item = document.getElementById(`task-${id}`);
        if (item) {
            item.className = isActive
                ? 'flex items-center justify-center p-2 rounded bg-white/10 transition-colors cursor-pointer border-b-2 border-cyber-primary'
                : 'flex items-center justify-center p-2 rounded hover:bg-white/10 transition-colors cursor-pointer border-b-2 border-transparent opacity-70';
        }
    }

    animateOpen(el) {
        el.style.opacity = '0';
        el.style.transform = 'scale(0.95)';
        requestAnimationFrame(() => {
            el.style.transition = 'all 0.2s';
            el.style.opacity = '1';
            el.style.transform = 'scale(1)';
        });
    }

    // --- SYSMON & NETWORK & CRACKER ---
    initSysMon(winEl) {
        const cpuGraph = winEl.querySelector('#sys-cpu-graph');
        const gpuGraph = winEl.querySelector('#sys-gpu-graph');
        const procList = winEl.querySelector('#sys-proc-list');
        const createBars = (container, colorClass) => {
            container.innerHTML = '';
            for (let i = 0; i < 30; i++) {
                const bar = document.createElement('div');
                bar.className = `flex-1 ${colorClass} transition-all duration-300 opacity-80`;
                bar.style.height = '5%';
                bar.style.borderRadius = '1px';
                container.appendChild(bar);
            }
        };
        createBars(cpuGraph, 'bg-cyber-primary');
        createBars(gpuGraph, 'bg-cyber-secondary');

        const processes = [
            { name: 'kernel_task', pid: 0 },
            { name: 'nexus_daemon', pid: 142 },
            { name: 'ssh_tunnel', pid: 892 },
            { name: 'chrome_helper', pid: 4421 },
            { name: 'docker_vm', pid: 551 },
            { name: 'matrix_render', pid: 112 },
            { name: 'crypto_wallet', pid: 332 },
            { name: 'net_sniffer', pid: 771 },
            { name: 'sys_monitor', pid: 991 },
            { name: 'xorg_server', pid: 211 }
        ];

        const update = () => {
            if (!document.body.contains(winEl)) return;
            const cpuVal = Math.floor(Math.random() * 60) + 10;
            winEl.querySelector('#sys-cpu-val').innerText = cpuVal + '%';
            Array.from(cpuGraph.children).forEach((bar) => { bar.style.height = Math.max(5, Math.random() * 100) + '%'; bar.style.opacity = Math.random() * 0.5 + 0.5; });

            const gpuVal = Math.floor(Math.random() * 40) + 5;
            winEl.querySelector('#sys-gpu-val').innerText = gpuVal + '%';
            Array.from(gpuGraph.children).forEach(bar => { bar.style.height = Math.max(5, Math.random() * 80) + '%'; });

            const ramVal = (Math.random() * 2 + 12).toFixed(1);
            winEl.querySelector('#sys-ram-val').innerText = ramVal + ' GB';
            winEl.querySelector('#sys-ram-bar').style.width = (ramVal / 64 * 100) + '%';

            procList.innerHTML = '';
            const activeProcs = processes.map(p => ({ ...p, cpu: (Math.random() * 15).toFixed(1) })).sort((a, b) => b.cpu - a.cpu);
            activeProcs.forEach(p => {
                const row = document.createElement('div');
                row.className = "flex justify-between text-gray-300 border-b border-white/5 py-1 hover:bg-white/5";
                row.innerHTML = `<span class="w-1/2 truncate pl-1">${p.name}</span><span class="w-1/4 text-right text-gray-500">${p.pid}</span><span class="w-1/4 text-right text-cyber-primary pr-1">${p.cpu}%</span>`;
                procList.appendChild(row);
            });
        };
        setInterval(update, 1000);
        update();
    }

    initNetwork(winEl) {
        const canvas = winEl.querySelector('#net-canvas');
        const logContainer = winEl.querySelector('#net-logs');
        const ctx = canvas.getContext('2d');

        let width, height;
        const nodes = [
            { x: 0.5, y: 0.5, type: 'hq', label: 'LOCALHOST', color: '#00f0ff' },
            { x: 0.2, y: 0.3, type: 'srv', label: 'PROXY_HK', color: '#a0aec0' },
            { x: 0.8, y: 0.25, type: 'db', label: 'CORP_DB', color: '#f56565' },
            { x: 0.75, y: 0.7, type: 'node', label: 'TARGET_01', color: '#ed8936' },
            { x: 0.25, y: 0.75, type: 'node', label: 'GATEWAY', color: '#48bb78' }
        ];
        const packets = [];
        let frame = 0;

        const resize = () => { const rect = canvas.getBoundingClientRect(); canvas.width = width = rect.width; canvas.height = height = rect.height; };
        resize();
        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(canvas);

        const addLog = (msg) => {
            const div = document.createElement('div');
            div.className = 'text-gray-400 mb-0.5';
            div.innerHTML = `<span class="text-cyber-primary">[${new Date().toLocaleTimeString('es-ES', { hour12: false })}]</span> ${msg}`;
            logContainer.insertBefore(div, logContainer.firstChild);
            if (logContainer.children.length > 20) logContainer.lastChild.remove();
        };

        const loop = () => {
            if (!document.body.contains(winEl)) { resizeObserver.disconnect(); return; }
            frame++;
            ctx.clearRect(0, 0, width, height);
            ctx.lineWidth = 1;

            const center = nodes[0];
            const cx = center.x * width;
            const cy = center.y * height;

            nodes.slice(1).forEach(node => {
                const nx = node.x * width;
                const ny = node.y * height;
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(255,255,255,0.1)';
                ctx.setLineDash([5, 5]);
                ctx.moveTo(cx, cy);
                ctx.lineTo(nx, ny);
                ctx.stroke();
                ctx.setLineDash([]);
            });

            ctx.beginPath();
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
            ctx.arc(cx, cy, (frame % 200) * 0.8, 0, Math.PI * 2);
            ctx.stroke();

            if (frame % 120 === 0) {
                const target = nodes[Math.floor(Math.random() * (nodes.length - 1)) + 1];
                packets.push({ from: center, to: target, progress: 0, speed: 0.005 + Math.random() * 0.005 });
                if (Math.random() > 0.7) addLog(`Ping ${target.label}: ${(Math.random() * 20 + 10).toFixed(1)}ms`);
            }

            for (let i = packets.length - 1; i >= 0; i--) {
                let p = packets[i];
                p.progress += p.speed;
                const sx = p.from.x * width;
                const sy = p.from.y * height;
                const ex = p.to.x * width;
                const ey = p.to.y * height;
                const curX = sx + (ex - sx) * p.progress;
                const curY = sy + (ey - sy) * p.progress;
                ctx.fillStyle = '#fff';
                ctx.fillRect(curX - 1.5, curY - 1.5, 3, 3);
                if (p.progress >= 1) packets.splice(i, 1);
            }

            nodes.forEach(node => {
                const nx = node.x * width;
                const ny = node.y * height;
                const grad = ctx.createRadialGradient(nx, ny, 2, nx, ny, 10);
                grad.addColorStop(0, node.color);
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(nx, ny, 10, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(nx, ny, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = node.color;
                ctx.font = '10px monospace';
                ctx.fillText(node.label, nx + 12, ny + 3);
            });

            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    initCracker(winEl) {
        const initView = winEl.querySelector('#cracker-init');
        const procView = winEl.querySelector('#cracker-process');
        const successView = winEl.querySelector('#cracker-success');
        const logDiv = winEl.querySelector('#cracker-log');
        const display = winEl.querySelector('#crack-display');
        const status = winEl.querySelector('#crack-status');
        const bar = winEl.querySelector('#crack-bar');
        const progress = winEl.querySelector('#crack-progress');

        initView.classList.remove('hidden');
        procView.classList.add('hidden');
        successView.classList.add('hidden');
        logDiv.innerHTML = '';
        display.innerText = '';
        bar.style.width = '0%';
        progress.innerText = '0%';

        winEl.querySelector('#btn-select-pcap').onclick = () => {
            this.openFilePicker((file) => {
                initView.classList.add('hidden');
                procView.classList.remove('hidden');

                const content = file.content || "";
                const bssidMatch = content.match(/BSSID: ([0-9A-Fa-f:]+)/);
                const bssid = bssidMatch ? bssidMatch[1] : null;
                const net = NETWORK_DB.find(n => n.bssid === bssid);
                const ssid = net ? net.ssid : "UNKNOWN";
                const realPass = net ? net.pass : "????????";
                const passLen = realPass.length;

                const addLog = (t) => { logDiv.innerHTML += `<div class="opacity-80">> ${t}</div>`; logDiv.scrollTop = logDiv.scrollHeight; };

                addLog(`Target: ${ssid}`);
                addLog(`Loaded: ${file.name}`);
                if (bssid) addLog(`Target BSSID: ${bssid}`);

                status.innerText = "CALCULATING LENGTH...";

                let detectedLen = 0;
                let scanIter = 0;
                display.innerHTML = '';

                const analysisInt = setInterval(() => {
                    scanIter++;
                    const noise = Array.from({ length: Math.min(scanIter % 20, 15) }, () => Math.random() > 0.5 ? '1' : '0').join('');
                    status.innerText = `CALCULATING LENGTH [${noise}]`;

                    const prog = Math.min((scanIter / 60) * 100, 100);
                    bar.style.width = (prog / 2) + '%';
                    progress.innerText = Math.floor(prog / 2) + '%';

                    if (scanIter % 8 === 0 && detectedLen < passLen) {
                        detectedLen++;
                        const slot = document.createElement('span');
                        slot.className = "inline-block w-6 h-10 border-b-2 border-white/20 mx-0.5 animate-pulse text-center text-2xl pt-1 text-transparent";
                        slot.innerText = "_";
                        display.appendChild(slot);
                        addLog(`Byte ${detectedLen} found...`);
                    }

                    if (detectedLen === passLen && scanIter > (passLen * 8 + 20)) {
                        clearInterval(analysisInt);
                        addLog(`Length Confirmed: ${passLen} chars.`);
                        status.innerText = "BRUTE FORCING...";
                        setTimeout(startCrackAnim, 1000);
                    }
                }, 120);

                const startCrackAnim = () => {
                    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
                    let solvedIndex = 0;
                    const slots = Array.from(display.children);

                    const crackInt = setInterval(() => {
                        slots.forEach((slot, idx) => {
                            if (idx >= solvedIndex) {
                                slot.innerText = chars.charAt(Math.floor(Math.random() * chars.length));
                                slot.className = "inline-block w-6 h-10 mx-0.5 text-center text-white/30 text-2xl pt-1";
                            }
                        });

                        if (Math.random() > 0.95 && solvedIndex < passLen) {
                            const correctChar = realPass.charAt(solvedIndex);
                            const slot = slots[solvedIndex];

                            slot.innerText = correctChar;
                            slot.className = "inline-block w-6 h-10 mx-0.5 text-center text-white font-bold animate-unlock-flash text-2xl pt-1 shadow-white";

                            addLog(`Matched position ${solvedIndex + 1}: '${correctChar}'`);
                            solvedIndex++;

                            const pct = 50 + (solvedIndex / passLen * 50);
                            bar.style.width = pct + '%';
                            progress.innerText = Math.floor(pct) + '%';
                        }

                        if (solvedIndex === passLen) {
                            clearInterval(crackInt);
                            setTimeout(() => {
                                procView.classList.add('hidden');
                                successView.classList.remove('hidden');
                                winEl.querySelector('#final-password').innerText = realPass;
                                fm.appendToFile(['home', 'root', 'cracker', 'cracked.txt'], `${ssid} --> ${realPass}`);
                            }, 1500);
                        }
                    }, 50);
                };
            });
        };
    }

    // --- TERMINAL LOGIC (UPGRADED) ---
    initTerminal(winEl, restoredHtml = '') {
        const termContainer = winEl.querySelector('#terminal-container');
        const nanoDiv = winEl.querySelector('#nano-editor');
        const nanoContent = winEl.querySelector('#nano-content');
        const nanoFilename = winEl.querySelector('#nano-filename');
        const nanoMsg = winEl.querySelector('#nano-msg');

        // Restore history if available
        if (restoredHtml) {
            termContainer.innerHTML = restoredHtml;
        }

        // State
        let cwd = ['home', 'root']; 
        let history = [];
        let historyIndex = -1;
        let isNanoOpen = false;
        let currentNanoFile = null;
        let currentInput = null;
        let runningProcess = null; // { stop: fn, name: string }

        const COMMANDS = [
            'help','clear','exit','pwd','ls','cd','mkdir','touch','rm','rmdir','cat','nano',
            'cp','mv','tree','whoami','id','uname','neofetch','date','echo',
            'ps','top','free','df',
            'ip','ifconfig','netstat','ping',
            'open',
            'files','wifi','network','sysmon','cracker','terminal',
            'hashcat','iwconfig','airodump-ng','airmon-ng','aircrack-ng'
        ];

        const getPromptHtml = () => {
            let p = '/' + cwd.join('/');
            if (p.startsWith('/home/root')) p = p.replace('/home/root', '~');
            return `<span class="terminal-prompt">root@nexus</span><span class="text-gray-500">:</span><span class="terminal-path">${p}</span><span class="text-gray-500 mr-2">$</span>`;
        };

        const appendLine = (html) => {
            const div = document.createElement('div');
            div.innerHTML = html;
            termContainer.appendChild(div);
            termContainer.scrollTop = termContainer.scrollHeight;
            saveStateDebounced(); // Trigger save on output
        };

        const createPromptLine = () => {
            if (runningProcess) return; // Don't create prompt if process running
            const line = document.createElement('div');
            line.className = "flex items-center gap-0";
            line.innerHTML = `${getPromptHtml()}<input type="text" class="terminal-input" autocomplete="off" spellcheck="false">`;
            termContainer.appendChild(line);
            
            const input = line.querySelector('input');
            input.focus();
            currentInput = input;
            
            // Re-bind listener
            input.addEventListener('keydown', handleInputKey);
            termContainer.scrollTop = termContainer.scrollHeight;
        };

        const stopRunningProcess = () => {
            if (runningProcess && runningProcess.stop) {
                runningProcess.stop();
                runningProcess = null;
                createPromptLine();
            }
        };

        const handleGlobalKeydown = (e) => {
            // Check if this specific terminal window is active and still exists
            if (!document.body.contains(winEl)) {
                document.removeEventListener('keydown', handleGlobalKeydown);
                return;
            }
            
            if (!winEl.classList.contains('window-active')) return;

            if (e.ctrlKey && e.key.toLowerCase() === 'c') {
                if (runningProcess) {
                    e.preventDefault();
                    e.stopPropagation();
                    stopRunningProcess();
                } else if (currentInput) {
                    // Visual feedback for Ctrl+C on prompt
                    e.preventDefault();
                    const parent = currentInput.parentElement;
                    parent.innerHTML = `${getPromptHtml()}^C`;
                    createPromptLine();
                }
            }
        };
        // Attach listener to document to capture keys even if focus is slightly off but window is active
        document.addEventListener('keydown', handleGlobalKeydown);

        // ... [Helper functions] ...
        const normPath = (arr) => arr.filter(Boolean);
        const resolvePath = (pathStr) => {
            if (!pathStr || pathStr === '~') return ['home', 'root'];
            if (pathStr === '/') return [];
            let target = [...cwd];
            if (pathStr.startsWith('/')) target = pathStr.split('/').filter(x => x);
            else if (pathStr.startsWith('~/')) target = ['home', 'root', ...pathStr.slice(2).split('/').filter(x => x)];
            else if (pathStr.startsWith('~')) target = ['home', 'root', ...pathStr.slice(1).split('/').filter(x => x)];
            else { const parts = pathStr.split('/'); for (let p of parts) { if (!p || p === '.') continue; if (p === '..') { if (target.length > 0) target.pop(); } else target.push(p); } }
            return normPath(target);
        };
        const splitParentChild = (pathArr) => { const parent = pathArr.slice(0, -1); const name = pathArr[pathArr.length - 1]; return { parent, name }; };
        const getDir = (pathArr) => fm.getDirByPath(pathArr);
        const getNode = (pathArr) => { if (!pathArr || pathArr.length === 0) return fsData; let cur = fsData; for (const p of pathArr) { if (cur?.children?.[p]) cur = cur.children[p]; else return null; } return cur; };
        const ensureDir = (pathArr) => { const d = getDir(pathArr); return (d && d.type === 'folder') ? d : null; };
        const fmtPath = (pathArr) => '/' + (pathArr || []).join('/');
        const listDir = (dirObj) => { const items = Object.values(dirObj.children || {}); items.sort((a,b) => (a.type === b.type) ? a.name.localeCompare(b.name) : (a.type === 'folder' ? -1 : 1)); return items; };
        const deepCloneNode = (node) => { if (!node) return null; if (node.type === 'file') return { name: node.name, type: 'file', content: node.content || '' }; const out = { name: node.name, type: 'folder', children: {} }; for (const k of Object.keys(node.children || {})) out.children[k] = deepCloneNode(node.children[k]); return out; };
        const removeRecursive = (parentDir, name) => { if (!parentDir?.children?.[name]) return false; delete parentDir.children[name]; return true; };
        const moveNode = (srcParent, srcName, dstParent, dstName) => { if (!srcParent?.children?.[srcName]) return false; if (!dstParent?.children) dstParent.children = {}; dstParent.children[dstName] = srcParent.children[srcName]; dstParent.children[dstName].name = dstName; delete srcParent.children[srcName]; return true; };

        // Nano Functions (Local to instance)
        const nanoSave = () => {
            if (!currentNanoFile) return;
            const dir = ensureDir(cwd);
            if (!dir) return;
            if (!dir.children) dir.children = {};
            if (!dir.children[currentNanoFile] || dir.children[currentNanoFile].type !== 'file') { dir.children[currentNanoFile] = { name: currentNanoFile, type: 'file', content: '' }; }
            dir.children[currentNanoFile].content = nanoContent.value;
            fm.refreshViews();
            saveStateDebounced(); // PERSIST
            nanoMsg.innerText = `[ Wrote: ${currentNanoFile} ]`;
            setTimeout(() => nanoMsg.innerText = "", 1800);
        };
        const nanoExit = () => {
            isNanoOpen = false;
            nanoDiv.classList.add('hidden');
            termContainer.classList.remove('hidden');
            appendLine(`<div class="terminal-exec">nano ${currentNanoFile} (closed)</div>`);
            createPromptLine();
        };

        winEl.onclick = () => { if (!isNanoOpen && currentInput) currentInput.focus(); else if(isNanoOpen) nanoContent.focus(); };

        const printHelp = () => {
            appendLine(`<div class="text-gray-400 leading-relaxed">
                <div class="text-white/80 mb-1">NEXUS Shell — commands</div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <div class="text-cyber-primary font-bold mb-1">SYSTEM</div>
                        <span class="terminal-exec">help</span> Show this help<br>
                        <span class="terminal-exec">clear</span> Clear terminal<br>
                        <span class="terminal-exec">exit</span> Close window<br>
                        <span class="terminal-exec">ps/top</span> Process list<br>
                        <span class="terminal-exec">neofetch</span> System info<br>
                        <span class="terminal-exec">open</span> Launch app<br>
                        <span class="terminal-exec">whoami</span> Current user<br>
                        <span class="terminal-exec">id</span> User/Group IDs<br>
                        <span class="terminal-exec">uname</span> Kernel info<br>
                        <span class="terminal-exec">date</span> System date<br>
                        <span class="terminal-exec">free</span> Memory usage<br>
                        <span class="terminal-exec">df</span> Disk usage<br>
                    </div>
                    <div>
                        <div class="text-cyber-primary font-bold mb-1">FILES</div>
                        <span class="terminal-exec">ls</span> List directory<br>
                        <span class="terminal-exec">cd</span> Change dir<br>
                        <span class="terminal-exec">pwd</span> Working dir<br>
                        <span class="terminal-exec">cat</span> Read file<br>
                        <span class="terminal-exec">nano</span> Edit file<br>
                        <span class="terminal-exec">cp/mv/rm</span> Copy/Move/Remove<br>
                        <span class="terminal-exec">mkdir</span> Make dir<br>
                        <span class="terminal-exec">rmdir</span> Remove dir<br>
                        <span class="terminal-exec">touch</span> Create file<br>
                        <span class="terminal-exec">tree</span> Tree view<br>
                        <span class="terminal-exec">echo</span> Print/Write file<br>
                    </div>
                </div>
                <div class="mt-2">
                    <div class="text-cyber-warning font-bold mb-1">=== NETWORK TOOLS ===</div>
                    <span class="terminal-exec">ip/ifconfig</span> Network config<br>
                    <span class="terminal-exec">ping</span> Check host<br>
                    <span class="terminal-exec">netstat</span> Connections<br>
                    <div class="text-cyber-warning font-bold mb-1 mt-2">=== WIFI SUITE ===</div>
                    <span class="terminal-exec">iwconfig</span> Show wireless interfaces<br>
                    <span class="terminal-exec">airmon-ng</span> <span class="text-gray-500">start/stop &lt;interface&gt;</span> (Monitor mode)<br>
                    <span class="terminal-exec">airodump-ng</span> <span class="text-gray-500">&lt;interface&gt;</span> (Scan networks)<br>
                    <span class="terminal-exec">aircrack-ng</span> <span class="text-gray-500">--deauth &lt;n&gt;</span> (Attack)<br>
                    <span class="terminal-exec">hashcat</span> <span class="text-gray-500">&lt;file.pcap&gt;</span> (Crack passwords)<br>
                </div>
            </div>`);
        };

        const parseEchoRedirect = (raw) => {
            const gt2 = raw.indexOf('>>');
            const gt1 = raw.indexOf('>');
            if (gt2 !== -1) {
                const left = raw.slice(0, gt2).trim();
                const right = raw.slice(gt2 + 2).trim();
                return { text: left.replace(/^echo\s+/,'').trim(), op: '>>', file: right };
            }
            if (gt1 !== -1) {
                const left = raw.slice(0, gt1).trim();
                const right = raw.slice(gt1 + 1).trim();
                return { text: left.replace(/^echo\s+/,'').trim(), op: '>', file: right };
            }
            return { text: raw.replace(/^echo\s+/,'').trim(), op: null, file: null };
        };

        const writeFile = (pathStr, content, mode) => {
            const full = resolvePath(pathStr);
            const { parent, name } = splitParentChild(full);
            const pdir = ensureDir(parent);
            if (!pdir) return { ok:false, err:`No such directory: ${fmtPath(parent)}` };
            if (!pdir.children) pdir.children = {};
            if (!pdir.children[name] || pdir.children[name].type !== 'file') {
                pdir.children[name] = { name, type: 'file', content: '' };
            }
            if (mode === '>>') pdir.children[name].content = (pdir.children[name].content || '') + (pdir.children[name].content ? '\n' : '') + content;
            else pdir.children[name].content = content;
            saveStateDebounced(); // PERSIST
            fm.refreshViews();
            return { ok:true };
        };

        const simulatePing = (host, count=4) => {
            const base = Math.floor(Math.random()*18)+8;
            let i = 0;
            const int = setInterval(() => {
                i++;
                const t = (10 + Math.random()*12).toFixed(1);
                appendLine(`<div class="text-gray-300">64 bytes from ${host}: icmp_seq=${i} ttl=54 time=${t} ms</div>`);
                if (i >= count) {
                    clearInterval(int);
                    const loss = Math.random() > 0.9 ? 25 : 0;
                    appendLine(`<div class="text-gray-400 mt-1">${count} packets transmitted, ${count - Math.round(loss/25)} received, ${loss}% packet loss</div>`);
                    stopRunningProcess();
                }
            }, 250);
            runningProcess = { stop: () => { clearInterval(int); }, name: 'ping' };
        };

        // --- COMMAND IMPLEMENTATIONS ---

        const runCommand = async (cmdString) => {
            const parts = cmdString.trim().split(/\s+/);
            const cmd = parts[0];
            const args = parts.slice(1);

            switch (cmd) {
                // --- SYSTEM ---
                case '': break;
                case 'help': printHelp(); break;
                case 'clear': termContainer.innerHTML = ''; break;
                case 'exit': wm.closeWindow(winEl.id.replace('win-', '')); return 'EXIT';
                case 'pwd': appendLine(`<div>${fmtPath(cwd)}</div>`); break;
                case 'date': appendLine(`<div class="text-gray-300">${new Date().toString()}</div>`); break;
                case 'whoami': appendLine(`<div>root</div>`); break;
                case 'id': appendLine(`<div class="text-gray-300">uid=0(root) gid=0(root) groups=0(root)</div>`); break;
                
                // --- NETWORK ---
                case 'ip':
                case 'ifconfig': appendLine(`<div class="whitespace-pre-wrap text-gray-300 font-mono">eth0: flags=4163... inet 10.0.0.x...</div>`); break;
                case 'ping': {
                    if (!args[0]) { appendLine(`<div class="terminal-error">ping: missing host</div>`); break; }
                    let count = 4;
                    const host = args[0] === '-c' ? (args[2] || '127.0.0.1') : args[0];
                    appendLine(`<div class="text-gray-400">PING ${host} (${host}) 56(84) bytes of data.</div>`);
                    simulatePing(host, count);
                    return 'ASYNC';
                }

                // --- WIFI SUITE ---
                case 'iwconfig': {
                    const mode = wifiState.mode === 'managed' ? 'Managed' : 'Monitor';
                    const name = wifiState.interface;
                    appendLine(`<div class="whitespace-pre-wrap text-gray-300 font-mono">
lo        no wireless extensions.

eth0      no wireless extensions.

${name}     IEEE 802.11  ESSID:off/any  
          Mode:${mode}  Frequency:2.412 GHz  Access Point: Not-Associated   
          Tx-Power=20 dBm   
          Retry short limit:7   RTS thr:off   Fragment thr:off
          Encryption key:off
          Power Management:on
</div>`);
                    break;
                }

                case 'airmon-ng': {
                    if (args[0] === 'start') {
                        if (args[1] !== 'wlan0') { appendLine(`<div class="terminal-error">Interface ${args[1] || ''} not found or chipset unsupported.</div>`); break; }
                        wifiState.mode = 'monitor';
                        wifiState.interface = 'wlan0mon';
                        appendLine(`<div class="text-gray-300">phy0\twlan0\t\tldmac\t\t(mac80211 station mode vif disabled for [phy0]wlan0)</div>`);
                        appendLine(`<div class="text-gray-300">\t\t(monitor mode enabled for [phy0]wlan0mon)</div>`);
                    } else if (args[0] === 'stop') {
                        if (args[1] !== 'wlan0mon') { appendLine(`<div class="terminal-error">Interface ${args[1] || ''} not monitor mode.</div>`); break; }
                        wifiState.mode = 'managed';
                        wifiState.interface = 'wlan0';
                        appendLine(`<div class="text-gray-300">phy0\twlan0mon\t\tldmac\t\t(monitor mode disabled)</div>`);
                    } else {
                        appendLine(`<div class="text-gray-300">PHY\tInterface\tDriver\t\tChipset</div>`);
                        appendLine(`<div class="text-gray-300">phy0\t${wifiState.interface}\t\tldmac\t\tCyberNet 802.11</div>`);
                    }
                    break;
                }

                case 'airodump-ng': {
                    if (args.length === 0) {
                        appendLine(`<div class="terminal-error">Usage: airodump-ng &lt;options&gt; &lt;interface&gt;</div>`);
                        break;
                    }
                    const iface = args[args.length - 1];
                    if (iface !== wifiState.interface) {
                         appendLine(`<div class="terminal-error">Interface ${iface} not found or not monitored.</div>`); 
                         break; 
                    }
                    if (wifiState.mode !== 'monitor') { appendLine(`<div class="terminal-error">Interface ${args[args.length-1]} must be in monitor mode.</div>`); break; }
                    
                    // Parse args
                    let outputFile = null;
                    let targetBssid = null;
                    let targetEssid = null;
                    
                    for(let i=0; i<args.length; i++){
                        if(args[i] === '-w') outputFile = args[i+1];
                        if(args[i] === '-b' || args[i] === '--bssid') targetBssid = args[i+1];
                        if(args[i] === '-e' || args[i] === '--essid') targetEssid = args[i+1];
                    }

                    // Create display area
                    const displayId = `airo-${Date.now()}`;
                    appendLine(`<div id="${displayId}" class="font-mono text-xs text-gray-300"></div>`);
                    const displayEl = document.getElementById(displayId);
                    // Hide history for "fullscreen" feel? Or just append. Real airodump clears.
                    termContainer.innerHTML = ''; 
                    termContainer.appendChild(displayEl);

                    return new Promise(resolve => {
                        const int = setInterval(() => {
                            // 1. Filter networks first
                            const list = (targetBssid || targetEssid) 
                                ? NETWORK_DB.filter(n => (targetBssid && n.bssid === targetBssid) || (targetEssid && n.ssid === targetEssid))
                                : NETWORK_DB;

                            // 2. Check Capture conditions
                            let handshakeText = "";
                            // Only capture if we are targeting specific networks (Scope mode)
                            if (targetBssid || targetEssid) {
                                // Find if any displayed network is being attacked
                                const attackedNet = list.find(n => n.bssid === activeAttacks.deauthTarget);
                                
                                if (attackedNet) {
                                     // Check if attack is recent (< 5 seconds ago)
                                     if (Date.now() - activeAttacks.deauthTime < 5000) {
                                         handshakeText = `[ WPA handshake: ${attackedNet.bssid} ]`;
                                         if (outputFile) {
                                             fm.saveHandshakeFile(`${outputFile}-01.cap`, `PCAP DATA\nBSSID: ${attackedNet.bssid}\nESSID: ${attackedNet.ssid}\nHANDSHAKE_CAPTURED=TRUE`);
                                             outputFile = null; // Save once
                                         }
                                     }
                                }
                            }

                            // 3. Render Table
                            let html = `<div class="mb-2">CH ${Math.floor(Math.random()*11)+1} ][ Elapsed: 12s ][ ${new Date().toISOString().slice(0,19)} ][ ${handshakeText ? '<span class="text-cyber-primary font-bold animate-pulse">'+handshakeText+'</span>' : ''}</div>`;
                            html += `<table class="terminal-table"><thead><tr><th>BSSID</th><th>PWR</th><th>Beacons</th><th>#Data</th><th>#/s</th><th>CH</th><th>MB</th><th>ENC</th><th>CIPHER</th><th>AUTH</th><th>ESSID</th></tr></thead><tbody>`;
                            
                            list.forEach(n => {
                                n.packets += Math.floor(Math.random()*2); // Sim traffic
                                html += `<tr><td>${n.bssid}</td><td>${n.pwr}</td><td>${Math.floor(n.packets/10)}</td><td>${n.packets}</td><td>${Math.floor(Math.random()*10)}</td><td>${n.ch}</td><td>54</td><td>${n.enc}</td><td>CCMP</td><td>PSK</td><td>${n.ssid}</td></tr>`;
                            });
                            html += `</tbody></table>`;

                            if (targetBssid || targetEssid) {
                                html += `<div class="mt-4 font-bold">STATIONS:</div><table class="terminal-table"><thead><tr><th>Station MAC</th><th>PWR</th><th>Rate</th><th>Lost</th><th>Frames</th><th>Probe</th></tr></thead><tbody>`;
                                list.forEach(n => {
                                    n.clients.forEach(c => {
                                        html += `<tr><td>${c}</td><td>-50</td><td>0-1e</td><td>0</td><td>${Math.floor(Math.random()*500)}</td><td>${n.ssid}</td></tr>`;
                                    });
                                });
                                html += `</tbody></table>`;
                            }

                            displayEl.innerHTML = html;
                        }, 500);

                        runningProcess = { 
                            name: 'airodump-ng', 
                            stop: () => { 
                                clearInterval(int); 
                                resolve(); 
                            } 
                        };
                    });
                }

                case 'aircrack-ng': {
                    if (args.includes('--deauth')) {
                        const idx = args.indexOf('--deauth');
                        const count = parseInt(args[idx+1]) || 0; // 0 = infinite
                        let bssid = null;
                        if (args.includes('-b')) bssid = args[args.indexOf('-b')+1];
                        if (args.includes('-e')) { 
                            const essid = args[args.indexOf('-e')+1];
                            const net = NETWORK_DB.find(n => n.ssid === essid);
                            if(net) bssid = net.bssid;
                        }

                        if (!bssid) { appendLine(`<div class="terminal-error">Please specify -b BSSID or -e ESSID.</div>`); break; }

                        appendLine(`<div class="text-gray-300">Sending deauth to station -- (FF:FF:FF:FF:FF:FF) on BSSID [${bssid}]</div>`);
                        activeAttacks.deauthTarget = bssid;
                        activeAttacks.deauthTime = Date.now();

                        return new Promise(resolve => {
                            let sent = 0;
                            const int = setInterval(() => {
                                sent++;
                                appendLine(`Deauth packet ${sent} sent successfully...`);
                                activeAttacks.deauthTime = Date.now(); // Keep updating time
                                if (count > 0 && sent >= count) {
                                    clearInterval(int);
                                    resolve();
                                }
                            }, 500);
                            runningProcess = { stop: () => { clearInterval(int); resolve(); }, name: 'aircrack-ng' };
                        });
                    } else {
                        // Crack mode (not requested but standard fallback)
                        appendLine(`<div class="terminal-error">Usage: aircrack-ng --deauth &lt;n&gt; ... (Crack mode handled by hashcat)</div>`);
                    }
                    break;
                }

                case 'hashcat': {
                    if (!args[0]) { appendLine(`<div class="terminal-error">hashcat: missing pcap file</div>`); break; }
                    const full = resolvePath(args[0]);
                    const node = getNode(full);
                    if (!node || !node.content.includes("HANDSHAKE_CAPTURED=TRUE")) {
                        appendLine(`<div class="terminal-error">File not found or no handshake in capture.</div>`);
                        break;
                    }
                    
                    // Extract SSID/BSSID from file content to find pass
                    const ssidMatch = node.content.match(/ESSID: (.+)/);
                    const ssid = ssidMatch ? ssidMatch[1] : null;
                    const net = NETWORK_DB.find(n => n.ssid === ssid);
                    const pass = net ? net.pass : "NOT_FOUND";

                    // Realistic fake output sequence
                    appendLine(`<div class="text-gray-300">hashcat (v6.2.6) starting...</div>`);
                    appendLine(`<div class="text-gray-300">OpenCL API (OpenCL 3.0 PoCL 3.1+debian) - Platform #1 [The POCL Project]</div>`);
                    appendLine(`<div class="text-gray-300">========================================================================</div>`);
                    appendLine(`<div class="text-gray-300">* Device #1: pthread-Intel(R) Core(TM) i9-9900K CPU @ 3.60GHz, 2874/5813 MB (1024 MB allocatable), 4MCU</div>`);
                    
                    return new Promise(resolve => {
                        let step = 0;
                        const totalSteps = 15;
                        
                        const int = setInterval(() => {
                            step++;
                            if (step === 1) {
                                appendLine(`<div class="text-gray-400">Hashes: 1 digests; 1 unique digests, 1 unique salts</div>`);
                                appendLine(`<div class="text-gray-400">Bitmaps: 16 bits, 65536 entries, 0x0000ffff mask, 262144 bytes, 5/13 rotates</div>`);
                            }
                            if (step === 3) appendLine(`<div class="text-yellow-400">Dictionary Cache Hit: Skipping wordlist (rockyou.txt)...</div>`);
                            
                            if (step > 3 && step < totalSteps) {
                                // Progress lines
                                const progress = Math.floor((step / totalSteps) * 100);
                                const speed = (Math.random() * 200 + 15000).toFixed(0);
                                const temp = 65 + Math.floor(Math.random() * 10);
                                
                                // Replace last line logic simulation (append new one for simplicity in this terminal)
                                // In a real terminal we might clear line, here we just output periodical status
                                if (step % 3 === 0) {
                                    appendLine(`<div class="text-gray-500">
Session..........: hashcat
Status...........: Running
Hash.Name........: WPA-EAPOL-PBKDF2
Hash.Target......: ${ssid} (00:11:22:33:44:55)
Time.Started.....: ${new Date().toLocaleTimeString()} (1 min, 2 secs)
Time.Estimated...: ${new Date(Date.now() + 60000).toLocaleTimeString()} (58 secs)
Speed.#1.........: ${speed} H/s
Recovered........: 0/1 (0.00%) Digests
Progress.........: ${progress * 12340}/${1500000} (${progress}%)
Temp.#1..........: ${temp}c
</div>`);
                                }
                            }

                            if (step >= totalSteps) {
                                clearInterval(int);
                                appendLine(`<div class="text-green-400 font-bold mt-2">Cracked</div>`);
                                appendLine(`<div class="text-white bg-green-900/30 p-1 border border-green-500/50 inline-block mt-1">${ssid}:${pass}</div>`);
                                appendLine(`<div class="text-gray-400 mt-2">Session..........: hashcat</div>`);
                                appendLine(`<div class="text-green-400">Status...........: Cracked</div>`);
                                resolve();
                            }
                        }, 800); // speed of simulation
                        
                        runningProcess = { stop: () => { clearInterval(int); resolve(); }, name: 'hashcat' };
                    });
                }

                // --- FILES ---
                case 'ls': {
                    const targetPath = args[0] ? resolvePath(args[0]) : cwd;
                    const dir = ensureDir(targetPath);
                    if (dir && dir.children) {
                        const items = listDir(dir).map(i => {
                            const col = i.type === 'folder' ? 'terminal-dir' : (i.name.endsWith('.sh') ? 'terminal-exec' : 'terminal-file');
                            return `<span class="${col} mr-4">${i.name}</span>`;
                        });
                        appendLine(`<div>${items.join('')}</div>`);
                    } else appendLine(`<div class="terminal-error">ls: cannot access '${args[0] || ''}': No such directory</div>`);
                    break;
                }
                case 'cd': {
                    const newPath = resolvePath(args[0] || '~');
                    const dir = ensureDir(newPath);
                    if (dir) { cwd = newPath; }
                    else appendLine(`<div class="terminal-error">cd: ${args[0] || ''}: No such directory</div>`);
                    break;
                }
                case 'mkdir': {
                    if (!args[0]) { appendLine(`<div class="terminal-error">mkdir: missing operand</div>`); break; }
                    const full = resolvePath(args[0]); const { parent, name } = splitParentChild(full); const pdir = ensureDir(parent);
                    if (pdir && !pdir.children[name]) { pdir.children[name] = { name, type: 'folder', children: {} }; fm.refreshViews(); saveStateDebounced(); }
                    break;
                }
                case 'touch': {
                    if (!args[0]) { appendLine(`<div class="terminal-error">touch: missing operand</div>`); break; }
                    const full = resolvePath(args[0]); const { parent, name } = splitParentChild(full); const pdir = ensureDir(parent);
                    if (pdir) { pdir.children[name] = { name, type: 'file', content: '' }; fm.refreshViews(); saveStateDebounced(); }
                    break;
                }
                case 'cat': {
                    if (!args[0]) { appendLine(`<div class="terminal-error">cat: missing operand</div>`); break; }
                    const node = getNode(resolvePath(args[0]));
                    if (node && node.type === 'file') appendLine(`<div class="whitespace-pre-wrap">${node.content || ''}</div>`);
                    else appendLine(`<div class="terminal-error">cat: ${args[0]}: No such file</div>`);
                    break;
                }
                case 'nano': {
                    if (!args[0]) { appendLine(`<div class="terminal-error">nano: missing filename</div>`); break; }
                    isNanoOpen = true; currentNanoFile = args[0];
                    const dir = ensureDir(cwd);
                    if (!dir) { appendLine(`<div class="terminal-error">nano: invalid CWD</div>`); isNanoOpen = false; break; }
                    if (!dir.children) dir.children = {};
                    const fileNode = dir.children[currentNanoFile];
                    if (!fileNode) dir.children[currentNanoFile] = { name: currentNanoFile, type: 'file', content: '' };
                    nanoFilename.innerText = `File: ${currentNanoFile}`;
                    nanoContent.value = (dir.children[currentNanoFile].content || '');
                    termContainer.classList.add('hidden');
                    nanoDiv.classList.remove('hidden');
                    nanoContent.focus();
                    return 'ASYNC'; // Special signal
                }
                case 'cp': {
                    if (!args[0] || !args[1]) { appendLine(`<div class="terminal-error">cp: missing operand</div>`); break; }
                    const recursive = args.includes('-r') || args.includes('-R');
                    const cleanArgs = args.filter(a => a !== '-r' && a !== '-R');
                    const srcStr = cleanArgs[0];
                    const dstStr = cleanArgs[1];
                    const src = resolvePath(srcStr);
                    const dst = resolvePath(dstStr);
                    const srcNode = getNode(src);
                    if (!srcNode) { appendLine(`<div class="terminal-error">cp: cannot stat '${srcStr}': No such file or directory</div>`); break; }
                    if (srcNode.type === 'folder' && !recursive) { appendLine(`<div class="terminal-error">cp: -r not specified; omitting directory '${srcStr}'</div>`); break; }
                    const cloned = deepCloneNode(srcNode);
                    const dstNode = getNode(dst);
                    if (dstNode && dstNode.type === 'folder') {
                        if (!dstNode.children) dstNode.children = {};
                        if (dstNode.children[cloned.name]) { appendLine(`<div class="terminal-error">cp: cannot copy: '${dstStr}/${cloned.name}' exists</div>`); break; }
                        dstNode.children[cloned.name] = cloned;
                        fm.refreshViews();
                        break;
                    }
                    const { parent: dp, name: dn } = splitParentChild(dst);
                    const dstParent = ensureDir(dp);
                    if (!dstParent) { appendLine(`<div class="terminal-error">cp: cannot copy to '${dstStr}': No such directory</div>`); break; }
                    if (!dstParent.children) dstParent.children = {};
                    if (dstParent.children[dn]) { appendLine(`<div class="terminal-error">cp: cannot copy to '${dstStr}': Target exists</div>`); break; }
                    cloned.name = dn;
                    dstParent.children[dn] = cloned;
                    fm.refreshViews();
                    saveStateDebounced();
                    break;
                }
                case 'mv': {
                    if (!args[0] || !args[1]) { appendLine(`<div class="terminal-error">mv: missing operand</div>`); break; }
                    const src = resolvePath(args[0]);
                    const dst = resolvePath(args[1]);
                    const srcNode = getNode(src);
                    if (!srcNode) { appendLine(`<div class="terminal-error">mv: cannot stat '${args[0]}': No such file or directory</div>`); break; }
                    const { parent: sp, name: sn } = splitParentChild(src);
                    const srcParent = ensureDir(sp);
                    if (!srcParent) { appendLine(`<div class="terminal-error">mv: invalid source</div>`); break; }
                    const dstNode = getNode(dst);
                    if (dstNode && dstNode.type === 'folder') {
                        if (dstNode.children?.[sn]) { appendLine(`<div class="terminal-error">mv: cannot move '${args[0]}' to '${args[1]}': Target exists</div>`); break; }
                        moveNode(srcParent, sn, dstNode, sn);
                        fm.refreshViews();
                        break;
                    }
                    const { parent: dp, name: dn } = splitParentChild(dst);
                    const dstParent = ensureDir(dp);
                    if (!dstParent) { appendLine(`<div class="terminal-error">mv: cannot move to '${args[1]}': No such directory</div>`); break; }
                    if (!dstParent.children) dstParent.children = {};
                    if (dstParent.children[dn]) { appendLine(`<div class="terminal-error">mv: cannot overwrite '${args[1]}': Target exists</div>`); break; }
                    moveNode(srcParent, sn, dstParent, dn);
                    fm.refreshViews();
                    saveStateDebounced();
                    break;
                }
                case 'rm': {
                    if (!args[0]) { appendLine(`<div class="terminal-error">rm: missing operand</div>`); break; }
                    let force = false, recursive = false, target = null;
                    const flags = args.filter(a => a.startsWith('-'));
                    const rest = args.filter(a => !a.startsWith('-'));
                    if (flags.includes('-f')) force = true;
                    if (flags.includes('-r') || flags.includes('-R') || flags.includes('-rf') || flags.includes('-fr')) recursive = true;
                    if (flags.includes('-rf') || flags.includes('-fr')) { recursive = true; force = true; }
                    if (args[0] === '-rf' && args[1]) { recursive = true; force = true; target = args[1]; }
                    if (!target) target = rest[0];
                    const full = resolvePath(target);
                    const { parent, name } = splitParentChild(full);
                    const pdir = ensureDir(parent);
                    if (!pdir || !pdir.children?.[name]) {
                        if (!force) appendLine(`<div class="terminal-error">rm: cannot remove '${target}': No such file or directory</div>`);
                        break;
                    }
                    const node = pdir.children[name];
                    if (node.type === 'folder' && !recursive) {
                        appendLine(`<div class="terminal-error">rm: cannot remove '${target}': Is a directory (use -r)</div>`);
                        break;
                    }
                    removeRecursive(pdir, name);
                    fm.refreshViews();
                    saveStateDebounced();
                    break;
                }
                case 'rmdir': {
                    if (!args[0]) { appendLine(`<div class="terminal-error">rmdir: missing operand</div>`); break; }
                    const full = resolvePath(args[0]);
                    const { parent, name } = splitParentChild(full);
                    const pdir = ensureDir(parent);
                    if (!pdir || !pdir.children?.[name]) { appendLine(`<div class="terminal-error">rmdir: failed to remove '${args[0]}': No such directory</div>`); break; }
                    const node = pdir.children[name];
                    if (node.type !== 'folder') { appendLine(`<div class="terminal-error">rmdir: failed to remove '${args[0]}': Not a directory</div>`); break; }
                    if (node.children && Object.keys(node.children).length > 0) { appendLine(`<div class="terminal-error">rmdir: failed to remove '${args[0]}': Directory not empty</div>`); break; }
                    delete pdir.children[name];
                    fm.refreshViews();
                    saveStateDebounced();
                    break;
                }
                case 'open': wm.openWindow(args[0]); break;
                case 'echo': {
                    const parsed = parseEchoRedirect(cmdString); // Use raw string for echo parsing
                    if (parsed.op) {
                        const res = writeFile(parsed.file, parsed.text, parsed.op);
                        if (!res.ok) appendLine(`<div class="terminal-error">echo: ${res.err}</div>`);
                    } else {
                        appendLine(`<div class="text-gray-300">${parsed.text}</div>`);
                    }
                    break;
                }
                case 'ps': {
                    const rows = [['PID','TTY','TIME','CMD'],['1','?','00:00:02','init'],['112','?','00:00:09','matrix_render'],['142','?','00:00:03','nexus_daemon'],['551','?','00:00:25','docker_vm'],['771','pts/0','00:00:01','net_sniffer'],['991','pts/0','00:00:00','sys_monitor'],['1337','pts/0','00:00:00','nexus-sh']];
                    const text = rows.map(r => r.map((c,i)=>c.toString().padEnd(i===3?0:10,' ')).join(' ')).join('\n');
                    appendLine(`<div class="whitespace-pre-wrap text-gray-300 font-mono">${text}</div>`);
                    break;
                }
                case 'top': {
                    const cpu = (Math.random()*40+10).toFixed(1);
                    appendLine(`<div class="whitespace-pre-wrap text-gray-300 font-mono">top - ${new Date().toLocaleTimeString('es-ES',{hour12:false})} up... Tasks: 124... %Cpu(s): ${cpu}...</div>`); 
                    break;
                }
                case 'free': appendLine(`<div class="whitespace-pre-wrap text-gray-300 font-mono">Mem: 65536... Swap: 8192...</div>`); break;
                case 'df': appendLine(`<div class="whitespace-pre-wrap text-gray-300 font-mono">Filesystem... /dev/nexus0...</div>`); break;
                case 'netstat': appendLine(`<div class="whitespace-pre-wrap text-gray-300 font-mono">tcp 0 0 0.0.0.0:22...</div>`); break;
                case 'tree': {
                    const targetPath = args[0] ? resolvePath(args[0]) : cwd;
                    const root = ensureDir(targetPath);
                    if (!root) { appendLine(`<div class="terminal-error">tree: ${args[0] || ''}: No such directory</div>`); break; }
                    const lines = [];
                    const walk = (dir, prefix = '') => {
                        const entries = listDir(dir);
                        entries.forEach((it, idx) => {
                            const isLast = idx === entries.length - 1;
                            const branch = isLast ? '└── ' : '├── ';
                            lines.push(`${prefix}${branch}${it.type === 'folder' ? it.name + '/' : it.name}`);
                            if (it.type === 'folder') walk(it, prefix + (isLast ? '    ' : '│   '));
                        });
                    };
                    lines.push(`${(args[0] || '.')} ${fmtPath(targetPath)}`);
                    walk(root);
                    appendLine(`<div class="whitespace-pre-wrap text-gray-300 font-mono">${lines.join('\n')}</div>`);
                    break;
                }
                case 'neofetch': {
                    const p = fmtPath(cwd).replace('/home/root', '~');
                    appendLine(`<div class="text-gray-300 whitespace-pre-wrap font-mono">
      _   _ _______  __  __  ____
     | \ | | ____\ \/ / |  \/  /\ \
     |  \| |  _|  \  /  | |\/| |  \ \
     | |\  | |___ /  \  | |  | |  / /
     |_| \_|_____/_/\_\ |_|  |_| /_/

  OS: NEXUS Cyber Desktop
  Host: QUANTUM CORE i9-9900K
  Kernel: 6.6.6-nexus
  Uptime: ${(Math.random()*5+1).toFixed(1)}h
  Packages: ${Math.floor(Math.random()*800)+900}
  Shell: nexus-sh
  Resolution: ${window.innerWidth}x${window.innerHeight}
  WM: NEXUS Glass
  Terminal: NexusTerm
  CWD: ${p}
</div>`);
                    break;
                }
                case 'files': wm.openWindow('files'); break;
                case 'wifi': wm.openWindow('wifi'); break;
                case 'network': wm.openWindow('network'); break;
                case 'sysmon': wm.openWindow('sysmon'); break;
                case 'cracker': wm.openWindow('cracker'); break;
                case 'decrypt': wm.openWindow('decrypt'); break;
                case 'terminal': wm.openWindow('terminal'); break;

                default: appendLine(`<div class="terminal-error">${cmd}: command not found</div>`);
            }
        };

        const handleInputKey = async (e) => {
            if (isNanoOpen) return;
            const input = e.target;

            if (e.key === 'Enter') {
                const raw = input.value;
                const trimmed = raw.trim();

                // Replace input with static text
                const parent = input.parentElement;
                parent.innerHTML = `${getPromptHtml()} ${raw}`;

                if (trimmed) { 
                    history.push(raw); 
                    historyIndex = history.length; 
                    
                    // Split by ;
                    const commands = trimmed.split(';');
                    for (const cmd of commands) {
                        if (cmd.trim()) {
                            const result = await runCommand(cmd);
                            if (result === 'EXIT') return;
                            if (result === 'ASYNC') return; // Wait for external exit (nano/ping)
                        }
                    }
                }

                createPromptLine();

            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (historyIndex > 0) { historyIndex--; input.value = history[historyIndex]; }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (historyIndex < history.length - 1) { historyIndex++; input.value = history[historyIndex]; }
                else { historyIndex = history.length; input.value = ''; }
            } else if (e.key === 'Tab') {
                e.preventDefault();
                const raw = input.value;
                // Basic Tab Completion Logic
                const parts = raw.split(/\s+/);
                const lastArg = parts[parts.length - 1];
                const isCommand = parts.length === 1;

                if (isCommand) {
                    const matches = COMMANDS.filter(c => c.startsWith(lastArg));
                    if (matches.length === 1) {
                        input.value = matches[0] + ' ';
                    } else if (matches.length > 1) {
                        appendLine(`<div class="text-gray-500">${matches.join('  ')}</div>`);
                        // don't create new prompt, just let user continue typing
                    }
                } else {
                    // Path completion
                    let dirPath, partial;
                    if (lastArg.includes('/')) {
                        const slashIdx = lastArg.lastIndexOf('/');
                        dirPath = lastArg.substring(0, slashIdx) || '/';
                        partial = lastArg.substring(slashIdx + 1);
                    } else {
                        dirPath = '.';
                        partial = lastArg;
                    }

                    // Resolve directory
                    let searchPath = resolvePath(dirPath);
                    let dirNode = ensureDir(searchPath);
                    
                    if (dirNode && dirNode.children) {
                        const options = Object.keys(dirNode.children).filter(k => k.startsWith(partial));
                        if (options.length === 1) {
                            const completed = options[0];
                            const isDir = dirNode.children[completed].type === 'folder';
                            // Reconstruct path
                            let newArg;
                            if (dirPath === '.') newArg = completed;
                            else if (dirPath === '/') newArg = '/' + completed;
                            else newArg = dirPath + '/' + completed;
                            
                            if (isDir) newArg += '/';
                            
                            parts[parts.length - 1] = newArg;
                            input.value = parts.join(' ');
                        } else if (options.length > 1) {
                            appendLine(`<div class="text-gray-500">${options.join('  ')}</div>`);
                        }
                    }
                }
            }
        };

        // Initialize First Prompt
        createPromptLine();

        // Nano Shortcut Listeners (Local)
        const nanoKeyHandler = (e) => {
            if (!isNanoOpen) return;
            if (e.ctrlKey && e.key.toLowerCase() === 'o') { e.preventDefault(); nanoSave(); }
            if (e.ctrlKey && e.key.toLowerCase() === 'x') { e.preventDefault(); nanoExit(); }
        };
        winEl.addEventListener('keydown', nanoKeyHandler);
    }
}

const wm = new WindowManager();

// --- SEARCH ---
const searchInput = document.getElementById('start-search');
const appList = document.getElementById('app-list');
const searchableItems = [
    { name: 'Terminal', icon: 'terminal', action: () => wm.openWindow('terminal') },
    { name: 'File Explorer', icon: 'folder-open', action: () => wm.openWindow('files') },
    { name: 'Files', icon: 'folder-open', action: () => wm.openWindow('files') },
    { name: 'System Monitor', icon: 'cpu', action: () => wm.openWindow('sysmon') },
    { name: 'Network Map', icon: 'globe', action: () => wm.openWindow('network') },
    { name: 'Decryptor', icon: 'lock', action: () => wm.openWindow('decrypt') },
    { name: 'WiFi Scanner', icon: 'wifi', action: () => wm.openWindow('wifi') },
    { name: 'Cracker', icon: 'unlock', action: () => wm.openWindow('cracker') },
    { name: 'Mission Brief', icon: 'file-text', action: () => wm.openEditor({ name: 'mission_brief.txt', content: "..." }) }
];

function renderSearchResults(query = "") {
    appList.innerHTML = '';
    const filtered = searchableItems.filter(item => item.name.toLowerCase().includes(query.toLowerCase()));
    if (filtered.length === 0) {
        appList.innerHTML = '<div class="text-center text-gray-500 py-4 italic">No results</div>';
        return;
    }
    filtered.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = "flex items-center gap-3 p-2 hover:bg-white/10 rounded cursor-pointer group";
        if (index === 0 && query !== "") div.classList.add('bg-white/5');
        div.innerHTML = `<div class="bg-black/40 p-1.5 rounded border border-white/5"><i data-lucide="${item.icon}" class="w-4 h-4 text-gray-300 group-hover:text-cyber-primary"></i></div><span class="text-gray-300 group-hover:text-white">${item.name}</span>`;
        div.onclick = () => { item.action(); hideAllPopups(); searchInput.value = ''; };
        appList.appendChild(div);
    });
    lucide.createIcons();
}

searchInput.addEventListener('input', (e) => renderSearchResults(e.target.value));
searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const first = appList.firstElementChild;
        if (first) first.click();
    }
});
renderSearchResults();

function updateLineNumbers(textarea) {
    const lines = textarea.value.split('\n').length;
    document.getElementById('line-numbers').innerHTML = Array(lines).fill(0).map((_, i) => i + 1).join('<br>');
    const val = textarea.value.substr(0, textarea.selectionStart);
    const line = val.split('\n').length;
    const col = val.split('\n').pop().length + 1;
    document.getElementById('ln-col').innerText = line;
    document.getElementById('cl-col').innerText = col;
}

function checkSave(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        fm.saveCurrentFile();
    }
}

// --- GLOBAL FUNCTION FOR DECRYPTOR ---
function startDecryption() {
    const win = document.getElementById('win-decrypt');
    if (!win) return;

    const btn = win.querySelector('button');
    const bar = win.querySelector('#decrypt-bar');
    const percent = win.querySelector('#decrypt-percent');
    const hash = win.querySelector('#decrypt-hash');
    const spinner = win.querySelector('.animate-spin');

    if (btn) btn.disabled = true;

    let p = 0;
    const interval = setInterval(() => {
        p += Math.random() * 1.5;
        if (p >= 100) {
            p = 100;
            clearInterval(interval);
            if (hash) {
                hash.innerText = "ACCESS GRANTED";
                hash.className = "text-center pt-2 font-bold text-cyber-success text-lg animate-pulse";
            }
            if (spinner) spinner.classList.remove('animate-spin');
            if (btn) { btn.innerText = "COMPLETED"; btn.classList.add('bg-cyber-success', 'text-black', 'border-cyber-success'); }
        } else {
            if (hash) hash.innerText = Array.from({ length: 4 }, () => Math.floor(Math.random() * 255).toString(16)).join(' ').toUpperCase();
        }
        if (bar) bar.style.width = p + '%';
        if (percent) percent.innerText = Math.floor(p) + '%';
    }, 100);
}

// --- BOOT ---
const bootText = document.getElementById('boot-text');
const bootScreen = document.getElementById('boot-screen');
const desktopArea = document.getElementById('desktop-area');
const taskbar = document.getElementById('taskbar');
const bootMessages = [
    "BIOS DATE 01/15/2034 14:22:51 VER: 1.0.22",
    "CPU: QUANTUM CORE i9-9900K @ 8.0GHz",
    "Memory Test: 65536K OK",
    "Detecting Primary Master ... NEXUS SSD 20TB",
    "Detecting Primary Slave ... NONE",
    " ",
    "Loading Kernel Modules...",
    "[ OK ] Filesystem mounted.",
    "[ OK ] Network interface eth0 up.",
    "[ OK ] Security daemon loaded.",
    "[ OK ] Graphic engine initialized.",
    " ",
    "Starting NEXUS OS Environment...",
    "AUTHENTICATING USER..."
];

async function typeWriter(text, el, speed = 5) {
    return new Promise(r => {
        let i = 0;
        function t() {
            if (i < text.length) { el.innerHTML += text.charAt(i++); setTimeout(t, speed); }
            else { el.innerHTML += '<br>'; r(); }
        }
        t();
    });
}

async function runBootSequence() {
    if (hasSavedSession) {
        bootMessages.push(" ", "Loading previous session...", "Restoring windows state...", "DONE.");
    }

    for (let m of bootMessages) {
        // Simple ellipsis animation logic for "Loading..." messages
        if (m.includes("Loading previous")) {
             const div = document.createElement('div');
             div.innerText = m;
             bootText.appendChild(div);
             bootScreen.scrollTop = bootScreen.scrollHeight;
             await new Promise(r => setTimeout(r, 600));
             div.innerText += ".";
             await new Promise(r => setTimeout(r, 600));
             div.innerText += ".";
             await new Promise(r => setTimeout(r, 600));
        } else {
            await typeWriter(m, bootText);
            bootScreen.scrollTop = bootScreen.scrollHeight;
            await new Promise(r => setTimeout(r, 20));
        }
    }
    setTimeout(() => {
        bootScreen.style.opacity = '0';
        setTimeout(() => bootScreen.remove(), 1000);
        desktopArea.classList.remove('hidden');
        desktopArea.style.opacity = '1';
        taskbar.classList.remove('hidden');
        fm.init();
        
        // Restore windows AFTER FileManager is ready
        if (savedWindows.length > 0) {
            wm.restoreSession(savedWindows);
        }
        
        lucide.createIcons();
        setInterval(() => {
            const el = document.getElementById('clock');
            if(el) el.innerText = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        }, 1000);
    }, 500);
}

// --- MATRIX RAIN EFFECT ---
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');
let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;
window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
});
const cols = Math.floor(width / 20) + 1;
const ypos = Array(cols).fill(0);
function matrix() {
    ctx.fillStyle = '#0001';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#00f0ff';
    ctx.font = '12px monospace';
    ypos.forEach((y, ind) => {
        const text = String.fromCharCode(Math.random() * 128);
        const x = ind * 20;
        ctx.fillText(text, x, y);
        if (y > 100 + Math.random() * 10000) ypos[ind] = 0;
        else ypos[ind] = y + 20;
    });
}
setInterval(matrix, 50);

window.onload = runBootSequence;
