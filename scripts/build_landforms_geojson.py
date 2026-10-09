import json, urllib.request, re, math, os

print("=== Building True Span Landforms (Deserts & Mountains) Database ===")

PHYS_PATH = os.path.join(os.path.dirname(__file__), '..', 'map-quiz', 'data', 'physical-data.json')
OUT_PATH = os.path.join(os.path.dirname(__file__), '..', 'map-quiz', 'data', 'landforms.json')

with open(PHYS_PATH, 'r', encoding='utf-8') as f:
    phys_data = json.load(f)

features = phys_data['features']
deserts_meta = {k: v for k, v in features.items() if v['category'] == 'desert'}
mountains_meta = {k: v for k, v in features.items() if v['category'] == 'mountain'}

print(f"Target Deserts: {len(deserts_meta)}")
print(f"Target Mountains: {len(mountains_meta)}")

def get_geojson(url):
    print(f"Fetching {url.split('/')[-1]}...")
    req = urllib.request.urlopen(url, timeout=50)
    return json.loads(req.read().decode('utf-8'))['features']

url_50 = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_geography_regions_polys.geojson'
url_10 = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_geography_regions_polys.geojson'

ne_50 = get_geojson(url_50)
ne_10 = get_geojson(url_10)
all_regions = ne_50 + ne_10

def norm(s):
    s = (s or '').lower()
    s = re.sub(r'^(mountains?|range|mts?\.?|plateau|desert|sierra|cord\.?|planalto)\s+', '', s)
    s = re.sub(r'\s+(mountains?|range|mts?\.?|plateau|desert|highlands?|alps)$', '', s)
    return re.sub(r'[^a-z0-9]', '', s)

def round_coords(geom, precision=4):
    def _round(c):
        if not c: return c
        if isinstance(c[0], (int, float)):
            return [round(c[0], precision), round(c[1], precision)]
        return [_round(sub) for sub in c]
    return {
        'type': geom['type'],
        'coordinates': _round(geom['coordinates'])
    }

def get_geom_center(geom):
    coords = []
    def extract(c):
        if not c: return
        if isinstance(c[0], (int, float)):
            coords.append(c)
        else:
            for sub in c: extract(sub)
    if geom and 'coordinates' in geom:
        extract(geom['coordinates'])
    if not coords: return [0, 0]
    avg_x = sum(pt[0] for pt in coords) / len(coords)
    avg_y = sum(pt[1] for pt in coords) / len(coords)
    return [avg_x, avg_y]

def dist(pt1, pt2):
    return math.hypot(pt1[0] - pt2[0], pt1[1] - pt2[1])

# Aliases to match Natural Earth feature names
CUSTOM_REGION_ALIASES = {
    'africa-mountain-atlas': ['haut atlas', 'atlas', 'moyen atlas'],
    'africa-mountain-rift-valley': ['great rift valley'],
    'europe-mountain-apennines': ['appennini', 'apennines'],
    'na-mountain-great-basin': ['great basin'],
    'europe-mountain-scandes': ['kjolen mountains', 'scandinavian mountains'],
    'sa-mountain-brazilian-highlands': ['planalto central', 'brazilian highlands'],
    'eca-mountain-tian-shan': ['tian shan', 'tien shan'],
    'eca-mountain-alborz': ['elburz mts', 'alborz'],
    'eca-mountain-caucasus': ['caucasus mts', 'caucasus'],
    'eca-mountain-taurus': ['taurus mts', 'taurus'],
    'eca-mountain-kunlun': ['kunlun mountains', 'kunlun'],
    'eca-desert-dasht-e-kavir': ['kavir desert'],
    'eca-desert-dasht-e-lut': ['lut desert'],
    'wa-desert-rub-al-khali': ["rub' al khali", "rub al khali"],
    'sa-desert-atacama': ['desierto de atacama', 'atacama'],
    'sa-desert-patagonia': ['patagonia'],
    'oceania-desert-great-victoria': ['great victoria desert'],
    'oceania-mountain-great-dividing': ['great dividing range']
}

# Fallback approximate spans for features not in regions dataset
FALLBACK_SPANS = {
    # Mojave Desert span in Southern California / Nevada / Arizona
    'na-desert-mojave': {
        'type': 'Polygon',
        'coordinates': [[
            [-118.4, 34.4], [-117.8, 35.8], [-116.5, 36.8], [-114.5, 36.2],
            [-114.2, 34.8], [-115.5, 34.0], [-117.2, 34.1], [-118.4, 34.4]
        ]]
    },
    # Pennines range along northern England
    'europe-mountain-pennines': {
        'type': 'Polygon',
        'coordinates': [[
            [-2.4, 53.0], [-2.8, 53.7], [-2.7, 54.6], [-2.3, 55.3],
            [-1.8, 55.1], [-1.7, 54.2], [-1.8, 53.2], [-2.4, 53.0]
        ]]
    },
    # Great Barrier Reef coral spine along Queensland shelf
    'oceania-mountain-great-barrier-reef': {
        'type': 'Polygon',
        'coordinates': [[
            [143.5, -10.8], [145.8, -14.5], [148.5, -18.2], [152.8, -23.8],
            [153.2, -24.5], [152.0, -24.2], [147.2, -18.5], [144.5, -14.8],
            [142.8, -11.0], [143.5, -10.8]
        ]]
    }
}

