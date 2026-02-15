import React, { useState, useEffect, useMemo } from 'react';
import PackageCard from './PackageCard';
import PackageListItem from './PackageListItem';
import Dropdown from './Dropdown';
import './Library.css';

const Library = ({ installedPackages, guiApps, onInstall, onLaunch, onUninstall, onClick, viewMode }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('name'); // 'name' | 'date' | 'size'

    // Merge GUI apps with installed package details
    const mergedPackages = useMemo(() => {
        // Create a map of installed packages for quick lookup
        const installedMap = new Map(installedPackages.map(p => [p.name, p]));

        // Start with GUI apps as the base for visual library
        // But some users might want to see ALL installed packages? 
        // The prompt says "Library section", usually implies installed apps.
        // Let's stick to the logic used in App.jsx previously: guiApps matched with installed details.
        // However, if we want a full package manager experience, maybe we should show all?
        // Let's stick to guiApps for the "App Store" feel, but maybe fall back or allow toggle?
        // For now, let's match the previous behavior: GUI Apps enriched with Pacman data.

        // Actually, let's include ALL explicitly installed packages if they don't have a .desktop file?
        // Or just stick to GUI apps for the grid. 
        // Let's use `guiApps` primarily, but maybe we can just use `installedPackages` if we want everything.
        // Given "Pac-Rat" usually implies managing all packages, but the UI is very "App Store".
        // Let's use `guiApps` enriched.

        return guiApps.map(app => {
            // Find matching pacman package
            // Match by name or exec
            const pkg = installedMap.get(app.name) ||
                Array.from(installedMap.values()).find(p => p.name === app.name.toLowerCase() || (app.exec && app.exec.toLowerCase().includes(p.name.toLowerCase())));

            return pkg ? { ...pkg, ...app, description: pkg.description || app.comment, version: pkg.version } : app;
        });
    }, [guiApps, installedPackages]);

    const filteredAndSortedPackages = useMemo(() => {
        let result = [...mergedPackages];

        // Filter
        if (searchQuery) {
            const lowerQ = searchQuery.toLowerCase();
            result = result.filter(pkg =>
                (pkg.name && pkg.name.toLowerCase().includes(lowerQ)) ||
                (pkg.description && pkg.description.toLowerCase().includes(lowerQ))
            );
        }

        // Sort
        result.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return (a.name || '').localeCompare(b.name || '');
                case 'date':
                    // Install Date format depends on locale, but pacman usually gives "Day YYYY-MM-DD HH:MM:SS" or similar
                    // We might need to parse. For now, string comparison might be rough.
                    // Let's rely on the formatted string if it's standard ISO-ish, otherwise we might need proper parsing.
                    // Pacman: "Wed 15 Feb 2026..." 
                    // We need to parse this in `main.js` really or here.
                    // For now let's try simple string, but it won't work well for dates.
                    // NOTE: In main.js we just return the raw string.
                    // We should probably try to parse it. 
                    // If parsing fails, fall back to name.
                    const dateA = new Date(a.installDate);
                    const dateB = new Date(b.installDate);
                    if (isValidDate(dateA) && isValidDate(dateB)) {
                        return dateB - dateA; // Newest first
                    }
                    return 0;
                case 'size':
                    // Installed Size: "123.45 MiB"
                    const sizeA = parseSize(a.installedSize);
                    const sizeB = parseSize(b.installedSize);
                    return sizeB - sizeA; // Largest first
                default:
                    return 0;
            }
        });

        return result;
    }, [mergedPackages, searchQuery, sortBy]);

    function isValidDate(d) {
        return d instanceof Date && !isNaN(d);
    }

    function parseSize(sizeStr) {
        if (!sizeStr) return 0;
        const [val, unit] = sizeStr.split(' ');
        const num = parseFloat(val);
        if (isNaN(num)) return 0;
        let multiplier = 1;
        if (unit === 'KiB') multiplier = 1024;
        if (unit === 'MiB') multiplier = 1024 * 1024;
        if (unit === 'GiB') multiplier = 1024 * 1024 * 1024;
        return num * multiplier;
    }

    return (
        <div className="library-container">
            <div className="library-header">
                <div className="library-title">My Library</div>
                <div className="library-controls">
                    <div className="library-search">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM15.54 8.46L13.88 13.88L8.46 15.54L10.12 10.12L15.54 8.46ZM12 13.5C12.8284 13.5 13.5 12.8284 13.5 12C13.5 11.1716 12.8284 10.5 12 10.5C11.1716 10.5 10.5 11.1716 10.5 12C10.5 12.8284 11.1716 13.5 12 13.5Z" fill="currentColor" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search installed..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="sort-control">

                        <Dropdown
                            options={[
                                { label: 'Name', value: 'name' },
                                { label: 'Date Installed', value: 'date' },
                                { label: 'Size', value: 'size' }
                            ]}
                            value={sortBy}
                            onChange={(val) => setSortBy(val)}
                        />
                    </div>
                </div>
            </div>

            {filteredAndSortedPackages.length > 0 ? (
                <div className={viewMode === 'list' ? "app-list-view" : "app-grid-view"}>
                    {/* DEBUG: Remove after fixing */}
                    {/* <pre style={{color: 'white', position: 'absolute', zIndex: 100, background: 'black', top: 0, left: 0}}>
                        {JSON.stringify(filteredAndSortedPackages[0], null, 2)}
                    </pre> */}

                    {filteredAndSortedPackages.map((pkg, i) => (
                        viewMode === 'list' ? (
                            <PackageListItem
                                key={`${pkg.name}-${i}`}
                                pkg={pkg}
                                onInstall={onInstall}
                                onLaunch={onLaunch}
                                onUninstall={onUninstall}
                                onClick={onClick}
                            />
                        ) : (
                            <PackageCard
                                key={`${pkg.name}-${i}`}
                                pkg={pkg}
                                onInstall={onInstall}
                                onLaunch={onLaunch}
                                onUninstall={onUninstall}
                                onClick={onClick}
                            />
                        )
                    ))}
                </div>
            ) : (
                <div className="empty-library">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 6C5 4.89543 5.89543 4 7 4H17C18.1046 4 19 4.89543 19 6V18C19 19.1046 18.1046 20 17 20H7C5.89543 20 5 19.1046 5 18V6Z" fill="currentColor" />
                    </svg>
                    <p>No packages found</p>
                </div>
            )}
        </div>
    );
};

export default Library;
