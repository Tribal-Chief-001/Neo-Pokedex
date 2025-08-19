import React from 'react';
import { Pokemon } from '../types';
import TypeBadge from './TypeBadge';
import { TYPE_COLORS } from '../constants';

interface PokemonCardProps {
    pokemon: Pokemon;
    onSelect: (pokemon: Pokemon) => void;
    onAddToTeam: (pokemon: Pokemon) => void;
    isTeamFull: boolean;
    isInTeam: boolean;
}

const PokemonCard: React.FC<PokemonCardProps> = ({ pokemon, onSelect, onAddToTeam, isTeamFull, isInTeam }) => {
    const primaryType = pokemon.types[0].toLowerCase();
    const bgColor = TYPE_COLORS[primaryType] ? TYPE_COLORS[primaryType].split(' ')[0] : 'bg-gray-200';

    const handleAddClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent modal from opening
        onAddToTeam(pokemon);
    };

    return (
        <div
            onClick={() => onSelect(pokemon)}
            className={`${bgColor} p-4 border-4 border-black shadow-[6px_6px_0px_#000] cursor-pointer hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_#000] active:translate-y-0 active:translate-x-0 active:shadow-[4px_4px_0px_#000] relative`}
        >
            {isInTeam ? (
                 <div className="absolute top-2 right-2 w-8 h-8 bg-blue-500 text-white flex items-center justify-center font-bold text-lg border-2 border-black">
                    ✓
                 </div>
            ) : (
                <button
                    onClick={handleAddClick}
                    disabled={isTeamFull}
                    className="absolute top-2 right-2 w-8 h-8 bg-green-500 text-white flex items-center justify-center font-bold text-2xl border-2 border-black shadow-[2px_2px_0px_#000] active:shadow-none active:translate-y-px active:translate-x-px disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed"
                    aria-label={`Add ${pokemon.name} to team`}
                >
                    +
                </button>
            )}


            <div className="bg-white/70 border-2 border-black aspect-square flex items-center justify-center p-2">
                 <img src={pokemon.sprite} alt={pokemon.name} className="w-full h-full object-contain" />
            </div>
            <div className="mt-3">
                <p className="text-xs text-black/60">#{pokemon.id.toString().padStart(4, '0')}</p>
                <h3 className="text-lg font-bold truncate">{pokemon.name}</h3>
                <div className="flex gap-1 mt-1">
                    {pokemon.types.map(type => (
                        <TypeBadge key={type} type={type} small={true} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PokemonCard;