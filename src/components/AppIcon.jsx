import React, { useState } from 'react';

const DefaultIcon = () => (
    <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" fill="currentColor" fillOpacity="0.5" />
        <path fillRule="evenodd" clipRule="evenodd" d="M20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12ZM22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" fill="currentColor" fillOpacity="0.5" />
        <path d="M12 7V2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 22V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M17 12L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M2 12L7 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M15.5355 8.46447L19.0711 4.92893" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M4.92896 19.0711L8.46449 15.5356" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M15.5355 15.5355L19.0711 19.0711" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M4.92896 4.92893L8.46449 8.46447" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const AppIcon = ({ iconPath, url, className, alt }) => {
    const [localError, setLocalError] = useState(false);
    const [faviconError, setFaviconError] = useState(false);

    // Reset errors if path/url changes
    React.useEffect(() => {
        setLocalError(false);
        setFaviconError(false);
    }, [iconPath, url]);

    const getFaviconUrl = (websiteUrl) => {
        try {
            const domain = new URL(websiteUrl).hostname;
            // Use Google's higher quality Favicon V2 API
            return `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=256`;
        } catch (e) {
            return null;
        }
    };

    const showLocal = iconPath && !localError;
    const showFavicon = !showLocal && url && !faviconError;

    if (showLocal) {
        // Use the custom protocol
        const src = `app-icon://${encodeURIComponent(iconPath)}`;
        return (
            <img
                src={src}
                alt={alt}
                className={`app-icon ${className || ''}`}
                onError={() => setLocalError(true)}
            />
        );
    }

    if (showFavicon) {
        const faviconSrc = getFaviconUrl(url);
        if (faviconSrc) {
            return (
                <img
                    src={faviconSrc}
                    alt={alt}
                    className={`app-icon ${className || ''}`}
                    onError={() => setFaviconError(true)}
                />
            );
        }
    }

    // Fallback
    return (
        <div className={`app-icon-fallback ${className || ''}`} title={alt}>
            <DefaultIcon />
        </div>
    );
};

export default AppIcon;
