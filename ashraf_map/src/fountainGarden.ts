import * as Cesium from "cesium";

/**
 * RANCHES static landscaped roundabout fountains.
 * Add EPSG:4326 Point/Polygon/MultiPolygon GeoJSON features to
 * public/data/fountain-roundabouts.geojson. Nothing renders until you select a site.
 *
 * The GLB is a 20m diameter, Z-up local model, matching the export convention
 * of the working classic streetlamps. An ENU frame anchors it to the globe.
 */

/** Temporary preview camera target. Replace when choosing final roundabouts. */
export const FOUNTAIN_PREVIEW_CENTER = { longitude: 30.8634146, latitude: 30.0950310 } as const;

const MODEL_URL = "/models/ranches-garden-fountain.glb";
const PLACEMENTS_URL = "/data/fountain-roundabouts.geojson";
const MODEL_RADIUS_METERS = 10;
const DEFAULT_POINT_RADIUS_METERS = 10;
const BORDER_CLEARANCE_METERS = 0.6;
const DEG_TO_METERS_LAT = 111_132;

type Position = [number, number];
type Geometry =
  | { type: "Point"; coordinates: number[] }
  | { type: "Polygon"; coordinates: number[][][] }
  | { type: "MultiPolygon"; coordinates: number[][][][] };
type FountainFeature = {
  type: "Feature";
  geometry: Geometry | null;
  properties?: {
    name?: string;
    radiusMeters?: number;
    radius_m?: number;
    diameterMeters?: number;
    elevationMeters?: number;
    headingDegrees?: number;
  } | null;
};
type FountainGeoJSON = { type: "FeatureCollection"; features: FountainFeature[] };

type Placement = {
  longitude: number;
  latitude: number;
  radiusMeters: number;
  elevationMeters: number;
  headingDegrees: number;
  name: string;
};

function polygonArea(ring: number[][]): number {
  let sum = 0;
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i];
    const b = ring[(i + 1) % ring.length];
    sum += a[0] * b[1] - b[0] * a[1];
  }
  return Math.abs(sum) / 2;
}

function polygonCenterAndRadius(rings: number[][][]): Placement | null {
  const outer = rings[0];
  if (!Array.isArray(outer) || outer.length < 4) return null;
  const [anchorLon, anchorLat] = outer[0];
  const mx = DEG_TO_METERS_LAT * Math.cos(Cesium.Math.toRadians(anchorLat));
  const points = outer.map(([lon, lat]) => [
    (lon - anchorLon) * mx,
    (lat - anchorLat) * DEG_TO_METERS_LAT,
  ]);
  let crossSum = 0;
  let sx = 0;
  let sy = 0;
  for (let i = 0; i < points.length; i++) {
    const [ax, ay] = points[i];
    const [bx, by] = points[(i + 1) % points.length];
    const cross = ax * by - bx * ay;
    crossSum += cross;
    sx += (ax + bx) * cross;
    sy += (ay + by) * cross;
  }
  if (Math.abs(crossSum) < 0.001) return null;
  const x = sx / (3 * crossSum);
  const y = sy / (3 * crossSum);

  // The circle must fit INSIDE the polygon: unlike an area-derived radius,
  // the shortest distance to the boundary won't spill over roadway curbs.
  const ringsMeters = rings.map((ring) =>
    ring.map(([lon, lat]) => [
      (lon - anchorLon) * mx,
      (lat - anchorLat) * DEG_TO_METERS_LAT,
    ]),
  );
  const inside = (ring: number[][]) => {
    let contained = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
        contained = !contained;
      }
    }
    return contained;
  };
  if (!inside(ringsMeters[0]) || ringsMeters.slice(1).some(inside)) return null;

  let minDistanceSq = Number.POSITIVE_INFINITY;
  for (const ring of ringsMeters) {
    for (let i = 0; i < ring.length; i++) {
      const [ax, ay] = ring[i];
      const [bx, by] = ring[(i + 1) % ring.length];
      const dx = bx - ax;
      const dy = by - ay;
      const lengthSq = dx * dx + dy * dy;
      const t = lengthSq > 0
        ? Cesium.Math.clamp(((x - ax) * dx + (y - ay) * dy) / lengthSq, 0, 1)
        : 0;
      const ddx = x - (ax + t * dx);
      const ddy = y - (ay + t * dy);
      minDistanceSq = Math.min(minDistanceSq, ddx * ddx + ddy * ddy);
    }
  }
  const radius = Math.sqrt(minDistanceSq) - BORDER_CLEARANCE_METERS;
  if (radius < 2.0) return null;
  return {
    longitude: anchorLon + x / mx,
    latitude: anchorLat + y / DEG_TO_METERS_LAT,
    radiusMeters: radius,
    elevationMeters: 0,
    headingDegrees: 0,
    name: "Circular landscaped fountain",
  };
}

