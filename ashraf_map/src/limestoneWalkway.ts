import * as Cesium from "cesium";

/**
 * World-aligned, real-size limestone paving for the 70 m pilot sidewalk.
 * The 1024px texture represents a 2.4 m x 2.4 m repeating area:
 * 120 x 60 cm slabs with a half-slab stagger and thin warm grout.
 *
 * Explicit per-corner UVs prevent north-aligned / stretched polygon textures.
 * For the future curved sidewalk network, each strip should have its own
 * longitudinal UVs (following distance along its centerline).
 */
const STONE_PATTERN_SIZE_METERS = 2.4;
const TOP_SURFACE_OFFSET_METERS = 0.008;
const TEXTURE_URL = "/textures/limestone-walkway.png";

function mappedStripUV(corners: Cesium.Cartesian3[]): {
  textureCoordinates: Cesium.PolygonHierarchy;
  repeat: Cesium.Cartesian2;
} {
  if (corners.length !== 4) {
    throw new Error(
      `Limestone pilot expects a four-corner sidewalk strip; received ${corners.length} vertices.`,
    );
  }

  const edge01 = Cesium.Cartesian3.distance(corners[0], corners[1]);
  const edge12 = Cesium.Cartesian3.distance(corners[1], corners[2]);
  const edge23 = Cesium.Cartesian3.distance(corners[2], corners[3]);
  const edge30 = Cesium.Cartesian3.distance(corners[3], corners[0]);

  // U always runs ALONG the sidewalk; V always crosses its width.
  const firstEdgeIsLong = (edge01 + edge23) >= (edge12 + edge30);
  const length = firstEdgeIsLong
    ? (edge01 + edge23) / 2
    : (edge12 + edge30) / 2;
  const width = firstEdgeIsLong
    ? (edge12 + edge30) / 2
    : (edge01 + edge23) / 2;

  const uv = firstEdgeIsLong
    ? [
        new Cesium.Cartesian2(0, 0),
        new Cesium.Cartesian2(1, 0),
        new Cesium.Cartesian2(1, 1),
        new Cesium.Cartesian2(0, 1),
      ]
    : [
        new Cesium.Cartesian2(0, 0),
        new Cesium.Cartesian2(0, 1),
        new Cesium.Cartesian2(1, 1),
        new Cesium.Cartesian2(1, 0),
      ];

  // Cesium's type declaration constrains PolygonHierarchy to Cartesian3,
  // but PolygonGraphics.textureCoordinates explicitly uses Cartesian2 UVs.
  const textureCoordinates = new Cesium.PolygonHierarchy(
    uv as unknown as Cesium.Cartesian3[],
  );

  return {
    textureCoordinates,
    repeat: new Cesium.Cartesian2(
      length / STONE_PATTERN_SIZE_METERS,
      width / STONE_PATTERN_SIZE_METERS,
    ),
  };
}

/** Adds only a thin textured top; the existing extruded slab remains intact. */
export function createLimestoneWalkwayTop(
  sidewalk: Cesium.DataSource,
  sidewalkTopMeters: number,
): Cesium.CustomDataSource {
  const stoneTop = new Cesium.CustomDataSource("Large limestone walkway slabs");
  const now = Cesium.JulianDate.now();

  for (const entity of sidewalk.entities.values) {
    const hierarchy = entity.polygon?.hierarchy?.getValue(now);
    if (!hierarchy?.positions?.length) continue;

    // GeoJSON polygon rings commonly repeat their first corner at the end.
    // Cesium preserves that closing vertex in the entity hierarchy.
    const corners = [...hierarchy.positions];
    if (
      corners.length > 4 &&
      Cesium.Cartesian3.distance(corners[0], corners[corners.length - 1]) < 0.01
    ) {
      corners.pop();
    }
    const { repeat, textureCoordinates } = mappedStripUV(corners);
    stoneTop.entities.add({
      name: "120 x 60 cm limestone paving",
      polygon: {
        hierarchy: new Cesium.PolygonHierarchy(corners),
        textureCoordinates,
        height: sidewalkTopMeters + TOP_SURFACE_OFFSET_METERS,
        material: new Cesium.ImageMaterialProperty({
          image: TEXTURE_URL,
          repeat,
          color: Cesium.Color.WHITE,
          transparent: false,
        }),
        outline: false,
        shadows: Cesium.ShadowMode.RECEIVE_ONLY,
      },
    });
  }
  return stoneTop;
}
