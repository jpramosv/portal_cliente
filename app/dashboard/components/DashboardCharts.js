'use client';
import React from 'react';

const DashboardCharts = ({ data }) => {
    const maxInteractions = Math.max(...data.map(d => d.total_interactions), 10); // Find max for scaling, min 10

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Interações Semanais</h3>

            {data.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-gray-400">
                    Sem dados para exibir
                </div>
            ) : (
                <div className="h-64 flex items-end justify-between gap-2">
                    {data.map((item, index) => {
                        const heightPercentage = (item.total_interactions / maxInteractions) * 100;
                        // Format date as DD/MM
                        const dateLabel = new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

                        return (
                            <div key={index} className="flex flex-col items-center justify-end w-full group">
                                <div className="relative w-full flex justify-end flex-col items-center h-full">
                                    <div
                                        className="w-full max-w-[40px] bg-blue-500 rounded-t-sm hover:bg-blue-600 transition-all duration-300 relative group-hover:opacity-90"
                                        style={{ height: `${heightPercentage}%`, minHeight: '4px' }}
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                            {item.total_interactions}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-500 mt-2 font-medium">{dateLabel}</span>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
};

export default DashboardCharts;
