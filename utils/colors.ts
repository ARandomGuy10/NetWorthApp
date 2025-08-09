// utils/color.ts
export function hexToRgb(hex: string): [number, number, number] {
    const s = hex.replace('#', '');
    const full = s.length === 3 ? s.split('').map(c => c + c).join('') : s;
    const num = parseInt(full, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  }
  
  export function applyOpacity(hex: string, opacity = 1) {
    const [r, g, b] = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  