'use client'

import { useState, useEffect } from 'react'
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
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  CampusArea,
  Category,
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
import { isImageFile, compressImageFile } from '@/lib/image-compression'
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
}

type VendorScreen =
  | 'v:listings'
  | 'v:new'
  | 'v:store'
  | 'v:form'
  | 'v:done'

const ROOM_TYPES = ['Self-contain', 'Shared room', 'Private room', 'Bedspace']
const ROOM_AMENITIES = [
  'Water',
  'Power backup',
  'Fenced compound',
  'Tiled floor',
  'Ensuite bathroom',
  'Wardrobe',
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
}: VendorDashboardClientProps) {
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
  const [listingsView, setListingsView] = useState<'active' | 'sold'>('active')

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

  // Category Request Bottom Sheet state
  const [catReqOpen, setCatReqOpen] = useState(false)
  const [catReqName, setCatReqName] = useState('')
  const [catReqDesc, setCatReqDesc] = useState('')
  const [submittingCatReq, setSubmittingCatReq] = useState(false)

  // Store Settings Edit Bottom Sheet state
  const [editingStoreField, setEditingStoreField] = useState<
    null | 'name' | 'phone' | 'campus' | 'location' | 'about'
  >(null)
  const [draftStoreValue, setDraftStoreValue] = useState('')
  const [savingStoreField, setSavingStoreField] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Load initial edit product if initialEditId was passed
  useEffect(() => {
    if (initialEditId) {
      const target = products.find((p) => p.id === initialEditId)
      if (target) {
        populateFormForEdit(target)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialEditId])

  const startNewForm = (kind: 'item' | 'room' | 'svc') => {
    setFormKind(kind)
    setEditId('')
    setPhotos([])
    setTitle('')
    setPrice('')
    setCategoryId(categories[0]?.id || '')
    setCondition('New')
    setRoomType('')
    setRoomAmenities([])
    setOtherFeesChoice('None')
    setOtherFeesText('')
    setServiceSlug(SERVICES_LIST[0]?.slug || 'haircuts')
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
    setRoomAmenities(p.variants?.features || [])
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

  // Photo Upload (with automatic iPhone / Canvas compression)
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
        maxWidth: 1280,
        maxHeight: 1280,
        quality: 0.82,
      })

      const supabase = createClient()
      const ext = compressedFile.name.split('.').pop() || 'jpg'
      const path = `${vendor.id}/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 7)}.${ext}`

      const { error: uploadErr } = await supabase.storage
        .from('product-images')
        .upload(path, compressedFile, {
          upsert: false,
          contentType: compressedFile.type,
        })

      if (!uploadErr) {
        const { data: pubData } = supabase.storage
          .from('product-images')
          .getPublicUrl(path)
        if (pubData?.publicUrl) {
          setPhotos((prev) => [...prev, pubData.publicUrl])
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

  // Publish / Save Listing
  const handlePublish = async () => {
    if (!isFormReady || publishing) return
    setPublishing(true)

    try {
      const supabase = createClient()
      const numericPrice = Number(digitsOnly(price))
      const selectedService = SERVICES_LIST.find((s) => s.slug === serviceSlug)
      const resolvedTitle =
        formKind === 'svc'
          ? title.trim() || `${selectedService?.title || 'Service'} by ${vendor.shop_name}`
          : title.trim()

      const existing = editId ? products.find((p) => p.id === editId) : null
      const slug = existing?.slug || slugifyProductTitle(resolvedTitle)
      const listingType: ListingType =
        formKind === 'room' ? 'housing' : formKind === 'svc' ? 'service' : 'product'

      const trimmedLocation = formLocation.trim()
      const resolvedCategoryId =
        categoryId || categories[0]?.id || 'cat-1'

      const variants =
        formKind === 'room'
          ? {
              room_type_label: roomType,
              period: 'session',
              location_label: trimmedLocation,
              utilities: roomAmenities.includes('Water')
                ? 'Water included'
                : 'Not included',
              other_fees:
                otherFeesChoice === 'Yes'
                  ? otherFeesText.trim() || 'Agent fee applies'
                  : 'None',
              features: roomAmenities,
            }
          : formKind === 'svc'
          ? {
              service_slug: serviceSlug,
              features: serviceIncluded
                .split('\n')
                .map((s) => s.trim())
                .filter(Boolean),
            }
          : {}

      const payload = {
        vendor_id: vendor.id,
        category_id: resolvedCategoryId,
        listing_type: listingType,
        campus: formCampus === 'Both' ? 'Okerenkoko' : formCampus,
        title: resolvedTitle,
        slug,
        description:
          formKind === 'svc'
            ? serviceIncluded.trim() || description.trim() || `${selectedService?.title} by ${vendor.shop_name}`
            : description.trim() || resolvedTitle,
        price: numericPrice,
        currency: 'NGN',
        images:
          photos.length > 0
            ? photos
            : ['/products/cadet-uniform-tailoring.jpg'],
        condition: (condition === 'New' ? 'new' : 'good') as ProductCondition,
        stock_status: (existing?.stock_status || 'available') as StockStatus,
        stock_quantity: 1,
        service_turnaround: formKind === 'svc' ? serviceAvail.trim() || null : null,
        service_area: trimmedLocation || null,
        variants,
        tags: [
          formCampus.toLowerCase(),
          ...(formKind === 'svc' ? [serviceSlug] : []),
          ...(formKind === 'room' ? [roomType.toLowerCase()] : []),
        ],
        // Every new or edited listing is reviewed by admin before going live
        status: 'pending_review' as const,
        last_confirmed_at: new Date().toISOString(),
      }

      if (existing) {
        const { data, error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', existing.id)
          .select('*, category:categories(*)')
          .single()

        if (error) {
          toast.error(error.message)
          return
        }

        const updated = (data as Product) || { ...existing, ...payload }
        setProducts((prev) => prev.map((p) => (p.id === existing.id ? updated : p)))
        setWasEdited(true)
        setDoneProduct(updated)
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert(payload)
          .select('*, category:categories(*)')
          .single()

        if (error) {
          toast.error(error.message)
          return
        }

        const created = data as Product
        setProducts((prev) => [created, ...prev])
        setWasEdited(false)
        setDoneProduct(created)
      }

      setScreen('v:done')
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
      const supabase = createClient()
      const nextStock: StockStatus =
        p.stock_status === 'out_of_stock' ? 'available' : 'out_of_stock'
      const { error } = await supabase
        .from('products')
        .update({ stock_status: nextStock })
        .eq('id', p.id)

      if (error) {
        toast.error(error.message)
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
      const supabase = createClient()
      const isCurrentlyPaused = p.status === 'archived'
      const nextStatus = isCurrentlyPaused ? 'pending_review' : 'archived'
      const { error } = await supabase
        .from('products')
        .update({ status: nextStatus })
        .eq('id', p.id)

      if (error) {
        toast.error(error.message)
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
      const supabase = createClient()
      const { error } = await supabase.from('products').delete().eq('id', p.id)
      if (error) {
        toast.error(error.message)
        return
      }
      setProducts((prev) => prev.filter((item) => item.id !== p.id))
      setConfirmDeleteProduct(null)
      setActionProduct(null)
    } finally {
      setBusyAction(false)
    }
  }

  // Category Request Submission
  const handleCategoryRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!catReqName.trim() || submittingCatReq) return
    setSubmittingCatReq(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('category_requests').insert({
        vendor_id: vendor.id,
        vendor_name: vendor.shop_name,
        vendor_whatsapp: vendor.whatsapp_number,
        name: catReqName.trim(),
        description: catReqDesc.trim() || null,
        status: 'pending',
      })
      if (error) {
        toast.error(error.message)
        return
      }
      toast.success('Category request sent to admin for review.')
      setCatReqName('')
      setCatReqDesc('')
      setCatReqOpen(false)
    } finally {
      setSubmittingCatReq(false)
    }
  }

  // Store Settings Field Save
  const openStoreEdit = (
    field: 'name' | 'phone' | 'campus' | 'location' | 'about'
  ) => {
    setEditingStoreField(field)
    if (field === 'name') setDraftStoreValue(vendor.shop_name || '')
    if (field === 'phone') setDraftStoreValue(vendor.whatsapp_number || '')
    if (field === 'campus') setDraftStoreValue(vendor.campus || 'Okerenkoko')
    if (field === 'location') setDraftStoreValue(vendor.location_label || '')
    if (field === 'about') setDraftStoreValue(vendor.description || '')
  }

  const handleSaveStoreField = async () => {
    if (!editingStoreField || savingStoreField) return
    setSavingStoreField(true)
    try {
      const supabase = createClient()
      const updates: Partial<Vendor> = {}

      if (editingStoreField === 'name') {
        if (draftStoreValue.trim().length < 2) {
          toast.error('Please enter a valid shop name.')
          return
        }
        updates.shop_name = draftStoreValue.trim()
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
        updates.description = draftStoreValue.trim()
      }

      const { error } = await supabase
        .from('vendors')
        .update(updates)
        .eq('id', vendor.id)

      if (error) {
        toast.error(error.message)
        return
      }

      setVendor((prev) => ({ ...prev, ...updates }))
      setEditingStoreField(null)
      toast.success('Saved')
      router.refresh()
    } finally {
      setSavingStoreField(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !isImageFile(file)) return
    setUploadingAvatar(true)
    try {
      const { dataUrl } = await compressImageFile(file, {
        maxWidth: 320,
        maxHeight: 320,
        quality: 0.85,
      })
      const supabase = createClient()
      const { error } = await supabase
        .from('vendors')
        .update({ logo_url: dataUrl })
        .eq('id', vendor.id)
      if (!error) {
        setVendor((prev) => ({ ...prev, logo_url: dataUrl }))
        toast.success('Store photo updated')
        router.refresh()
      }
    } catch {
      toast.error('Could not update photo.')
    } finally {
      setUploadingAvatar(false)
      e.target.value = ''
    }
  }

  const activeProducts = products.filter((p) => p.stock_status !== 'out_of_stock')
  const soldProducts = products.filter((p) => p.stock_status === 'out_of_stock')
  const visibleProducts = listingsView === 'active' ? activeProducts : soldProducts

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
      <div className="mx-auto w-full max-w-[480px]">
        {/* ================= SCREEN 1: YOUR LISTINGS (vListings) ================= */}
        {screen === 'v:listings' && (
          <div>
            <h2 className="px-4 pt-5 pb-1 font-[family-name:var(--font-bricolage)] font-semibold text-[26px] tracking-tight">
              Your listings
            </h2>

            {/* Segmented Control (.seg) */}
            <div className="flex gap-1 mx-4 mt-3 p-1 bg-[#E6F2F2] dark:bg-muted rounded-xl">
              <button
                type="button"
                aria-pressed={listingsView === 'active'}
                onClick={() => setListingsView('active')}
                className={cn(
                  'flex-1 h-11 rounded-[9px] text-[15px] font-medium transition-all cursor-pointer',
                  listingsView === 'active'
                    ? 'bg-card text-foreground shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Active {activeProducts.length}
              </button>
              <button
                type="button"
                aria-pressed={listingsView === 'sold'}
                onClick={() => setListingsView('sold')}
                className={cn(
                  'flex-1 h-11 rounded-[9px] text-[15px] font-medium transition-all cursor-pointer',
                  listingsView === 'sold'
                    ? 'bg-card text-foreground shadow-2xs'
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
                  const isPaused = x.status === 'archived'
                  const isPending = x.status === 'pending_review'
                  const isRejected = x.status === 'rejected'

                  const statusLabel = isSold
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
                        <span className="block mt-0.5 text-[13px] text-muted-foreground">
                          {kind === 'svc' ? 'from ' : ''}
                          {formatNaira(x.price)}
                          {kind === 'room' ? ' / session' : ''}
                        </span>
                      </span>

                      <span
                        className={cn(
                          'h-6 px-2.5 rounded-full text-xs font-medium inline-flex items-center shrink-0',
                          isSold
                            ? 'bg-card border border-border text-muted-foreground'
                            : isPaused || isPending
                            ? 'bg-[#FBF1D6] text-[#6B4E0E]'
                            : isRejected
                            ? 'bg-red-500/10 text-red-600'
                            : 'bg-[#E6F2F2] text-[#0A4F4F]'
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
                <b className="block font-[family-name:var(--font-bricolage)] font-semibold text-xl text-foreground">
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
            <h2 className="px-4 pt-5 pb-1 font-[family-name:var(--font-bricolage)] font-semibold text-[26px] tracking-tight">
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
              <b className="font-[family-name:var(--font-bricolage)] font-semibold text-lg">
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
                      return (
                        <button
                          key={s.slug}
                          type="button"
                          aria-pressed={active}
                          onClick={() => setServiceSlug(s.slug)}
                          className={cn(
                            'h-11 px-[18px] rounded-full border text-sm font-medium transition-colors cursor-pointer',
                            active
                              ? 'bg-[#0F6E6E] border-[#0F6E6E] text-white'
                              : 'bg-card border-border text-foreground hover:border-[#0F6E6E]/40'
                          )}
                        >
                          {s.title}
                        </button>
                      )
                    })}
                    <button
                      type="button"
                      onClick={() => setCatReqOpen(true)}
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
                        onClick={() => setCatReqOpen(true)}
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

              {/* Room Type, Amenities & Other Fees */}
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
                    </div>
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
                          placeholder="Agent fee ₦10,000"
                          aria-label="Fee details"
                          className="w-full h-[52px] px-3.5 rounded-xl border border-border bg-card text-base text-foreground placeholder:text-muted-foreground outline-none focus:border-[#0F6E6E]"
                        />
                      </div>
                    )}
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

              {/* Optional Location */}
              <div className="px-4 mt-[22px]">
                <label
                  htmlFor="f-loc"
                  className="block mb-2 text-[15px] font-semibold text-foreground"
                >
                  Location
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
                      : 'Optional pickup spot or hostel block'
                  }
                  className="w-full h-[52px] px-3.5 rounded-xl border border-border bg-card text-base text-foreground placeholder:text-muted-foreground outline-none focus:border-[#0F6E6E]"
                />
                <small className="block mt-1.5 text-[13px] text-muted-foreground">
                  Optional. Shown only if you add one.
                </small>
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
            <div className="fixed bottom-0 inset-x-0 z-30 bg-card border-t border-border">
              <div className="mx-auto w-full max-w-[480px] px-4 py-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] flex items-center gap-4">
                <div className="min-w-0">
                  <small className="block text-xs text-muted-foreground">
                    {missingReason ? 'Still needed' : 'Ready'}
                  </small>
                  <b className="block text-[15px] sm:text-base font-semibold text-foreground truncate">
                    {missingReason || 'Looks good'}
                  </b>
                </div>
                <button
                  type="button"
                  disabled={!isFormReady || publishing}
                  onClick={handlePublish}
                  className={cn(
                    'ml-auto flex-1 max-w-[180px] h-12 rounded-xl font-semibold text-[15px] flex items-center justify-center transition-colors cursor-pointer',
                    isFormReady && !publishing
                      ? 'bg-[#0F6E6E] text-white hover:bg-[#0A4F4F]'
                      : 'bg-[#CBDADA] dark:bg-muted text-[#3E4F4F] dark:text-muted-foreground cursor-default'
                  )}
                >
                  {publishing ? 'Saving...' : editId ? 'Save' : 'Publish'}
                </button>
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
              <h2 className="mt-4 font-[family-name:var(--font-bricolage)] font-semibold text-[26px]">
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
                  <span className="block mt-0.5 text-[13px] text-muted-foreground">
                    {formatNaira(doneProduct.price)} · Pending admin review
                  </span>
                </span>
              </div>
            </div>

            <div className="px-4 mt-5 space-y-3">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Check out my store "${vendor.shop_name}" on Jetty: ${getCanonicalUrl(
                    `/vendors/${vendor.slug || vendor.id}`
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
              <label className="relative w-[72px] h-[72px] mx-auto rounded-full overflow-hidden grid place-items-center text-white font-[family-name:var(--font-bricolage)] font-semibold text-2xl bg-gradient-to-br from-[#17908D] to-[#0A4F4F] cursor-pointer group">
                {vendor.logo_url ? (
                  <img
                    src={vendor.logo_url}
                    alt={vendor.shop_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{getVendorInitials(vendor.shop_name)}</span>
                )}
                <span className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="w-5 h-5 text-white" />
                </span>
                <input
                  type="file"
                  accept="image/*,image/heic,image/heif"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                  className="hidden"
                />
              </label>
              <h2 className="mt-3 font-[family-name:var(--font-bricolage)] font-semibold text-[22px] text-foreground">
                {vendor.shop_name}
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {campusDisplay}
                {vendor.location_label ? ` · ${vendor.location_label}` : ''}
              </p>
            </section>

            {/* Verification Banner (.verif from prototype) */}
            {vendor.verification_status === 'verified' ? (
              <div className="mx-4 mt-5 p-4 rounded-xl bg-[#E6F2F2] dark:bg-[#132A2A] text-foreground">
                <b className="block text-base font-semibold">
                  {vendor.is_featured ? 'Verified & Featured' : 'Verified'}
                </b>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Your shop shows a tick and appears first in Stores and Listings.
                </p>
              </div>
            ) : (
              <div className="mx-4 mt-5 p-4 rounded-xl bg-[#FBF1D6] dark:bg-amber-950/30 text-[#0E1B1B] dark:text-amber-100">
                <b className="block text-base font-semibold">Not verified yet</b>
                <p className="mt-1 text-sm leading-relaxed opacity-90">
                  Your store is live. Verified shops get a tick and appear first at the top of Stores and Listings. Message the Jetty team on WhatsApp to get verified and featured.
                </p>
                <a
                  href={buildJettyTeamWhatsAppUrl(
                    `Hi Jetty Team! I'd like to get my store "${vendor.shop_name}" (${getCanonicalUrl(
                      `/vendors/${vendor.slug || vendor.id}`
                    )}) verified and featured on Jetty.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 h-11 w-full rounded-xl bg-[#0F6E6E] hover:bg-[#0A4F4F] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-[18px] h-[18px]" />
                  Message the Jetty team
                </a>
              </div>
            )}

            {/* Settings Rows (.list > .lrow) */}
            <div className="mt-5 border-t border-border">
              {[
                {
                  key: 'name' as const,
                  label: 'Shop name',
                  val: vendor.shop_name,
                },
                {
                  key: 'phone' as const,
                  label: 'WhatsApp number',
                  val: vendor.whatsapp_number,
                },
                {
                  key: 'campus' as const,
                  label: 'Campus',
                  val: campusDisplay,
                },
                {
                  key: 'location' as const,
                  label: 'Location',
                  val: vendor.location_label ? vendor.location_label : 'Add',
                },
                {
                  key: 'about' as const,
                  label: 'About',
                  val: vendor.description ? 'Added' : 'Add',
                },
              ].map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => openStoreEdit(r.key)}
                  className="flex items-center gap-3 w-full min-h-[56px] px-4 border-b border-border text-[15px] text-left hover:bg-muted/40 transition-colors cursor-pointer"
                >
                  <b className="font-semibold flex-1 text-foreground">{r.label}</b>
                  <span className="text-sm text-muted-foreground truncate max-w-[180px]">
                    {r.val}
                  </span>
                  <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                </button>
              ))}

              <Link
                href={`/vendors/${vendor.slug || vendor.id}`}
                className="flex items-center gap-3 w-full min-h-[56px] px-4 border-b border-border text-[15px] hover:bg-muted/40 transition-colors"
              >
                <b className="font-semibold flex-1 text-foreground">
                  See your store as a buyer
                </b>
                <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
              </Link>
            </div>

            <Link
              href="/"
              className="block mx-auto mt-5 min-h-[44px] px-4 text-sm text-muted-foreground underline text-center leading-[44px]"
            >
              Switch to buying
            </Link>
          </div>
        )}
      </div>

      {/* ================= VENDOR 3-TAB BOTTOM NAV (#vnav from prototype) ================= */}
      {screen !== 'v:form' && (
        <nav
          role="tablist"
          aria-label="Selling"
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] h-[calc(64px+env(safe-area-inset-bottom,0px))] pb-[env(safe-area-inset-bottom,0px)] bg-card/95 backdrop-blur-md border-t border-border grid grid-cols-3 z-30"
        >
          {/* Top Sliding Indicator (.ind) */}
          <span
            className="absolute -top-[1px] left-0 w-1/3 h-[3px] pointer-events-none transition-transform duration-300"
            style={{
              transform: `translateX(${
                activeNavTab === 'v:listings'
                  ? '0%'
                  : activeNavTab === 'v:new'
                  ? '100%'
                  : '200%'
              })`,
            }}
          >
            <i className="block w-7 h-[3px] rounded-full bg-[#0F6E6E] mx-auto" />
          </span>

          <button
            type="button"
            role="tab"
            aria-selected={activeNavTab === 'v:listings'}
            onClick={() => setScreen('v:listings')}
            className={cn(
              'flex flex-col items-center justify-center gap-1 text-xs font-medium cursor-pointer',
              activeNavTab === 'v:listings'
                ? 'text-[#0F6E6E] dark:text-[#22D3EE] font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <List className="w-[22px] h-[22px]" />
            <span>Listings</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeNavTab === 'v:new'}
            onClick={() => setScreen('v:new')}
            className={cn(
              'flex flex-col items-center justify-center gap-1 text-xs font-medium cursor-pointer',
              activeNavTab === 'v:new'
                ? 'text-[#0F6E6E] dark:text-[#22D3EE] font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Plus className="w-[22px] h-[22px]" />
            <span>Add</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeNavTab === 'v:store'}
            onClick={() => setScreen('v:store')}
            className={cn(
              'flex flex-col items-center justify-center gap-1 text-xs font-medium cursor-pointer',
              activeNavTab === 'v:store'
                ? 'text-[#0F6E6E] dark:text-[#22D3EE] font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Store className="w-[22px] h-[22px]" />
            <span>Store</span>
          </button>
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
            <h3 className="font-[family-name:var(--font-bricolage)] font-semibold text-[21px] mb-2 truncate">
              {actionProduct.title}
            </h3>

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
            <h3 className="font-[family-name:var(--font-bricolage)] font-semibold text-[21px] mb-2">
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

      {/* ================= REQUEST CATEGORY SHEET ================= */}
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
            <h3 className="font-[family-name:var(--font-bricolage)] font-semibold text-[21px]">
              Request a category
            </h3>
            <p className="text-sm text-muted-foreground -mt-2">
              Suggest a category for admin to approve and add to Jetty.
            </p>
            <div>
              <label className="block mb-1.5 text-sm font-semibold">
                Category name
              </label>
              <input
                type="text"
                required
                maxLength={48}
                value={catReqName}
                onChange={(e) => setCatReqName(e.target.value)}
                placeholder="e.g. Lab Coats & Medical Kits"
                className="w-full h-12 px-3.5 rounded-xl border border-border bg-background text-base outline-none focus:border-[#0F6E6E]"
              />
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-semibold">
                What items belong here? (optional)
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
            <h3 className="font-[family-name:var(--font-bricolage)] font-semibold text-[21px]">
              {editingStoreField === 'name'
                ? 'Shop name'
                : editingStoreField === 'phone'
                ? 'WhatsApp number'
                : editingStoreField === 'campus'
                ? 'Where do you sell?'
                : editingStoreField === 'location'
                ? 'Location (optional)'
                : 'About your shop'}
            </h3>

            {editingStoreField === 'campus' ? (
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
            ) : editingStoreField === 'about' ? (
              <textarea
                rows={3}
                value={draftStoreValue}
                onChange={(e) => setDraftStoreValue(e.target.value)}
                placeholder="What do you sell or offer?"
                className="w-full min-h-[96px] p-3.5 rounded-xl border border-border bg-background text-base outline-none focus:border-[#0F6E6E]"
              />
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
                disabled={savingStoreField}
                onClick={handleSaveStoreField}
                className="flex-1 h-12 rounded-xl bg-[#0F6E6E] text-white font-semibold text-[15px] disabled:opacity-50 cursor-pointer"
              >
                {savingStoreField ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
