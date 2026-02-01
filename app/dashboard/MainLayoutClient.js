'use client'

import LeftNav from './LeftNav'

export default function MainLayoutClient({ children, signoutAction }) {
    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Global Left Navigation */}
            <LeftNav />

            {/* Main Content Area */}
            {/* Added ml-[140px] to account for fixed LeftNav width */}
            <div className="flex-1 ml-[140px] flex flex-col min-h-screen">
                <main className="flex-1 h-full">
                    {children}
                </main>
            </div>
        </div>
    )
}