function parsePlacement(feature: FountainFeature, index: number): Placement | null {
  const geometry = feature.geometry;
  if (!geometry) return null;
  const props = feature.properties ?? {};
  let placement: Placement | null = null;
  if (geometry.type === "Point") {
    const [longitude, latitude] = geometry.coordinates;
    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return null;
    placement = {
      longitude,
      latitude,
      radiusMeters: DEFAULT_POINT_RADIUS_METERS,
      elevationMeters: 0,
      headingDegrees: 0,
      name: "Circular landscaped fountain",
    };
  } else {
    // If MultiPolygon: choose its largest polygon component.
    const polygon = geometry.type === "Polygon"
      ? geometry.coordinates
      : [...geometry.coordinates].sort((a, b) =>
          polygonArea(b[0]) - polygonArea(a[0])
        )[0];
    if (polygon) placement = polygonCenterAndRadius(polygon);
  }
  if (!placement) {
    console.warn(`Roundabout #${index + 1} is too narrow or not suitable for circular fountain placement`);
    return null;
  }
  const specifiedRadius = props.radiusMeters ?? props.radius_m ??
    (props.diameterMeters !== undefined ? props.diameterMeters / 2 : undefined);
  if (specifiedRadius !== undefined && Number.isFinite(specifiedRadius)) {
    // Polygons may scale down, but never exceed their safe inscribed circle.
    placement.radiusMeters = geometry.type === "Point"
      ? specifiedRadius
      : Math.min(placement.radiusMeters, specifiedRadius);
  }
  if (placement.radiusMeters < 2.0 || placement.radiusMeters > 100) return null;
  placement.elevationMeters = Number.isFinite(props.elevationMeters)
    ? props.elevationMeters!
    : 0;
  placement.headingDegrees = Number.isFinite(props.headingDegrees)
    ? props.headingDegrees!
    : 0;
  placement.name = props.name || `Garden fountain ${index + 1}`;
  return placement;
}

export async function loadGardenFountains(
  defaultHeightMeters: number,
): Promise<Cesium.CustomDataSource> {
  const response = await fetch(PLACEMENTS_URL);
  if (!response.ok) throw new Error(`Fountain placement file unavailable (${response.status})`);
  const json = (await response.json()) as FountainGeoJSON;
  if (json.type !== "FeatureCollection" || !Array.isArray(json.features)) {
    throw new Error("Expected a GeoJSON FeatureCollection in fountain-roundabouts.geojson");
  }
  const source = new Cesium.CustomDataSource("RANCHES static landscaped garden fountains");
  json.features.forEach((feature, i) => {
    const config = parsePlacement(feature, i);
    if (!config) return;
    const position = Cesium.Cartesian3.fromDegrees(
      config.longitude,
      config.latitude,
      defaultHeightMeters + config.elevationMeters,
    );
    source.entities.add({
      id: `ranches-garden-fountain-${i}`,
      name: config.name,
      position,
      orientation: Cesium.Transforms.headingPitchRollQuaternion(
        position,
        new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(config.headingDegrees), 0, 0),
      ),
      model: {
        uri: MODEL_URL,
        scale: config.radiusMeters / MODEL_RADIUS_METERS,
        minimumPixelSize: 0,
        shadows: Cesium.ShadowMode.ENABLED,
        runAnimations: false,
      },
      description: `Static fountain and landscaped flowerbeds, ${(2 * config.radiusMeters).toFixed(1)} m across`,
    });
  });
  return source;
}
