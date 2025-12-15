/**
 * Calculates the relative luminance of a color
 * @param r - Red value (0-255)
 * @param g - Green value (0-255)
 * @param b - Blue value (0-255)
 * @returns Luminance value (0-1)
 */
export const getLuminance = (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map((c) => {
        const val = c / 255;
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Converts hex color to RGB
 * @param hex - Hex color string (e.g., "#FF5733")
 * @returns RGB object or null if invalid
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : null;
};

/**
 * Determines if text should be light or dark based on background color
 * @param hexColor - Background color in hex format
 * @returns 'light' or 'dark'
 */
export const getContrastColor = (hexColor: string): 'light' | 'dark' => {
    const rgb = hexToRgb(hexColor);
    if (!rgb) return 'dark';

    const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
    return luminance > 0.5 ? 'dark' : 'light';
};

/**
 * Gets appropriate text color (white or black) for contrast
 * @param hexColor - Background color in hex format
 * @returns CSS color value
 */
export const getTextColor = (hexColor: string): string => {
    return getContrastColor(hexColor) === 'light' ? '#ffffff' : '#000000';
};

