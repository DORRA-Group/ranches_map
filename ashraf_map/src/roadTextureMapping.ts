import * as Cesium from "cesium";

/**
 * Apply the asphalt texture with a stable, real-world repeat scale.
 *
 * Unlike a fixed (45, 20) repeat on every polygon, this maps each polygon to
 * the same ENU-style metre grid. Adjacent pieces and roundabout polygons thus
 * retain similar aggregate size at every zoom level.
 *
 * The texture is deliberately not clamped to terrain and existing heights are
 * preserved. Road line markings remain separate fixed geographic meshes.
 */
// Larger world-space tiles reduce shimmer from high-frequency gravel detail.
// Tune between 6 and 10 metres if needed; this does not move road geometry.
const ASPHALT_TILE_SIZE_METERS = 8.0;
const GRID_ORIGIN_LONGITUDE = 30.8601;
const GRID_ORIGIN_LATITUDE = 30.095;

const ORIGIN_LON_RADIANS = Cesium.Math.toRadians(GRID_ORIGIN_LONGITUDE);
const ORIGIN_LAT_RADIANS = Cesium.Math.toRadians(GRID_ORIGIN_LATITUDE);
const EARTH_RADIUS = Cesium.Ellipsoid.WGS84.maximumRadius;
const EAST_METERS_PER_RADIAN = EARTH_RADIUS * Math.cos(ORIGIN_LAT_RADIANS);

// Roads span only a few kilometres; this local approximation is stable and
// sufficiently accurate for visual texture scaling (NOT for GIS geometry).
function localXY(point: Cesium.Cartesian3): [number, number] {
  const geo = Cesium.Cartographic.fromCartesian(point);
  return [
    (geo.longitude - ORIGIN_LON_RADIANS) * EAST_METERS_PER_RADIAN,
    (geo.latitude - ORIGIN_LAT_RADIANS) * EARTH_RADIUS,
  ];
}

function visitAllPositions(
  hierarchy: Cesium.PolygonHierarchy,
  consume: (point: Cesium.Cartesian3) => void,
): void {
  for (const point of hierarchy.positions) consume(point);
  for (const hole of hierarchy.holes ?? []) visitAllPositions(hole, consume);
}

/** UVs remain normalized, with a shared snapped world grid for polygon seams. */
function mapRoadPolygon(hierarchy: Cesium.PolygonHierarchy): {
  uv: Cesium.PolygonHierarchy;
  repeat: Cesium.Cartesian2;
} {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  visitAllPositions(hierarchy, (position) => {
    const [x, y] = localXY(position);
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  });

  if (!Number.isFinite(minX) || !Number.isFinite(minY)) {
    throw new Error("Road polygon has no valid texture vertices");
  }

  // Snapping to the shared global grid makes adjacent road polygons continuous
  // even though each entity has its own material and UV hierarchy.
  const snappedX0 = Math.floor(minX / ASPHALT_TILE_SIZE_METERS) * ASPHALT_TILE_SIZE_METERS;
  const snappedY0 = Math.floor(minY / ASPHALT_TILE_SIZE_METERS) * ASPHALT_TILE_SIZE_METERS;
  const snappedX1 = Math.max(
    snappedX0 + ASPHALT_TILE_SIZE_METERS,
    Math.ceil(maxX / ASPHALT_TILE_SIZE_METERS) * ASPHALT_TILE_SIZE_METERS,
  );
  const snappedY1 = Math.max(
    snappedY0 + ASPHALT_TILE_SIZE_METERS,
    Math.ceil(maxY / ASPHALT_TILE_SIZE_METERS) * ASPHALT_TILE_SIZE_METERS,
  );
  const spanX = snappedX1 - snappedX0;
  const spanY = snappedY1 - snappedY0;

  function toUV(ring: Cesium.PolygonHierarchy): Cesium.PolygonHierarchy {
    const uvVertices = ring.positions.map((position) => {
      const [x, y] = localXY(position);
      return new Cesium.Cartesian2(
        (x - snappedX0) / spanX,
        (y - snappedY0) / spanY,
      );
    });
    const holes = (ring.holes ?? []).map(toUV);
    // Cesium's PolygonHierarchy type is shared between Cartesian3 positions
    // and Cartesian2 texture coordinates; PolygonGraphics expects the latter.
    return new Cesium.PolygonHierarchy(
      uvVertices as unknown as Cesium.Cartesian3[],
      holes,
    );
  }

  return {
    uv: toUV(hierarchy),
    repeat: new Cesium.Cartesian2(
      spanX / ASPHALT_TILE_SIZE_METERS,
      spanY / ASPHALT_TILE_SIZE_METERS,
    ),
  };
}

export function styleRoadSurfaceMetered(
  dataSource: Cesium.DataSource,
  imageUrl: string,
  surfaceHeightMeters: number,
): void {
  const roadPolygons = dataSource.entities.values.filter((entity) => entity.polygon);
  if (!roadPolygons.length) {
    throw new Error("Road surface GeoJSON must contain Polygon or MultiPolygon geometry.");
  }

  const now = Cesium.JulianDate.now();
  for (const entity of roadPolygons) {
    const polygon = entity.polygon;
    if (!polygon) continue;
    const hierarchy = polygon.hierarchy?.getValue(now);
    if (!hierarchy?.positions?.length) continue;

    const { uv, repeat } = mapRoadPolygon(hierarchy);
    polygon.textureCoordinates = new Cesium.ConstantProperty(uv);
    polygon.material = new Cesium.ImageMaterialProperty({
      image: imageUrl,
      repeat,
      color: Cesium.Color.fromCssColorString("#a0a0a0"),
      transparent: false,
    });
    polygon.height = new Cesium.ConstantProperty(surfaceHeightMeters);
    polygon.outline = new Cesium.ConstantProperty(false);
  }
}
