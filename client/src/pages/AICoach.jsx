import { useState, useRef, useEffect } from 'react'
import { Sparkles, Send, Trash2, Gauge, Code, Building, BookOpen, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useProblems } from '@/hooks/useProblems'
import { useTopics } from '@/hooks/useTopics'
import { useApplications } from '@/hooks/useApplications'
import { useStreak } from '@/hooks/useStreak'
import { useAIChat } from '@/hooks/useAIChat'
import ChatMessage from '@/components/ai/ChatMessage'
import { Button } from '@/components/ui/button'

export default function AICoach() {
  const { user } = useAuth()
  const { problems } = useProblems(user?.uid)
  const { topics } = useTopics(user?.uid)
  const { applications } = useApplications(user?.uid)
  const { streakData } = useStreak(user?.uid)

  const { messages, loading, sendMessage, runAnalyzePrep, runInterviewBrief, clearChat } = useAIChat()
  const [input, setInput] = useState('')
  const [showBriefInput, setShowBriefInput] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [role, setRole] = useState('')

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e) => {
    e?.preventDefault()
    if (!input.trim() || loading) return

    const text = input.trim()
    setInput('')
    await sendMessage(text, {
      problemsCount: problems.length,
      topicsCount: topics.length,
      applicationsCount: applications.length,
    })
  }

  const handleAnalyzePrepClick = () => {
    runAnalyzePrep({
      problems,
      topics,
      applications,
      streakData,
    })
  }

  const handleGenerateBriefSubmit = (e) => {
    e.preventDefault()
    if (!companyName.trim()) return
    runInterviewBrief({
      companyName: companyName.trim(),
      role: role.trim() || 'Software Engineer',
      weakTopics: topics.filter((t) => t.status === 'weak' || t.status === 'learning').map((t) => t.name),
      strongTopics: topics.filter((t) => t.status === 'mastered').map((t) => t.name),
    })
    setCompanyName('')
    setRole('')
    setShowBriefInput(false)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5.5rem)] max-w-5xl mx-auto px-2 sm:px-4 relative">
      {/* Ultra-Modern Top Header Bar */}
      <div className="py-3.5 px-2 flex flex-wrap items-center justify-between gap-3 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-9.5 w-9.5 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-fuchsia-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] border border-cyan-300/30">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-section font-extrabold text-text-primary tracking-wide">Kai AI Coach</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" /> Kai v2.0
              </span>
            </div>
            <p className="text-secondary text-text-secondary">Ask doubts, debug code, or run preparation diagnostics</p>
          </div>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleAnalyzePrepClick}
            disabled={loading}
            className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center gap-2 transition-all"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gauge className="h-4 w-4" />}
            Analyze Prep
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={clearChat}
            className="h-9 text-xs text-text-secondary border-white/10 hover:bg-white/10 flex items-center gap-1.5 rounded-xl"
            title="Clear Chat History"
          >
            <Trash2 className="h-4 w-4 text-text-muted" /> Clear Chat
          </Button>
        </div>
      </div>

      {/* Main Chat Stream Container */}
      <div className="flex-1 py-4 overflow-y-auto space-y-4 pr-1 pb-36 scrollbar-none">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {loading && (
          <div className="flex items-center gap-3 my-4 p-3.5 rounded-2xl bg-[#0f101b] border border-cyan-500/20 text-cyan-300 text-xs font-mono animate-pulse w-fit">
            <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
            <span>Kai is processing & generating insights...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Modal / Popover for Interview Brief Inputs */}
      {showBriefInput && (
        <div className="absolute bottom-32 left-4 right-4 z-20 p-4 bg-[#0e0f18]/95 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl animate-in fade-in">
          <form onSubmit={handleGenerateBriefSubmit} className="max-w-xl mx-auto space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                <Building className="h-4 w-4 text-cyan-400" /> Company Interview Brief Generator
              </h4>
              <button
                type="button"
                onClick={() => setShowBriefInput(false)}
                className="text-micro text-text-muted hover:text-text-primary"
              >
                Cancel
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Company Name (e.g. Google, Amazon)"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="bg-card border border-white/10 rounded-xl px-3 py-2 text-xs text-text-primary outline-none focus:border-cyan-400"
                required
              />
              <input
                type="text"
                placeholder="Role (e.g. SDE-1, Frontend Developer)"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="bg-card border border-white/10 rounded-lg px-3 py-2 text-xs text-text-primary outline-none focus:border-cyan-400"
              />
            </div>
            <Button type="submit" size="sm" className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-xs font-semibold">
              Generate Brief
            </Button>
          </form>
        </div>
      )}

      {/* Futuristic Hanging Capsule-Shaped Floating ChatGPT Input Bar for Kai */}
      <div className="absolute bottom-4 left-0 right-0 z-10 px-2 sm:px-4 pointer-events-none">
        <div className="max-w-3xl mx-auto p-3.5 bg-[#0d0e18]/95 backdrop-blur-2xl border border-cyan-500/30 shadow-[0_15px_50px_rgba(0,0,0,0.8)] rounded-[32px] space-y-2.5 pointer-events-auto ring-1 ring-white/10">
          {/* Action Chips in Neon Capsule Pills */}
          <div className="flex items-center gap-2 overflow-x-auto px-1 scrollbar-none text-xs">
            <button
              onClick={handleAnalyzePrepClick}
              disabled={loading}
              className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border border-cyan-500/40 hover:border-cyan-300 text-cyan-300 font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 shadow-sm"
            >
              <Gauge className="h-3.5 w-3.5 text-cyan-400" /> Analyze Prep
            </button>
            <button
              onClick={() => setInput('Explain Dijkstra algorithm with a step-by-step code example in Python')}
              className="px-3.5 py-1.5 rounded-full bg-[#161827] border border-white/10 hover:border-white/20 text-text-secondary hover:text-text-primary whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0"
            >
              <Code className="h-3.5 w-3.5 text-text-muted" /> Explain Algorithm
            </button>
            <button
              onClick={() => setShowBriefInput(true)}
              className="px-3.5 py-1.5 rounded-full bg-[#161827] border border-white/10 hover:border-white/20 text-text-secondary hover:text-text-primary whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0"
            >
              <Building className="h-3.5 w-3.5 text-semantic-green" /> Interview Brief
            </button>
            <button
              onClick={() => setInput('What are the top OS concepts asked in tech interviews?')}
              className="px-3.5 py-1.5 rounded-full bg-[#161827] border border-white/10 hover:border-white/20 text-text-secondary hover:text-text-primary whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0"
            >
              <BookOpen className="h-3.5 w-3.5 text-semantic-yellow" /> Core CS Topics
            </button>
          </div>

          {/* Capsule Form Input Container */}
          <form onSubmit={handleSend} className="relative flex items-center bg-[#151726] border border-white/10 hover:border-white/20 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-500/20 rounded-full px-4 py-2 shadow-inner transition-all">
            <input
              type="text"
              placeholder="Message Kai... Ask any doubt, code question, or placement query (Press Enter to send)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="w-full bg-transparent text-xs sm:text-sm text-text-primary outline-none py-1 pr-10 border-none focus:ring-0 placeholder:text-text-muted"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2.5 h-8.5 w-8.5 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white flex items-center justify-center disabled:opacity-40 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all shrink-0"
              title="Send Message"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
