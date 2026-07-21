import { useState } from 'react'
import { Sparkles, User, Copy, Check, AlertCircle, Award, Target, CheckCircle, Lightbulb } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user'
  const [copiedCode, setCopiedCode] = useState(null)

  const handleCopyCode = (codeText, idx) => {
    navigator.clipboard.writeText(codeText)
    setCopiedCode(idx)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  // Parse markdown content into formatted blocks (code blocks, headings, bold, lists)
  const renderFormattedText = (text) => {
    if (!text) return null

    // Split by code blocks
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
    const parts = []
    let lastIndex = 0
    let match

    let codeBlockIdx = 0
    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index),
        })
      }
      parts.push({
        type: 'code',
        language: match[1] || 'code',
        content: match[2].trim(),
        id: codeBlockIdx++,
      })
      lastIndex = match.index + match[0].length
    }

    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex),
      })
    }

    return parts.map((part, index) => {
      if (part.type === 'code') {
        return (
          <div key={index} className="my-3 rounded-xl border border-cyan-500/20 bg-[#07080e] overflow-hidden text-xs shadow-lg">
            <div className="flex items-center justify-between px-3 py-1.5 bg-[#0e101b] border-b border-white/5 text-text-muted font-mono text-[11px]">
              <span className="text-cyan-400 font-semibold">{part.language}</span>
              <button
                onClick={() => handleCopyCode(part.content, part.id)}
                className="flex items-center gap-1 hover:text-text-primary transition-colors text-[11px]"
              >
                {copiedCode === part.id ? (
                  <>
                    <Check className="h-3 w-3 text-semantic-green" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 text-text-muted" /> Copy
                  </>
                )}
              </button>
            </div>
            <pre className="p-3.5 overflow-x-auto font-mono leading-relaxed text-text-primary text-[12px]">
              <code>{part.content}</code>
            </pre>
          </div>
        )
      }

      // Render regular text paragraphs, lists, bold text
      const lines = part.content.split('\n')
      return (
        <div key={index} className="space-y-1.5 leading-relaxed text-xs sm:text-sm">
          {lines.map((line, lIdx) => {
            if (!line.trim()) return <div key={lIdx} className="h-1.5" />

            // Headings
            if (line.startsWith('### ')) {
              return <h3 key={lIdx} className="font-bold text-sm sm:text-base text-text-primary mt-2 mb-1">{parseInline(line.replace('### ', ''))}</h3>
            }
            if (line.startsWith('## ')) {
              return <h2 key={lIdx} className="font-bold text-base text-text-primary mt-2 mb-1">{parseInline(line.replace('## ', ''))}</h2>
            }
            if (line.startsWith('# ')) {
              return <h1 key={lIdx} className="font-bold text-lg text-text-primary mt-2 mb-1">{parseInline(line.replace('# ', ''))}</h1>
            }

            // Bullet points
            if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
              const clean = line.trim().substring(2)
              return (
                <div key={lIdx} className="flex gap-2 items-start pl-1">
                  <span className="text-cyan-400 shrink-0 mt-1">•</span>
                  <span>{parseInline(clean)}</span>
                </div>
              )
            }

            return <p key={lIdx}>{parseInline(line)}</p>
          })}
        </div>
      )
    })
  }

  // Parse inline bolding (**text**) and code (`text`)
  const parseInline = (str) => {
    const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g)
    return parts.map((chunk, i) => {
      if (chunk.startsWith('**') && chunk.endsWith('**')) {
        return <strong key={i} className="font-semibold text-text-primary">{chunk.slice(2, -2)}</strong>
      }
      if (chunk.startsWith('`') && chunk.endsWith('`')) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded bg-card border border-white/10 font-mono text-[11px] text-cyan-300">
            {chunk.slice(1, -1)}
          </code>
        )
      }
      return chunk
    })
  }

  return (
    <div className={`flex gap-3 my-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-md font-bold text-xs ${
          isUser
            ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white'
            : 'bg-gradient-to-tr from-cyan-500 via-indigo-500 to-fuchsia-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] border border-cyan-300/30'
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
      </div>

      {/* Message Content Container */}
      <div className="max-w-[88%] sm:max-w-[82%] space-y-2">
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm shadow-md ${
            isUser
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-xs'
              : 'bg-[#10111a]/95 border border-white/10 text-text-primary rounded-tl-xs backdrop-blur-md'
          }`}
        >
          {renderFormattedText(message.content)}

          {/* Embedded Preparation Analysis Card */}
          {message.type === 'analysis' && message.data && (
            <div className="mt-4 p-4 rounded-2xl bg-[#090a10] border border-white/10 space-y-4 text-text-primary text-xs shadow-inner">
              <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-cyan-400 shrink-0" />
                  <span className="font-semibold text-sm text-text-primary">Diagnostic Summary</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-cyan-400">{message.data.overallReadiness}%</span>
                  <span className="text-text-muted text-[10px] block">Readiness</span>
                </div>
              </div>

              <Progress value={message.data.overallReadiness || 0} className="h-2 bg-surface" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Weak Areas */}
                {message.data.weakAreas?.length > 0 && (
                  <div className="space-y-1.5 bg-surface/70 p-3 rounded-xl border border-white/5">
                    <div className="flex items-center gap-1.5 font-medium text-semantic-red text-[11px]">
                      <AlertCircle className="h-3.5 w-3.5" /> Weak Areas to Focus
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {message.data.weakAreas.map((area, i) => (
                        <Badge key={i} variant="destructive" className="text-[10px]">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strengths */}
                {message.data.strengths?.length > 0 && (
                  <div className="space-y-1.5 bg-surface/70 p-3 rounded-xl border border-white/5">
                    <div className="flex items-center gap-1.5 font-medium text-semantic-green text-[11px]">
                      <CheckCircle className="h-3.5 w-3.5" /> Core Strengths
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {message.data.strengths.map((str, i) => (
                        <Badge key={i} variant="success" className="text-[10px]">
                          {str}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Priority Actions */}
              {message.data.priorityActions?.length > 0 && (
                <div className="space-y-1.5 bg-surface/70 p-3 rounded-xl border border-white/5">
                  <div className="flex items-center gap-1.5 font-medium text-cyan-400 text-[11px]">
                    <Target className="h-3.5 w-3.5" /> Priority Action Items
                  </div>
                  <ul className="space-y-1 text-[11px] text-text-secondary">
                    {message.data.priorityActions.map((act, i) => (
                      <li key={i} className="flex gap-1.5 items-start">
                        <span className="text-cyan-400">•</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Embedded Interview Brief Card */}
          {message.type === 'brief' && message.data && (
            <div className="mt-4 p-4 rounded-2xl bg-[#090a10] border border-white/10 space-y-3 text-xs text-text-primary shadow-inner">
              {message.data.typicalInterviewProcess && (
                <div>
                  <h5 className="font-semibold text-cyan-400 mb-1">Typical Process</h5>
                  <p className="text-text-secondary leading-relaxed">{message.data.typicalInterviewProcess}</p>
                </div>
              )}
              {message.data.quickTips?.length > 0 && (
                <div>
                  <h5 className="font-semibold text-semantic-green mb-1 flex items-center gap-1">
                    <Lightbulb className="h-3.5 w-3.5" /> Quick Tips
                  </h5>
                  <ul className="list-disc pl-4 space-y-1 text-text-secondary">
                    {message.data.quickTips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div className={`text-[10px] text-text-muted ${isUser ? 'text-right' : 'text-left'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  )
}
