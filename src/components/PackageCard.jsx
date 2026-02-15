import AppIcon from './AppIcon';
import { formatPackageName } from '../utils';
import './PackageCard.css';

const PackageCard = ({ pkg, onInstall, onLaunch, onUninstall, onClick }) => {
    // Determine the "icon" letter from the package name
    // const initial = pkg.name ? pkg.name.charAt(0).toUpperCase() : '?';

    const handleAction = (e) => {
        e.stopPropagation(); // Don't open side panel if clicking button
        if (!pkg.installed) {
            onInstall(pkg);
        } else if (pkg.exec && onLaunch) {
            onLaunch(pkg);
        } else {
            // Manage action: for now, maybe open side panel too or just do nothing here as explicit "Manage" usually implies opening details
            onClick(pkg);
        }
    };


    return (
        <div className={`package-card ${pkg.installed ? 'installed' : ''}`} onClick={() => onClick(pkg)}>
            <div className="card-header">
                <div className="app-icon-container">
                    <AppIcon iconPath={pkg.iconPath} url={pkg.url} alt={pkg.name} />
                </div>
                {pkg.installed && <div className="status-pill">Installed</div>}
                {/* Optional: Add verified badge or other metadata here */}
            </div>

            <div className="card-meta">
                <h3 className="pkg-title" title={pkg.name}>{formatPackageName(pkg.name)}</h3>
                <div className="badges">
                    {pkg.repo && !['extra', 'local'].includes(pkg.repo) && <span className="pkg-repo-badge">{pkg.repo}</span>}
                    {pkg.version && <span className="pkg-version">{pkg.version}</span>}
                </div>
            </div>

            <p className="pkg-description" title={pkg.description}>
                {pkg.description || 'No description available'}
            </p>

            <div className={`card-actions ${pkg.installed ? 'installed-actions' : ''}`}>
                {pkg.installed ? (
                    <div className="action-group">
                        {pkg.exec && (
                            <button
                                className="btn-action btn-launch"
                                onClick={(e) => { e.stopPropagation(); onLaunch && onLaunch(pkg); }}
                                title="Open App"
                            >
                                Open
                            </button>
                        )}
                        <button
                            className="btn-action btn-icon-only"
                            onClick={(e) => { e.stopPropagation(); onUninstall && onUninstall(pkg); }}
                            title="Uninstall"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <button
                            className="btn-action btn-icon-only"
                            onClick={(e) => { e.stopPropagation(); onClick(pkg); }}
                            title="Details"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13 16H12V12H11M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                ) : (
                    <button
                        className="btn-install"
                        onClick={handleAction}
                    >
                        Get
                    </button>
                )}
            </div>
        </div>
    );
};

export default PackageCard;
