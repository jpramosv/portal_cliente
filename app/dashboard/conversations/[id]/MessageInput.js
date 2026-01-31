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
        <div className="p-4 bg-white border-t border-gray-100">
            {/* Recording indicator */}
            {isRecording && (
                <div className="mb-3 flex items-center justify-between bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-red-700">Gravando áudio...</span>
                        <span className="text-sm text-red-600">{formatTime(recordingTime)}</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={cancelRecording}
                            className="text-red-600 hover:text-red-700 p-1"
                            title="Cancelar"
                        >
                            <X size={20} />
                        </button>
                        <button
                            onClick={stopRecording}
                            className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 flex items-center gap-1"
                        >
                            <StopCircle size={16} />
                            Enviar
                        </button>
                    </div>
                </div>
            )}

            {/* Selected file preview */}
            {selectedFile && (
                <div className="mb-3 flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Paperclip size={16} className="text-indigo-600 flex-shrink-0" />
                        <span className="text-sm text-indigo-700 truncate">{selectedFile.name}</span>
                        <span className="text-xs text-indigo-500 flex-shrink-0">
                            ({(selectedFile.size / 1024).toFixed(1)} KB)
                        </span>
                    </div>
                    <button
                        onClick={removeSelectedFile}
                        className="text-indigo-600 hover:text-indigo-700 p-1 flex-shrink-0"
                        title="Remover arquivo"
                    >
                        <X size={20} />
                    </button>
                </div>
            )}

            {/* Emoji picker */}
            {showEmojiPicker && (
                <div className="mb-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">Emojis comuns</span>
                        <button
                            onClick={() => setShowEmojiPicker(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X size={16} />
                        </button>
                    </div>
                    <div className="grid grid-cols-8 gap-2">
                        {commonEmojis.map((emoji, idx) => (
                            <button
                                key={idx}
                                onClick={() => insertEmoji(emoji)}
                                className="text-2xl hover:bg-gray-200 rounded p-1 transition-colors"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex gap-2">
                <div className="flex gap-1">
                    {/* Emoji button */}
                    <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className={`p-2 rounded-lg transition-colors ${showEmojiPicker
                                ? 'bg-indigo-100 text-indigo-600'
                                : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                            }`}
                        title="Emojis"
                    >
                        <Smile size={20} />
                    </button>

                    {/* File attachment button */}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-2 rounded-lg transition-colors ${selectedFile
                                ? 'bg-indigo-100 text-indigo-600'
                                : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
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
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`p-2 rounded-lg transition-colors ${isRecording
                                ? 'bg-red-100 text-red-600'
                                : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                            }`}
                        title={isRecording ? "Parar gravação" : "Gravar áudio"}
                        disabled={sending}
                    >
                        <Mic size={20} />
                    </button>
                </div>

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
                    placeholder="Digite sua resposta..."
                    className="flex-1 border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border resize-none"
                    rows={1}
                    disabled={isRecording}
                />

                <button
                    type="submit"
                    disabled={sending || (!message.trim() && !selectedFile) || isRecording}
                    className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors self-end"
                >
                    {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                </button>
            </form>
        </div>
    )
}
