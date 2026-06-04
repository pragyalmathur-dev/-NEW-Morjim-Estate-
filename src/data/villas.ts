export interface VillaDetails {
  id: string;
  config: string;
  area: string;
  status: 'Available' | 'Sold' | 'Reserved';
  highlight: string;
  price: string;
}

export const ESTATE_1_VILLAS: Record<string, VillaDetails> = {
  '1': { id: '1', config: '4 BHK', area: '4,850 sq.ft.', status: 'Available', highlight: 'Private Lap Pool & Sky Lounge', price: '₹ 8.5 Cr*' },
  '2': { id: '2', config: '5 BHK', area: '6,200 sq.ft.', status: 'Sold', highlight: 'Double-Height Living & Forest Facing', price: '₹ 11.2 Cr*' },
  '3': { id: '3', config: '4 BHK', area: '4,500 sq.ft.', status: 'Available', highlight: 'Zen courtyard & Sunset deck', price: '₹ 8.1 Cr*' },
  '4': { id: '4', config: '4 BHK', area: '4,650 sq.ft.', status: 'Reserved', highlight: 'Corner plot with wrap-around lawn', price: '₹ 8.4 Cr*' },
  '5': { id: '5', config: '5 BHK', area: '6,500 sq.ft.', status: 'Available', highlight: 'Private jacuzzi & cascading pools', price: '₹ 11.8 Cr*' },
  '6': { id: '6', config: '4 BHK', area: '4,800 sq.ft.', status: 'Sold', highlight: 'Panoramic woodland canopy views', price: '₹ 8.6 Cr*' },
  '7': { id: '7', config: '4 BHK', area: '4,600 sq.ft.', status: 'Available', highlight: 'Open pavilions & natural spring views', price: '₹ 8.2 Cr*' },
  '8': { id: '8', config: '5 BHK', area: '6,800 sq.ft.', status: 'Available', highlight: 'Grand presidential suite & private lift', price: '₹ 12.4 Cr*' },
  '9': { id: '9', config: '4 BHK', area: '4,750 sq.ft.', status: 'Sold', highlight: 'Staved wood pergolas & organic garden', price: '₹ 8.5 Cr*' },
  '10': { id: '10', config: '4 BHK', area: '4,700 sq.ft.', status: 'Reserved', highlight: 'Meditation gazebo & outdoor deck', price: '₹ 8.3 Cr*' },
  '11': { id: '11', config: '5 BHK', area: '6,100 sq.ft.', status: 'Available', highlight: 'Double master suites & private spa room', price: '₹ 10.9 Cr*' },
  '12': { id: '12', config: '4 BHK', area: '4,550 sq.ft.', status: 'Sold', highlight: 'Verdant boundary wall with creepers', price: '₹ 8.0 Cr*' },
  '14': { id: '14', config: '4 BHK', area: '4,900 sq.ft.', status: 'Available', highlight: 'Close proximity to the estate cafe', price: '₹ 8.7 Cr*' },
  '15': { id: '15', config: '5 BHK', area: '6,350 sq.ft.', status: 'Available', highlight: 'Sky roof bathroom with absolute privacy', price: '₹ 11.5 Cr*' },
};

export const ESTATE_2_VILLAS: Record<string, VillaDetails> = {
  'A': { id: 'A', config: '5 BHK', area: '5,800 sq.ft.', status: 'Available', highlight: 'Private Forest Deck & Lagoon Pool', price: '₹ 10.5 Cr*' },
  'B': { id: 'B', config: '5 BHK', area: '5,950 sq.ft.', status: 'Reserved', highlight: 'Panoramic views of the Chapora riverway', price: '₹ 10.9 Cr*' },
  'C': { id: 'C', config: '5 BHK', area: '6,200 sq.ft.', status: 'Sold', highlight: 'Massive triple-aspect balconies', price: '₹ 11.4 Cr*' },
  'D': { id: 'D', config: '5 BHK', area: '5,600 sq.ft.', status: 'Available', highlight: 'Lush tropical entry walkthrough path', price: '₹ 9.9 Cr*' },
  'E': { id: 'E', config: '5 BHK', area: '6,150 sq.ft.', status: 'Sold', highlight: 'Natural spring proximity & serene gazebo', price: '₹ 11.1 Cr*' },
  'F&G': { id: 'F&G', config: '5 BHK', area: '6,400 sq.ft.', status: 'Available', highlight: 'Grand ceiling-to-floor glass walls & private sanctuary', price: '₹ 13.2 Cr*' },
  'H': { id: 'H', config: '5 BHK', area: '5,750 sq.ft.', status: 'Sold', highlight: 'Elevated sky deck with absolute canopy views', price: '₹ 10.4 Cr*' },
  'J': { id: 'J', config: '5 BHK', area: '6,000 sq.ft.', status: 'Available', highlight: 'Cascading natural water features', price: '₹ 10.8 Cr*' },
  'K': { id: 'K', config: '5 BHK', area: '5,900 sq.ft.', status: 'Reserved', highlight: 'Exclusive forest pathway access', price: '₹ 10.6 Cr*' },
  'L': { id: 'L', config: '5 BHK', area: '6,800 sq.ft.', status: 'Available', highlight: 'Ultimate secluded corner sanctuary', price: '₹ 12.8 Cr*' },
};
