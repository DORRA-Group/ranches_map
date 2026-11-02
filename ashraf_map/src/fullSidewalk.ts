import * as Cesium from "cesium";

/**
 * RANCHES conceptual public-realm pavement coverage, generated from the same
 * GIS CRS as the finished black/white curbs. Roads, parking, private plots, and
 * inner landscape rings are removed before the red-stone geometry is baked into
 * one world-anchored, UV-textured GLB. Outer landscape surfaces are paved while
 * the inner rings remain open. The placement array contains road-facing lamps.
 *
 * Rebuild with `python3 scripts/build-redstone-coverage.py` after GIS/texture edits.
 */

type LampPosition = {
  id: string;
  longitude: number;
  latitude: number;
  headingDegrees: number;
  heightMeters: number;
};

type FullSidewalkManifest = {
  model: string;
  lamps: LampPosition[];
  renderDistanceMeters: number;
  sidewalkTopHeightMeters: number;
  sidewalkBaseHeightMeters: number;
};

const FULL_MODEL = "/models/ranches-redstone-coverage.glb";
const LAMP_MODEL = "/models/classic-streetlamp.glb";
const SITE_ORIGIN = { longitude: 30.8601, latitude: 30.095 };
const LAMP_SCALE = 1.75;
// Corrected GLB arm points opposite to the mathematical bearing in this scene.
const LAMP_ARM_YAW_CORRECTION_DEGREES = 180;

export async function loadFullSidewalk(
  sidewalkTopMeters: number,
  sidewalkBaseMeters: number,
): Promise<Cesium.DataSource[]> {
  const response = await fetch("/data/full-sidewalk-lampposts.json");
  if (!response.ok) {
    throw new Error(`Full sidewalk lamp data unavailable (${response.status})`);
  }
  const data = (await response.json()) as FullSidewalkManifest;
  if (!Array.isArray(data.lamps)) {
    throw new Error("Invalid full-site sidewalk lamp data");
  }

  if (
    Math.abs(sidewalkTopMeters - data.sidewalkTopHeightMeters) > 0.005 ||
    Math.abs(sidewalkBaseMeters - data.sidewalkBaseHeightMeters) > 0.005
  ) {
    console.warn(
      "Full-site sidewalk model elevations differ from App.tsx curb elevations. " +
      "Regenerate the sidewalk GLB using your current pavement heights.",
    );
  }

  const network = new Cesium.CustomDataSource("RANCHES full-site red sandstone pavement");
  const origin = Cesium.Cartesian3.fromDegrees(
    SITE_ORIGIN.longitude,
    SITE_ORIGIN.latitude,
    0,
  );

  // This single mesh follows the globe, has real 15cm raised edges, UVs based
  // on travelled GIS distance, and receives real shadows from the lamp models.
  network.entities.add({
    id: "ranches-full-stone-sidewalk",
    name: "3D red sandstone pavement",
    position: origin,
    orientation: Cesium.Transforms.headingPitchRollQuaternion(
      origin,
      new Cesium.HeadingPitchRoll(0, 0, 0),
    ),
    model: {
      uri: FULL_MODEL,
      scale: 1,
      minimumPixelSize: 0,
      shadows: Cesium.ShadowMode.RECEIVE_ONLY,
      runAnimations: false,
    },
  });

  const nearFar = new Cesium.DistanceDisplayCondition(
    0,
    Math.max(100, data.renderDistanceMeters || 650),
  );
  for (const lamp of data.lamps) {
    const p = Cesium.Cartesian3.fromDegrees(
      lamp.longitude,
      lamp.latitude,
      sidewalkTopMeters + 0.005,
    );
    const heading =
      (lamp.headingDegrees + LAMP_ARM_YAW_CORRECTION_DEGREES) % 360;
    network.entities.add({
      id: lamp.id,
      name: "Classic road-facing lamppost",
      position: p,
      orientation: Cesium.Transforms.headingPitchRollQuaternion(
        p,
        new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(heading), 0, 0),
      ),
      model: {
        uri: LAMP_MODEL,
        scale: LAMP_SCALE,
        minimumPixelSize: 0,
        distanceDisplayCondition: nearFar,
        shadows: Cesium.ShadowMode.CAST_ONLY,
      },
      properties: {
        calculatedRoadHeadingDegrees: lamp.headingDegrees,
        displayedModelHeightMeters: lamp.heightMeters * LAMP_SCALE,
      },
    });
  }
  return [network];
}
