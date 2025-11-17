/**
 * Генерирует красивый SVG плейсхолдер для изображений
 */
export const generateImagePlaceholder = (
    width: number = 300,
    height: number = 400,
    text?: string,
    isDark: boolean = false
): string => {
    const bgColor = isDark ? '#1a1a1a' : '#2a2a2a';
    const textColor = isDark ? '#ffffff' : '#ffffff';
    const accentColor = '#FFD60A';
    
    // Берем первые буквы текста для инициалов
    const initials = text
        ? text
              .split(' ')
              .map(word => word[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
        : '?';
    
    const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1a1a1a;stop-opacity:1" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#grad)"/>
  <circle cx="${width / 2}" cy="${height / 2 - 20}" r="40" fill="${accentColor}" opacity="0.2"/>
  <text 
    x="50%" 
    y="50%" 
    font-family="Arial, sans-serif" 
    font-size="${Math.min(width, height) / 6}" 
    font-weight="bold" 
    fill="${textColor}" 
    text-anchor="middle" 
    dominant-baseline="middle"
    filter="url(#glow)"
  >
    ${initials}
  </text>
  ${text ? `
  <text 
    x="50%" 
    y="65%" 
    font-family="Arial, sans-serif" 
    font-size="${Math.min(width, height) / 12}" 
    fill="${textColor}" 
    text-anchor="middle" 
    dominant-baseline="middle"
    opacity="0.7"
  >
    ${text.length > 20 ? text.substring(0, 20) + '...' : text}
  </text>
  ` : ''}
</svg>`.trim();
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Генерирует плейсхолдер для игр/продуктов
 */
export const getGamePlaceholder = (title?: string, isDark: boolean = false): string => {
    return generateImagePlaceholder(300, 400, title, isDark);
};

