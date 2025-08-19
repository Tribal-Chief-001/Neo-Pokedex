import React from 'react';
import { Pokemon } from '../types';
import { TYPE_COLORS } from '../constants';
import TypeBadge from './TypeBadge';

interface TeamHubProps {
    team: Pokemon[];
    onRemoveFromTeam: (id: number) => void;
    onAnalyze: () => void;
    teamTypeCoverage: {
        weaknesses: string[];
        resistances: string[];
    };
}

const TeamHub: React.FC<TeamHubProps> = ({ team, onRemoveFromTeam, onAnalyze, teamTypeCoverage }) => {
    const slots = Array.from({ length: 6 });

    return (
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_#000] p-4 sm:p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4 border-b-4 border-black pb-2">&lt;TEAM HQ&gt;</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Team Roster */}
                <div className="grid grid-cols-6 gap-2 md:col-span-2">
                    {slots.map((_, index) => {
                        const pokemon = team[index];
                        if (pokemon) {
                            const primaryType = pokemon.types[0].toLowerCase();
                            const bgColor = TYPE_COLORS[primaryType] ? TYPE_COLORS[primaryType].split(' ')[0] : 'bg-gray-200';
                            return (
                                <div
                                    key={pokemon.id}
                                    className={`${bgColor} border-4 border-black aspect-square p-1 cursor-pointer group relative`}
                                    onClick={() => onRemoveFromTeam(pokemon.id)}
                                    title={`Remove ${pokemon.name}`}
                                >
                                    <img src={pokemon.sprite} alt={pokemon.name} className="w-full h-full object-contain" />
                                     <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <span className="text-white font-bold text-3xl">&times;</span>
                                    </div>
                                </div>
                            );
                        }
                        return (
                            <div key={index} className="bg-gray-300 border-4 border-dashed border-gray-500 aspect-square" />
                        );
                    })}
                </div>
                {/* Analyze Button */}
                <div className="md:col-span-1 flex items-center">
                    <button 
                        onClick={onAnalyze}
                        disabled={team.length < 2}
                        className="w-full p-4 bg-blue-500 text-white font-bold border-4 border-black shadow-[4px_4px_0px_#000] active:shadow-none active:translate-y-px active:translate-x-px disabled:bg-blue-300 disabled:shadow-none disabled:translate-y-0 disabled:translate-x-0 disabled:cursor-not-allowed"
                    >
                        ANALYZE TEAM
                    </button>
                </div>
            </div>

            {/* Type Coverage Section */}
            {team.length > 0 && (
                <div className="mt-6 pt-4 border-t-4 border-black">
                     <h3 className="text-lg font-bold mb-3">&lt;TYPE COVERAGE&gt;</h3>
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                        <div>
                            <h4 className="font-bold mb-2">WEAK TO:</h4>
                             <div className="flex flex-wrap gap-2">
                                {teamTypeCoverage.weaknesses.length > 0 ? teamTypeCoverage.weaknesses.map(t => <TypeBadge key={t} type={t} />) : <span className="text-xs text-black/70">No common weaknesses.</span>}
                            </div>
                        </div>
                         <div>
                            <h4 className="font-bold mb-2">RESISTS:</h4>
                             <div className="flex flex-wrap gap-2">
                                 {teamTypeCoverage.resistances.length > 0 ? teamTypeCoverage.resistances.map(t => <TypeBadge key={t} type={t} />) : <span className="text-xs text-black/70">No common resistances.</span>}
                            </div>
                        </div>
                     </div>
                </div>
            )}
        </div>
    );
};

export default TeamHub;