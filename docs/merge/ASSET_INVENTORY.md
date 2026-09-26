# Asset inventory — Friend GLB pack → Target registry

> **Phase 0 deliverable + Phase 2 executed.** Source was partner `frontend/public/assets/` (tree since **removed** — see `ARCHIVE_FRIEND.md`). Product copies live under root `frontend/public/assets/`.
> **Target:** `frontend/public/assets/` (root app)  
> **Status:** **Copied** — 42 GLBs + `manifest.json`. Registry: `frontend/src/assets/AssetRegistry.ts`. Verify: `npm run verify:assets`.

## Product mapping (facility type → preferred GLB)

| Scene `facility.type` (yours) | Registry key | Correct on-disk path (friend) | Friend AssetRegistry (BROKEN — do not copy) |
|---|---|---|---|
| `home` | `res.house_01` | `buildings/residential/house_01.glb` | `/assets/buildings/house_01.glb` ❌ |
| `home` (alt) | `res.house_02` | `buildings/residential/house_02.glb` | `/assets/buildings/house_02.glb` ❌ |
| `home` (mid) | `res.apt_mid` | `buildings/residential/apartment_mid_01.glb` | `/assets/buildings/apartment_01.glb` ❌ |
| `home` (high) | `res.apt_tower` | `buildings/residential/apartment_tower_01.glb` | (missing) |
| `office` | `off.mid` | `buildings/office/office_mid_01.glb` | `/assets/buildings/office_01.glb` ❌ |
| `office` (tower) | `off.tower` | `buildings/office/office_tower_01.glb` | `/assets/buildings/skyscraper_01.glb` ❌ |
| `factory` | `ind.factory` | `buildings/industrial/factory_01.glb` | `/assets/buildings/industrial_01.glb` ❌ |
| `warehouse` | `ind.warehouse` | `buildings/industrial/warehouse_01.glb` | (missing) |
| `school` | `edu.school` | `buildings/education/school_01.glb` | `/assets/buildings/school.glb` ❌ |
| `hospital` | `health.hospital` | `buildings/healthcare/hospital_01.glb` | `/assets/buildings/hospital.glb` ❌ |
| `police` | `civic.police` | `buildings/civic/police_01.glb` | `/assets/buildings/police.glb` ❌ |
| `fire` | `civic.fire` | `buildings/civic/fire_station_01.glb` | `/assets/buildings/firestation.glb` ❌ |
| `shop` / retail | `com.store` | `buildings/commercial/store_01.glb` | `/assets/buildings/commercial_01.glb` ❌ |
| landmark | `special.tower` | `buildings/special/central_tower.glb` | (missing) |
| construction | `special.site` | `buildings/special/construction_site.glb` | (missing) |

## Full on-disk inventory (42 GLBs)

### Buildings (15)

| Relative path | Suggested registry id |
|---|---|
| `buildings/civic/fire_station_01.glb` | `civic.fire` |
| `buildings/civic/police_01.glb` | `civic.police` |
| `buildings/commercial/store_01.glb` | `com.store` |
| `buildings/education/school_01.glb` | `edu.school` |
| `buildings/healthcare/hospital_01.glb` | `health.hospital` |
| `buildings/industrial/factory_01.glb` | `ind.factory` |
| `buildings/industrial/warehouse_01.glb` | `ind.warehouse` |
| `buildings/office/office_mid_01.glb` | `off.mid` |
| `buildings/office/office_tower_01.glb` | `off.tower` |
| `buildings/residential/apartment_mid_01.glb` | `res.apt_mid` |
| `buildings/residential/apartment_tower_01.glb` | `res.apt_tower` |
| `buildings/residential/house_01.glb` | `res.house_01` |
| `buildings/residential/house_02.glb` | `res.house_02` |
| `buildings/special/central_tower.glb` | `special.tower` |
| `buildings/special/construction_site.glb` | `special.site` |

### Environment (6)

| Relative path | Suggested registry id |
|---|---|
| `environment/bushes/bush_01.glb` | `env.bush` |
| `environment/props/park_fountain.glb` | `env.fountain` |
| `environment/rocks/rock_cluster.glb` | `env.rocks` |
| `environment/trees/tree_birch.glb` | `env.tree_birch` |
| `environment/trees/tree_oak.glb` | `env.tree_oak` |
| `environment/trees/tree_pine.glb` | `env.tree_pine` |

### Street (6)

| Relative path | Suggested registry id |
|---|---|
| `street/barriers/fire_hydrant.glb` | `street.hydrant` |
| `street/barriers/jersey_barrier.glb` | `street.barrier` |
| `street/benches/park_bench.glb` | `street.bench` |
| `street/lights/streetlight.glb` | `street.light` |
| `street/signs/stop_sign.glb` | `street.stop` |
| `street/traffic_lights/traffic_light.glb` | `street.signal` |

### Vehicles (11)

| Relative path | Suggested registry id |
|---|---|
| `vehicles/ambulance/ambulance.glb` | `veh.ambulance` |
| `vehicles/buses/city_bus.glb` | `veh.bus` |
| `vehicles/cars/sedan_blue.glb` | `veh.sedan_blue` |
| `vehicles/cars/sedan_red.glb` | `veh.sedan_red` |
| `vehicles/cars/suv_01.glb` | `veh.suv` |
| `vehicles/cars/taxi_01.glb` | `veh.taxi` |
| `vehicles/cars/van_01.glb` | `veh.van` |
| `vehicles/fire/fire_truck.glb` | `veh.fire` |
| `vehicles/police/police_car.glb` | `veh.police` |
| `vehicles/trucks/delivery_truck.glb` | `veh.delivery` |
| `vehicles/trucks/heavy_truck.glb` | `veh.heavy` |

### Transit (4)

| Relative path | Suggested registry id |
|---|---|
| `metro/stations/metro_station_elevated.glb` | `metro.station` |
| `metro/trains/metro_train_car.glb` | `metro.car` |
| `railway/trains/railway_locomotive.glb` | `rail.loco` |
| `railway/trains/railway_passenger_car.glb` | `rail.car` |

## Not on disk (skip or procedural fallback)

Friend registry referenced these; **files do not exist** in the pack:

- Airport terminal / tower / hangar
- Flat `/assets/transport/*.glb` names
- Flat `/assets/buildings/{hospital,school,police}.glb` names

Phase 2 registry must use **nested paths above only**.

## Public URL convention (root app)

After copy, browser URL = `/assets/` + relative path, e.g.:

```text
/assets/buildings/residential/house_01.glb
```

Also copy: `manifest.json`, `docs/ASSET_LICENSES.md`, `docs/ASSET_SOURCES.md` excerpts, `CREDITS.md` notes.
