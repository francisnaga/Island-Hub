'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ShoppingBag,
  Bed,
  Briefcase,
  Plus,
  ChevronRight,
  ChevronLeft,
  MoreHorizontal,
  Edit3,
  Check,
  Pause,
  Trash2,
  Camera,
  X,
  List,
  Store,
  MessageCircle,
  Image as ImageIcon,
  LogOut,
  ShieldAlert,
  MapPin,
  Navigation,
  Loader2,
  FileText,
  AlertCircle,
  Send,
  AtSign,
  Phone,
  ExternalLink,
  Share2,
  ArrowLeftRight,
  Compass,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { VerifiedBadge } from '@/components/brand/VerifiedBadge'
import { UserAvatar } from '@/components/brand/UserAvatar'
import { ImageCropperModal } from '@/components/vendor/ImageCropperModal'
import {
  CampusArea,
  Category,
  isAdminEmail,
  ListingType,
  Product,
  ProductCondition,
  StockStatus,
  UserProfile,
  Vendor,
} from '@/lib/types'
import { SERVICES_LIST } from '@/lib/services-data'
import { getVendorInitials } from '@/components/cards/VendorCard'
import {
  buildJettyTeamWhatsAppUrl,
  formatNaira,
  getCanonicalUrl,
  normalizeWhatsAppNumber,
} from '@/lib/whatsapp'
import { isImageFile, compressImageFile, compressAvatarFile } from '@/lib/image-compression'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface VendorDashboardClientProps {
  user: { id: string; email?: string; full_name?: string; avatar_url?: string }
  profile: UserProfile
  vendor: Vendor
  initialProducts: Product[]
  categories: Category[]
  initialTab?: 'listings' | 'new' | 'store'
  initialKind?: 'item' | 'room' | 'svc'
  initialEditId?: string
  initialNewStore?: boolean
}

type VendorScreen =
  | 'v:listings'
  | 'v:new'
  | 'v:store'
  | 'v:form'
  | 'v:done'

const ROOM_TYPES = [
  'Self-contain',
  'Single room',
  'Bedspace',
  'Shared room',
  'Flat / 2-Bed',
  'Lodge unit',
]
const BEDSPACES_OPTIONS = ['1', '1 to 2', '2', '3 to 4', 'Shared']
const DISTANCE_OPTIONS = [
  'Near campus',
  '2 min walk',
  '3 min walk',
  '5 min walk',
  '5 min to gate',
  '10 min walk',
  'Inside campus',
]
const RENT_COVERS_OPTIONS = ['One session', 'One year', 'Per semester']
const UTILITIES_OPTIONS = [
  'Water included',
  'Light & water included',
  'Self-recharge NEPA',
  'None included',
]
const ROOM_AMENITIES = [
  'Water',
  'Power backup',
  'Solar light',
  'Fenced compound',
  'Tiled floor',
  'Ensuite bathroom',
  'Wardrobe',
  'Ceiling fan',
  'Shared kitchen',
]

function slugifyProductTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 52) +
    '-' +
    Math.random().toString(36).slice(2, 6)
  )
}

function digitsOnly(val: string): string {
  return String(val || '').replace(/\D/g, '')
}

function getKindFromListingType(lt?: ListingType): 'item' | 'room' | 'svc' {
  if (lt === 'housing') return 'room'
  if (lt === 'service') return 'svc'
  return 'item'
}

