import React from 'react';
import './Sidebar.css';

const Sidebar = ({ activeTab, onTabChange, backendReady }) => {
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-branding">
                    <img src="/pac-rat-icon.png" alt="Pac-Rat Icon" className="sidebar-logo" />
                    <h1>Pac-Rat</h1>
                </div>
            </div>

            <nav className="nav-links">
                <button
                    className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
                    onClick={() => onTabChange('home')}
                >
                    <span className="nav-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 9.5L12 2L21 9.5V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M9 21V12H15V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </span>
                    <span className="nav-label">Home</span>
                </button>
                <button
                    className={`nav-item ${activeTab === 'library' ? 'active' : ''}`}
                    onClick={() => onTabChange('library')}
                >
                    <span className="nav-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 6C5 4.89543 5.89543 4 7 4H17C18.1046 4 19 4.89543 19 6V18C19 19.1046 18.1046 20 17 20H7C5.89543 20 5 19.1046 5 18V6Z" fill="currentColor" />
                            <path fillRule="evenodd" clipRule="evenodd" d="M2 10C2 8.89543 2.89543 8 4 8H20C21.1046 8 22 8.89543 22 10V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V10ZM12 11C11.4477 11 11 11.4477 11 12V14H9C8.44772 14 8 14.4477 8 15C8 15.5523 8.44772 16 9 16H15C15.5523 16 16 15.5523 16 15C16 14.4477 15.5523 14 15 14H13V12C13 11.4477 12.5523 11 12 11Z" fill="currentColor" />
                        </svg>
                    </span>
                    <span className="nav-label">Library</span>
                </button>
            </nav>

            <div className="sidebar-footer">
                <span className={`status-dot ${backendReady ? 'online' : ''}`}></span>
                <div className="footer-text">
                    <span>{backendReady ? 'Connected' : 'Offline'}</span>
                    <span className="footer-subtext">{backendReady ? 'Pacman Daemon' : 'Check IPC'}</span>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
