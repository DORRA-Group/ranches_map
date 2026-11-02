(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/Explorer.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Explorer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$maplibre$2d$gl$2f$dist$2f$maplibre$2d$gl$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/maplibre-gl/dist/maplibre-gl.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$proj4$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/proj4/lib/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Icon.tsx [app-client] (ecmascript)");
var __TURBOPACK__import$2e$meta__ = {
    get url () {
        return __turbopack_context__.F("components/Explorer.tsx");
    },
    env: {
        DEV: true,
        PROD: false,
        MODE: "development",
        BASE_URL: "/",
        SSR: false
    },
    get turbopackHot () {
        return __turbopack_context__.m.hot;
    }
};
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
// MapLibre v6 needs an explicit worker URL when bundled by Next/Turbopack.
__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$maplibre$2d$gl$2f$dist$2f$maplibre$2d$gl$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setWorkerUrl"](new __turbopack_context__.U(__turbopack_context__.r("[project]/node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs (static in ecmascript, tag client)")).toString());
const HOME = [
    30.0989057,
    30.8716454
];
// Direct EPSG:22992 survey projection; defaults are the projected centre of plan.json, so no manual offset is applied.
// Manual offsets use a new key so placements saved against the previous datum do not persist.
const defaults = {
    lat: 30.096037,
    lng: 30.860834,
    width: 2914.22,
    angle: 0
};
const ALIGNMENT_STORAGE = 'ranches-alignment-v3';
const CAD_CRS = 'EPSG:22992';
// 3-parameter Egypt 1907 → WGS 84 shift (EPSG:1545). Checked against Esri imagery: highway carriageways, graded
// villa streets and the perimeter fence line up within ~2 m. The previous 7-parameter set landed ~160 m west.
__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$proj4$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].defs(CAD_CRS, '+proj=tmerc +lat_0=30 +lon_0=31 +k=1 +x_0=615000 +y_0=810000 +ellps=helmert +towgs84=-130,110,-13,0,0,0,0 +units=m +no_defs');
const categories = [
    [
        'all',
        'All places',
        'grid'
    ],
    [
        'food',
        'Food & coffee',
        'coffee'
    ],
    [
        'shopping',
        'Shopping',
        'bag'
    ],
    [
        'health',
        'Healthcare',
        'health'
    ],
    [
        'education',
        'Education',
        'school'
    ],
    [
        'services',
        'Services',
        'wrench'
    ]
];
// Each group switches its CAD linework together with the fills and labels built from it.
const CAD_LAYERS = {
    plots: {
        label: 'Plots & homes',
        color: '#e3c79d',
        line: '#fff4e0',
        description: 'Plot outlines, villa separators and building setbacks.'
    },
    greens: {
        label: 'Landscape',
        color: '#6fb47e',
        line: '#a9e2b2',
        description: 'Parks, planted medians and green corridors.'
    },
    roads: {
        label: 'Roads & parking',
        color: '#c9d3de',
        line: '#dfe7ef',
        description: 'Kerbs, road centre-lines, roundabouts and parking courts.'
    },
    bike: {
        label: 'Bike route',
        color: '#ffd37d',
        line: '#ffd37d',
        description: 'Dedicated bike track.'
    },
    perimeter: {
        label: 'Site boundary',
        color: '#ff9d9d',
        line: '#ff9d9d',
        description: 'Project boundary wall and land limits.'
    },
    technical: {
        label: 'Survey & dimensions',
        color: '#91a2b9',
        line: '#91a2b9',
        description: 'Survey points, plot dimensions and other source linework.'
    }
};
const TYPOLOGIES = {
    'Twin villa': {
        color: '#ead6b2',
        description: 'Two semi-detached villas sharing one plot.'
    },
    'Townhouse cluster': {
        color: '#dcb48a',
        description: 'Four attached townhouses on one plot.'
    },
    'Townhouse row': {
        color: '#c99470',
        description: 'Six attached townhouses in a row.'
    },
    'Plot': {
        color: '#c3ccd6',
        description: 'Plot without a unit subdivision in the drawing.'
    }
};
const FONT = {
    regular: [
        'Noto Sans Regular'
    ],
    medium: [
        'Noto Sans Medium'
    ],
    italic: [
        'Noto Sans Italic'
    ]
};
// Areas and labels belong to a layer group, so the legend toggles hide a whole theme at once.
const AREA_GROUP = {
    site: 'perimeter',
    green: 'greens',
    marked: 'technical',
    parking: 'roads',
    plot: 'plots',
    envelope: 'plots'
};
const LABEL_GROUP = {
    plot: 'plots',
    unit: 'plots',
    road: 'roads',
    name: 'perimeter',
    zone: 'plots',
    dimension: 'technical',
    survey: 'technical'
};
const emptyCollection = {
    type: 'FeatureCollection',
    features: []
};
// Tile the local GeoJSON only to z16 (≈6 cm precision here) and overzoom above it: a third of the tiles to build and draw,
// and zooming in past 16 no longer re-tiles. A small edge buffer stops each tile re-processing its neighbours' geometry.
const LOCAL_TILES = {
    maxzoom: 16,
    buffer: 32
};
const baseStyle = {
    version: 8,
    glyphs: 'https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf',
    sources: {
        satellite: {
            type: 'raster',
            tiles: [
                'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256,
            maxzoom: 19,
            attribution: 'Tiles © Esri — Esri, Maxar, Earthstar Geographics, and the GIS User Community'
        },
        street: {
            type: 'vector',
            url: 'https://tiles.openfreemap.org/planet',
            attribution: '<a href="https://openfreemap.org">OpenFreeMap</a> © <a href="https://www.openmaptiles.org/">OpenMapTiles</a> Data from <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }
    },
    layers: [
        {
            id: 'background',
            type: 'background',
            paint: {
                'background-color': '#10141a'
            }
        },
        {
            id: 'base-satellite',
            type: 'raster',
            source: 'satellite',
            paint: {
                'raster-saturation': -0.35,
                'raster-brightness-max': 0.76,
                'raster-contrast': 0.12,
                'raster-fade-duration': 200
            }
        }
    ]
};
// Street basemap: OpenFreeMap vector tiles (OpenMapTiles schema) drawn in the panels' dark palette. Vector roads and labels stay
// sharp when the camera tilts, where the old OSM raster smeared into grey. Width k scales a road class against minor streets.
const roadWidth = (k)=>[
        'interpolate',
        [
            'exponential',
            2
        ],
        [
            'zoom'
        ],
        11,
        0.4 * k,
        14,
        1.6 * k,
        16,
        5 * k,
        18,
        18 * k,
        20,
        70 * k
    ];
const ROAD_CLASSES = [
    [
        [
            'service',
            'track'
        ],
        '#252d36',
        0.6
    ],
    [
        [
            'minor'
        ],
        '#2d3641',
        1
    ],
    [
        [
            'secondary',
            'tertiary'
        ],
        '#394450',
        1.3
    ],
    [
        [
            'primary',
            'trunk'
        ],
        '#47515d',
        1.6
    ],
    [
        [
            'motorway'
        ],
        '#5c5546',
        1.9
    ]
];
const label = (field)=>({
        'text-field': field,
        'text-font': FONT.regular
    });
const STREET_BASE = [
    {
        id: 'base-street-land',
        type: 'background',
        paint: {
            'background-color': '#1a2028'
        }
    },
    {
        id: 'base-street-sand',
        type: 'fill',
        source: 'street',
        'source-layer': 'landcover',
        filter: [
            '==',
            [
                'get',
                'class'
            ],
            'sand'
        ],
        paint: {
            'fill-color': '#1d2125'
        }
    },
    {
        id: 'base-street-landuse',
        type: 'fill',
        source: 'street',
        'source-layer': 'landuse',
        filter: [
            'match',
            [
                'get',
                'class'
            ],
            [
                'residential',
                'suburb',
                'neighbourhood',
                'commercial',
                'retail'
            ],
            true,
            false
        ],
        paint: {
            'fill-color': '#1e252e'
        }
    },
    {
        id: 'base-street-green',
        type: 'fill',
        source: 'street',
        'source-layer': 'landcover',
        filter: [
            'match',
            [
                'get',
                'class'
            ],
            [
                'grass',
                'wood',
                'farmland'
            ],
            true,
            false
        ],
        paint: {
            'fill-color': '#1c2a24'
        }
    },
    {
        id: 'base-street-park',
        type: 'fill',
        source: 'street',
        'source-layer': 'park',
        paint: {
            'fill-color': '#1d2e26'
        }
    },
    {
        id: 'base-street-water',
        type: 'fill',
        source: 'street',
        'source-layer': 'water',
        paint: {
            'fill-color': '#0f1c28'
        }
    },
    {
        id: 'base-street-building',
        type: 'fill',
        source: 'street',
        'source-layer': 'building',
        minzoom: 14,
        paint: {
            'fill-color': '#252d37',
            'fill-outline-color': '#303a46'
        }
    },
    ...ROAD_CLASSES.map(([classes, , k])=>({
            id: `base-street-casing-${classes[0]}`,
            type: 'line',
            source: 'street',
            'source-layer': 'transportation',
            filter: [
                'match',
                [
                    'get',
                    'class'
                ],
                classes,
                true,
                false
            ],
            layout: {
                'line-cap': 'round',
                'line-join': 'round'
            },
            paint: {
                'line-color': '#12171d',
                'line-width': roadWidth(k * 1.35)
            }
        })),
    ...ROAD_CLASSES.map(([classes, color, k])=>({
            id: `base-street-road-${classes[0]}`,
            type: 'line',
            source: 'street',
            'source-layer': 'transportation',
            filter: [
                'match',
                [
                    'get',
                    'class'
                ],
                classes,
                true,
                false
            ],
            layout: {
                'line-cap': 'round',
                'line-join': 'round'
            },
            paint: {
                'line-color': color,
                'line-width': roadWidth(k)
            }
        })),
    {
        id: 'base-street-road-name',
        type: 'symbol',
        source: 'street',
        'source-layer': 'transportation_name',
        minzoom: 13,
        layout: {
            ...label([
                'coalesce',
                [
                    'get',
                    'name:en'
                ],
                [
                    'get',
                    'name:latin'
                ],
                ''
            ]),
            'symbol-placement': 'line',
            'text-size': [
                'interpolate',
                [
                    'linear'
                ],
                [
                    'zoom'
                ],
                13,
                9,
                18,
                12
            ],
            'text-letter-spacing': 0.04
        },
        paint: {
            'text-color': '#8d9aa9',
            'text-halo-color': '#12171d',
            'text-halo-width': 1.2
        }
    },
    {
        id: 'base-street-place',
        type: 'symbol',
        source: 'street',
        'source-layer': 'place',
        filter: [
            'match',
            [
                'get',
                'class'
            ],
            [
                'city',
                'town',
                'village',
                'suburb',
                'neighbourhood',
                'quarter'
            ],
            true,
            false
        ],
        layout: {
            ...label([
                'coalesce',
                [
                    'get',
                    'name:en'
                ],
                [
                    'get',
                    'name:latin'
                ],
                ''
            ]),
            'text-size': [
                'match',
                [
                    'get',
                    'class'
                ],
                [
                    'city',
                    'town'
                ],
                14,
                11
            ],
            'text-letter-spacing': 0.08,
            'text-transform': 'uppercase',
            'text-max-width': 8
        },
        paint: {
            'text-color': '#b4c0cd',
            'text-halo-color': '#12171d',
            'text-halo-width': 1.4
        }
    }
].map(_c = (layer)=>({
        ...layer,
        layout: {
            ...layer.layout,
            visibility: 'none'
        }
    }));
_c1 = STREET_BASE;
baseStyle.layers.push(...STREET_BASE);
// The horizon follows the basemap: daylight over imagery, a dusk tone over the dark street map.
// Golden-hour and night skies blend over the basemap's daytime sky as the sun sets.
const SKY_DUSK = {
    'sky-color': '#4a6aa3',
    'horizon-color': '#f3b07a',
    'fog-color': '#e0b08e'
}, SKY_NIGHT = {
    'sky-color': '#050a16',
    'horizon-color': '#1a2740',
    'fog-color': '#0c1422'
};
const SKY = {
    satellite: {
        'sky-color': '#6c9bd2',
        'horizon-color': '#dbe5ee',
        'fog-color': '#d6dee5',
        'sky-horizon-blend': 0.55,
        'horizon-fog-blend': 0.6,
        'fog-ground-blend': 0.9,
        'atmosphere-blend': 0
    },
    street: {
        'sky-color': '#0d141d',
        'horizon-color': '#2b3846',
        'fog-color': '#1a2028',
        'sky-horizon-blend': 0.6,
        'horizon-fog-blend': 0.6,
        'fog-ground-blend': 0.85,
        'atmosphere-blend': 0
    }
};
function distance(lat, lng) {
    const r = Math.PI / 180;
    const a = Math.sin((lat - HOME[0]) * r / 2) ** 2 + Math.cos(HOME[0] * r) * Math.cos(lat * r) * Math.sin((lng - HOME[1]) * r / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function normalize(elements) {
    return elements.flatMap((e)=>{
        const t = e.tags || {}, p = e.center || e;
        const k = t.amenity || t.shop;
        const category = [
            'restaurant',
            'cafe',
            'fast_food',
            'food_court',
            'bar'
        ].includes(k) ? 'food' : [
            'supermarket',
            'mall',
            'convenience'
        ].includes(k) ? 'shopping' : [
            'hospital',
            'clinic',
            'pharmacy',
            'doctors',
            'dentist'
        ].includes(k) ? 'health' : [
            'school',
            'university',
            'college',
            'kindergarten'
        ].includes(k) ? 'education' : [
            'fuel',
            'bank',
            'atm'
        ].includes(k) ? 'services' : null;
        return category && p.lat && p.lon ? [
            {
                id: `${e.type}-${e.id}`,
                name: t['name:en'] || t.name || k.replaceAll('_', ' '),
                category,
                lat: p.lat,
                lng: p.lon,
                kind: k.replaceAll('_', ' ')
            }
        ] : [];
    }).sort((a, b)=>distance(a.lat, a.lng) - distance(b.lat, b.lng));
}
function projectedCenter(plan) {
    const [minX, minY, maxX, maxY] = plan.bounds, [originX, originY] = plan.sourceBounds, [lng, lat] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$proj4$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(CAD_CRS, 'WGS84', [
        originX + (minX + maxX) / 2,
        originY + (minY + maxY) / 2
    ]);
    return {
        lng,
        lat
    };
}
// Survey grid → WGS 84, then the optional manual placement (offset, scale, rotation) around the plan centre.
function projector(plan, placement) {
    const [minX, , maxX] = plan.bounds, [originX, originY] = plan.sourceBounds, center = projectedCenter(plan), scale = placement.width / (maxX - minX), angle = placement.angle * Math.PI / 180;
    return ([x, y])=>{
        const [rawLng, rawLat] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$proj4$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(CAD_CRS, 'WGS84', [
            originX + x,
            originY + y
        ]), dx = (rawLng - center.lng) * 111320 * Math.cos(center.lat * Math.PI / 180) * scale, dy = (rawLat - center.lat) * 111320 * scale, lat = placement.lat + (dx * Math.sin(angle) + dy * Math.cos(angle)) / 111320, lng = placement.lng + (dx * Math.cos(angle) - dy * Math.sin(angle)) / (111320 * Math.cos(placement.lat * Math.PI / 180));
        return [
            lng,
            lat
        ];
    };
}
function planCollection(plan, placement) {
    const project = projector(plan, placement);
    return {
        type: 'FeatureCollection',
        features: plan.features.map((feature)=>({
                type: 'Feature',
                properties: {
                    id: feature.id,
                    layer: feature.layer,
                    category: feature.category
                },
                geometry: {
                    type: 'LineString',
                    coordinates: feature.coordinates.map(project)
                }
            }))
    };
}
function areaCollection(plan, placement) {
    const project = projector(plan, placement);
    return {
        type: 'FeatureCollection',
        features: (plan.areas || []).map(({ rings, ...area })=>({
                type: 'Feature',
                properties: {
                    ...area,
                    group: AREA_GROUP[area.kind],
                    color: area.typology ? TYPOLOGIES[area.typology]?.color : null
                },
                geometry: {
                    type: 'Polygon',
                    coordinates: rings.map((ring)=>ring.map(project))
                }
            }))
    };
}
function labelCollection(plan, placement) {
    const project = projector(plan, placement);
    return {
        type: 'FeatureCollection',
        features: (plan.labels || []).map(({ at, rotation, ...label })=>({
                type: 'Feature',
                properties: {
                    ...label,
                    group: LABEL_GROUP[label.kind],
                    title: label.kind === 'zone' ? `${label.text}\n${label.detail || ''}` : label.text,
                    rotate: -(rotation + placement.angle)
                },
                geometry: {
                    type: 'Point',
                    coordinates: project(at)
                }
            }))
    };
}
const CAR_COLORS = [
    '#ecebe7',
    '#c4c8cd',
    '#1c1e21',
    '#5c626a',
    '#2b4a73',
    '#8f2023',
    '#d6cfc0',
    '#3a4d3f'
];
const STREET_LAYERS = [
    'street-green',
    'street-path',
    'street-asphalt',
    'street-parking',
    'street-kerb-shade',
    'street-marking',
    'street-line',
    'street-shadows',
    'street-sidewalk',
    'street-island',
    'street-kerb',
    'street-wall',
    'street-props',
    'street-glow',
    'street-lamps',
    'context-buildings'
];
const VILLA_LAYERS = [
    'plan-garden',
    'villa-shadows',
    'villas',
    'villa-windows',
    'fountain',
    'fountain-glow'
];
const GIS_LAYERS = [
    'gis-plots',
    'gis-landscape',
    'gis-water',
    'gis-roads',
    'gis-parking',
    'gis-boundary'
];
const ALIGNED_DETAIL_LAYERS = [
    'gis-road-dashes',
    'gis-parking-edges',
    'gis-parking-bays',
    'gis-sidewalk',
    'gis-pavement-outline',
    'gis-curb-white',
    'gis-curb-black'
];
// In Combined mode GIS owns classified ground. These Alaa surfaces are retained only for A/B comparison; Alaa's detailed
// paths, kerbs, markings, furniture, buildings, lighting and animation remain above the authoritative GIS geometry.
const PRESENTATION_GROUND_LAYERS = [
    'plan-green',
    'plan-parking',
    'plan-garden',
    'street-green',
    'street-path',
    'street-asphalt',
    'street-parking',
    'street-kerb-shade',
    'street-marking',
    'street-line',
    'street-sidewalk',
    'street-island',
    'street-kerb'
];
function sunAt(hour, date = new Date()) {
    const r = Math.PI / 180, day = (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 0)) / 864e5, dec = 23.44 * Math.sin(2 * Math.PI * (284 + day) / 365) * r, lat = HOME[0] * r, h = (hour - 12) * 15 * r;
    const altitude = Math.asin(Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(h)) / r, azimuth = Math.atan2(Math.sin(h), Math.cos(h) * Math.sin(lat) - Math.tan(dec) * Math.cos(lat)) / r + 180;
    return {
        azimuth,
        altitude,
        polar: 90 - altitude
    };
}
const smooth = (a, b, x)=>{
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
};
// Daylight runs 0 (night) → 1 (day) from just below the horizon to 3° above it; golden peaks with the sun low on the horizon.
const daylight = (sun)=>smooth(-8, 3, sun.altitude), golden = (sun)=>smooth(-7, 0, sun.altitude) * (1 - smooth(6, 22, sun.altitude));
function mix(a, b, t) {
    const c = (hex)=>[
            1,
            3,
            5
        ].map((i)=>parseInt(hex.slice(i, i + 2), 16)), x = c(a), y = c(b);
    return '#' + x.map((v, i)=>Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('');
}
const DEFAULT_HOUR = 14;
// Line widths in metres (≈135,571 m per pixel at zoom 0 on this latitude).
const metres = (m)=>[
        'interpolate',
        [
            'exponential',
            2
        ],
        [
            'zoom'
        ],
        12,
        m / 33.1,
        22,
        m / 0.0323
    ];
const metresOf = (property)=>[
        'interpolate',
        [
            'exponential',
            2
        ],
        [
            'zoom'
        ],
        12,
        [
            '/',
            [
                'get',
                property
            ],
            33.1
        ],
        22,
        [
            '/',
            [
                'get',
                property
            ],
            0.0323
        ]
    ];
const metreScale = (lat)=>[
        111320 * Math.cos(lat * Math.PI / 180),
        110574
    ];
// Rectangle length×width metres, centred `ahead` metres along `bearing` (degrees from north) and `side` metres to its right.
function rect([lng, lat], bearing, length, width, ahead = 0, side = 0) {
    const a = bearing * Math.PI / 180, [kx, ky] = metreScale(lat), fx = Math.sin(a), fy = Math.cos(a);
    return [
        [
            [
                -1,
                -1
            ],
            [
                1,
                -1
            ],
            [
                1,
                1
            ],
            [
                -1,
                1
            ],
            [
                -1,
                -1
            ]
        ].map(([s, t])=>{
            const u = ahead + s * length / 2, v = side + t * width / 2;
            return [
                lng + (fx * u + fy * v) / kx,
                lat + (fy * u - fx * v) / ky
            ];
        })
    ];
}
// Regular polygon (or a star when `inner` is set) of `radius` metres, shifted `shift` metres east/north.
function disc([lng, lat], radius, sides = 10, shift = [
    0,
    0
], inner = 0) {
    const [kx, ky] = metreScale(lat);
    return [
        Array.from({
            length: sides + 1
        }, (_, i)=>{
            const t = i % sides / sides * 2 * Math.PI, r = inner && i % 2 ? radius * inner : radius;
            return [
                lng + (shift[0] + r * Math.sin(t)) / kx,
                lat + (shift[1] + r * Math.cos(t)) / ky
            ];
        })
    ];
}
// Shadow offset in metres (east, north) for an object `height` tall; the length is capped once the sun nears the horizon.
const shadowRatio = (sun)=>Math.tan(Math.min(sun.polar, 82) * Math.PI / 180);
const castShadowAt = (height, sun)=>{
    const a = (sun.azimuth - 180) * Math.PI / 180, l = height * shadowRatio(sun);
    return [
        Math.sin(a) * l,
        Math.cos(a) * l
    ];
};
// `only` skips the half not needed: shadows are rebuilt as the sun moves, solids only when the placement does.
function streetProps(streets, plan, placement, sun, only) {
    const SHADOW_BEARING = sun.azimuth - 180, SHADOW_RATIO = shadowRatio(sun), castShadow = (height)=>castShadowAt(height, sun);
    const solids = [], shadows = [];
    const solid = (coordinates, base, top, color, glow = false)=>only !== 'shadows' && solids.push({
            type: 'Feature',
            properties: glow ? {
                base,
                top,
                color,
                glow
            } : {
                base,
                top,
                color
            },
            geometry: {
                type: 'Polygon',
                coordinates
            }
        }), shade = (coordinates, strength = 1)=>only !== 'solids' && shadows.push({
            type: 'Feature',
            properties: {
                strength
            },
            geometry: {
                type: 'Polygon',
                coordinates
            }
        });
    for (const feature of streets.features){
        const props = feature.properties, at = feature.geometry.coordinates;
        if (props.kind === 'light') {
            const b = props.bearing;
            solid(rect(at, b, 0.22, 0.22), 0, 8.4, '#59616a');
            solid(rect(at, b, 1.6, 0.12, 0.8), 8.22, 8.36, '#59616a');
            solid(rect(at, b, 0.75, 0.34, 1.45), 8.02, 8.24, '#f7f2dd', true);
            shade(rect(at, SHADOW_BEARING, 8.4 * SHADOW_RATIO, 0.22, 4.2 * SHADOW_RATIO), 0.7);
        } else if (props.kind === 'car') {
            const b = props.bearing, color = CAR_COLORS[props.tone % CAR_COLORS.length];
            const [sx, sy] = castShadow(0.9), [kx, ky] = metreScale(at[1]);
            shade(rect([
                at[0] + sx / kx,
                at[1] + sy / ky
            ], b, 4.6, 2.0));
            [
                [
                    1.35,
                    0.8
                ],
                [
                    1.35,
                    -0.8
                ],
                [
                    -1.35,
                    0.8
                ],
                [
                    -1.35,
                    -0.8
                ]
            ].forEach(([u, v])=>solid(rect(at, b, 0.64, 0.22, u, v), 0, 0.62, '#141517'));
            solid(rect(at, b, 4.4, 1.8), 0.2, 0.82, color);
            solid(rect(at, b, 2.5, 1.64, -0.25), 0.82, 1.3, '#1a2129');
            solid(rect(at, b, 2.1, 1.5, -0.35), 1.3, 1.42, color);
        }
    }
    // Each tree gets its own size and leaf tone (stable per position) so the avenue does not look stamped.
    const leaves = [
        [
            '#3e6a32',
            '#4a7a3a',
            '#568840',
            '#639548'
        ],
        [
            '#35602f',
            '#426f35',
            '#4f7d3c',
            '#5b8a44'
        ],
        [
            '#46703a',
            '#527f41',
            '#5f8c49',
            '#6c9852'
        ]
    ];
    const project = plan && projector(plan, placement);
    if (project) (streets.trees || []).forEach(([x, y, kind], index)=>{
        const at = project([
            x,
            y
        ]), k = 0.85 + index * 37 % 11 / 30, tone = leaves[index % leaves.length];
        if (kind === 'palm') {
            const h = 7.4 * k;
            shade(disc(at, 3.2, 12, castShadow(h), 0.3), 0.8);
            solid(disc(at, 0.2, 6), 0, h, '#8a7457');
            solid(disc(at, 0.7, 8), h - 0.4, h + 0.5, tone[2]);
            solid(disc(at, 3.4 * k, 12, [
                0,
                0
            ], 0.25), h - 0.2, h + 0.05, tone[1]);
        } else {
            shade(disc(at, 3 * k, 14, castShadow(4.8 * k)));
            solid(rect(at, 0, 0.38, 0.38), 0, 2.8 * k, '#6a5039');
            [
                [
                    2,
                    2.4,
                    3.4
                ],
                [
                    2.9,
                    3.4,
                    5.4
                ],
                [
                    2.4,
                    5.4,
                    6.4
                ],
                [
                    1.4,
                    6.4,
                    7.2
                ]
            ].forEach(([r, base, top], tier)=>solid(disc(at, r * k, 14), base * k, top * k, tone[tier]));
        }
    });
    return {
        solids: {
            type: 'FeatureCollection',
            features: solids
        },
        shadows: {
            type: 'FeatureCollection',
            features: shadows
        }
    };
}
const GLASS = '#2a3742', FOUNTAIN_WATER = '#46b9da';
function hull(points) {
    const sorted = [
        ...points
    ].sort((a, b)=>a[0] - b[0] || a[1] - b[1]), cross = (o, a, b)=>(a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), half = (list)=>list.reduce((out, p)=>{
            while(out.length > 1 && cross(out[out.length - 2], out[out.length - 1], p) <= 0)out.pop();
            out.push(p);
            return out;
        }, []);
    const lower = half(sorted), upper = half(sorted.reverse());
    return [
        ...lower.slice(0, -1),
        ...upper.slice(0, -1),
        lower[0]
    ];
}
// About two windows in three are lit after dark (stable per window); they live in their own layer above the night shade.
// The fountain's jets and water go to their own small source: jets pulse through feature state, and both stay lit at night.
function villaSolids(villas, plan, placement) {
    const project = projector(plan, placement), homes = [], fountain = [];
    villas.parts.forEach(([plot, base, top, color, rings], index)=>{
        const hex = villas.colors[color], geometry = {
            type: 'Polygon',
            coordinates: rings.map((ring)=>ring.map(project))
        };
        if (plot === 'fountain-jet' || plot === 'fountain' && hex === FOUNTAIN_WATER) fountain.push({
            type: 'Feature',
            properties: {
                id: `fountain-${index}`,
                base,
                top,
                color: hex,
                ...plot === 'fountain-jet' ? {
                    jet: true
                } : {}
            },
            geometry
        });
        else homes.push({
            type: 'Feature',
            properties: {
                plot,
                base,
                top,
                color: hex,
                ...hex === GLASS && index * 7919 % 100 < 65 ? {
                    lit: true
                } : {}
            },
            geometry
        });
    });
    return {
        homes: {
            type: 'FeatureCollection',
            features: homes
        },
        fountain: {
            type: 'FeatureCollection',
            features: fountain
        }
    };
}
function villaShadows(villas, plan, placement, sun) {
    const project = projector(plan, placement), shift = (ring, height)=>{
        const [dx, dy] = castShadowAt(height, sun);
        return ring.map(([x, y])=>[
                x + dx,
                y + dy
            ]);
    };
    // Survey-grid metres point east/north, so the sun offset applies before projection. Each building casts one hull: its ground floor, then the setback upper floor.
    const shadows = villas.buildings.map(([plot, , envelope, upper])=>({
            type: 'Feature',
            properties: {
                plot
            },
            geometry: {
                type: 'Polygon',
                coordinates: [
                    hull([
                        ...envelope,
                        ...shift(envelope, villas.levels.ground.slab),
                        ...upper.flatMap((ring)=>shift(ring, villas.levels.parapet))
                    ]).map(project)
                ]
            }
        }));
    return {
        type: 'FeatureCollection',
        features: shadows
    };
}
function tourStops(plan, placement, fountain) {
    const project = projector(plan, placement), zone = zoneBounds(plan, placement), label = (text)=>plan.labels?.find((item)=>item.text === text)?.at, plot = (number)=>{
        const ring = plan.areas?.find((area)=>area.kind === 'plot' && area.plot === number)?.rings[0];
        return ring && [
            ring.reduce((sum, p)=>sum + p[0], 0) / ring.length,
            ring.reduce((sum, p)=>sum + p[1], 0) / ring.length
        ];
    };
    const inside = (at, north)=>at && [
            at[0],
            at[1] + north
        ]; // look past the gate into the zone, not at the desert outside
    const stops = [
        [
            'Main gate',
            'The entrance on the 26 m boulevard',
            inside(label('Main gate'), 70),
            17.9,
            66,
            12
        ],
        [
            'Twin villas',
            '24 twin-villa plots, two homes each',
            plot('135'),
            18.4,
            64,
            -38
        ],
        [
            'Plaza fountain',
            'The roundabout at the heart of the zone',
            fountain,
            19.2,
            60,
            205
        ],
        [
            'Townhouse rows',
            'Six attached homes per row',
            plot('132'),
            18.2,
            62,
            52
        ],
        [
            'Pedestrian walkway',
            'The landscaped spine through the zone',
            label('Pedestrian walkway'),
            18,
            66,
            160
        ]
    ];
    const out = zone ? [
        {
            name: 'Zone 1',
            caption: `${plan.summary?.plots ?? ''} plots · ${plan.summary?.homes ?? ''} homes`,
            center: [
                (zone[0][0] + zone[1][0]) / 2,
                (zone[0][1] + zone[1][1]) / 2
            ],
            zoom: 16.4,
            pitch: 58,
            bearing: -24
        }
    ] : [];
    stops.forEach(([name, caption, at, zoom, pitch, bearing])=>{
        if (at) {
            const [lng, lat] = project(at);
            out.push({
                name,
                caption,
                center: [
                    lng,
                    lat
                ],
                zoom,
                pitch,
                bearing
            });
        }
    });
    return out;
}
const easeInOut = (t)=>t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
// Tileable surface textures, painted once on a canvas (deterministic noise so tiles match).
function texture(size, base, paint, grain) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    let seed = 11;
    const rand = ()=>(seed = seed * 16807 % 2147483647) / 2147483647;
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, size, size);
    paint(ctx, rand);
    const image = ctx.getImageData(0, 0, size, size), d = image.data;
    for(let i = 0; i < d.length; i += 4){
        const n = (rand() - 0.5) * grain;
        d[i] += n;
        d[i + 1] += n;
        d[i + 2] += n;
    }
    return image;
}
function blotches(ctx, rand, size, count, colors) {
    for(let i = 0; i < count; i++){
        const x = rand() * size, y = rand() * size, r = 6 + rand() * size / 3, color = colors[i % colors.length];
        for (const dx of [
            -size,
            0,
            size
        ])for (const dy of [
            -size,
            0,
            size
        ]){
            const g = ctx.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, r);
            g.addColorStop(0, color);
            g.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = g;
            ctx.fillRect(x + dx - r, y + dy - r, r * 2, r * 2);
        }
    }
}
function bricks(ctx, rand, size, w, h, joint, tint) {
    for(let row = 0; row * h < size; row++)for(let col = -1; col * w < size; col++){
        const x = col * w + (row % 2 ? w / 2 : 0), y = row * h, shift = (rand() - 0.5) * tint;
        ctx.fillStyle = `rgba(${shift > 0 ? '255,255,255' : '0,0,0'},${Math.abs(shift)})`;
        ctx.fillRect(x + 1, y + 1, w - 1, h - 1);
        ctx.fillStyle = joint;
        ctx.fillRect(x, y, w, 1);
        ctx.fillRect(x, y, 1, h);
    }
}
function addTextures(map) {
    const specks = (ctx, rand, size, count, color)=>{
        ctx.fillStyle = color;
        for(let i = 0; i < count; i++)ctx.fillRect(Math.floor(rand() * size), Math.floor(rand() * size), 1, 1);
    };
    const textures = {
        'tex-asphalt': texture(128, '#3a3d41', (ctx, rand)=>{
            blotches(ctx, rand, 128, 16, [
                'rgba(0,0,0,0.12)',
                'rgba(255,255,255,0.035)'
            ]);
            specks(ctx, rand, 128, 380, 'rgba(205,205,195,0.32)');
        }, 24),
        'tex-asphalt-worn': texture(128, '#47494c', (ctx, rand)=>{
            blotches(ctx, rand, 128, 14, [
                'rgba(0,0,0,0.1)',
                'rgba(255,255,255,0.05)'
            ]);
            specks(ctx, rand, 128, 300, 'rgba(220,220,210,0.3)');
        }, 22),
        'tex-paver': texture(64, '#c6bfb1', (ctx, rand)=>bricks(ctx, rand, 64, 16, 8, '#8d877b', 0.12), 12),
        'tex-stone': texture(64, '#cbb894', (ctx, rand)=>bricks(ctx, rand, 64, 32, 16, '#9c8766', 0.1), 14),
        'tex-grass': texture(64, '#4b7a38', (ctx, rand)=>{
            blotches(ctx, rand, 64, 10, [
                'rgba(20,40,10,0.18)',
                'rgba(200,210,90,0.12)'
            ]);
            specks(ctx, rand, 64, 160, 'rgba(170,190,90,0.45)');
        }, 34)
    };
    Object.entries(textures).forEach(([id, image])=>{
        if (!map.hasImage(id)) map.addImage(id, image, {
            pixelRatio: 2
        });
    });
}
function placesCollection(places) {
    return {
        type: 'FeatureCollection',
        features: places.map((place)=>({
                type: 'Feature',
                id: place.id,
                properties: place,
                geometry: {
                    type: 'Point',
                    coordinates: [
                        place.lng,
                        place.lat
                    ]
                }
            }))
    };
}
function planBounds(plan, placement) {
    const [x0, y0, x1, y1] = plan.bounds, halfW = placement.width / 2, halfH = halfW * (y1 - y0) / (x1 - x0), a = placement.angle * Math.PI / 180, corners = [
        [
            -halfW,
            -halfH
        ],
        [
            halfW,
            -halfH
        ],
        [
            halfW,
            halfH
        ],
        [
            -halfW,
            halfH
        ]
    ].map(([x, y])=>[
            placement.lng + (x * Math.cos(a) - y * Math.sin(a)) / (111320 * Math.cos(placement.lat * Math.PI / 180)),
            placement.lat + (x * Math.sin(a) + y * Math.cos(a)) / 111320
        ]), lngs = corners.map(([lng])=>lng), lats = corners.map(([, lat])=>lat);
    return [
        [
            Math.min(...lngs),
            Math.min(...lats)
        ],
        [
            Math.max(...lngs),
            Math.max(...lats)
        ]
    ];
}
// Zone 1 itself (plots, landscape, parking): what visitors want framed, rather than the whole 3 km drawing.
function zoneBounds(plan, placement) {
    const project = projector(plan, placement), points = (plan.areas || []).filter((area)=>area.kind !== 'site' && area.kind !== 'marked').flatMap((area)=>area.rings[0].map(project));
    if (!points.length) return null;
    const lngs = points.map(([lng])=>lng), lats = points.map(([, lat])=>lat);
    return [
        [
            Math.min(...lngs),
            Math.min(...lats)
        ],
        [
            Math.max(...lngs),
            Math.max(...lats)
        ]
    ];
}
const clock = (hour)=>`${Math.floor(hour)}:${String(Math.floor(hour % 1 * 60)).padStart(2, '0')}`;
const phase = (sun, hour)=>sun.altitude < -6 ? 'Night' : sun.altitude < 0 ? hour < 12 ? 'Dawn' : 'Dusk' : sun.altitude < 10 ? hour < 12 ? 'Sunrise' : 'Sunset' : hour < 11 ? 'Morning' : hour < 14 ? 'Midday' : 'Afternoon';
const squareMetres = (value)=>`${Math.round(value).toLocaleString('en-US')} m²`;
const hectares = (value)=>`${(value / 10000).toLocaleString('en-US', {
        maximumFractionDigits: 1
    })} ha`;
const visibility = (on)=>on ? 'visible' : 'none';
function Explorer() {
    _s();
    const el = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null), map = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null), alignmentHandle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null), selectedCadRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null), hoverPlotRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null), selectedPlotRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null), framedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false), placesRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])([]), planRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [ready, setReady] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null), [view, setView] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('satellite'), [category, setCategory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('all'), [query, setQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(''), [places, setPlaces] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]), [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('loading'), [selectedPlace, setSelectedPlace] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null), [selectedCad, setSelectedCad] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null), [selectedPlot, setSelectedPlot] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null), [compareMode, setCompareMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('combined'), [showPlan, setShowPlan] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true), [showSiteGis, setShowSiteGis] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true), [siteGis, setSiteGis] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null), [siteDetails, setSiteDetails] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null), [alignedCars, setAlignedCars] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null), [alignedLamps, setAlignedLamps] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null), [activeLayers, setActiveLayers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        roads: true,
        greens: true,
        bike: true,
        plots: true,
        perimeter: true,
        technical: false
    }), [opacity, setOpacity] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(.85), [align, setAlign] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false), [placement, setPlacement] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(defaults), [plan, setPlan] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null), [planError, setPlanError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false), [radius, setRadius] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(10), [sidebar, setSidebar] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true), [tileError, setTileError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false), [savedNotice, setSavedNotice] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false), [streets, setStreets] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null), [streets3d, setStreets3d] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true), [tilted, setTilted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false), [villas, setVillas] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null), [tour, setTour] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null), [hour, setHour] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(DEFAULT_HOUR), [timelapse, setTimelapse] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const sun = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Explorer.useMemo[sun]": ()=>sunAt(hour)
    }["Explorer.useMemo[sun]"], [
        hour
    ]);
    // Shadows step every six minutes of sun time: rebuilding and re-tiling them is the costly part of a time-lapse frame.
    const shadowHour = Math.round(hour * 10) / 10, stepSun = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Explorer.useMemo[stepSun]": ()=>sunAt(shadowHour)
    }["Explorer.useMemo[stepSun]"], [
        shadowHour
    ]);
    const tourRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0), stopTourRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])({
        "Explorer.useRef[stopTourRef]": ()=>{}
    }["Explorer.useRef[stopTourRef]"]);
    const placementRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(placement);
    placementRef.current = placement;
    placesRef.current = places;
    planRef.current = plan;
    const visible = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Explorer.useMemo[visible]": ()=>places.filter({
                "Explorer.useMemo[visible]": (place)=>(category === 'all' || place.category === category) && place.name.toLowerCase().includes(query.toLowerCase()) && distance(place.lat, place.lng) <= radius
            }["Explorer.useMemo[visible]"])
    }["Explorer.useMemo[visible]"], [
        places,
        category,
        query,
        radius
    ]);
    const cadLayerIds = Object.keys(CAD_LAYERS).map((key)=>`cad-${key}`);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Explorer.useEffect": ()=>{
            if (!el.current) return;
            const current = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$maplibre$2d$gl$2f$dist$2f$maplibre$2d$gl$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Map"]({
                container: el.current,
                style: baseStyle,
                center: [
                    defaults.lng,
                    defaults.lat
                ],
                zoom: 15,
                bearing: 0,
                pitch: 0,
                maxZoom: 20,
                maxPitch: 78,
                attributionControl: false,
                // Two-finger pan only on touch screens, where one finger should scroll the page; desktop wheels zoom directly.
                cooperativeGestures: window.matchMedia('(pointer: coarse)').matches,
                pixelRatio: Math.min(window.devicePixelRatio, 2)
            });
            map.current = current;
            current.addControl(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$maplibre$2d$gl$2f$dist$2f$maplibre$2d$gl$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NavigationControl"]({
                showCompass: true
            }), 'bottom-right');
            current.addControl(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$maplibre$2d$gl$2f$dist$2f$maplibre$2d$gl$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScaleControl"]({
                maxWidth: 110,
                unit: 'metric'
            }), 'bottom-right');
            current.addControl(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$maplibre$2d$gl$2f$dist$2f$maplibre$2d$gl$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AttributionControl"]({
                compact: true
            }), 'bottom-left');
            current.on('load', {
                "Explorer.useEffect": ()=>{
                    // Streetscape ground: textured asphalt, landscape and paint sit on the ground; kerbs, props and the wall are extruded later.
                    addTextures(current);
                    // Full-site classifications come from Ashraf's GIS pipeline. They sit below the detailed Zone 1 scene, which keeps Alaa's
                    // textures and interaction while the authoritative GIS geometry decides what is road, parking, landscape, water or plot.
                    current.addSource('site-gis', {
                        type: 'geojson',
                        data: emptyCollection,
                        ...LOCAL_TILES
                    });
                    const gisKind = {
                        "Explorer.useEffect.gisKind": (value)=>[
                                '==',
                                [
                                    'get',
                                    'kind'
                                ],
                                value
                            ]
                    }["Explorer.useEffect.gisKind"];
                    current.addLayer({
                        id: 'gis-plots',
                        type: 'fill',
                        source: 'site-gis',
                        filter: gisKind('plot'),
                        paint: {
                            'fill-color': '#bba88d',
                            'fill-opacity': 0.16
                        }
                    });
                    current.addLayer({
                        id: 'gis-landscape',
                        type: 'fill',
                        source: 'site-gis',
                        filter: gisKind('landscape'),
                        paint: {
                            'fill-pattern': 'tex-grass',
                            'fill-opacity': 0.72
                        }
                    });
                    current.addLayer({
                        id: 'gis-water',
                        type: 'fill',
                        source: 'site-gis',
                        filter: gisKind('water'),
                        paint: {
                            'fill-color': '#4b9fc4',
                            'fill-opacity': 0.84
                        }
                    });
                    current.addLayer({
                        id: 'gis-roads',
                        type: 'fill',
                        source: 'site-gis',
                        filter: gisKind('road'),
                        paint: {
                            'fill-pattern': 'tex-asphalt',
                            'fill-opacity': 0.92
                        }
                    });
                    current.addLayer({
                        id: 'gis-parking',
                        type: 'fill',
                        source: 'site-gis',
                        filter: gisKind('parking'),
                        paint: {
                            'fill-pattern': 'tex-asphalt-worn',
                            'fill-opacity': 0.94
                        }
                    });
                    current.addLayer({
                        id: 'gis-boundary',
                        type: 'line',
                        source: 'site-gis',
                        filter: gisKind('boundary'),
                        paint: {
                            'line-color': '#f0d7aa',
                            'line-width': [
                                'interpolate',
                                [
                                    'linear'
                                ],
                                [
                                    'zoom'
                                ],
                                11,
                                1,
                                17,
                                3
                            ],
                            'line-opacity': 0.9
                        }
                    });
                    // These details are regenerated from Ashraf's exact curb/paint coordinates, then styled with Alaa's material palette.
                    current.addSource('site-details', {
                        type: 'geojson',
                        data: emptyCollection,
                        ...LOCAL_TILES
                    });
                    const detailKind = {
                        "Explorer.useEffect.detailKind": (value)=>[
                                '==',
                                [
                                    'get',
                                    'kind'
                                ],
                                value
                            ]
                    }["Explorer.useEffect.detailKind"];
                    current.addLayer({
                        id: 'gis-road-dashes',
                        type: 'fill',
                        source: 'site-details',
                        minzoom: 13,
                        filter: detailKind('aligned-road-dash'),
                        paint: {
                            'fill-color': '#f1f0e8',
                            'fill-opacity': 0.9
                        }
                    });
                    current.addLayer({
                        id: 'gis-parking-edges',
                        type: 'fill',
                        source: 'site-details',
                        minzoom: 14,
                        filter: detailKind('aligned-parking-edge'),
                        paint: {
                            'fill-color': '#f1f0e8',
                            'fill-opacity': 0.88
                        }
                    });
                    current.addLayer({
                        id: 'gis-parking-bays',
                        type: 'fill',
                        source: 'site-details',
                        minzoom: 14,
                        filter: detailKind('aligned-parking-bay'),
                        paint: {
                            'fill-color': '#f1f0e8',
                            'fill-opacity': [
                                'interpolate',
                                [
                                    'linear'
                                ],
                                [
                                    'zoom'
                                ],
                                14,
                                0.35,
                                17,
                                0.9
                            ]
                        }
                    });
                    current.addLayer({
                        id: 'gis-sidewalk',
                        type: 'fill-extrusion',
                        source: 'site-details',
                        minzoom: 12,
                        filter: detailKind('aligned-walkway'),
                        paint: {
                            'fill-extrusion-pattern': 'tex-paver',
                            'fill-extrusion-base': 0.05,
                            'fill-extrusion-height': 0.2,
                            'fill-extrusion-opacity': 0.96
                        }
                    });
                    current.addLayer({
                        id: 'gis-pavement-outline',
                        type: 'fill-extrusion',
                        source: 'site-details',
                        minzoom: 13,
                        filter: detailKind('aligned-curb-outline'),
                        paint: {
                            'fill-extrusion-color': '#aaa495',
                            'fill-extrusion-base': 0.05,
                            'fill-extrusion-height': 0.19
                        }
                    });
                    current.addLayer({
                        id: 'gis-curb-white',
                        type: 'fill-extrusion',
                        source: 'site-details',
                        minzoom: 14,
                        filter: detailKind('aligned-curb-white'),
                        paint: {
                            'fill-extrusion-color': '#f8f6ee',
                            'fill-extrusion-base': 0.05,
                            'fill-extrusion-height': 0.22
                        }
                    });
                    current.addLayer({
                        id: 'gis-curb-black',
                        type: 'fill-extrusion',
                        source: 'site-details',
                        minzoom: 14,
                        filter: detailKind('aligned-curb-black'),
                        paint: {
                            'fill-extrusion-color': '#151515',
                            'fill-extrusion-base': 0.05,
                            'fill-extrusion-height': 0.22
                        }
                    });
                    current.addSource('streets', {
                        type: 'geojson',
                        data: emptyCollection,
                        ...LOCAL_TILES
                    });
                    current.addSource('street-props', {
                        type: 'geojson',
                        data: emptyCollection,
                        ...LOCAL_TILES
                    });
                    current.addSource('street-shadows', {
                        type: 'geojson',
                        data: emptyCollection,
                        ...LOCAL_TILES
                    });
                    const kind = {
                        "Explorer.useEffect.kind": (value)=>[
                                '==',
                                [
                                    'get',
                                    'kind'
                                ],
                                value
                            ]
                    }["Explorer.useEffect.kind"];
                    current.addLayer({
                        id: 'street-green',
                        type: 'fill',
                        source: 'streets',
                        minzoom: 13,
                        filter: kind('green'),
                        paint: {
                            'fill-pattern': 'tex-grass',
                            'fill-opacity': 0.9
                        }
                    });
                    current.addLayer({
                        id: 'street-path',
                        type: 'fill',
                        source: 'streets',
                        minzoom: 13,
                        filter: kind('path'),
                        paint: {
                            'fill-pattern': 'tex-stone',
                            'fill-opacity': 0.92
                        }
                    });
                    current.addLayer({
                        id: 'street-asphalt',
                        type: 'fill',
                        source: 'streets',
                        minzoom: 12,
                        filter: kind('carriageway'),
                        paint: {
                            'fill-pattern': 'tex-asphalt',
                            'fill-antialias': true
                        }
                    });
                    current.addLayer({
                        id: 'street-parking',
                        type: 'fill',
                        source: 'streets',
                        minzoom: 12,
                        filter: kind('parking'),
                        paint: {
                            'fill-pattern': 'tex-asphalt-worn'
                        }
                    });
                    current.addLayer({
                        id: 'street-kerb-shade',
                        type: 'line',
                        source: 'streets',
                        minzoom: 15,
                        filter: kind('kerb'),
                        paint: {
                            'line-color': '#05080b',
                            'line-opacity': 0.4,
                            'line-width': metres(0.7),
                            'line-blur': metres(0.6)
                        }
                    });
                    current.addLayer({
                        id: 'street-marking',
                        type: 'fill',
                        source: 'streets',
                        minzoom: 14,
                        filter: kind('marking'),
                        paint: {
                            'fill-color': '#f1f0e8',
                            'fill-opacity': [
                                'interpolate',
                                [
                                    'linear'
                                ],
                                [
                                    'zoom'
                                ],
                                14,
                                0.5,
                                17,
                                0.92
                            ]
                        }
                    });
                    current.addLayer({
                        id: 'street-line',
                        type: 'line',
                        source: 'streets',
                        minzoom: 14,
                        filter: kind('line'),
                        layout: {
                            'line-cap': 'butt',
                            'line-join': 'round'
                        },
                        paint: {
                            'line-color': '#f1f0e8',
                            'line-width': metresOf('width'),
                            'line-opacity': [
                                'interpolate',
                                [
                                    'linear'
                                ],
                                [
                                    'zoom'
                                ],
                                14,
                                0.5,
                                17,
                                0.92
                            ]
                        }
                    });
                    current.addLayer({
                        id: 'street-shadows',
                        type: 'fill',
                        source: 'street-shadows',
                        minzoom: 15,
                        paint: {
                            'fill-color': '#070a0e',
                            'fill-opacity': [
                                '*',
                                0.3,
                                [
                                    'get',
                                    'strength'
                                ]
                            ],
                            'fill-antialias': false
                        }
                    });
                    current.addSource('plan-areas', {
                        type: 'geojson',
                        data: emptyCollection,
                        promoteId: 'id',
                        ...LOCAL_TILES
                    });
                    current.addLayer({
                        id: 'plan-green',
                        type: 'fill',
                        source: 'plan-areas',
                        filter: [
                            '==',
                            [
                                'get',
                                'kind'
                            ],
                            'green'
                        ],
                        paint: {
                            'fill-color': '#5c9f6b',
                            'fill-opacity': 0.72,
                            'fill-outline-color': '#a9e2b2'
                        }
                    });
                    current.addLayer({
                        id: 'plan-parking',
                        type: 'fill',
                        source: 'plan-areas',
                        filter: [
                            '==',
                            [
                                'get',
                                'kind'
                            ],
                            'parking'
                        ],
                        paint: {
                            'fill-color': '#3b4552',
                            'fill-opacity': 0.9,
                            'fill-outline-color': '#c9d3de'
                        }
                    });
                    current.addLayer({
                        id: 'plan-marked',
                        type: 'line',
                        source: 'plan-areas',
                        filter: [
                            '==',
                            [
                                'get',
                                'kind'
                            ],
                            'marked'
                        ],
                        paint: {
                            'line-color': '#91a2b9',
                            'line-width': 1.2,
                            'line-dasharray': [
                                3,
                                2
                            ]
                        }
                    });
                    // In 3D the plots read as gardens around the villas; the typology colour moves to the roofs.
                    current.addLayer({
                        id: 'plan-garden',
                        type: 'fill',
                        source: 'plan-areas',
                        filter: [
                            '==',
                            [
                                'get',
                                'kind'
                            ],
                            'plot'
                        ],
                        paint: {
                            'fill-pattern': 'tex-grass',
                            'fill-opacity': 0.85
                        }
                    });
                    current.addLayer({
                        id: 'plan-plot',
                        type: 'fill',
                        source: 'plan-areas',
                        filter: [
                            '==',
                            [
                                'get',
                                'kind'
                            ],
                            'plot'
                        ],
                        paint: {
                            'fill-color': [
                                'case',
                                [
                                    'boolean',
                                    [
                                        'feature-state',
                                        'selected'
                                    ],
                                    false
                                ],
                                '#ffffff',
                                [
                                    'coalesce',
                                    [
                                        'get',
                                        'color'
                                    ],
                                    '#c3ccd6'
                                ]
                            ],
                            'fill-opacity': [
                                'case',
                                [
                                    'boolean',
                                    [
                                        'feature-state',
                                        'hover'
                                    ],
                                    false
                                ],
                                0.97,
                                0.86
                            ]
                        }
                    });
                    current.addSource('villas', {
                        type: 'geojson',
                        data: emptyCollection,
                        promoteId: 'plot',
                        ...LOCAL_TILES
                    });
                    current.addSource('fountain', {
                        type: 'geojson',
                        data: emptyCollection,
                        promoteId: 'id'
                    });
                    current.addSource('fountain-light', {
                        type: 'geojson',
                        data: emptyCollection
                    });
                    current.addSource('villa-shadows', {
                        type: 'geojson',
                        data: emptyCollection,
                        ...LOCAL_TILES
                    });
                    current.addLayer({
                        id: 'villa-shadows',
                        type: 'fill',
                        source: 'villa-shadows',
                        minzoom: 14,
                        paint: {
                            'fill-color': '#070a0e',
                            'fill-opacity': 0.3,
                            'fill-antialias': false
                        }
                    });
                    current.addLayer({
                        id: 'plan-envelope',
                        type: 'fill',
                        source: 'plan-areas',
                        filter: [
                            '==',
                            [
                                'get',
                                'kind'
                            ],
                            'envelope'
                        ],
                        paint: {
                            'fill-color': '#ffffff',
                            'fill-opacity': 0.22
                        }
                    });
                    current.addLayer({
                        id: 'plan-envelope-line',
                        type: 'line',
                        source: 'plan-areas',
                        filter: [
                            '==',
                            [
                                'get',
                                'kind'
                            ],
                            'envelope'
                        ],
                        paint: {
                            'line-color': '#fff9ef',
                            'line-width': [
                                'interpolate',
                                [
                                    'linear'
                                ],
                                [
                                    'zoom'
                                ],
                                15,
                                0.4,
                                19,
                                1.4
                            ],
                            'line-dasharray': [
                                3,
                                2
                            ],
                            'line-opacity': 0.9
                        }
                    });
                    current.addSource('cad-plan', {
                        type: 'geojson',
                        data: emptyCollection,
                        promoteId: 'id',
                        ...LOCAL_TILES
                    });
                    Object.entries(CAD_LAYERS).forEach({
                        "Explorer.useEffect": ([key, config])=>current.addLayer({
                                id: `cad-${key}`,
                                type: 'line',
                                source: 'cad-plan',
                                filter: [
                                    '==',
                                    [
                                        'get',
                                        'category'
                                    ],
                                    key
                                ],
                                layout: {
                                    'line-cap': 'round',
                                    'line-join': 'round'
                                },
                                paint: {
                                    'line-color': [
                                        'case',
                                        [
                                            'boolean',
                                            [
                                                'feature-state',
                                                'selected'
                                            ],
                                            false
                                        ],
                                        '#0a84ff',
                                        config.line
                                    ],
                                    'line-width': [
                                        'interpolate',
                                        [
                                            'linear'
                                        ],
                                        [
                                            'zoom'
                                        ],
                                        12,
                                        key === 'plots' ? 0.3 : 0.7,
                                        16,
                                        key === 'plots' ? 0.9 : 1.6,
                                        19,
                                        key === 'plots' ? 1.8 : 3
                                    ],
                                    'line-opacity': 0.85,
                                    ...key === 'bike' ? {
                                        'line-dasharray': [
                                            2,
                                            1.5
                                        ]
                                    } : {}
                                }
                            })
                    }["Explorer.useEffect"]);
                    // Zoom has to be the outer expression; selection and hover pick the width at each stop.
                    const outline = {
                        "Explorer.useEffect.outline": (base)=>[
                                'case',
                                [
                                    'boolean',
                                    [
                                        'feature-state',
                                        'selected'
                                    ],
                                    false
                                ],
                                3,
                                [
                                    'boolean',
                                    [
                                        'feature-state',
                                        'hover'
                                    ],
                                    false
                                ],
                                2.2,
                                base
                            ]
                    }["Explorer.useEffect.outline"];
                    current.addLayer({
                        id: 'plan-plot-outline',
                        type: 'line',
                        source: 'plan-areas',
                        filter: [
                            '==',
                            [
                                'get',
                                'kind'
                            ],
                            'plot'
                        ],
                        paint: {
                            'line-color': [
                                'case',
                                [
                                    'boolean',
                                    [
                                        'feature-state',
                                        'selected'
                                    ],
                                    false
                                ],
                                '#0a84ff',
                                '#fffaf2'
                            ],
                            'line-width': [
                                'interpolate',
                                [
                                    'linear'
                                ],
                                [
                                    'zoom'
                                ],
                                15,
                                outline(0.6),
                                19,
                                outline(1.6)
                            ]
                        }
                    });
                    current.addLayer({
                        id: 'street-sidewalk',
                        type: 'fill-extrusion',
                        source: 'streets',
                        minzoom: 14,
                        filter: kind('sidewalk'),
                        paint: {
                            'fill-extrusion-pattern': 'tex-paver',
                            'fill-extrusion-height': 0.16
                        }
                    });
                    current.addLayer({
                        id: 'street-island',
                        type: 'fill-extrusion',
                        source: 'streets',
                        minzoom: 14,
                        filter: kind('island'),
                        paint: {
                            'fill-extrusion-pattern': 'tex-grass',
                            'fill-extrusion-height': 0.22
                        }
                    });
                    current.addLayer({
                        id: 'street-kerb',
                        type: 'fill-extrusion',
                        source: 'streets',
                        minzoom: 14,
                        filter: kind('kerb'),
                        paint: {
                            'fill-extrusion-color': '#d8d3c8',
                            'fill-extrusion-height': 0.22
                        }
                    });
                    current.addLayer({
                        id: 'street-wall',
                        type: 'fill-extrusion',
                        source: 'streets',
                        minzoom: 13,
                        filter: kind('wall'),
                        paint: {
                            'fill-extrusion-color': '#e6dccb',
                            'fill-extrusion-height': 2.6
                        }
                    });
                    current.addLayer({
                        id: 'street-props',
                        type: 'fill-extrusion',
                        source: 'street-props',
                        minzoom: 15,
                        filter: [
                            '!',
                            [
                                'has',
                                'glow'
                            ]
                        ],
                        paint: {
                            'fill-extrusion-color': [
                                'get',
                                'color'
                            ],
                            'fill-extrusion-base': [
                                'get',
                                'base'
                            ],
                            'fill-extrusion-height': [
                                'get',
                                'top'
                            ]
                        }
                    });
                    // Neighbourhood context: OpenStreetMap buildings around the site, extruded to their mapped height (6 m when unknown) in a
                    // quiet stone tone so the masterplan stays the focus.
                    current.addLayer({
                        id: 'context-buildings',
                        type: 'fill-extrusion',
                        source: 'street',
                        'source-layer': 'building',
                        minzoom: 14,
                        filter: [
                            '!=',
                            [
                                'get',
                                'hide_3d'
                            ],
                            true
                        ],
                        paint: {
                            'fill-extrusion-color': '#d6cfc2',
                            'fill-extrusion-height': [
                                'coalesce',
                                [
                                    'get',
                                    'render_height'
                                ],
                                6
                            ],
                            'fill-extrusion-base': [
                                'coalesce',
                                [
                                    'get',
                                    'render_min_height'
                                ],
                                0
                            ],
                            'fill-extrusion-opacity': [
                                'interpolate',
                                [
                                    'linear'
                                ],
                                [
                                    'zoom'
                                ],
                                14,
                                0,
                                15,
                                0.9
                            ]
                        }
                    });
                    // Stacked storeys share faces, so the per-extrusion vertical gradient is off; the selected plot's homes turn blue.
                    current.addLayer({
                        id: 'villas',
                        type: 'fill-extrusion',
                        source: 'villas',
                        minzoom: 14,
                        filter: [
                            '!',
                            [
                                'has',
                                'lit'
                            ]
                        ],
                        paint: {
                            'fill-extrusion-color': [
                                'case',
                                [
                                    'boolean',
                                    [
                                        'feature-state',
                                        'selected'
                                    ],
                                    false
                                ],
                                [
                                    'match',
                                    [
                                        'get',
                                        'color'
                                    ],
                                    GLASS,
                                    '#1f4a7a',
                                    '#d3e4fb'
                                ],
                                [
                                    'get',
                                    'color'
                                ]
                            ],
                            'fill-extrusion-base': [
                                'get',
                                'base'
                            ],
                            'fill-extrusion-height': [
                                'get',
                                'top'
                            ],
                            'fill-extrusion-vertical-gradient': false
                        }
                    });
                    // Night: one shade over the ground and everything standing on it, drawn after the extrusions; lamps, light pools and lit
                    // windows come after it so they stay bright. Colours and opacities follow the time of day (see the sun effect).
                    const [hx, hy] = [
                        defaults.lng,
                        defaults.lat
                    ];
                    current.addSource('night', {
                        type: 'geojson',
                        data: {
                            type: 'Feature',
                            properties: {},
                            geometry: {
                                type: 'Polygon',
                                coordinates: [
                                    [
                                        [
                                            hx - 0.6,
                                            hy - 0.6
                                        ],
                                        [
                                            hx + 0.6,
                                            hy - 0.6
                                        ],
                                        [
                                            hx + 0.6,
                                            hy + 0.6
                                        ],
                                        [
                                            hx - 0.6,
                                            hy + 0.6
                                        ],
                                        [
                                            hx - 0.6,
                                            hy - 0.6
                                        ]
                                    ]
                                ]
                            }
                        }
                    });
                    current.addLayer({
                        id: 'night-shade',
                        type: 'fill',
                        source: 'night',
                        paint: {
                            'fill-color': '#0a1430',
                            'fill-opacity': 0,
                            'fill-antialias': false
                        }
                    });
                    current.addLayer({
                        id: 'street-glow',
                        type: 'circle',
                        source: 'streets',
                        minzoom: 14,
                        filter: kind('light'),
                        paint: {
                            'circle-pitch-alignment': 'map',
                            'circle-radius': metres(11),
                            'circle-blur': 1,
                            'circle-color': '#ffcf87',
                            'circle-opacity': 0
                        }
                    });
                    current.addLayer({
                        id: 'street-lamps',
                        type: 'fill-extrusion',
                        source: 'street-props',
                        minzoom: 15,
                        filter: [
                            'has',
                            'glow'
                        ],
                        paint: {
                            'fill-extrusion-color': '#f7f2dd',
                            'fill-extrusion-base': [
                                'get',
                                'base'
                            ],
                            'fill-extrusion-height': [
                                'get',
                                'top'
                            ]
                        }
                    });
                    current.addLayer({
                        id: 'fountain-glow',
                        type: 'circle',
                        source: 'fountain-light',
                        minzoom: 15,
                        paint: {
                            'circle-pitch-alignment': 'map',
                            'circle-radius': metres(10),
                            'circle-blur': 1,
                            'circle-color': '#7fdcff',
                            'circle-opacity': 0
                        }
                    });
                    current.addLayer({
                        id: 'fountain',
                        type: 'fill-extrusion',
                        source: 'fountain',
                        minzoom: 15,
                        paint: {
                            'fill-extrusion-color': [
                                'get',
                                'color'
                            ],
                            'fill-extrusion-base': [
                                'get',
                                'base'
                            ],
                            'fill-extrusion-height': [
                                'case',
                                [
                                    'has',
                                    'jet'
                                ],
                                [
                                    '+',
                                    [
                                        'get',
                                        'base'
                                    ],
                                    [
                                        '*',
                                        [
                                            '-',
                                            [
                                                'get',
                                                'top'
                                            ],
                                            [
                                                'get',
                                                'base'
                                            ]
                                        ],
                                        [
                                            'coalesce',
                                            [
                                                'feature-state',
                                                'rise'
                                            ],
                                            1
                                        ]
                                    ]
                                ],
                                [
                                    'get',
                                    'top'
                                ]
                            ],
                            'fill-extrusion-opacity': 0.88,
                            'fill-extrusion-vertical-gradient': false
                        }
                    });
                    current.addLayer({
                        id: 'villa-windows',
                        type: 'fill-extrusion',
                        source: 'villas',
                        minzoom: 14,
                        filter: [
                            'has',
                            'lit'
                        ],
                        paint: {
                            'fill-extrusion-color': GLASS,
                            'fill-extrusion-base': [
                                'get',
                                'base'
                            ],
                            'fill-extrusion-height': [
                                'get',
                                'top'
                            ],
                            'fill-extrusion-vertical-gradient': false
                        }
                    });
                    current.addSource('plan-labels', {
                        type: 'geojson',
                        data: emptyCollection,
                        promoteId: 'id',
                        maxzoom: 16
                    });
                    const halo = {
                        'text-halo-color': '#0d1218',
                        'text-halo-width': 1.4,
                        'text-halo-blur': 0.4
                    };
                    current.addLayer({
                        id: 'label-zone',
                        type: 'symbol',
                        source: 'plan-labels',
                        filter: [
                            '==',
                            [
                                'get',
                                'kind'
                            ],
                            'zone'
                        ],
                        minzoom: 14.5,
                        layout: {
                            'text-field': [
                                'get',
                                'title'
                            ],
                            'text-font': FONT.medium,
                            'text-size': [
                                'interpolate',
                                [
                                    'linear'
                                ],
                                [
                                    'zoom'
                                ],
                                15,
                                11,
                                18,
                                15
                            ],
                            'text-line-height': 1.4,
                            'text-max-width': 14,
                            'text-letter-spacing': 0.04
                        },
                        paint: {
                            'text-color': '#f1e2c2',
                            ...halo,
                            'text-halo-width': 1.6,
                            'text-halo-blur': 0.8
                        }
                    });
                    current.addLayer({
                        id: 'label-road',
                        type: 'symbol',
                        source: 'plan-labels',
                        filter: [
                            '==',
                            [
                                'get',
                                'kind'
                            ],
                            'road'
                        ],
                        minzoom: 16.3,
                        layout: {
                            'text-field': [
                                'get',
                                'title'
                            ],
                            'text-font': FONT.regular,
                            'text-size': [
                                'interpolate',
                                [
                                    'linear'
                                ],
                                [
                                    'zoom'
                                ],
                                16.3,
                                9,
                                19,
                                13
                            ],
                            'text-rotate': [
                                'get',
                                'rotate'
                            ],
                            'text-rotation-alignment': 'map',
                            'text-letter-spacing': 0.06
                        },
                        paint: {
                            'text-color': '#e7eef6',
                            ...halo
                        }
                    });
                    current.addLayer({
                        id: 'label-name',
                        type: 'symbol',
                        source: 'plan-labels',
                        filter: [
                            '==',
                            [
                                'get',
                                'kind'
                            ],
                            'name'
                        ],
                        minzoom: 15.8,
                        layout: {
                            'text-field': [
                                'get',
                                'title'
                            ],
                            'text-font': FONT.italic,
                            'text-size': [
                                'interpolate',
                                [
                                    'linear'
                                ],
                                [
                                    'zoom'
                                ],
                                16,
                                10,
                                19,
                                14
                            ],
                            'text-rotate': [
                                'get',
                                'rotate'
                            ],
                            'text-rotation-alignment': 'map'
                        },
                        paint: {
                            'text-color': '#ffe2a6',
                            ...halo
                        }
                    });
                    current.addLayer({
                        id: 'label-plot',
                        type: 'symbol',
                        source: 'plan-labels',
                        filter: [
                            '==',
                            [
                                'get',
                                'kind'
                            ],
                            'plot'
                        ],
                        minzoom: 16,
                        layout: {
                            'text-field': [
                                'get',
                                'title'
                            ],
                            'text-font': FONT.medium,
                            'text-size': [
                                'interpolate',
                                [
                                    'linear'
                                ],
                                [
                                    'zoom'
                                ],
                                16,
                                9,
                                17.5,
                                12,
                                19,
                                16
                            ],
                            'text-allow-overlap': true
                        },
                        paint: {
                            'text-color': '#1f262e',
                            'text-halo-color': '#fffaf2',
                            'text-halo-width': 1
                        }
                    });
                    current.addLayer({
                        id: 'label-unit',
                        type: 'symbol',
                        source: 'plan-labels',
                        filter: [
                            '==',
                            [
                                'get',
                                'kind'
                            ],
                            'unit'
                        ],
                        minzoom: 18.2,
                        layout: {
                            'text-field': [
                                'get',
                                'title'
                            ],
                            'text-font': FONT.regular,
                            'text-size': [
                                'interpolate',
                                [
                                    'linear'
                                ],
                                [
                                    'zoom'
                                ],
                                18.2,
                                9,
                                20,
                                13
                            ]
                        },
                        paint: {
                            'text-color': '#4a3a2a',
                            'text-halo-color': '#fff6e8',
                            'text-halo-width': 0.8
                        }
                    });
                    current.addLayer({
                        id: 'label-dimension',
                        type: 'symbol',
                        source: 'plan-labels',
                        filter: [
                            '==',
                            [
                                'get',
                                'kind'
                            ],
                            'dimension'
                        ],
                        minzoom: 17.8,
                        layout: {
                            'text-field': [
                                'get',
                                'title'
                            ],
                            'text-font': FONT.regular,
                            'text-size': 10,
                            'text-rotate': [
                                'get',
                                'rotate'
                            ],
                            'text-rotation-alignment': 'map'
                        },
                        paint: {
                            'text-color': '#b9c7d8',
                            ...halo
                        }
                    });
                    current.addLayer({
                        id: 'label-survey',
                        type: 'symbol',
                        source: 'plan-labels',
                        filter: [
                            '==',
                            [
                                'get',
                                'kind'
                            ],
                            'survey'
                        ],
                        minzoom: 16.5,
                        layout: {
                            'text-field': [
                                'get',
                                'title'
                            ],
                            'text-font': FONT.regular,
                            'text-size': 10,
                            'text-offset': [
                                0,
                                0.9
                            ]
                        },
                        paint: {
                            'text-color': '#b9c7d8',
                            ...halo
                        }
                    });
                    current.addSource('amenities', {
                        type: 'geojson',
                        data: emptyCollection
                    });
                    current.addLayer({
                        id: 'amenity-circles',
                        type: 'circle',
                        source: 'amenities',
                        paint: {
                            'circle-radius': [
                                'interpolate',
                                [
                                    'linear'
                                ],
                                [
                                    'zoom'
                                ],
                                11,
                                4,
                                16,
                                8
                            ],
                            'circle-color': [
                                'match',
                                [
                                    'get',
                                    'category'
                                ],
                                'food',
                                '#ffb86b',
                                'shopping',
                                '#e7a4ff',
                                'health',
                                '#ff8c9c',
                                'education',
                                '#87d8ff',
                                'services',
                                '#9ee2a3',
                                '#d6e2f0'
                            ],
                            'circle-stroke-color': '#111820',
                            'circle-stroke-width': 2,
                            'circle-opacity': 0.94
                        }
                    });
                    // A villa stands for its plot: hover and click resolve it to the plot area.
                    const plotHit = {
                        "Explorer.useEffect.plotHit": (hit)=>{
                            const feature = hit.find({
                                "Explorer.useEffect.plotHit.feature": (item)=>item.layer.id === 'villas' || item.layer.id === 'plan-plot'
                            }["Explorer.useEffect.plotHit.feature"]);
                            if (!feature) return null;
                            return feature.layer.id === 'villas' ? planRef.current?.areas?.find({
                                "Explorer.useEffect.plotHit": (area)=>area.kind === 'plot' && area.plot === String(feature.properties?.plot)
                            }["Explorer.useEffect.plotHit"])?.id ?? null : String(feature.properties?.id);
                        }
                    }["Explorer.useEffect.plotHit"];
                    const setHover = {
                        "Explorer.useEffect.setHover": (id)=>{
                            if (hoverPlotRef.current) current.setFeatureState({
                                source: 'plan-areas',
                                id: hoverPlotRef.current
                            }, {
                                hover: false
                            });
                            if (id) current.setFeatureState({
                                source: 'plan-areas',
                                id
                            }, {
                                hover: true
                            });
                            hoverPlotRef.current = id;
                        }
                    }["Explorer.useEffect.setHover"];
                    // Hover hit-testing runs at most once per frame and is skipped while the camera is moving.
                    let hoverPoint = null, hoverFrame = 0;
                    current.on('mousemove', {
                        "Explorer.useEffect": (event)=>{
                            hoverPoint = event.point;
                            if (hoverFrame || current.isMoving()) return;
                            hoverFrame = requestAnimationFrame({
                                "Explorer.useEffect": ()=>{
                                    hoverFrame = 0;
                                    if (!hoverPoint || current.isMoving()) return;
                                    const hit = current.queryRenderedFeatures(hoverPoint, {
                                        layers: [
                                            'amenity-circles',
                                            'villas',
                                            'plan-plot',
                                            ...cadLayerIds
                                        ]
                                    });
                                    setHover(plotHit(hit));
                                    current.getCanvas().style.cursor = hit.length ? 'pointer' : '';
                                }
                            }["Explorer.useEffect"]);
                        }
                    }["Explorer.useEffect"]);
                    current.on('mouseout', {
                        "Explorer.useEffect": ()=>{
                            hoverPoint = null;
                            setHover(null);
                        }
                    }["Explorer.useEffect"]);
                    current.on('click', {
                        "Explorer.useEffect": (event)=>{
                            const hit = current.queryRenderedFeatures(event.point, {
                                layers: [
                                    'amenity-circles',
                                    'villas',
                                    'plan-plot',
                                    ...cadLayerIds
                                ]
                            }), amenity = hit.find({
                                "Explorer.useEffect.amenity": (feature)=>feature.layer.id === 'amenity-circles'
                            }["Explorer.useEffect.amenity"]);
                            if (amenity) {
                                const place = placesRef.current.find({
                                    "Explorer.useEffect.place": (item)=>item.id === String(amenity.properties?.id)
                                }["Explorer.useEffect.place"]);
                                if (place) {
                                    setSelectedPlace(place);
                                    setSelectedCad(null);
                                    setSelectedPlot(null);
                                }
                                return;
                            }
                            const plotId = plotHit(hit);
                            if (plotId) {
                                const area = planRef.current?.areas?.find({
                                    "Explorer.useEffect": (item)=>item.id === plotId
                                }["Explorer.useEffect"]);
                                if (area) {
                                    setSelectedPlot(area);
                                    setSelectedCad(null);
                                    setSelectedPlace(null);
                                }
                                return;
                            }
                            const cad = hit.find({
                                "Explorer.useEffect.cad": (feature)=>feature.layer.id.startsWith('cad-')
                            }["Explorer.useEffect.cad"]);
                            if (cad) {
                                const key = String(cad.properties?.category);
                                setSelectedCad({
                                    id: String(cad.properties?.id),
                                    layer: String(cad.properties?.layer),
                                    category: key
                                });
                                setSelectedPlace(null);
                                setSelectedPlot(null);
                            }
                        }
                    }["Explorer.useEffect"]);
                    setReady(current);
                }
            }["Explorer.useEffect"]);
            current.on('error', {
                "Explorer.useEffect": (event)=>{
                    const source = event.sourceId;
                    console.warn('[map]', source || '', event.error?.message || event.error);
                    if (source === 'satellite' || source === 'street') setTileError(true);
                }
            }["Explorer.useEffect"]);
            try {
                const saved = JSON.parse(localStorage.getItem(ALIGNMENT_STORAGE) || 'null');
                if (saved && [
                    'lat',
                    'lng',
                    'width',
                    'angle'
                ].every({
                    "Explorer.useEffect": (key)=>Number.isFinite(saved[key])
                }["Explorer.useEffect"]) && saved.width > 0) setPlacement(saved);
            } catch  {}
            fetch('/data/plan.json').then({
                "Explorer.useEffect": (result)=>{
                    if (!result.ok) throw Error();
                    return result.json();
                }
            }["Explorer.useEffect"]).then(setPlan).catch({
                "Explorer.useEffect": ()=>setPlanError(true)
            }["Explorer.useEffect"]);
            fetch('/data/site-gis.json').then({
                "Explorer.useEffect": (result)=>{
                    if (!result.ok) throw Error();
                    return result.json();
                }
            }["Explorer.useEffect"]).then(setSiteGis).catch({
                "Explorer.useEffect": ()=>console.warn('[map] full-site GIS unavailable')
            }["Explorer.useEffect"]);
            fetch('/data/site-details.json').then({
                "Explorer.useEffect": (result)=>{
                    if (!result.ok) throw Error();
                    return result.json();
                }
            }["Explorer.useEffect"]).then(setSiteDetails).catch({
                "Explorer.useEffect": ()=>console.warn('[map] aligned site details unavailable')
            }["Explorer.useEffect"]);
            fetch('/data/aligned-cars.json').then({
                "Explorer.useEffect": (result)=>{
                    if (!result.ok) throw Error();
                    return result.json();
                }
            }["Explorer.useEffect"]).then(setAlignedCars).catch({
                "Explorer.useEffect": ()=>console.warn('[map] aligned cars unavailable')
            }["Explorer.useEffect"]);
            fetch('/data/aligned-lamps.json').then({
                "Explorer.useEffect": (result)=>{
                    if (!result.ok) throw Error();
                    return result.json();
                }
            }["Explorer.useEffect"]).then(setAlignedLamps).catch({
                "Explorer.useEffect": ()=>console.warn('[map] aligned lamps unavailable')
            }["Explorer.useEffect"]);
            fetch('/data/streets.json').then({
                "Explorer.useEffect": (result)=>{
                    if (!result.ok) throw Error();
                    return result.json();
                }
            }["Explorer.useEffect"]).then(setStreets).catch({
                "Explorer.useEffect": ()=>console.warn('[map] streets unavailable')
            }["Explorer.useEffect"]);
            current.on('pitchend', {
                "Explorer.useEffect": ()=>setTilted(current.getPitch() > 10)
            }["Explorer.useEffect"]);
            fetch('/data/villas.json').then({
                "Explorer.useEffect": (result)=>{
                    if (!result.ok) throw Error();
                    return result.json();
                }
            }["Explorer.useEffect"]).then(setVillas).catch({
                "Explorer.useEffect": ()=>console.warn('[map] villas unavailable')
            }["Explorer.useEffect"]);
            current.on('movestart', {
                "Explorer.useEffect": (event)=>{
                    if (event.originalEvent) framedRef.current = true;
                }
            }["Explorer.useEffect"]);
            // Any touch, click or wheel on the map ends a tour. Listening in the capture phase on the wrapper runs before MapLibre's own
            // handlers, so the tour's camera stops first and the visitor's gesture then proceeds; mid-flight wheels fire no movestart.
            const interrupt = {
                "Explorer.useEffect.interrupt": ()=>stopTourRef.current()
            }["Explorer.useEffect.interrupt"];
            [
                'pointerdown',
                'wheel',
                'touchstart'
            ].forEach({
                "Explorer.useEffect": (type)=>el.current?.addEventListener(type, interrupt, {
                        capture: true,
                        passive: true
                    })
            }["Explorer.useEffect"]);
            const wrapper = el.current;
            return ({
                "Explorer.useEffect": ()=>{
                    [
                        'pointerdown',
                        'wheel',
                        'touchstart'
                    ].forEach({
                        "Explorer.useEffect": (type)=>wrapper?.removeEventListener(type, interrupt, {
                                capture: true
                            })
                    }["Explorer.useEffect"]);
                    alignmentHandle.current?.remove();
                    current.remove();
                    map.current = null;
                    framedRef.current = false;
                    setReady(null);
                }
            })["Explorer.useEffect"];
        }
    }["Explorer.useEffect"], []);
    async function loadPlaces() {
        setStatus('loading');
        try {
            const cached = await fetch('/data/amenities.json');
            if (cached.ok) {
                const data = await cached.json();
                if (data.length) {
                    setPlaces(data);
                    setStatus('snapshot');
                    return;
                }
            }
        } catch  {}
        const overpass = '[out:json][timeout:25];(nwr[amenity~"restaurant|cafe|fast_food|hospital|pharmacy|clinic|school|university|fuel|bank|atm"](around:10000,30.0989057,30.8716454);nwr[shop~"supermarket|mall|convenience"](around:10000,30.0989057,30.8716454););out center tags;';
        for (const host of [
            'https://overpass-api.de/api/interpreter',
            'https://overpass.kumi.systems/api/interpreter'
        ]){
            try {
                const response = await fetch(host + '?data=' + encodeURIComponent(overpass), {
                    signal: AbortSignal.timeout(30000)
                });
                if (!response.ok) throw Error();
                const data = await response.json();
                setPlaces(normalize(data.elements));
                setStatus('loaded');
                return;
            } catch  {}
        }
        setStatus('error');
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Explorer.useEffect": ()=>{
            void loadPlaces();
        }
    }["Explorer.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Explorer.useEffect": ()=>{
            const current = map.current;
            if (!current || ready !== current || !plan) return;
            current.getSource('cad-plan')?.setData(planCollection(plan, placement));
            current.getSource('plan-areas')?.setData(areaCollection(plan, placement));
            current.getSource('plan-labels')?.setData(labelCollection(plan, placement));
        }
    }["Explorer.useEffect"], [
        ready,
        plan,
        placement
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Explorer.useEffect": ()=>{
            const current = map.current;
            if (!current || ready !== current || !siteGis) return;
            current.getSource('site-gis')?.setData(siteGis);
        }
    }["Explorer.useEffect"], [
        ready,
        siteGis
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Explorer.useEffect": ()=>{
            const current = map.current;
            if (!current || ready !== current || !siteDetails) return;
            current.getSource('site-details')?.setData(siteDetails);
        }
    }["Explorer.useEffect"], [
        ready,
        siteDetails
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Explorer.useEffect": ()=>{
            const current = map.current;
            if (!current || ready !== current || !streets) return;
            current.getSource('streets')?.setData(streets);
        }
    }["Explorer.useEffect"], [
        ready,
        streets
    ]);
    // Trees come from the landscape DWG, so they follow the CAD placement; lights and cars are already in WGS 84.
    // Solids only move with the placement; shadows also follow the sun. Below the horizon nothing casts one.
    const shadowSun = stepSun.altitude > -6 ? stepSun : null;
    // Garden trees from the villa generator join the landscape-plan trees (same plan frame, same drawing).
    const scene = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Explorer.useMemo[scene]": ()=>{
            if (!streets) return null;
            const combined = compareMode === 'combined';
            let features = streets.features;
            if (combined && alignedCars) features = [
                ...features.filter({
                    "Explorer.useMemo[scene]": (feature)=>feature.properties?.kind !== 'car'
                }["Explorer.useMemo[scene]"]),
                ...alignedCars.features
            ];
            if (combined && alignedLamps) features = [
                ...features.filter({
                    "Explorer.useMemo[scene]": (feature)=>feature.properties?.kind !== 'light'
                }["Explorer.useMemo[scene]"]),
                ...alignedLamps.features
            ];
            return {
                ...streets,
                features,
                trees: villas?.trees ? [
                    ...streets.trees || [],
                    ...villas.trees
                ] : streets.trees
            };
        }
    }["Explorer.useMemo[scene]"], [
        streets,
        villas,
        compareMode,
        alignedCars,
        alignedLamps
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Explorer.useEffect": ()=>{
            const current = map.current;
            if (!current || ready !== current || !scene) return;
            current.getSource('street-props')?.setData(streetProps(scene, plan, placement, stepSun, 'solids').solids);
        }
    }["Explorer.useEffect"], [
        ready,
        scene,
        plan,
        placement
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Explorer.useEffect": ()=>{
            const current = map.current;
            if (!current || ready !== current || !scene || !shadowSun) return;
            current.getSource('street-shadows')?.setData(streetProps(scene, plan, placement, shadowSun, 'shadows').shadows);
        }
    }["Explorer.useEffect"], [
        ready,
        scene,
        plan,
        placement,
        shadowSun
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Explorer.useEffect": ()=>{
            const current = map.current;
            if (!current || ready !== current || !villas || !plan) return;
            const { homes, fountain } = villaSolids(villas, plan, placement);
            current.getSource('villas')?.setData(homes);
            current.getSource('fountain')?.setData(fountain);
            const at = villas.landmarks?.fountain;
            current.getSource('fountain-light')?.setData(at ? {
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'Point',
                    coordinates: projector(plan, placement)(at)
                }
            } : emptyCollection);
        }
    }["Explorer.useEffect"], [
        ready,
        villas,
        plan,
        placement
    ]);
    // Fountain jets rise and fall (two phases), only while the fountain is on screen close up; reduced motion keeps them still.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Explorer.useEffect": ()=>{
            const current = map.current;
            if (!current || ready !== current || !villas?.landmarks?.fountain || !plan || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            const at = projector(plan, placement)(villas.landmarks.fountain), jets = villas.parts.map({
                "Explorer.useEffect.jets": ([plot], index)=>plot === 'fountain-jet' ? `fountain-${index}` : null
            }["Explorer.useEffect.jets"]).filter({
                "Explorer.useEffect.jets": (id)=>!!id
            }["Explorer.useEffect.jets"]);
            let frame = 0, last = 0;
            const tick = {
                "Explorer.useEffect.tick": (now)=>{
                    frame = requestAnimationFrame(tick);
                    if (now - last < 45 || document.hidden || current.getZoom() < 16 || !current.getBounds().contains(at) || current.getLayoutProperty('fountain', 'visibility') === 'none') return;
                    last = now;
                    const t = now / 1000;
                    jets.forEach({
                        "Explorer.useEffect.tick": (id, index)=>current.setFeatureState({
                                source: 'fountain',
                                id
                            }, {
                                rise: index === 0 ? 0.84 + 0.16 * Math.sin(t * 2.4) : 0.7 + 0.3 * Math.sin(t * 3.1 + index % 2 * Math.PI)
                            })
                    }["Explorer.useEffect.tick"]);
                }
            }["Explorer.useEffect.tick"];
            frame = requestAnimationFrame(tick);
            return ({
                "Explorer.useEffect": ()=>cancelAnimationFrame(frame)
            })["Explorer.useEffect"];
        }
    }["Explorer.useEffect"], [
        ready,
        villas,
        plan,
        placement
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Explorer.useEffect": ()=>{
            const current = map.current;
            if (!current || ready !== current || !villas || !plan || !shadowSun) return;
            current.getSource('villa-shadows')?.setData(villaShadows(villas, plan, placement, shadowSun));
        }
    }["Explorer.useEffect"], [
        ready,
        villas,
        plan,
        placement,
        shadowSun
    ]);
    // Light, sky, imagery grading, night shade and glows for the time of day. Paint changes only, so the slider stays fluid.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Explorer.useEffect": ()=>{
            const current = map.current;
            if (!current || ready !== current) return;
            const day = daylight(sun), gold = golden(sun) * day, night = 1 - day;
            current.setLight({
                anchor: 'map',
                position: [
                    1.5,
                    sun.azimuth,
                    Math.min(Math.max(sun.polar, 0), 88)
                ],
                color: mix(mix('#7d93c9', '#fff4e4', day), '#ffb169', gold),
                intensity: 0.16 + 0.26 * day + 0.1 * gold
            });
            const base = SKY[view], sky = {
                ...base
            };
            [
                'sky-color',
                'horizon-color',
                'fog-color'
            ].forEach({
                "Explorer.useEffect": (key)=>sky[key] = mix(SKY_NIGHT[key], mix(base[key], SKY_DUSK[key], gold), day)
            }["Explorer.useEffect"]);
            current.setSky(sky);
            current.setPaintProperty('base-satellite', 'raster-brightness-max', 0.26 + 0.5 * day);
            current.setPaintProperty('base-satellite', 'raster-saturation', -0.35 - 0.35 * night);
            current.setPaintProperty('night-shade', 'fill-color', night > gold ? '#0a1430' : '#ff8a3d');
            current.setPaintProperty('night-shade', 'fill-opacity', night > gold ? 0.58 * night : 0.1 * gold);
            current.setPaintProperty('street-shadows', 'fill-opacity', [
                '*',
                0.3 * day,
                [
                    'get',
                    'strength'
                ]
            ]);
            current.setPaintProperty('villa-shadows', 'fill-opacity', 0.3 * day);
            current.setPaintProperty('street-glow', 'circle-opacity', 0.62 * smooth(0.25, 0.9, night));
            current.setPaintProperty('street-lamps', 'fill-extrusion-color', mix('#f7f2dd', '#fff6d0', night));
            current.setPaintProperty('fountain', 'fill-extrusion-color', [
                'match',
                [
                    'get',
                    'color'
                ],
                FOUNTAIN_WATER,
                mix(FOUNTAIN_WATER, '#5fe2ff', night),
                mix('#dff5fc', '#f4fdff', night)
            ]);
            current.setPaintProperty('fountain-glow', 'circle-opacity', 0.5 * smooth(0.25, 0.9, night));
            current.setPaintProperty('villa-windows', 'fill-extrusion-color', [
                'case',
                [
                    'boolean',
                    [
                        'feature-state',
                        'selected'
                    ],
                    false
                ],
                '#1f4a7a',
                mix(GLASS, '#ffc46e', smooth(0.2, 0.85, night))
            ]);
        }
    }["Explorer.useEffect"], [
        ready,
        sun,
        view
    ]);
    // Time-lapse: the rest of the day plays out in about 15 s (restarting at dawn after dusk); a drag on the slider stops it.
    const hourRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(hour);
    hourRef.current = hour;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Explorer.useEffect": ()=>{
            if (!timelapse) return;
            let frame = 0, last = performance.now(), value = hourRef.current >= 21 ? 5.5 : hourRef.current;
            const step = {
                "Explorer.useEffect.step": (now)=>{
                    value = Math.min(21.5, value + (now - last) / 1000 * 1.1);
                    last = now;
                    setHour(value);
                    if (value >= 21.5) setTimelapse(false);
                    else frame = requestAnimationFrame(step);
                }
            }["Explorer.useEffect.step"];
            frame = requestAnimationFrame(step);
            return ({
                "Explorer.useEffect": ()=>cancelAnimationFrame(frame)
            })["Explorer.useEffect"];
        }
    }["Explorer.useEffect"], [
        timelapse
    ]);
    // Open framed on Zone 1 once the drawing has arrived: a short tilted fly-in that settles on the flat plan (skipped for reduced motion,
    // and never once the visitor has moved the camera, which sets framedRef first).
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Explorer.useEffect": ()=>{
            const current = map.current;
            if (!current || ready !== current || !plan || framedRef.current) return;
            const bounds = zoneBounds(plan, placementRef.current);
            if (!bounds) return;
            framedRef.current = true;
            const camera = current.cameraForBounds(bounds, {
                padding: framePadding(),
                maxZoom: 17.2
            });
            if (!camera) return;
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                current.jumpTo(camera);
                return;
            }
            current.jumpTo({
                center: camera.center,
                zoom: (camera.zoom ?? 15) - 1.3,
                bearing: -30,
                pitch: 50
            });
            current.flyTo({
                ...camera,
                bearing: 0,
                pitch: 0,
                duration: 3400,
                curve: 1.1,
                essential: true
            });
        }
    }["Explorer.useEffect"], [
        ready,
        plan
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Explorer.useEffect": ()=>{
            const current = map.current;
            if (!current || ready !== current) return;
            current.getSource('amenities')?.setData(placesCollection(visible));
        }
    }["Explorer.useEffect"], [
        ready,
        visible
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Explorer.useEffect": ()=>{
            const current = map.current;
            if (!current || ready !== current) return;
            current.setLayoutProperty('base-satellite', 'visibility', view === 'satellite' ? 'visible' : 'none');
            STREET_BASE.forEach({
                "Explorer.useEffect": (layer)=>current.setLayoutProperty(layer.id, 'visibility', view === 'street' ? 'visible' : 'none')
            }["Explorer.useEffect"]);
            setTileError(false);
        }
    }["Explorer.useEffect"], [
        ready,
        view
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Explorer.useEffect": ()=>{
            const current = map.current;
            if (!current || ready !== current) return;
            const presentationVisible = compareMode !== 'gis', gisVisible = compareMode !== 'presentation' && showSiteGis, on = {
                "Explorer.useEffect.on": (group)=>presentationVisible && showPlan && activeLayers[group]
            }["Explorer.useEffect.on"];
            Object.keys(CAD_LAYERS).forEach({
                "Explorer.useEffect": (key)=>{
                    const layer = key;
                    current.setLayoutProperty(`cad-${layer}`, 'visibility', visibility(on(layer) && !(layer === 'roads' && streets3d)));
                    current.setPaintProperty(`cad-${layer}`, 'line-opacity', opacity * (layer === 'plots' ? 0.55 : 0.85));
                }
            }["Explorer.useEffect"]);
            [
                [
                    'plan-green',
                    'greens',
                    0.72
                ],
                [
                    'plan-parking',
                    'roads',
                    0.9
                ],
                [
                    'plan-plot',
                    'plots',
                    0.86
                ],
                [
                    'plan-envelope',
                    'plots',
                    0.22
                ]
            ].forEach({
                "Explorer.useEffect": ([id, group, base])=>{
                    current.setLayoutProperty(id, 'visibility', visibility(on(group) && !(streets3d && (id === 'plan-parking' || id === 'plan-envelope'))));
                    current.setPaintProperty(id, 'fill-opacity', id === 'plan-plot' ? streets3d ? [
                        'case',
                        [
                            'boolean',
                            [
                                'feature-state',
                                'selected'
                            ],
                            false
                        ],
                        0.45,
                        [
                            'boolean',
                            [
                                'feature-state',
                                'hover'
                            ],
                            false
                        ],
                        0.3,
                        0
                    ] : [
                        'case',
                        [
                            'boolean',
                            [
                                'feature-state',
                                'hover'
                            ],
                            false
                        ],
                        Math.min(1, opacity + 0.12),
                        base * opacity
                    ] : base * opacity);
                }
            }["Explorer.useEffect"]);
            VILLA_LAYERS.forEach({
                "Explorer.useEffect": (id)=>current.setLayoutProperty(id, 'visibility', visibility(presentationVisible && streets3d && on('plots')))
            }["Explorer.useEffect"]);
            current.setLayoutProperty('plan-envelope-line', 'visibility', visibility(on('plots') && !streets3d));
            [
                [
                    'plan-plot-outline',
                    'plots'
                ],
                [
                    'plan-marked',
                    'technical'
                ],
                [
                    'label-plot',
                    'plots'
                ],
                [
                    'label-unit',
                    'plots'
                ],
                [
                    'label-zone',
                    'plots'
                ],
                [
                    'label-road',
                    'roads'
                ],
                [
                    'label-name',
                    'perimeter'
                ],
                [
                    'label-dimension',
                    'technical'
                ],
                [
                    'label-survey',
                    'technical'
                ]
            ].forEach({
                "Explorer.useEffect": ([id, group])=>current.setLayoutProperty(id, 'visibility', visibility(on(group)))
            }["Explorer.useEffect"]);
            GIS_LAYERS.forEach({
                "Explorer.useEffect": (id)=>current.setLayoutProperty(id, 'visibility', visibility(gisVisible))
            }["Explorer.useEffect"]);
            ALIGNED_DETAIL_LAYERS.forEach({
                "Explorer.useEffect": (id)=>current.setLayoutProperty(id, 'visibility', visibility(compareMode === 'combined' && showSiteGis && streets3d))
            }["Explorer.useEffect"]);
            STREET_LAYERS.forEach({
                "Explorer.useEffect": (id)=>current.setLayoutProperty(id, 'visibility', visibility(presentationVisible && streets3d))
            }["Explorer.useEffect"]);
            if (compareMode === 'combined') PRESENTATION_GROUND_LAYERS.forEach({
                "Explorer.useEffect": (id)=>current.setLayoutProperty(id, 'visibility', 'none')
            }["Explorer.useEffect"]);
        }
    }["Explorer.useEffect"], [
        ready,
        compareMode,
        showPlan,
        showSiteGis,
        activeLayers,
        opacity,
        streets3d
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Explorer.useEffect": ()=>{
            const current = map.current;
            if (!current || ready !== current) return;
            const previous = selectedCadRef.current;
            if (previous) current.setFeatureState({
                source: 'cad-plan',
                id: previous
            }, {
                selected: false
            });
            if (selectedCad) {
                current.setFeatureState({
                    source: 'cad-plan',
                    id: selectedCad.id
                }, {
                    selected: true
                });
                selectedCadRef.current = selectedCad.id;
            } else selectedCadRef.current = null;
        }
    }["Explorer.useEffect"], [
        ready,
        selectedCad
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Explorer.useEffect": ()=>{
            const current = map.current;
            if (!current || ready !== current) return;
            const previous = selectedPlotRef.current;
            if (previous) current.setFeatureState({
                source: 'plan-areas',
                id: previous
            }, {
                selected: false
            });
            const previousPlot = previous && planRef.current?.areas?.find({
                "Explorer.useEffect": (area)=>area.id === previous
            }["Explorer.useEffect"])?.plot;
            if (previousPlot) current.setFeatureState({
                source: 'villas',
                id: previousPlot
            }, {
                selected: false
            });
            if (selectedPlot) {
                current.setFeatureState({
                    source: 'plan-areas',
                    id: selectedPlot.id
                }, {
                    selected: true
                });
                if (selectedPlot.plot) current.setFeatureState({
                    source: 'villas',
                    id: selectedPlot.plot
                }, {
                    selected: true
                });
                selectedPlotRef.current = selectedPlot.id;
            } else selectedPlotRef.current = null;
        }
    }["Explorer.useEffect"], [
        ready,
        selectedPlot,
        plan,
        villas
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Explorer.useEffect": ()=>{
            const current = map.current;
            if (!current || ready !== current || !align) return;
            const element = document.createElement('button');
            element.className = 'alignment-handle';
            element.type = 'button';
            element.setAttribute('aria-label', 'Drag masterplan alignment');
            element.innerHTML = '✥';
            const marker = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$maplibre$2d$gl$2f$dist$2f$maplibre$2d$gl$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Marker"]({
                element,
                draggable: true,
                anchor: 'center'
            }).setLngLat([
                placementRef.current.lng,
                placementRef.current.lat
            ]).addTo(current);
            alignmentHandle.current = marker; // Re-projecting the plan and street props is heavy, so the drag commits at most one placement per frame.
            let frame = 0;
            marker.on('drag', {
                "Explorer.useEffect": ()=>{
                    if (frame) return;
                    frame = requestAnimationFrame({
                        "Explorer.useEffect": ()=>{
                            frame = 0;
                            const position = marker.getLngLat();
                            setPlacement({
                                "Explorer.useEffect": (value)=>({
                                        ...value,
                                        lng: position.lng,
                                        lat: position.lat
                                    })
                            }["Explorer.useEffect"]);
                            setSavedNotice(false);
                        }
                    }["Explorer.useEffect"]);
                }
            }["Explorer.useEffect"]);
            return ({
                "Explorer.useEffect": ()=>{
                    cancelAnimationFrame(frame);
                    marker.remove();
                    alignmentHandle.current = null;
                }
            })["Explorer.useEffect"];
        }
    }["Explorer.useEffect"], [
        ready,
        align
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Explorer.useEffect": ()=>{
            alignmentHandle.current?.setLngLat([
                placement.lng,
                placement.lat
            ]);
        }
    }["Explorer.useEffect"], [
        placement
    ]);
    // The map runs under the translucent header, so the top padding also clears it.
    function framePadding() {
        return window.innerWidth > 700 ? {
            top: 180,
            right: 300,
            bottom: 100,
            left: 390
        } : {
            top: 200,
            right: 25,
            bottom: 90,
            left: 25
        };
    }
    // Tilted street-level camera over the current view; a second press returns to the flat plan.
    function streetView() {
        const current = map.current;
        if (!current) return;
        stopTour();
        framedRef.current = true;
        if (tilted) {
            current.easeTo({
                pitch: 0,
                bearing: 0,
                duration: 1100
            });
            return;
        }
        setStreets3d(true);
        current.easeTo({
            pitch: 66,
            bearing: current.getBearing() || -28,
            zoom: Math.max(current.getZoom(), 18.3),
            duration: 1500,
            essential: true
        });
    }
    // Guided tour: a slow fly to each stop, then a gentle orbit. Any drag, wheel or pinch ends it (movestart with an originalEvent).
    const stops = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Explorer.useMemo[stops]": ()=>plan ? tourStops(plan, placement, villas?.landmarks?.fountain) : []
    }["Explorer.useMemo[stops]"], [
        plan,
        placement,
        villas
    ]);
    // tourRef holds the running tour's token (positive) or minus the last one, so a stopped loop sees it is stale.
    function stopTour() {
        if (tourRef.current <= 0) return;
        tourRef.current = -tourRef.current;
        setTour(null);
        map.current?.stop();
    }
    stopTourRef.current = stopTour;
    async function playTour(from = 0) {
        const current = map.current;
        if (!current || !stops.length) return;
        const token = Math.abs(tourRef.current) + 1;
        tourRef.current = token;
        framedRef.current = true;
        setStreets3d(true);
        setShowPlan(true);
        setAlign(false);
        setSelectedPlace(null);
        setSelectedCad(null);
        setSelectedPlot(null);
        if (window.innerWidth < 700) setSidebar(false);
        // settled() first stops any camera still moving (the intro fly-in, inertia), whose moveend would otherwise end the step at once.
        const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches, settled = ()=>{
            current.stop();
            return new Promise((resolve)=>current.once('moveend', ()=>resolve()));
        }, pause = (ms)=>new Promise((resolve)=>setTimeout(resolve, ms)), live = ()=>tourRef.current === token;
        for(let index = from; index < stops.length; index++){
            const stop = stops[index];
            setTour(index);
            if (still) {
                current.jumpTo(stop);
                await pause(4500);
            } else {
                const arrive = settled();
                current.flyTo({
                    ...stop,
                    duration: index === from ? 2600 : 4200,
                    curve: 1.15,
                    easing: easeInOut,
                    essential: true
                });
                await arrive;
                if (!live()) return;
                const orbit = settled();
                current.easeTo({
                    bearing: stop.bearing + 32,
                    duration: 7000,
                    easing: (t)=>t,
                    essential: true
                });
                await orbit;
            }
            if (!live()) return;
        }
        if (still) current.jumpTo(stops[0]);
        else current.flyTo({
            ...stops[0],
            duration: 3600,
            curve: 1.15,
            easing: easeInOut,
            essential: true
        });
        tourRef.current = -token;
        setTour(null);
    }
    function fitPlan() {
        stopTour();
        if (!plan || !map.current) return;
        framedRef.current = true;
        map.current.fitBounds(zoneBounds(plan, placement) || planBounds(plan, placement), {
            padding: framePadding(),
            maxZoom: 17.2,
            duration: 900
        });
        setSelectedCad(null);
        setSelectedPlace(null);
        setSelectedPlot(null);
    }
    function focus(place) {
        framedRef.current = true;
        setSelectedPlace(place);
        setSelectedCad(null);
        setSelectedPlot(null);
        map.current?.flyTo({
            center: [
                place.lng,
                place.lat
            ],
            zoom: 16,
            bearing: 0,
            pitch: 35,
            duration: 950,
            essential: true
        });
        if (window.innerWidth < 700) setSidebar(false);
    }
    function reset() {
        setPlacement(defaults);
        setSavedNotice(false);
        try {
            localStorage.removeItem(ALIGNMENT_STORAGE);
        } catch  {}
    }
    const selectedCadInfo = selectedCad ? CAD_LAYERS[selectedCad.category] : null;
    const summary = plan?.summary;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: tour !== null ? 'touring' : '',
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        className: "wordmark",
                        href: "/",
                        children: [
                            "RANCHES",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "NEW ZAYED"
                            }, void 0, false, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 339,
                                columnNumber: 100
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Explorer.tsx",
                        lineNumber: 339,
                        columnNumber: 60
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "header-title",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "live-dot"
                            }, void 0, false, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 339,
                                columnNumber: 156
                            }, this),
                            " NEW ZAYED ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "header-divider",
                                children: "/"
                            }, void 0, false, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 339,
                                columnNumber: 195
                            }, this),
                            " Interactive masterplan"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Explorer.tsx",
                        lineNumber: 339,
                        columnNumber: 126
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        className: "location-link",
                        href: `https://www.google.com/maps/search/?api=1&query=${HOME.join(',')}`,
                        target: "_blank",
                        rel: "noreferrer",
                        children: [
                            "Open in Google Maps ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                    name: "arrow",
                                    size: 14
                                }, void 0, false, {
                                    fileName: "[project]/components/Explorer.tsx",
                                    lineNumber: 339,
                                    columnNumber: 428
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 339,
                                columnNumber: 422
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Explorer.tsx",
                        lineNumber: 339,
                        columnNumber: 265
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/Explorer.tsx",
                lineNumber: 339,
                columnNumber: 52
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `map ${view}`,
                ref: el
            }, void 0, false, {
                fileName: "[project]/components/Explorer.tsx",
                lineNumber: 339,
                columnNumber: 478
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: "mobile-toggle",
                onClick: ()=>setSidebar(!sidebar),
                children: sidebar ? 'Hide places' : 'Explore places'
            }, void 0, false, {
                fileName: "[project]/components/Explorer.tsx",
                lineNumber: 339,
                columnNumber: 519
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                className: sidebar ? '' : 'hidden-mobile',
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "eyebrow",
                        children: "EXPLORE YOUR EVERYDAY"
                    }, void 0, false, {
                        fileName: "[project]/components/Explorer.tsx",
                        lineNumber: 339,
                        columnNumber: 683
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        children: [
                            "Closer to",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 339,
                                columnNumber: 748
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("em", {
                                children: "everything."
                            }, void 0, false, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 339,
                                columnNumber: 753
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Explorer.tsx",
                        lineNumber: 339,
                        columnNumber: 735
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "intro",
                        children: "Discover the Zone 1 masterplan and the places that surround it."
                    }, void 0, false, {
                        fileName: "[project]/components/Explorer.tsx",
                        lineNumber: 339,
                        columnNumber: 778
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "search",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                    name: "search",
                                    size: 17
                                }, void 0, false, {
                                    fileName: "[project]/components/Explorer.tsx",
                                    lineNumber: 339,
                                    columnNumber: 898
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 339,
                                columnNumber: 892
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                "aria-label": "Search nearby places",
                                placeholder: "Search nearby places",
                                value: query,
                                onChange: (event)=>setQuery(event.target.value)
                            }, void 0, false, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 339,
                                columnNumber: 936
                            }, this),
                            query && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                "aria-label": "Clear search",
                                onClick: ()=>setQuery(''),
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                    name: "close",
                                    size: 14
                                }, void 0, false, {
                                    fileName: "[project]/components/Explorer.tsx",
                                    lineNumber: 339,
                                    columnNumber: 1143
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 339,
                                columnNumber: 1082
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Explorer.tsx",
                        lineNumber: 339,
                        columnNumber: 866
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "categories",
                        children: categories.map(([id, name, icon])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                "aria-pressed": category === id,
                                className: category === id ? 'active' : '',
                                onClick: ()=>{
                                    setCategory(id);
                                    setSelectedPlace(null);
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                            name: icon,
                                            size: 15
                                        }, void 0, false, {
                                            fileName: "[project]/components/Explorer.tsx",
                                            lineNumber: 339,
                                            columnNumber: 1398
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/Explorer.tsx",
                                        lineNumber: 339,
                                        columnNumber: 1392
                                    }, this),
                                    name
                                ]
                            }, id, true, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 339,
                                columnNumber: 1253
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/components/Explorer.tsx",
                        lineNumber: 339,
                        columnNumber: 1191
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "list-head",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: status === 'loading' ? 'Exploring nearby…' : `${visible.length} places nearby`
                            }, void 0, false, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 339,
                                columnNumber: 1484
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                "aria-label": "Search radius",
                                value: radius,
                                onChange: (event)=>setRadius(+event.target.value),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: 3,
                                        children: "Within 3 km"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Explorer.tsx",
                                        lineNumber: 339,
                                        columnNumber: 1670
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: 5,
                                        children: "Within 5 km"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Explorer.tsx",
                                        lineNumber: 339,
                                        columnNumber: 1708
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: 10,
                                        children: "Within 10 km"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Explorer.tsx",
                                        lineNumber: 339,
                                        columnNumber: 1746
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 339,
                                columnNumber: 1571
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Explorer.tsx",
                        lineNumber: 339,
                        columnNumber: 1457
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "places",
                        children: [
                            status === 'loading' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "empty",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "spinner"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Explorer.tsx",
                                        lineNumber: 339,
                                        columnNumber: 1869
                                    }, this),
                                    "Finding nearby places…"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 339,
                                columnNumber: 1846
                            }, this),
                            status === 'error' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "empty",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        children: "Places are temporarily unavailable"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Explorer.tsx",
                                        lineNumber: 339,
                                        columnNumber: 1966
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: "The map data service didn’t respond. Try again in a moment."
                                    }, void 0, false, {
                                        fileName: "[project]/components/Explorer.tsx",
                                        lineNumber: 339,
                                        columnNumber: 2017
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "primary",
                                        onClick: loadPlaces,
                                        children: "Try again"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Explorer.tsx",
                                        lineNumber: 339,
                                        columnNumber: 2083
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 339,
                                columnNumber: 1943
                            }, this),
                            status !== 'loading' && status !== 'error' && !visible.length && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "empty",
                                children: "No mapped places match your search. Try a wider radius or another category."
                            }, void 0, false, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 339,
                                columnNumber: 2213
                            }, this),
                            visible.map((place)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: `place-card ${selectedPlace?.id === place.id ? 'selected' : ''}`,
                                    onClick: ()=>focus(place),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "place-icon",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                name: categories.find((item)=>item[0] === place.category)?.[2] || 'pin',
                                                size: 16
                                            }, void 0, false, {
                                                fileName: "[project]/components/Explorer.tsx",
                                                lineNumber: 339,
                                                columnNumber: 2488
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/Explorer.tsx",
                                            lineNumber: 339,
                                            columnNumber: 2459
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "place-text",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    children: place.name
                                                }, void 0, false, {
                                                    fileName: "[project]/components/Explorer.tsx",
                                                    lineNumber: 339,
                                                    columnNumber: 2608
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                                                    children: place.kind
                                                }, void 0, false, {
                                                    fileName: "[project]/components/Explorer.tsx",
                                                    lineNumber: 339,
                                                    columnNumber: 2637
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/Explorer.tsx",
                                            lineNumber: 339,
                                            columnNumber: 2579
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "distance",
                                            children: [
                                                distance(place.lat, place.lng).toFixed(1),
                                                " km ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                        name: "arrow",
                                                        size: 13
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/Explorer.tsx",
                                                        lineNumber: 339,
                                                        columnNumber: 2747
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/Explorer.tsx",
                                                    lineNumber: 339,
                                                    columnNumber: 2744
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/Explorer.tsx",
                                            lineNumber: 339,
                                            columnNumber: 2671
                                        }, this)
                                    ]
                                }, place.id, true, {
                                    fileName: "[project]/components/Explorer.tsx",
                                    lineNumber: 339,
                                    columnNumber: 2338
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Explorer.tsx",
                        lineNumber: 339,
                        columnNumber: 1801
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "dot"
                            }, void 0, false, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 339,
                                columnNumber: 2813
                            }, this),
                            " ",
                            status === 'snapshot' ? 'OpenStreetMap · 15 Oct 2026 snapshot' : 'Places by OpenStreetMap',
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                                children: "Distances are straight-line · Coverage may vary"
                            }, void 0, false, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 339,
                                columnNumber: 2923
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Explorer.tsx",
                        lineNumber: 339,
                        columnNumber: 2805
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/Explorer.tsx",
                lineNumber: 339,
                columnNumber: 637
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "map-top",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "map-label",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "dot"
                            }, void 0, false, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 339,
                                columnNumber: 3055
                            }, this),
                            " Ranches, New Zayed ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                                children: "EGYPT"
                            }, void 0, false, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 339,
                                columnNumber: 3098
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Explorer.tsx",
                        lineNumber: 339,
                        columnNumber: 3027
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "view-switch",
                        children: [
                            'satellite',
                            'street'
                        ].map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: view === item ? 'active' : '',
                                onClick: ()=>setView(item),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                        name: item === 'satellite' ? 'globe' : 'map',
                                        size: 14
                                    }, void 0, false, {
                                        fileName: "[project]/components/Explorer.tsx",
                                        lineNumber: 339,
                                        columnNumber: 3282
                                    }, this),
                                    item === 'satellite' ? 'Satellite' : 'Street'
                                ]
                            }, item, true, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 339,
                                columnNumber: 3199
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/components/Explorer.tsx",
                        lineNumber: 339,
                        columnNumber: 3125
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/Explorer.tsx",
                lineNumber: 339,
                columnNumber: 3002
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "layers",
                "aria-label": "Masterplan controls",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "compare-control",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Geometry comparison"
                            }, void 0, false, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 340,
                                columnNumber: 97
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    [
                                        'combined',
                                        'Combined'
                                    ],
                                    [
                                        'gis',
                                        'GIS only'
                                    ],
                                    [
                                        'presentation',
                                        'Alaa only'
                                    ]
                                ].map(([mode, label])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        "aria-pressed": compareMode === mode,
                                        onClick: ()=>setCompareMode(mode),
                                        children: label
                                    }, mode, false, {
                                        fileName: "[project]/components/Explorer.tsx",
                                        lineNumber: 340,
                                        columnNumber: 240
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 340,
                                columnNumber: 129
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Explorer.tsx",
                        lineNumber: 340,
                        columnNumber: 64
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "layer-title",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                        name: "layers"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Explorer.tsx",
                                        lineNumber: 340,
                                        columnNumber: 393
                                    }, this),
                                    "Zone 1 masterplan"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 340,
                                columnNumber: 387
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                role: "switch",
                                "aria-label": "Show masterplan",
                                "aria-checked": showPlan,
                                className: `toggle ${showPlan ? 'on' : ''}`,
                                onClick: ()=>setShowPlan(!showPlan),
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {}, void 0, false, {
                                    fileName: "[project]/components/Explorer.tsx",
                                    lineNumber: 340,
                                    columnNumber: 591
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 340,
                                columnNumber: 438
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Explorer.tsx",
                        lineNumber: 340,
                        columnNumber: 358
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "layer-title street-toggle",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                        name: "map"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Explorer.tsx",
                                        lineNumber: 341,
                                        columnNumber: 53
                                    }, this),
                                    "Full-site GIS"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 341,
                                columnNumber: 47
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                role: "switch",
                                "aria-label": "Show authoritative full-site GIS",
                                "aria-checked": showSiteGis,
                                className: `toggle ${showSiteGis ? 'on' : ''}`,
                                onClick: ()=>setShowSiteGis((value)=>!value),
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {}, void 0, false, {
                                    fileName: "[project]/components/Explorer.tsx",
                                    lineNumber: 341,
                                    columnNumber: 274
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 341,
                                columnNumber: 91
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Explorer.tsx",
                        lineNumber: 341,
                        columnNumber: 4
                    }, this),
                    showSiteGis && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "street-caption",
                        children: "GIS owns roads, parking, plots, landscape, water and boundary in Combined mode. Alaa supplies detailed 3D presentation above it."
                    }, void 0, false, {
                        fileName: "[project]/components/Explorer.tsx",
                        lineNumber: 341,
                        columnNumber: 307
                    }, this),
                    planError ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: "Plan could not load. Refresh to retry."
                    }, void 0, false, {
                        fileName: "[project]/components/Explorer.tsx",
                        lineNumber: 342,
                        columnNumber: 15
                    }, this) : summary ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dl", {
                        className: "plan-stats",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                        children: "Plots"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Explorer.tsx",
                                        lineNumber: 342,
                                        columnNumber: 101
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                        children: summary.plots
                                    }, void 0, false, {
                                        fileName: "[project]/components/Explorer.tsx",
                                        lineNumber: 342,
                                        columnNumber: 115
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 342,
                                columnNumber: 96
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                        children: "Homes"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Explorer.tsx",
                                        lineNumber: 342,
                                        columnNumber: 150
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                        children: summary.homes
                                    }, void 0, false, {
                                        fileName: "[project]/components/Explorer.tsx",
                                        lineNumber: 342,
                                        columnNumber: 164
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 342,
                                columnNumber: 145
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                        children: "Landscape"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Explorer.tsx",
                                        lineNumber: 342,
                                        columnNumber: 199
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                        children: hectares(summary.greenArea)
                                    }, void 0, false, {
                                        fileName: "[project]/components/Explorer.tsx",
                                        lineNumber: 342,
                                        columnNumber: 217
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 342,
                                columnNumber: 194
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Explorer.tsx",
                        lineNumber: 342,
                        columnNumber: 69
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: "Loading the masterplan…"
                    }, void 0, false, {
                        fileName: "[project]/components/Explorer.tsx",
                        lineNumber: 342,
                        columnNumber: 267
                    }, this),
                    showPlan && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "typology-legend",
                                children: Object.keys(TYPOLOGIES).filter((name)=>summary?.typologies?.[name]).map((name)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                                                style: {
                                                    backgroundColor: TYPOLOGIES[name].color
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/components/Explorer.tsx",
                                                lineNumber: 343,
                                                columnNumber: 159
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: name === 'Plot' ? 'Other plots' : name
                                            }, void 0, false, {
                                                fileName: "[project]/components/Explorer.tsx",
                                                lineNumber: 343,
                                                columnNumber: 212
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                                children: summary?.typologies[name]
                                            }, void 0, false, {
                                                fileName: "[project]/components/Explorer.tsx",
                                                lineNumber: 343,
                                                columnNumber: 259
                                            }, this)
                                        ]
                                    }, name, true, {
                                        fileName: "[project]/components/Explorer.tsx",
                                        lineNumber: 343,
                                        columnNumber: 143
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 343,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "opacity",
                                children: [
                                    "Opacity",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        "aria-label": "Plan opacity",
                                        type: "range",
                                        min: "0",
                                        max: "1",
                                        step: ".05",
                                        value: opacity,
                                        onChange: (event)=>setOpacity(+event.target.value)
                                    }, void 0, false, {
                                        fileName: "[project]/components/Explorer.tsx",
                                        lineNumber: 343,
                                        columnNumber: 341
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: [
                                            Math.round(opacity * 100),
                                            "%"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/Explorer.tsx",
                                        lineNumber: 343,
                                        columnNumber: 481
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 343,
                                columnNumber: 307
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "cad-layer-list",
                                children: Object.entries(CAD_LAYERS).map(([key, config])=>{
                                    const layer = key;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        "aria-pressed": activeLayers[layer],
                                        className: activeLayers[layer] ? 'active' : '',
                                        onClick: ()=>setActiveLayers((value)=>({
                                                    ...value,
                                                    [layer]: !value[layer]
                                                })),
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                                                style: {
                                                    backgroundColor: config.color
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/components/Explorer.tsx",
                                                lineNumber: 343,
                                                columnNumber: 819
                                            }, this),
                                            config.label
                                        ]
                                    }, layer, true, {
                                        fileName: "[project]/components/Explorer.tsx",
                                        lineNumber: 343,
                                        columnNumber: 647
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 343,
                                columnNumber: 528
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Explorer.tsx",
                        lineNumber: 343,
                        columnNumber: 15
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "layer-title street-toggle",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                        name: "cube"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Explorer.tsx",
                                        lineNumber: 343,
                                        columnNumber: 947
                                    }, this),
                                    "3D villas & streets"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 343,
                                columnNumber: 941
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                role: "switch",
                                "aria-label": "Show 3D villas and streets",
                                "aria-checked": streets3d,
                                className: `toggle ${streets3d ? 'on' : ''}`,
                                onClick: ()=>setStreets3d(!streets3d),
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {}, void 0, false, {
                                    fileName: "[project]/components/Explorer.tsx",
                                    lineNumber: 343,
                                    columnNumber: 1164
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 343,
                                columnNumber: 996
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Explorer.tsx",
                        lineNumber: 343,
                        columnNumber: 898
                    }, this),
                    streets3d && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "street-caption",
                        children: [
                            "Villas massed from the CAD building envelopes",
                            villas ? ` (${villas.buildings.filter((building)=>building[1]).length} use a derived setback)` : '',
                            "; heights and facades are illustrative. Streets from the NUCA GIS, trees from the landscape plan; lights and cars are illustrative."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Explorer.tsx",
                        lineNumber: 343,
                        columnNumber: 1195
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "sun-control",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "sun-head",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                name: daylight(sun) > 0.5 ? 'sun' : 'moon'
                                            }, void 0, false, {
                                                fileName: "[project]/components/Explorer.tsx",
                                                lineNumber: 344,
                                                columnNumber: 65
                                            }, this),
                                            "Time of day"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/Explorer.tsx",
                                        lineNumber: 344,
                                        columnNumber: 59
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                        children: [
                                            clock(hour),
                                            " · ",
                                            phase(sun, hour)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/Explorer.tsx",
                                        lineNumber: 344,
                                        columnNumber: 128
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 344,
                                columnNumber: 33
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "sun-row",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "sun-play",
                                        "aria-label": timelapse ? 'Pause time-lapse' : 'Play the day as a time-lapse',
                                        "aria-pressed": timelapse,
                                        onClick: ()=>setTimelapse((value)=>!value),
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                            name: timelapse ? 'stop' : 'play',
                                            size: 13
                                        }, void 0, false, {
                                            fileName: "[project]/components/Explorer.tsx",
                                            lineNumber: 344,
                                            columnNumber: 368
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/Explorer.tsx",
                                        lineNumber: 344,
                                        columnNumber: 199
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        "aria-label": "Time of day",
                                        type: "range",
                                        min: 5,
                                        max: 22,
                                        step: 0.05,
                                        value: hour,
                                        onChange: (event)=>{
                                            setTimelapse(false);
                                            setHour(+event.target.value);
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/Explorer.tsx",
                                        lineNumber: 344,
                                        columnNumber: 425
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 344,
                                columnNumber: 174
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                                children: "Sun position for today’s date at Ranches · local solar time"
                            }, void 0, false, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 344,
                                columnNumber: 588
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Explorer.tsx",
                        lineNumber: 344,
                        columnNumber: 4
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "alignment-link",
                        "aria-expanded": align,
                        onClick: ()=>{
                            setAlign((value)=>!value);
                            setShowPlan(true);
                        },
                        children: [
                            align ? 'Done adjusting' : savedNotice ? 'Alignment saved ✓' : 'Align to satellite',
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: align ? '−' : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                    name: "arrow",
                                    size: 13
                                }, void 0, false, {
                                    fileName: "[project]/components/Explorer.tsx",
                                    lineNumber: 344,
                                    columnNumber: 878
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 344,
                                columnNumber: 861
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Explorer.tsx",
                        lineNumber: 344,
                        columnNumber: 668
                    }, this),
                    align && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "alignment",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: "Drag the gold handle to match landmarks, then fine-tune scale and rotation. Placement is approximate."
                            }, void 0, false, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 344,
                                columnNumber: 960
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "quick-adjust",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        "aria-label": "Rotate plan counterclockwise",
                                        onClick: ()=>setPlacement((value)=>({
                                                    ...value,
                                                    angle: value.angle + 0.5
                                                })),
                                        children: "↶ 0.5°"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Explorer.tsx",
                                        lineNumber: 344,
                                        columnNumber: 1098
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        "aria-label": "Rotate plan clockwise",
                                        onClick: ()=>setPlacement((value)=>({
                                                    ...value,
                                                    angle: value.angle - 0.5
                                                })),
                                        children: "↷ 0.5°"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Explorer.tsx",
                                        lineNumber: 344,
                                        columnNumber: 1233
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        "aria-label": "Reduce plan scale",
                                        onClick: ()=>setPlacement((value)=>({
                                                    ...value,
                                                    width: value.width / 1.01
                                                })),
                                        children: "− 1%"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Explorer.tsx",
                                        lineNumber: 344,
                                        columnNumber: 1361
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        "aria-label": "Increase plan scale",
                                        onClick: ()=>setPlacement((value)=>({
                                                    ...value,
                                                    width: value.width * 1.01
                                                })),
                                        children: "+ 1%"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Explorer.tsx",
                                        lineNumber: 344,
                                        columnNumber: 1484
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 344,
                                columnNumber: 1068
                            }, this),
                            [
                                [
                                    'lat',
                                    'Latitude',
                                    .0001
                                ],
                                [
                                    'lng',
                                    'Longitude',
                                    .0001
                                ],
                                [
                                    'width',
                                    'Width (metres)',
                                    10
                                ],
                                [
                                    'angle',
                                    'Rotation (°)',
                                    1
                                ]
                            ].map(([key, label, step])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    children: [
                                        label,
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "number",
                                            step: step,
                                            value: placement[key],
                                            onChange: (event)=>{
                                                const value = Number(event.target.value);
                                                if (Number.isFinite(value) && (key !== 'width' || value > 0)) setPlacement((current)=>({
                                                        ...current,
                                                        [key]: value
                                                    }));
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/components/Explorer.tsx",
                                            lineNumber: 344,
                                            columnNumber: 1785
                                        }, this)
                                    ]
                                }, key, true, {
                                    fileName: "[project]/components/Explorer.tsx",
                                    lineNumber: 344,
                                    columnNumber: 1761
                                }, this)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "align-buttons",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>{
                                            try {
                                                localStorage.setItem(ALIGNMENT_STORAGE, JSON.stringify(placement));
                                                setSavedNotice(true);
                                                setAlign(false);
                                            } catch  {
                                                setSavedNotice(false);
                                            }
                                        },
                                        children: "Save on device"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Explorer.tsx",
                                        lineNumber: 344,
                                        columnNumber: 2044
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: reset,
                                        children: "Reset"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Explorer.tsx",
                                        lineNumber: 344,
                                        columnNumber: 2227
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 344,
                                columnNumber: 2013
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Explorer.tsx",
                        lineNumber: 344,
                        columnNumber: 933
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/Explorer.tsx",
                lineNumber: 340,
                columnNumber: 3
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "map-actions",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "recenter",
                        title: "Fit masterplan",
                        onClick: fitPlan,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                name: "focus",
                                size: 17
                            }, void 0, false, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 345,
                                columnNumber: 102
                            }, this),
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Fit masterplan"
                            }, void 0, false, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 345,
                                columnNumber: 133
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Explorer.tsx",
                        lineNumber: 345,
                        columnNumber: 32
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "recenter",
                        title: tilted ? 'Flat plan' : '3D street view',
                        "aria-pressed": tilted,
                        onClick: streetView,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                name: tilted ? 'flat' : 'cube',
                                size: 17
                            }, void 0, false, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 345,
                                columnNumber: 285
                            }, this),
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: tilted ? 'Flat plan' : '3D street view'
                            }, void 0, false, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 345,
                                columnNumber: 331
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Explorer.tsx",
                        lineNumber: 345,
                        columnNumber: 169
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "recenter tour-button",
                        title: tour !== null ? 'End tour' : 'Guided tour',
                        "aria-pressed": tour !== null,
                        disabled: !stops.length,
                        onClick: ()=>tour !== null ? stopTour() : playTour(),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                name: tour !== null ? 'stop' : 'play',
                                size: 17
                            }, void 0, false, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 345,
                                columnNumber: 576
                            }, this),
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: tour !== null ? 'End tour' : 'Guided tour'
                            }, void 0, false, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 345,
                                columnNumber: 627
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Explorer.tsx",
                        lineNumber: 345,
                        columnNumber: 390
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/Explorer.tsx",
                lineNumber: 345,
                columnNumber: 3
            }, this),
            tour !== null && stops[tour] && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "tour-caption",
                "aria-live": "polite",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "eyebrow",
                        children: [
                            "Guided tour · ",
                            tour + 1,
                            " / ",
                            stops.length
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Explorer.tsx",
                        lineNumber: 346,
                        columnNumber: 83
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        children: stops[tour].name
                    }, void 0, false, {
                        fileName: "[project]/components/Explorer.tsx",
                        lineNumber: 346,
                        columnNumber: 153
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: stops[tour].caption
                    }, void 0, false, {
                        fileName: "[project]/components/Explorer.tsx",
                        lineNumber: 346,
                        columnNumber: 180
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                        "aria-label": "Tour stops",
                        children: stops.map((stop, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                "aria-label": stop.name,
                                "aria-current": index === tour,
                                className: index === tour ? 'active' : '',
                                onClick: ()=>{
                                    map.current?.stop();
                                    void playTour(index);
                                }
                            }, stop.name, false, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 346,
                                columnNumber: 262
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/components/Explorer.tsx",
                        lineNumber: 346,
                        columnNumber: 208
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/Explorer.tsx",
                lineNumber: 346,
                columnNumber: 30
            }, this),
            selectedPlace && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "detail",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "close",
                        "aria-label": "Close place details",
                        onClick: ()=>setSelectedPlace(null),
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                            name: "close",
                            size: 16
                        }, void 0, false, {
                            fileName: "[project]/components/Explorer.tsx",
                            lineNumber: 347,
                            columnNumber: 143
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/Explorer.tsx",
                        lineNumber: 347,
                        columnNumber: 47
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "eyebrow",
                        children: selectedPlace.kind
                    }, void 0, false, {
                        fileName: "[project]/components/Explorer.tsx",
                        lineNumber: 347,
                        columnNumber: 182
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        children: selectedPlace.name
                    }, void 0, false, {
                        fileName: "[project]/components/Explorer.tsx",
                        lineNumber: 347,
                        columnNumber: 233
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: [
                            distance(selectedPlace.lat, selectedPlace.lng).toFixed(1),
                            " km from Ranches · straight-line distance"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Explorer.tsx",
                        lineNumber: 347,
                        columnNumber: 262
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        className: "primary",
                        target: "_blank",
                        rel: "noreferrer",
                        href: `https://www.google.com/maps/dir/?api=1&origin=${HOME.join(',')}&destination=${selectedPlace.lat},${selectedPlace.lng}`,
                        children: [
                            "Get directions ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                name: "arrow",
                                size: 14
                            }, void 0, false, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 347,
                                columnNumber: 566
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Explorer.tsx",
                        lineNumber: 347,
                        columnNumber: 368
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/Explorer.tsx",
                lineNumber: 347,
                columnNumber: 19
            }, this),
            selectedPlot && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "detail plot-detail",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "close",
                        "aria-label": "Close plot details",
                        onClick: ()=>setSelectedPlot(null),
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                            name: "close",
                            size: 16
                        }, void 0, false, {
                            fileName: "[project]/components/Explorer.tsx",
                            lineNumber: 348,
                            columnNumber: 152
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/Explorer.tsx",
                        lineNumber: 348,
                        columnNumber: 58
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "eyebrow",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                                style: {
                                    backgroundColor: TYPOLOGIES[selectedPlot.typology || 'Plot'].color
                                }
                            }, void 0, false, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 348,
                                columnNumber: 216
                            }, this),
                            selectedPlot.typology === 'Plot' ? 'Zone 1 plot' : selectedPlot.typology
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Explorer.tsx",
                        lineNumber: 348,
                        columnNumber: 191
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        children: [
                            "Plot ",
                            selectedPlot.plot
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Explorer.tsx",
                        lineNumber: 348,
                        columnNumber: 368
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: TYPOLOGIES[selectedPlot.typology || 'Plot'].description
                    }, void 0, false, {
                        fileName: "[project]/components/Explorer.tsx",
                        lineNumber: 348,
                        columnNumber: 401
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dl", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                        children: "Plot area"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Explorer.tsx",
                                        lineNumber: 348,
                                        columnNumber: 472
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                        children: squareMetres(selectedPlot.area || 0)
                                    }, void 0, false, {
                                        fileName: "[project]/components/Explorer.tsx",
                                        lineNumber: 348,
                                        columnNumber: 490
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 348,
                                columnNumber: 467
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                        children: "Homes"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Explorer.tsx",
                                        lineNumber: 348,
                                        columnNumber: 546
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                        children: selectedPlot.homes || '—'
                                    }, void 0, false, {
                                        fileName: "[project]/components/Explorer.tsx",
                                        lineNumber: 348,
                                        columnNumber: 560
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 348,
                                columnNumber: 541
                            }, this),
                            selectedPlot.envelope ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                        children: "Building envelope"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Explorer.tsx",
                                        lineNumber: 348,
                                        columnNumber: 628
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                        children: squareMetres(selectedPlot.envelope)
                                    }, void 0, false, {
                                        fileName: "[project]/components/Explorer.tsx",
                                        lineNumber: 348,
                                        columnNumber: 654
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 348,
                                columnNumber: 623
                            }, this) : null,
                            selectedPlot.envelope && selectedPlot.area ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                        children: "Envelope / plot"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Explorer.tsx",
                                        lineNumber: 348,
                                        columnNumber: 759
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                        children: [
                                            Math.round(selectedPlot.envelope / selectedPlot.area * 100),
                                            "%"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/Explorer.tsx",
                                        lineNumber: 348,
                                        columnNumber: 783
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Explorer.tsx",
                                lineNumber: 348,
                                columnNumber: 754
                            }, this) : null
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Explorer.tsx",
                        lineNumber: 348,
                        columnNumber: 463
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                        children: [
                            "Areas measured from the CAD drawing",
                            villas?.buildings.some((building)=>building[0] === selectedPlot.plot && building[1]) ? ' · 3D massing uses a derived setback (no envelope in the drawing)' : '',
                            " · Indicative, not a sales offer"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Explorer.tsx",
                        lineNumber: 348,
                        columnNumber: 867
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/Explorer.tsx",
                lineNumber: 348,
                columnNumber: 18
            }, this),
            selectedCad && selectedCadInfo && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "detail cad-detail",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "close",
                        "aria-label": "Close feature details",
                        onClick: ()=>setSelectedCad(null),
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                            name: "close",
                            size: 16
                        }, void 0, false, {
                            fileName: "[project]/components/Explorer.tsx",
                            lineNumber: 349,
                            columnNumber: 169
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/Explorer.tsx",
                        lineNumber: 349,
                        columnNumber: 73
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "eyebrow",
                        children: "Zone 1 masterplan"
                    }, void 0, false, {
                        fileName: "[project]/components/Explorer.tsx",
                        lineNumber: 349,
                        columnNumber: 208
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        children: selectedCadInfo.label
                    }, void 0, false, {
                        fileName: "[project]/components/Explorer.tsx",
                        lineNumber: 349,
                        columnNumber: 256
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: selectedCadInfo.description
                    }, void 0, false, {
                        fileName: "[project]/components/Explorer.tsx",
                        lineNumber: 349,
                        columnNumber: 288
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                        children: [
                            "Source layer: ",
                            selectedCad.layer
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Explorer.tsx",
                        lineNumber: 349,
                        columnNumber: 324
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/Explorer.tsx",
                lineNumber: 349,
                columnNumber: 34
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "map-note",
                children: tileError ? 'Some map tiles could not load. Try switching the map view.' : compareMode === 'gis' ? 'Comparison: authoritative full-site GIS only' : compareMode === 'presentation' ? 'Comparison: Alaa presentation geometry only' : streets3d ? 'Combined: full-site GIS beneath Alaa villas & streets · Right-drag or Ctrl-drag to tilt' : 'Combined: full-site GIS beneath the CAD masterplan'
            }, void 0, false, {
                fileName: "[project]/components/Explorer.tsx",
                lineNumber: 350,
                columnNumber: 3
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/Explorer.tsx",
        lineNumber: 339,
        columnNumber: 9
    }, this);
}
_s(Explorer, "yfF5fAJDq/mechl6tHnH2YgTYyE=");
_c2 = Explorer;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "STREET_BASE$[{id:'base-street-land',type:'background',paint:{'background-color':'#1a2028'}},\n {id:'base-street-sand',type:'fill',source:'street','source-layer':'landcover',filter:['==',['get','class'],'sand'],paint:{'fill-color':'#1d2125'}},\n {id:'base-street-landuse',type:'fill',source:'street','source-layer':'landuse',filter:['match',['get','class'],['residential','suburb','neighbourhood','commercial','retail'],true,false],paint:{'fill-color':'#1e252e'}},\n {id:'base-street-green',type:'fill',source:'street','source-layer':'landcover',filter:['match',['get','class'],['grass','wood','farmland'],true,false],paint:{'fill-color':'#1c2a24'}},\n {id:'base-street-park',type:'fill',source:'street','source-layer':'park',paint:{'fill-color':'#1d2e26'}},\n {id:'base-street-water',type:'fill',source:'street','source-layer':'water',paint:{'fill-color':'#0f1c28'}},\n {id:'base-street-building',type:'fill',source:'street','source-layer':'building',minzoom:14,paint:{'fill-color':'#252d37','fill-outline-color':'#303a46'}},\n ...ROAD_CLASSES.map(([classes,,k])=>({id:`base-street-casing-${classes[0]}`,type:'line',source:'street','source-layer':'transportation',filter:['match',['get','class'],classes,true,false],layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#12171d','line-width':roadWidth(k*1.35)}})),\n ...ROAD_CLASSES.map(([classes,color,k])=>({id:`base-street-road-${classes[0]}`,type:'line',source:'street','source-layer':'transportation',filter:['match',['get','class'],classes,true,false],layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':color,'line-width':roadWidth(k)}})),\n {id:'base-street-road-name',type:'symbol',source:'street','source-layer':'transportation_name',minzoom:13,layout:{...label(['coalesce',['get','name:en'],['get','name:latin'],'']),'symbol-placement':'line','text-size':['interpolate',['linear'],['zoom'],13,9,18,12],'text-letter-spacing':0.04},paint:{'text-color':'#8d9aa9','text-halo-color':'#12171d','text-halo-width':1.2}},\n {id:'base-street-place',type:'symbol',source:'street','source-layer':'place',filter:['match',['get','class'],['city','town','village','suburb','neighbourhood','quarter'],true,false],layout:{...label(['coalesce',['get','name:en'],['get','name:latin'],'']),'text-size':['match',['get','class'],['city','town'],14,11],'text-letter-spacing':0.08,'text-transform':'uppercase','text-max-width':8},paint:{'text-color':'#b4c0cd','text-halo-color':'#12171d','text-halo-width':1.4}}].map");
__turbopack_context__.k.register(_c1, "STREET_BASE");
__turbopack_context__.k.register(_c2, "Explorer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/Explorer.tsx [app-client] (ecmascript, next/dynamic entry)", (function(__turbopack_context__){

__turbopack_context__.n(__turbopack_context__.i("[project]/components/Explorer.tsx [app-client] (ecmascript)"));
}),
"[project]/components/Icon.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Icon",
    ()=>Icon
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
// One stroke icon set (24 px grid, 1.6 px line) so every control shares the same weight instead of mixed Unicode glyphs.
const PATHS = {
    grid: 'M4.5 4.5h6v6h-6zM13.5 4.5h6v6h-6zM4.5 13.5h6v6h-6zM13.5 13.5h6v6h-6z',
    coffee: 'M5 9h11v4.5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V9ZM16 10.5h1.2a2.4 2.4 0 0 1 0 4.8H16M8 3.5v2.5M11 3.5v2.5M14 3.5v2.5M4 21h13',
    bag: 'M5.8 7.5h12.4l1 13H4.8l1-13ZM9 10V6.5a3 3 0 0 1 6 0V10',
    health: 'M9.5 3.5h5v6h6v5h-6v6h-5v-6h-6v-5h6v-6Z',
    school: 'M2.5 9 12 4.5 21.5 9 12 13.5 2.5 9ZM6.5 11v5c0 1.4 2.5 3 5.5 3s5.5-1.6 5.5-3v-5M21.5 9v5.5',
    wrench: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9l-3.8 3.8Z',
    pin: 'M12 21s-6.5-5.8-6.5-11a6.5 6.5 0 0 1 13 0c0 5.2-6.5 11-6.5 11ZM12 7.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z',
    search: 'M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14ZM20 20l-4-4',
    close: 'M6.5 6.5l11 11M17.5 6.5l-11 11',
    arrow: 'M7.5 16.5l9-9M9 7.5h7.5V15',
    layers: 'M12 3.5 21 8.5l-9 5-9-5 9-5ZM3 12.5l9 5 9-5M3 16.5l9 5 9-5',
    cube: 'M12 2.8l8 4.6v9.2l-8 4.6-8-4.6V7.4l8-4.6ZM4 7.4l8 4.6 8-4.6M12 12v9.2',
    globe: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18ZM3 12h18M12 3c2.4 2.5 3.6 5.5 3.6 9s-1.2 6.5-3.6 9c-2.4-2.5-3.6-5.5-3.6-9S9.6 5.5 12 3Z',
    map: 'M9 4.5 3.5 6.8v12.7L9 17.2l6 2.3 5.5-2.3V4.5L15 6.8 9 4.5ZM9 4.5v12.7M15 6.8v12.7',
    focus: 'M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15M12 9.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z',
    flat: 'M4 6.5h16v11H4zM4 12h16M12 6.5v11',
    play: 'M8 5.5v13l10.5-6.5L8 5.5Z',
    stop: 'M7 7h10v10H7z',
    sun: 'M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8ZM12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4',
    moon: 'M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10Z'
};
function Icon({ name, size = 16 }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        className: "icon",
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.6,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": "true",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
            d: PATHS[name]
        }, void 0, false, {
            fileName: "[project]/components/Icon.tsx",
            lineNumber: 25,
            columnNumber: 259
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/Icon.tsx",
        lineNumber: 25,
        columnNumber: 74
    }, this);
}
_c = Icon;
var _c;
__turbopack_context__.k.register(_c, "Icon");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=components_0ukl2bhy-vx0g._.js.map