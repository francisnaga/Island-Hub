export interface LodgeListing {
  id: string
  title: string
  room_type: 'self_contain' | 'single_room' | 'bedspace'
  room_type_label: string
  campus: 'Okerenkoko' | 'Kurutie' | 'Both'
  price: number
  period: string
  location_label: string
  distance_hint: string
  image: string
  features: string[]
  whatsapp_number: string
  contact_name: string
  is_verified: boolean
  bedspaces?: string
  rent_covers?: string
  utilities?: string
  other_fees?: string
  posted_time?: string
  description?: string
  agent_listings_count?: number
}

export const LODGE_LISTINGS: LodgeListing[] = [
  {
    id: 'lodge-1',
    title: 'Self-contain, 5 min walk from the gate',
    room_type: 'self_contain',
    room_type_label: 'Self-contain',
    campus: 'Kurutie',
    price: 180000,
    period: 'session',
    location_label: 'Near the main gate',
    distance_hint: '5 min to gate',
    image: '/products/lodge-self-contain-okerenkoko.jpg',
    features: ['Water', 'Power backup', 'Fenced compound', 'Tiled floor'],
    whatsapp_number: '2349130436032',
    contact_name: 'Campus Lodges Agent',
    is_verified: true,
    bedspaces: '1 to 2',
    rent_covers: 'One session',
    utilities: 'Water included',
    other_fees: 'Agent fee applies',
    posted_time: '1 day ago',
    description:
      'Clean self-contain with its own bathroom and kitchenette. Quiet street, close to lecture halls.',
    agent_listings_count: 3,
  },
  {
    id: 'lodge-2',
    title: 'Shared room, 2 per room, water included',
    room_type: 'single_room',
    room_type_label: 'Shared room',
    campus: 'Okerenkoko',
    price: 120000,
    period: 'session',
    location_label: 'Hostel junction, Okerenkoko',
    distance_hint: '3 mins to permanent site',
    image: '/products/lodge-single-room-kurutie.jpg',
    features: ['Water', 'Tiled floor', 'Fenced compound', 'Borehole water'],
    whatsapp_number: '2349130436032',
    contact_name: 'Campus Lodges Agent',
    is_verified: true,
    bedspaces: '2 per room',
    rent_covers: 'One session',
    utilities: 'Water included',
    other_fees: 'None',
    posted_time: '2 days ago',
    description:
      'Neat student accommodation near permanent site gate. Well-ventilated shared room with clean facilities.',
    agent_listings_count: 3,
  },
  {
    id: 'lodge-3',
    title: 'Private room with ensuite',
    room_type: 'self_contain',
    room_type_label: 'Private room',
    campus: 'Okerenkoko',
    price: 240000,
    period: 'session',
    location_label: 'Main Academy road, Okerenkoko',
    distance_hint: '7 mins to jetty',
    image: '/products/lodge-shared-room-okerenkoko.jpg',
    features: ['Ensuite bathroom', 'Running water', 'Prepaid meter', 'Security gate'],
    whatsapp_number: '2349130436032',
    contact_name: 'Campus Lodges Agent',
    is_verified: true,
    bedspaces: '1',
    rent_covers: 'One session',
    utilities: 'Prepaid meter',
    other_fees: 'None',
    posted_time: '3 days ago',
    description:
      'Spacious private self-contain ensuite room in a secure, quiet compound suitable for serious cadet studies.',
    agent_listings_count: 3,
  },
]
