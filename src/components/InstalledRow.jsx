import AppIcon from './AppIcon';
import './InstalledRow.css';

const InstalledRow = ({ pkg, onUninstall }) => {
    return (
        <div className="installed-row">
            <div className="row-icon-container">
                <AppIcon iconPath={pkg.iconPath} url={pkg.url} alt={pkg.name} />
            </div>
            <div className="row-info">
                <span className="row-title">{pkg.name}</span>
                <span className="row-meta">{pkg.version} • {pkg.description || 'No description'}</span>
            </div>
            <button className="btn-uninstall" onClick={() => onUninstall(pkg)}>
                Uninstall
            </button>
        </div>
    );
};

export default InstalledRow;
