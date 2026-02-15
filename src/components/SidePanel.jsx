import React, { useEffect, useState } from 'react';
import AppIcon from './AppIcon';
import { formatPackageName } from '../utils';
import './SidePanel.css';

const SidePanel = ({ app, isOpen, onClose, onInstall, onLaunch, onUninstall, updatesList }) => {
    const [details, setDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        if (app) {
            setDetails(null); // Clear previous details immediately
            fetchDetails();
        }
    }, [app]);

    const fetchDetails = async () => {
        setLoadingDetails(true);
        try {
            const data = await window.electronAPI.getDetails(app.name, app.installed);
            setDetails(data);
        } catch (err) {
            console.error("Failed to fetch details", err);
        }
        setLoadingDetails(false);
    };

    if (!app) return null;

    // Check if update available
    const updateInfo = updatesList && updatesList.find(u => u.name === app.name);
    const hasUpdate = !!updateInfo;


    return (
        <div className={`side-panel ${isOpen ? 'open' : ''}`}>
            <div className="side-panel-header">
                <button className="close-btn" onClick={onClose}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>

            <div className="side-panel-content">
                <div className="sp-hero">
                    <div className="sp-icon-container">
                        <AppIcon iconPath={app.iconPath} url={details?.url || app.url} alt={app.name} />
                    </div>
                    <h2 className="sp-title">{formatPackageName(app.name)}</h2>
                    <div className="sp-meta">
                        <span className="sp-version">{details?.version || app.version}</span>
                        {app.repo && !['extra', 'local'].includes(app.repo) && <span className="sp-badge">{app.repo}</span>}
                        {hasUpdate && <span className="sp-badge update">Update Available</span>}
                    </div>
                </div>

                <div className="sp-actions">
                    {app.installed ? (
                        <>
                            {app.exec && (
                                <button className="btn-action btn-install" onClick={() => onLaunch(app)}>
                                    Open
                                </button>
                            )}
                            <button className="btn-action btn-uninstall" onClick={() => onUninstall(app)}>
                                Uninstall
                            </button>
                            {hasUpdate && (
                                <button className="btn-action btn-install" onClick={() => {/* Trigger update logic */ }}>
                                    Update to {updateInfo.newVersion}
                                </button>
                            )}
                        </>
                    ) : (
                        <button className="btn-action btn-install" onClick={() => onInstall(app)}>
                            Install
                        </button>
                    )}
                </div>

                <div className="sp-description">
                    <h3>About</h3>
                    <p>{details?.description || app.description || "No description available."}</p>
                </div>

                <div className="sp-details">
                    <h3>Details</h3>
                    {loadingDetails ? (
                        <p>Loading details...</p>
                    ) : (
                        <>
                            <div className="detail-row">
                                <span className="label">Package Name</span>
                                <span className="value">{app.name}</span>
                            </div>
                            {(details?.url || app.url) && (
                                <div className="detail-row">
                                    <span className="label">Website</span>
                                    <a
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); window.electronAPI.openExternal(details?.url || app.url); }}
                                        className="value link"
                                    >
                                        Visit Website
                                    </a>
                                </div>
                            )}
                            <div className="detail-row">
                                <span className="label">Installed</span>
                                <span className="value">{app.installed ? 'Yes' : 'No'}</span>
                            </div>
                            {details?.installedSize && (
                                <div className="detail-row">
                                    <span className="label">Installed Size</span>
                                    <span className="value">{details.installedSize}</span>
                                </div>
                            )}
                            {details?.downloadSize && (
                                <div className="detail-row">
                                    <span className="label">Download Size</span>
                                    <span className="value">{details.downloadSize}</span>
                                </div>
                            )}
                            {details?.buildDate && (
                                <div className="detail-row">
                                    <span className="label">Build Date</span>
                                    <span className="value">
                                        {(() => {
                                            try {
                                                // Should be something like "Mon 02 Oct 2023 10:00:00 AM UTC" or "2023-10-02T10:00:00"
                                                // Let's try to parse it
                                                const date = new Date(details.buildDate);
                                                if (!isNaN(date)) {
                                                    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
                                                }
                                                // Fallback if Date parse fails, or maybe just split 'T' or take first few words
                                                return details.buildDate.split(' T')[0];
                                            } catch (e) {
                                                return details.buildDate;
                                            }
                                        })()}
                                    </span>
                                </div>
                            )}
                            {details?.packager && (
                                <div className="detail-row">
                                    <span className="label">Packager</span>
                                    <span className="value packager-value">
                                        {(() => {
                                            const match = details.packager.match(/^(.*)<(.*)>$/);
                                            if (match) {
                                                const [_, name, email] = match;
                                                return (
                                                    <>
                                                        <span>{name.trim()}</span>
                                                        <a href={`mailto:${email}`} title={`Email ${email}`} className="packager-email-icon">
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        </a>
                                                    </>
                                                );
                                            }
                                            return details.packager;
                                        })()}
                                    </span>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div >
    );
};

export default SidePanel;
