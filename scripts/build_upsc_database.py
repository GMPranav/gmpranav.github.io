# -*- coding: utf-8 -*-
"""
Generates upsc-data.json combining:
- TopoJSON country IDs and geometry names
- Full UPSC Map Reading syllabus notes (40 class notes images)
- High-yield mnemonics (BURGER T, LIST, MEN SOW SEEDS, I B SO QUIK, TARIK, Rabbit says MALE, B.Sc M.A PhD, etc.)
- Aliases for typing tolerance
- Continent and regional bounds for D3 projections
"""

import json
import os

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "map-quiz", "data")
WORLD_FILE = os.path.join(DATA_DIR, "world.json")
OUTPUT_FILE = os.path.join(DATA_DIR, "upsc-data.json")

# Load world topojson
with open(WORLD_FILE, "r", encoding="utf-8") as f:
    topo = json.load(f)

geoms = topo["objects"]["countries"]["geometries"]
topo_countries = {}
for g in geoms:
    cid = str(g.get("id"))
    name = g.get("properties", {}).get("name")
    if cid and name:
        topo_countries[cid] = name

print(f"Loaded {len(topo_countries)} countries from TopoJSON")

# UPSC Knowledge Base curated from handwritten notes & standard UPSC GS-1 syllabus
UPSC_KNOWLEDGE = {
    # --- NORTH & WEST AFRICA ---
    "504": { # Morocco
        "name": "Morocco",
        "capital": "Rabat",
        "continent": "Africa",
        "subregion": "North Africa / Maghreb",
        "mnemonic": "Rabbit says MALE (M - Morocco)",
        "notes": "Controls ~70% of world's rock phosphate reserves (essential for NPK fertilizers). Borders Mediterranean Sea, Atlantic Ocean, and Strait of Gibraltar. Contains the High Atlas Mountains (Toubkal peak). Administers Western Sahara territory (disputed with Polisario Front).",
        "tags": ["Maghreb", "Phosphates", "Strait of Gibraltar", "Atlas Mountains", "Rabbit says MALE"],
        "aliases": ["morocco", "maroc", "al maghrib"]
    },
    "012": { # Algeria
        "name": "Algeria",
        "capital": "Algiers",
        "continent": "Africa",
        "subregion": "North Africa / Maghreb",
        "mnemonic": "Rabbit says MALE (A - Algeria)",
        "notes": "Largest country in Africa by land area. Major crude oil and natural gas supplier to Europe via underwater pipelines (Medgaz, Transmed). Over 80% covered by Sahara Desert. Ahaggar Mountains (Mount Tahat). OPEC member.",
        "tags": ["Maghreb", "OPEC", "Sahara", "Oil & Gas", "Rabbit says MALE"],
        "aliases": ["algeria", "algerie"]
    },
    "788": { # Tunisia
        "name": "Tunisia",
        "capital": "Tunis",
        "continent": "Africa",
        "subregion": "North Africa / Maghreb",
        "mnemonic": "Play TUNE (Tunisia)",
        "notes": "Northernmost country in Africa (Cape Angela). Major producer and exporter of olive oil and dates. Birthplace of the Arab Spring (2010 Jasmine Revolution). Ancient Carthage ruins near Tunis.",
        "tags": ["Maghreb", "Olive Oil", "Arab Spring", "Mediterranean"],
        "aliases": ["tunisia", "tunisie"]
    },
    "434": { # Libya
        "name": "Libya",
        "capital": "Tripoli",
        "continent": "Africa",
        "subregion": "North Africa",
        "mnemonic": "Rabbit says MALE (L - Libya)",
        "notes": "Largest proven crude oil reserves in Africa (Sirte Basin). Bordered by Mediterranean Sea (Gulf of Sirte). Great Man-Made River fossil water aquifer system. Post-Gaddafi division between Tripoli (west) and Tobruk/Benghazi (east).",
        "tags": ["North Africa", "OPEC", "Sirte Basin", "Crude Oil", "Rabbit says MALE"],
        "aliases": ["libya", "libye"]
    },
    "818": { # Egypt
        "name": "Egypt",
        "capital": "Cairo",
        "continent": "Africa",
        "subregion": "North Africa",
        "mnemonic": "Rabbit says MALE (E - Egypt) | Red Sea (MEN SOW SEEDS)",
        "notes": "Suez Canal (opened 1869, 193 km, connects Port Said on Mediterranean to Port Tewfik on Red Sea; handles ~12% global trade). Sinai Peninsula forms land bridge between Africa and Asia. Nile River basin; Aswan High Dam and Lake Nasser. Bordered by Red Sea and Mediterranean.",
        "tags": ["Suez Canal", "Nile", "Red Sea", "Sinai", "Rabbit says MALE", "MEN SOW SEEDS"],
        "aliases": ["egypt", "misr"]
    },
    "729": { # Sudan
        "name": "Sudan",
        "capital": "Khartoum",
        "continent": "Africa",
        "subregion": "East Africa / Sahel",
        "mnemonic": "SHOOTING (Sudan) | Red Sea (MEN SOW SEEDS)",
        "notes": "Confluence of Blue Nile (from Lake Tana, Ethiopia) and White Nile (from Lake Victoria) at Khartoum. Red Sea coastline with Port Sudan. Conflict epicenter: Darfur region, Kordofan, and ongoing SAF vs RSF conflict. Gum arabic world leader (~70% supply).",
        "tags": ["Sahel", "Darfur", "Blue Nile", "White Nile", "Red Sea", "MEN SOW SEEDS", "Port Sudan"],
        "aliases": ["sudan", "north sudan"]
    },
    "728": { # South Sudan
        "name": "South Sudan",
        "capital": "Juba",
        "continent": "Africa",
        "subregion": "East Africa",
        "mnemonic": "Sailing south (South Sudan)",
        "notes": "Youngest internationally recognized country in the world (gained independence in 2011 from Sudan). Completely landlocked. Vast oilfields (Melut and Muglad basins) piped north to Port Sudan. Contains the Sudd, one of the world's largest tropical freshwater wetlands.",
        "tags": ["Landlocked", "Oil", "Sudd Wetland", "Juba", "UN 193rd Member"],
        "aliases": ["south sudan", "s sudan", "s. sudan"]
    },

    # --- HORN OF AFRICA ---
    "231": { # Ethiopia
        "name": "Ethiopia",
        "capital": "Addis Ababa",
        "continent": "Africa",
        "subregion": "Horn of Africa",
        "mnemonic": "HOP (Ethiopia) | Horn of Africa (SEED)",
        "notes": "Most populous landlocked country in the world. Headwaters of Blue Nile (Lake Tana). Constructed the Grand Ethiopian Renaissance Dam (GERD), sparking downstream disputes with Egypt and Sudan. Birthplace of Arabica coffee (Kaffa). Headquarters of African Union (Addis Ababa). Conflict: Tigray region.",
        "tags": ["Horn of Africa", "Landlocked", "GERD Dam", "Blue Nile", "Coffee", "Tigray", "African Union"],
        "aliases": ["ethiopia", "ethiopie"]
    },
    "232": { # Eritrea
        "name": "Eritrea",
        "capital": "Asmara",
        "continent": "Africa",
        "subregion": "Horn of Africa",
        "mnemonic": "Stand EDge (Eritrea) | Red Sea (MEN SOW SEEDS) | Horn of Africa (SEED)",
        "notes": "Stretches along the southern Red Sea coast. Ports of Massawa and Assab. Seceded from Ethiopia in 1993, making Ethiopia landlocked. Dahlak Archipelago. Danakil Depression border.",
        "tags": ["Horn of Africa", "Red Sea", "Asmara", "MEN SOW SEEDS", "SEED"],
        "aliases": ["eritrea"]
    },
    "262": { # Djibouti
        "name": "Djibouti",
        "capital": "Djibouti City",
        "continent": "Africa",
        "subregion": "Horn of Africa",
        "mnemonic": "Stand EDge (Djibouti) | Bab-el-Mandeb | Horn of Africa (SEED)",
        "notes": "Guards the western gate of Bab-el-Mandeb Strait ('Gate of Tears') linking Red Sea to Gulf of Aden. Prime maritime logistics hub hosting military bases from USA (Camp Lemonnier), China, France, and Japan. Lake Assal is the lowest point in Africa (-155 m). Main sea outlet for landlocked Ethiopia.",
        "tags": ["Bab-el-Mandeb", "Chokepoint", "Military Bases", "Lake Assal", "Horn of Africa", "SEED", "MEN SOW SEEDS"],
        "aliases": ["djibouti"]
    },
    "706": { # Somalia
        "name": "Somalia",
        "capital": "Mogadishu",
        "continent": "Africa",
        "subregion": "Horn of Africa",
        "mnemonic": "Horn of Africa (SEED)",
        "notes": "Longest coastline on mainland Africa (~3,300 km), along Gulf of Aden and Indian Ocean. Geopolitical flashpoint: Gulf of Aden piracy, Al-Shabaab insurgency. De-facto autonomous Somaliland in the north (Berbera port deal with Ethiopia) and Puntland. Cape Guardafui tip.",
        "tags": ["Horn of Africa", "Indian Ocean", "Gulf of Aden", "Somaliland", "Puntland", "Piracy", "SEED"],
        "aliases": ["somalia", "somalie"]
    },

    # --- EAST & CENTRAL AFRICA ---
    "404": { # Kenya
        "name": "Kenya",
        "capital": "Nairobi",
        "continent": "Africa",
        "subregion": "East Africa",
        "notes": "Crossed by Equator and Great Rift Valley. Mombasa port is gateway to East Africa (Northern Corridor to Uganda, Rwanda, South Sudan). World leader in black tea export, horticulture, cut flowers, and geothermal energy (Olkaria). Mount Kenya (2nd highest peak in Africa). Lake Victoria coast.",
        "tags": ["East Africa", "Equator", "Mombasa", "Tea", "Rift Valley", "Lake Victoria"],
        "aliases": ["kenya"]
    },
    "834": { # Tanzania
        "name": "Tanzania",
        "capital": "Dodoma",
        "continent": "Africa",
        "subregion": "East Africa",
        "notes": "Mount Kilimanjaro (highest peak in Africa, 5,895 m). Serengeti National Park and Ngorongoro Crater. Zanzibar archipelago (cloves, spice island). Dar es Salaam commercial port. Contains parts of 3 Great Lakes: Lake Victoria, Lake Tanganyika (2nd deepest in world), Lake Malawi.",
        "tags": ["Kilimanjaro", "Serengeti", "Zanzibar", "Dar es Salaam", "Great Lakes", "Graphite"],
        "aliases": ["tanzania"]
    },
    "800": { # Uganda
        "name": "Uganda",
        "capital": "Kampala",
        "continent": "Africa",
        "subregion": "East Africa",
        "notes": "Landlocked country on equator. Lake Victoria shoreline; source of White Nile at Jinja (Owen Falls Dam). Ruwenzori Mountains ('Mountains of the Moon'). Major robusta coffee and tea exporter. East African Crude Oil Pipeline (EACOP) to Tanga port, Tanzania.",
        "tags": ["Landlocked", "Equator", "Lake Victoria", "White Nile", "EACOP", "Coffee"],
        "aliases": ["uganda"]
    },
    "646": { # Rwanda
        "name": "Rwanda",
        "capital": "Kigali",
        "continent": "Africa",
        "subregion": "East/Central Africa",
        "notes": "'Land of a Thousand Hills'. Highly dense landlocked nation in Great Lakes region. Lake Kivu (contains dissolved methane). Major coltan and tantalum processor. Virunga volcanic mountains.",
        "tags": ["Landlocked", "Great Lakes", "Kigali", "Coltan", "Virunga"],
        "aliases": ["rwanda"]
    },
    "108": { # Burundi
        "name": "Burundi",
        "capital": "Gitega",
        "continent": "Africa",
        "subregion": "East/Central Africa",
        "notes": "Small landlocked Great Lakes country bordering Lake Tanganyika, Rwanda, and DRC. Coffee and tea exports, nickel reserves.",
        "tags": ["Landlocked", "Lake Tanganyika", "Great Lakes"],
        "aliases": ["burundi"]
    },
    "180": { # Dem. Rep. Congo
        "name": "Democratic Republic of the Congo",
        "capital": "Kinshasa",
        "continent": "Africa",
        "subregion": "Central Africa",
        "notes": "Controls ~70% of world's cobalt production and massive reserves of coltan, copper, lithium, and tantalum. Congo River is 2nd largest river by discharge in world, crosses Equator twice, Grand Inga Dam potential. Eastern conflict in Kivu and Ituri (M23 rebel group, FDLR).",
        "tags": ["Cobalt", "Critical Minerals", "Congo River", "Kivu", "Ituri", "M23", "Katanga Copperbelt", "Equator"],
        "aliases": ["dr congo", "drc", "dem rep congo", "congo kinshasa", "democratic republic of the congo", "democratic republic of congo"]
    },
    "178": { # Republic of the Congo
        "name": "Republic of the Congo",
        "capital": "Brazzaville",
        "continent": "Africa",
        "subregion": "Central Africa",
        "notes": "Separated from DRC across Congo River (Brazzaville & Kinshasa are closest capitals in world). Atlantic port of Pointe-Noire. Major oil and timber exporter. Crossed by Equator.",
        "tags": ["Congo River", "Equator", "Brazzaville", "Oil", "Timber"],
        "aliases": ["congo", "republic of the congo", "congo brazzaville"]
    },
    "266": { # Gabon
        "name": "Gabon",
        "capital": "Libreville",
        "continent": "Africa",
        "subregion": "Central Africa",
        "notes": "Crossed by Equator. World's 2nd largest producer of manganese ore (Moanda mine). Heavily forested (~88% forest cover), major carbon sink. Oil exporter, former OPEC member.",
        "tags": ["Equator", "Manganese", "Congo Basin", "Moanda", "Oil"],
        "aliases": ["gabon"]
    },
    "226": { # Equatorial Guinea
        "name": "Equatorial Guinea",
        "capital": "Malabo",
        "continent": "Africa",
        "subregion": "Central Africa",
        "notes": "Only Spanish-speaking sovereign country in Africa. Capital Malabo is on Bioko Island in Gulf of Guinea, while continental territory is Rio Muni. Major offshore oil producer.",
        "tags": ["Oil", "Bioko Island", "Gulf of Guinea", "Spanish-speaking Africa"],
        "aliases": ["eq guinea", "eq. guinea", "equatorial guinea"]
    },
    "120": { # Cameroon
        "name": "Cameroon",
        "capital": "Yaoundé",
        "continent": "Africa",
        "subregion": "Central Africa",
        "notes": "'Africa in miniature' (diverse biomes from Sahel to rainforest). Mount Cameroon active volcano. Lake Nyos (limnic eruption 1986). Chad-Cameroon oil pipeline terminates at Kribi port.",
        "tags": ["Gulf of Guinea", "Mount Cameroon", "Lake Nyos", "Kribi"],
        "aliases": ["cameroon", "cameroun"]
    },
    "140": { # Central African Republic
        "name": "Central African Republic",
        "capital": "Bangui",
        "continent": "Africa",
        "subregion": "Central Africa",
        "notes": "Landlocked country rich in diamonds, gold, and uranium. Ubangi River forms southern border. Ongoing civil conflict involving rebel coalitions and Russian Wagner/Africa Corps presence.",
        "tags": ["Landlocked", "Sahel/Savanna", "Diamonds", "Ubangi River", "Wagner"],
        "aliases": ["central african republic", "car", "central african rep."]
    },
    "148": { # Chad
        "name": "Chad",
        "capital": "N'Djamena",
        "continent": "Africa",
        "subregion": "Sahel / Central Africa",
        "notes": "Landlocked country dominated by Sahara in north (Tibesti Mountains) and Sahel. Lake Chad has shrunk by >90% since 1960s due to climate change and irrigation, impacting 30 million people. Member of G5 Sahel.",
        "tags": ["Sahel", "Lake Chad", "Tibesti", "Landlocked", "G5 Sahel"],
        "aliases": ["chad", "tchad"]
    },

    # --- SOUTHERN AFRICA ---
    "024": { # Angola
        "name": "Angola",
        "capital": "Luanda",
        "continent": "Africa",
        "subregion": "Southern Africa",
        "notes": "One of Africa's top crude oil producers; quit OPEC in 2024 over quota dispute. Rich in alluvial diamonds. Lobito Corridor railway connects DRC & Zambia copper/cobalt belts to Atlantic. Exclave of Cabinda produces ~60% of its oil.",
        "tags": ["Oil", "Lobito Corridor", "Cabinda", "Diamonds", "OPEC exit 2024"],
        "aliases": ["angola"]
    },
    "894": { # Zambia
        "name": "Zambia",
        "capital": "Lusaka",
        "continent": "Africa",
        "subregion": "Southern Africa",
        "notes": "Landlocked country. Copperbelt province is Africa's 2nd largest copper producer and major cobalt source. Victoria Falls (Mosi-oa-Tunya) on Zambezi River border with Zimbabwe. Lake Kariba hydroelectric dam.",
        "tags": ["Landlocked", "Copperbelt", "Zambezi", "Victoria Falls", "Lake Kariba"],
        "aliases": ["zambia"]
    },
    "716": { # Zimbabwe
        "name": "Zimbabwe",
        "capital": "Harare",
        "continent": "Africa",
        "subregion": "Southern Africa",
        "notes": "Landlocked between Zambezi and Limpopo rivers. World's 3rd largest platinum reserves (Great Dyke mineral complex). Massive lithium deposits (Bikita mine; banned raw lithium exports to promote domestic refining). Victoria Falls.",
        "tags": ["Landlocked", "Great Dyke", "Platinum", "Lithium", "Zambezi", "Limpopo"],
        "aliases": ["zimbabwe"]
    },
    "508": { # Mozambique
        "name": "Mozambique",
        "capital": "Maputo",
        "continent": "Africa",
        "subregion": "Southern Africa",
        "notes": "Coastline along Mozambique Channel (Indian Ocean). Giant offshore natural gas reserves in Rovuma Basin (Cabo Delgado province; hit by Islamist insurgency). Major graphite producer (Balama mine, world's largest). Zambezi river delta; Cahora Bassa dam.",
        "tags": ["Mozambique Channel", "Rovuma Basin", "LNG", "Cabo Delgado", "Graphite", "Zambezi"],
        "aliases": ["mozambique"]
    },
    "454": { # Malawi
        "name": "Malawi",
        "capital": "Lilongwe",
        "continent": "Africa",
        "subregion": "Southern Africa",
        "notes": "Narrow landlocked country dominated by Lake Malawi (Lake Nyasa, 3rd largest lake in Africa, renowned for endemic cichlid fish). Major tobacco, tea, and sugar exporter.",
        "tags": ["Landlocked", "Lake Malawi", "Tobacco", "Rift Valley"],
        "aliases": ["malawi"]
    },
    "516": { # Namibia
        "name": "Namibia",
        "capital": "Windhoek",
        "continent": "Africa",
        "subregion": "Southern Africa",
        "notes": "Namib Desert along Atlantic coast (oldest desert in world, Sossusvlei dunes). Major uranium producer (Rössing and Husab mines, #3 in world). Marine diamond dredging. Walvis Bay deepwater port. Caprivi Strip connects to Zambezi River.",
        "tags": ["Namib Desert", "Uranium", "Diamonds", "Walvis Bay", "Caprivi Strip"],
        "aliases": ["namibia"]
    },
    "072": { # Botswana
        "name": "Botswana",
        "capital": "Gaborone",
        "continent": "Africa",
        "subregion": "Southern Africa",
        "notes": "World's top diamond producer by value (Debswana partnership; Jwaneng & Orapa mines). Completely landlocked; dominated by Kalahari Desert. Okavango Delta: world's largest inland delta, drains into desert sands without reaching sea.",
        "tags": ["Landlocked", "Kalahari", "Diamonds", "Okavango Delta", "Debswana"],
        "aliases": ["botswana"]
    },
    "710": { # South Africa
        "name": "South Africa",
        "capital": "Pretoria (Exec), Cape Town (Leg), Bloemfontein (Jud)",
        "continent": "Africa",
        "subregion": "Southern Africa",
        "notes": "World leader in Platinum Group Metals (PGMs - >70% of world supply from Bushveld Igneous Complex), chromium, manganese, gold (Witwatersrand basin), and diamonds (Kimberley). Cape of Good Hope & Cape Agulhas (southernmost point of Africa, boundary between Atlantic & Indian Oceans). BRICS member.",
        "tags": ["Bushveld Complex", "PGMs", "Chromium", "Cape Agulhas", "BRICS", "Witwatersrand", "Durban Port"],
        "aliases": ["south africa", "rsa", "za"]
    },
    "426": { # Lesotho
        "name": "Lesotho",
        "capital": "Maseru",
        "continent": "Africa",
        "subregion": "Southern Africa",
        "notes": "Enclaved completely within South Africa. Drakensberg / Maloti Mountains; entire country sits above 1,000 m ('Kingdom in the Sky'). Lesotho Highlands Water Project supplies water to South Africa's Gauteng industrial hub.",
        "tags": ["Enclave", "Landlocked", "Drakensberg", "Highlands Water Project"],
        "aliases": ["lesotho"]
    },
    "748": { # Eswatini
        "name": "Eswatini",
        "capital": "Mbabane / Lobamba",
        "continent": "Africa",
        "subregion": "Southern Africa",
        "notes": "Formerly Swaziland. Small landlocked kingdom bordering South Africa and Mozambique. Sugar cane and forestry.",
        "tags": ["Landlocked", "Swaziland", "Southern Africa"],
        "aliases": ["eswatini", "swaziland"]
    },
    "450": { # Madagascar
        "name": "Madagascar",
        "capital": "Antananarivo",
        "continent": "Africa",
        "subregion": "Indian Ocean Island",
        "notes": "4th largest island in the world. Separated from Africa by Mozambique Channel. Global leader in natural vanilla (~80% supply), nickel-cobalt (Ambatovy mine), and ilmenite. Extreme biodiversity endemism (>90% species found nowhere else, including lemurs). Canal des Pangalanes.",
        "tags": ["Indian Ocean", "Vanilla", "Mozambique Channel", "Biodiversity Hotspot", "Lemurs"],
        "aliases": ["madagascar"]
    },

    # --- WEST AFRICA ---
    "566": { # Nigeria
        "name": "Nigeria",
        "capital": "Abuja",
        "continent": "Africa",
        "subregion": "West Africa",
        "notes": "Most populous country in Africa (~220M). Leading crude oil exporter in Africa (Bonny Light crude from Niger Delta). Major gas reserves (NLNG Bonny Island, proposed Nigeria-Morocco Gas Pipeline). Lagos is commercial mega-city. Security challenges: Boko Haram in Lake Chad basin, banditry in Zamfara.",
        "tags": ["Niger Delta", "OPEC", "Oil & Gas", "Lagos", "Boko Haram", "Most Populous Africa"],
        "aliases": ["nigeria"]
    },
    "562": { # Niger
        "name": "Niger",
        "capital": "Niamey",
        "continent": "Africa",
        "subregion": "Sahel",
        "notes": "Landlocked Sahelian country. Major uranium producer in Africa (Arlit and Imouraren mines, key supplier to French nuclear reactors). Member of Alliance of Sahel States (AES) following 2023 military coup. Niger River flows through.",
        "tags": ["Sahel", "Uranium", "Arlit", "Landlocked", "Alliance of Sahel States", "Niger River"],
        "aliases": ["niger"]
    },
    "466": { # Mali
        "name": "Mali",
        "capital": "Bamako",
        "continent": "Africa",
        "subregion": "Sahel",
        "notes": "Landlocked Sahelian country. 3rd largest gold producer in Africa. Historic city of Timbuktu. Inland Niger Delta (wetland in semi-arid Sahel). Northern Tuareg / Azawad separatist and Islamist insurgency. AES member.",
        "tags": ["Sahel", "Gold", "Timbuktu", "Inland Niger Delta", "Azawad", "Alliance of Sahel States"],
        "aliases": ["mali"]
    },
    "854": { # Burkina Faso
        "name": "Burkina Faso",
        "capital": "Ouagadougou",
        "continent": "Africa",
        "subregion": "Sahel",
        "notes": "Landlocked country in Sahel. Formerly Upper Volta (Volta river headwaters). Major gold producer. AES member following military coups.",
        "tags": ["Sahel", "Gold", "Landlocked", "Alliance of Sahel States", "Upper Volta"],
        "aliases": ["burkina faso", "burkina"]
    },
    "288": { # Ghana
        "name": "Ghana",
        "capital": "Accra",
        "continent": "Africa",
        "subregion": "West Africa",
        "notes": "Top gold producer in Africa (former 'Gold Coast'). World's 2nd largest cocoa exporter. Lake Volta is world's largest manmade reservoir by surface area (created by Akosombo Dam).",
        "tags": ["Gold Coast", "Cocoa", "Lake Volta", "Akosombo Dam", "Gulf of Guinea"],
        "aliases": ["ghana"]
    },
    "384": { # Côte d'Ivoire
        "name": "Côte d'Ivoire",
        "capital": "Yamoussoukro / Abidjan",
        "continent": "Africa",
        "subregion": "West Africa",
        "notes": "World's #1 producer and exporter of cocoa beans (~45% of global market). Major cashew producer. Abidjan is major West African seaport and financial center.",
        "tags": ["Cocoa #1", "Cashews", "Abidjan", "Gulf of Guinea"],
        "aliases": ["cote d'ivoire", "ivory coast", "cote divoire", "côte d'ivoire"]
    },
    "686": { # Senegal
        "name": "Senegal",
        "capital": "Dakar",
        "continent": "Africa",
        "subregion": "West Africa",
        "notes": "Cap-Vert Peninsula is the westernmost point of mainland Africa. Dakar is a major Atlantic port. Encloses The Gambia on three sides. Major peanut/groundnut producer; new offshore oil & gas producer (Sangomar, Greater Tortue Ahmeyim).",
        "tags": ["Westernmost Mainland Africa", "Cap-Vert", "Dakar", "Atlantic Coast", "Groundnuts"],
        "aliases": ["senegal"]
    },
    "270": { # The Gambia
        "name": "The Gambia",
        "capital": "Banjul",
        "continent": "Africa",
        "subregion": "West Africa",
        "notes": "Smallest country in mainland Africa. Narrow strip surrounding Gambia River, entirely bordered by Senegal except for short Atlantic coast.",
        "tags": ["Gambia River", "Smallest Mainland Africa", "Enclave within Senegal"],
        "aliases": ["gambia", "the gambia"]
    },
    "324": { # Guinea
        "name": "Guinea",
        "capital": "Conakry",
        "continent": "Africa",
        "subregion": "West Africa",
        "notes": "World's largest bauxite exporter (~25% global bauxite reserves). Simandou mountain range holds world's largest untapped high-grade iron ore reserve. Source of Niger, Senegal, and Gambia rivers in Fouta Djallon highlands.",
        "tags": ["Bauxite #1", "Simandou Iron Ore", "Fouta Djallon", "Water Tower of West Africa"],
        "aliases": ["guinea", "guinee"]
    },
    "478": { # Mauritania
        "name": "Mauritania",
        "capital": "Nouakchott",
        "continent": "Africa",
        "subregion": "Sahel / West Africa",
        "notes": "Connects North Africa (Maghreb) with sub-Saharan Africa. Major iron ore exporter (Zouérat mines connected to Nouadhibou port by the famous 2.5-km Mauritania Railway train). Rich Atlantic fisheries.",
        "tags": ["Sahel", "Iron Ore", "Zouerete Train", "Sahara", "Atlantic Coast"],
        "aliases": ["mauritania"]
    },

    # --- WEST ASIA / MIDDLE EAST ---
    "792": { # Turkey / Türkiye
        "name": "Türkiye",
        "capital": "Ankara",
        "continent": "West Asia",
        "subregion": "Middle East / Eurasia",
        "mnemonic": "Turkey Biryani | LIST (Med) | BURGER T (Black Sea)",
        "notes": "Straddles Europe and Asia (Anatolian peninsula + East Thrace). Controls the Turkish Straits (Bosporus & Dardanelles via Sea of Marmara), regulated by 1936 Montreux Convention. Headwaters of Tigris and Euphrates rivers (GAP dam project). Borders Black Sea, Aegean Sea, and Mediterranean Sea. Earthquake-prone (North Anatolian Fault).",
        "tags": ["Bosporus", "Dardanelles", "Montreux Convention", "LIST", "BURGER T", "Tigris-Euphrates", "NATO"],
        "aliases": ["turkey", "turkiye", "türkiye"]
    },
    "760": { # Syria
        "name": "Syria",
        "capital": "Damascus",
        "continent": "West Asia",
        "subregion": "Levant",
        "mnemonic": "Cereal (Syria) | LIST (Med)",
        "notes": "Crossed by Euphrates River (Tabqa Dam/Lake Assad). Mediterranean coastline (Tartus naval base, Latakia). Golan Heights occupied by Israel since 1967 Six-Day War. Ancient cities of Damascus, Aleppo, Palmyra. Civil war flashpoints: Idlib, Rojava (Kurdish northeast).",
        "tags": ["Levant", "Golan Heights", "Euphrates", "LIST", "Tartus Port", "Mediterranean"],
        "aliases": ["syria"]
    },
    "422": { # Lebanon
        "name": "Lebanon",
        "capital": "Beirut",
        "continent": "West Asia",
        "subregion": "Levant",
        "mnemonic": "Naan (Lebanon) | LIST (Med)",
        "notes": "Small mountainous Mediterranean coastal state. Mount Lebanon and Anti-Lebanon ranges; fertile Beqaa Valley between them. Litani River (only major river entirely within Lebanon). Borders Israel (Blue Line boundary) and Syria. Cedars of Lebanon.",
        "tags": ["Levant", "Mediterranean", "Beqaa Valley", "Litani River", "LIST", "Blue Line"],
        "aliases": ["lebanon"]
    },
    "376": { # Israel
        "name": "Israel",
        "capital": "Jerusalem",
        "continent": "West Asia",
        "subregion": "Levant",
        "mnemonic": "Is a rail? (Israel) | LIST (Med) | MEN SOW SEEDS (Aqaba/Red Sea)",
        "notes": "Mediterranean coast to north-west; southern outlet to Red Sea via Gulf of Aqaba (Port of Eilat). Jordan River flows south into Dead Sea (lowest land elevation on Earth, -430 m). Sea of Galilee (Lake Tiberias). Negev Desert. Major offshore gas fields: Tamar and Leviathan.",
        "tags": ["Levant", "Dead Sea", "Gulf of Aqaba", "LIST", "Jordan River", "Negev", "Leviathan Gas"],
        "aliases": ["israel"]
    },
    "275": { # Palestine
        "name": "Palestine",
        "capital": "Ramallah / East Jerusalem",
        "continent": "West Asia",
        "subregion": "Levant",
        "notes": "Comprises the West Bank (bordering Jordan and Dead Sea) and Gaza Strip (bordering Mediterranean Sea and Egypt/Rafah crossing).",
        "tags": ["West Bank", "Gaza Strip", "Levant", "Dead Sea", "Rafah"],
        "aliases": ["palestine", "state of palestine", "gaza", "west bank"]
    },
    "400": { # Jordan
        "name": "Jordan",
        "capital": "Amman",
        "continent": "West Asia",
        "subregion": "Levant / Middle East",
        "mnemonic": "Cardboard train (Jordan) | Aqaba (Red Sea)",
        "notes": "Nearly landlocked except for a 26-km coastline on Gulf of Aqaba (Red Sea). Borders Dead Sea and Jordan River on west. Vast eastern desert plateau. Ancient rock-cut city of Petra. Major potash and phosphate producer from Dead Sea.",
        "tags": ["Gulf of Aqaba", "Dead Sea", "Jordan River", "Petra", "Phosphate"],
        "aliases": ["jordan"]
    },
    "682": { # Saudi Arabia
        "name": "Saudi Arabia",
        "capital": "Riyadh",
        "continent": "West Asia",
        "subregion": "Arabian Peninsula",
        "mnemonic": "Audi (Saudi Arabia) | Red Sea (MEN SOW SEEDS) | Persian Gulf (I B SO QUIK)",
        "notes": "Dominates Arabian Peninsula. Bordered by Red Sea on west and Persian Gulf on east. Holds world's 2nd largest proven oil reserves (Ghawar field, world's largest conventional onshore oil field). Rub' al Khali ('Empty Quarter') sand desert. Holy cities of Mecca and Medina. NEOM futuristic megacity on Gulf of Aqaba. OPEC de facto leader.",
        "tags": ["Arabian Peninsula", "Ghawar", "OPEC", "Red Sea", "Persian Gulf", "Rub al Khali", "MEN SOW SEEDS", "I B SO QUIK"],
        "aliases": ["saudi arabia", "saudi", "ksa"]
    },
    "887": { # Yemen
        "name": "Yemen",
        "capital": "Sanaa / Aden",
        "continent": "West Asia",
        "subregion": "Arabian Peninsula",
        "mnemonic": "Lord Yeman (Yemen) | Bab-el-Mandeb | Red Sea (MEN SOW SEEDS)",
        "notes": "Southern tip of Arabian Peninsula. Controls northern shore of Bab-el-Mandeb Strait, connecting Red Sea and Gulf of Aden (critical chokepoint targeted by Houthi rebel drone/missile strikes). Port of Aden and island of Socotra (UNESCO World Heritage site known for dragon blood trees).",
        "tags": ["Bab-el-Mandeb", "Chokepoint", "Socotra Island", "Red Sea", "Gulf of Aden", "Houthis", "MEN SOW SEEDS"],
        "aliases": ["yemen"]
    },
    "512": { # Oman
        "name": "Oman",
        "capital": "Muscat",
        "continent": "West Asia",
        "subregion": "Arabian Peninsula",
        "mnemonic": "Oh Man! (Oman) | Strait of Hormuz | Persian Gulf (I B SO QUIK)",
        "notes": "Controls the southern shore of the Strait of Hormuz via its northern Musandam Peninsula exclave. Strategic coastlines along Gulf of Oman and Arabian Sea. Duqm deepwater port bypasses Strait of Hormuz (India granted logistics access). Al Hajar Mountains.",
        "tags": ["Strait of Hormuz", "Musandam", "Duqm Port", "Arabian Sea", "I B SO QUIK"],
        "aliases": ["oman"]
    },
    "784": { # UAE
        "name": "United Arab Emirates",
        "capital": "Abu Dhabi",
        "continent": "West Asia",
        "subregion": "Arabian Peninsula",
        "mnemonic": "Ignite button (UAE) | Persian Gulf (I B SO QUIK)",
        "notes": "Federation of 7 emirates (Abu Dhabi, Dubai, Sharjah, Ajman, Umm Al Quwain, Ras Al Khaimah, Fujairah). Coastline along Persian Gulf; Fujairah has coast on Gulf of Oman (bypassing Strait of Hormuz for oil exports). Barakah nuclear power plant. Major global aviation, financial, and logistics hub.",
        "tags": ["Persian Gulf", "OPEC", "Fujairah", "Strait of Hormuz", "Barakah", "I B SO QUIK"],
        "aliases": ["uae", "united arab emirates", "emirates"]
    },
    "634": { # Qatar
        "name": "Qatar",
        "capital": "Doha",
        "continent": "West Asia",
        "subregion": "Arabian Peninsula",
        "mnemonic": "Tar hits face (Qatar) | Persian Gulf (I B SO QUIK)",
        "notes": "Peninsula protruding into the Persian Gulf. Shares the world's largest natural gas field, the North Dome / South Pars field, with Iran. One of the world's top LNG exporters. Ras Laffan industrial port. Only land border with Saudi Arabia.",
        "tags": ["Persian Gulf", "LNG #1", "North Dome Gas Field", "Ras Laffan", "I B SO QUIK"],
        "aliases": ["qatar"]
    },
    "048": { # Bahrain
        "name": "Bahrain",
        "capital": "Manama",
        "continent": "West Asia",
        "subregion": "Arabian Peninsula",
        "mnemonic": "Beetroot rain (Bahrain) | Persian Gulf (I B SO QUIK)",
        "notes": "Island nation in Persian Gulf connected to Saudi Arabia via King Fahd Causeway (25 km). First Arabian Gulf state where oil was discovered (1932). Hosts US Navy Fifth Fleet headquarters. Major aluminium smelter (Alba).",
        "tags": ["Persian Gulf", "Island Nation", "King Fahd Causeway", "Fifth Fleet", "I B SO QUIK"],
        "aliases": ["bahrain"]
    },
    "414": { # Kuwait
        "name": "Kuwait",
        "capital": "Kuwait City",
        "continent": "West Asia",
        "subregion": "Arabian Peninsula",
        "mnemonic": "Wait (Kuwait) | Persian Gulf (I B SO QUIK)",
        "notes": "Northwestern corner of Persian Gulf. Burgan oil field is 2nd largest conventional sandstone reservoir in the world. Borders Iraq and Saudi Arabia. Strategic Bubiyan Island.",
        "tags": ["Persian Gulf", "Burgan Oil Field", "Bubiyan Island", "OPEC", "I B SO QUIK"],
        "aliases": ["kuwait"]
    },
    "368": { # Iraq
        "name": "Iraq",
        "capital": "Baghdad",
        "continent": "West Asia",
        "subregion": "Middle East",
        "mnemonic": "Rocky (Iraq) | Persian Gulf (I B SO QUIK)",
        "notes": "Heart of ancient Mesopotamia ('cradle of civilization'). Tigris and Euphrates rivers converge into Shatt al-Arab waterway before reaching Persian Gulf (narrow coastline with Basra port and Al-Faw Grand Port). Huge oil reserves (Rumaila, Kirkuk). OPEC founding member.",
        "tags": ["Mesopotamia", "Tigris", "Euphrates", "Shatt al-Arab", "Basra", "Rumaila", "I B SO QUIK"],
        "aliases": ["iraq"]
    },
    "364": { # Iran
        "name": "Iran",
        "capital": "Tehran",
        "continent": "West Asia",
        "subregion": "Middle East",
        "mnemonic": "X ran (Iran) | Strait of Hormuz | TARIK (Caspian) | I B SO QUIK (Gulf)",
        "notes": "Dominates northern shore of Strait of Hormuz (chokepoint handling ~20% of world's petroleum). Borders Persian Gulf, Gulf of Oman, and Caspian Sea. Zagros and Elburz mountain ranges (Mount Damavand, highest volcano in Asia). Chabahar Port (developed with India to access Afghanistan & Central Asia). South Pars gas field.",
        "tags": ["Strait of Hormuz", "Chabahar Port", "Caspian Sea", "Persian Gulf", "Zagros Mountains", "TARIK", "I B SO QUIK"],
        "aliases": ["iran", "persia"]
    },

    # --- SOUTH CAUCASUS ---
    "051": { # Armenia
        "name": "Armenia",
        "capital": "Yerevan",
        "continent": "West Asia",
        "subregion": "South Caucasus",
        "notes": "Landlocked country in South Caucasus between Black and Caspian Seas. Mount Ararat national symbol (now inside Turkey). Lake Sevan (major alpine freshwater lake). Border dispute and war over Nagorno-Karabakh with Azerbaijan; Syunik province / Zangezur corridor controversy.",
        "tags": ["South Caucasus", "Landlocked", "Lake Sevan", "Nagorno-Karabakh", "Zangezur Corridor"],
        "aliases": ["armenia"]
    },
    "031": { # Azerbaijan
        "name": "Azerbaijan",
        "capital": "Baku",
        "continent": "West Asia",
        "subregion": "South Caucasus",
        "mnemonic": "TARIK (Caspian Sea)",
        "notes": "Borders Caspian Sea. Baku is historic center of oil & gas industry (Baku-Tbilisi-Ceyhan pipeline, Southern Gas Corridor). Exclave of Nakhchivan separated by Armenia. Regained full control of Nagorno-Karabakh in 2023.",
        "tags": ["Caspian Sea", "Baku", "BTC Pipeline", "Nakhchivan", "Nagorno-Karabakh", "TARIK"],
        "aliases": ["azerbaijan"]
    },
    "268": { # Georgia
        "name": "Georgia",
        "capital": "Tbilisi",
        "continent": "West Asia",
        "subregion": "South Caucasus",
        "mnemonic": "BURGER T (Black Sea)",
        "notes": "Borders Black Sea (ports of Batumi and Poti). Greater Caucasus Mountains (Mount Shkhara). Breakaway Russian-occupied regions: Abkhazia and South Ossetia. Transit corridor for Caspian oil and gas pipelines bypassing Russia.",
        "tags": ["Black Sea", "Caucasus", "Batumi", "Abkhazia", "South Ossetia", "BURGER T"],
        "aliases": ["georgia"]
    },

    # --- EUROPE ---
    "620": { # Portugal
        "name": "Portugal",
        "capital": "Lisbon",
        "continent": "Europe",
        "subregion": "Iberian Peninsula",
        "mnemonic": "Boat to port (Portugal)",
        "notes": "Western part of Iberian Peninsula facing Atlantic Ocean. World's #1 cork producer (>50% global harvest from cork oak forests in Alentejo). Cabo da Roca is the westernmost point of continental Europe. Azores and Madeira autonomous Atlantic archipelagos. Douro River port wine.",
        "tags": ["Iberian Peninsula", "Cork #1", "Cabo da Roca", "Atlantic Coast", "Douro River", "Boat to port"],
        "aliases": ["portugal"]
    },
    "724": { # Spain
        "name": "Spain",
        "capital": "Madrid",
        "continent": "Europe",
        "subregion": "Iberian Peninsula",
        "mnemonic": "Sprain Leg (Spain)",
        "notes": "Dominates Iberian Peninsula. World's largest olive oil producer (~40-50% global production, Andalusia). Controls Ceuta and Melilla enclaves in North Africa bordering Morocco. Separated from France by Pyrenees mountains. Catalan and Basque autonomy movements. Controls Balearic and Canary Islands.",
        "tags": ["Iberian Peninsula", "Olive Oil #1", "Ceuta & Melilla", "Pyrenees", "Canary Islands", "Sprain Leg"],
        "aliases": ["spain", "espana", "españa"]
    },
    "826": { # United Kingdom
        "name": "United Kingdom",
        "capital": "London",
        "continent": "Europe",
        "subregion": "Western Europe",
        "notes": "Comprises England, Scotland, Wales, and Northern Ireland. Controls strategic territory of Gibraltar at entrance to Mediterranean Sea. North Sea oil & gas (Brent benchmark). English Channel separates from mainland France. Dover Strait.",
        "tags": ["Gibraltar", "English Channel", "North Sea Oil", "Dover Strait"],
        "aliases": ["uk", "united kingdom", "britain", "great britain"]
    },
    "250": { # France
        "name": "France",
        "capital": "Paris",
        "continent": "Europe",
        "subregion": "Western Europe",
        "notes": "Hexagon shape. Coasts on English Channel, Bay of Biscay (Atlantic), and Mediterranean Sea. Mont Blanc in Alps (highest peak in Western Europe). World leader in nuclear energy share (~70% electricity). Major agricultural producer in EU. Controls Corsica island and overseas territories (French Guiana, Réunion, New Caledonia).",
        "tags": ["Western Europe", "Nuclear Power", "Alps", "Mont Blanc", "Corsica", "English Channel"],
        "aliases": ["france"]
    },
    "276": { # Germany
        "name": "Germany",
        "capital": "Berlin",
        "continent": "Europe",
        "subregion": "Central Europe",
        "notes": "Largest economy in Europe. Coasts on North Sea and Baltic Sea connected by Kiel Canal. Major rivers: Rhine, Danube (flows east to Black Sea), Elbe, Oder. Ruhr valley industrial heartland. Black Forest (source of Danube).",
        "tags": ["Central Europe", "Rhine River", "Danube River", "Kiel Canal", "Ruhr Valley", "Baltic Sea"],
        "aliases": ["germany", "deutschland"]
    },
    "380": { # Italy
        "name": "Italy",
        "capital": "Rome",
        "continent": "Europe",
        "subregion": "Southern Europe",
        "notes": "Boot-shaped peninsula in Mediterranean Sea. Apennine Mountains run down spine; Alps to north. Po River valley is agricultural & industrial core. Active volcanoes: Mount Vesuvius, Mount Etna (Sicily), Stromboli ('Lighthouse of the Mediterranean'). Encloses San Marino and Vatican City.",
        "tags": ["Mediterranean", "Po Valley", "Alps", "Apennines", "Mount Etna", "Vesuvius"],
        "aliases": ["italy", "italia"]
    },
    "300": { # Greece
        "name": "Greece",
        "capital": "Athens",
        "continent": "Europe",
        "subregion": "Southern Europe / Balkans",
        "notes": "Southernmost tip of Balkan Peninsula. Aegean Sea, Ionian Sea, and Mediterranean Sea. Over 2,000 islands (Crete, Rhodes, Cyclades). Corinth Canal cuts through Isthmus of Corinth. Pindus mountain range. Mount Olympus.",
        "tags": ["Aegean Sea", "Crete", "Corinth Canal", "Balkans", "Mediterranean"],
        "aliases": ["greece", "hellas"]
    },
    "804": { # Ukraine
        "name": "Ukraine",
        "capital": "Kyiv",
        "continent": "Europe",
        "subregion": "Eastern Europe",
        "mnemonic": "BURGER T (Black Sea)",
        "notes": "2nd largest country by area in Europe. 'Breadbasket of Europe' due to fertile Chernozem (black soil); major exporter of wheat, corn, sunflower oil. Black Sea and Sea of Azov coastlines; Crimean Peninsula occupied by Russia. Kerch Strait. Dnieper River bisects country. Donbas coal and heavy industrial basin. Zaporizhzhia nuclear plant.",
        "tags": ["Black Sea", "Sea of Azov", "Chernozem", "Kerch Strait", "Crimea", "Dnieper", "BURGER T"],
        "aliases": ["ukraine"]
    },
    "643": { # Russia
        "name": "Russia",
        "capital": "Moscow",
        "continent": "Europe",
        "subregion": "Eurasia",
        "mnemonic": "BURGER T (Black Sea) | TARIK (Caspian Sea)",
        "notes": "Largest country in world by area (~17.1M km²), spanning 11 time zones across Europe and Asia. Ural Mountains mark Europe-Asia boundary. Volga River is longest in Europe (empties into Caspian Sea). Lake Baikal is deepest and oldest freshwater lake on Earth. Massive oil, natural gas, nickel (Norilsk), palladium, and timber reserves. Exclave of Kaliningrad on Baltic Sea.",
        "tags": ["Black Sea", "Caspian Sea", "Lake Baikal", "Urals", "Volga", "Norilsk", "BURGER T", "TARIK", "Kaliningrad"],
        "aliases": ["russia", "russian federation"]
    },
    "616": { # Poland
        "name": "Poland",
        "capital": "Warsaw",
        "continent": "Europe",
        "subregion": "Central/Eastern Europe",
        "notes": "Baltic Sea coastline (Gdańsk port). Vistula and Oder rivers. Suwałki Gap: narrow 65-km land corridor between Poland and Lithuania, flanked by Russian Kaliningrad exclave and Belarus (critical NATO choke point).",
        "tags": ["Baltic Sea", "Suwalki Gap", "Vistula River", "NATO Chokepoint"],
        "aliases": ["poland", "polska"]
    },
    "100": { # Bulgaria
        "name": "Bulgaria",
        "capital": "Sofia",
        "continent": "Europe",
        "subregion": "Balkans",
        "mnemonic": "BURGER T (Black Sea)",
        "notes": "Borders Black Sea on east (Burgas, Varna ports). Danube River forms northern border with Romania. Balkan Mountains (Stara Planina) and Rhodope Mountains. Rose oil producer (Rose Valley).",
        "tags": ["Black Sea", "Danube", "Balkans", "BURGER T"],
        "aliases": ["bulgaria"]
    },
    "642": { # Romania
        "name": "Romania",
        "capital": "Bucharest",
        "continent": "Europe",
        "subregion": "Eastern Europe",
        "mnemonic": "BURGER T (Black Sea)",
        "notes": "Borders Black Sea (Constanța port, largest Black Sea port). Danube River empties via Danube Delta (UNESCO biosphere reserve). Carpathian Mountains arc through center. Transylvania plateau.",
        "tags": ["Black Sea", "Danube Delta", "Carpathians", "Constanta Port", "BURGER T"],
        "aliases": ["romania"]
    },
    "578": { # Norway
        "name": "Norway",
        "capital": "Oslo",
        "continent": "Europe",
        "subregion": "Nordic / Scandinavia",
        "notes": "Western part of Scandinavian Peninsula. Highly indented coastline with famous fjords. Major oil and natural gas producer from North Sea and Barents Sea (Sovereign Wealth Fund). Svalbard archipelago in Arctic (Svalbard Global Seed Vault).",
        "tags": ["Scandinavia", "Fjords", "North Sea Oil", "Svalbard", "Arctic"],
        "aliases": ["norway", "norge"]
    },
    "752": { # Sweden
        "name": "Sweden",
        "capital": "Stockholm",
        "continent": "Europe",
        "subregion": "Nordic / Scandinavia",
        "notes": "Scandinavian Peninsula bordering Gulf of Bothnia and Baltic Sea. Major high-grade iron ore reserves in Kiruna (LKAB mine). Joined NATO in 2024. Gotland island in Baltic.",
        "tags": ["Scandinavia", "Baltic Sea", "Kiruna Iron Ore", "Gotland", "NATO 2024"],
        "aliases": ["sweden", "sverige"]
    },
    "246": { # Finland
        "name": "Finland",
        "capital": "Helsinki",
        "continent": "Europe",
        "subregion": "Nordic",
        "notes": "'Land of a Thousand Lakes' (~188,000 lakes). 1,340-km land border with Russia. Joined NATO in 2023. Åland Islands autonomous demilitarized zone in Baltic. Saimaa Canal.",
        "tags": ["Nordic", "Lakes", "Baltic Sea", "NATO 2023", "Aland Islands"],
        "aliases": ["finland", "suomi"]
    },
    "528": { # Netherlands
        "name": "Netherlands",
        "capital": "Amsterdam / The Hague",
        "continent": "Europe",
        "subregion": "Western Europe",
        "notes": "About a third of land below sea level (protected by dikes, polders, and Delta Works). Port of Rotterdam is largest seaport in Europe. Rhine-Meuse-Scheldt delta. ASML semiconductor lithography hub (Veldhoven).",
        "tags": ["Rotterdam Port", "Polders", "Rhine Delta", "Semiconductors", "North Sea"],
        "aliases": ["netherlands", "holland"]
    },
    "056": { # Belgium
        "name": "Belgium",
        "capital": "Brussels",
        "continent": "Europe",
        "subregion": "Western Europe",
        "notes": "Hosts headquarters of European Union (EU) and NATO in Brussels. Port of Antwerp is 2nd largest in Europe and world's foremost diamond-trading hub. Divided between Dutch-speaking Flanders (north) and French-speaking Wallonia (south).",
        "tags": ["EU HQ", "NATO HQ", "Antwerp Diamonds", "North Sea"],
        "aliases": ["belgium", "belgique"]
    },
    "756": { # Switzerland
        "name": "Switzerland",
        "capital": "Bern",
        "continent": "Europe",
        "subregion": "Central Europe",
        "notes": "Landlocked alpine federal republic. Renowned for historic armed neutrality (joined UN in 2002). Alps and Jura mountains; Matterhorn peak. Source of Rhine and Rhône rivers. Geneva hosts numerous UN and international agencies (WTO, WHO, ICRC, CERN).",
        "tags": ["Landlocked", "Alps", "Rhine", "Rhone", "Neutrality", "Geneva"],
        "aliases": ["switzerland", "suisse", "schweiz"]
    },

    # --- CENTRAL ASIA ---
    "398": { # Kazakhstan
        "name": "Kazakhstan",
        "capital": "Astana",
        "continent": "East & Central Asia",
        "subregion": "Central Asia",
        "mnemonic": "TARIK (Caspian Sea)",
        "notes": "World's largest landlocked country. Leading producer of uranium in the world (~43% global mined supply; Kazatomprom). Massive oil and gas reserves around Caspian Sea (Tengiz, Kashagan, Karachaganak fields; CPC pipeline). Baikonur Cosmodrome (leased by Russia). Altai and Tian Shan mountains on east. Shrinking Aral Sea on southwest.",
        "tags": ["Central Asia", "Landlocked #1", "Uranium #1", "Caspian Sea", "Baikonur", "TARIK", "Aral Sea"],
        "aliases": ["kazakhstan"]
    },
    "860": { # Uzbekistan
        "name": "Uzbekistan",
        "capital": "Tashkent",
        "continent": "East & Central Asia",
        "subregion": "Central Asia",
        "notes": "One of only two doubly landlocked countries in the world (surrounded exclusively by landlocked countries; the other is Liechtenstein). Aral Sea catastrophe: diversion of Amu Darya and Syr Darya for cotton monoculture caused sea to shrink by >90%. Muruntau mine is one of world's largest open-pit gold mines. Silk Road cities: Samarkand, Bukhara, Khiva. Fergana Valley.",
        "tags": ["Doubly Landlocked", "Aral Sea", "Cotton", "Muruntau Gold", "Fergana Valley", "Silk Road"],
        "aliases": ["uzbekistan"]
    },
    "795": { # Turkmenistan
        "name": "Turkmenistan",
        "capital": "Ashgabat",
        "continent": "East & Central Asia",
        "subregion": "Central Asia",
        "mnemonic": "TARIK (Caspian Sea)",
        "notes": "Dominated by Karakum Desert (~80% area). Holds world's 4th largest natural gas reserves (Galkynysh gas field). Darvaza gas crater ('Door to Hell'). TAPI pipeline project (Turkmenistan-Afghanistan-Pakistan-India). Caspian Sea coastline with Turkmenbashi port.",
        "tags": ["Caspian Sea", "Natural Gas", "Galkynysh", "Karakum", "TAPI Pipeline", "Door to Hell", "TARIK"],
        "aliases": ["turkmenistan"]
    },
    "417": { # Kyrgyzstan
        "name": "Kyrgyzstan",
        "capital": "Bishkek",
        "continent": "East & Central Asia",
        "subregion": "Central Asia",
        "notes": "Highly mountainous landlocked country dominated by Tian Shan mountain range ('Switzerland of Central Asia'). Issyk-Kul is world's 2nd largest alpine lake after Lake Titicaca (saline, never freezes). Kumtor gold mine. Fergana Valley enclaves.",
        "tags": ["Tian Shan", "Issyk-Kul Lake", "Kumtor Gold", "Fergana Valley", "Landlocked"],
        "aliases": ["kyrgyzstan", "kyrgyz republic"]
    },
    "762": { # Tajikistan
        "name": "Tajikistan",
        "capital": "Dushanbe",
        "continent": "East & Central Asia",
        "subregion": "Central Asia",
        "notes": "Dominated by Pamir Mountains ('Roof of the World', Ismoil Somoni Peak 7,495 m). Rogun Dam on Vakhsh River (world's tallest dam under construction, 335 m). Shares Wakhan Corridor border with Afghanistan. Amu Darya headwaters.",
        "tags": ["Pamir Mountains", "Rogun Dam", "Roof of the World", "Wakhan Corridor", "Landlocked"],
        "aliases": ["tajikistan"]
    },
    "004": { # Afghanistan
        "name": "Afghanistan",
        "capital": "Kabul",
        "continent": "East & Central Asia",
        "subregion": "Central / South Asia",
        "mnemonic": "Golden Crescent",
        "notes": "Landlocked country centered around Hindu Kush mountain range. Strategic Wakhan Corridor connects to China's Xinjiang. Part of the 'Golden Crescent' opium-producing area with Iran and Pakistan. Massive untapped mineral wealth estimated at $1T+ including lithium, copper (Mes Aynak), rare earths, and iron ore (Hajigak). Amu Darya border river (Qosh Tepa canal project).",
        "tags": ["Hindu Kush", "Wakhan Corridor", "Lithium", "Golden Crescent", "Landlocked", "Qosh Tepa Canal"],
        "aliases": ["afghanistan"]
    },

    # --- EAST ASIA ---
    "156": { # China
        "name": "China",
        "capital": "Beijing",
        "continent": "East & Central Asia",
        "subregion": "East Asia",
        "notes": "2nd most populous country. Dominates global critical mineral supply chains: controls >60% of rare earth mining and >90% of refining; >70% of cobalt refining; >60% of lithium refining. Major rivers: Yangtze (Three Gorges Dam, world's largest power station) and Yellow River (Huang He). Tibetan Plateau ('Water Tower of Asia', headwaters of Indus, Brahmaputra/Yarlung Tsangpo, Mekong, Yangtze). Pearl River Delta and Yangtze Delta economic powerhouses. Nine-Dash Line claims across South China Sea.",
        "tags": ["Critical Minerals #1", "Rare Earths", "Three Gorges Dam", "Tibetan Plateau", "South China Sea", "Belt & Road"],
        "aliases": ["china", "prc", "people's republic of china"]
    },
    "496": { # Mongolia
        "name": "Mongolia",
        "capital": "Ulaanbaatar",
        "continent": "East & Central Asia",
        "subregion": "East Asia",
        "notes": "2nd largest landlocked country, sandwiched between Russia and China. Gobi Desert in south, Altai Mountains in west. Massive mineral deposits: Oyu Tolgoi (one of world's largest copper-gold deposits) and Tavan Tolgoi (coking coal). Lowest population density of any sovereign state.",
        "tags": ["Landlocked", "Gobi Desert", "Oyu Tolgoi Copper", "Coking Coal", "Buffer State"],
        "aliases": ["mongolia"]
    },
    "392": { # Japan
        "name": "Japan",
        "capital": "Tokyo",
        "continent": "East & Central Asia",
        "subregion": "East Asia",
        "notes": "Stratovolcanic archipelago along Pacific Ring of Fire. 4 main islands: Hokkaido (north), Honshu (largest, Tokyo/Osaka), Shikoku, and Kyushu (south), plus Ryukyu/Okinawa islands. Mount Fuji. Bordered by Sea of Japan, Pacific Ocean, Sea of Okhotsk, and East China Sea. Kuril Islands dispute with Russia (Northern Territories); Senkaku Islands dispute with China. Global leader in autos, robotics, and semiconductor equipment.",
        "tags": ["4 Main Islands", "Pacific Ring of Fire", "Mount Fuji", "Kuril Islands", "Senkaku", "Semiconductors"],
        "aliases": ["japan", "nippon"]
    },
    "410": { # South Korea
        "name": "South Korea",
        "capital": "Seoul",
        "continent": "East & Central Asia",
        "subregion": "East Asia",
        "notes": "Southern half of Korean Peninsula. Separated from North Korea by 38th Parallel Demilitarized Zone (DMZ). Bordered by Yellow Sea and Sea of Japan (East Sea). Global powerhouse in memory semiconductors (Samsung, SK Hynix), display panels, electric vehicle batteries, shipbuilding (Ulsan), and automobiles. Jeju Island.",
        "tags": ["Korean Peninsula", "DMZ", "Semiconductors #1", "Shipbuilding", "EV Batteries"],
        "aliases": ["south korea", "korea", "republic of korea", "rok"]
    },
    "408": { # North Korea
        "name": "North Korea",
        "capital": "Pyongyang",
        "continent": "East & Central Asia",
        "subregion": "East Asia",
        "notes": "Northern half of Korean Peninsula. Yalu and Tumen rivers border China and Russia. Mount Paektu sacred active volcano. Nuclear-armed state with missile testing in Sea of Japan.",
        "tags": ["Korean Peninsula", "Yalu River", "DMZ", "Mount Paektu"],
        "aliases": ["north korea", "dprk"]
    },
    "158": { # Taiwan
        "name": "Taiwan",
        "capital": "Taipei",
        "continent": "East & Central Asia",
        "subregion": "East Asia",
        "notes": "Island separated from mainland China by Taiwan Strait (~160 km wide). World's dominant contract manufacturer of advanced microchips / semiconductors (TSMC produces >90% of sub-7nm chips; 'Silicon Shield'). First Island Chain component. East coast borders Philippine Sea / Pacific Ocean. Mount Jade (Yushan).",
        "tags": ["Taiwan Strait", "TSMC", "Silicon Shield", "First Island Chain", "Semiconductors"],
        "aliases": ["taiwan", "republic of china", "roc"]
    },

    # --- SOUTH ASIA ---
    "356": { # India
        "name": "India",
        "capital": "New Delhi",
        "continent": "South & Southeast Asia",
        "subregion": "South Asia",
        "notes": "Central position atop the Indian Ocean between Strait of Hormuz and Strait of Malacca. Himalayan mountain barrier in north; peninsular plateau with Western Ghats (UNESCO biodiversity hotspot) and Eastern Ghats. Crossed by Tropic of Cancer through 8 states (Gujarat, Rajasthan, MP, Chhattisgarh, Jharkhand, WB, Tripura, Mizoram). Major river basins: Ganga, Brahmaputra, Indus, Godavari, Krishna, Cauvery. Island territories: Andaman & Nicobar (Ten Degree Channel, Great Channel near Malacca) and Lakshadweep (Nine Degree & Eight Degree Channels).",
        "tags": ["Indian Ocean", "Himalayas", "Western Ghats", "Tropic of Cancer", "Ten Degree Channel", "Andaman & Nicobar"],
        "aliases": ["india", "bharat"]
    },
    "586": { # Pakistan
        "name": "Pakistan",
        "capital": "Islamabad",
        "continent": "South & Southeast Asia",
        "subregion": "South Asia",
        "mnemonic": "Golden Crescent",
        "notes": "Indus River system (Indus, Jhelum, Chenab, Ravi, Beas, Sutlej; governed by 1960 Indus Waters Treaty). Arabian Sea coastline featuring Gwadar Port (flagship hub of China-Pakistan Economic Corridor / CPEC). Karakoram Highway connects via Khunjerab Pass to China. K2 (2nd highest peak in world, 8,611 m) in Gilgit-Baltistan.",
        "tags": ["Indus River", "Gwadar Port", "CPEC", "K2", "Golden Crescent", "Arabian Sea"],
        "aliases": ["pakistan"]
    },
    "050": { # Bangladesh
        "name": "Bangladesh",
        "capital": "Dhaka",
        "continent": "South & Southeast Asia",
        "subregion": "South Asia",
        "notes": "World's largest delta: Ganges-Brahmaputra-Meghna delta (Sundarbans mangrove forest, Royal Bengal tiger habitat). Extremely vulnerable to sea level rise and cyclones in Bay of Bengal. World's 2nd largest ready-made garment (RMG) exporter after China. Chattogram (Chittagong) port and Matarbari deep seaport.",
        "tags": ["Ganges Delta", "Sundarbans", "Bay of Bengal", "RMG", "Matarbari Port"],
        "aliases": ["bangladesh"]
    },
    "524": { # Nepal
        "name": "Nepal",
        "capital": "Kathmandu",
        "continent": "South & Southeast Asia",
        "subregion": "South Asia",
        "notes": "Landlocked Himalayan country between India and China. Contains 8 of the world's 14 peaks above 8,000 meters, including Mount Everest (Sagarmatha, 8,848.86 m) and Kanchenjunga border. Headwaters of Ganges tributaries: Kosi ('Sorrow of Bihar'), Gandak, Karnali (Ghaghara), Mahakali (Sharada; Kalapani border dispute).",
        "tags": ["Landlocked", "Mount Everest", "Himalayas", "Ganges Tributaries", "Kalapani"],
        "aliases": ["nepal"]
    },
    "064": { # Bhutan
        "name": "Bhutan",
        "capital": "Thimphu",
        "continent": "South & Southeast Asia",
        "subregion": "South Asia",
        "notes": "Landlocked Himalayan kingdom. Carbon-negative country (constitutional requirement for >60% forest cover). Hydroelectricity exported to India (Chukha, Tala, Mangdechhu). Measures Gross National Happiness (GNH). Doklam plateau trijunction flashpoint between India, Bhutan, and China.",
        "tags": ["Landlocked", "Carbon Negative", "Hydropower", "Doklam", "Himalayas"],
        "aliases": ["bhutan"]
    },
    "144": { # Sri Lanka
        "name": "Sri Lanka",
        "capital": "Sri Jayawardenepura Kotte / Colombo",
        "continent": "South & Southeast Asia",
        "subregion": "South Asia",
        "notes": "Tear-shaped island in Indian Ocean separated from India by Palk Strait, Gulf of Mannar, and Adam's Bridge (Ram Setu). Straddles busy East-West international shipping lane. Hambantota Port (99-year lease to China) and Colombo Port (transshipment hub for Indian container traffic). High-grade Ceylon tea and vein graphite.",
        "tags": ["Palk Strait", "Adam's Bridge", "Hambantota", "Colombo Port", "Graphite", "Indian Ocean"],
        "aliases": ["sri lanka", "ceylon"]
    },
    "462": { # Maldives
        "name": "Maldives",
        "capital": "Malé",
        "continent": "South & Southeast Asia",
        "subregion": "South Asia",
        "notes": "Archipelago of 26 natural atolls (1,192 coral islands) in central Indian Ocean. Lowest average elevation country on Earth (~1.5 m above sea level, highly threatened by climate change). Eight Degree Channel separates northern Maldives from India's Minicoy Island. Strategic location along Persian Gulf to Malacca shipping lanes.",
        "tags": ["Atolls", "Eight Degree Channel", "Indian Ocean Chokepoint", "Climate Vulnerability"],
        "aliases": ["maldives"]
    },

    # --- SOUTHEAST ASIA ---
    "104": { # Myanmar
        "name": "Myanmar",
        "capital": "Naypyidaw",
        "continent": "South & Southeast Asia",
        "subregion": "Southeast Asia",
        "mnemonic": "Golden Triangle",
        "notes": "Borders Bay of Bengal and Andaman Sea. Irrawaddy River is lifeblood. World's foremost source of jadeite jade and rubies; major supplier of heavy rare earths to China (Kachin state). Sittwe Port is key component of India's Kaladan Multi-Modal Transit Transport Project. Part of 'Golden Triangle' opium zone with Thailand and Laos. Dawei deep seaport.",
        "tags": ["Kaladan Project", "Sittwe Port", "Irrawaddy", "Rare Earths", "Golden Triangle", "Bay of Bengal"],
        "aliases": ["myanmar", "burma"]
    },
    "764": { # Thailand
        "name": "Thailand",
        "capital": "Bangkok",
        "continent": "South & Southeast Asia",
        "subregion": "Southeast Asia",
        "mnemonic": "Golden Triangle",
        "notes": "Gulf of Thailand to east, Andaman Sea to west. Chao Phraya river basin. World leader in natural rubber and rice exports; 'Detroit of Southeast Asia' for automotive assembly. Kra Isthmus: proposed Kra Canal (or Landbridge) to connect Andaman Sea with Gulf of Thailand, bypassing Malacca Strait.",
        "tags": ["Kra Isthmus", "Chao Phraya", "Rubber", "Rice", "Golden Triangle", "Andaman Sea"],
        "aliases": ["thailand", "siam"]
    },
    "704": { # Vietnam
        "name": "Vietnam",
        "capital": "Hanoi",
        "continent": "South & Southeast Asia",
        "subregion": "Southeast Asia",
        "notes": "S-shaped country along South China Sea coastline (>3,200 km). Red River Delta in north (Hanoi, Haiphong) and Mekong River Delta in south (Ho Chi Minh City). Disputed Paracel and Spratly island chains. Major global manufacturing hub (smartphones, electronics, footwear, EV supply chains). World's #2 coffee producer (robusta).",
        "tags": ["South China Sea", "Mekong Delta", "Paracel & Spratly", "Robusta Coffee", "Manufacturing Hub"],
        "aliases": ["vietnam", "viet nam"]
    },
    "418": { # Laos
        "name": "Laos",
        "capital": "Vientiane",
        "continent": "South & Southeast Asia",
        "subregion": "Southeast Asia",
        "mnemonic": "Golden Triangle",
        "notes": "Only landlocked country in Southeast Asia. Traversed by Mekong River. Aims to be the 'Battery of Southeast Asia' through extensive Mekong hydropower dam construction, raising downstream environmental concerns. Boten-Vientiane high-speed railway connects to China.",
        "tags": ["Landlocked Southeast Asia", "Mekong Dams", "Golden Triangle", "Hydropower"],
        "aliases": ["laos", "lao pdr"]
    },
    "116": { # Cambodia
        "name": "Cambodia",
        "capital": "Phnom Penh",
        "continent": "South & Southeast Asia",
        "subregion": "Southeast Asia",
        "notes": "Traversed by Mekong River. Contains Tonlé Sap: largest freshwater lake in Southeast Asia, with a unique pulsing flood-flow reversal system. Ream Naval Base on Gulf of Thailand (Chinese upgrade). Angkor Wat temple complex.",
        "tags": ["Tonle Sap Lake", "Mekong", "Ream Naval Base", "Gulf of Thailand"],
        "aliases": ["cambodia", "kampuchea"]
    },
    "458": { # Malaysia
        "name": "Malaysia",
        "capital": "Kuala Lumpur / Putrajaya",
        "continent": "South & Southeast Asia",
        "subregion": "Southeast Asia",
        "notes": "Divided into Peninsular Malaysia and East Malaysia (Sabah & Sarawak on Borneo island), separated by South China Sea. Borders Strait of Malacca (Port of Tanjung Pelepas, Port Klang). World's 2nd largest palm oil producer after Indonesia; major semiconductor assembly and testing (ATP) hub in Penang.",
        "tags": ["Strait of Malacca", "Borneo", "Palm Oil", "Semiconductors", "Port Klang"],
        "aliases": ["malaysia"]
    },
    "702": { # Singapore
        "name": "Singapore",
        "capital": "Singapore",
        "continent": "South & Southeast Asia",
        "subregion": "Southeast Asia",
        "notes": "Island city-state at southern tip of Malay Peninsula. Sits directly atop the Strait of Malacca and Singapore Strait (world's busiest maritime transit route handling ~25-30% of global sea trade). World's 2nd busiest container port (Tuas Mega Port) and leading global financial/oil-trading hub.",
        "tags": ["Strait of Malacca", "Chokepoint", "Tuas Port", "Maritime Hub", "Financial Center"],
        "aliases": ["singapore"]
    },
    "360": { # Indonesia
        "name": "Indonesia",
        "capital": "Jakarta / Nusantara",
        "continent": "South & Southeast Asia",
        "subregion": "Southeast Asia",
        "notes": "World's largest archipelagic state (>17,000 islands; major islands: Sumatra, Java, Kalimantan/Borneo, Sulawesi, Papua). New capital Nusantara under construction in East Kalimantan. Holds world's largest nickel reserves and mine production (essential for EV batteries); banned raw nickel ore exports to force domestic smelting. #1 palm oil producer, major coal exporter. Key maritime chokepoints: Malacca Strait, Sunda Strait, Lombok Strait, Makassar Strait. Pacific Ring of Fire volcanoes (Krakatoa, Merapi).",
        "tags": ["Nickel #1", "Palm Oil #1", "Sunda Strait", "Lombok Strait", "Nusantara", "Pacific Ring of Fire", "Archipelago"],
        "aliases": ["indonesia"]
    },
    "608": { # Philippines
        "name": "Philippines",
        "capital": "Manila",
        "continent": "South & Southeast Asia",
        "subregion": "Southeast Asia",
        "notes": "Archipelago of >7,000 islands grouped into Luzon, Visayas, and Mindanao. Flanked by South China Sea (West Philippine Sea) and Philippine Sea (Pacific Ocean). Luzon Strait separates from Taiwan. Major nickel ore exporter to China. Flashpoints: Second Thomas Shoal (BRP Sierra Madre) and Scarborough Shoal. Pacific Ring of Fire (Mayon volcano, Mount Pinatubo).",
        "tags": ["Luzon Strait", "South China Sea", "Second Thomas Shoal", "Nickel", "Pacific Ring of Fire"],
        "aliases": ["philippines", "pilipinas"]
    },

    # --- OCEANIA ---
    "036": { # Australia
        "name": "Australia",
        "capital": "Canberra",
        "continent": "South & Southeast Asia", # Grouped with Asia-Oceania tab
        "subregion": "Oceania",
        "mnemonic": "B.Sc M.A PhD (Clockwise coastal cities: Brisbane, Sydney, Canberra, Melbourne, Adelaide, Perth, Darwin)",
        "notes": "World's largest exporter of iron ore (Pilbara region) and mined lithium (#1 hard-rock spodumene producer). Major exporter of metallurgical & thermal coal, bauxite/aluminium, gold, LNG, and uranium (Olympic Dam). Great Barrier Reef (world's largest coral reef system). Murray-Darling river basin. Great Artesian Basin.",
        "tags": ["Pilbara Iron Ore", "Lithium #1", "Great Barrier Reef", "Murray-Darling", "B.Sc M.A PhD", "Olympic Dam"],
        "aliases": ["australia", "oz"]
    },
    "554": { # New Zealand
        "name": "New Zealand",
        "capital": "Wellington",
        "continent": "South & Southeast Asia",
        "subregion": "Oceania",
        "notes": "Comprises North Island (volcanic, geothermal power) and South Island (Southern Alps, Mount Cook/Aoraki), separated by Cook Strait. World leader in dairy exports (~20-25% of global market, Fonterra cooperative) and sheep meat/wool. Alpine Fault earthquake zone.",
        "tags": ["Cook Strait", "Dairy #1 Exporter", "Southern Alps", "Geothermal Energy"],
        "aliases": ["new zealand", "nz", "aotearoa"]
    },
    "598": { # Papua New Guinea
        "name": "Papua New Guinea",
        "capital": "Port Moresby",
        "continent": "South & Southeast Asia",
        "subregion": "Oceania / Melanesia",
        "notes": "Occupies eastern half of New Guinea island. Separated from Australia by Torres Strait. Highly rich in copper, gold (Porgera, Lihir mines), LNG, and nickel. Bougainville autonomous region voted for independence.",
        "tags": ["Torres Strait", "Gold & Copper", "LNG", "Bougainville", "Melanesia"],
        "aliases": ["papua new guinea", "png"]
    },

    # --- SOUTH AMERICA ---
    "076": { # Brazil
        "name": "Brazil",
        "capital": "Brasília",
        "continent": "South America",
        "subregion": "South America",
        "notes": "Largest country in South America by area and population. Amazon River basin and rainforest (largest rainforest on Earth, 'lungs of the planet', deforestation concerns). Cerrado tropical savanna (major agribusiness belt). World leader in coffee (#1), sugarcane ethanol (#1), soybeans (#1), beef, and orange juice. Carajás mine in Pará is world's largest iron ore deposit (Vale). Pre-salt deepwater offshore oil reserves (Santos Basin). Itaipu Dam on Paraná River border with Paraguay. BRICS founder.",
        "tags": ["Amazon", "Cerrado", "Soybeans #1", "Coffee #1", "Carajas Iron Ore", "Itaipu Dam", "BRICS", "Pre-salt Oil"],
        "aliases": ["brazil", "brasil"]
    },
    "032": { # Argentina
        "name": "Argentina",
        "capital": "Buenos Aires",
        "continent": "South America",
        "subregion": "South America",
        "mnemonic": "Lithium Triangle (Bolivia, Chile, Argentina)",
        "notes": "2nd largest country in South America. Pampas fertile lowlands: major producer of soy, wheat, and beef. Patagonia arid plateau in south. Andes Mountains form western border (Aconcagua, 6,961 m, highest peak outside Asia). Part of the 'Lithium Triangle' (Hombre Muerto and Olaroz salt flats). Vaca Muerta shale formation is world's 2nd largest shale gas reserve. Claims Falkland Islands (Islas Malvinas, UK).",
        "tags": ["Lithium Triangle", "Pampas", "Aconcagua", "Vaca Muerta", "Patagonia", "Falkland Claims"],
        "aliases": ["argentina"]
    },
    "152": { # Chile
        "name": "Chile",
        "capital": "Santiago",
        "continent": "South America",
        "subregion": "South America",
        "mnemonic": "Lithium Triangle (Bolivia, Chile, Argentina)",
        "notes": "Extraordinarily long and narrow country (>4,200 km north to south). World's #1 copper producer (>25% global supply; Escondida and El Teniente mines). Part of 'Lithium Triangle' (Salar de Atacama has highest concentration of lithium in world). Atacama Desert is driest non-polar desert on Earth, home to major astronomical observatories (ALMA). Strait of Magellan and Cape Horn at southern tip.",
        "tags": ["Copper #1", "Lithium Triangle", "Atacama Desert", "Strait of Magellan", "Cape Horn"],
        "aliases": ["chile"]
    },
    "068": { # Bolivia
        "name": "Bolivia",
        "capital": "Sucre (Const), La Paz (Gov)",
        "continent": "South America",
        "subregion": "Andean / South America",
        "mnemonic": "Lithium Triangle (Bolivia, Chile, Argentina)",
        "notes": "Landlocked country (lost Pacific coastline to Chile in War of the Pacific 1879-84). Altiplano high plateau. Salar de Uyuni holds world's single largest lithium resource (~23M tonnes, part of Lithium Triangle). Lake Titicaca on Peru border (highest navigable lake in world, 3,812 m). Historic silver mountain of Cerro Rico at Potosí. Major natural gas exporter.",
        "tags": ["Landlocked", "Lithium Triangle", "Salar de Uyuni", "Lake Titicaca", "Altiplano", "Potosi"],
        "aliases": ["bolivia"]
    },
    "604": { # Peru
        "name": "Peru",
        "capital": "Lima",
        "continent": "South America",
        "subregion": "Andean / South America",
        "notes": "World's 2nd largest copper producer and 3rd largest silver producer. Andes mountain range runs north-south (Huascarán peak). Headwaters of Amazon River (Marañón and Ucayali confluence). Lake Titicaca on Bolivia border. Humboldt (Peru) Current creates hyper-rich marine fisheries (anchoveta) and dry coastal desert.",
        "tags": ["Copper #2", "Silver #3", "Amazon Headwaters", "Lake Titicaca", "Humboldt Current", "Andes"],
        "aliases": ["peru"]
    },
    "170": { # Colombia
        "name": "Colombia",
        "capital": "Bogotá",
        "continent": "South America",
        "subregion": "South America",
        "notes": "Only country in South America with coastlines on both the Pacific Ocean and Caribbean Sea. World's #1 emerald producer; famous for high-grade Arabica coffee. Cerrejón open-pit coal mine. Magdalena and Cauca river valleys between three Andean cordilleras. Borders Panama at Darién Gap.",
        "tags": ["Pacific & Caribbean Coasts", "Emeralds #1", "Coffee", "Darien Gap", "Cerrejon Coal"],
        "aliases": ["colombia"]
    },
    "862": { # Venezuela
        "name": "Venezuela",
        "capital": "Caracas",
        "continent": "South America",
        "subregion": "South America",
        "notes": "Holds the world's largest proven crude oil reserves (~303 billion barrels, primarily heavy crude in the Orinoco Belt). Orinoco River basin; Guri Dam provides most electricity. Lake Maracaibo is largest lake in South America. Angel Falls (Salto Ángel) in Guiana Highlands is world's highest uninterrupted waterfall (979 m). Border dispute over Guyana's Essequibo region. OPEC founding member.",
        "tags": ["Oil Reserves #1", "Orinoco Belt", "Angel Falls", "Lake Maracaibo", "Essequibo Dispute", "OPEC"],
        "aliases": ["venezuela"]
    },
    "328": { # Guyana
        "name": "Guyana",
        "capital": "Georgetown",
        "continent": "South America",
        "subregion": "Guianas / Caribbean",
        "notes": "Only English-speaking country in South America. Significant population of Indian descent (Indo-Guyanese). Center of massive deepwater offshore oil boom in Stabroek Block (ExxonMobil), making it world's fastest-growing economy. Disputed with Venezuela (Essequibo region covers 2/3 of its territory). Bauxite and gold mining.",
        "tags": ["Stabroek Oil Boom", "Essequibo Dispute", "Indian Diaspora", "Guianas"],
        "aliases": ["guyana"]
    },
    "740": { # Suriname
        "name": "Suriname",
        "capital": "Paramaribo",
        "continent": "South America",
        "subregion": "Guianas",
        "notes": "Smallest sovereign country in South America. Former Dutch colony (Dutch-speaking). Significant Indian origin population (Indo-Surinamese). Heavily forested (>90% forest cover, carbon negative). Bauxite and gold producer; recent offshore oil discoveries.",
        "tags": ["Guianas", "Indian Diaspora", "Carbon Negative", "Bauxite", "Dutch-speaking South America"],
        "aliases": ["suriname"]
    },
    "218": { # Ecuador
        "name": "Ecuador",
        "capital": "Quito",
        "continent": "South America",
        "subregion": "Andean / South America",
        "notes": "Named after the Equator which passes through it. Controls Galápagos Islands in Pacific (biodiversity hotspot, Charles Darwin's evolution theory). Mount Chimborazo's summit is point on Earth's surface closest to the Sun (due to Earth's equatorial bulge). Major crude oil, banana, and shrimp exporter. Guayaquil is chief port.",
        "tags": ["Equator", "Galapagos Islands", "Mount Chimborazo", "Oil", "Bananas"],
        "aliases": ["ecuador"]
    },
    "600": { # Paraguay
        "name": "Paraguay",
        "capital": "Asunción",
        "continent": "South America",
        "subregion": "South America",
        "notes": "Landlocked country divided by Paraguay River into fertile Oriental region and semi-arid Gran Chaco. Itaipu Dam (shared with Brazil) and Yacyretá Dam (shared with Argentina) make it one of world's top net exporters of renewable hydroelectricity. Major soy and beef exporter.",
        "tags": ["Landlocked", "Itaipu Dam", "Hydroelectricity Exporter", "Gran Chaco", "Parana River"],
        "aliases": ["paraguay"]
    },
    "858": { # Uruguay
        "name": "Uruguay",
        "capital": "Montevideo",
        "continent": "South America",
        "subregion": "South America",
        "notes": "2nd smallest country in South America. Sits along Río de la Plata estuary and Atlantic Ocean. High per-capita GDP; major exporter of beef, soy, and cellulose pulp. Powered almost entirely by renewable energy (wind, hydro, biomass).",
        "tags": ["Rio de la Plata", "Renewable Energy", "Beef", "Pampa"],
        "aliases": ["uruguay"]
    },

    # --- NORTH & CENTRAL AMERICA ---
    "124": { # Canada
        "name": "Canada",
        "capital": "Ottawa",
        "continent": "North America",
        "subregion": "North America",
        "notes": "2nd largest country in world by total area. Longest coastline in world (~243,000 km). Massive Athabasca oil sands in Alberta (world's 3rd largest oil reserves). Athabasca Basin in Saskatchewan produces world's highest-grade uranium (Cigar Lake, McArthur River). #1 world producer of potash (fertilizer) and major nickel, gold, and timber exporter. Great Lakes shared with USA. Northwest Passage in Arctic.",
        "tags": ["Athabasca Oil Sands", "Uranium #2", "Potash #1", "Arctic Northwest Passage", "Great Lakes"],
        "aliases": ["canada"]
    },
    "840": { # United States of America
        "name": "United States of America",
        "capital": "Washington, D.C.",
        "continent": "North America",
        "subregion": "North America",
        "notes": "World's largest economy and #1 producer of crude oil and natural gas (shale revolution: Permian, Bakken basins). Mississippi-Missouri river system drains central agricultural heartland. St. Lawrence Seaway connects Great Lakes to Atlantic. Strategic territories: Alaska (separated from Russia by Bering Strait, 82 km wide) and Hawaii in central Pacific.",
        "tags": ["Shale Oil #1", "Mississippi River", "Bering Strait", "Great Lakes", "Permian Basin"],
        "aliases": ["usa", "united states", "us", "america", "united states of america"]
    },
    "484": { # Mexico
        "name": "Mexico",
        "capital": "Mexico City",
        "continent": "North America",
        "subregion": "North America",
        "notes": "Borders Pacific Ocean and Gulf of Mexico. Rio Grande (Río Bravo) forms border with USA. World's #1 silver producer (Fresnillo mine). Major crude oil producer in Bay of Campeche (Cantarell field, Pemex). Yucatán Peninsula features limestone sinkholes (cenotes) and borders Caribbean Sea. Isthmus of Tehuantepec (Interoceanic Corridor rail project).",
        "tags": ["Silver #1", "Gulf of Mexico", "Rio Grande", "Yucatan", "Interoceanic Corridor"],
        "aliases": ["mexico", "mejico"]
    },
    "591": { # Panama
        "name": "Panama",
        "capital": "Panama City",
        "continent": "North America",
        "subregion": "Central America",
        "notes": "Is thmus connecting North and South America. Panama Canal (82 km long, opened 1914, expanded in 2016 for Neopanamax ships) connects Pacific Ocean with Caribbean Sea / Atlantic, saving ~13,000 km around Cape Horn. Darién Gap dense roadless jungle on Colombia border.",
        "tags": ["Panama Canal", "Chokepoint", "Darien Gap", "Neopanamax", "Isthmus"],
        "aliases": ["panama"]
    },
    "192": { # Cuba
        "name": "Cuba",
        "capital": "Havana",
        "continent": "North America",
        "subregion": "Caribbean",
        "notes": "Largest island in Caribbean Sea. Controls entrance to Gulf of Mexico via Straits of Florida and Yucatán Channel. Major nickel and cobalt reserves (Moa). US naval base at Guantanamo Bay. Sugar cane and tobacco.",
        "tags": ["Caribbean", "Gulf of Mexico Entrance", "Nickel", "Guantanamo Bay", "Straits of Florida"],
        "aliases": ["cuba"]
    }
}

