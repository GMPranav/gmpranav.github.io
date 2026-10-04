import urllib.request
import json
import os
import re

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "map-quiz", "data")
os.makedirs(DATA_DIR, exist_ok=True)

WORLD_TOPO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json"
WORLD_LOCAL_PATH = os.path.join(DATA_DIR, "world.json")

print("Downloading world-atlas 50m TopoJSON...")
req = urllib.request.Request(WORLD_TOPO_URL, headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(req) as resp:
    topo_bytes = resp.read()

with open(WORLD_LOCAL_PATH, "wb") as f:
    f.write(topo_bytes)
print(f"Saved {WORLD_LOCAL_PATH} ({len(topo_bytes)} bytes)")

topo_data = json.loads(topo_bytes.decode("utf-8"))
countries_geoms = topo_data["objects"]["countries"]["geometries"]
print(f"Total country geometries: {len(countries_geoms)}")

country_map = {}
for g in countries_geoms:
    cid = str(g.get("id"))
    cname = g.get("properties", {}).get("name")
    if cid and cname:
        country_map[cid] = cname

print(f"Mapped {len(country_map)} country names from TopoJSON")

# Print some samples
sample_names = sorted(list(country_map.values()))[:25]
print("Sample country names:", sample_names)