out_features = []

# Process Deserts
print("\nProcessing Deserts...")
for d_id, d in deserts_meta.items():
    if d_id in FALLBACK_SPANS:
        out_features.append({
            'type': 'Feature',
            'id': d_id,
            'properties': {
                'id': d_id,
                'name': d['name'],
                'category': 'desert',
                'continent': d['continent'],
                'coords': d['coords']
            },
            'geometry': round_coords(FALLBACK_SPANS[d_id], 4)
        })
        print(f"  [Fallback Span] {d['name']}")
        continue

    aliases = [d['name']] + d.get('aliases', []) + CUSTOM_REGION_ALIASES.get(d_id, [])
    target_pt = d['coords']
    matched = []
    
    for f in all_regions:
        fc = (f['properties'].get('FEATURECLA') or '').lower()
        if fc not in ['desert', 'geoarea', 'plain', 'basin']: continue
        p_name = f['properties'].get('NAME') or ''
        p_name_alt = f['properties'].get('NAMEALT') or ''
        p_name_en = f['properties'].get('NAME_EN') or ''
        
        for a in aliases:
            na = norm(a)
            if not na: continue
            if (na == norm(p_name)) or (na in norm(p_name)) or (norm(p_name) and norm(p_name) in na) or (na == norm(p_name_alt)) or (na == norm(p_name_en)):
                c = get_geom_center(f['geometry'])
                if dist(target_pt, c) < 30.0:
                    matched.append((dist(target_pt, c), f))
                    break

    if not matched:
        print(f"Warning: No span polygon for desert {d['name']} ({d_id})")
        continue

    matched.sort(key=lambda x: x[0])
    best_poly = matched[0][1]
    geom = round_coords(best_poly['geometry'], 4)

    out_features.append({
        'type': 'Feature',
        'id': d_id,
        'properties': {
            'id': d_id,
            'name': d['name'],
            'category': 'desert',
            'continent': d['continent'],
            'coords': d['coords']
        },
        'geometry': geom
    })
    print(f"  [OK] {d['name']}")

print(f"Total deserts with spans: {len([f for f in out_features if f['properties']['category'] == 'desert'])} / {len(deserts_meta)}")

# Process Mountains
print("\nProcessing Mountains...")
for m_id, m in mountains_meta.items():
    if m_id in FALLBACK_SPANS:
        out_features.append({
            'type': 'Feature',
            'id': m_id,
            'properties': {
                'id': m_id,
                'name': m['name'],
                'category': 'mountain',
                'continent': m['continent'],
                'coords': m['coords']
            },
            'geometry': round_coords(FALLBACK_SPANS[m_id], 4)
        })
        print(f"  [Fallback Span] {m['name']}")
        continue

    aliases = [m['name']] + m.get('aliases', []) + CUSTOM_REGION_ALIASES.get(m_id, [])
    target_pt = m['coords']
    matched = []
    
    for f in all_regions:
        fc = (f['properties'].get('FEATURECLA') or '').lower()
        if fc not in ['range/mtn', 'plateau', 'geoarea', 'foothills', 'tundra', 'valley', 'basin']: continue
        p_name = f['properties'].get('NAME') or ''
        p_name_alt = f['properties'].get('NAMEALT') or ''
        p_name_en = f['properties'].get('NAME_EN') or ''
        
        for a in aliases:
            na = norm(a)
            if not na: continue
            if (na == norm(p_name)) or (na in norm(p_name)) or (norm(p_name) and norm(p_name) in na) or (na == norm(p_name_alt)) or (na == norm(p_name_en)):
                c = get_geom_center(f['geometry'])
                if dist(target_pt, c) < 35.0:
                    matched.append((dist(target_pt, c), f))
                    break

    if not matched:
        print(f"Warning: No span polygon for mountain {m['name']} ({m_id})")
        continue

    matched.sort(key=lambda x: x[0])
    best_poly = matched[0][1]
    geom = round_coords(best_poly['geometry'], 4)

    out_features.append({
        'type': 'Feature',
        'id': m_id,
        'properties': {
            'id': m_id,
            'name': m['name'],
            'category': 'mountain',
            'continent': m['continent'],
            'coords': m['coords']
        },
        'geometry': geom
    })
    print(f"  [OK] {m['name']}")

print(f"Total mountains with spans: {len([f for f in out_features if f['properties']['category'] == 'mountain'])} / {len(mountains_meta)}")

out_collection = {
    'type': 'FeatureCollection',
    'features': out_features
}

with open(OUT_PATH, 'w', encoding='utf-8') as f:
    json.dump(out_collection, f, separators=(',', ':'))

file_size_kb = os.path.getsize(OUT_PATH) / 1024
print(f"\nSuccessfully generated {OUT_PATH}")
print(f"Total landforms features: {len(out_features)}")
print(f"File size: {file_size_kb:.1f} KB")