# Regional Definitions with optimized D3.js projection centers, scales, and bounding boxes
REGIONS_CONFIG = {
    "africa": {
        "id": "africa",
        "name": "Africa",
        "icon": "🌍",
        "description": "54 nations: Maghreb, Sahel, Horn of Africa, Great Lakes & Southern Africa",
        "center": [20, 2],
        "scale": 400,
        "filter": lambda c: c.get("continent") == "Africa"
    },
    "west-asia": {
        "id": "west-asia",
        "name": "West Asia (Middle East)",
        "icon": "🕌",
        "description": "Levant, Persian Gulf, Arabian Peninsula & South Caucasus chokepoints",
        "center": [46, 28],
        "scale": 700,
        "filter": lambda c: c.get("continent") == "West Asia"
    },
    "europe": {
        "id": "europe",
        "name": "Europe",
        "icon": "🏰",
        "description": "Iberian, Nordic, Central Europe, Balkans & Black Sea littoral",
        "center": [15, 54],
        "scale": 600,
        "filter": lambda c: c.get("continent") == "Europe"
    },
    "east-central-asia": {
        "id": "east-central-asia",
        "name": "East & Central Asia",
        "icon": "🏔️",
        "description": "Central Asian 'Stans', China, Mongolia, Japan & Korean Peninsula",
        "center": [85, 42],
        "scale": 450,
        "filter": lambda c: c.get("continent") == "East & Central Asia"
    },
    "south-se-asia": {
        "id": "south-se-asia",
        "name": "South & SE Asia & Oceania",
        "icon": "🏝️",
        "description": "SAARC, ASEAN, Malacca Strait, Australia & Pacific gateways",
        "center": [105, 5],
        "scale": 380,
        "filter": lambda c: c.get("continent") == "South & Southeast Asia"
    },
    "south-america": {
        "id": "south-america",
        "name": "South America",
        "icon": "🌿",
        "description": "Lithium Triangle, Amazon Basin, Andean states & Guianas",
        "center": [-58, -22],
        "scale": 420,
        "filter": lambda c: c.get("continent") == "South America"
    },
    "north-america": {
        "id": "north-america",
        "name": "North America",
        "icon": "🍁",
        "description": "USA, Canada, Mexico, Central America & Caribbean chokepoints",
        "center": [-95, 38],
        "scale": 350,
        "filter": lambda c: c.get("continent") == "North America"
    },
    "world": {
        "id": "world",
        "name": "World (All Continents)",
        "icon": "🌐",
        "description": "Complete global political outline with full UPSC syllabus facts",
        "center": [15, 20],
        "scale": 190,
        "filter": lambda c: True
    }
}

