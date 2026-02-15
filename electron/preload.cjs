const { contextBridge, ipcRenderer } = require('electron');

console.log("Preload script loaded (CJS)!");

contextBridge.exposeInMainWorld('electronAPI', {
  searchPackages: (query) => ipcRenderer.invoke('pacman:search', query),
  getInstalledPackages: () => ipcRenderer.invoke('pacman:installed'),
  installPackage: (packageName) => ipcRenderer.send('pacman:install', packageName),
  uninstallPackage: (packageName) => ipcRenderer.send('pacman:uninstall', packageName),
  getApps: () => ipcRenderer.invoke('os:get-apps'),
  getDetails: (name, installed) => ipcRenderer.invoke('pacman:get-details', { name, installed }),
  checkUpdates: () => ipcRenderer.invoke('pacman:check-updates'),
  getFavicon: (name, url) => ipcRenderer.invoke('utils:get-favicon', { name, url }),
  launchApp: (execCmd) => ipcRenderer.send('os:launch-app', execCmd),
  openExternal: (url) => ipcRenderer.send('open-external', url),
  onInstallProgress: (callback) => ipcRenderer.on('install:progress', (_, text) => callback(text)),
  onInstallComplete: (callback) => ipcRenderer.on('install:complete', (_, success) => callback(success)),
  windowControls: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
  }
});
