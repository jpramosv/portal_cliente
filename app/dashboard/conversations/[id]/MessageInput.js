'use client'

import { useState, useEffect, useRef } from 'react'
import { sendMessage, sendMessageWithAttachment } from '@/app/actions/chatwoot'
import { Send, Loader2, Mic, Paperclip, Smile, X, StopCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function MessageInput({ conversationId }) {
    const [message, setMessage] = useState('')
    const [sending, setSending] = useState(false)
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [isRecording, setIsRecording] = useState(false)
    const [recordingTime, setRecordingTime] = useState(0)
    const [selectedFile, setSelectedFile] = useState(null)
    const router = useRouter()

    const mediaRecorderRef = useRef(null)
    const audioChunksRef = useRef([])
    const recordingIntervalRef = useRef(null)
    const fileInputRef = useRef(null)
    const textareaRef = useRef(null)

    useEffect(() => {
        // Poll for new messages every 5 seconds
        const interval = setInterval(() => {
            router.refresh()
        }, 5000)

        return () => clearInterval(interval)
    }, [router])

    // Common emojis for quick access
    const commonEmojis = ['😊', '😂', '❤️', '👍', '🙏', '😢', '😍', '🎉', '👏', '🔥', '✅', '❌', '⚠️', '📅', '📞', '💰']

    const insertEmoji = (emoji) => {
        const textarea = textareaRef.current
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const newMessage = message.substring(0, start) + emoji + message.substring(end)

        setMessage(newMessage)
        setShowEmojiPicker(false)

        // Restore cursor position after emoji insertion
        setTimeout(() => {
            textarea.focus()
            textarea.setSelectionRange(start + emoji.length, start + emoji.length)
        }, 0)
    }

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mediaRecorder = new MediaRecorder(stream)

            mediaRecorderRef.current = mediaRecorder
            audioChunksRef.current = []

            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data)
            }

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
                await sendAudioMessage(audioBlob)

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop())
            }

            mediaRecorder.start()
            setIsRecording(true)
            setRecordingTime(0)

            // Start timer
            recordingIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1)
            }, 1000)

        } catch (error) {
            console.error('Error accessing microphone:', error)
            alert('Não foi possível acessar o microfone. Verifique as permissões.')
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
            clearInterval(recordingIntervalRef.current)
        }
    }

    const cancelRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
            setIsRecording(false)
            setRecordingTime(0)
            clearInterval(recordingIntervalRef.current)
            audioChunksRef.current = []
        }
    }

    const sendAudioMessage = async (audioBlob) => {
        setSending(true)
        try {
            const audioFile = new File([audioBlob], `audio-${Date.now()}.webm`, { type: 'audio/webm' })
            const { error } = await sendMessageWithAttachment(conversationId, '🎤 Áudio', audioFile)

            if (error) {
                alert('Erro ao enviar áudio: ' + error)
            } else {
                router.refresh()
            }
        } catch (err) {
            console.error(err)
            alert('Erro inesperado ao enviar áudio')
        } finally {
            setSending(false)
        }
    }

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
        }
    }

    const removeSelectedFile = () => {
        setSelectedFile(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    async function handleSubmit(e) {
        e.preventDefault()
        if ((!message.trim() && !selectedFile) || sending) return

        setSending(true)
        try {
            let result
            if (selectedFile) {
                result = await sendMessageWithAttachment(conversationId, message || '📎 Arquivo', selectedFile)
            } else {
                result = await sendMessage(conversationId, message)
            }

            if (result.error) {
                alert('Erro ao enviar mensagem: ' + result.error)
            } else {
                setMessage('')
                setSelectedFile(null)
                if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                }
                router.refresh()
            }
        } catch (err) {
            console.error(err)
            alert('Erro inesperado')
        } finally {
            setSending(false)
        }
    }

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className="p-4 bg-white border-t border-gray-100 relative">
            {/* Recording Polished Overlay */}
            {isRecording && (
                <div className="absolute inset-x-4 inset-y-2 bg-red-50/95 backdrop-blur-sm z-10 rounded-xl flex items-center justify-between px-4 border border-red-100 shadow-sm animate-fade-in">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-ping absolute opacity-75"></div>
                            <div className="w-3 h-3 bg-red-500 rounded-full relative"></div>
                        </div>
                        <span className="text-sm font-semibold text-red-700">Gravando...</span>
                        <span className="text-sm font-mono text-red-600 w-12">{formatTime(recordingTime)}</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={cancelRecording}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                            title="Cancelar"
                        >
                            <X size={18} />
                        </button>
                        <button
                            onClick={stopRecording}
                            className="bg-red-600 text-white px-4 py-1.5 rounded-full hover:bg-red-700 flex items-center gap-2 shadow-sm transition-all hover:shadow-md"
                        >
                            <Send size={16} />
                            <span className="text-xs font-bold uppercase tracking-wide">Enviar</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Selected file preview */}
            {selectedFile && (
                <div className="mb-3 flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-lg p-3 animate-fade-in">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                            <Paperclip size={16} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-indigo-900 truncate max-w-[200px]">{selectedFile.name}</span>
                            <span className="text-[10px] text-indigo-500 font-mono">
                                {(selectedFile.size / 1024).toFixed(1)} KB
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={removeSelectedFile}
                        className="text-indigo-400 hover:text-indigo-600 p-1.5 hover:bg-indigo-100 rounded-full transition-colors"
                        title="Remover arquivo"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Emoji picker */}
            {showEmojiPicker && (
                <div className="absolute bottom-full left-4 mb-2 bg-white border border-gray-100 rounded-xl shadow-xl p-3 w-72 animate-fade-in z-20">
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-50">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Reações Rápidas</span>
                        <button
                            onClick={() => setShowEmojiPicker(false)}
                            className="text-gray-300 hover:text-gray-500"
                        >
                            <X size={14} />
                        </button>
                    </div>
                    <div className="grid grid-cols-8 gap-1.5">
                        {commonEmojis.map((emoji, idx) => (
                            <button
                                key={idx}
                                onClick={() => insertEmoji(emoji)}
                                className="text-xl hover:bg-indigo-50 rounded p-1 transition-transform hover:scale-110"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex gap-3 items-end">
                <div className="flex gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
                    {/* Emoji button */}
                    <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className={`p-2 rounded-lg transition-all active:scale-95 ${showEmojiPicker
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-gray-400 hover:bg-white hover:text-gray-600 hover:shadow-sm'
                            }`}
                        title="Emojis"
                    >
                        <Smile size={20} />
                    </button>

                    {/* File attachment button */}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-2 rounded-lg transition-all active:scale-95 ${selectedFile
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-gray-400 hover:bg-white hover:text-gray-600 hover:shadow-sm'
                            }`}
                        title="Anexar arquivo"
                        disabled={isRecording}
                    >
                        <Paperclip size={20} />
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileSelect}
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx,.txt"
                    />

                    {/* Audio recording button */}
                    <button
                        type="button"
                        onClick={startRecording}
                        className={`p-2 rounded-lg transition-all active:scale-95 hover:bg-red-50 text-gray-400 hover:text-red-500`}
                        title="Gravar áudio"
                        disabled={sending || isRecording}
                    >
                        <Mic size={20} />
                    </button>
                </div>

                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleSubmit(e)
                            }
                        }}
                        placeholder="Digite sua mensagem..."
                        className="w-full bg-gray-50 border-gray-100 rounded-xl shadow-inner focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 p-3 min-h-[46px] max-h-32 resize-none transition-all placeholder:text-gray-400 text-sm"
                        rows={1}
                        disabled={isRecording}
                    />
                </div>

                <button
                    type="submit"
                    disabled={sending || (!message.trim() && !selectedFile) || isRecording}
                    className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-indigo-200 active:scale-95 flex-shrink-0"
                >
                    {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                </button>
            </form>
        </div>
    )
}
