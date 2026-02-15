import React, { useEffect, useRef } from 'react';
import './InstallTerminal.css';

const InstallTerminal = ({ logs, visible, onClose, status }) => {
    const terminalRef = useRef(null);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [logs]);

    if (!visible) return null;

    return (
        <div className="terminal-overlay">
            <div className="terminal-window">
                <div className="terminal-header">
                    <span className="header-title">Installation Progress</span>
                    <button className="close-btn" onClick={onClose} disabled={status === 'installing'}>&times;</button>
                </div>
                <div className="terminal-body" ref={terminalRef}>
                    {logs.map((log, i) => (
                        <div key={i} className="log-line">{log}</div>
                    ))}
                    {status === 'installing' && <div className="log-line">_</div>}
                    {status === 'complete' && <div className="log-line success">Operation Completed Successfully</div>}
                    {status === 'error' && <div className="log-line error">Operation Failed</div>}
                </div>
            </div>
        </div>
    );
};

export default InstallTerminal;
