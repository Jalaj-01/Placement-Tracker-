import { useState, useRef, useEffect } from 'react'
import { Sparkles, X, Send, Trash2, Maximize2, Loader2, Gauge, Code, BookOpen } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useProblems } from '@/hooks/useProblems'
import { useTopics } from '@/hooks/useTopics'
import { useApplications } from '@/hooks/useApplications'
import { useStreak } from '@/hooks/useStreak'
import { useAIChat } from '@/hooks/useAIChat'
import ChatMessage from './ChatMessage'

export default function AllyCapsuleWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  const { user } = useAuth()
  const { problems } = useProblems(user?.uid)
  const { topics } = useTopics(user?.uid)
  const { applications } = useApplications(user?.uid)
  const { streakData } = useStreak(user?.uid)

  const { messages, loading, sendMessage, runAnalyzePrep, clearChat } = useAIChat()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  // Hide floating capsule widget when on /ai-coach page to avoid duplicate UI
  if (location.pathname === '/ai-coach') {
    return null
  }

  const handleSend = async (e) => {
    e?.preventDefault()
    if (!input.trim() || loading) return

    const txt = input.trim()
    setInput('')
    await sendMessage(txt, {
      problemsCount: problems.length,
      topicsCount: topics.length,
      applicationsCount: applications.length,
    })
  }

  const handleRunAnalyze = () => {
    runAnalyzePrep({
      problems,
      topics,
      applications,
      streakData,
    })
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Floating Glassmorphic Chat Popup Window - Right Side */}
      {isOpen && (
        <div className="w-[90vw] sm:w-[400px] md:w-[440px] h-[530px] max-h-[82vh] rounded-[32px] border border-white/10 bg-[#090a10]/95 backdrop-blur-2xl shadow-[0_25px_70px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="px-5 py-4 bg-[#11121d]/80 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8.5 w-8.5 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-fuchsia-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] border border-cyan-300/30">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-text-primary tracking-wide">Kai</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" /> Active v2.0
                  </span>
                </div>
                <p className="text-[11px] text-text-muted">AI Placement & Coding Coach</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setIsOpen(false)
                  navigate('/ai-coach')
                }}
                className="p-1.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
                title="Expand to Full Screen Kai AI Coach"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={clearChat}
                className="p-1.5 rounded-xl text-text-muted hover:text-semantic-red hover:bg-white/10 transition-colors"
                title="Clear Chat History"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick Action Chips */}
          <div className="px-4 py-2.5 bg-[#0e0f18]/80 border-b border-white/5 flex gap-2 overflow-x-auto text-[11px] scrollbar-none">
            <button
              onClick={handleRunAnalyze}
              disabled={loading}
              className="px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Gauge className="h-3 w-3 text-cyan-400" /> Analyze Prep
            </button>
            <button
              onClick={() => setInput('Debug this code logic for me: ')}
              className="px-3 py-1.5 rounded-full bg-[#151725] border border-white/10 hover:border-white/20 text-text-secondary hover:text-text-primary whitespace-nowrap flex items-center gap-1.5 transition-all"
            >
              <Code className="h-3 w-3 text-text-muted" /> Debug Code
            </button>
            <button
              onClick={() => setInput('Explain LRU Cache algorithm with time complexity')}
              className="px-3 py-1.5 rounded-full bg-[#151725] border border-white/10 hover:border-white/20 text-text-secondary hover:text-text-primary whitespace-nowrap flex items-center gap-1.5 transition-all"
            >
              <BookOpen className="h-3 w-3 text-semantic-green" /> Explain Topic
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#06070c]/50">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {loading && (
              <div className="flex gap-2 items-center text-xs text-cyan-300 p-2 font-mono animate-pulse">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" /> Kai is analyzing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSend} className="p-3.5 bg-[#0d0e18] border-t border-white/5 flex gap-2 items-center">
            <input
              type="text"
              placeholder="Ask Kai any doubt or placement question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 bg-[#151726] border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-cyan-400 transition-all placeholder:text-text-muted"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white flex items-center justify-center disabled:opacity-40 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Futuristic AI Capsule Pill Button for Kai */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative p-[1.5px] rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 shadow-[0_0_25px_rgba(99,102,241,0.4)] hover:shadow-[0_0_35px_rgba(99,102,241,0.7)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
        title="Open Kai AI Assistant"
      >
        <div className="px-4.5 py-2.5 rounded-full bg-[#0a0b12]/95 backdrop-blur-xl flex items-center gap-2.5">
          {/* Glowing Orb Sparkle Circle */}
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 text-white shadow-inner group-hover:rotate-12 transition-transform">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>

          {/* Kai AI Name */}
          <span className="text-xs sm:text-sm font-bold tracking-wider text-white">Kai</span>

          {/* Neon Live Pulse Dot */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400" />
          </span>
        </div>
      </button>
    </div>
  )
}
