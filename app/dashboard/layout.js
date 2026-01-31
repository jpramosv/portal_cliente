import { signout } from '@/app/actions/auth'
import Link from 'next/link'
import { LayoutDashboard, MessageSquare, LogOut, Users, Calendar } from 'lucide-react'

export default function DashboardLayout({ children }) {
    return (
        <div className="min-h-screen bg-gray-50 flex">
            <aside className="w-64 bg-white shadow-xl inset-y-0 fixed z-10 hidden md:flex flex-col">
                <div className="h-16 flex items-center justify-center border-b px-6">
                    <span className="text-2xl mr-2">🦷</span>
                    <span className="text-lg font-bold text-gray-800">Lopes Odonto</span>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    <Link href="/dashboard" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors">
                        <LayoutDashboard size={20} />
                        <span className="font-medium">Visão Geral</span>
                    </Link>
                    <Link href="/dashboard/agenda" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors">
                        <Calendar size={20} />
                        <span className="font-medium">Agenda</span>
                    </Link>
                    <Link href="/dashboard/conversations" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors">
                        <MessageSquare size={20} />
                        <span className="font-medium">Conversas</span>
                    </Link>
                    <Link href="/dashboard/crm" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors">
                        <Users size={20} />
                        <span className="font-medium">CRM</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <form action={signout}>
                        <button type="submit" className="flex w-full items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <LogOut size={20} />
                            <span className="font-medium">Sair</span>
                        </button>
                    </form>
                </div>
            </aside>

            <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
                <main className="flex-1 p-6 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