# UPSC High-Yield Mnemonics Collection
MNEMONICS_COLLECTION = [
    {
        "id": "black-sea-burger-t",
        "title": "Black Sea Littoral Countries",
        "mnemonic": "BURGER T",
        "letters": [
            {"letter": "B", "country": "Bulgaria", "id": "100"},
            {"letter": "U", "country": "Ukraine", "id": "804"},
            {"letter": "R", "country": "Russia", "id": "643"},
            {"letter": "G", "country": "Georgia", "id": "268"},
            {"letter": "E", "country": "(R) Romania", "id": "642"},
            {"letter": "R", "country": "(Burger ends with T)", "id": ""},
            {"letter": "T", "country": "Türkiye (Turkey)", "id": "792"}
        ],
        "notes": "Kerch Strait connects Black Sea to Sea of Azov. Bosporus Strait connects Black Sea to Sea of Marmara. Danube, Dnieper, and Don rivers empty into it."
    },
    {
        "id": "med-west-asia-list",
        "title": "Mediterranean Coastline (West Asia / Levant)",
        "mnemonic": "LIST",
        "letters": [
            {"letter": "L", "country": "Lebanon", "id": "422"},
            {"letter": "I", "country": "Israel", "id": "376"},
            {"letter": "S", "country": "Syria", "id": "760"},
            {"letter": "T", "country": "Türkiye (Turkey)", "id": "792"}
        ],
        "notes": "Remember: Jordan does NOT touch the Mediterranean (it accesses only Gulf of Aqaba/Red Sea)."
    },
    {
        "id": "red-sea-men-sow-seeds",
        "title": "Red Sea Littoral Countries",
        "mnemonic": "MEN SOW SEEDS",
        "letters": [
            {"letter": "M", "country": "Yemen (Ye-Men)", "id": "887"},
            {"letter": "S", "country": "Saudi Arabia", "id": "682"},
            {"letter": "E", "country": "Egypt", "id": "818"},
            {"letter": "E", "country": "Eritrea", "id": "232"},
            {"letter": "D", "country": "Djibouti", "id": "262"},
            {"letter": "S", "country": "Sudan", "id": "729"}
        ],
        "notes": "Bordered to north by Suez Canal and Gulf of Aqaba (Israel/Jordan via Aqaba), to south by Bab-el-Mandeb Strait. (Mnemonic also known as DESSEY: Djibouti, Eritrea, Sudan, Saudi, Egypt, Yemen)."
    },
    {
        "id": "persian-gulf-i-b-so-quik",
        "title": "Persian Gulf Littoral Countries",
        "mnemonic": "I B SO QUIK",
        "letters": [
            {"letter": "I", "country": "Iran", "id": "364"},
            {"letter": "B", "country": "Bahrain", "id": "048"},
            {"letter": "S", "country": "Saudi Arabia", "id": "682"},
            {"letter": "O", "country": "Oman (via Musandam)", "id": "512"},
            {"letter": "Q", "country": "Qatar", "id": "634"},
            {"letter": "U", "country": "United Arab Emirates (UAE)", "id": "784"},
            {"letter": "I", "country": "Iraq", "id": "368"},
            {"letter": "K", "country": "Kuwait", "id": "414"}
        ],
        "notes": "8 nations border Persian Gulf. Strait of Hormuz connects Persian Gulf to Gulf of Oman and Arabian Sea."
    },
    {
        "id": "caspian-sea-tarik",
        "title": "Caspian Sea Littoral Countries",
        "mnemonic": "TARIK",
        "letters": [
            {"letter": "T", "country": "Turkmenistan", "id": "795"},
            {"letter": "A", "country": "Azerbaijan", "id": "031"},
            {"letter": "R", "country": "Russia", "id": "643"},
            {"letter": "I", "country": "Iran", "id": "364"},
            {"letter": "K", "country": "Kazakhstan", "id": "398"}
        ],
        "notes": "Largest inland body of water in world. Volga and Ural rivers empty into it. Rich in caviar (sturgeon) and offshore oil/gas."
    },
    {
        "id": "north-africa-rabbit-male",
        "title": "North Africa / Mediterranean Front",
        "mnemonic": "Rabbit says MALE",
        "letters": [
            {"letter": "M", "country": "Morocco (Rabbit face/ears)", "id": "504"},
            {"letter": "A", "country": "Algeria", "id": "012"},
            {"letter": "L", "country": "Libya", "id": "434"},
            {"letter": "E", "country": "Egypt", "id": "818"}
        ],
        "notes": "From West to East across North Africa: Morocco -> Algeria -> Libya -> Egypt. Plus Tunisia ('Play TUNE') wedged between Algeria and Libya."
    },
    {
        "id": "lithium-triangle",
        "title": "Lithium Triangle (South America)",
        "mnemonic": "ABC (Argentina, Bolivia, Chile)",
        "letters": [
            {"letter": "B", "country": "Bolivia (Salar de Uyuni)", "id": "068"},
            {"letter": "C", "country": "Chile (Salar de Atacama)", "id": "152"},
            {"letter": "A", "country": "Argentina (Salar del Hombre Muerto)", "id": "032"}
        ],
        "notes": "Holds >55% of world's identified lithium brine resources in the high-altitude Andean salt flats."
    },
    {
        "id": "australia-cities-bsc-maphd",
        "title": "Australian Major Cities (Clockwise from NE)",
        "mnemonic": "B.Sc M.A PhD",
        "letters": [
            {"letter": "B", "country": "Brisbane (Queensland)", "id": "036"},
            {"letter": "S", "country": "Sydney (New South Wales)", "id": "036"},
            {"letter": "C", "country": "Canberra (ACT capital)", "id": "036"},
            {"letter": "M", "country": "Melbourne (Victoria)", "id": "036"},
            {"letter": "A", "country": "Adelaide (South Australia)", "id": "036"},
            {"letter": "P", "country": "Perth (Western Australia)", "id": "036"},
            {"letter": "D", "country": "Darwin (Northern Territory)", "id": "036"}
        ],
        "notes": "Runs clockwise around the Australian coast starting from Brisbane down to Sydney, Canberra, Melbourne, Adelaide, west to Perth, and north to Darwin."
    },
    {
        "id": "horn-of-africa-seed",
        "title": "Horn of Africa Countries",
        "mnemonic": "SEED",
        "letters": [
            {"letter": "S", "country": "Somalia", "id": "706"},
            {"letter": "E", "country": "Ethiopia", "id": "231"},
            {"letter": "E", "country": "Eritrea", "id": "232"},
            {"letter": "D", "country": "Djibouti", "id": "262"}
        ],
        "notes": "Strategic peninsula in northeast Africa protruding into Arabian Sea and Gulf of Aden."
    }
]

