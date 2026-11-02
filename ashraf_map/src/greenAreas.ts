import * as Cesium from "cesium";


type PolygonGeometry = {
  type: "Polygon";
  coordinates: number[][][];
};


type MultiPolygonGeometry = {
  type: "MultiPolygon";
  coordinates: number[][][][];
};


type GreenFeatureCollection = {
  type: "FeatureCollection";
  features: Array<{
    geometry: PolygonGeometry | MultiPolygonGeometry | null;
  }>;
};


const GREEN_BASE_HEIGHT_METERS = 0.06;
const GREEN_TOP_HEIGHT_METERS = 0.24;

export const GREEN_AREAS_BOUNDS = {
  west: 30.8611,
  south: 30.09128,
  east: 30.87148,
  north: 30.09874,
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


function createGrassTexture(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Unable to create the greenery texture");

  context.fillStyle = "#477631";
  context.fillRect(0, 0, canvas.width, canvas.height);

  let seed = 0x5f3759df;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
  const colors = ["#315d29", "#588b3c", "#6b9946", "#3d6d31", "#7da552"];
  for (let index = 0; index < 5200; index += 1) {
    const radius = 0.35 + random() * 1.3;
    context.globalAlpha = 0.25 + random() * 0.45;
    context.fillStyle = colors[Math.floor(random() * colors.length)];
    context.beginPath();
    context.arc(random() * 256, random() * 256, radius, 0, Math.PI * 2);
    context.fill();
  }
  for (let index = 0; index < 900; index += 1) {
    const x = random() * 256;
    const y = random() * 256;
    const length = 1.5 + random() * 3.5;
    context.globalAlpha = 0.2 + random() * 0.35;
    context.strokeStyle = random() > 0.5 ? "#9ab965" : "#244d24";
    context.lineWidth = 0.45 + random() * 0.55;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + (random() - 0.5) * 1.4, y - length);
    context.stroke();
  }
  context.globalAlpha = 1;
  return canvas;
}


export async function loadGreenAreas(
  url: string,
): Promise<Cesium.Primitive[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Greenery geometry unavailable (${response.status})`);
  }
  const data = (await response.json()) as GreenFeatureCollection;
  if (data.type !== "FeatureCollection" || !Array.isArray(data.features)) {
    throw new Error("Invalid greenery GeoJSON");
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
    throw new Error("Greenery GeoJSON contains no polygons");
  }

  const material = Cesium.Material.fromType(Cesium.Material.ImageType, {
    image: createGrassTexture(),
    repeat: new Cesium.Cartesian2(14, 14),
    color: Cesium.Color.WHITE,
  });
  const appearance = new Cesium.MaterialAppearance({
    material,
    materialSupport: Cesium.MaterialAppearance.MaterialSupport.TEXTURED,
    translucent: false,
    closed: true,
    faceForward: true,
  });
  const geometryInstances = polygonCoordinates.map(
    (coordinates, index) =>
      new Cesium.GeometryInstance({
        id: `green-area-${index + 1}`,
        geometry: new Cesium.PolygonGeometry({
          polygonHierarchy: hierarchyFromCoordinates(coordinates),
          height: GREEN_TOP_HEIGHT_METERS,
          extrudedHeight: GREEN_BASE_HEIGHT_METERS,
          closeTop: true,
          closeBottom: false,
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
