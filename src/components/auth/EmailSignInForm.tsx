'use client'

import { useState } from 'react'
import { Mail, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface EmailSignInFormProps {
  nextPath?: string
}

export function EmailSignInForm({ nextPath = '/vendor/dashboard' }: EmailSignInFormProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim().toLowerCase()
    if (!trimmed || !trimmed.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
        nextPath
      )}`

      const { error } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: {
          emailRedirectTo,
        },
      })

      if (error) {
        toast.error(error.message || 'Failed to send login link')
        setLoading(false)
        return
      }

      setSent(true)
      toast.success('Login link sent! Check your email inbox.')
    } catch {
      toast.error('Unable to send login link. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-center space-y-2">
        <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mx-auto" />
        <p className="text-xs font-bold text-foreground">Login link sent to {email}</p>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Click the link in your email to instantly access your vendor storefront. You can close this tab.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="text-[11px] text-[#0F6E6E] dark:text-[#E8B84A] font-semibold hover:underline pt-1"
        >
          Use a different email
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleEmailSubmit} className="space-y-2.5">
      <div className="relative">
        <label htmlFor="auth-email-input" className="sr-only">
          Email address
        </label>
        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          id="auth-email-input"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vendor@example.com"
          className="w-full h-11 pl-10 pr-3 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:border-[#0F6E6E] focus:outline-none focus:ring-2 focus:ring-[#0F6E6E]/15 transition-all"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 rounded-xl bg-foreground text-background font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer shadow-2xs"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Sending secure link...</span>
          </>
        ) : (
          <>
            <span>Send Magic Login Link</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  )
}