# Generate normalized comprehensive country entries for all TopoJSON geometries
final_countries = {}
for cid, topo_name in topo_countries.items():
    if cid in UPSC_KNOWLEDGE:
        info = UPSC_KNOWLEDGE[cid]
        final_countries[cid] = {
            "id": cid,
            "name": info["name"],
            "topoName": topo_name,
            "capital": info.get("capital", ""),
            "continent": info.get("continent", "Other"),
            "subregion": info.get("subregion", ""),
            "mnemonic": info.get("mnemonic", ""),
            "notes": info.get("notes", ""),
            "tags": info.get("tags", []),
            "aliases": list(set([topo_name.lower(), info["name"].lower()] + info.get("aliases", [])))
        }
    else:
        # Determine fallback continent based on basic standard ISO lookup
        # Default entry for other world territories so every outline can still be selected
        clean_name = topo_name.replace("Dem. Rep. ", "Democratic Republic of ").replace("Rep. ", "Republic ").replace("Eq. ", "Equatorial ").replace("W. ", "Western ").replace("S. ", "South ")
        final_countries[cid] = {
            "id": cid,
            "name": clean_name,
            "topoName": topo_name,
            "capital": "",
            "continent": "Other",
            "subregion": "",
            "mnemonic": "",
            "notes": f"Standard UPSC territorial outline for {clean_name}.",
            "tags": ["World Outline"],
            "aliases": [topo_name.lower(), clean_name.lower()]
        }

