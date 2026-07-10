import { motion } from 'framer-motion'
import { LayoutDashboard, Code2, BookOpen, Sparkles, Youtube, FolderOpen, Timer, Terminal, ArrowRight, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function Landing() {
  const { user, signInWithGoogle, loading } = useAuth()
  const navigate = useNavigate()

  const handleStart = () => {
    if (user) {
      navigate('/dashboard')
    } else {
      signInWithGoogle()
    }
  }

  // Feature cards data
  const features = [
    {
      title: 'distraction-free lecture player',
      description: 'Import YouTube course playlists and write linked notes in a custom theater viewport with zero sidebar recommendations.',
      icon: Youtube,
      color: 'text-semantic-red bg-semantic-red/10 border-semantic-red/20',
    },
    {
      title: 'python playground',
      description: 'Write, debug, and save coding files locally in a sandbox compiler using client-side WebAssembly.',
      icon: Terminal,
      color: 'text-accent-light bg-accent/10 border-accent/25',
    },
    {
      title: 'timed mock assessment timer',
      description: 'Simulate high-pressure online assessment (OA) environments and Pomodoro focus rounds with browser reminders.',
      icon: Timer,
      color: 'text-semantic-yellow bg-semantic-yellow/10 border-semantic-yellow/20',
    },
    {
      title: 'AI coach & Brief generator',
      description: 'Scrape LeetCode/GFG URLs automatically. Analyze revision patterns, and forecast mock interview briefs.',
      icon: Sparkles,
      color: 'text-semantic-purple bg-semantic-purple-bg/30 border-semantic-purple-bg/50',
    },
    {
      title: 'Competency & Radar indices',
      description: 'Track DSA topics, computer science theory, and aptitude checklists with visual progress charts and radar indices.',
      icon: BookOpen,
      color: 'text-semantic-green bg-semantic-green/10 border-semantic-green/20',
    },
    {
      title: 'Resource library vault',
      description: 'Upload note screenshots and syllabus PDFs with offline Base64 compression and secure browser blob views.',
      icon: FolderOpen,
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    },
  ]

  return (
    <div className="min-h-screen bg-[#060609] text-text-primary relative overflow-hidden font-sans selection:bg-accent/20">
      
      {/* Decorative Glow Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-semantic-purple/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Navigation Ribbon */}
      <nav className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between border-b border-border-subtle/30 relative z-10">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center">
            <Code2 className="h-4.5 w-4.5 text-accent-light" />
          </div>
          <span className="font-bold text-sm tracking-tight text-white uppercase">PlacementTracker</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleStart}
          disabled={loading}
          className="text-xs bg-elevated border border-border hover:bg-hover text-text-primary h-8"
        >
          {user ? 'Console' : 'Sign In'}
        </Button>
      </nav>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto text-center px-6 pt-16 pb-20 relative z-10 space-y-8">
        
        {/* Animated Banner Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border-subtle/80 text-micro text-text-secondary font-medium tracking-wide shadow-sm"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-accent-light" />
          <span>The Ultimate Distraction-Free Study Center</span>
        </motion.div>

        {/* Hero Title */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-4"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
            Crack your dream placements <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-accent-light via-semantic-purple to-semantic-purple bg-clip-text text-transparent">
              without the distraction.
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-secondary text-text-secondary text-sm sm:text-base leading-relaxed">
            Consolidate your DSA logs, YouTube lectures, local code files, and mock assessments in one secure, unified, ad-free command cockpit.
          </p>
        </motion.div>

        {/* CTA Actions */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center"
        >
          <Button
            size="lg"
            onClick={handleStart}
            disabled={loading}
            className="flex items-center gap-2 text-sm px-8 py-6 rounded-xl font-bold bg-accent hover:bg-accent-light text-white hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-accent/20"
          >
            {user ? 'Enter Command Center' : 'Get Started with Google'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </section>

      {/* Features Overview Grid */}
      <section className="max-w-6xl mx-auto px-6 pb-24 relative z-10 space-y-10">
        <div className="text-center space-y-1.5">
          <h2 className="text-section font-extrabold text-white">Full Suite Feature Deck</h2>
          <p className="text-xs text-text-secondary max-w-md mx-auto">Everything you need to accelerate your technical and aptitude preparation</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const IconComponent = feat.icon
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.05 + 0.3 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-card border border-border-subtle/50 rounded-2xl p-5 hover:border-border-hover/80 transition-all shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center border", feat.color)}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">{feat.title}</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">{feat.description}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Footer copyright */}
      <footer className="border-t border-border-subtle/30 py-8 relative z-10 text-center">
        <p className="text-[10px] text-text-muted">
          © {new Date().getFullYear()} PlacementTracker. Prepare with confidence.
        </p>
      </footer>
    </div>
  )
}
