import React from 'react';
import AppIcon from './AppIcon';
import './PackageListItem.css';

const PackageListItem = ({ pkg, onInstall, onLaunch, onUninstall, onClick }) => {
    const handleInstallClick = (e) => {
        e.stopPropagation();
        if (!pkg.installed) {
            onInstall(pkg);
        }
    };

    return (
        <div className="package-list-item" onClick={() => onClick && onClick(pkg)}>
            <div className="list-item-icon">
                <AppIcon iconPath={pkg.iconPath} url={pkg.url} alt={pkg.name} />
            </div>

            <div className="list-item-content">
                <div className="list-item-title">{pkg.name}</div>
                <div className="list-item-description">{pkg.description || 'No description available'}</div>
            </div>

            <div className="list-item-meta">
                {pkg.version && <span className="list-item-version">v{pkg.version}</span>}
                <div className="list-item-actions">
                    {pkg.installed ? (
                        <div className="list-action-group">
                            {pkg.exec && (
                                <button
                                    className="btn-list-action btn-list-launch"
                                    onClick={(e) => { e.stopPropagation(); onLaunch && onLaunch(pkg); }}
                                    title="Launch"
                                >
                                    Open
                                </button>
                            )}
                            <button
                                className="btn-list-action btn-list-icon"
                                onClick={(e) => { e.stopPropagation(); onUninstall && onUninstall(pkg); }}
                                title="Uninstall"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                            <button
                                className="btn-list-action btn-list-icon"
                                onClick={(e) => { e.stopPropagation(); onClick(pkg); }}
                                title="Details"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M13 16H12V12H11M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>
                    ) : (
                        <button
                            className="btn-list-action btn-list-install"
                            onClick={handleInstallClick}
                        >
                            Install
                        </button>
                    )}
                </div>
            </div>

        </div>
    );
};

export default PackageListItem;