# Classify any remaining unclassified countries by region
for cid, c in final_countries.items():
    if c["continent"] == "Other":
        name = c["name"]
        # Basic continent categorization for map tabs
        if name in ["Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cameroon", "Cabo Verde", "Central African Republic", "Chad", "Comoros", "Congo", "Democratic Republic of the Congo", "Djibouti", "Equatorial Guinea", "Eritrea", "Eswatini", "Ethiopia", "Gabon", "Gambia", "Ghana", "Guinea", "Guinea-Bissau", "Ivory Coast", "Kenya", "Lesotho", "Liberia", "Libya", "Madagascar", "Malawi", "Mali", "Mauritania", "Mauritius", "Morocco", "Mozambique", "Namibia", "Niger", "Nigeria", "Rwanda", "Sao Tome and Principe", "Senegal", "Seychelles", "Sierra Leone", "Somalia", "South Africa", "South Sudan", "Sudan", "Tanzania", "Togo", "Tunisia", "Uganda", "Zambia", "Zimbabwe", "Western Sahara"]:
            c["continent"] = "Africa"
        elif name in ["Albania", "Andorra", "Austria", "Belarus", "Belgium", "Bosnia and Herz.", "Bulgaria", "Croatia", "Cyprus", "Czechia", "Denmark", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary", "Iceland", "Ireland", "Italy", "Kosovo", "Latvia", "Liechtenstein", "Lithuania", "Luxembourg", "Macedonia", "Malta", "Moldova", "Monaco", "Montenegro", "Netherlands", "Norway", "Poland", "Portugal", "Romania", "Russia", "San Marino", "Serbia", "Slovakia", "Slovenia", "Spain", "Sweden", "Switzerland", "Ukraine", "United Kingdom", "Vatican"]:
            c["continent"] = "Europe"
        elif name in ["Bahrain", "Iran", "Iraq", "Israel", "Jordan", "Kuwait", "Lebanon", "Oman", "Palestine", "Qatar", "Saudi Arabia", "Syria", "Turkey", "Türkiye", "United Arab Emirates", "Yemen", "Armenia", "Azerbaijan", "Georgia"]:
            c["continent"] = "West Asia"
        elif name in ["Afghanistan", "China", "Japan", "Kazakhstan", "Kyrgyzstan", "Mongolia", "North Korea", "South Korea", "Taiwan", "Tajikistan", "Turkmenistan", "Uzbekistan"]:
            c["continent"] = "East & Central Asia"
        elif name in ["Bangladesh", "Bhutan", "Brunei", "Cambodia", "India", "Indonesia", "Laos", "Malaysia", "Maldives", "Myanmar", "Nepal", "Pakistan", "Philippines", "Singapore", "Sri Lanka", "Thailand", "Timor-Leste", "Vietnam", "Australia", "New Zealand", "Papua New Guinea", "Fiji", "Vanuatu", "Solomon Is."]:
            c["continent"] = "South & Southeast Asia"
        elif name in ["Argentina", "Bolivia", "Brazil", "Chile", "Colombia", "Ecuador", "Guyana", "Paraguay", "Peru", "Suriname", "Uruguay", "Venezuela", "Falkland Is."]:
            c["continent"] = "South America"
        elif name in ["Canada", "United States of America", "Mexico", "Belize", "Costa Rica", "El Salvador", "Guatemala", "Honduras", "Nicaragua", "Panama", "Cuba", "Haiti", "Dominican Rep.", "Jamaica", "Bahamas", "Trinidad and Tobago"]:
            c["continent"] = "North America"

# Serialize Regions metadata (excluding python lambdas)
regions_json = {}
for rid, rdata in REGIONS_CONFIG.items():
    regions_json[rid] = {
        "id": rdata["id"],
        "name": rdata["name"],
        "icon": rdata["icon"],
        "description": rdata["description"],
        "center": rdata["center"],
        "scale": rdata["scale"]
    }

output_payload = {
    "regions": regions_json,
    "countries": final_countries,
    "mnemonics": MNEMONICS_COLLECTION,
    "totalCountries": len(final_countries),
    "upscRichCount": len([c for c in final_countries.values() if len(c.get("notes", "")) > 50])
}

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(output_payload, f, ensure_ascii=False, indent=2)

print(f"Generated {OUTPUT_FILE}")
print(f"Total countries: {len(final_countries)}")
print(f"Rich UPSC syllabus annotated countries: {output_payload['upscRichCount']}")
print(f"High-yield mnemonics packaged: {len(MNEMONICS_COLLECTION)}")
