// Colores oficiales de los tipos de Pokémon
export const POKEMON_TYPE_COLORS: { [key: string]: string } = {
  // Tipos básicos
  'Grass': '#78C850',      // Verde
  'Fire': '#F08030',       // Rojo/Naranja
  'Water': '#6890F0',      // Azul
  'Lightning': '#F8D030',  // Amarillo
  'Electric': '#F8D030',   // Amarillo (alias)
  'Psychic': '#F85888',    // Rosa
  'Fighting': '#C03028',   // Rojo oscuro
  'Darkness': '#705848',   // Marrón oscuro
  'Metal': '#B8B8D0',      // Gris
  'Dragon': '#7038F8',     // Púrpura
  'Fairy': '#EE99AC',      // Rosa claro
  'Colorless': '#A8A878',  // Beige/Normal
  
  // Tipos menos comunes
  'Ground': '#E0C068',     // Marrón claro
  'Rock': '#B8A038',       // Marrón piedra
  'Bug': '#A8B820',        // Verde lima
  'Ghost': '#705898',      // Púrpura oscuro
  'Steel': '#B8B8D0',      // Gris metálico
  'Ice': '#98D8D8',        // Celeste
  'Poison': '#A040A0',     // Morado
  'Flying': '#A890F0',     // Azul cielo
};

// Colores para los tipos de carta (mantener sutiles)
export const CARD_TYPE_COLORS = {
  POKEMON: {
    border: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.1)',
    text: '#fca5a5'
  },
  TRAINER: {
    border: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.1)',
    text: '#93c5fd'
  },
  ENERGY: {
    border: '#fbbf24',
    bg: 'rgba(251, 191, 36, 0.1)',
    text: '#fde68a'
  }
};

// Función helper para obtener color del tipo
export function getPokemonTypeColor(pokemonType: string | null | undefined): string {
  if (!pokemonType) return '#A8A878'; // Colorless por defecto
  return POKEMON_TYPE_COLORS[pokemonType] || '#A8A878';
}
