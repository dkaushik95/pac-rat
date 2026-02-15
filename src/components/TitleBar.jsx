import React from 'react';
import './TitleBar.css';

const TitleBar = () => {
    const handleMinimize = () => {
        if (window.electronAPI?.windowControls) {
            window.electronAPI.windowControls.minimize();
        }
    };

    const handleMaximize = () => {
        if (window.electronAPI?.windowControls) {
            window.electronAPI.windowControls.maximize();
        }
    };

    const handleClose = () => {
        if (window.electronAPI?.windowControls) {
            window.electronAPI.windowControls.close();
        }
    };

    return (
        <div className="title-bar">
            <div className="window-title">Pacman Manager</div>
            <div className="window-controls">
                <button className="control-btn minimize" onClick={handleMinimize} title="Minimize">
                    <svg width="10" height="1" viewBox="0 0 10 1">
                        <rect width="10" height="1" fill="currentColor" />
                    </svg>
                </button>
                <button className="control-btn maximize" onClick={handleMaximize} title="Maximize">
                    <svg width="10" height="10" viewBox="0 0 10 10">
                        <rect width="10" height="10"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                        />
                    </svg>
                </button>
                <button className="control-btn close" onClick={handleClose} title="Close">
                    <svg width="10" height="10" viewBox="0 0 10 10">
                        <path d="M1 1 L9 9 M9 1 L1 9"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            fill="none"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default TitleBar;
