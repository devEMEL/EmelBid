

import { Link } from 'react-router-dom';
import React from 'react';

export const Logo: React.FC = () => {
    return (
        <Link to="/" className="flex items-center space-x-3 group">
            <div className="flex items-center justify-center p-1 overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-500">
                <img src="/emelverse.jpeg" alt='emelverse logo' className='w-12 h-12 object-cover' />
            </div>
            <span className="text-white text-2xl font-black tracking-tighter">EmelSwap</span>
        </Link>
    );
};
