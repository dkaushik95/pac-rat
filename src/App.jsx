import React, { useState, useEffect } from 'react';
import TitleBar from './components/TitleBar';
import Sidebar from './components/Sidebar';
import SearchBar from './components/SearchBar';
import PackageCard from './components/PackageCard';
import InstallTerminal from './components/InstallTerminal';
import Home from './components/Home';
import Library from './components/Library';
import SidePanel from './components/SidePanel';
import PackageListItem from './components/PackageListItem';
import ViewToggle from './components/ViewToggle';
import './App.css';

function App() {
    const [activeTab, setActiveTab] = useState('home'); // 'home' | 'library'
    const [packages, setPackages] = useState([]);
    const [installedPackages, setInstalledPackages] = useState([]);
    const [guiApps, setGuiApps] = useState([]); // Apps with .desktop files
    const [filteredInstalled, setFilteredInstalled] = useState([]);
    const [loading, setLoading] = useState(false);
    const [installLogs, setInstallLogs] = useState([]);
    const [showTerminal, setShowTerminal] = useState(false);
    const [installStatus, setInstallStatus] = useState('idle');
    const [backendReady, setBackendReady] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [selectedApp, setSelectedApp] = useState(null); // For SidePanel
    const [isSidePanelOpen, setSidePanelOpen] = useState(false);
    const [updatesList, setUpdatesList] = useState([]);
    const [viewMode, setViewMode] = useState(() => localStorage.getItem('viewMode') || 'grid'); // 'grid' | 'list'

    const toggleViewMode = () => {
        const updateState = () => {
            setViewMode(prev => {
                const newMode = prev === 'grid' ? 'list' : 'grid';
                localStorage.setItem('viewMode', newMode);
                return newMode;
            });
        };

        if (document.startViewTransition) {
            document.startViewTransition(() => {
                updateState();
            });
        } else {
            updateState();
        }
    };

    useEffect(() => {
        if (window.electronAPI) {
            setBackendReady(true);
            window.electronAPI.onInstallProgress((text) => {
                setInstallLogs(prev => [...prev, text]);
            });

            window.electronAPI.onInstallComplete((success) => {
                setInstallStatus(success ? 'complete' : 'error');
                if (success) {
                    if (activeTab === 'library') fetchInstalled();
                }
            });
        } else {
            console.error("Electron API not found in window");
            setErrorMsg("IPC Link Offline");
        }
    }, []);

    useEffect(() => {
        if (backendReady) {
            // Always fetch installed packages and GUI apps on load for accurate status
            fetchInstalled();
            fetchGuiApps();
            fetchUpdates();
        }
    }, [backendReady]);

    const fetchUpdates = async () => {
        try {
            const updates = await window.electronAPI.checkUpdates();
            setUpdatesList(updates);
        } catch (err) {
            console.error("Failed to check updates:", err);
        }
    };


    const fetchGuiApps = async () => {
        try {
            const apps = await window.electronAPI.getApps();
            setGuiApps(apps);
        } catch (err) {
            console.error("Failed to fetch GUI apps", err);
        }
    };

    const fetchInstalled = async () => {
        setLoading(true);
        setErrorMsg(null);
        setInstalledPackages([]);
        setFilteredInstalled([]);

        try {
            const results = await window.electronAPI.getInstalledPackages();
            setInstalledPackages(results);

            // Lazy fetch favicons for apps without icons (or generic ones)
            results.forEach(async (pkg) => {
                if (pkg.url && !pkg.iconPath) {
                    // Try to get icon
                    const icon = await window.electronAPI.getFavicon(pkg.name, pkg.url);
                    if (icon) {
                        setInstalledPackages(prev => prev.map(p =>
                            p.name === pkg.name ? { ...p, iconPath: icon } : p
                        ));
                    }
                }
            });

            if (results.length === 0) setErrorMsg("No installed apps found");
        } catch (err) {
            console.error(err);
            setErrorMsg("Failed to fetch installed packages");
        }
        setLoading(false);
    };

    const handleSearch = async (query) => {
        // Library has its own search now
        if (activeTab === 'library') return;

        if (!query || query.trim().length === 0) {
            setPackages([]);
            return;
        }

        if (!window.electronAPI) {
            setErrorMsg("IPC Connection Failed");
            return;
        }

        setLoading(true);
        setPackages([]);
        setErrorMsg(null);

        try {
            const results = await window.electronAPI.searchPackages(query);
            setPackages(results.map(pkg => {
                const installedPkg = installedPackages.find(p => p.name === pkg.name);
                const guiApp = guiApps.find(app =>
                    app.name.toLowerCase().includes(pkg.name.toLowerCase()) ||
                    (app.id && app.id.toLowerCase().includes(pkg.name.toLowerCase())) ||
                    (app.exec && app.exec.toLowerCase().includes(pkg.name.toLowerCase()))
                );
                return {
                    ...pkg,
                    installed: !!installedPkg,
                    exec: guiApp ? guiApp.exec : (installedPkg ? installedPkg.exec : pkg.exec),
                    iconPath: guiApp ? guiApp.iconPath : (installedPkg ? installedPkg.iconPath : pkg.iconPath)
                };
            }));
            if (results.length === 0) setErrorMsg("No results found");
        } catch (err) {
            console.error("Search error:", err);
            setErrorMsg(`Search error: ${err.message}`);
        }
        setLoading(false);
    };

    const handleInstall = (pkg) => {
        setInstallStatus('installing');
        setInstallLogs([`Initiating install: ${pkg.name}...`, 'Requesting root access...']);
        setShowTerminal(true);
        window.electronAPI.installPackage(pkg.name);
    };

    const handleLaunch = (pkg) => {
        if (!pkg.exec) return;
        window.electronAPI.launchApp(pkg.exec);
    };

    const handleUninstall = (pkg) => {
        // If uninstalled from side panel, close it or update state
        setInstallStatus('installing');
        setInstallLogs([`Initiating removal: ${pkg.name}...`, 'Requesting root access...']);
        setShowTerminal(true);
        window.electronAPI.uninstallPackage(pkg.name);
    };

    const handleAppClick = (pkg) => {
        setSelectedApp(pkg);
        if (selectedApp) {
            setSidePanelOpen(true);
        } else {
            // Delay first open just slightly to ensure component mounts before animating in
            setTimeout(() => setSidePanelOpen(true), 50);
        }
    };

    const closeSidePanel = () => {
        setSidePanelOpen(false);
        // Clear data after animation completes (300ms > 250ms transition)
        setTimeout(() => setSelectedApp(null), 300);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setErrorMsg(null);
        setPackages([]); // Reset search on tab switch for clean state
    };

    return (
        <div className="app-container-column">
            <TitleBar />
            <div className="app-layout">
                <Sidebar
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    backendReady={backendReady}
                />

                <main className="main-content">
                    {/* Content Header (Flush design) */}
                    <div className="content-header">
                        <div className="header-title">
                            <span className="header-icon">
                                {activeTab === 'home' && (
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M3 9.5L12 2L21 9.5V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                                {activeTab === 'library' && (
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5 6C5 4.89543 5.89543 4 7 4H17C18.1046 4 19 4.89543 19 6V18C19 19.1046 18.1046 20 17 20H7C5.89543 20 5 19.1046 5 18V6Z" fill="currentColor" />
                                        <path fillRule="evenodd" clipRule="evenodd" d="M2 10C2 8.89543 2.89543 8 4 8H20C21.1046 8 22 8.89543 22 10V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V10ZM12 11C11.4477 11 11 11.4477 11 12V14H9C8.44772 14 8 14.4477 8 15C8 15.5523 8.44772 16 9 16H15C15.5523 16 16 15.5523 16 15C16 14.4477 15.5523 14 15 14H13V12C13 11.4477 12.5523 11 12 11Z" fill="currentColor" />
                                    </svg>
                                )}
                            </span>
                            {activeTab === 'home' ? 'Home' : 'Library'}
                        </div>
                        {activeTab === 'home' && <SearchBar onSearch={handleSearch} />}

                        {/* View Toggle Button */}
                        <div className="view-toggle">
                            <ViewToggle viewMode={viewMode} onToggle={toggleViewMode} />
                        </div>
                    </div>

                    <div className="content-area">
                        {loading ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>{activeTab === 'home' ? 'Loading Home...' : activeTab === 'search' ? 'Searching...' : 'Loading...'}</p>
                            </div>
                        ) : (
                            <>
                                {errorMsg && (
                                    <div className="error-state">
                                        <h3>System Message</h3>
                                        <p>{errorMsg}</p>
                                    </div>
                                )}

                                {!errorMsg && activeTab === 'home' && (
                                    <>
                                        {packages.length > 0 ? (
                                            <div className="search-results-container">
                                                <div className="results-header">
                                                    <button className="btn-back" onClick={() => setPackages([])}>
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                        Back to Home
                                                    </button>
                                                    <h3>Search Results</h3>
                                                </div>
                                                <div className={viewMode === 'list' ? "app-list-view" : "app-grid-view"}>
                                                    {packages.map((pkg, i) => (
                                                        viewMode === 'list' ? (
                                                            <PackageListItem
                                                                key={`${pkg.repo}-${pkg.name}-${i}`}
                                                                pkg={pkg}
                                                                onInstall={handleInstall}
                                                                onLaunch={handleLaunch}
                                                                onUninstall={handleUninstall}
                                                                onClick={handleAppClick}
                                                            />
                                                        ) : (
                                                            <PackageCard
                                                                key={`${pkg.repo}-${pkg.name}-${i}`}
                                                                pkg={pkg}
                                                                onInstall={handleInstall}
                                                                onLaunch={handleLaunch}
                                                                onUninstall={handleUninstall}
                                                                onClick={handleAppClick}
                                                            />
                                                        )
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <Home
                                                onInstall={handleInstall}
                                                onLaunch={handleLaunch}
                                                onUninstall={handleUninstall}
                                                installedPackages={installedPackages}
                                                guiApps={guiApps}
                                                onClick={handleAppClick}
                                                viewMode={viewMode}
                                            />
                                        )}
                                    </>
                                )}

                                {!errorMsg && activeTab === 'library' && (
                                    <Library
                                        installedPackages={installedPackages}
                                        guiApps={guiApps}
                                        onInstall={handleInstall}
                                        onLaunch={handleLaunch}
                                        onUninstall={handleUninstall}
                                        onClick={handleAppClick}
                                        viewMode={viewMode}
                                    />
                                )}
                            </>
                        )}
                    </div>
                </main>

                <InstallTerminal
                    visible={showTerminal}
                    logs={installLogs}
                    status={installStatus}
                    onClose={() => setShowTerminal(false)}
                />

                <SidePanel
                    app={selectedApp}
                    isOpen={isSidePanelOpen}
                    onClose={closeSidePanel}
                    onInstall={handleInstall}
                    onLaunch={handleLaunch}
                    onUninstall={handleUninstall}
                    updatesList={updatesList}
                />
            </div>
        </div>
    );
}

export default App;
