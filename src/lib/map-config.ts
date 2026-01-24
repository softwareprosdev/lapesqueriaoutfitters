// Map configuration for Conservation Donation Map

export interface ConservationPartner {
  id: string;
  name: string;
  description: string;
  focus: string[];
  icon: string;
  coordinates: { lat: number; lng: number };
  website?: string;
  donatedAmount: number;
  projectsSupported: number;
}

export interface ConservationRegion {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number };
  description: string;
  totalDonated: number;
  color: string;
  radius: number;
}

// Map center - focused on South Texas Gulf Coast
export const MAP_CENTER: [number, number] = [26.15, -97.40];
export const MAP_ZOOM = 9;

// Conservation regions
export const CONSERVATION_REGIONS: ConservationRegion[] = [
  {
    id: 'spi',
    name: 'South Padre Island',
    coordinates: { lat: 26.1118, lng: -97.1681 },
    description: 'Sea turtle nesting beaches and coral reef ecosystems. Home to the Sea Turtle Inc rescue center.',
    totalDonated: 2847,
    color: '#0d9488', // teal-600
    radius: 8000,
  },
  {
    id: 'rgv',
    name: 'Rio Grande Valley',
    coordinates: { lat: 26.2034, lng: -98.2300 },
    description: 'Laguna Madre wetlands and migratory bird corridors. Critical habitat for dolphins and manatees.',
    totalDonated: 1523,
    color: '#0891b2', // cyan-600
    radius: 12000,
  },
  {
    id: 'port-isabel',
    name: 'Port Isabel',
    coordinates: { lat: 26.0728, lng: -97.2086 },
    description: 'Historic fishing port with active dolphin watching and marine research programs.',
    totalDonated: 956,
    color: '#0284c7', // sky-600
    radius: 6000,
  },
  {
    id: 'laguna-madre',
    name: 'Laguna Madre Bay',
    coordinates: { lat: 26.2500, lng: -97.3800 },
    description: 'One of the most hypersaline lagoons in the world. Critical habitat for redfish, sea trout, and migratory waterfowl.',
    totalDonated: 1234,
    color: '#059669', // emerald-600
    radius: 15000,
  },
];

// Conservation partners with locations
export const CONSERVATION_PARTNERS: ConservationPartner[] = [
  {
    id: 'sea-turtle-inc',
    name: 'Sea Turtle Inc',
    description: 'Rescue and rehabilitation center for injured sea turtles. Also conducts public education programs.',
    focus: ['Leatherback', "Kemp's Ridley", 'Green Sea Turtles'],
    icon: '🐢',
    coordinates: { lat: 26.0742, lng: -97.1642 },
    website: 'https://seaturtleinc.org',
    donatedAmount: 1847,
    projectsSupported: 3,
  },
  {
    id: 'gulf-marine-research',
    name: 'Gulf Marine Mammal Research',
    description: 'Research programs focused on dolphins, whales, and other marine mammals in the Gulf of Mexico.',
    focus: ['Dolphin Protection', 'Whale Conservation'],
    icon: '🐬',
    coordinates: { lat: 26.1395, lng: -97.1731 },
    donatedAmount: 1200,
    projectsSupported: 2,
  },
  {
    id: 'shark-conservation',
    name: 'Texas Shark Conservation',
    description: 'Researching shark populations and promoting sustainable fishing practices.',
    focus: ['Shark Research', 'Sustainable Fishing'],
    icon: '🦈',
    coordinates: { lat: 26.0650, lng: -97.1850 },
    donatedAmount: 856,
    projectsSupported: 2,
  },
  {
    id: 'laguna-wildlife',
    name: 'Laguna Madre Wildlife Trust',
    description: 'Protecting the unique ecosystem of Laguna Madre and its diverse wildlife.',
    focus: ['Wetland Conservation', 'Bird Migration'],
    icon: '🦅',
    coordinates: { lat: 26.2200, lng: -97.4000 },
    donatedAmount: 657,
    projectsSupported: 1,
  },
];

// Donation statistics
export const DONATION_STATS = {
  totalDonated: 6560,
  projectsSupported: 8,
  speciesProtected: 15,
  acresProtected: 2500,
  volunteersSupported: 45,
};

// Map tile providers
export const MAP_TILES = {
  default: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, DigitalGlobe, GeoEye, Earthstar Geographics',
  },
};
