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
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { UserProfile, Vendor } from '@/lib/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-3.5">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name}
              className="h-14 w-14 rounded-2xl object-cover border border-slate-200"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 border border-blue-200 text-[#1E3A8A]">
              <UserCircle className="h-8 w-8" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              {profile.full_name}
            </h1>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>

      {/* Consumer <-> Vendor Role Switcher Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ArrowLeftRight className="h-4 w-4 text-blue-700" />
              Switch Profile Mode (Consumer ↔ Vendor)
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Use one IslandHub account to browse and buy items as a student consumer, or switch to Vendor Mode to manage your shop, products, and pickup pin.
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
                ? 'border-[#1E3A8A] bg-blue-50/70 ring-1 ring-[#1E3A8A]'
                : 'border-slate-200 bg-white hover:border-slate-300'
            )}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <ShoppingBag
                className={cn(
                  'h-5 w-5',
                  activeMode === 'buyer' ? 'text-[#1E3A8A]' : 'text-slate-500'
                )}
              />
              {activeMode === 'buyer' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#1E3A8A] px-2.5 py-0.5 text-[10px] font-bold text-white">
                  <CheckCircle2 className="h-3 w-3" /> Active Mode
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Consumer / Buyer Mode
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Browse cadet gear, electronics, and campus supplies, compare prices, and message sellers on WhatsApp.
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleModeSwitch('vendor')}
            className={cn(
              'flex flex-col items-start rounded-xl border p-4 text-left transition-all cursor-pointer',
              activeMode === 'vendor'
                ? 'border-[#1E3A8A] bg-blue-50/70 ring-1 ring-[#1E3A8A]'
                : 'border-slate-200 bg-white hover:border-slate-300'
            )}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <Store
                className={cn(
                  'h-5 w-5',
                  activeMode === 'vendor' ? 'text-[#1E3A8A]' : 'text-slate-500'
                )}
              />
              {activeMode === 'vendor' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#1E3A8A] px-2.5 py-0.5 text-[10px] font-bold text-white">
                  <CheckCircle2 className="h-3 w-3" /> Active Mode
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Vendor / Seller Mode
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Manage your storefront, add products, update stock and prices, and configure your Google Maps pickup pin.
            </p>
          </button>
        </div>

        {/* Contextual Action Bar */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          {vendor ? (
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <BadgeCheck className="h-4 w-4 text-blue-700" />
              <span>
                Storefront: <strong>{vendor.shop_name}</strong> ({vendor.verification_status})
              </span>
            </div>
          ) : (
            <span className="text-xs text-slate-600">
              You haven&apos;t created a vendor storefront yet.
            </span>
          )}

          <div className="flex items-center gap-2">
            {vendor ? (
              <>
                <Link
                  href={`/vendors/${vendor.slug || vendor.id}`}
                  className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  View Public Store
                </Link>
                <Link
                  href="/vendor/dashboard"
                  className="rounded-lg bg-[#1E3A8A] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-900"
                >
                  Open Vendor Dashboard →
                </Link>
              </>
            ) : (
              <Link
                href="/vendor/apply"
                className="rounded-lg bg-[#1E3A8A] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-900"
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
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 shrink-0"
          >
            Open Admin Moderation Queue
          </Link>
        </div>
      )}

      {/* Account Details Form */}
      <form
        onSubmit={handleSaveProfile}
        className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4"
      >
        <h2 className="text-base font-bold text-slate-900">Account Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full h-10 rounded-lg border border-slate-300 px-3 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={user.email || ''}
              disabled
              className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-900 transition-colors cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Account Details'}
          </button>
        </div>
      </form>
    </div>
  )
}
