'use client'

import { getMessages } from '@/app/actions/chatwoot'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import MessageInput from './MessageInput'
import LabelManager from './LabelManager'
import { useEffect, useRef, useState } from 'react'

export default function ConversationDetail({ params }) {
    const messagesEndRef = useRef(null)
    const [conversationId, setConversationId] = useState(null)
    const [messages, setMessages] = useState([])
    const [error, setError] = useState(null)

    useEffect(() => {
        async function loadData() {
            const { id } = await params
            setConversationId(id)
            const result = await getMessages(id)
            setMessages(result.messages || [])
            setError(result.error)
        }
        loadData()
    }, [params])

    // Auto-scroll to bottom when messages load
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const sortedMessages = messages || []

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center">
                    <Link href="/dashboard/conversations" className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={20} className="text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">Conversa #{conversationId}</h1>
                    </div>
                </div>
                <div>
                    <LabelManager conversationId={conversationId} />
                </div>
            </div>

            {error && (
                <div className="bg-red-50 p-4 text-red-800 text-sm">
                    Erro ao carregar mensagens: {error}
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
                {sortedMessages.map((msg) => {
                    const isOutgoing = msg.message_type === 1

                    return (
                        <div key={msg.id} className={`flex w-full mb-4 ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] px-5 py-3.5 shadow-sm relative group ${isOutgoing
                                ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm shadow-indigo-200/50'
                                : 'bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-sm shadow-sm'
                                }`}>
                                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                <div className={`text-[10px] mt-1.5 flex items-center gap-1 ${isOutgoing ? 'justify-end text-indigo-100/80' : 'text-gray-400'}`}>
                                    {new Date(msg.created_at * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {isOutgoing && <span className="opacity-0 group-hover:opacity-100 transition-opacity">✓</span>}
                                </div>
                            </div>
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </div>

            <MessageInput conversationId={conversationId} />
        </div>
    )
}