export function VendorDashboardClient({
  user,
  profile,
  vendor: initialVendor,
  initialProducts,
  categories,
  initialTab = 'listings',
  initialKind,
  initialEditId,
  initialNewStore,
}: VendorDashboardClientProps) {
  const [showNewStoreModal, setShowNewStoreModal] = useState(Boolean(initialNewStore))
  const router = useRouter()
  const [vendor, setVendor] = useState<Vendor>(initialVendor)
  const [products, setProducts] = useState<Product[]>(initialProducts)

  // Screen & Tab state (matching prototype.html v:listings, v:new, v:store, v:form, v:done)
  const [screen, setScreen] = useState<VendorScreen>(() => {
    if (initialEditId || initialKind) return 'v:form'
    if (initialTab === 'new') return 'v:new'
    if (initialTab === 'store') return 'v:store'
    return 'v:listings'
  })
  const [listingsView, setListingsView] = useState<'active' | 'drafts' | 'sold'>('active')

  // Listing Action Sheet state (openAct / confirmDel from prototype)
  const [actionProduct, setActionProduct] = useState<Product | null>(null)
  const [confirmDeleteProduct, setConfirmDeleteProduct] = useState<Product | null>(null)
  const [busyAction, setBusyAction] = useState(false)

  // Form state (F in prototype)
  const [formKind, setFormKind] = useState<'item' | 'room' | 'svc'>(initialKind || 'item')
  const [editId, setEditId] = useState<string>(initialEditId || '')
  const [photos, setPhotos] = useState<string[]>([])
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id || '')
  const [condition, setCondition] = useState<'New' | 'Used'>('New')
  const [roomType, setRoomType] = useState<string>('')
  const [bedspaces, setBedspaces] = useState<string>('1 to 2')
  const [distanceHint, setDistanceHint] = useState<string>('Near campus')
  const [rentCovers, setRentCovers] = useState<string>('One session')
  const [utilities, setUtilities] = useState<string>('Water included')
  const [roomAmenities, setRoomAmenities] = useState<string[]>([])
  const [otherFeesChoice, setOtherFeesChoice] = useState<'None' | 'Yes'>('None')
  const [otherFeesText, setOtherFeesText] = useState('')
  const [serviceSlug, setServiceSlug] = useState<string>('')
  const [serviceAvail, setServiceAvail] = useState('')
  const [serviceIncluded, setServiceIncluded] = useState('')
  const [formCampus, setFormCampus] = useState<CampusArea>(
    vendor.campus || 'Okerenkoko'
  )
  const [formLocation, setFormLocation] = useState<string>(
    vendor.location_label || ''
  )
  const [description, setDescription] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [doneProduct, setDoneProduct] = useState<Product | null>(null)
  const [wasEdited, setWasEdited] = useState(false)

  // Category & Service Request Bottom Sheet state
  const [catReqOpen, setCatReqOpen] = useState(false)
  const [catReqKind, setCatReqKind] = useState<'category' | 'service' | 'room'>('category')
  const [catReqName, setCatReqName] = useState('')
  const [catReqDesc, setCatReqDesc] = useState('')
  const [submittingCatReq, setSubmittingCatReq] = useState(false)

  const openCategoryRequest = (kind: 'category' | 'service' | 'room') => {
    setCatReqKind(kind)
    setCatReqName('')
    setCatReqDesc('')
    setCatReqOpen(true)
  }

  // Store Settings Edit Bottom Sheet state
  const [editingStoreField, setEditingStoreField] = useState<
    null | 'name' | 'username' | 'phone' | 'campus' | 'location' | 'map_pin' | 'about'
  >(null)
  const [draftStoreValue, setDraftStoreValue] = useState('')
  const [savingStoreField, setSavingStoreField] = useState(false)
  const [locatingGps, setLocatingGps] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [cropModalOpen, setCropModalOpen] = useState(false)
  const [rawImageForCrop, setRawImageForCrop] = useState<string | null>(null)
  const [savingCroppedAvatar, setSavingCroppedAvatar] = useState(false)
  const avatarFileInputRef = useRef<HTMLInputElement>(null)
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)

  const handleDeleteAccount = async () => {
    setDeletingAccount(true)
    try {
      const res = await fetch('/api/user/delete-account', {
        method: 'POST',
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        toast.error(data.error || 'Failed to delete account')
        return
      }
      toast.success('Your store and account have been deleted.')
      setShowDeleteAccountModal(false)
      router.push('/')
      router.refresh()
    } catch {
      toast.error('An error occurred while deleting account.')
    } finally {
      setDeletingAccount(false)
    }
  }

  // Load initial edit product or new form if initialEditId/initialKind was passed
  useEffect(() => {
    if (initialEditId) {
      const target = products.find((p) => p.id === initialEditId)
      if (target) {
        populateFormForEdit(target)
      }
    } else if (initialKind) {
      startNewForm(initialKind)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialEditId, initialKind])

  const startNewForm = (kind: 'item' | 'room' | 'svc') => {
    setFormKind(kind)
    setEditId('')
    setPhotos([])
    setTitle('')
    setPrice('')
    setCategoryId(categories[0]?.id || '')
    setCondition('New')
    setRoomType('Self-contain')
    setBedspaces('1 to 2')
    setDistanceHint('Near campus')
    setRentCovers('One session')
    setUtilities('Water included')
    setRoomAmenities(['Water', 'Tiled floor', 'Wardrobe', 'Ceiling fan'])
    setOtherFeesChoice('None')
    setOtherFeesText('')
    const firstUnlisted = SERVICES_LIST.find((s) => {
      return !products.some(
        (p) =>
          p.listing_type === 'service' &&
          p.status !== 'rejected' &&
          ((p.variants as any)?.service_slug === s.slug || p.title.toLowerCase().includes(s.slug))
      )
    })
    setServiceSlug(firstUnlisted?.slug || SERVICES_LIST[0]?.slug || 'haircuts')
    setServiceAvail('')
    setServiceIncluded('')
    setFormCampus(
      kind === 'room' && vendor.campus === 'Both'
        ? 'Okerenkoko'
        : vendor.campus || 'Okerenkoko'
    )
    setFormLocation(vendor.location_label || '')
    setDescription('')
    setScreen('v:form')
    window.scrollTo(0, 0)
  }

  const populateFormForEdit = (p: Product) => {
    const kind = getKindFromListingType(p.listing_type)
    setFormKind(kind)
    setEditId(p.id)
    setPhotos(p.images || [])
    setTitle(p.title || '')
    setPrice(String(p.price || ''))
    setCategoryId(p.category_id || categories[0]?.id || '')
    setCondition(p.condition === 'new' ? 'New' : 'Used')
    setRoomType(p.variants?.room_type_label || 'Self-contain')
    setBedspaces(p.variants?.bedspaces || '1 to 2')
    setDistanceHint(p.variants?.distance_hint || 'Near campus')
    setRentCovers(p.variants?.rent_covers || 'One session')
    setUtilities(p.variants?.utilities || 'Water included')
    setRoomAmenities(
      Array.isArray(p.variants?.features) && p.variants.features.length > 0
        ? p.variants.features
        : ['Water', 'Tiled floor', 'Wardrobe', 'Ceiling fan']
    )
    const existingFees = p.variants?.other_fees || 'None'
    setOtherFeesChoice(existingFees !== 'None' && existingFees ? 'Yes' : 'None')
    setOtherFeesText(existingFees !== 'None' ? existingFees : '')
    setServiceSlug(p.variants?.service_slug || SERVICES_LIST[0]?.slug || 'haircuts')
    setServiceAvail(p.service_turnaround || '')
    setServiceIncluded(
      p.variants?.features?.length ? p.variants.features.join('\n') : p.description || ''
    )
    setFormCampus(p.campus || vendor.campus || 'Okerenkoko')
    setFormLocation(
      p.variants?.location_label || p.service_area || vendor.location_label || ''
    )
    setDescription(p.description || '')
    setScreen('v:form')
    window.scrollTo(0, 0)
  }

  // Photo Upload (with automatic iPhone / Canvas compression + server upload API)
  const handleAddPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!isImageFile(file)) {
      toast.error('Please select a valid photo.')
      return
    }
    if (photos.length >= 5) {
      toast.error('Up to 5 photos allowed.')
      return
    }

    setUploadingPhoto(true)
    try {
      const { file: compressedFile, dataUrl } = await compressImageFile(file, {
        maxWidth: 960,
        maxHeight: 960,
        quality: 0.76,
        mimeType: 'image/webp',
      })

      const formData = new FormData()
      formData.append('file', compressedFile)
      formData.append('folder', vendor.id)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      if (res.ok) {
        const json = await res.json()
        if (json?.url) {
          setPhotos((prev) => [...prev, json.url])
          return
        }
      }

      setPhotos((prev) => [...prev, dataUrl])
    } catch {
      toast.error('Could not process photo.')
    } finally {
      setUploadingPhoto(false)
      e.target.value = ''
    }
  }

  // Form Validation (matching missing() in prototype.html line 869)
  const getMissingReason = (): string => {
    if (formKind !== 'svc' && photos.length < 1) return 'Add a photo'
    if (formKind === 'svc' && !serviceSlug) return 'Pick a service'
    if (formKind !== 'svc' && title.trim().length < 3) return 'Add a title'
    if (!digitsOnly(price) || Number(digitsOnly(price)) <= 0) return 'Add a price'
    if (formKind === 'item' && !categoryId) return 'Pick a category'
    if (formKind === 'room' && !roomType) return 'Pick a room type'
    return ''
  }

  const missingReason = getMissingReason()
  const isFormReady = !missingReason

  // Publish / Save Listing (or Save as Draft)
  const handlePublish = async (asDraft: boolean = false) => {
    if (!asDraft && !isFormReady) return
    if (publishing) return
    setPublishing(true)

    try {
      const numericPrice = Number(digitsOnly(price)) || 0
      const selectedService = SERVICES_LIST.find((s) => s.slug === serviceSlug)
      const resolvedTitle =
        formKind === 'svc'
          ? title.trim() || `${selectedService?.title || 'Service'} by ${vendor.shop_name}`
          : title.trim() || (asDraft ? 'Untitled Draft' : '')

      // Prevent duplicate service listings
      if (formKind === 'svc') {
        const existingDuplicate = products.find((p) => {
          if (editId && p.id === editId) return false
          if (p.listing_type !== 'service' || p.status === 'rejected') return false
          const pSlug = String((p.variants as any)?.service_slug || '').toLowerCase().trim()
          if (pSlug && serviceSlug) {
            return pSlug === serviceSlug.toLowerCase().trim()
          }
          return p.title.toLowerCase().trim() === resolvedTitle.toLowerCase().trim()
        })

        if (existingDuplicate) {
          toast.error(
            `You already have an existing listing for "${existingDuplicate.title}". Please edit your existing listing instead of creating a duplicate.`
          )
          setPublishing(false)
          return
        }
      }

      const existing = editId ? products.find((p) => p.id === editId) : null
      const listingType: ListingType =
        formKind === 'room' ? 'housing' : formKind === 'svc' ? 'service' : 'product'

      const trimmedLocation = formLocation.trim()
      const resolvedCategoryId =
        categoryId || categories[0]?.id || ''

      const variants =
        formKind === 'room'
          ? {
              room_type_label: roomType || 'Self-contain',
              room_type:
                roomType === 'Self-contain'
                  ? 'self_contain'
                  : roomType === 'Bedspace'
                  ? 'bedspace'
                  : 'single_room',
              period: rentCovers.toLowerCase().includes('year')
                ? 'year'
                : rentCovers.toLowerCase().includes('semester')
                ? 'semester'
                : 'session',
              location_label: trimmedLocation || distanceHint,
              distance_hint: distanceHint || trimmedLocation || 'Near campus',
              bedspaces: bedspaces || '1 to 2',
              rent_covers: rentCovers || 'One session',
              utilities: utilities || 'Water included',
              other_fees:
                otherFeesChoice === 'Yes'
                  ? otherFeesText.trim() || 'Caution fee applies'
                  : 'None',
              features: roomAmenities,
              campus: formCampus,
            }
          : formKind === 'svc'
          ? {
              service_slug: serviceSlug,
              location_label: trimmedLocation,
              features: serviceIncluded
                .split('\n')
                .map((s) => s.trim())
                .filter(Boolean),
              campus: formCampus,
            }
          : {
              location_label: trimmedLocation,
              campus: formCampus,
            }

      const res = await fetch('/api/vendor/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: existing?.id || undefined,
          vendor_id: vendor.id,
          category_id: resolvedCategoryId,
          listing_type: listingType,
          campus: formCampus,
          title: resolvedTitle,
          description:
            formKind === 'svc'
              ? serviceIncluded.trim() ||
                description.trim() ||
                `${selectedService?.title || 'Service'} by ${vendor.shop_name}`
              : description.trim() || resolvedTitle,
          price: numericPrice,
          is_draft: asDraft,
          images:
            photos.length > 0
              ? photos
              : [],
          condition: (condition === 'New' ? 'new' : 'good') as ProductCondition,
          stock_status: (existing?.stock_status || 'available') as StockStatus,
          service_turnaround: formKind === 'svc' ? serviceAvail.trim() || null : null,
          service_area: trimmedLocation || null,
          variants,
        }),
      })

      const json = await res.json()
      if (!res.ok || json.error) {
        toast.error(json.error || (asDraft ? 'Could not save draft.' : 'Could not publish listing.'))
        return
      }

      const saved = json.product as Product
      if (existing) {
        setProducts((prev) => prev.map((p) => (p.id === existing.id ? saved : p)))
      } else {
        setProducts((prev) => [saved, ...prev])
      }

      if (asDraft) {
        toast.success('Listing saved to Drafts.')
        setListingsView('drafts')
        setScreen('v:listings')
      } else {
        setWasEdited(Boolean(existing))
        setDoneProduct(saved)
        setScreen('v:done')
      }
      window.scrollTo(0, 0)
      router.refresh()
    } finally {
      setPublishing(false)
    }
  }

  // Listing Actions (Mark as sold / Pause / Delete)
  const handleToggleSold = async (p: Product) => {
    setBusyAction(true)
    try {
      const nextStock: StockStatus =
        p.stock_status === 'out_of_stock' ? 'available' : 'out_of_stock'
      const res = await fetch('/api/vendor/listings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: p.id,
          stock_status: nextStock,
        }),
      })
      const json = await res.json()
      if (!res.ok || json.error) {
        toast.error(json.error || 'Could not update listing.')
        return
      }

      setProducts((prev) =>
        prev.map((item) =>
          item.id === p.id ? { ...item, stock_status: nextStock } : item
        )
      )
      setActionProduct(null)
    } finally {
      setBusyAction(false)
    }
  }

  const handleTogglePause = async (p: Product) => {
    setBusyAction(true)
    try {
      const isCurrentlyPaused = p.status === 'archived'
      const nextStatus = isCurrentlyPaused ? 'pending_review' : 'archived'
      const res = await fetch('/api/vendor/listings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: p.id,
          status: nextStatus,
        }),
      })
      const json = await res.json()
      if (!res.ok || json.error) {
        toast.error(json.error || 'Could not update listing.')
        return
      }

      setProducts((prev) =>
        prev.map((item) =>
          item.id === p.id ? { ...item, status: nextStatus } : item
        )
      )
      setActionProduct(null)
    } finally {
      setBusyAction(false)
    }
  }

  const handleDeleteConfirm = async (p: Product) => {
    setBusyAction(true)
    try {
      const res = await fetch(`/api/vendor/listings?id=${encodeURIComponent(p.id)}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (!res.ok || json.error) {
        toast.error(json.error || 'Could not delete listing.')
        return
      }
      setProducts((prev) => prev.filter((item) => item.id !== p.id))
      setConfirmDeleteProduct(null)
      setActionProduct(null)
    } finally {
      setBusyAction(false)
    }
  }

  // Category & Service Request Submission
  const handleCategoryRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!catReqName.trim() || submittingCatReq) return
    setSubmittingCatReq(true)
    try {
      const res = await fetch('/api/vendor/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request_category',
          vendor_id: vendor.id,
          vendor_name: vendor.shop_name,
          vendor_whatsapp: vendor.whatsapp_number,
          name: catReqName.trim(),
          description: catReqDesc.trim() || null,
          request_type: catReqKind,
        }),
      })
      const json = await res.json()
      if (!res.ok || json.error) {
        toast.error(json.error || `Could not submit ${catReqKind} request.`)
        return
      }
      toast.success(
        catReqKind === 'service'
          ? 'Service request sent to admin for approval.'
          : catReqKind === 'room'
          ? 'Housing type request sent to admin for approval.'
          : 'Category request sent to admin for approval.'
      )
      setCatReqName('')
      setCatReqDesc('')
      setCatReqOpen(false)
    } finally {
      setSubmittingCatReq(false)
    }
  }

  // Store Settings Field Save
  const openStoreEdit = (
    field: 'name' | 'username' | 'phone' | 'campus' | 'location' | 'map_pin' | 'about'
  ) => {
    setEditingStoreField(field)
    if (field === 'name') setDraftStoreValue(vendor.shop_name || '')
    if (field === 'username') setDraftStoreValue(vendor.username ? `@${vendor.username}` : (vendor.slug ? `@${vendor.slug}` : ''))
    if (field === 'phone') setDraftStoreValue(vendor.whatsapp_number || '')
    if (field === 'campus') setDraftStoreValue(vendor.campus || 'Okerenkoko')
    if (field === 'location') setDraftStoreValue(vendor.location_label || '')
    if (field === 'about') setDraftStoreValue(vendor.description || '')
  }

  const handlePinStoreGps = () => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      toast.error('Geolocation is not supported on this device/browser.')
      return
    }
    setLocatingGps(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = Number(pos.coords.latitude.toFixed(6))
          const lng = Number(pos.coords.longitude.toFixed(6))
          const res = await fetch('/api/vendor/store', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              vendor_id: vendor.id,
              latitude: lat,
              longitude: lng,
            }),
          })
          const json = await res.json()
          if (!res.ok || json.error) {
            toast.error(json.error || 'Could not save map location.')
            return
          }
          setVendor((prev) => ({
            ...prev,
            ...(json.vendor || {}),
            latitude: lat,
            longitude: lng,
          }))
          setEditingStoreField(null)
          toast.success('Current GPS location pinned to your store & listings')
          router.refresh()
        } finally {
          setLocatingGps(false)
        }
      },
      (err) => {
        setLocatingGps(false)
        if (err.code === err.PERMISSION_DENIED) {
          toast.error('Location permission denied. Enable location access in your browser.')
        } else {
          toast.error('Could not detect GPS location. Try again.')
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    )
  }

  const handleClearStoreGps = async () => {
    if (savingStoreField) return
    setSavingStoreField(true)
    try {
      const res = await fetch('/api/vendor/store', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_id: vendor.id,
          latitude: null,
          longitude: null,
        }),
      })
      const json = await res.json()
      if (!res.ok || json.error) {
        toast.error(json.error || 'Could not remove map location.')
        return
      }
      setVendor((prev) => ({
        ...prev,
        ...(json.vendor || {}),
        latitude: null,
        longitude: null,
      }))
      setEditingStoreField(null)
      toast.success('Pinned map location removed')
      router.refresh()
    } finally {
      setSavingStoreField(false)
    }
  }

  const handleSaveStoreField = async () => {
    if (!editingStoreField || savingStoreField) return
    setSavingStoreField(true)
    try {
      const updates: Partial<Vendor> = {}

      if (editingStoreField === 'name') {
        if (draftStoreValue.trim().length < 2) {
          toast.error('Please enter a valid shop name.')
          return
        }
        updates.shop_name = draftStoreValue.trim()
      } else if (editingStoreField === 'username') {
        const raw = draftStoreValue.trim().replace(/^@/, '').toLowerCase()
        if (raw.length < 3 || raw.length > 20 || !/^[a-z0-9_]{3,20}$/.test(raw)) {
          toast.error('Username must be 3–20 characters using letters, numbers, or _ only.')
          return
        }
        updates.username = raw
      } else if (editingStoreField === 'phone') {
        const clean = normalizeWhatsAppNumber(draftStoreValue)
        if (!clean) {
          toast.error('Please enter a valid WhatsApp number.')
          return
        }
        updates.whatsapp_number = clean
      } else if (editingStoreField === 'campus') {
        updates.campus = draftStoreValue as CampusArea
      } else if (editingStoreField === 'location') {
        updates.location_label = draftStoreValue.trim()
        updates.pickup_options = draftStoreValue.trim()
      } else if (editingStoreField === 'about') {
        updates.description = draftStoreValue.trim().slice(0, 300)
      }

      const res = await fetch('/api/vendor/store', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_id: vendor.id,
          ...updates,
        }),
      })
      const json = await res.json()
      if (!res.ok || json.error) {
        toast.error(json.error || 'Could not update store.')
        return
      }

      setVendor((prev) => ({ ...prev, ...(json.vendor || updates) }))
      setEditingStoreField(null)
      toast.success('Saved')
      router.refresh()
    } finally {
      setSavingStoreField(false)
    }
  }

  const handleAvatarFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !isImageFile(file)) return
    const reader = new FileReader()
    reader.onerror = () => toast.error('Could not read image file.')
    reader.onload = () => {
      setRawImageForCrop(reader.result as string)
      setCropModalOpen(true)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleSaveCroppedAvatar = async (croppedDataUrl: string) => {
    setSavingCroppedAvatar(true)
    try {
      let finalLogoUrl = croppedDataUrl

      // 1. Convert Data URL to ultra-compressed WebP avatar (~15KB) and upload to Supabase storage bucket
      try {
        const blob = await (await fetch(croppedDataUrl)).blob()
        const rawFile = new File([blob], `avatar-${Date.now()}.png`, {
          type: blob.type || 'image/png',
        })
        const { file: compressedAvatar } = await compressAvatarFile(rawFile)
        const uploadForm = new FormData()
        uploadForm.append('file', compressedAvatar)
        uploadForm.append('folder', `avatars/${vendor.id}`)

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadForm,
        })
        if (uploadRes.ok) {
          const uploadJson = await uploadRes.json()
          if (uploadJson?.url) {
            finalLogoUrl = uploadJson.url
          }
        }
      } catch (uploadErr) {
        console.warn('Storage upload fallback to direct data url:', uploadErr)
      }

      // 2. Persist to vendor store profile
      const res = await fetch('/api/vendor/store', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_id: vendor.id,
          logo_url: finalLogoUrl,
        }),
      })

      const json = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(json?.error || 'Failed to update store photo')
      }

      setVendor((prev) => ({ ...prev, logo_url: finalLogoUrl }))
      setCropModalOpen(false)
      setRawImageForCrop(null)
      toast.success('Profile photo updated successfully')
      router.refresh()
    } catch (err: any) {
      toast.error(err?.message || 'Could not update profile photo.')
    } finally {
      setSavingCroppedAvatar(false)
    }
  }

  const draftProducts = products.filter((p) => p.status === 'draft')
  const activeProducts = products.filter(
    (p) =>
      p.stock_status !== 'out_of_stock' &&
      p.status !== 'draft' &&
      p.status !== 'archived'
  )
  const soldProducts = products.filter(
    (p) =>
      (p.stock_status === 'out_of_stock' || p.status === 'archived') &&
      p.status !== 'draft'
  )
  const visibleProducts =
    listingsView === 'active'
      ? activeProducts
      : listingsView === 'drafts'
      ? draftProducts
      : soldProducts

  const activeNavTab: 'v:listings' | 'v:new' | 'v:store' =
    screen === 'v:new' || screen === 'v:form'
      ? 'v:new'
      : screen === 'v:store'
      ? 'v:store'
      : 'v:listings'

  const campusDisplay =
    vendor.campus === 'Both' ? 'Both campuses' : vendor.campus || 'Okerenkoko'

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <div className="mx-auto w-full max-w-[480px] md:max-w-3xl">
        {/* ================= SCREEN 1: YOUR LISTINGS (vListings) ================= */}
        {screen === 'v:listings' && (
          <div>
            <h2 className="px-4 pt-5 pb-1 font-sans font-semibold text-[26px] tracking-tight">
              Your listings
            </h2>

            {/* Segmented Control (.seg) */}
            <div className="flex gap-1 mx-4 mt-3 p-1 bg-[#E6F2F2] dark:bg-muted rounded-xl">
              <button
                type="button"
                aria-pressed={listingsView === 'active'}
                onClick={() => setListingsView('active')}
                className={cn(
                  'flex-1 h-10 rounded-[9px] text-[13px] sm:text-[14px] font-medium transition-all cursor-pointer',
                  listingsView === 'active'
                    ? 'bg-card text-foreground shadow-2xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Active {activeProducts.length}
              </button>
              <button
                type="button"
                aria-pressed={listingsView === 'drafts'}
                onClick={() => setListingsView('drafts')}
                className={cn(
                  'flex-1 h-10 rounded-[9px] text-[13px] sm:text-[14px] font-medium transition-all cursor-pointer',
                  listingsView === 'drafts'
                    ? 'bg-card text-foreground shadow-2xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Drafts {draftProducts.length}
              </button>
              <button
                type="button"
                aria-pressed={listingsView === 'sold'}
                onClick={() => setListingsView('sold')}
                className={cn(
                  'flex-1 h-10 rounded-[9px] text-[13px] sm:text-[14px] font-medium transition-all cursor-pointer',
                  listingsView === 'sold'
                    ? 'bg-card text-foreground shadow-2xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Sold {soldProducts.length}
              </button>
            </div>

            {/* Listing Rows (.list > .mr) */}
            {visibleProducts.length > 0 ? (
              <div className="mt-3 border-t border-border">
                {visibleProducts.map((x) => {
                  const kind = getKindFromListingType(x.listing_type)
                  const isSold = x.stock_status === 'out_of_stock'
                  const isDraft = x.status === 'draft'
                  const isPaused = x.status === 'archived'
                  const isPending = x.status === 'pending_review'
                  const isRejected = x.status === 'rejected'

                  const statusLabel = isDraft
                    ? 'Draft'
                    : isSold
                    ? 'Sold'
                    : isPaused
                    ? 'Paused'
                    : isRejected
                    ? 'Rejected'
                    : isPending
                    ? 'In review'
                    : 'Live'

                  const hasPhoto =
                    x.images &&
                    x.images.length > 0 &&
                    !x.images[0].includes('cadet-uniform-tailoring.jpg')

                  return (
                    <button
                      key={x.id}
                      type="button"
                      onClick={() => setActionProduct(x)}
                      className="flex items-center gap-3 w-full min-h-[76px] px-4 py-3 border-b border-border text-left hover:bg-muted/40 transition-colors cursor-pointer"
                    >
                      <span
                        className={cn(
                          'w-[52px] h-[52px] rounded-xl grid place-items-center shrink-0 overflow-hidden',
                          kind === 'svc'
                            ? 'bg-[#FBF1D6] text-[#6B4E0E]'
                            : kind === 'room'
                            ? 'bg-[#D7E8E8] text-[#0F6E6E]'
                            : 'bg-[#E6F2F2] text-[#0F6E6E]'
                        )}
                      >
                        {hasPhoto ? (
                          <img
                            src={x.images[0]}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : kind === 'room' ? (
                          <Bed className="w-[22px] h-[22px]" />
                        ) : kind === 'svc' ? (
                          <Briefcase className="w-[22px] h-[22px]" />
                        ) : (
                          <ShoppingBag className="w-[22px] h-[22px]" />
                        )}
                      </span>

                      <span className="flex-1 min-w-0 block">
                        <b className="block text-[15px] font-semibold text-foreground truncate">
                          {x.title}
                        </b>
                        <span className="block mt-0.5 text-[13px] text-muted-foreground tabular-nums">
                          {kind === 'svc' ? 'from ' : ''}
                          {formatNaira(x.price)}
                          {kind === 'room' ? ' / session' : ''}
                        </span>
                      </span>

                      <span
                        className={cn(
                          'h-6 px-2.5 rounded-full text-xs font-medium inline-flex items-center shrink-0',
                          isDraft
                            ? 'bg-muted border border-border text-foreground font-semibold'
                            : isSold
                            ? 'bg-card border border-border text-muted-foreground'
                            : isPaused || isPending
                            ? 'bg-[#FBF1D6] text-[#6B4E0E] dark:bg-amber-950/40 dark:text-amber-300'
                            : isRejected
                            ? 'bg-red-500/10 text-red-600'
                            : 'bg-[#E6F2F2] text-[#0A4F4F] dark:bg-teal-950/40 dark:text-teal-300'
                        )}
                      >
                        {statusLabel}
                      </span>

                      <MoreHorizontal className="w-5 h-5 text-muted-foreground shrink-0" />
                    </button>
                  )
                })}
              </div>
            ) : listingsView === 'active' ? (
              /* Minimalist Empty State (.vempty from prototype) */
              <div className="text-center pt-12 px-6">
                <b className="block font-sans font-semibold text-xl text-foreground">
                  Nothing listed yet
                </b>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Add your first listing. It takes about a minute.
                </p>
                <button
                  type="button"
                  onClick={() => setScreen('v:new')}
                  className="mt-5 mx-auto w-full h-12 rounded-xl bg-[#0F6E6E] hover:bg-[#0A4F4F] text-white font-semibold text-[15px] flex items-center justify-center transition-colors cursor-pointer"
                >
                  Add a listing
                </button>
              </div>
            ) : listingsView === 'drafts' ? (
              <div className="text-center pt-10 pb-8 px-6 max-w-sm mx-auto">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-[#E6F2F2] dark:bg-muted text-[#0F6E6E] dark:text-[#22D3EE] flex items-center justify-center mb-3.5">
                  <FileText className="w-7 h-7" />
                </div>
                <b className="block font-sans font-semibold text-xl text-foreground">
                  No saved drafts
                </b>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  Save listings in progress and return to finish or publish whenever you're ready.
                </p>
                <button
                  type="button"
                  onClick={() => setScreen('v:new')}
                  className="mt-5 w-full sm:w-auto sm:px-6 h-12 rounded-xl bg-[#0F6E6E] hover:bg-[#0A4F4F] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Start a draft</span>
                </button>
              </div>
            ) : (
              <p className="py-8 px-4 text-center text-sm text-muted-foreground">
                Items you mark as sold show up here.
              </p>
            )}
          </div>
        )}

        {/* ================= SCREEN 2: ADD A LISTING TYPE PICKER (vNew) ================= */}
        {screen === 'v:new' && (
          <div>
            <h2 className="px-4 pt-5 pb-1 font-sans font-semibold text-[26px] tracking-tight">
              Add a listing
            </h2>
            <div className="px-4 pb-2 text-sm text-muted-foreground">
              What are you listing?
            </div>

            <div className="px-4 pt-2 border-b border-border">
              {[
                {
                  kind: 'item' as const,
                  title: 'Item',
                  sub: 'Gear, books, electronics, kits',
                  icon: ShoppingBag,
                },
                {
                  kind: 'room' as const,
                  title: 'Room',
                  sub: 'Hostel, self-contain, bedspace',
                  icon: Bed,
                },
                {
                  kind: 'svc' as const,
                  title: 'Service',
                  sub: 'Haircuts, laundry, tailoring and more',
                  icon: Briefcase,
                },
              ].map((row, idx) => {
                const Icon = row.icon
                return (
                  <button
                    key={row.kind}
                    type="button"
                    onClick={() => startNewForm(row.kind)}
                    className={cn(
                      'flex items-center gap-3 w-full min-h-[64px] py-2 text-left hover:opacity-85 transition-opacity cursor-pointer',
                      idx > 0 && 'border-t border-border'
                    )}
                  >
                    <span className="w-11 h-11 rounded-xl bg-[#E6F2F2] dark:bg-muted text-[#0F6E6E] dark:text-[#22D3EE] grid place-items-center shrink-0">
                      <Icon className="w-[22px] h-[22px]" />
                    </span>
                    <span className="min-w-0">
                      <b className="block text-base font-semibold text-foreground">
                        {row.title}
                      </b>
                      <small className="text-[13px] text-muted-foreground">
                        {row.sub}
                      </small>
                    </span>
                    <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto shrink-0" />
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ================= SCREEN 3: SINGLE-PAGE LISTING FORM (vForm) ================= */}
        {screen === 'v:form' && (
          <div>
            {/* Sticky Top Bar (.ftop) */}
            <div className="sticky top-0 z-20 flex items-center gap-1 h-14 px-2 bg-card border-b border-border">
              <button
                type="button"
                onClick={() => setScreen(editId ? 'v:listings' : 'v:new')}
                aria-label="Back"
                className="w-11 h-11 rounded-full grid place-items-center text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <b className="font-sans font-semibold text-lg">
                {editId
                  ? 'Edit listing'
                  : formKind === 'room'
                  ? 'New room'
                  : formKind === 'svc'
                  ? 'New service'
                  : 'New item'}
              </b>
            </div>

            <div className="pb-8">
              {/* Service Picker (if Service) */}
              {formKind === 'svc' ? (
                <div className="px-4 mt-[22px]">
                  <span className="block mb-2 text-[15px] font-semibold text-foreground">
                    Service
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {SERVICES_LIST.map((s) => {
                      const active = serviceSlug === s.slug
                      const alreadyListed = products.some((p) => {
                        if (editId && p.id === editId) return false
                        if (p.listing_type !== 'service' || p.status === 'rejected') return false
                        const pSlug = String((p.variants as any)?.service_slug || '').toLowerCase().trim()
                        return pSlug === s.slug.toLowerCase().trim()
                      })

                      return (
                        <button
                          key={s.slug}
                          type="button"
                          aria-pressed={active}
                          onClick={() => {
                            if (alreadyListed) {
                              toast.info(
                                `You already have a listing for ${s.title}. Please edit that listing instead.`
                              )
                              return
                            }
                            setServiceSlug(s.slug)
                          }}
                          className={cn(
                            'h-11 px-[18px] rounded-full border text-sm font-medium transition-colors cursor-pointer',
                            active
                              ? 'bg-[#0F6E6E] border-[#0F6E6E] text-white'
                              : alreadyListed
                              ? 'bg-muted/60 border-border/60 text-muted-foreground/60 cursor-not-allowed'
                              : 'bg-card border-border text-foreground hover:border-[#0F6E6E]/40'
                          )}
                          title={alreadyListed ? 'Already listed in your shop' : undefined}
                        >
                          <span>{s.title}</span>
                          {alreadyListed && (
                            <span className="ml-1.5 text-[11px] font-normal text-muted-foreground/70">
                              (Listed)
                            </span>
                          )}
                        </button>
                      )
                    })}
                    <button
                      type="button"
                      onClick={() => openCategoryRequest('service')}
                      className="h-11 px-4 rounded-full border border-dashed border-[#0F6E6E] text-[#0F6E6E] dark:text-[#22D3EE] text-sm font-medium inline-flex items-center gap-1.5 hover:bg-[#E6F2F2]/40 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Request service
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Photos Rail (.ph) */}
                  <div className="px-4 mt-[22px]">
                    <span className="block mb-2 text-[15px] font-semibold text-foreground">
                      Photos
                    </span>
                    <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
                      {photos.map((url, idx) => (
                        <div
                          key={idx}
                          className="relative flex-none w-[88px] h-[88px] rounded-xl bg-[#E6F2F2] overflow-hidden"
                        >
                          <img
                            src={url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          {idx === 0 && (
                            <em className="absolute left-1.5 bottom-1.5 not-italic text-[11px] font-medium px-1.5 py-0.5 rounded-full bg-white text-slate-900 shadow-2xs">
                              Cover
                            </em>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              setPhotos((prev) => prev.filter((_, i) => i !== idx))
                            }
                            aria-label={`Remove photo ${idx + 1}`}
                            className="absolute top-1 right-1 w-[22px] h-[22px] rounded-full bg-white text-slate-900 grid place-items-center shadow-2xs cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      {photos.length < 5 && (
                        <label className="flex-none w-[88px] h-[88px] rounded-xl bg-card border-[1.5px] border-dashed border-[#0F6E6E] text-[#0F6E6E] dark:text-[#22D3EE] flex flex-col items-center justify-center gap-1 text-xs font-medium cursor-pointer hover:bg-[#E6F2F2]/30 transition-colors">
                          <Camera className="w-[22px] h-[22px]" />
                          <span>{uploadingPhoto ? 'Adding...' : 'Add photo'}</span>
                          <input
                            type="file"
                            accept="image/*,image/heic,image/heif"
                            onChange={handleAddPhoto}
                            disabled={uploadingPhoto}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                    <small className="block mt-1.5 text-[13px] text-muted-foreground">
                      Up to 5. The first photo is the cover.
                    </small>
                  </div>

                  {/* Title */}
                  <div className="px-4 mt-[22px]">
                    <label
                      htmlFor="f-title"
                      className="block mb-2 text-[15px] font-semibold text-foreground"
                    >
                      Title
                    </label>
                    <input
                      id="f-title"
                      type="text"
                      maxLength={70}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={
                        formKind === 'room'
                          ? 'Self-contain near the gate'
                          : 'What are you selling?'
                      }
                      className="w-full h-[52px] px-3.5 rounded-xl border border-border bg-card text-base text-foreground placeholder:text-muted-foreground outline-none focus:border-[#0F6E6E] focus:ring-3 focus:ring-[#0F6E6E]/15 transition-all"
                    />
                  </div>
                </>
              )}

              {/* Price */}
              <div className="px-4 mt-[22px]">
                <label
                  htmlFor="f-price"
                  className="block mb-2 text-[15px] font-semibold text-foreground"
                >
                  {formKind === 'room'
                    ? 'Rent per session'
                    : formKind === 'svc'
                    ? 'Starting price'
                    : 'Price'}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-0 h-[52px] flex items-center text-muted-foreground text-base">
                    ₦
                  </span>
                  <input
                    id="f-price"
                    type="text"
                    inputMode="numeric"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0"
                    className="w-full h-[52px] pl-[30px] pr-3.5 rounded-xl border border-border bg-card text-base text-foreground placeholder:text-muted-foreground outline-none focus:border-[#0F6E6E] focus:ring-3 focus:ring-[#0F6E6E]/15 transition-all"
                  />
                </div>
              </div>

              {/* Item Category + Request Category + Condition */}
              {formKind === 'item' && (
                <>
                  <div className="px-4 mt-[22px]">
                    <span className="block mb-2 text-[15px] font-semibold text-foreground">
                      Category
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => {
                        const active = categoryId === cat.id
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            aria-pressed={active}
                            onClick={() => setCategoryId(cat.id)}
                            className={cn(
                              'h-11 px-[18px] rounded-full border text-sm font-medium transition-colors cursor-pointer',
                              active
                                ? 'bg-[#0F6E6E] border-[#0F6E6E] text-white'
                                : 'bg-card border-border text-foreground hover:border-[#0F6E6E]/40'
                            )}
                          >
                            {cat.short_name || cat.name}
                          </button>
                        )
                      })}
                      <button
                        type="button"
                        onClick={() => openCategoryRequest('category')}
                        className="h-11 px-4 rounded-full border border-dashed border-[#0F6E6E] text-[#0F6E6E] dark:text-[#22D3EE] text-sm font-medium inline-flex items-center gap-1.5 hover:bg-[#E6F2F2]/40 transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        Request category
                      </button>
                    </div>
                  </div>

                  <div className="px-4 mt-[22px]">
                    <span className="block mb-2 text-[15px] font-semibold text-foreground">
                      Condition
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {(['New', 'Used'] as const).map((c) => {
                        const active = condition === c
                        return (
                          <button
                            key={c}
                            type="button"
                            aria-pressed={active}
                            onClick={() => setCondition(c)}
                            className={cn(
                              'h-11 px-[18px] rounded-full border text-sm font-medium transition-colors cursor-pointer',
                              active
                                ? 'bg-[#0F6E6E] border-[#0F6E6E] text-white'
                                : 'bg-card border-border text-foreground hover:border-[#0F6E6E]/40'
                            )}
                          >
                            {c}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Room Type, Bedspaces, Distance, Rent covers, Utilities, Amenities & Other Fees */}
              {formKind === 'room' && (
                <>
                  <div className="px-4 mt-[22px]">
                    <span className="block mb-2 text-[15px] font-semibold text-foreground">
                      Room type
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {ROOM_TYPES.map((rt) => {
                        const active = roomType === rt
                        return (
                          <button
                            key={rt}
                            type="button"
                            aria-pressed={active}
                            onClick={() => setRoomType(rt)}
                            className={cn(
                              'h-11 px-[18px] rounded-full border text-sm font-medium transition-colors cursor-pointer',
                              active
                                ? 'bg-[#0F6E6E] border-[#0F6E6E] text-white'
                                : 'bg-card border-border text-foreground hover:border-[#0F6E6E]/40'
                            )}
                          >
                            {rt}
                          </button>
                        )
                      })}
                      <button
                        type="button"
                        onClick={() => openCategoryRequest('room')}
                        className="h-11 px-4 rounded-full border border-dashed border-[#0F6E6E] text-[#0F6E6E] dark:text-[#22D3EE] text-sm font-medium inline-flex items-center gap-1.5 hover:bg-[#E6F2F2]/40 transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        Request room type
                      </button>
                    </div>
                  </div>

                  <div className="px-4 mt-[22px]">
                    <span className="block mb-2 text-[15px] font-semibold text-foreground">
                      Bedspaces
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {BEDSPACES_OPTIONS.map((bs) => {
                        const active = bedspaces === bs
                        return (
                          <button
                            key={bs}
                            type="button"
                            aria-pressed={active}
                            onClick={() => setBedspaces(bs)}
                            className={cn(
                              'h-11 px-[18px] rounded-full border text-sm font-medium transition-colors cursor-pointer',
                              active
                                ? 'bg-[#0F6E6E] border-[#0F6E6E] text-white'
                                : 'bg-card border-border text-foreground hover:border-[#0F6E6E]/40'
                            )}
                          >
                            {bs}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="px-4 mt-[22px]">
                    <span className="block mb-2 text-[15px] font-semibold text-foreground">
                      Distance to campus
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {DISTANCE_OPTIONS.map((dist) => {
                        const active = distanceHint === dist
                        return (
                          <button
                            key={dist}
                            type="button"
                            aria-pressed={active}
                            onClick={() => setDistanceHint(dist)}
                            className={cn(
                              'h-11 px-[18px] rounded-full border text-sm font-medium transition-colors cursor-pointer',
                              active
                                ? 'bg-[#0F6E6E] border-[#0F6E6E] text-white'
                                : 'bg-card border-border text-foreground hover:border-[#0F6E6E]/40'
                            )}
                          >
                            {dist}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="px-4 mt-[22px]">
                    <span className="block mb-2 text-[15px] font-semibold text-foreground">
                      Rent covers
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {RENT_COVERS_OPTIONS.map((rc) => {
                        const active = rentCovers === rc
                        return (
                          <button
                            key={rc}
                            type="button"
                            aria-pressed={active}
                            onClick={() => setRentCovers(rc)}
                            className={cn(
                              'h-11 px-[18px] rounded-full border text-sm font-medium transition-colors cursor-pointer',
                              active
                                ? 'bg-[#0F6E6E] border-[#0F6E6E] text-white'
                                : 'bg-card border-border text-foreground hover:border-[#0F6E6E]/40'
                            )}
                          >
                            {rc}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="px-4 mt-[22px]">
                    <span className="block mb-2 text-[15px] font-semibold text-foreground">
                      Utilities
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {UTILITIES_OPTIONS.map((ut) => {
                        const active = utilities === ut
                        return (
                          <button
                            key={ut}
                            type="button"
                            aria-pressed={active}
                            onClick={() => setUtilities(ut)}
                            className={cn(
                              'h-11 px-[18px] rounded-full border text-sm font-medium transition-colors cursor-pointer',
                              active
                                ? 'bg-[#0F6E6E] border-[#0F6E6E] text-white'
                                : 'bg-card border-border text-foreground hover:border-[#0F6E6E]/40'
                            )}
                          >
                            {ut}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="px-4 mt-[22px]">
                    <span className="block mb-2 text-[15px] font-semibold text-foreground">
                      Other fees
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {(['None', 'Yes'] as const).map((opt) => {
                        const active = otherFeesChoice === opt
                        return (
                          <button
                            key={opt}
                            type="button"
                            aria-pressed={active}
                            onClick={() => setOtherFeesChoice(opt)}
                            className={cn(
                              'h-11 px-[18px] rounded-full border text-sm font-medium transition-colors cursor-pointer',
                              active
                                ? 'bg-[#0F6E6E] border-[#0F6E6E] text-white'
                                : 'bg-card border-border text-foreground hover:border-[#0F6E6E]/40'
                            )}
                          >
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                    <small className="block mt-1.5 text-[13px] text-muted-foreground">
                      Agent, caution or service fees. Buyers see this on the listing.
                    </small>

                    {otherFeesChoice === 'Yes' && (
                      <div className="mt-2.5">
                        <input
                          type="text"
                          value={otherFeesText}
                          onChange={(e) => setOtherFeesText(e.target.value)}
                          placeholder="e.g. Caution fee applies or Agent fee ₦10,000"
                          aria-label="Fee details"
                          className="w-full h-[52px] px-3.5 rounded-xl border border-border bg-card text-base text-foreground placeholder:text-muted-foreground outline-none focus:border-[#0F6E6E]"
                        />
                      </div>
                    )}
                  </div>

                  <div className="px-4 mt-[22px]">
                    <span className="block mb-2 text-[15px] font-semibold text-foreground">
                      What is there
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {ROOM_AMENITIES.map((am) => {
                        const active = roomAmenities.includes(am)
                        return (
                          <button
                            key={am}
                            type="button"
                            aria-pressed={active}
                            onClick={() =>
                              setRoomAmenities((prev) =>
                                prev.includes(am)
                                  ? prev.filter((x) => x !== am)
                                  : [...prev, am]
                              )
                            }
                            className={cn(
                              'h-11 px-[18px] rounded-full border text-sm font-medium transition-colors cursor-pointer',
                              active
                                ? 'bg-[#0F6E6E] border-[#0F6E6E] text-white'
                                : 'bg-card border-border text-foreground hover:border-[#0F6E6E]/40'
                            )}
                          >
                            {am}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Service Availability & Included */}
              {formKind === 'svc' && (
                <>
                  <div className="px-4 mt-[22px]">
                    <label
                      htmlFor="f-av"
                      className="block mb-2 text-[15px] font-semibold text-foreground"
                    >
                      When are you available?
                    </label>
                    <input
                      id="f-av"
                      type="text"
                      value={serviceAvail}
                      onChange={(e) => setServiceAvail(e.target.value)}
                      placeholder="Daily, 4pm to 9pm"
                      className="w-full h-[52px] px-3.5 rounded-xl border border-border bg-card text-base text-foreground placeholder:text-muted-foreground outline-none focus:border-[#0F6E6E]"
                    />
                    <small className="block mt-1.5 text-[13px] text-muted-foreground">
                      Optional
                    </small>
                  </div>

                  <div className="px-4 mt-[22px]">
                    <label
                      htmlFor="f-inc"
                      className="block mb-2 text-[15px] font-semibold text-foreground"
                    >
                      What is included
                    </label>
                    <textarea
                      id="f-inc"
                      rows={3}
                      value={serviceIncluded}
                      onChange={(e) => setServiceIncluded(e.target.value)}
                      placeholder="One item per line"
                      className="w-full min-h-[96px] p-3.5 rounded-xl border border-border bg-card text-base text-foreground placeholder:text-muted-foreground outline-none focus:border-[#0F6E6E]"
                    />
                    <small className="block mt-1.5 text-[13px] text-muted-foreground">
                      Optional
                    </small>
                  </div>
                </>
              )}

              {/* Campus */}
              <div className="px-4 mt-[22px]">
                <span className="block mb-2 text-[15px] font-semibold text-foreground">
                  Campus
                </span>
                <div className="flex flex-wrap gap-2">
                  {(formKind === 'room'
                    ? ([
                        { label: 'Okerenkoko', value: 'Okerenkoko' },
                        { label: 'Kurutie', value: 'Kurutie' },
                      ] as const)
                    : ([
                        { label: 'Okerenkoko', value: 'Okerenkoko' },
                        { label: 'Kurutie', value: 'Kurutie' },
                        { label: 'Both campuses', value: 'Both' },
                      ] as const)
                  ).map((opt) => {
                    const active = formCampus === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setFormCampus(opt.value)}
                        className={cn(
                          'h-11 px-[18px] rounded-full border text-sm font-medium transition-colors cursor-pointer',
                          active
                            ? 'bg-[#0F6E6E] border-[#0F6E6E] text-white'
                            : 'bg-card border-border text-foreground hover:border-[#0F6E6E]/40'
                        )}
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Optional Typed Location Description + Optional Pinned GPS Map Location */}
              <div className="px-4 mt-[22px]">
                <label
                  htmlFor="f-loc"
                  className="block mb-2 text-[15px] font-semibold text-foreground"
                >
                  Location description (optional)
                </label>
                <input
                  id="f-loc"
                  type="text"
                  maxLength={80}
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder={
                    formKind === 'room'
                      ? 'e.g. 5 min walk from the main gate'
                      : 'Optional pickup spot, hostel block, or landmark'
                  }
                  className="w-full h-[52px] px-3.5 rounded-xl border border-border bg-card text-base text-foreground placeholder:text-muted-foreground outline-none focus:border-[#0F6E6E]"
                />
                <small className="block mt-1.5 text-[13px] text-muted-foreground">
                  Written explanation for buyers (separate from your GPS map pin).
                </small>

                <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3.5 py-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <MapPin className="w-4 h-4 text-[#0F6E6E] dark:text-[#22D3EE] shrink-0" />
                    <div className="min-w-0">
                      <span className="block text-[13px] font-semibold text-foreground truncate">
                        {vendor.latitude != null && vendor.longitude != null
                          ? 'GPS map location pinned'
                          : 'No GPS map pin added'}
                      </span>
                      <span className="block text-[11px] text-muted-foreground truncate">
                        {vendor.latitude != null && vendor.longitude != null
                          ? 'Google Maps directions enabled on your listings'
                          : 'Listings will ignore Google Maps unless pinned'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={locatingGps}
                    onClick={handlePinStoreGps}
                    className="h-8 px-3 rounded-lg bg-[#E6F2F2] dark:bg-muted text-[#0F6E6E] dark:text-[#22D3EE] text-xs font-semibold shrink-0 hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    {locatingGps
                      ? 'Pinning...'
                      : vendor.latitude != null && vendor.longitude != null
                      ? 'Update pin'
                      : 'Pin GPS'}
                  </button>
                </div>
              </div>

              {/* Description */}
              {formKind !== 'svc' && (
                <div className="px-4 mt-[22px]">
                  <label
                    htmlFor="f-d"
                    className="block mb-2 text-[15px] font-semibold text-foreground"
                  >
                    Description
                  </label>
                  <textarea
                    id="f-d"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Condition, size, anything a buyer should know"
                    className="w-full min-h-[96px] p-3.5 rounded-xl border border-border bg-card text-base text-foreground placeholder:text-muted-foreground outline-none focus:border-[#0F6E6E]"
                  />
                  <small className="block mt-1.5 text-[13px] text-muted-foreground">
                    Optional
                  </small>
                </div>
              )}

              <p className="px-4 pt-5 text-[13px] text-muted-foreground">
                Buyers message you on WhatsApp at {vendor.whatsapp_number}. You can change this in Store.
              </p>
            </div>

            {/* Sticky Bottom Publish Bar (.bar.on) */}
            <div className="fixed bottom-0 inset-x-0 z-30 bg-card border-t border-border shadow-lg">
              <div className="mx-auto w-full max-w-[480px] md:max-w-3xl px-4 py-2.5 sm:py-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))]">
                {/* Mobile View (<640px): Status row on top, balanced full-width split buttons below */}
                <div className="flex flex-col gap-2 sm:hidden">
                  <div className="flex items-center justify-between text-xs min-h-[18px]">
                    {missingReason ? (
                      <span className="text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1.5 truncate">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Still needed: {missingReason}</span>
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                        <span>Ready to publish</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={publishing}
                      onClick={() => handlePublish(true)}
                      className="flex-1 h-11 rounded-xl border border-border bg-card text-foreground font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-muted transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>Save draft</span>
                    </button>
                    <button
                      type="button"
                      disabled={!isFormReady || publishing}
                      onClick={() => handlePublish(false)}
                      className={cn(
                        'flex-1 h-11 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer',
                        isFormReady && !publishing
                          ? 'bg-[#0F6E6E] text-white hover:bg-[#0A4F4F]'
                          : 'bg-muted text-muted-foreground cursor-default'
                      )}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{publishing ? 'Saving...' : editId ? 'Save' : 'Publish'}</span>
                    </button>
                  </div>
                </div>

                {/* Tablet / Desktop View (>=640px): Status on left, buttons on right */}
                <div className="hidden sm:flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <small className="block text-xs text-muted-foreground">
                      {missingReason ? 'Still needed' : 'Ready'}
                    </small>
                    <b className="block text-[15px] font-semibold text-foreground truncate">
                      {missingReason || 'Ready to publish'}
                    </b>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      type="button"
                      disabled={publishing}
                      onClick={() => handlePublish(true)}
                      className="h-11 px-4 rounded-xl border border-border bg-card text-foreground font-semibold text-sm hover:bg-muted transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span>Save draft</span>
                    </button>
                    <button
                      type="button"
                      disabled={!isFormReady || publishing}
                      onClick={() => handlePublish(false)}
                      className={cn(
                        'h-11 px-5 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer',
                        isFormReady && !publishing
                          ? 'bg-[#0F6E6E] text-white hover:bg-[#0A4F4F]'
                          : 'bg-muted text-muted-foreground cursor-default'
                      )}
                    >
                      <Send className="w-4 h-4" />
                      <span>{publishing ? 'Saving...' : editId ? 'Save' : 'Publish'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= SCREEN 4: PUBLISHED CONFIRMATION (vDone) ================= */}
        {screen === 'v:done' && doneProduct && (
          <div>
            <section className="text-center pt-12 px-6 pb-2">
              <span className="w-16 h-16 rounded-full bg-[#0F6E6E] text-white inline-grid place-items-center">
                <Check className="w-8 h-8 stroke-[2.4]" />
              </span>
              <h2 className="mt-4 font-sans font-semibold text-[26px]">
                {wasEdited ? 'Saved' : 'Submitted'}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Once approved by admin, students at{' '}
                {doneProduct.campus || campusDisplay} can see it.
              </p>
            </section>

            <div className="mt-6 border-t border-border">
              <div className="flex items-center gap-3 w-full min-h-[76px] px-4 py-3 border-b border-border">
                <span className="w-[52px] h-[52px] rounded-xl bg-[#E6F2F2] text-[#0F6E6E] grid place-items-center shrink-0 overflow-hidden">
                  {doneProduct.images?.[0] &&
                  !doneProduct.images[0].includes('cadet-uniform-tailoring.jpg') ? (
                    <img
                      src={doneProduct.images[0]}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-5 h-5" />
                  )}
                </span>
                <span className="flex-1 min-w-0 block">
                  <b className="block text-[15px] font-semibold truncate">
                    {doneProduct.title}
                  </b>
                  <span className="block mt-0.5 text-[13px] text-muted-foreground tabular-nums">
                    {formatNaira(doneProduct.price)} · Pending admin review
                  </span>
                </span>
              </div>
            </div>

            <div className="px-4 mt-5 space-y-3">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Check out my store "${vendor.shop_name}" on Jetty: ${getCanonicalUrl(
                    `/vendors/${vendor.username ? `@${vendor.username}` : (vendor.slug || vendor.id)}`
                  )}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-12 w-full rounded-xl bg-[#0F6E6E] hover:bg-[#0A4F4F] text-white font-semibold text-[15px] flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                Share your store on WhatsApp
              </a>

              <button
                type="button"
                onClick={() => setScreen('v:new')}
                className="h-12 w-full rounded-xl bg-card border border-border text-[#0F6E6E] dark:text-[#22D3EE] font-semibold text-[15px] flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
              >
                Add another
              </button>

              <button
                type="button"
                onClick={() => setScreen('v:listings')}
                className="block mx-auto min-h-[44px] px-4 text-sm text-muted-foreground underline cursor-pointer"
              >
                View your listings
              </button>
            </div>
          </div>
        )}

        {/* ================= SCREEN 5: STORE SETTINGS (vStore) ================= */}
        {screen === 'v:store' && (
          <div>
            {/* Centered Store Header (.sthead) */}
            <section className="text-center pt-6 px-4">
              <div className="flex flex-col items-center">
                {/* Croppable Avatar Container */}
                <div className="relative inline-block">
                  <button
                    type="button"
                    onClick={() => avatarFileInputRef.current?.click()}
                    disabled={savingCroppedAvatar}
                    className="relative w-24 h-24 rounded-full overflow-hidden shadow-sm ring-4 ring-card hover:opacity-95 transition-all cursor-pointer group"
                    aria-label="Change store profile photo"
                  >
                    <UserAvatar
                      src={vendor.logo_url}
                      seed={vendor.id || vendor.slug}
                      name={vendor.shop_name}
                      size={96}
                      className="w-full h-full"
                      priority
                    />
                    {savingCroppedAvatar ? (
                      <div className="absolute inset-0 bg-black/55 flex items-center justify-center z-10">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </button>

                  {/* Corner Camera Badge */}
                  <button
                    type="button"
                    onClick={() => avatarFileInputRef.current?.click()}
                    disabled={savingCroppedAvatar}
                    aria-label="Edit profile photo"
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#0F6E6E] dark:bg-[#22D3EE] text-white dark:text-[#0B1220] flex items-center justify-center shadow-md border-2 border-card hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                {/* Explicit Button so vendors immediately know they can change it */}
                <button
                  type="button"
                  onClick={() => avatarFileInputRef.current?.click()}
                  disabled={savingCroppedAvatar}
                  className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#0F6E6E] dark:text-[#22D3EE] bg-[#0F6E6E]/10 hover:bg-[#0F6E6E]/15 border border-[#0F6E6E]/25 transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{savingCroppedAvatar ? 'Updating...' : 'Edit profile photo'}</span>
                </button>

                <input
                  ref={avatarFileInputRef}
                  type="file"
                  accept="image/*,image/heic,image/heif"
                  onChange={handleAvatarFileSelected}
                  disabled={savingCroppedAvatar}
                  className="hidden"
                />
              </div>

              <h2 className="mt-3.5 font-sans font-semibold text-[22px] text-foreground inline-flex items-center justify-center gap-1.5">
                <span>{vendor.shop_name}</span>
                {vendor.verification_status === 'verified' && <VerifiedBadge size={18} />}
              </h2>
              {vendor.username && (
                <p className="text-xs font-semibold text-[#0F6E6E] dark:text-[#22D3EE] mt-0.5">
                  @{vendor.username}
                </p>
              )}
              <p className="mt-0.5 text-sm text-muted-foreground">
                {campusDisplay}
                {vendor.location_label ? ` · ${vendor.location_label}` : ''}
              </p>
            </section>

            {/* Verification Banner (.verif from prototype) */}
            {vendor.verification_status === 'verified' ? (
              <div className="mx-4 mt-5 p-4 rounded-2xl border border-teal-500/20 bg-teal-500/10 dark:bg-teal-950/30 text-foreground flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-[#0F6E6E] dark:text-[#22D3EE] flex items-center justify-center shrink-0 mt-0.5">
                  <VerifiedBadge size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <b className="block text-[15px] font-semibold text-foreground">
                    {vendor.is_featured ? 'Verified & Featured' : 'Verified Vendor'}
                  </b>
                  <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                    Your shop shows a blue tick badge and appears first in Stores and Listings.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mx-4 mt-5 p-4 rounded-2xl border border-amber-500/30 bg-[#FBF1D6] dark:bg-amber-950/30 text-[#0E1B1B] dark:text-amber-100 space-y-2.5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <b className="block text-[15px] font-semibold">Not verified yet</b>
                    <p className="mt-0.5 text-xs text-muted-foreground dark:text-amber-200/80 leading-relaxed">
                      Your store is live. Verified shops get a blue tick and top placement in search. Message the Jetty team on WhatsApp to get verified.
                    </p>
                  </div>
                </div>
                <a
                  href={buildJettyTeamWhatsAppUrl(
                    `Hi Jetty Team! I'd like to get my store "${vendor.shop_name}" (${getCanonicalUrl(
                      `/vendors/${vendor.username ? `@${vendor.username}` : (vendor.slug || vendor.id)}`
                    )}) verified and featured on Jetty.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-full rounded-xl bg-[#0F6E6E] hover:bg-[#0A4F4F] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  Message the Jetty team
                </a>
              </div>
            )}

            {/* Categorized Settings Groups (Minimal & Professional iOS style) */}
            <div className="mt-6 px-4 space-y-6 pb-24">
              {/* Category 1: STORE PROFILE */}
              <div className="space-y-2">
                <h3 className="px-1 text-[13px] font-medium text-muted-foreground">
                  Store Profile
                </h3>
                <div className="rounded-2xl border border-border/80 bg-card overflow-hidden divide-y divide-border/60 shadow-2xs">
                  {/* Shop name */}
                  <button
                    type="button"
                    onClick={() => openStoreEdit('name')}
                    className="flex items-center gap-3.5 w-full min-h-[52px] px-4 py-3.5 text-left hover:bg-muted/40 active:bg-muted/60 transition-colors cursor-pointer group"
                  >
                    <Store className="w-5 h-5 text-muted-foreground group-hover:text-foreground shrink-0 stroke-[1.75] transition-colors" />
                    <span className="flex-1 font-medium text-[15px] text-foreground leading-snug">
                      Shop name
                    </span>
                    <span className="text-sm text-muted-foreground truncate max-w-[150px] text-right font-normal">
                      {vendor.shop_name}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground/70 shrink-0 transition-colors ml-0.5" />
                  </button>

                  {/* Store handle (@username) */}
                  <button
                    type="button"
                    onClick={() => openStoreEdit('username')}
                    className="flex items-center gap-3.5 w-full min-h-[52px] px-4 py-3.5 text-left hover:bg-muted/40 active:bg-muted/60 transition-colors cursor-pointer group"
                  >
                    <AtSign className="w-5 h-5 text-muted-foreground group-hover:text-foreground shrink-0 stroke-[1.75] transition-colors" />
                    <span className="flex-1 font-medium text-[15px] text-foreground leading-snug">
                      Store handle
                    </span>
                    <span className="text-sm text-[#0F6E6E] dark:text-[#22D3EE] truncate max-w-[150px] text-right font-normal">
                      {vendor.username
                        ? `@${vendor.username}`
                        : vendor.slug
                        ? `@${vendor.slug}`
                        : 'Set handle'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground/70 shrink-0 transition-colors ml-0.5" />
                  </button>

                  {/* About */}
                  <button
                    type="button"
                    onClick={() => openStoreEdit('about')}
                    className="flex items-center gap-3.5 w-full min-h-[52px] px-4 py-3.5 text-left hover:bg-muted/40 active:bg-muted/60 transition-colors cursor-pointer group"
                  >
                    <FileText className="w-5 h-5 text-muted-foreground group-hover:text-foreground shrink-0 stroke-[1.75] transition-colors" />
                    <span className="flex-1 font-medium text-[15px] text-foreground leading-snug">
                      About
                    </span>
                    <span className="text-sm text-muted-foreground truncate max-w-[150px] text-right font-normal">
                      {vendor.description ? 'Added' : 'Add'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground/70 shrink-0 transition-colors ml-0.5" />
                  </button>

                  {/* Store photo */}
                  <button
                    type="button"
                    onClick={() => avatarFileInputRef.current?.click()}
                    disabled={savingCroppedAvatar}
                    className="flex items-center gap-3.5 w-full min-h-[52px] px-4 py-3.5 text-left hover:bg-muted/40 active:bg-muted/60 transition-colors cursor-pointer group"
                  >
                    <Camera className="w-5 h-5 text-muted-foreground group-hover:text-foreground shrink-0 stroke-[1.75] transition-colors" />
                    <span className="flex-1 font-medium text-[15px] text-foreground leading-snug">
                      Store logo / photo
                    </span>
                    <span className="text-sm text-muted-foreground truncate max-w-[150px] text-right font-normal">
                      {savingCroppedAvatar
                        ? 'Updating...'
                        : vendor.logo_url
                        ? 'Custom photo'
                        : 'Initial monogram'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground/70 shrink-0 transition-colors ml-0.5" />
                  </button>
                </div>
              </div>

              {/* Category 2: LOCATION & CONTACT */}
              <div className="space-y-2">
                <h3 className="px-1 text-[13px] font-medium text-muted-foreground">
                  Location &amp; Contact
                </h3>
                <div className="rounded-2xl border border-border/80 bg-card overflow-hidden divide-y divide-border/60 shadow-2xs">
                  {/* WhatsApp number */}
                  <button
                    type="button"
                    onClick={() => openStoreEdit('phone')}
                    className="flex items-center gap-3.5 w-full min-h-[52px] px-4 py-3.5 text-left hover:bg-muted/40 active:bg-muted/60 transition-colors cursor-pointer group"
                  >
                    <Phone className="w-5 h-5 text-muted-foreground group-hover:text-foreground shrink-0 stroke-[1.75] transition-colors" />
                    <span className="flex-1 font-medium text-[15px] text-foreground leading-snug">
                      WhatsApp number
                    </span>
                    <span className="text-sm tabular-nums text-muted-foreground truncate max-w-[150px] text-right font-normal">
                      {vendor.whatsapp_number}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground/70 shrink-0 transition-colors ml-0.5" />
                  </button>

                  {/* Campus */}
                  <button
                    type="button"
                    onClick={() => openStoreEdit('campus')}
                    className="flex items-center gap-3.5 w-full min-h-[52px] px-4 py-3.5 text-left hover:bg-muted/40 active:bg-muted/60 transition-colors cursor-pointer group"
                  >
                    <Navigation className="w-5 h-5 text-muted-foreground group-hover:text-foreground shrink-0 stroke-[1.75] transition-colors" />
                    <span className="flex-1 font-medium text-[15px] text-foreground leading-snug">
                      Campus
                    </span>
                    <span className="text-sm text-muted-foreground truncate max-w-[150px] text-right font-normal">
                      {campusDisplay}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground/70 shrink-0 transition-colors ml-0.5" />
                  </button>

                  {/* Location description */}
                  <button
                    type="button"
                    onClick={() => openStoreEdit('location')}
                    className="flex items-center gap-3.5 w-full min-h-[52px] px-4 py-3.5 text-left hover:bg-muted/40 active:bg-muted/60 transition-colors cursor-pointer group"
                  >
                    <MapPin className="w-5 h-5 text-muted-foreground group-hover:text-foreground shrink-0 stroke-[1.75] transition-colors" />
                    <span className="flex-1 font-medium text-[15px] text-foreground leading-snug">
                      Location description
                    </span>
                    <span className="text-sm text-muted-foreground truncate max-w-[150px] text-right font-normal">
                      {vendor.location_label ? vendor.location_label : 'Add'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground/70 shrink-0 transition-colors ml-0.5" />
                  </button>

                  {/* GPS map pin */}
                  <button
                    type="button"
                    onClick={() => openStoreEdit('map_pin')}
                    className="flex items-center gap-3.5 w-full min-h-[52px] px-4 py-3.5 text-left hover:bg-muted/40 active:bg-muted/60 transition-colors cursor-pointer group"
                  >
                    <Compass className="w-5 h-5 text-muted-foreground group-hover:text-foreground shrink-0 stroke-[1.75] transition-colors" />
                    <span className="flex-1 font-medium text-[15px] text-foreground leading-snug">
                      Map location (GPS)
                    </span>
                    <span className="text-sm text-muted-foreground truncate max-w-[150px] text-right font-normal">
                      {vendor.latitude != null && vendor.longitude != null
                        ? 'Pinned on map'
                        : 'Add'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground/70 shrink-0 transition-colors ml-0.5" />
                  </button>
                </div>
              </div>

              {/* Category 3: PUBLIC STOREFRONT */}
              <div className="space-y-2">
                <h3 className="px-1 text-[13px] font-medium text-muted-foreground">
                  Public Storefront
                </h3>
                <div className="rounded-2xl border border-border/80 bg-card overflow-hidden divide-y divide-border/60 shadow-2xs">
                  {/* See store as a buyer */}
                  <Link
                    href={`/vendors/${vendor.username ? `@${vendor.username}` : (vendor.slug || vendor.id)}`}
                    className="flex items-center gap-3.5 w-full min-h-[52px] px-4 py-3.5 hover:bg-muted/40 active:bg-muted/60 transition-colors group"
                  >
                    <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-foreground shrink-0 stroke-[1.75] transition-colors" />
                    <span className="flex-1 font-medium text-[15px] text-foreground leading-snug">
                      See your store as a buyer
                    </span>
                    <span className="text-sm text-muted-foreground font-normal">Preview</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground/70 shrink-0 transition-colors ml-0.5" />
                  </Link>

                  {/* Share on WhatsApp */}
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `Check out my store "${vendor.shop_name}" on Jetty: ${getCanonicalUrl(
                        `/vendors/${vendor.username ? `@${vendor.username}` : (vendor.slug || vendor.id)}`
                      )}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3.5 w-full min-h-[52px] px-4 py-3.5 hover:bg-muted/40 active:bg-muted/60 transition-colors group"
                  >
                    <Share2 className="w-5 h-5 text-muted-foreground group-hover:text-foreground shrink-0 stroke-[1.75] transition-colors" />
                    <span className="flex-1 font-medium text-[15px] text-foreground leading-snug">
                      Share your store on WhatsApp
                    </span>
                    <span className="text-sm text-muted-foreground font-normal">Share link</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground/70 shrink-0 transition-colors ml-0.5" />
                  </a>
                </div>
              </div>

              {/* Category 4: ACCOUNT & APP */}
              <div className="space-y-2">
                <h3 className="px-1 text-[13px] font-medium text-muted-foreground">
                  Account &amp; App
                </h3>
                <div className="rounded-2xl border border-border/80 bg-card overflow-hidden divide-y divide-border/60 shadow-2xs">
                  {/* Switch to buying */}
                  <Link
                    href="/"
                    className="flex items-center gap-3.5 w-full min-h-[52px] px-4 py-3.5 hover:bg-muted/40 active:bg-muted/60 transition-colors group"
                  >
                    <ArrowLeftRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground shrink-0 stroke-[1.75] transition-colors" />
                    <span className="flex-1 font-medium text-[15px] text-foreground leading-snug">
                      Switch to buying
                    </span>
                    <span className="text-sm text-muted-foreground font-normal">Consumer mode</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground/70 shrink-0 transition-colors ml-0.5" />
                  </Link>

                  {/* Admin moderation queue */}
                  {(profile?.role === 'admin' ||
                    isAdminEmail(user?.email) ||
                    isAdminEmail(profile?.email)) && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-3.5 w-full min-h-[52px] px-4 py-3.5 hover:bg-muted/40 active:bg-muted/60 transition-colors group"
                    >
                      <ShieldAlert className="w-5 h-5 text-amber-500/80 group-hover:text-amber-500 shrink-0 stroke-[1.75] transition-colors" />
                      <span className="flex-1 font-medium text-[15px] text-foreground leading-snug">
                        Admin moderation queue
                      </span>
                      <span className="text-sm text-muted-foreground font-normal">Admin only</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground/70 shrink-0 transition-colors ml-0.5" />
                    </Link>
                  )}

                  {/* Log out */}
                  <button
                    type="button"
                    onClick={async () => {
                      const supabase = createClient()
                      await supabase.auth.signOut()
                      toast.success('Signed out')
                      router.push('/')
                      router.refresh()
                    }}
                    className="flex items-center gap-3.5 w-full min-h-[52px] px-4 py-3.5 text-left hover:bg-muted/40 active:bg-muted/60 transition-colors cursor-pointer group"
                  >
                    <LogOut className="w-5 h-5 text-muted-foreground group-hover:text-foreground shrink-0 stroke-[1.75] transition-colors" />
                    <span className="flex-1 font-medium text-[15px] text-foreground leading-snug">
                      Log out
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground/70 shrink-0 transition-colors ml-0.5" />
                  </button>
                </div>
              </div>

              {/* Category 5: DANGER ZONE */}
              <div className="space-y-2">
                <h3 className="px-1 text-[13px] font-medium text-red-500 dark:text-red-400">
                  Danger Zone
                </h3>
                <div className="rounded-2xl border border-red-500/20 bg-card overflow-hidden shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setShowDeleteAccountModal(true)}
                    className="flex items-center gap-3.5 w-full min-h-[56px] px-4 py-3.5 text-left hover:bg-red-500/5 active:bg-red-500/10 transition-colors cursor-pointer group"
                  >
                    <Trash2 className="w-5 h-5 text-red-500/80 group-hover:text-red-500 shrink-0 stroke-[1.75] transition-colors" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[15px] text-red-600 dark:text-red-400 leading-snug">
                        Delete account &amp; store
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        Permanently purges your shop, listings, and profile
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-red-400/40 group-hover:text-red-400/70 shrink-0 transition-colors ml-0.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-base">
                  Delete Account &amp; Storefront?
                </h3>
                <p className="text-xs text-muted-foreground">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Permanently delete your account, your vendor shop profile, and purge all your active listings (products, rooms, and services).
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={deletingAccount}
                onClick={() => setShowDeleteAccountModal(false)}
                className="px-4 py-2 rounded-xl border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingAccount}
                onClick={handleDeleteAccount}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                {deletingAccount && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{deletingAccount ? 'Deleting...' : 'Yes, Delete Store & Account'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= VENDOR 3-TAB BOTTOM NAV (Matches Buyer Bottom Nav) ================= */}
      {screen !== 'v:form' && (
        <nav
          role="tablist"
          aria-label="Selling navigation"
          className="fixed bottom-0 inset-x-0 z-50 h-[calc(64px+env(safe-area-inset-bottom,0px))] pb-[env(safe-area-inset-bottom,0px)] border-t border-border bg-card/95 backdrop-blur-md transform-gpu will-change-transform"
          style={{ transform: 'translate3d(0, 0, 0)' }}
        >
          <div className="grid h-full grid-cols-3 max-w-[480px] mx-auto">
            {(
              [
                { key: 'v:listings' as const, label: 'Listings', icon: List },
                { key: 'v:new' as const, label: 'Add', icon: Plus },
                { key: 'v:store' as const, label: 'Store', icon: Store },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon
              const active = activeNavTab === tab.key
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setScreen(tab.key)}
                  className={cn(
                    'relative flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors cursor-pointer select-none',
                    active
                      ? 'text-foreground font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon
                    strokeWidth={active ? 2.4 : 1.75}
                    className={cn(
                      'h-[22px] w-[22px] shrink-0 transition-all',
                      active && 'scale-105'
                    )}
                  />
                  <span className="truncate max-w-[72px] leading-none tracking-tight">
                    {tab.label}
                  </span>
                </button>
              )
            })}
          </div>
        </nav>
      )}

      {/* ================= LISTING ACTION SHEET (openAct from prototype) ================= */}
      {actionProduct && !confirmDeleteProduct && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="fixed inset-0 bg-[#0A1F1F]/50"
            onClick={() => setActionProduct(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-[430px] rounded-t-[20px] bg-card px-4 pt-5 pb-[calc(20px+env(safe-area-inset-bottom,0px))] shadow-xl"
          >
            <h3 className="font-sans font-semibold text-[21px] mb-2 truncate">
              {actionProduct.title}
            </h3>

            {actionProduct.status === 'draft' ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    const target = actionProduct
                    setActionProduct(null)
                    populateFormForEdit(target)
                  }}
                  className="flex items-center gap-3 w-full min-h-[64px] py-2 border-t border-border text-left cursor-pointer hover:bg-muted/30 transition-colors"
                >
                  <span className="w-11 h-11 rounded-xl bg-[#E6F2F2] dark:bg-muted text-[#0F6E6E] grid place-items-center shrink-0">
                    <Edit3 className="w-5 h-5" />
                  </span>
                  <div>
                    <b className="text-base font-semibold block text-foreground">Edit draft</b>
                    <span className="text-xs text-muted-foreground block">Continue editing details</span>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={busyAction}
                  onClick={async () => {
                    setBusyAction(true)
                    try {
                      const res = await fetch('/api/vendor/listings', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          id: actionProduct.id,
                          status: 'pending_review',
                        }),
                      })
                      const json = await res.json()
                      if (!res.ok || json.error) {
                        toast.error(json.error || 'Could not publish draft.')
                        return
                      }
                      setProducts((prev) =>
                        prev.map((item) =>
                          item.id === actionProduct.id
                            ? { ...item, status: 'pending_review' }
                            : item
                        )
                      )
                      toast.success('Draft submitted for review!')
                      setActionProduct(null)
                      router.refresh()
                    } catch {
                      toast.error('Network error publishing draft.')
                    } finally {
                      setBusyAction(false)
                    }
                  }}
                  className="flex items-center gap-3 w-full min-h-[64px] py-2 border-t border-border text-left cursor-pointer hover:bg-muted/30 transition-colors"
                >
                  <span className="w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 grid place-items-center shrink-0">
                    <Check className="w-5 h-5 stroke-[2.2]" />
                  </span>
                  <div>
                    <b className="text-base font-semibold block text-emerald-600 dark:text-emerald-400">Publish now</b>
                    <span className="text-xs text-muted-foreground block">Submit draft for admin review</span>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={busyAction}
                  onClick={() => setConfirmDeleteProduct(actionProduct)}
                  className="flex items-center gap-3 w-full min-h-[64px] py-2 border-t border-border text-left cursor-pointer hover:bg-red-500/10 transition-colors"
                >
                  <span className="w-11 h-11 rounded-xl bg-red-500/10 text-red-600 grid place-items-center shrink-0">
                    <Trash2 className="w-5 h-5" />
                  </span>
                  <div>
                    <b className="text-base font-semibold text-[#A32020] dark:text-red-400 block">Delete draft</b>
                    <span className="text-xs text-muted-foreground block">Permanently remove this draft</span>
                  </div>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    const target = actionProduct
                    setActionProduct(null)
                    populateFormForEdit(target)
                  }}
                  className="flex items-center gap-3 w-full min-h-[64px] py-2 border-t border-border text-left cursor-pointer"
                >
                  <span className="w-11 h-11 rounded-xl bg-[#E6F2F2] dark:bg-muted text-[#0F6E6E] grid place-items-center shrink-0">
                    <Edit3 className="w-5 h-5" />
                  </span>
                  <b className="text-base font-semibold">Edit</b>
                </button>

                <button
                  type="button"
                  disabled={busyAction}
                  onClick={() => handleToggleSold(actionProduct)}
                  className="flex items-center gap-3 w-full min-h-[64px] py-2 border-t border-border text-left cursor-pointer"
                >
                  <span className="w-11 h-11 rounded-xl bg-[#E6F2F2] dark:bg-muted text-[#0F6E6E] grid place-items-center shrink-0">
                    <Check className="w-5 h-5" />
                  </span>
                  <b className="text-base font-semibold">
                    {actionProduct.stock_status === 'out_of_stock'
                      ? 'List again'
                      : 'Mark as sold'}
                  </b>
                </button>

                {actionProduct.stock_status !== 'out_of_stock' && (
                  <button
                    type="button"
                    disabled={busyAction}
                    onClick={() => handleTogglePause(actionProduct)}
                    className="flex items-center gap-3 w-full min-h-[64px] py-2 border-t border-border text-left cursor-pointer"
                  >
                    <span className="w-11 h-11 rounded-xl bg-[#E6F2F2] dark:bg-muted text-[#0F6E6E] grid place-items-center shrink-0">
                      <Pause className="w-5 h-5" />
                    </span>
                    <span>
                      <b className="block text-base font-semibold">
                        {actionProduct.status === 'archived' ? 'Show again' : 'Pause'}
                      </b>
                      <small className="text-[13px] text-muted-foreground">
                        {actionProduct.status === 'archived'
                          ? 'Submit to show buyers again'
                          : 'Hide it from buyers for now'}
                      </small>
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setConfirmDeleteProduct(actionProduct)}
                  className="flex items-center gap-3 w-full min-h-[64px] py-2 border-t border-border text-left cursor-pointer"
                >
                  <span className="w-11 h-11 rounded-xl bg-[#E6F2F2] dark:bg-muted text-[#0F6E6E] grid place-items-center shrink-0">
                    <Trash2 className="w-5 h-5" />
                  </span>
                  <b className="text-base font-semibold text-[#A32020] dark:text-red-400">
                    Delete
                  </b>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setActionProduct(null)}
              className="w-full h-12 mt-2 rounded-xl bg-background font-medium text-[15px] cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION SHEET (confirmDel from prototype) ================= */}
      {confirmDeleteProduct && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="fixed inset-0 bg-[#0A1F1F]/50"
            onClick={() => setConfirmDeleteProduct(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-[430px] rounded-t-[20px] bg-card px-4 pt-5 pb-[calc(20px+env(safe-area-inset-bottom,0px))] shadow-xl"
          >
            <h3 className="font-sans font-semibold text-[21px] mb-2">
              Delete this listing?
            </h3>
            <p className="mb-3 text-sm text-muted-foreground">
              {confirmDeleteProduct.title} will be removed for good. If it sold, mark it as sold instead.
            </p>
            <button
              type="button"
              disabled={busyAction}
              onClick={() => handleDeleteConfirm(confirmDeleteProduct)}
              className="flex items-center gap-3 w-full min-h-[64px] py-2 border-t border-border text-left cursor-pointer"
            >
              <span className="w-11 h-11 rounded-xl bg-[#E6F2F2] dark:bg-muted text-[#0F6E6E] grid place-items-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </span>
              <b className="text-base font-semibold text-[#A32020] dark:text-red-400">
                {busyAction ? 'Deleting...' : 'Delete'}
              </b>
            </button>
            <button
              type="button"
              onClick={() => setConfirmDeleteProduct(null)}
              className="w-full h-12 mt-2 rounded-xl bg-background font-medium text-[15px] cursor-pointer"
            >
              Keep it
            </button>
          </div>
        </div>
      )}

      {/* ================= REQUEST CATEGORY / SERVICE SHEET ================= */}
      {catReqOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="fixed inset-0 bg-[#0A1F1F]/50"
            onClick={() => setCatReqOpen(false)}
          />
          <form
            onSubmit={handleCategoryRequestSubmit}
            className="relative z-10 w-full max-w-[430px] rounded-t-[20px] bg-card px-4 pt-5 pb-[calc(20px+env(safe-area-inset-bottom,0px))] shadow-xl space-y-4"
          >
            <h3 className="font-sans font-semibold text-[21px]">
              {catReqKind === 'service'
                ? 'Request a service'
                : catReqKind === 'room'
                ? 'Request a housing type'
                : 'Request an item category'}
            </h3>
            <p className="text-sm text-muted-foreground -mt-2">
              {catReqKind === 'service'
                ? 'Suggest a service type for admin to approve and add to the campus services catalog.'
                : catReqKind === 'room'
                ? 'Suggest an accommodation type for admin to approve.'
                : 'Suggest a category for admin to approve and add to Jetty.'}
            </p>
            <div>
              <label className="block mb-1.5 text-sm font-semibold">
                {catReqKind === 'service'
                  ? 'Service name'
                  : catReqKind === 'room'
                  ? 'Housing type'
                  : 'Category name'}
              </label>
              <input
                type="text"
                required
                maxLength={48}
                value={catReqName}
                onChange={(e) => setCatReqName(e.target.value)}
                placeholder={
                  catReqKind === 'service'
                    ? 'e.g. Electrical Installation & Repairs'
                    : catReqKind === 'room'
                    ? 'e.g. 2-Bedroom Flat, Self-Contain with Balcony'
                    : 'e.g. Lab Coats & Medical Kits'
                }
                className="w-full h-12 px-3.5 rounded-xl border border-border bg-background text-base outline-none focus:border-[#0F6E6E]"
              />
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-semibold">
                {catReqKind === 'service'
                  ? 'What does this service include? (optional)'
                  : catReqKind === 'room'
                  ? 'Details or amenities (optional)'
                  : 'What items belong here? (optional)'}
              </label>
              <input
                type="text"
                maxLength={120}
                value={catReqDesc}
                onChange={(e) => setCatReqDesc(e.target.value)}
                placeholder="Optional note for admin"
                className="w-full h-12 px-3.5 rounded-xl border border-border bg-background text-base outline-none focus:border-[#0F6E6E]"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setCatReqOpen(false)}
                className="flex-1 h-12 rounded-xl bg-background font-medium text-[15px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!catReqName.trim() || submittingCatReq}
                className="flex-1 h-12 rounded-xl bg-[#0F6E6E] text-white font-semibold text-[15px] disabled:opacity-50 cursor-pointer"
              >
                {submittingCatReq ? 'Sending...' : 'Send request'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= STORE FIELD EDIT SHEET ================= */}
      {editingStoreField && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="fixed inset-0 bg-[#0A1F1F]/50"
            onClick={() => setEditingStoreField(null)}
          />
          <div className="relative z-10 w-full max-w-[430px] rounded-t-[20px] bg-card px-4 pt-5 pb-[calc(20px+env(safe-area-inset-bottom,0px))] shadow-xl space-y-4">
            <h3 className="font-sans font-semibold text-[21px]">
              {editingStoreField === 'name'
                ? 'Shop name'
                : editingStoreField === 'username'
                ? 'Store handle (@username)'
                : editingStoreField === 'phone'
                ? 'WhatsApp number'
                : editingStoreField === 'campus'
                ? 'Where do you sell?'
                : editingStoreField === 'location'
                ? 'Location description (optional)'
                : editingStoreField === 'map_pin'
                ? 'Map location (GPS)'
                : 'About your shop'}
            </h3>

            {editingStoreField === 'map_pin' ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Pin your current GPS location so buyers can open Google Maps directions on your store and listings. If you do not pin a GPS location, listings will ignore Google Maps and only show your written location description.
                </p>

                {vendor.latitude != null && vendor.longitude != null && (
                  <div className="flex items-center gap-2 rounded-xl bg-[#E6F2F2] dark:bg-muted px-3.5 py-2.5 text-xs font-medium text-[#0A4F4F] dark:text-foreground">
                    <MapPin className="w-4 h-4 shrink-0 text-[#0F6E6E] dark:text-[#22D3EE]" />
                    <span>
                      Pinned ({Number(vendor.latitude).toFixed(5)},{' '}
                      {Number(vendor.longitude).toFixed(5)})
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  disabled={locatingGps}
                  onClick={handlePinStoreGps}
                  className="w-full h-12 rounded-xl bg-[#0F6E6E] hover:bg-[#0A4F4F] text-white font-semibold text-[15px] flex items-center justify-center gap-2 transition-colors disabled:opacity-60 cursor-pointer"
                >
                  <Navigation className="w-4 h-4" />
                  <span>
                    {locatingGps
                      ? 'Detecting GPS location...'
                      : vendor.latitude != null && vendor.longitude != null
                      ? 'Update with current GPS location'
                      : 'Use my current GPS location'}
                  </span>
                </button>

                {vendor.latitude != null && vendor.longitude != null && (
                  <button
                    type="button"
                    disabled={savingStoreField}
                    onClick={handleClearStoreGps}
                    className="w-full h-11 rounded-xl border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 font-semibold text-sm flex items-center justify-center transition-colors cursor-pointer"
                  >
                    {savingStoreField ? 'Removing...' : 'Remove map pin'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setEditingStoreField(null)}
                  className="w-full h-11 rounded-xl bg-background font-medium text-sm cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : editingStoreField === 'campus' ? (
              <div className="flex flex-wrap gap-2 py-1">
                {(
                  [
                    { label: 'Okerenkoko', value: 'Okerenkoko' },
                    { label: 'Kurutie', value: 'Kurutie' },
                    { label: 'Both campuses', value: 'Both' },
                  ] as const
                ).map((opt) => {
                  const active = draftStoreValue === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setDraftStoreValue(opt.value)}
                      className={cn(
                        'h-11 px-[18px] rounded-full border text-sm font-medium transition-colors cursor-pointer',
                        active
                          ? 'bg-[#0F6E6E] border-[#0F6E6E] text-white'
                          : 'bg-background border-border text-foreground'
                      )}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            ) : editingStoreField === 'username' ? (
              (() => {
                const daysSinceChange = vendor.username_changed_at
                  ? (Date.now() - new Date(vendor.username_changed_at).getTime()) /
                    (1000 * 60 * 60 * 24)
                  : 999
                const inCooldown = daysSinceChange < 14
                const remaining = Math.ceil(14 - daysSinceChange)
                const cleaned = draftStoreValue.trim().replace(/^@/, '').toLowerCase()

                return (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Your unique store handle for direct links and social media searches.
                      Can only be edited once every 14 days.
                    </p>

                    {inCooldown && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs">
                        ⚠️ You recently changed your username. You can edit it again in <b>{remaining} day{remaining === 1 ? '' : 's'}</b>.
                      </div>
                    )}

                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-base font-semibold text-muted-foreground select-none">
                        @
                      </span>
                      <input
                        type="text"
                        disabled={inCooldown}
                        value={draftStoreValue.replace(/^@/, '')}
                        onChange={(e) =>
                          setDraftStoreValue(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                        }
                        placeholder="swiftstitch"
                        maxLength={20}
                        className="w-full h-12 pl-8 pr-3.5 rounded-xl border border-border bg-background text-base outline-none focus:border-[#0F6E6E] disabled:opacity-50"
                      />
                    </div>

                    {cleaned && (
                      <p className="text-xs text-muted-foreground truncate">
                        Store link:{' '}
                        <span className="font-semibold text-[#0F6E6E] dark:text-[#22D3EE]">
                          jetty.francisnaga.site/vendors/@{cleaned}
                        </span>
                      </p>
                    )}
                  </div>
                )
              })()
            ) : editingStoreField === 'about' ? (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Store description (~50 words)</span>
                  <span className="tabular-nums">{draftStoreValue.length}/300</span>
                </div>
                <textarea
                  rows={4}
                  maxLength={300}
                  value={draftStoreValue}
                  onChange={(e) => setDraftStoreValue(e.target.value)}
                  placeholder="Tell students what you sell, your specialties, or hostel delivery terms..."
                  className="w-full min-h-[110px] p-3.5 rounded-xl border border-border bg-background text-base outline-none focus:border-[#0F6E6E] resize-none leading-relaxed"
                />
                <p className="text-xs text-muted-foreground">
                  Displayed on your store profile header so buyers immediately understand what you offer.
                </p>
              </div>
            ) : (
              <input
                type={editingStoreField === 'phone' ? 'tel' : 'text'}
                value={draftStoreValue}
                onChange={(e) => setDraftStoreValue(e.target.value)}
                placeholder={
                  editingStoreField === 'location'
                    ? 'e.g. Block B Hostel, or near the gate (leave empty to hide)'
                    : ''
                }
                className="w-full h-12 px-3.5 rounded-xl border border-border bg-background text-base outline-none focus:border-[#0F6E6E]"
              />
            )}

            {editingStoreField !== 'map_pin' && (
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setEditingStoreField(null)}
                  className="flex-1 h-12 rounded-xl bg-background font-medium text-[15px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={
                    savingStoreField ||
                    (editingStoreField === 'username' &&
                      ((vendor.username_changed_at &&
                        (Date.now() - new Date(vendor.username_changed_at).getTime()) /
                          (1000 * 60 * 60 * 24) <
                          14) ||
                        draftStoreValue.trim().replace(/^@/, '').length < 3))
                  }
                  onClick={handleSaveStoreField}
                  className="flex-1 h-12 rounded-xl bg-[#0F6E6E] text-white font-semibold text-[15px] disabled:opacity-50 cursor-pointer"
                >
                  {savingStoreField ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interactive Store Profile Photo Cropper Modal */}
      <ImageCropperModal
        isOpen={cropModalOpen}
        imageSrc={rawImageForCrop}
        onClose={() => {
          setCropModalOpen(false)
          setRawImageForCrop(null)
        }}
        onSave={handleSaveCroppedAvatar}
        isSaving={savingCroppedAvatar}
        title="Crop store photo"
      />
      {/* New Store Celebration Modal */}
      {showNewStoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-card border border-border p-6 sm:p-7 shadow-2xl space-y-5 text-center relative">
            <button
              type="button"
              onClick={() => setShowNewStoreModal(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-muted/60 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mx-auto w-16 h-16 rounded-2xl bg-[#E6F2F2] dark:bg-[#132A2A] text-[#0F6E6E] dark:text-[#22D3EE] flex items-center justify-center shadow-xs">
              <Store className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#E6F2F2] text-[#0F6E6E] dark:bg-[#132A2A] dark:text-[#22D3EE]">
                🎉 Your store is ready!
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground font-[family-name:var(--font-bricolage)]">
                {vendor.shop_name}
              </h2>
              {vendor.username && (
                <p className="text-xs font-medium text-muted-foreground">
                  @{vendor.username}
                </p>
              )}
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1">
                Your vendor store is now live on Jetty NMU. Students and campus residents can discover your items, services, and lodges.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <Link
                href={`/vendors/${vendor.username ? `@${vendor.username}` : (vendor.slug || vendor.id)}`}
                onClick={() => setShowNewStoreModal(false)}
                className="w-full h-12 rounded-xl bg-[#0F6E6E] hover:bg-[#0A4F4F] dark:bg-[#14B8A6] dark:hover:bg-[#0F9E8E] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View my store</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setShowNewStoreModal(false)
                  setScreen('v:new')
                }}
                className="w-full h-12 rounded-xl border border-border bg-card hover:bg-muted font-semibold text-sm text-foreground flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#0F6E6E] dark:text-[#22D3EE]" />
                <span>Add your first listing</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
