import React from 'react';
import PackageCard from './PackageCard';
import PackageListItem from './PackageListItem';
import './Home.css';

const ESSENTIAL_APPS = [
    { name: 'discord', repo: 'extra', description: 'All-in-one voice and text chat for gamers', customIcon: 'discord', url: 'https://discord.com' },
    { name: 'spotify-launcher', repo: 'extra', description: 'Music for everyone (Spotify)', customIcon: 'spotify', url: 'https://www.spotify.com' },
    { name: 'vlc', repo: 'extra', description: 'Multimedia player for all formats', customIcon: 'vlc', url: 'https://www.videolan.org/vlc/' },
    { name: 'firefox', repo: 'extra', description: 'Fast, private and ethical web browser', customIcon: 'firefox', url: 'https://www.mozilla.org/firefox' },
    { name: 'obs-studio', repo: 'extra', description: 'Free and open source software for video recording and live streaming', customIcon: 'obs', url: 'https://obsproject.com' },
    { name: 'gimp', repo: 'extra', description: 'GNU Image Manipulation Program', customIcon: 'gimp', url: 'https://www.gimp.org' }
];

function Home({ onInstall, onLaunch, onUninstall, installedPackages, guiApps, onClick, viewMode }) {

    const getPackageStatus = (appName) => {
        // Find in installed
        const installed = installedPackages.find(p => p.name === appName);

        // Find icon in guiApps
        // Note: guiApps names might be "Discord" vs package "discord". 
        // We might need fuzzy match or check Exec.
        // For now, let's try to match by name (case insensitive) or if the appName is inside the guiApp name
        const guiApp = guiApps.find(app =>
            app.name.toLowerCase().includes(appName.toLowerCase()) ||
            (app.id && app.id.toLowerCase().includes(appName.toLowerCase())) ||
            (app.exec && app.exec.toLowerCase().includes(appName.toLowerCase()))
        );

        const iconPath = guiApp ? guiApp.iconPath : null;
        const exec = guiApp ? guiApp.exec : null;

        if (installed) {
            return { ...installed, installed: true, iconPath: iconPath || installed.iconPath, exec: exec || installed.exec };
        }
        return { iconPath, exec };
    };

    return (
        <div className="home-container">
            <div className="welcome-section">
                <h1>Welcome to Your OS</h1>
                <p>Get started with these essential applications for your daily tasks.</p>
            </div>

            <div className="section-title">
                <h2>Essentials</h2>
            </div>

            <div className={viewMode === 'list' ? "app-list-view" : "app-grid-view"}>
                {ESSENTIAL_APPS.map((app, i) => {
                    const status = getPackageStatus(app.name);
                    // If installed, use the installed data, otherwise use the preset
                    const pkgData = {
                        name: app.name,
                        repo: app.repo,
                        version: status.version || 'latest',
                        description: app.description,
                        installed: status.installed || false,
                        exec: status.exec, // Added exec property
                        iconPath: status.iconPath, // Pass the resolved icon path
                        url: status.url || app.url
                    };

                    return viewMode === 'list' ? (
                        <PackageListItem
                            key={app.name}
                            pkg={pkgData}
                            onInstall={onInstall}
                            onLaunch={onLaunch}
                            onUninstall={onUninstall}
                            onClick={onClick}
                        />
                    ) : (
                        <PackageCard
                            key={app.name}
                            pkg={pkgData}
                            onInstall={onInstall}
                            onLaunch={onLaunch}
                            onUninstall={onUninstall}
                            onClick={onClick}
                        // We might pass a hinted icon path here if we had one from a static asset
                        // For now, relies on text or potential future icon lookup
                        />
                    );
                })}
            </div>
        </div>
    );
}

export default Home;
