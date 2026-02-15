/**
 * Formats a package name into a sentence case string.
 * Replaces hyphens with spaces and capitalizes the first letter.
 * @param {string} name - The package name to format.
 * @returns {string} The formatted name.
 */
export const formatPackageName = (name) => {
    if (!name) return '';
    const formatted = name.replace(/-/g, ' ');
    return formatted.charAt(0).toUpperCase() + formatted.slice(1).toLowerCase();
};

export const formatDisplayName = formatPackageName;
