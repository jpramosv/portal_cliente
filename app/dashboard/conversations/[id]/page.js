'use client'

import { getMessages, getConversation } from '@/app/actions/chatwoot'
import { Search, Phone, MoreVertical, Paperclip, Smile, Send, Sparkles, Mail, MapPin, Clock } from 'lucide-react'
import Link from 'next/link'
import MessageInput from './MessageInput'
import LabelManager from './LabelManager'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { use } from 'react'

export default function ConversationDetail({ params }) {
    // Unwrap params using React.use() as per Next.js 15+ patterns for async params in client components
    // or just assume standard prop access if older version, but let's be safe with async handling pattern
    // Actually in client components params relies on the framework passing them.
    // Let's use standard effect pattern which is reliable.

    // NOTE: Next.js 15+ params are async. We should await them properly or use wrapping.
    // Since we are in an async start inside useEffect, it's fine.

    const messagesEndRef = useRef(null)
    const [conversationId, setConversationId] = useState(null)
    const [messages, setMessages] = useState([])
    const [conversation, setConversation] = useState(null)
    const [contact, setContact] = useState(null)
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        let isMounted = true

        async function loadData() {
            setIsLoading(true)
            try {
                // Handle params being a promise in newer Next.js versions
                const resolvedParams = await params
                const id = resolvedParams?.id

                if (!id) return

                setConversationId(id)

                const [messagesResult, conversationResult] = await Promise.all([
                    getMessages(id),
                    getConversation(id)
                ])

                if (isMounted) {
                    setMessages(messagesResult.messages || [])
                    const convData = conversationResult.conversation
                    setConversation(convData)
                    setContact(convData?.meta?.sender || convData?.contact || {})
                    setError(messagesResult.error || conversationResult.error)
                }
            } catch (err) {
                console.error("Error loading conversation:", err)
                if (isMounted) setError(err.message)
            } finally {
                if (isMounted) setIsLoading(false)
            }
        }

        loadData()

        return () => { isMounted = false }
    }, [params])

    // Auto-scroll to bottom when messages load
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Silent refresh for polling and after sending message
    const refreshMessages = async () => {
        if (!conversationId) return
        try {
            const { messages: newMessages } = await getMessages(conversationId)
            if (newMessages) {
                setMessages(newMessages)
            }
        } catch (error) {
            console.error("Error refreshing messages:", error)
        }
    }

    // Polling for new messages
    useEffect(() => {
        if (!conversationId) return

        const interval = setInterval(() => {
            refreshMessages()
        }, 5000)

        return () => clearInterval(interval)
    }, [conversationId])

    const sortedMessages = messages || []

    // Helpers
    const contactName = contact?.name || 'Contato'
    const contactAvatar = contact?.thumbnail
    const contactEmail = contact?.email || 'Não informado'
    const contactLocation = contact?.location || 'Não informado' // Chatwoot often stores location in custom attributes
    const contactInitials = contactName.substring(0, 2).toUpperCase()

    // Loading State
    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
        )
    }

    return (
        <div className="flex h-full bg-gray-50">
            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                        {contactAvatar ? (
                            <div className="relative w-10 h-10 rounded-full overflow-hidden">
                                <Image src={contactAvatar} alt={contactName} fill className="object-cover" />
                            </div>
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm">
                                {contactInitials}
                            </div>
                        )}
                        <div>
                            <h1 className="text-base font-semibold text-gray-900">{contactName}</h1>
                            <p className="text-xs text-green-600 flex items-center gap-1">
                                <span className={`w-2 h-2 rounded-full ${conversation?.status === 'open' ? 'bg-green-600' : 'bg-gray-400'}`}></span>
                                {conversation?.status === 'open' ? 'Online' : 'Offline'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all">
                            <Search size={20} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all">
                            <Phone size={20} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all">
                            <MoreVertical size={20} />
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 px-6 py-3 text-red-800 text-sm border-b border-red-100">
                        Erro ao carregar conversa: {error}
                    </div>
                )}

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23e5e7eb\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}>
                    {sortedMessages.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                            Nenhuma mensagem nesta conversa.
                        </div>
                    ) : (
                        sortedMessages.map((msg) => {
                            const isOutgoing = msg.message_type === 1 || msg.message_type === 'outgoing'
                            const hasAttachments = msg.attachments && msg.attachments.length > 0

                            return (
                                <div key={msg.id} className={`flex w-full ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] px-4 py-2.5 rounded-lg shadow-sm ${isOutgoing
                                        ? 'bg-teal-600 text-white rounded-tr-none'
                                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                        }`}>

                                        {/* Render Attachments */}
                                        {hasAttachments && (
                                            <div className="space-y-2 mb-2">
                                                {msg.attachments.map(att => {
                                                    if (att.file_type === 'image') {
                                                        return (
                                                            <div key={att.id} className="relative rounded-lg overflow-hidden border border-gray-200/20">
                                                                <a href={att.data_url} target="_blank" rel="noopener noreferrer">
                                                                    <img
                                                                        src={att.data_url}
                                                                        alt="Imagem"
                                                                        className="max-w-full h-auto max-h-[300px] object-cover hover:opacity-95 transition-opacity"
                                                                    />
                                                                </a>
                                                            </div>
                                                        )
                                                    }
                                                    if (att.file_type === 'audio') {
                                                        return (
                                                            <div key={att.id} className="min-w-[240px]">
                                                                <audio controls className="w-full h-10 rounded-md">
                                                                    <source src={att.data_url} type={att.extension ? `audio/${att.extension}` : 'audio/mp3'} />
                                                                    Seu navegador não suporta áudio.
                                                                </audio>
                                                            </div>
                                                        )
                                                    }
                                                    if (att.file_type === 'video') {
                                                        return (
                                                            <div key={att.id} className="relative rounded-lg overflow-hidden border border-gray-200/20">
                                                                <video controls className="max-w-full h-auto max-h-[300px]">
                                                                    <source src={att.data_url} />
                                                                    Seu navegador não suporta vídeo.
                                                                </video>
                                                            </div>
                                                        )
                                                    }
                                                    // Default file fallback
                                                    return (
                                                        <a
                                                            key={att.id}
                                                            href={att.data_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={`flex items-center gap-3 p-3 rounded-md ${isOutgoing ? 'bg-teal-700/50 hover:bg-teal-700' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                                                        >
                                                            <div className="p-2 bg-white/10 rounded-full">
                                                                <Paperclip size={16} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium truncate">Anexo</p>
                                                                <p className="text-xs opacity-70 uppercase">{att.extension || 'Arquivo'}</p>
                                                            </div>
                                                        </a>
                                                    )
                                                })}
                                            </div>
                                        )}

                                        {/* Message Content */}
                                        {msg.content && (
                                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                        )}

                                        <div className={`text-[10px] mt-1 ${isOutgoing ? 'text-teal-100' : 'text-gray-400'} text-right`}>
                                            {new Date(msg.created_at * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Message Input Area */}
                {conversationId && <MessageInput conversationId={conversationId} onMessageSent={refreshMessages} />}
            </div>

            {/* Right Sidebar - Details Panel */}
            <aside className="w-80 border-l border-gray-200 bg-white overflow-y-auto hidden xl:block">
                {/* AI Summary Section */}
                <div className="p-5 border-b border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles size={16} className="text-indigo-600" />
                        <h3 className="text-sm font-semibold text-gray-900">Análise Inteligente</h3>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100">
                        <p className="text-xs text-gray-700 leading-relaxed">
                            Resumo indisponível para esta conversa no momento.
                        </p>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="p-5 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Informações</h3>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                <Mail size={16} className="text-gray-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500 mb-0.5">E-mail</p>
                                <p className="text-sm text-gray-900 font-medium truncate">{contactEmail}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                <MapPin size={16} className="text-gray-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500 mb-0.5">Localização</p>
                                <p className="text-sm text-gray-900 font-medium">{contactLocation}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div className="p-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Estatísticas</h3>
                    <div className="space-y-3">
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">Total de Mensagens</p>
                            <p className="text-2xl font-bold text-gray-900">{messages.length}</p>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    )
}
