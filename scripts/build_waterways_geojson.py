import json, urllib.request, math, re, os

print("=== Building True Outline Waterways Database ===")

PHYS_PATH = os.path.join(os.path.dirname(__file__), '..', 'map-quiz', 'data', 'physical-data.json')
OUT_PATH = os.path.join(os.path.dirname(__file__), '..', 'map-quiz', 'data', 'waterways.json')

with open(PHYS_PATH, 'r', encoding='utf-8') as f:
    phys_data = json.load(f)

features = phys_data['features']
rivers_meta = {k: v for k, v in features.items() if v['category'] == 'river'}
lakes_meta = {k: v for k, v in features.items() if v['category'] == 'lake'}

def get_geojson(url):
    print(f"Fetching {url.split('/')[-1]}...")
    req = urllib.request.urlopen(url, timeout=50)
    return json.loads(req.read().decode('utf-8'))['features']

ne_50m_rivers = get_geojson('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_rivers_lake_centerlines.geojson')
ne_10m_rivers = get_geojson('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_rivers_lake_centerlines.geojson')
ne_50m_lakes = get_geojson('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_lakes.geojson')
ne_10m_lakes = get_geojson('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_lakes.geojson')
ne_10m_marine = get_geojson('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_geography_marine_polys.geojson')

all_rivers = ne_50m_rivers + ne_10m_rivers
all_lakes = ne_50m_lakes + ne_10m_lakes + ne_10m_marine

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

def norm_name(s):
    s = (s or '').lower()
    s = re.sub(r'^(lake|river|rio|fleuve|lac|sea of|gulf of)\s+', '', s)
    s = re.sub(r'\s+(river|lake|sea|fleuve|darya|he)$', '', s)
    return re.sub(r'[^a-z0-9]', '', s)

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

CUSTOM_ALIASES = {
    'africa-river-juba': ['jubba', 'juba'],
    'africa-river-shebelli': ['shabeelle', 'shebele', 'shabelle'],
    'sa-lake-poopo': ['poopo', 'lago poopo'],
    'sa-lake-maracaibo': ['maracaibo', 'lago de maracaibo'],
    'sa-lake-patos': ['patos', 'lagoa dos patos'],
    'wa-lake-urmia': ['urmia', 'daryacheh ye orumiyeh', 'orumiyeh'],
    'wa-lake-van': ['lake van', 'van golu'],
    'wa-lake-dead-sea': ['dead sea', 'yam hamelah', 'al bahr al mayyit'],
    'sea-river-chao-phraya': ['chao phraya', 'mae nam chao phraya'],
    'sa-river-essequibo': ['essequibo'],
    'ea-river-pearl-river': ['xi', 'xi jiang', 'pearl', 'zhu jiang']
}

out_features = []

# Process Rivers
print("\nProcessing Rivers...")
for r_id, r in rivers_meta.items():
    aliases = [r['name']] + r.get('aliases', []) + CUSTOM_ALIASES.get(r_id, [])
    target_pt = r['coords']
    matched_lines = []
    
    # Check 50m first, then 10m if needed
    for f in all_rivers:
        props = f['properties']
        p_names = [props.get('name'), props.get('name_alt'), props.get('name_en')]
        name_match = False
        for p in p_names:
            if not p: continue
            np = norm_name(p)
            if not np: continue
            for a in aliases:
                na = norm_name(a)
                if na and (na == np or (len(na) > 3 and na in np) or (len(np) > 3 and np in na)):
                    name_match = True
                    break
            if name_match: break
            
        if name_match:
            center = get_geom_center(f['geometry'])
            if dist(target_pt, center) < 35.0:
                geom = f['geometry']
                if geom['type'] == 'LineString':
                    matched_lines.append(geom['coordinates'])
                elif geom['type'] == 'MultiLineString':
                    matched_lines.extend(geom['coordinates'])

    if not matched_lines:
        print(f"Warning: No geometry found for river {r['name']} ({r_id})")
        continue

    # Clean and round coordinates
    clean_coords = []
    seen = set()
    for line in matched_lines:
        key = str(line[:2])
        if key not in seen:
            seen.add(key)
            clean_coords.append([[round(pt[0], 4), round(pt[1], 4)] for pt in line])

    combined_geom = {
        'type': 'MultiLineString' if len(clean_coords) > 1 else 'LineString',
        'coordinates': clean_coords if len(clean_coords) > 1 else clean_coords[0]
    }

    out_features.append({
        'type': 'Feature',
        'id': r_id,
        'properties': {
            'id': r_id,
            'name': r['name'],
            'category': 'river',
            'continent': r['continent'],
            'coords': r['coords']
        },
        'geometry': combined_geom
    })

print(f"Total rivers with true vector outlines: {len([f for f in out_features if f['properties']['category'] == 'river'])} / {len(rivers_meta)}")

# Process Lakes
print("\nProcessing Lakes...")
for l_id, l in lakes_meta.items():
    aliases = [l['name']] + l.get('aliases', []) + CUSTOM_ALIASES.get(l_id, [])
    target_pt = l['coords']
    matched_polys = []
    
    for f in all_lakes:
        props = f['properties']
        p_names = [props.get('name'), props.get('name_alt'), props.get('name_en')]
        name_match = False
        for p in p_names:
            if not p: continue
            np = norm_name(p)
            if not np: continue
            for a in aliases:
                na = norm_name(a)
                if na and (na == np or (len(na) > 3 and na in np) or (len(np) > 3 and np in na)):
                    name_match = True
                    break
            if name_match: break
            
        if name_match:
            center = get_geom_center(f['geometry'])
            d = dist(target_pt, center)
            if d < 25.0:
                matched_polys.append((d, f))

    if not matched_polys:
        print(f"Warning: No geometry found for lake {l['name']} ({l_id})")
        continue

    # Pick best (closest center)
    matched_polys.sort(key=lambda x: x[0])
    best_poly = matched_polys[0][1]
    geom = round_coords(best_poly['geometry'], 4)

    out_features.append({
        'type': 'Feature',
        'id': l_id,
        'properties': {
            'id': l_id,
            'name': l['name'],
            'category': 'lake',
            'continent': l['continent'],
            'coords': l['coords']
        },
        'geometry': geom
    })

print(f"Total lakes with true vector outlines: {len([f for f in out_features if f['properties']['category'] == 'lake'])} / {len(lakes_meta)}")

out_collection = {
    'type': 'FeatureCollection',
    'features': out_features
}

with open(OUT_PATH, 'w', encoding='utf-8') as f:
    json.dump(out_collection, f, separators=(',', ':'))

file_size_kb = os.path.getsize(OUT_PATH) / 1024
print(f"\nSuccessfully generated {OUT_PATH}")
print(f"Total waterways features: {len(out_features)}")
print(f"File size: {file_size_kb:.1f} KB")
