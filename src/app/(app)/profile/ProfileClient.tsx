'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  UserCircle,
  Store,
  ShoppingBag,
  ArrowLeftRight,
  BadgeCheck,
  ShieldAlert,
  LogOut,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { UserProfile, Vendor } from '@/lib/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { UserAvatar } from '@/components/brand/UserAvatar'

interface ProfileClientProps {
  user: { id: string; email?: string }
  profile: UserProfile
  vendor: Vendor | null
}

export function ProfileClient({ user, profile, vendor }: ProfileClientProps) {
  const router = useRouter()
  const [fullName, setFullName] = useState(profile.full_name || '')
  const [activeMode, setActiveMode] = useState<'buyer' | 'vendor'>(
    profile.active_mode || (vendor ? 'vendor' : 'buyer')
  )
  const [saving, setSaving] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      const res = await fetch('/api/user/delete-account', {
        method: 'POST',
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        toast.error(data.error || 'Failed to delete account')
        return
      }
      toast.success('Your account and all associated listings have been deleted.')
      setShowDeleteModal(false)
      router.push('/')
      router.refresh()
    } catch {
      toast.error('An error occurred while deleting account.')
    } finally {
      setDeleting(false)
    }
  }

  const handleModeSwitch = async (mode: 'buyer' | 'vendor') => {
    setActiveMode(mode)
    try {
      const supabase = createClient()
      await supabase
        .from('profiles')
        .update({ active_mode: mode })
        .eq('id', user.id)
    } catch {
      // Ignore if column not yet migrated
    }

    toast.success(
      mode === 'vendor'
        ? 'Switched profile to Vendor Mode'
        : 'Switched profile to Consumer (Buyer) Mode'
    )
    router.refresh()
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) {
      toast.error('Please enter your name.')
      return
    }
    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            full_name: fullName.trim(),
            email: user.email,
            active_mode: activeMode,
          },
          { onConflict: 'id' }
        )

      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Profile updated')
        router.refresh()
      }
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-3.5">
          <UserAvatar
            src={profile.avatar_url}
            seed={profile.id || user.id}
            name={profile.full_name}
            size={56}
            className="rounded-2xl border border-border shadow-2xs"
            priority
          />
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
              {profile.full_name}
            </h1>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>

      {/* Consumer <-> Vendor Role Switcher Card */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <ArrowLeftRight className="h-4 w-4 text-[#0F6E6E]" />
              Switch Profile Mode (Consumer ↔ Vendor)
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Use one Jetty account to browse and buy items as a student consumer, or switch to Vendor Mode to manage your shop, products, and pickup pin.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <button
            type="button"
            onClick={() => handleModeSwitch('buyer')}
            className={cn(
              'flex flex-col items-start rounded-xl border p-4 text-left transition-all cursor-pointer',
              activeMode === 'buyer'
                ? 'border-[#0F6E6E] bg-[#E6F2F2]/70 ring-1 ring-[#0F6E6E]'
                : 'border-border bg-card hover:border-border'
            )}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <ShoppingBag
                className={cn(
                  'h-5 w-5',
                  activeMode === 'buyer' ? 'text-[#0F6E6E]' : 'text-muted-foreground'
                )}
              />
              {activeMode === 'buyer' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#0F6E6E] px-2.5 py-0.5 text-[10px] font-bold text-white">
                  <CheckCircle2 className="h-3 w-3" /> Active Mode
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold text-foreground">
              Consumer / Buyer Mode
            </h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Browse cadet gear, electronics, and campus supplies, compare prices, and message sellers on WhatsApp.
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleModeSwitch('vendor')}
            className={cn(
              'flex flex-col items-start rounded-xl border p-4 text-left transition-all cursor-pointer',
              activeMode === 'vendor'
                ? 'border-[#0F6E6E] bg-[#E6F2F2]/70 ring-1 ring-[#0F6E6E]'
                : 'border-border bg-card hover:border-border'
            )}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <Store
                className={cn(
                  'h-5 w-5',
                  activeMode === 'vendor' ? 'text-[#0F6E6E]' : 'text-muted-foreground'
                )}
              />
              {activeMode === 'vendor' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#0F6E6E] px-2.5 py-0.5 text-[10px] font-bold text-white">
                  <CheckCircle2 className="h-3 w-3" /> Active Mode
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold text-foreground">
              Vendor / Seller Mode
            </h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Manage your storefront, add products, update stock and prices, and configure your Google Maps pickup pin.
            </p>
          </button>
        </div>

        {/* Contextual Action Bar */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          {vendor ? (
            <div className="flex items-center gap-2 text-xs text-foreground">
              <BadgeCheck className="h-4 w-4 text-[#0F6E6E]" />
              <span>
                Storefront: <strong>{vendor.shop_name}</strong> ({vendor.verification_status})
              </span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">
              You haven&apos;t created a vendor storefront yet.
            </span>
          )}

          <div className="flex items-center gap-2">
            {vendor ? (
              <>
                <Link
                  href={`/vendors/${vendor.slug || vendor.id}`}
                  className="rounded-lg border border-border px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted/50"
                >
                  View Public Store
                </Link>
                <Link
                  href="/vendor/dashboard"
                  className="rounded-lg bg-[#0F6E6E] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0A4F4F]"
                >
                  Open Vendor Dashboard →
                </Link>
              </>
            ) : (
              <Link
                href="/vendor/apply"
                className="rounded-lg bg-[#0F6E6E] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0A4F4F]"
              >
                Set Up Vendor Storefront →
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Admin Access Notice if Admin */}
      {profile.role === 'admin' && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50/70 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-sm font-bold text-amber-950">
              <ShieldAlert className="h-4 w-4 text-amber-700" />
              Marketplace Administrator Account
            </div>
            <p className="text-xs text-amber-900">
              You have permission to verify vendors, approve pending product listings, manage categories, and review buyer reports.
            </p>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-xl bg-foreground px-4 py-2.5 text-xs font-semibold text-white hover:opacity-90 shrink-0"
          >
            Open Admin Moderation Queue
          </Link>
        </div>
      )}

      {/* Account Details Form */}
      <form
        onSubmit={handleSaveProfile}
        className="rounded-2xl border border-border bg-card p-6 space-y-4"
      >
        <h2 className="text-base font-bold text-foreground">Account Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full h-10 rounded-lg border border-border px-3 text-sm text-foreground focus:border-[#0F6E6E] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={user.email || ''}
              disabled
              className="w-full h-10 rounded-lg border border-border bg-muted/50 px-3 text-sm text-muted-foreground"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-foreground px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#0A4F4F] transition-colors cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Account Details'}
          </button>
        </div>
      </form>

      {/* Danger Zone: Delete Account & Purge All Listings */}
      <div className="rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50/40 dark:bg-red-950/20 p-6 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-red-900 dark:text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
              Delete Account &amp; Storefront
            </h2>
            <p className="text-xs text-red-700/90 dark:text-red-300/80 max-w-xl leading-relaxed">
              Permanently delete your account, your vendor shop profile, and purge all your active listings (products, rooms, and services). This action is permanent and cannot be undone.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-300 dark:border-red-800 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 text-xs font-semibold transition-colors shrink-0 cursor-pointer shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Account</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-base">
                  Delete Account &amp; Purge All Data?
                </h3>
                <p className="text-xs text-muted-foreground">
                  This action is irreversible.
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Deleting your account will immediately remove your profile, your vendor store, and permanently delete all your products, room listings, and service listings.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteAccount}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{deleting ? 'Deleting...' : 'Yes, Delete Everything'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
