// Seed boats for the marketplace.
// Coordinates clustered around Hulhumalé Phase 2 port (~4.2105°N, 73.5408°E).

export type BoatStatus = 'available' | 'booked' | 'offline';

export interface Boat {
  id: string;
  name: string;
  operator: string;
  capacity: number;
  pricePerDayUsd: number;
  durationHours: number;
  description: string;
  image: string;
  rating: number;
  reviewCount: number;
  amenities: string[];
  lng: number;
  lat: number;
  status: BoatStatus;
  availableFrom: string;
}

export const PORT_CENTER: [number, number] = [73.5408, 4.2105];

export const BOATS: Boat[] = [
  {
    id: 'dhoni-rasveli',
    name: 'Rasveli',
    operator: 'Capt. Ibrahim',
    capacity: 8,
    pricePerDayUsd: 320,
    durationHours: 6,
    description:
      'Traditional Maldivian dhoni — perfect for sandbank picnics, snorkeling reefs, and dolphin spotting. Returns from night fishing at ~4am, ready for day trips from 9am.',
    image: '/img/imagesmaldivesa/boat.png',
    rating: 4.8,
    reviewCount: 42,
    amenities: ['Snorkel gear', 'Sun shade', 'Cooler', 'Toilet'],
    lng: PORT_CENTER[0] + 0.0008,
    lat: PORT_CENTER[1] + 0.0006,
    status: 'available',
    availableFrom: '09:00',
  },
  {
    id: 'dhoni-blue-pearl',
    name: 'Blue Pearl',
    operator: 'Capt. Ahmed',
    capacity: 10,
    pricePerDayUsd: 380,
    durationHours: 7,
    description:
      'Larger dhoni with shaded deck and sound system. Great for groups heading to Maafushi or sandbank trips.',
    image: '/img/imagesmaldivesa/boat2.png',
    rating: 4.9,
    reviewCount: 67,
    amenities: ['Snorkel gear', 'Sound system', 'Shaded deck', 'Cooler', 'Toilet'],
    lng: PORT_CENTER[0] - 0.0010,
    lat: PORT_CENTER[1] + 0.0004,
    status: 'available',
    availableFrom: '08:30',
  },
  {
    id: 'speed-fareed',
    name: 'Fareed Express',
    operator: 'Capt. Hassan',
    capacity: 12,
    pricePerDayUsd: 520,
    durationHours: 6,
    description:
      'Speedboat — fast transfers to outer atolls, manta points and surf breaks. Twin 200hp engines.',
    image: '/img/imagesmaldivesa/boat3.png',
    rating: 4.7,
    reviewCount: 31,
    amenities: ['Bimini top', 'Snorkel gear', 'Cooler', 'GPS', 'Life jackets'],
    lng: PORT_CENTER[0] + 0.0014,
    lat: PORT_CENTER[1] - 0.0005,
    status: 'available',
    availableFrom: '08:00',
  },
  {
    id: 'dhoni-faiymini',
    name: 'Faiymini',
    operator: 'Capt. Mohamed',
    capacity: 6,
    pricePerDayUsd: 260,
    durationHours: 5,
    description:
      'Small family dhoni — quiet, intimate trips. Ideal for couples or families wanting a private experience.',
    image: '/img/imagesmaldivesa/boat.png',
    rating: 4.9,
    reviewCount: 18,
    amenities: ['Snorkel gear', 'Cooler', 'Sun shade'],
    lng: PORT_CENTER[0] - 0.0006,
    lat: PORT_CENTER[1] - 0.0008,
    status: 'booked',
    availableFrom: '09:30',
  },
  {
    id: 'dhoni-kaani',
    name: 'Kaani',
    operator: 'Capt. Yoosuf',
    capacity: 14,
    pricePerDayUsd: 450,
    durationHours: 8,
    description:
      'Spacious dhoni for full-day excursions. Sundeck, large cooler, and BBQ grill on board for sandbank lunches.',
    image: '/img/imagesmaldivesa/boat2.png',
    rating: 4.8,
    reviewCount: 54,
    amenities: ['BBQ grill', 'Sundeck', 'Snorkel gear', 'Cooler', 'Toilet', 'Sound system'],
    lng: PORT_CENTER[0] + 0.0004,
    lat: PORT_CENTER[1] + 0.0012,
    status: 'available',
    availableFrom: '08:00',
  },
  {
    id: 'speed-thundi',
    name: 'Thundi',
    operator: 'Capt. Shameen',
    capacity: 10,
    pricePerDayUsd: 480,
    durationHours: 6,
    description:
      'Quick speedboat for resort transfers and snorkel-trip combos. Reaches Maafushi in 25 minutes.',
    image: '/img/imagesmaldivesa/boat3.png',
    rating: 4.6,
    reviewCount: 22,
    amenities: ['Bimini top', 'Snorkel gear', 'Cooler', 'GPS'],
    lng: PORT_CENTER[0] - 0.0014,
    lat: PORT_CENTER[1] + 0.0010,
    status: 'available',
    availableFrom: '08:30',
  },
];

export function getBoatById(id: string): Boat | undefined {
  return BOATS.find((b) => b.id === id);
}
