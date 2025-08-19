
import React from 'react';
import { TYPE_COLORS } from '../constants';

interface TypeBadgeProps {
    type: string;
    small?: boolean;
}

const TypeBadge: React.FC<TypeBadgeProps> = ({ type, small = false }) => {
    const typeClass = TYPE_COLORS[type.toLowerCase()] || 'bg-gray-400 text-black';
    const padding = small ? 'px-2 py-0.5' : 'px-3 py-1';
    const textSize = small ? 'text-xs' : 'text-sm';

    return (
        <div className={`${typeClass} ${padding} ${textSize} font-bold border-2 border-black uppercase tracking-widest`}>
            {type}
        </div>
    );
};

export default TypeBadge;
