/**
 * Símbolos de rareza según Pokémon TCG
 * Basado en el sistema oficial de Pokémon
 */

export interface RaritySymbol {
  symbol: string;
  name: string;
  description: string;
  color: string;
  iconPath: string;
}

export const RARITY_SYMBOLS: { [key: string]: RaritySymbol } = {
  'COMMON': {
    symbol: '●',
    name: 'Common',
    description: 'Círculo negro',
    color: '#4b5563',
    iconPath: '/assets/rarity-icons/common.svg'
  },
  'UNCOMMON': {
    symbol: '◆',
    name: 'Uncommon',
    description: 'Diamante negro',
    color: '#4b5563',
    iconPath: '/assets/rarity-icons/uncommon.svg'
  },
  'RARE': {
    symbol: '★',
    name: 'Rare',
    description: 'Estrella negra',
    color: '#4b5563',
    iconPath: '/assets/rarity-icons/rare.svg'
  },
  'DOUBLERARE': {
    symbol: '★★',
    name: 'Double Rare',
    description: 'Dos estrellas oscuras',
    color: '#4b5563',
    iconPath: '/assets/rarity-icons/double-rare.svg'
  },
  'ULTRARARE': {
    symbol: '★★',
    name: 'Ultra Rare',
    description: 'Dos estrellas plateadas brillantes',
    color: '#e5e7eb',
    iconPath: '/assets/rarity-icons/ultra-rare.svg'
  },
  'ILLUSTRATI': {
    symbol: '★',
    name: 'Illustration Rare',
    description: 'Estrella dorada',
    color: '#fbbf24',
    iconPath: '/assets/rarity-icons/illustration-rare.svg'
  },
  'SPECIALILL': {
    symbol: '★★',
    name: 'Special Illustration Rare',
    description: 'Dos estrellas doradas',
    color: '#f59e0b',
    iconPath: '/assets/rarity-icons/special-illustration-rare.svg'
  },
  'HYPERRARE': {
    symbol: '★★★',
    name: 'Hyper Rare',
    description: 'Tres estrellas doradas',
    color: '#fbbf24',
    iconPath: '/assets/rarity-icons/hyper-rare.svg'
  },
  'Promo': {
    symbol: '★',
    name: 'Promo',
    description: 'Estrella con texto PROMO',
    color: '#000000',
    iconPath: '/assets/rarity-icons/promo.svg'
  }
};

/**
 * Obtiene el símbolo de rareza para un código dado
 * @param code Código de rareza (C, UC, R, DR, etc.)
 * @returns Símbolo de rareza o círculo por defecto
 */
export function getRaritySymbol(code: string | null | undefined): string {
  if (!code) return '●';
  const symbol = RARITY_SYMBOLS[code.toUpperCase()];
  return symbol ? symbol.symbol : '●';
}

/**
 * Obtiene el nombre completo de la rareza
 * @param code Código de rareza (C, UC, R, DR, etc.)
 * @returns Nombre de la rareza
 */
export function getRarityName(code: string | null | undefined): string {
  if (!code) return 'Common';
  const symbol = RARITY_SYMBOLS[code.toUpperCase()];
  return symbol ? symbol.name : 'Unknown';
}

/**
 * Obtiene el color del símbolo de rareza
 * @param code Código de rareza (C, UC, R, DR, etc.)
 * @returns Color hexadecimal del símbolo
 */
export function getRarityColor(code: string | null | undefined): string {
  if (!code) return '#000000';
  const symbol = RARITY_SYMBOLS[code.toUpperCase()];
  return symbol ? symbol.color : '#000000';
}

/**
 * Obtiene la ruta del icono SVG de rareza
 * @param code Código de rareza (C, UC, R, DR, etc.)
 * @returns Ruta al archivo SVG del icono
 */
export function getRarityIconPath(code: string | null | undefined): string {
  if (!code) return 'assets/rarity-icons/common.svg';
  const symbol = RARITY_SYMBOLS[code.toUpperCase()];
  return symbol ? symbol.iconPath : 'assets/rarity-icons/common.svg';
}
