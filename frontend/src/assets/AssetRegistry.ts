/**
 * AssetRegistry — verified nested paths under /public/assets/
 * Built from docs/merge/ASSET_INVENTORY.md (Phase 2). Do NOT use flat friend paths.
 */

export type AssetCategory =
  | 'residential_low'
  | 'residential_mid'
  | 'residential_high'
  | 'commercial'
  | 'office'
  | 'office_high'
  | 'industrial'
  | 'warehouse'
  | 'hospital'
  | 'school'
  | 'police'
  | 'fire'
  | 'landmark'
  | 'construction'
  | 'car'
  | 'bus'
  | 'truck'
  | 'police_car'
  | 'firetruck'
  | 'ambulance'
  | 'metro'
  | 'train'
  | 'tree'
  | 'street';

export interface AssetEntry {
  id: string;
  category: AssetCategory;
  /** URL path from site root, e.g. /assets/buildings/residential/house_01.glb */
  path: string;
  /** Relative path under public/assets/ (for disk verification) */
  relativePath: string;
  label: string;
  scale?: [number, number, number];
}

const A = (
  id: string,
  category: AssetCategory,
  relativePath: string,
  label: string,
  scale?: [number, number, number]
): AssetEntry => ({
  id,
  category,
  relativePath,
  path: `/assets/${relativePath}`,
  label,
  scale,
});

/** Every entry must resolve to a real file under frontend/public/assets/ */
export const ASSET_REGISTRY: AssetEntry[] = [
  // Buildings
  A('res.house_01', 'residential_low', 'buildings/residential/house_01.glb', 'Suburban House A'),
  A('res.house_02', 'residential_low', 'buildings/residential/house_02.glb', 'Suburban House B'),
  A('res.apt_mid', 'residential_mid', 'buildings/residential/apartment_mid_01.glb', 'Mid-Rise Apartment'),
  A('res.apt_tower', 'residential_high', 'buildings/residential/apartment_tower_01.glb', 'Residential Tower'),
  A('com.store', 'commercial', 'buildings/commercial/store_01.glb', 'Store'),
  A('off.mid', 'office', 'buildings/office/office_mid_01.glb', 'Office Mid'),
  A('off.tower', 'office_high', 'buildings/office/office_tower_01.glb', 'Office Tower'),
  A('ind.factory', 'industrial', 'buildings/industrial/factory_01.glb', 'Factory'),
  A('ind.warehouse', 'warehouse', 'buildings/industrial/warehouse_01.glb', 'Warehouse'),
  A('edu.school', 'school', 'buildings/education/school_01.glb', 'School'),
  A('health.hospital', 'hospital', 'buildings/healthcare/hospital_01.glb', 'Hospital'),
  A('civic.police', 'police', 'buildings/civic/police_01.glb', 'Police'),
  A('civic.fire', 'fire', 'buildings/civic/fire_station_01.glb', 'Fire Station'),
  A('special.tower', 'landmark', 'buildings/special/central_tower.glb', 'Central Tower'),
  A('special.site', 'construction', 'buildings/special/construction_site.glb', 'Construction'),

  // Environment
  A('env.bush', 'tree', 'environment/bushes/bush_01.glb', 'Bush'),
  A('env.fountain', 'street', 'environment/props/park_fountain.glb', 'Fountain'),
  A('env.rocks', 'street', 'environment/rocks/rock_cluster.glb', 'Rocks'),
  A('env.tree_birch', 'tree', 'environment/trees/tree_birch.glb', 'Birch'),
  A('env.tree_oak', 'tree', 'environment/trees/tree_oak.glb', 'Oak'),
  A('env.tree_pine', 'tree', 'environment/trees/tree_pine.glb', 'Pine'),

  // Street
  A('street.hydrant', 'street', 'street/barriers/fire_hydrant.glb', 'Hydrant'),
  A('street.barrier', 'street', 'street/barriers/jersey_barrier.glb', 'Barrier'),
  A('street.bench', 'street', 'street/benches/park_bench.glb', 'Bench'),
  A('street.light', 'street', 'street/lights/streetlight.glb', 'Streetlight'),
  A('street.stop', 'street', 'street/signs/stop_sign.glb', 'Stop Sign'),
  A('street.signal', 'street', 'street/traffic_lights/traffic_light.glb', 'Traffic Light'),

  // Vehicles
  A('veh.ambulance', 'ambulance', 'vehicles/ambulance/ambulance.glb', 'Ambulance'),
  A('veh.bus', 'bus', 'vehicles/buses/city_bus.glb', 'City Bus'),
  A('veh.sedan_blue', 'car', 'vehicles/cars/sedan_blue.glb', 'Sedan Blue'),
  A('veh.sedan_red', 'car', 'vehicles/cars/sedan_red.glb', 'Sedan Red'),
  A('veh.suv', 'car', 'vehicles/cars/suv_01.glb', 'SUV'),
  A('veh.taxi', 'car', 'vehicles/cars/taxi_01.glb', 'Taxi'),
  A('veh.van', 'car', 'vehicles/cars/van_01.glb', 'Van'),
  A('veh.fire', 'firetruck', 'vehicles/fire/fire_truck.glb', 'Fire Truck'),
  A('veh.police', 'police_car', 'vehicles/police/police_car.glb', 'Police Car'),
  A('veh.delivery', 'truck', 'vehicles/trucks/delivery_truck.glb', 'Delivery Truck'),
  A('veh.heavy', 'truck', 'vehicles/trucks/heavy_truck.glb', 'Heavy Truck'),

  // Transit
  A('metro.station', 'metro', 'metro/stations/metro_station_elevated.glb', 'Metro Station'),
  A('metro.car', 'metro', 'metro/trains/metro_train_car.glb', 'Metro Car'),
  A('rail.loco', 'train', 'railway/trains/railway_locomotive.glb', 'Locomotive'),
  A('rail.car', 'train', 'railway/trains/railway_passenger_car.glb', 'Passenger Car'),
];

