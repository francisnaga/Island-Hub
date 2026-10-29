export interface LodgeListing {
  id: string
  title: string
  room_type: 'self_contain' | 'single_room' | 'bedspace'
  room_type_label: string
  campus: 'Okerenkoko' | 'Kurutie'
  price: number
  period: string
  location_label: string
  distance_hint: string
  image: string
  features: string[]
  whatsapp_number: string
  contact_name: string
  is_verified: boolean
}

export const LODGE_LISTINGS: LodgeListing[] = [
  {
    id: 'lodge-1',
    title: 'Modern Tiled Self-Contain with Private Bath',
    room_type: 'self_contain',
    room_type_label: 'Self-Contain',
    campus: 'Okerenkoko',
    price: 85000,
    period: 'per session',
    location_label: 'Near Permanent Site Gate, Okerenkoko',
    distance_hint: '5 mins walk to lecture halls',
    image: '/products/lodge-self-contain-okerenkoko.jpg',
    features: ['Private Bathroom', 'Tiled Floor', 'Running Water', 'Prepaid Meter'],
    whatsapp_number: '2349130436032',
    contact_name: 'Elder Tari (Lodge Caretaker)',
    is_verified: true,
  },
  {
    id: 'lodge-2',
    title: 'Spacious Single Room in Quiet Student Compound',
    room_type: 'single_room',
    room_type_label: 'Single Room',
    campus: 'Kurutie',
    price: 45000,
    period: 'per session',
    location_label: 'Kurutie Take-off Campus Junction',
    distance_hint: '3 mins walk to campus gate',
    image: '/products/lodge-single-room-kurutie.jpg',
    features: ['Well Ventilated', 'Shared Bath (Clean)', 'Fenced & Gated', 'Borehole Water'],
    whatsapp_number: '2349130436032',
    contact_name: 'Kurutie Campus Accommodations',
    is_verified: true,
  },
  {
    id: 'lodge-3',
    title: '2-Student Shared Bedspace with Storage Lockers',
    room_type: 'bedspace',
    room_type_label: 'Shared Bedspace',
    campus: 'Okerenkoko',
    price: 25000,
    period: 'per student / session',
    location_label: 'Behind NMU Maritime Academy Quarters',
    distance_hint: '7 mins walk to jetty & classrooms',
    image: '/products/lodge-shared-room-okerenkoko.jpg',
    features: ['Mattress Included', 'Bedside Locker', 'Security Light', 'Budget Friendly'],
    whatsapp_number: '2349130436032',
    contact_name: 'Senior Cadet Preye',
    is_verified: true,
  },
]
