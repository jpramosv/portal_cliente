import React from 'react';

const MetricCard = ({ title, value, icon, subtext, trend }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</h3>
                {icon && <span className="text-gray-400 bg-gray-50 p-2 rounded-lg">{icon}</span>}
            </div>
            <div>
                <div className="text-3xl font-bold text-gray-900">{value}</div>
                {(subtext || trend) && (
                    <p className={`text-xs mt-1 flex items-center gap-1 ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
                        {trend === 'up' && '↑'} {trend === 'down' && '↓'} {subtext}
                    </p>
                )}
            </div>
        </div>
    );
};

export default MetricCard;
