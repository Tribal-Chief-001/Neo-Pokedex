
import React from 'react';
import { PokemonStat } from '../types';

interface StatBarProps {
    stat: PokemonStat;
}

const StatBar: React.FC<StatBarProps> = ({ stat }) => {
    const maxStatValue = 255;
    const percentage = (stat.value / maxStatValue) * 100;

    let barColor = 'bg-green-500';
    if (percentage < 25) barColor = 'bg-red-500';
    else if (percentage < 50) barColor = 'bg-yellow-500';

    return (
        <div className="grid grid-cols-4 items-center gap-2 mb-1.5 text-xs">
            <span className="font-bold col-span-1">{stat.name}</span>
            <span className="font-bold text-right col-span-1">{stat.value}</span>
            <div className="bg-gray-200 border-2 border-black w-full h-4 col-span-2">
                <div
                    className={`${barColor} h-full border-r-2 border-black`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};

export default StatBar;
