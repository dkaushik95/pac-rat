import { app, BrowserWindow, ipcMain, shell, protocol, net } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { spawn, exec } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Register scheme as privileged
protocol.registerSchemesAsPrivileged([
    { scheme: 'app-icon', privileges: { bypassCSP: true, secure: true, supportFetchAPI: true } }
]);

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        frame: false, // Frameless for custom Cyber-HUD look
        transparent: true, // Allow transparency for advanced effects
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false, // Disable sandbox to ensure preload works with ESM
        },
        // Cyber-HUD vibe: dark background
        backgroundColor: '#00000000'
    });

    // Open DevTools for debugging
    // mainWindow.webContents.openDevTools({ mode: 'detach' });

    // Load the index.html from the dist folder in production or the dev server in development.
    if (process.env.VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else {
        // In production (or when built)
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}

app.whenReady().then(() => {
    // Handle app-icon:// protocol
    protocol.handle('app-icon', (request) => {
        const url = request.url.replace('app-icon://', '');
        // Decode URL to handle spaces and special chars
        const iconPath = decodeURIComponent(url);

        // Basic security check: ensure it's an absolute path
        if (!path.isAbsolute(iconPath)) {
            return new Response('Bad Request', { status: 400 });
        }

        return net.fetch('file://' + iconPath);
    });

    // Ensure cache directory exists
    const cacheDir = path.join(app.getPath('userData'), 'icon-cache');
    if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
    }

    setupHandlers(cacheDir);
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

function setupHandlers() {
    // Search Handler
    // Search Handler
    ipcMain.handle('pacman:search', async (_, query) => {
        if (!query || query.trim().length === 0) return [];

        try {
            // 1. Run pacman -Ss
            const searchResults = await new Promise((resolve) => {
                exec(`pacman -Ss ${query}`, (error, stdout, stderr) => {
                    if (error && error.code !== 1) { // code 1 means no results usually
                        console.error("Search error:", error);
                        // If it's just no results, return empty
                        if (stderr && stderr.includes('no targets found')) return resolve([]);
                        return resolve([]);
                    }

                    const results = [];
                    const lines = stdout.split('\n');
                    let currentPkg = null;

                    for (const line of lines) {
                        if (!line) continue;
                        if (!line.startsWith('    ')) {
                            // Header line: repo/name version [installed]
                            const parts = line.split(' ');
                            const [repoName, version] = parts;
                            if (!repoName || !version) continue;

                            const [repo, name] = repoName.split('/');
                            const isInstalled = line.includes('[installed]');

                            currentPkg = {
                                repo,
                                name,
                                version,
                                installed: isInstalled,
                                description: ''
                            };
                            results.push(currentPkg);
                        } else if (currentPkg) {
                            // Description line
                            currentPkg.description = line.trim();
                        }
                    }
                    resolve(results);
                });
            });

            if (searchResults.length === 0) return [];

            // 2. Fetch details (URL) for packages
            // Split into chunks to avoid command line length limits
            const CHUNK_SIZE = 50;
            const names = searchResults.map(p => p.name);
            const urlMap = {};

            for (let i = 0; i < names.length; i += CHUNK_SIZE) {
                const chunk = names.slice(i, i + CHUNK_SIZE);
                await new Promise(resolve => {
                    exec(`pacman -Si ${chunk.join(' ')}`, { maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
                        // Ignore exit code errors (1) as some packages might be local-only or fail
                        if (stdout) {
                            const lines = stdout.split('\n');
                            let currentName = null;
                            for (const line of lines) {
                                const trimmed = line.trim();
                                if (trimmed.startsWith('Name')) {
                                    // Name            : package-name
                                    const parts = trimmed.split(':');
                                    if (parts.length >= 2) currentName = parts[1].trim();
                                } else if (trimmed.startsWith('URL') && currentName) {
                                    // URL             : https://...
                                    const parts = trimmed.split(':');
                                    // Handle URLs with colons (https://)
                                    if (parts.length >= 2) {
                                        // Re-join in case of extra colons, though usually it's just "URL : value"
                                        // simpler: substring from first colon
                                        const urlVal = line.substring(line.indexOf(':') + 1).trim();
                                        urlMap[currentName] = urlVal;
                                    }
                                    currentName = null;
                                }
                            }
                        }
                        resolve();
                    });
                });
            }

            // Merge URLs
            return searchResults.map(p => ({
                ...p,
                url: urlMap[p.name] || null
            }));

        } catch (err) {
            console.error("Search Handler Error:", err);
            return [];
        }
    });

    // Install Handler
    ipcMain.on('pacman:install', (event, packageName) => {
        // Use pkexec + pacman. 
        // We can't easily stream progress from pkexec pacman in non-interactive mode nicely without some hacks.
        // But for now, we'll just try to capture stdout.
        const child = spawn('pkexec', ['pacman', '-S', packageName, '--noconfirm']);

        child.stdout.on('data', (data) => {
            const text = data.toString();
            event.reply('install:progress', text);
        });

        child.stderr.on('data', (data) => {
            const text = data.toString();
            console.error('stderr:', text);
            event.reply('install:progress', text);
        });

        child.on('close', (code) => {
            event.reply('install:complete', code === 0);
        });
    });

    // Installed Packages Handler
    ipcMain.handle('pacman:installed', async () => {
        return new Promise((resolve, reject) => {
            // -Qe: Query Explicitly installed
            // -i: Info (detailed)
            exec('pacman -Qei', { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => { // Increase buffer for large output
                if (error) {
                    console.error("Installed fetch error:", error);
                    return reject(error);
                }

                const packages = [];
                let currentPkg = {};

                const lines = stdout.split('\n');
                for (const line of lines) {
                    if (line.trim() === '') {
                        // Empty line usually separates packages in -Qi output
                        if (currentPkg.name) {
                            packages.push(currentPkg);
                            currentPkg = {};
                        }
                        continue;
                    }

                    // Parse "Key : Value"
                    const separatorIndex = line.indexOf(':');
                    if (separatorIndex > -1) {
                        const key = line.substring(0, separatorIndex).trim();
                        const value = line.substring(separatorIndex + 1).trim();

                        if (key === 'Name') currentPkg.name = value;
                        if (key === 'Version') currentPkg.version = value;
                        if (key === 'Description') currentPkg.description = value;
                        if (key === 'URL') currentPkg.url = value;
                        if (key === 'Install Date') currentPkg.installDate = value;
                        if (key === 'Installed Size') currentPkg.installedSize = value;
                    }
                }
                // Push last one if exists
                if (currentPkg.name) packages.push(currentPkg);

                // Add "installed: true" to all
                resolve(packages.map(p => ({ ...p, installed: true, repo: 'local' })));
            });
        });
    });

    // Uninstall Handler
    ipcMain.on('pacman:uninstall', (event, packageName) => {
        const child = spawn('pkexec', ['pacman', '-Rns', packageName, '--noconfirm']);

        child.stdout.on('data', (data) => {
            const text = data.toString();
            event.reply('install:progress', text); // Reusing install progress channel
        });

        child.stderr.on('data', (data) => {
            const text = data.toString();
            console.error('stderr:', text);
            event.reply('install:progress', text);
        });

        child.on('close', (code) => {
            event.reply('install:complete', code === 0);
        });
    });

    // Open External Link
    ipcMain.on('open-external', (_, url) => {
        if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
            shell.openExternal(url);
        }
    });

    // Window Controls
    ipcMain.on('window:minimize', (event) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        if (win) win.minimize();
    });

    ipcMain.on('window:maximize', (event) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        if (win) {
            if (win.isMaximized()) {
                win.unmaximize();
            } else {
                win.maximize();
            }
        }
    });

    ipcMain.on('window:close', (event) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        if (win) win.close();
    });

    // Get Apps Handler
    ipcMain.handle('os:get-apps', async () => {
        const appsDir = '/usr/share/applications';
        const apps = [];

        try {
            const files = await fs.promises.readdir(appsDir);
            for (const file of files) {
                if (!file.endsWith('.desktop')) continue;

                try {
                    const content = await fs.promises.readFile(path.join(appsDir, file), 'utf-8');
                    const app = parseDesktopFile(content, file);
                    // Filter for GUI apps (usually have Category) and valid Name
                    if (app && app.name && !app.noDisplay) {
                        if (app.icon) {
                            app.iconPath = await findIconPath(app.icon);
                        }
                        app.installed = true; // Mark as installed since it's in /usr/share/applications
                        apps.push(app);
                    }
                } catch (err) {
                    console.warn(`Failed to parse ${file}`, err);
                }
            }
        } catch (err) {
            console.error("Error reading apps dir", err);
        }
        return apps;
    });

    // Get Details Handler
    ipcMain.handle('pacman:get-details', async (_, { name, installed }) => {
        return new Promise((resolve, reject) => {
            // If installed, use -Qi, else -Si
            const cmd = installed ? `pacman -Qi ${name}` : `pacman -Si ${name}`;

            exec(cmd, (error, stdout, stderr) => {
                if (error) {
                    if (stderr && (stderr.includes('not found') || stderr.includes('could not find'))) {
                        return resolve(null); // Expected for unknown packages
                    }
                    console.error("Details fetch error:", error);
                    return resolve(null); // Return null on error so UI can handle gracefully
                }

                const details = {};
                const lines = stdout.split('\n');
                for (const line of lines) {
                    const separator = line.indexOf(':');
                    if (separator > -1) {
                        const key = line.substring(0, separator).trim();
                        const value = line.substring(separator + 1).trim();

                        if (key === 'URL') details.url = value;
                        if (key === 'Packager') details.packager = value;
                        if (key === 'Build Date') details.buildDate = value;
                        if (key === 'Install Date') details.installDate = value;
                        if (key === 'Installed Size') details.installedSize = value;
                        if (key === 'Download Size') details.downloadSize = value;
                        if (key === 'Version') details.version = value; // Update version if changed
                        if (key === 'Description') details.description = value;
                    }
                }
                resolve(details);
            });
        });
    });

    // Launch App Handler
    ipcMain.on('os:launch-app', (event, execCmd) => {
        if (!execCmd) return;

        // Sanitize exec command: remove % field codes
        // detailed in https://specifications.freedesktop.org/desktop-entry-spec/desktop-entry-spec-latest.html#exec-variables
        // We only support simple launching for now, so stripping args is safest 
        // effectively executing just the binary or command string sans params if they are % codes
        // But some execs are "cmd arg1 %f". 
        // Users expect the app to open. 
        // We'll simplisticly remove % keys.
        let cmd = execCmd.replace(/%[fFuiUck]/g, '').trim();

        console.log(`Launching app: ${cmd}`);

        const child = spawn(cmd, [], {
            detached: true,
            stdio: 'ignore',
            shell: true
        });

        child.unref();
    });

    // Check Updates Handler
    ipcMain.handle('pacman:check-updates', async () => {
        return new Promise((resolve, reject) => {
            // Use checkupdates if available (part of pacman-contrib), else fallback to pacman -Qu
            exec('checkupdates', (error, stdout, stderr) => {
                if (error) {
                    if (error.code === 2) return resolve([]);
                    console.warn("Check updates error (or no updates):", error);
                    return resolve([]);
                }

                const updates = [];
                const lines = stdout.split('\n');
                for (const line of lines) {
                    if (!line) continue;
                    // Format: "package old_ver -> new_ver"
                    const parts = line.split(' ');
                    if (parts.length >= 4) {
                        updates.push({
                            name: parts[0],
                            oldVersion: parts[1],
                            newVersion: parts[3]
                        });
                    }
                }
                resolve(updates);
            });
        });
    });

    // Get Favicon Handler
    ipcMain.handle('utils:get-favicon', async (_, { name, url }) => {
        if (!url || url === 'None' || !url.startsWith('http')) return null;
        try {
            // Only use domain for favicon
            const hostname = new URL(url).hostname;
            if (!hostname) return null;

            // Cache file path
            // Use a sanitized name or hash
            const safeName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            // Pass cacheDir from setupHandlers args? Or just resolve it again.
            // Let's resolve it again for simplicity inside handler or pass it down. 
            // Actually, setupHandlers scope doesn't have cacheDir unless passed.
            // I'll re-derive it (safe) or use a module-level var. 
            // Re-deriving is fine.
            const userDataPath = app.getPath('userData');
            // Use _256 suffix to distinguish from previous low-res cache and force fresh fetch
            const cachePath = path.join(userDataPath, 'icon-cache', `${safeName}_256.png`);

            // Check if exists
            try {
                await fs.promises.access(cachePath);
                return cachePath; // Return absolute path
            } catch {
                // Not found, fetch it
            }

            // Fetch from Google Facivon V2 API (High Res)
            const faviconUrl = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${hostname}&size=256`;
            const response = await net.fetch(faviconUrl);

            if (response.ok) {
                const buffer = await response.arrayBuffer();
                await fs.promises.writeFile(cachePath, Buffer.from(buffer));
                return cachePath;
            }
        } catch (err) {
            console.error(`Failed to fetch favicon for ${name}:`, err);
        }
        return null;
    });
}

// Minimal .desktop parser
function parseDesktopFile(content, filename) {
    const lines = content.split('\n');
    const app = { id: filename };
    let isDesktopEntry = false;

    for (const line of lines) {
        if (line.trim() === '[Desktop Entry]') {
            isDesktopEntry = true;
            continue;
        }
        if (!isDesktopEntry) continue;
        if (line.startsWith('[')) break; // Next section

        if (line.startsWith('Name=')) app.name = line.split('=')[1].trim();
        if (line.startsWith('Comment=')) app.comment = line.split('=')[1].trim();
        if (line.startsWith('Icon=')) app.icon = line.split('=')[1].trim();
        if (line.startsWith('Exec=')) app.exec = line.split('=')[1].trim();
        if (line.startsWith('Categories=')) app.categories = line.split('=')[1].trim();
        if (line.startsWith('NoDisplay=')) app.noDisplay = line.split('=')[1].trim() === 'true';
        if (line.startsWith('Type=')) app.type = line.split('=')[1].trim();
    }

    // Filter out non-Application types or utility scripts if needed
    if (app.type && app.type !== 'Application') return null;

    return app;
}

// Helper to find icon path (simplified)
async function findIconPath(iconName) {
    if (path.isAbsolute(iconName)) return iconName;

    // Common icon locations - Priority order
    const themeDirs = [
        '/usr/share/icons/hicolor/48x48/apps',
        '/usr/share/icons/hicolor/scalable/apps',
        '/usr/share/pixmaps',
        '/usr/share/icons/Adwaita/48x48/apps'
    ];

    const extensions = ['.png', '.svg', '.xpm', ''];

    for (const dir of themeDirs) {
        for (const ext of extensions) {
            const potentialPath = path.join(dir, `${iconName}${ext}`);
            try {
                await fs.promises.access(potentialPath);
                return potentialPath;
            } catch {
                // Continue
            }
        }
    }
    return null; // Icon not found
}
