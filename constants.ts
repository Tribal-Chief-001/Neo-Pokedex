
export const POKEMON_TYPES: string[] = [
    'Normal', 'Fire', 'Water', 'Grass', 'Electric', 'Ice', 'Fighting', 'Poison',
    'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark',
    'Steel', 'Fairy'
];

export const TYPE_COLORS: { [key: string]: string } = {
    normal: 'bg-gray-400 text-black',
    fire: 'bg-red-500 text-white',
    water: 'bg-blue-500 text-white',
    grass: 'bg-green-500 text-white',
    electric: 'bg-yellow-400 text-black',
    ice: 'bg-cyan-300 text-black',
    fighting: 'bg-orange-700 text-white',
    poison: 'bg-purple-600 text-white',
    ground: 'bg-yellow-600 text-white',
    flying: 'bg-indigo-400 text-white',
    psychic: 'bg-pink-500 text-white',
    bug: 'bg-lime-500 text-black',
    rock: 'bg-stone-500 text-white',
    ghost: 'bg-indigo-800 text-white',
    dragon: 'bg-purple-800 text-white',
    dark: 'bg-gray-800 text-white',
    steel: 'bg-slate-500 text-white',
    fairy: 'bg-pink-300 text-black',
};

export const REGIONS = [
    { id: 1, name: 'Kanto (Gen I)', range: '1-151' },
    { id: 2, name: 'Johto (Gen II)', range: '152-251' },
    { id: 3, name: 'Hoenn (Gen III)', range: '252-386' },
    { id: 4, name: 'Sinnoh (Gen IV)', range: '387-493' },
    { id: 5, name: 'Unova (Gen V)', range: '494-649' },
    { id: 6, name: 'Kalos (Gen VI)', range: '650-721' },
    { id: 7, name: 'Alola (Gen VII)', range: '722-809' },
    { id: 8, name: 'Galar (Gen VIII)', range: '810-905' },
    { id: 9, name: 'Paldea (Gen IX)', range: '906-1025' }
];

export const BST_RANGES = [
    { label: 'BST > 600', value: 600 },
    { label: 'BST > 500', value: 500 },
    { label: 'BST > 400', value: 400 },
    { label: 'BST > 300', value: 300 },
];

export const EGG_GROUPS = [
    "Monster", "Water 1", "Bug", "Flying", "Field", "Fairy", "Grass", "Human-Like", 
    "Water 3", "Mineral", "Amorphous", "Water 2", "Ditto", "Dragon", "Undiscovered"
];