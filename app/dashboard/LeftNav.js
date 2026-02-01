'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageCircle, CheckCircle2, Trello, Calendar, Settings, LayoutDashboard } from 'lucide-react'

export default function LeftNav() {
    const pathname = usePathname()

    const menuItems = [
        {
            id: 'dashboard',
            label: 'Visão Geral',
            icon: LayoutDashboard,
            href: '/dashboard',
            exact: true,
            color: 'gray'
        },
        {
            id: 'whatsapp',
            label: 'WhatsApp',
            icon: MessageCircle,
            href: '/dashboard/conversations',
            badge: 'Hoje',
            color: 'teal'
        },
        {
            id: 'kanban',
            label: 'Kanban',
            icon: Trello,
            href: '/dashboard/crm',
            color: 'blue'
        },
        {
            id: 'agenda',
            label: 'Agenda',
            icon: Calendar,
            href: '/dashboard/agenda',
            color: 'purple'
        },
        {
            id: 'settings',
            label: 'Config',
            icon: Settings,
            href: '/dashboard/settings',
            color: 'gray'
        }
    ]

    return (
        <aside className="w-[140px] bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 z-50">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 h-16 flex items-center">
                <div className="flex flex-col items-start">
                    <h1 className="text-sm font-bold text-gray-900 tracking-tight">CRM Plus</h1>
                    <p className="text-[10px] text-gray-500 mt-0.5">Gestão Inteligente</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const Icon = item.icon
                    // Logic to determine active state
                    const isActive = item.exact
                        ? pathname === item.href
                        : pathname.startsWith(item.href)

                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={`
                                flex flex-col items-center justify-center p-3 rounded-lg transition-all group
                                ${isActive
                                    ? 'bg-teal-600 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-50'}
                            `}
                        >
                            <div className="relative">
                                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                {item.badge && (
                                    <span className={`absolute -top-1 -right-1 text-[8px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-red-500 text-white' : 'bg-red-100 text-red-600'}`}>
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                            <span className={`text-[10px] mt-1.5 font-medium ${isActive ? 'font-semibold' : ''}`} >
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </nav>
        </aside>
    )
}