const BY_ID = new Map(ASSET_REGISTRY.map((e) => [e.id, e]));
const BY_CATEGORY = new Map<AssetCategory, AssetEntry[]>();
for (const e of ASSET_REGISTRY) {
  const list = BY_CATEGORY.get(e.category) || [];
  list.push(e);
  BY_CATEGORY.set(e.category, list);
}

/** Core set preloaded in City Twin sandbox / first paint */
export const CORE_PRELOAD_IDS = [
  'res.house_01',
  'off.mid',
  'com.store',
  'ind.factory',
  'health.hospital',
  'edu.school',
  'civic.police',
  'veh.sedan_blue',
  'veh.bus',
  'env.tree_oak',
] as const;

export function getAssetById(id: string): AssetEntry | undefined {
  return BY_ID.get(id);
}

export function getAssetsByCategory(category: AssetCategory): AssetEntry[] {
  return BY_CATEGORY.get(category) || [];
}

export function getAssetForCategory(category: AssetCategory, seed = 0): AssetEntry | null {
  const matches = getAssetsByCategory(category);
  if (!matches.length) return null;
  const idx = Math.abs(seed) % matches.length;
  return matches[idx];
}

/** Map your scene facility.type → asset category */
export function facilityTypeToCategory(type: string): AssetCategory {
  switch ((type || '').toLowerCase()) {
    case 'home':
      return 'residential_low';
    case 'office':
      return 'office';
    case 'factory':
      return 'industrial';
    case 'warehouse':
      return 'warehouse';
    case 'school':
      return 'school';
    case 'hospital':
      return 'hospital';
    case 'police':
      return 'police';
    case 'fire':
    case 'fire_station':
      return 'fire';
    case 'shop':
    case 'store':
    case 'retail':
      return 'commercial';
    case 'park':
      return 'tree';
    default:
      return 'commercial';
  }
}

export function assetForFacilityType(type: string, seed = 0): AssetEntry | null {
  return getAssetForCategory(facilityTypeToCategory(type), seed);
}

export function getAllAssetPaths(): string[] {
  return ASSET_REGISTRY.map((e) => e.path);
}

export function getAllRelativePaths(): string[] {
  return ASSET_REGISTRY.map((e) => e.relativePath);
}

export function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}
