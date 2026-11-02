import * as Cesium from "cesium";


type PolygonGeometry = {
  type: "Polygon";
  coordinates: number[][][];
};


type MultiPolygonGeometry = {
  type: "MultiPolygon";
  coordinates: number[][][][];
};


type WaterFeatureCollection = {
  type: "FeatureCollection";
  features: Array<{
    geometry: PolygonGeometry | MultiPolygonGeometry | null;
  }>;
};


const WATER_SURFACE_HEIGHT_METERS = 0.08;

export const WATER_AREAS_BOUNDS = {
  // Includes a viewing margin around the source extent so edge areas remain visible.
  west: 30.8656,
  south: 30.092,
  east: 30.86993,
  north: 30.09815,
};


function hierarchyFromCoordinates(
  coordinates: number[][][],
): Cesium.PolygonHierarchy {
  const toPositions = (ring: number[][]) =>
    Cesium.Cartesian3.fromDegreesArray(
      ring.flatMap(([longitude, latitude]) => [longitude, latitude]),
    );

  return new Cesium.PolygonHierarchy(
    toPositions(coordinates[0]),
    coordinates.slice(1).map(
      (hole) => new Cesium.PolygonHierarchy(toPositions(hole)),
    ),
  );
}


export async function loadWaterAreas(
  url: string,
): Promise<Cesium.Primitive[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Animated water geometry unavailable (${response.status})`);
  }
  const data = (await response.json()) as WaterFeatureCollection;
  if (data.type !== "FeatureCollection" || !Array.isArray(data.features)) {
    throw new Error("Invalid animated water GeoJSON");
  }

  const polygonCoordinates: number[][][][] = [];
  for (const feature of data.features) {
    const geometry = feature.geometry;
    if (!geometry) continue;
    if (geometry.type === "Polygon") {
      polygonCoordinates.push(geometry.coordinates);
    } else if (geometry.type === "MultiPolygon") {
      polygonCoordinates.push(...geometry.coordinates);
    }
  }
  if (!polygonCoordinates.length) {
    throw new Error("Animated water GeoJSON contains no polygons");
  }

  const material = Cesium.Material.fromType(Cesium.Material.WaterType, {
    baseWaterColor: Cesium.Color.fromCssColorString("#0a4f70").withAlpha(0.92),
    blendColor: Cesium.Color.fromCssColorString("#3aa8c2").withAlpha(0.72),
    normalMap: Cesium.buildModuleUrl("Assets/Textures/waterNormalsSmall.jpg"),
    frequency: 700,
    animationSpeed: 0.012,
    amplitude: 2.8,
    specularIntensity: 0.85,
    fadeFactor: 1,
  });
  const appearance = new Cesium.MaterialAppearance({
    material,
    materialSupport: Cesium.MaterialAppearance.MaterialSupport.ALL,
    translucent: true,
    closed: false,
    faceForward: true,
  });
  const geometryInstances = polygonCoordinates.map(
    (coordinates, index) =>
      new Cesium.GeometryInstance({
        id: `animated-water-area-${index + 1}`,
        geometry: new Cesium.PolygonGeometry({
          polygonHierarchy: hierarchyFromCoordinates(coordinates),
          height: WATER_SURFACE_HEIGHT_METERS,
          vertexFormat: appearance.vertexFormat,
        }),
      }),
  );

  return [
    new Cesium.Primitive({
      geometryInstances,
      appearance,
      asynchronous: false,
      allowPicking: true,
    }),
  ];
}
