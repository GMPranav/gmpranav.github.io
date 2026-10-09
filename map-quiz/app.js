/**
 * UPSC Political & Physical Map Trainer
 * Interactive outline map engine using D3.js and TopoJSON.
 * Features:
 * - Dual Map Modes: Political Map & Physical Map (Deserts, Mountains, Rivers, Lakes, Islands, Straits)
 * - Actual Vector Outlines for all 56 Rivers (flowing courses) and 34 Lakes (true polygon bodies)
 * - True Span Polygons for all 14 Deserts and 34 Mountain Ranges / Plateaus
 * - Clean visual hierarchy: Deserts, Mountains, Rivers, and Lakes rendered purely as interactive geographic spans (names on hover/study)
 * - Precision pin markers reserved exclusively for Islands and maritime Straits
 * - Responsive zoom handling with counter-scaling markers and canonical centering
 * - Instant Study Mode label reveals without continent reload
 * - Strict Green (#22c55e) on correct, Red (#ef4444) on wrong
 * - High-Yield Mnemonics deck (BURGER T, LIST, MEN SOW SEEDS, TARIK, SMHEO, C P A C B, BSA peg, etc.)
 * - Pan, zoom, unified search, and progress persistence
 */

(function () {
  'use strict';

  // --- Constants & Config ---
  const POLITICAL_STORAGE_KEY = 'upsc_map_progress_v2';
  const PHYSICAL_STORAGE_KEY = 'upsc_physical_progress_v1';

  // App State
  let state = {
    mapType: 'political', // 'political' | 'physical'
    activeMode: 'click-name', // 'click-name' | 'find-country' | 'study'
    activeContinent: 'africa',
    activePhysicalCategory: 'all', // 'all' | 'desert' | 'mountain' | 'river' | 'lake' | 'island' | 'strait'
    selectedCountryId: null,
    targetCountryId: null, // For find-country mode in political
    selectedPhysicalId: null,
    targetPhysicalId: null, // For find-country mode in physical
    progress: {}, // countryId -> { status: 'correct' | 'wrong', attempts: 1 }
    physicalProgress: {}, // physicalId -> { status: 'correct' | 'wrong', attempts: 1 }
    geoData: null,
    upscData: null,
    physicalData: null,
    waterwaysData: null,
    waterwaysMap: {},
    landformsData: null,
    landformsMap: {},
    worldFeatures: []
  };

  // D3 Selection references
  let svg, mapGroup, countriesLayer, landformsLayer, waterwaysLayer, physicalLayer, projection, geoPath, zoomBehavior;
  let width = 900;
  let height = 650;
  let currentZoomScale = 1;

  // DOM Elements
  const elements = {
    viewport: document.getElementById('map-viewport'),
    mapSvg: document.getElementById('map-svg'),
    loadingOverlay: document.getElementById('loading-overlay'),
    continentTabs: document.getElementById('continent-tabs-container'),
    modeBtns: document.querySelectorAll('.mode-btn'),
    findModeText: document.getElementById('find-mode-text'),
    pageTitleMapType: document.getElementById('page-title-map-type'),
    mapTypeBtns: document.querySelectorAll('.map-type-btn'),
    physicalFilterBar: document.getElementById('physical-filter-bar'),
    categoryTabsContainer: document.getElementById('category-tabs-container'),
    categoryCountBadge: document.getElementById('category-count-badge'),
    guidancePill: document.getElementById('mode-guidance-pill'),
    guidanceText: document.getElementById('guidance-text'),
    findBanner: document.getElementById('find-prompt-banner'),
    findTargetBadge: document.getElementById('find-target-badge'),
    findTargetTypeLabel: document.getElementById('find-target-type-label'),
    findTargetName: document.getElementById('find-target-name'),
    findTargetHint: document.getElementById('find-target-hint'),
    findSkipBtn: document.getElementById('find-skip-btn'),
    tooltip: document.getElementById('map-tooltip'),

    // Status bar
    statProgress: document.getElementById('stat-progress'),
    statCorrect: document.getElementById('stat-correct'),
    statIncorrect: document.getElementById('stat-incorrect'),
    statAccuracy: document.getElementById('stat-accuracy'),
    progressFill: document.getElementById('progress-fill'),

    // Zoom controls
    zoomInBtn: document.getElementById('zoom-in-btn'),
    zoomOutBtn: document.getElementById('zoom-out-btn'),
    zoomResetBtn: document.getElementById('zoom-reset-btn'),

    // Sidebar panels
    panelIdle: document.getElementById('panel-idle'),
    panelQuiz: document.getElementById('panel-quiz'),
    panelResult: document.getElementById('panel-result'),
    quizSelectedTag: document.getElementById('quiz-selected-tag'),
    quizQuestionTitle: document.getElementById('quiz-question-title'),
    quizContinentLabel: document.getElementById('quiz-continent-label'),
    quizCategoryTag: document.getElementById('quiz-category-tag'),
    quizForm: document.getElementById('quiz-form'),
    answerInput: document.getElementById('country-answer-input'),
    btnCloseQuiz: document.getElementById('btn-close-quiz'),
    btnGiveupAnswer: document.getElementById('btn-giveup-answer'),

    // Result card
    resultBanner: document.getElementById('result-banner'),
    resultIcon: document.getElementById('result-icon'),
    resultHeadline: document.getElementById('result-headline'),
    resultSubline: document.getElementById('result-subline'),
    btnCloseResult: document.getElementById('btn-close-result'),
    cardCountryName: document.getElementById('card-country-name'),
    cardCapital: document.getElementById('card-capital'),
    cardMnemonicBox: document.getElementById('card-mnemonic-box'),
    cardMnemonicText: document.getElementById('card-mnemonic-text'),
    cardNotesContent: document.getElementById('card-notes-content'),
    cardTagsContainer: document.getElementById('card-tags-container'),
    btnRetryCard: document.getElementById('btn-retry-card'),
    btnNextUnanswered: document.getElementById('btn-next-unanswered'),

    // Mnemonics dialog
    mnemonicsBtn: document.getElementById('open-mnemonics-btn'),
    mnemonicsDialog: document.getElementById('mnemonics-dialog'),
    btnCloseModal: document.getElementById('btn-close-modal'),
    modalTabStory: document.getElementById('modal-tab-story'),
    modalTabDeck: document.getElementById('modal-tab-deck'),
    storyPane: document.getElementById('story-pane'),
    deckPane: document.getElementById('deck-pane'),
    storyActNav: document.getElementById('story-act-nav'),
    storyActsContainer: document.getElementById('story-acts-container'),
    mnemonicsGrid: document.getElementById('mnemonics-grid'),

    // Search
    searchInput: document.getElementById('country-search-input'),
    searchDropdown: document.getElementById('search-dropdown'),
    resetContinentBtn: document.getElementById('reset-continent-btn')
  };

  // Category Configuration Helper
  const CATEGORY_META = {
    all: { name: 'All Features', icon: '🌟', color: '#cfa736' },
    desert: { name: 'Deserts', icon: '🏜️', color: '#eab308' },
    mountain: { name: 'Mountains & Plateaus', icon: '⛰️', color: '#f97316' },
    river: { name: 'Rivers', icon: '🌊', color: '#06b6d4' },
    lake: { name: 'Lakes & Inland Seas', icon: '💧', color: '#38bdf8' },
    island: { name: 'Islands', icon: '🏝️', color: '#10b981' },
    strait: { name: 'Straits & Canals', icon: '⚓', color: '#a855f7' }
  };

  // --- Initialize Application ---
  async function init() {
    loadProgress();
    setupEventListeners();
    await loadData();
    renderContinentTabs();
    initD3Map();
    renderPhysicalCategoryTabs();
    renderMnemonicsDeck();
    updateUIForMapType();
    updateUIForMode();
    updateStats();
  }

  // --- Data Loading ---
  async function loadData() {
    try {
      const [topoRes, upscRes, physRes, waterRes, landRes] = await Promise.all([
        fetch('data/world.json'),
        fetch('data/upsc-data.json'),
        fetch('data/physical-data.json'),
        fetch('data/waterways.json'),
        fetch('data/landforms.json')
      ]);

      if (!topoRes.ok || !upscRes.ok || !physRes.ok) {
        throw new Error('Failed to load map data files');
      }

      state.geoData = await topoRes.json();
      state.upscData = await upscRes.json();
      state.physicalData = await physRes.json();

      if (waterRes && waterRes.ok) {
        state.waterwaysData = await waterRes.json();
        state.waterwaysMap = {};
        (state.waterwaysData.features || []).forEach(f => {
          state.waterwaysMap[f.id] = f;
        });
      }

      if (landRes && landRes.ok) {
        state.landformsData = await landRes.json();
        state.landformsMap = {};
        (state.landformsData.features || []).forEach(f => {
          state.landformsMap[f.id] = f;
        });
      }

      // Convert TopoJSON to GeoJSON features
      const countriesObj = state.geoData.objects.countries;
      state.worldFeatures = topojson.feature(state.geoData, countriesObj).features;

      elements.loadingOverlay.classList.add('hidden');
    } catch (err) {
      console.error('Initialization error:', err);
      elements.loadingOverlay.innerHTML = `
        <div style="color: #ef4444; text-align: center; padding: 20px;">
          <h3>Failed to load map data</h3>
          <p>${err.message}</p>
        </div>
      `;
    }
  }

  // --- Progress Persistence ---
  function loadProgress() {
    try {
      const savedPolitical = localStorage.getItem(POLITICAL_STORAGE_KEY);
      if (savedPolitical) state.progress = JSON.parse(savedPolitical);
    } catch (e) {
      console.warn('Could not read political progress', e);
      state.progress = {};
    }

    try {
      const savedPhysical = localStorage.getItem(PHYSICAL_STORAGE_KEY);
      if (savedPhysical) state.physicalProgress = JSON.parse(savedPhysical);
    } catch (e) {
      console.warn('Could not read physical progress', e);
      state.physicalProgress = {};
    }
  }

  function saveProgress() {
    try {
      if (state.mapType === 'political') {
        localStorage.setItem(POLITICAL_STORAGE_KEY, JSON.stringify(state.progress));
      } else {
        localStorage.setItem(PHYSICAL_STORAGE_KEY, JSON.stringify(state.physicalProgress));
      }
    } catch (e) {
      console.warn('Could not save progress', e);
    }
  }

  // --- Continent Tabs ---
  function renderContinentTabs() {
    const regions = state.upscData.regions;
    elements.continentTabs.innerHTML = '';

    Object.values(regions).forEach(region => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `continent-tab-btn ${region.id === state.activeContinent ? 'active' : ''}`;
      btn.dataset.continent = region.id;
      btn.innerHTML = `<span>${region.icon}</span> <span>${region.name}</span>`;
      btn.addEventListener('click', () => switchContinent(region.id));
      elements.continentTabs.appendChild(btn);
    });
  }

  function switchContinent(continentId) {
    if (state.activeContinent === continentId) return;
    state.activeContinent = continentId;

    // Update tab styles
    document.querySelectorAll('.continent-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.continent === continentId);
    });

    deselectCurrent();

    // Update map projection and redraw
    updateProjection();
    renderCountries();
    if (state.mapType === 'physical') {
      renderPhysicalCategoryTabs();
      renderLandforms();
      renderWaterways();
      renderPhysicalFeatures();
    }
    resetZoom();

    if (state.activeMode === 'find-country') {
      pickNextFindTarget();
    }

    updateStats();
  }

  // --- Physical Category Filter Tabs ---
  function renderPhysicalCategoryTabs() {
    if (!state.physicalData) return;
    const feats = Object.values(state.physicalData.features);
    
    // Count features in active continent per category
    const counts = { all: 0, desert: 0, mountain: 0, river: 0, lake: 0, island: 0, strait: 0 };
    feats.forEach(f => {
      const inContinent = state.activeContinent === 'world' || f.continent === state.activeContinent;
      if (inContinent) {
        counts.all++;
        if (counts[f.category] !== undefined) counts[f.category]++;
      }
    });

    elements.categoryTabsContainer.innerHTML = '';
    const categories = ['all', 'desert', 'mountain', 'river', 'lake', 'island', 'strait'];

    categories.forEach(catId => {
      const meta = CATEGORY_META[catId];
      const count = counts[catId] || 0;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `category-tab-btn ${state.activePhysicalCategory === catId ? 'active' : ''}`;
      btn.dataset.category = catId;
      btn.innerHTML = `<span>${meta.icon}</span> <span>${meta.name}</span> <span class="category-badge-count">${count}</span>`;
      btn.addEventListener('click', () => switchPhysicalCategory(catId));
      elements.categoryTabsContainer.appendChild(btn);
    });

    elements.categoryCountBadge.textContent = `${counts[state.activePhysicalCategory] || counts.all} visible features`;
  }

  function switchPhysicalCategory(category) {
    state.activePhysicalCategory = category;
    document.querySelectorAll('.category-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === category);
    });
    renderLandforms();
    renderWaterways();
    renderPhysicalFeatures();
    renderPhysicalCategoryTabs();
    if (state.activeMode === 'find-country') {
      pickNextFindTarget();
    }
    updateStats();
  }

  // --- Map Type Switching (Political vs Physical) ---
  function setMapType(mapType) {
    if (state.mapType === mapType) return;
    state.mapType = mapType;

    elements.mapTypeBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mapType === mapType);
    });

    updateUIForMapType();
    deselectCurrent();
    renderCountries();

    if (mapType === 'physical') {
      renderPhysicalCategoryTabs();
      renderLandforms();
      renderWaterways();
      renderPhysicalFeatures();
    } else {
      if (landformsLayer) landformsLayer.selectAll('*').remove();
      if (waterwaysLayer) waterwaysLayer.selectAll('*').remove();
      if (physicalLayer) physicalLayer.selectAll('*').remove();
    }

    if (state.activeMode === 'find-country') {
      pickNextFindTarget();
    }

    updateStats();
  }

  function updateUIForMapType() {
    const isPhysical = state.mapType === 'physical';
    
    if (elements.pageTitleMapType) {
      elements.pageTitleMapType.textContent = isPhysical ? 'Physical' : 'Political';
    }

    if (elements.findModeText) {
      elements.findModeText.textContent = isPhysical ? 'Find Feature' : 'Find Country';
    }

    if (isPhysical) {
      elements.physicalFilterBar.classList.remove('hidden');
      elements.viewport.classList.add('physical-mode-active');
      elements.searchInput.placeholder = 'Search physical feature (e.g. Atlas, Sahara, Victoria, Nile, Malacca)...';
    } else {
      elements.physicalFilterBar.classList.add('hidden');
      elements.viewport.classList.remove('physical-mode-active');
      elements.searchInput.placeholder = 'Search country (e.g. Djibouti, Chad, Kazakhstan)...';
    }

    updateUIForMode();
  }

  // --- D3 Map Engine ---
  function initD3Map() {
    const bbox = elements.viewport.getBoundingClientRect();
    width = bbox.width || 900;
    height = bbox.height || 650;

    svg = d3.select('#map-svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Zoom behavior with counter-scaling for markers
    zoomBehavior = d3.zoom()
      .scaleExtent([0.6, 25])
      .on('zoom', (event) => {
        currentZoomScale = event.transform.k;
        mapGroup.attr('transform', event.transform);
        updateMarkerScales(currentZoomScale);
      });

    svg.call(zoomBehavior)
       .on('dblclick.zoom', null);

    // Main map container group
    mapGroup = svg.append('g').attr('id', 'map-world-group');

    // Ocean background click to deselect
    mapGroup.append('rect')
      .attr('width', 10000)
      .attr('height', 10000)
      .attr('x', -5000)
      .attr('y', -5000)
      .attr('fill', 'transparent')
      .on('click', () => {
        if (state.activeMode !== 'find-country') {
          deselectCurrent();
        }
      });

    // Sub-layers (in strict z-index order)
    countriesLayer = mapGroup.append('g').attr('id', 'countries-layer');
    landformsLayer = mapGroup.append('g').attr('id', 'landforms-layer');
    waterwaysLayer = mapGroup.append('g').attr('id', 'waterways-layer');
    physicalLayer = mapGroup.append('g').attr('id', 'physical-layer');

    updateProjection();
    renderCountries();
    if (state.mapType === 'physical') {
      renderLandforms();
      renderWaterways();
      renderPhysicalFeatures();
    }

    window.addEventListener('resize', handleResize);
  }

  // Keep marker pins compact and crisp when zoomed in
  function updateMarkerScales(k) {
    const markerScale = Math.max(0.35, Math.min(1, 1.25 / Math.sqrt(k)));
    if (physicalLayer) {
      physicalLayer.selectAll('.physical-marker').each(function (d) {
        const coords = projection(d.coords);
        if (coords && !isNaN(coords[0]) && !isNaN(coords[1])) {
          d3.select(this).attr('transform', `translate(${coords[0]}, ${coords[1]}) scale(${markerScale})`);
        }
      });
    }
  }

  function handleResize() {
    const bbox = elements.viewport.getBoundingClientRect();
    if (!bbox.width || !bbox.height) return;
    width = bbox.width;
    height = bbox.height;
    svg.attr('viewBox', `0 0 ${width} ${height}`);
    updateProjection();
    renderCountries();
    if (state.mapType === 'physical') {
      renderLandforms();
      renderWaterways();
      renderPhysicalFeatures();
    }
  }

  function updateProjection() {
    const regConfig = state.upscData.regions[state.activeContinent] || state.upscData.regions['world'];
    const scaleFactor = Math.min(width / 900, height / 650);

    projection = d3.geoMercator()
      .center(regConfig.center)
      .scale(regConfig.scale * Math.max(0.7, scaleFactor))
      .translate([width / 2, height / 2]);

    geoPath = d3.geoPath().projection(projection);
  }

  function isCountryInActiveContinent(feature) {
    if (state.activeContinent === 'world') return true;
    const cid = String(feature.id);
    const cMeta = state.upscData.countries[cid];
    if (!cMeta) return false;

    switch (state.activeContinent) {
      case 'africa': return cMeta.continent === 'Africa';
      case 'west-asia': return cMeta.continent === 'West Asia';
      case 'europe': return cMeta.continent === 'Europe';
      case 'east-central-asia': return cMeta.continent === 'East & Central Asia';
      case 'south-se-asia': return cMeta.continent === 'South & Southeast Asia' || cMeta.subregion === 'Oceania';
      case 'south-america': return cMeta.continent === 'South America';
      case 'north-america': return cMeta.continent === 'North America';
      default: return true;
    }
  }

  function isPhysicalInActiveContinent(f) {
    if (state.activeContinent === 'world') return true;
    return f.continent === state.activeContinent;
  }

  // --- Render Political Countries ---
  function renderCountries() {
    if (!state.worldFeatures.length || !countriesLayer) return;

    const paths = countriesLayer.selectAll('.country-path')
      .data(state.worldFeatures, d => d.id);

    paths.exit().remove();

    const enterPaths = paths.enter()
      .append('path')
      .attr('class', 'country-path')
      .attr('id', d => `country-${d.id}`);

    const mergedPaths = enterPaths.merge(paths);

    mergedPaths
      .attr('d', geoPath)
      .attr('display', d => {
        if (d.id === '010' && state.activeContinent !== 'world') return 'none'; // Antarctica
        return null;
      })
      .style('opacity', d => {
        if (state.mapType === 'physical') {
          return isCountryInActiveContinent(d) ? 0.85 : 0.25;
        }
        if (state.activeContinent === 'world') return 1;
        return isCountryInActiveContinent(d) ? 1 : 0.18;
      })
      .style('pointer-events', d => {
        if (state.mapType === 'physical') return 'none';
        if (state.activeContinent === 'world') return 'all';
        return isCountryInActiveContinent(d) ? 'all' : 'none';
      })
      .each(function (d) {
        if (state.mapType === 'political') {
          updateCountryPathStyle(d3.select(this), String(d.id));
        } else {
          d3.select(this)
            .classed('country-selected', false)
            .classed('country-correct', false)
            .classed('country-wrong', false);
        }
      })
      .on('mouseenter', handleCountryMouseEnter)
      .on('mousemove', handleMouseMove)
      .on('mouseleave', handleMouseLeave)
      .on('click', handleCountryClick);
  }

  function updateCountryPathStyle(pathSelection, cid) {
    const isSelected = state.selectedCountryId === cid;
    const result = state.progress[cid];

    pathSelection
      .classed('country-selected', isSelected)
      .classed('country-correct', result && result.status === 'correct')
      .classed('country-wrong', result && result.status === 'wrong');
  }

  // --- Render True Span Polygons for Deserts & Mountains ---
  function renderLandforms() {
    if (!landformsLayer || !state.landformsData || state.mapType !== 'physical') {
      if (landformsLayer) landformsLayer.selectAll('*').remove();
      return;
    }

    const visibleLandforms = (state.landformsData.features || []).filter(f => {
      const matchContinent = state.activeContinent === 'world' || f.properties.continent === state.activeContinent;
      const matchCategory = state.activePhysicalCategory === 'all' || f.properties.category === state.activePhysicalCategory;
      return matchContinent && matchCategory;
    });

    const deserts = visibleLandforms.filter(f => f.properties.category === 'desert');
    const mountains = visibleLandforms.filter(f => f.properties.category === 'mountain');

    // 1. Render Deserts Span Polygons
    const desertPaths = landformsLayer.selectAll('.desert-path')
      .data(deserts, d => d.id);

    desertPaths.exit().remove();

    const enterDeserts = desertPaths.enter()
      .append('path')
      .attr('class', 'desert-path')
      .attr('id', d => `desert-${d.id}`);

    enterDeserts.merge(desertPaths)
      .attr('d', d => geoPath(d.geometry))
      .each(function(d) {
        updateDesertPathStyle(d3.select(this), d.id);
      })
      .on('mouseenter', (event, d) => {
        const feat = state.physicalData && state.physicalData.features[d.id];
        if (feat) handlePhysicalMouseEnter(event, feat);
      })
      .on('mousemove', handleMouseMove)
      .on('mouseleave', handleMouseLeave)
      .on('click', (event, d) => {
        event.stopPropagation();
        if (state.activeMode === 'find-country') {
          handleFindPhysicalClick(d.id);
        } else {
          selectPhysicalFeature(d.id);
        }
      });

    // 2. Render Mountains Span Polygons
    const mountainPaths = landformsLayer.selectAll('.mountain-path')
      .data(mountains, d => d.id);

    mountainPaths.exit().remove();

    const enterMountains = mountainPaths.enter()
      .append('path')
      .attr('class', 'mountain-path')
      .attr('id', d => `mountain-${d.id}`);

    enterMountains.merge(mountainPaths)
      .attr('d', d => geoPath(d.geometry))
      .each(function(d) {
        updateMountainPathStyle(d3.select(this), d.id);
      })
      .on('mouseenter', (event, d) => {
        const feat = state.physicalData && state.physicalData.features[d.id];
        if (feat) handlePhysicalMouseEnter(event, feat);
      })
      .on('mousemove', handleMouseMove)
      .on('mouseleave', handleMouseLeave)
      .on('click', (event, d) => {
        event.stopPropagation();
        if (state.activeMode === 'find-country') {
          handleFindPhysicalClick(d.id);
        } else {
          selectPhysicalFeature(d.id);
        }
      });
  }

  function updateDesertPathStyle(sel, fid) {
    const isSelected = state.selectedPhysicalId === fid;
    const result = state.physicalProgress[fid];
    sel
      .classed('desert-selected', isSelected)
      .classed('desert-correct', result && result.status === 'correct')
      .classed('desert-wrong', result && result.status === 'wrong');
  }

  function updateMountainPathStyle(sel, fid) {
    const isSelected = state.selectedPhysicalId === fid;
    const result = state.physicalProgress[fid];
    sel
      .classed('mountain-selected', isSelected)
      .classed('mountain-correct', result && result.status === 'correct')
      .classed('mountain-wrong', result && result.status === 'wrong');
  }

  // --- Render True Vector Outlines for Rivers & Lakes ---
  function renderWaterways() {
    if (!waterwaysLayer || !state.waterwaysData || state.mapType !== 'physical') {
      if (waterwaysLayer) waterwaysLayer.selectAll('*').remove();
      return;
    }

    const visibleWaterways = (state.waterwaysData.features || []).filter(f => {
      const matchContinent = state.activeContinent === 'world' || f.properties.continent === state.activeContinent;
      const matchCategory = state.activePhysicalCategory === 'all' || f.properties.category === state.activePhysicalCategory;
      return matchContinent && matchCategory;
    });

    const lakes = visibleWaterways.filter(f => f.properties.category === 'lake');
    const rivers = visibleWaterways.filter(f => f.properties.category === 'river');

    // 1. Render Lakes Polygons
    const lakePaths = waterwaysLayer.selectAll('.lake-path')
      .data(lakes, d => d.id);

    lakePaths.exit().remove();

    const enterLakes = lakePaths.enter()
      .append('path')
      .attr('class', 'lake-path')
      .attr('id', d => `lake-${d.id}`);

    enterLakes.merge(lakePaths)
      .attr('d', d => geoPath(d.geometry))
      .each(function(d) {
        updateLakePathStyle(d3.select(this), d.id);
      })
      .on('mouseenter', (event, d) => {
        const feat = state.physicalData && state.physicalData.features[d.id];
        if (feat) handlePhysicalMouseEnter(event, feat);
      })
      .on('mousemove', handleMouseMove)
      .on('mouseleave', handleMouseLeave)
      .on('click', (event, d) => {
        event.stopPropagation();
        if (state.activeMode === 'find-country') {
          handleFindPhysicalClick(d.id);
        } else {
          selectPhysicalFeature(d.id);
        }
      });

    // 2. Render Rivers Lines (with invisible thick hit line for effortless clicking)
    const riverGroups = waterwaysLayer.selectAll('.river-group')
      .data(rivers, d => d.id);

    riverGroups.exit().remove();

    const enterRivers = riverGroups.enter()
      .append('g')
      .attr('class', 'river-group')
      .attr('id', d => `river-group-${d.id}`);

    enterRivers.append('path')
      .attr('class', 'river-hit-path');

    enterRivers.append('path')
      .attr('class', 'river-path')
      .attr('id', d => `river-${d.id}`);

    const mergedRivers = enterRivers.merge(riverGroups);

    mergedRivers.each(function(d) {
      const pathData = geoPath(d.geometry);
      const grp = d3.select(this);
      grp.select('.river-hit-path').attr('d', pathData);
      const visibleRiver = grp.select('.river-path').attr('d', pathData);
      updateRiverPathStyle(visibleRiver, d.id);
    })
    .on('mouseenter', (event, d) => {
      const feat = state.physicalData && state.physicalData.features[d.id];
      if (feat) handlePhysicalMouseEnter(event, feat);
    })
    .on('mousemove', handleMouseMove)
    .on('mouseleave', handleMouseLeave)
    .on('click', (event, d) => {
      event.stopPropagation();
      if (state.activeMode === 'find-country') {
        handleFindPhysicalClick(d.id);
      } else {
        selectPhysicalFeature(d.id);
      }
    });
  }

  function updateLakePathStyle(sel, fid) {
    const isSelected = state.selectedPhysicalId === fid;
    const result = state.physicalProgress[fid];
    sel
      .classed('lake-selected', isSelected)
      .classed('lake-correct', result && result.status === 'correct')
      .classed('lake-wrong', result && result.status === 'wrong');
  }

  function updateRiverPathStyle(sel, fid) {
    const isSelected = state.selectedPhysicalId === fid;
    const result = state.physicalProgress[fid];
    sel
      .classed('river-selected', isSelected)
      .classed('river-correct', result && result.status === 'correct')
      .classed('river-wrong', result && result.status === 'wrong');
  }

  // --- Render Physical Markers (Islands & Straits Only) ---
  // Note: Deserts, Mountains, Rivers, and Lakes are rendered as vector spans/paths
  function getVisiblePhysicalMarkers() {
    if (!state.physicalData) return [];
    const all = Object.values(state.physicalData.features);
    return all.filter(f => {
      // Exclude landforms and waterways from circular pin markers
      if (f.category === 'river' || f.category === 'lake' || f.category === 'desert' || f.category === 'mountain') return false;
      const matchContinent = isPhysicalInActiveContinent(f);
      const matchCategory = state.activePhysicalCategory === 'all' || f.category === state.activePhysicalCategory;
      return matchContinent && matchCategory;
    });
  }

  // Helper: All active features (including deserts, mountains, rivers & lakes) for stats, find targets, and search
  function getAllActivePhysicalFeatures() {
    if (!state.physicalData) return [];
    const all = Object.values(state.physicalData.features);
    return all.filter(f => {
      const matchContinent = isPhysicalInActiveContinent(f);
      const matchCategory = state.activePhysicalCategory === 'all' || f.category === state.activePhysicalCategory;
      return matchContinent && matchCategory;
    });
  }

  function renderPhysicalFeatures() {
    if (!physicalLayer || state.mapType !== 'physical') return;

    const visibleMarkers = getVisiblePhysicalMarkers();

    const markers = physicalLayer.selectAll('.physical-marker')
      .data(visibleMarkers, d => d.id);

    markers.exit().remove();

    const enterMarkers = markers.enter()
      .append('g')
      .attr('class', 'physical-marker')
      .attr('id', d => `marker-${d.id}`);

    // Outer invisible hit circle for easy touch/click
    enterMarkers.append('circle')
      .attr('class', 'marker-hit-area')
      .attr('r', 18);

    // Halo pulse ring
    enterMarkers.append('circle')
      .attr('class', 'marker-halo')
      .attr('r', 13)
      .attr('fill', 'none');

    // Solid core circle
    enterMarkers.append('circle')
      .attr('class', 'marker-core')
      .attr('r', 8);

    // Text glyph / emoji
    enterMarkers.append('text')
      .attr('class', 'marker-icon-glyph')
      .attr('y', 0.5);

    // Clean label
    enterMarkers.append('text')
      .attr('class', 'marker-label')
      .attr('y', 19);

    const mergedMarkers = enterMarkers.merge(markers);
    const markerScale = Math.max(0.35, Math.min(1, 1.25 / Math.sqrt(currentZoomScale)));

    mergedMarkers
      .attr('transform', d => {
        const coords = projection(d.coords);
        if (!coords || isNaN(coords[0]) || isNaN(coords[1])) return 'translate(-9999,-9999)';
        return `translate(${coords[0]}, ${coords[1]}) scale(${markerScale})`;
      })
      .each(function (d) {
        updatePhysicalMarkerStyle(d3.select(this), d);
      })
      .on('mouseenter', handlePhysicalMouseEnter)
      .on('mousemove', handleMouseMove)
      .on('mouseleave', handleMouseLeave)
      .on('click', handlePhysicalClick);
  }

  function updatePhysicalMarkerStyle(markerSelection, f) {
    const fid = f.id;
    const cat = CATEGORY_META[f.category] || CATEGORY_META.mountain;
    const result = state.physicalProgress[fid];
    const isSelected = state.selectedPhysicalId === fid;

    markerSelection
      .classed('marker-selected', isSelected)
      .classed('marker-correct', result && result.status === 'correct')
      .classed('marker-wrong', result && result.status === 'wrong');

    const core = markerSelection.select('.marker-core');
    const halo = markerSelection.select('.marker-halo');
    const glyph = markerSelection.select('.marker-icon-glyph');
    const label = markerSelection.select('.marker-label');

    if (result && result.status === 'correct') {
      core.attr('fill', '#22c55e');
      halo.attr('stroke', '#22c55e');
      glyph.text('✓').attr('fill', '#ffffff');
    } else if (result && result.status === 'wrong') {
      core.attr('fill', '#ef4444');
      halo.attr('stroke', '#ef4444');
      glyph.text('✗').attr('fill', '#ffffff');
    } else {
      core.attr('fill', cat.color);
      halo.attr('stroke', cat.color);
      glyph.text(cat.icon);
    }

    // Immediately reveal label text in study mode or if answered
    if (state.activeMode === 'study' || result) {
      label.text(f.name).style('opacity', 1);
    } else {
      label.text('').style('opacity', 0);
    }
  }

  // --- Mouse & Tooltip Handlers ---
  function handleCountryMouseEnter(event, d) {
    if (state.mapType === 'physical') return;
    const cid = String(d.id);
    const country = state.upscData.countries[cid];
    if (!country) return;

    const result = state.progress[cid];
    let tooltipHtml = '';

    if (state.activeMode === 'study') {
      tooltipHtml = `<strong>${country.name}</strong>${country.capital ? ` • <span style="color:#f5d47a">${country.capital}</span>` : ''}`;
    } else {
      if (result) {
        const icon = result.status === 'correct' ? '<span style="color:#22c55e"><i class="fa-solid fa-check"></i></span>' : '<span style="color:#ef4444"><i class="fa-solid fa-xmark"></i></span>';
        tooltipHtml = `${icon} <strong>${country.name}</strong>`;
      } else {
        tooltipHtml = `Click to name territory`;
      }
    }

    elements.tooltip.innerHTML = tooltipHtml;
    elements.tooltip.classList.remove('hidden');
    elements.tooltip.style.opacity = '1';
  }

  function handlePhysicalMouseEnter(event, d) {
    const result = state.physicalProgress[d.id];
    const cat = CATEGORY_META[d.category] || CATEGORY_META.mountain;
    let tooltipHtml = '';

    if (state.activeMode === 'study') {
      tooltipHtml = `<strong>${cat.icon} ${d.name}</strong><br/><span style="color:#f5d47a; font-size: 0.8rem">${d.countries || cat.name}</span>`;
    } else {
      if (result) {
        const icon = result.status === 'correct' ? '<span style="color:#22c55e">✓ Correct</span>' : '<span style="color:#ef4444">✗ Incorrect</span>';
        tooltipHtml = `${icon} • <strong>${d.name}</strong> (${cat.name})`;
      } else {
        tooltipHtml = `<strong>${cat.icon} ${cat.name}</strong><br/><span style="font-size:0.8rem; color:#9da1b5">Click to identify</span>`;
      }
    }

    elements.tooltip.innerHTML = tooltipHtml;
    elements.tooltip.classList.remove('hidden');
    elements.tooltip.style.opacity = '1';
  }

  function handleMouseMove(event) {
    const viewportRect = elements.viewport.getBoundingClientRect();
    const x = event.clientX - viewportRect.left;
    const y = event.clientY - viewportRect.top;

    elements.tooltip.style.left = `${x}px`;
    elements.tooltip.style.top = `${y}px`;
  }

  function handleMouseLeave() {
    elements.tooltip.classList.add('hidden');
    elements.tooltip.style.opacity = '0';
  }

  // --- Click & Selection Logic ---
  function handleCountryClick(event, d) {
    event.stopPropagation();
    if (state.mapType === 'physical') return;
    const cid = String(d.id);
    const country = state.upscData.countries[cid];
    if (!country) return;

    if (state.activeMode === 'find-country') {
      handleFindCountryClick(cid);
      return;
    }

    selectCountry(cid);
  }

  function handlePhysicalClick(event, d) {
    event.stopPropagation();
    if (state.activeMode === 'find-country') {
      handleFindPhysicalClick(d.id);
      return;
    }

    selectPhysicalFeature(d.id);
  }

  function selectCountry(cid) {
    state.selectedCountryId = cid;
    state.selectedPhysicalId = null;

    countriesLayer.selectAll('.country-path').each(function (d) {
      updateCountryPathStyle(d3.select(this), String(d.id));
    });

    hideAllPanels();

    if (state.activeMode === 'study') {
      showCountryResultCard(cid, 'study');
      return;
    }

    const existingResult = state.progress[cid];
    if (existingResult) {
      showCountryResultCard(cid, existingResult.status);
    } else {
      showCountryQuizPrompt(cid);
    }
  }

  function selectPhysicalFeature(fid) {
    state.selectedPhysicalId = fid;
    state.selectedCountryId = null;

    if (landformsLayer) {
      landformsLayer.selectAll('.desert-path').each(function (d) {
        updateDesertPathStyle(d3.select(this), d.id);
      });
      landformsLayer.selectAll('.mountain-path').each(function (d) {
        updateMountainPathStyle(d3.select(this), d.id);
      });
    }

    if (waterwaysLayer) {
      waterwaysLayer.selectAll('.lake-path').each(function (d) {
        updateLakePathStyle(d3.select(this), d.id);
      });
      waterwaysLayer.selectAll('.river-path').each(function (d) {
        updateRiverPathStyle(d3.select(this), d.id);
      });
    }

    if (physicalLayer) {
      physicalLayer.selectAll('.physical-marker').each(function (d) {
        updatePhysicalMarkerStyle(d3.select(this), d);
      });
    }

    hideAllPanels();

    if (state.activeMode === 'study') {
      showPhysicalResultCard(fid, 'study');
      return;
    }

    const existingResult = state.physicalProgress[fid];
    if (existingResult) {
      showPhysicalResultCard(fid, existingResult.status);
    } else {
      showPhysicalQuizPrompt(fid);
    }
  }

  function deselectCurrent() {
    state.selectedCountryId = null;
    state.selectedPhysicalId = null;

    if (countriesLayer) {
      countriesLayer.selectAll('.country-path').classed('country-selected', false);
    }
    if (landformsLayer) {
      landformsLayer.selectAll('.desert-path').classed('desert-selected', false);
      landformsLayer.selectAll('.mountain-path').classed('mountain-selected', false);
    }
    if (waterwaysLayer) {
      waterwaysLayer.selectAll('.lake-path').classed('lake-selected', false);
      waterwaysLayer.selectAll('.river-path').classed('river-selected', false);
    }
    if (physicalLayer) {
      physicalLayer.selectAll('.physical-marker').classed('marker-selected', false);
    }

    hideAllPanels();
    elements.panelIdle.classList.remove('hidden');
  }

  function hideAllPanels() {
    elements.panelIdle.classList.add('hidden');
    elements.panelQuiz.classList.add('hidden');
    elements.panelResult.classList.add('hidden');
  }

  // --- Quiz Prompts ---
  function showCountryQuizPrompt(cid) {
    const country = state.upscData.countries[cid];
    elements.quizSelectedTag.textContent = 'Territory Selected';
    elements.quizQuestionTitle.textContent = 'What is the name of this country?';
    elements.quizContinentLabel.textContent = `Continent: ${country.continent || 'World'}`;
    elements.quizCategoryTag.classList.add('hidden');
    elements.answerInput.value = '';
    elements.answerInput.placeholder = 'Type country name...';
    elements.panelQuiz.classList.remove('hidden');

    setTimeout(() => {
      elements.answerInput.focus();
    }, 50);
  }

  function showPhysicalQuizPrompt(fid) {
    const f = state.physicalData.features[fid];
    const cat = CATEGORY_META[f.category] || CATEGORY_META.mountain;

    elements.quizSelectedTag.textContent = `${cat.icon} ${cat.name}`;
    elements.quizQuestionTitle.textContent = `What is the name of this ${f.category.toUpperCase()}?`;
    elements.quizContinentLabel.textContent = `Region: ${f.continent.toUpperCase()}`;
    elements.quizCategoryTag.textContent = cat.name;
    elements.quizCategoryTag.classList.remove('hidden');
    elements.answerInput.value = '';
    elements.answerInput.placeholder = `Type ${f.category} name (e.g. ${f.name.split(' ')[0]})...`;
    elements.panelQuiz.classList.remove('hidden');

    setTimeout(() => {
      elements.answerInput.focus();
    }, 50);
  }

  function normalizeString(str) {
    return (str || '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function handleAnswerSubmit(e) {
    if (e) e.preventDefault();
    const userInput = elements.answerInput.value.trim();
    if (!userInput) return;

    if (state.mapType === 'political') {
      handleCountryAnswerSubmit(userInput);
    } else {
      handlePhysicalAnswerSubmit(userInput);
    }
  }

  function handleCountryAnswerSubmit(userInput) {
    if (!state.selectedCountryId) return;
    const cid = state.selectedCountryId;
    const country = state.upscData.countries[cid];
    const normalizedInput = normalizeString(userInput);

    const matches = country.aliases.some(alias => {
      const normAlias = normalizeString(alias);
      return normAlias === normalizedInput || normalizedInput.includes(normAlias) || normAlias.includes(normalizedInput);
    }) || normalizeString(country.name) === normalizedInput;

    const isCorrect = matches;

    state.progress[cid] = {
      status: isCorrect ? 'correct' : 'wrong',
      attempts: ((state.progress[cid] && state.progress[cid].attempts) || 0) + 1,
      lastAnswer: userInput
    };
    saveProgress();

    const path = d3.select(`#country-${cid}`);
    path.classed(isCorrect ? 'animate-correct' : 'animate-wrong', true);
    setTimeout(() => {
      path.classed(isCorrect ? 'animate-correct' : 'animate-wrong', false);
    }, 600);

    updateCountryPathStyle(path, cid);
    updateStats();
    showCountryResultCard(cid, isCorrect ? 'correct' : 'wrong');
  }

  function handlePhysicalAnswerSubmit(userInput) {
    if (!state.selectedPhysicalId) return;
    const fid = state.selectedPhysicalId;
    const f = state.physicalData.features[fid];
    const normalizedInput = normalizeString(userInput);

    const matches = (f.aliases || []).some(alias => {
      const normAlias = normalizeString(alias);
      return normAlias === normalizedInput || normalizedInput.includes(normAlias) || normAlias.includes(normalizedInput);
    }) || normalizeString(f.name) === normalizedInput;

    const isCorrect = matches;

    state.physicalProgress[fid] = {
      status: isCorrect ? 'correct' : 'wrong',
      attempts: ((state.physicalProgress[fid] && state.physicalProgress[fid].attempts) || 0) + 1,
      lastAnswer: userInput
    };
    saveProgress();

    if (f.category === 'desert') {
      const dPath = d3.select(`#desert-${fid}`);
      if (!dPath.empty()) updateDesertPathStyle(dPath, fid);
    } else if (f.category === 'mountain') {
      const mPath = d3.select(`#mountain-${fid}`);
      if (!mPath.empty()) updateMountainPathStyle(mPath, fid);
    } else if (f.category === 'lake') {
      const lPath = d3.select(`#lake-${fid}`);
      if (!lPath.empty()) updateLakePathStyle(lPath, fid);
    } else if (f.category === 'river') {
      const rPath = d3.select(`#river-${fid}`);
      if (!rPath.empty()) updateRiverPathStyle(rPath, fid);
    } else {
      const marker = d3.select(`#marker-${fid}`);
      updatePhysicalMarkerStyle(marker, f);
    }

    updateStats();
    showPhysicalResultCard(fid, isCorrect ? 'correct' : 'wrong');
  }

  function handleGiveUp() {
    if (state.mapType === 'political') {
      if (!state.selectedCountryId) return;
      const cid = state.selectedCountryId;
      state.progress[cid] = {
        status: 'wrong',
        attempts: ((state.progress[cid] && state.progress[cid].attempts) || 0) + 1,
        lastAnswer: 'revealed'
      };
      saveProgress();
      const path = d3.select(`#country-${cid}`);
      updateCountryPathStyle(path, cid);
      updateStats();
      showCountryResultCard(cid, 'wrong');
    } else {
      if (!state.selectedPhysicalId) return;
      const fid = state.selectedPhysicalId;
      const f = state.physicalData.features[fid];
      state.physicalProgress[fid] = {
        status: 'wrong',
        attempts: ((state.physicalProgress[fid] && state.physicalProgress[fid].attempts) || 0) + 1,
        lastAnswer: 'revealed'
      };
      saveProgress();

      if (f.category === 'desert') {
        const dPath = d3.select(`#desert-${fid}`);
        if (!dPath.empty()) updateDesertPathStyle(dPath, fid);
      } else if (f.category === 'mountain') {
        const mPath = d3.select(`#mountain-${fid}`);
        if (!mPath.empty()) updateMountainPathStyle(mPath, fid);
      } else if (f.category === 'lake') {
        const lPath = d3.select(`#lake-${fid}`);
        if (!lPath.empty()) updateLakePathStyle(lPath, fid);
      } else if (f.category === 'river') {
        const rPath = d3.select(`#river-${fid}`);
        if (!rPath.empty()) updateRiverPathStyle(rPath, fid);
      } else {
        const marker = d3.select(`#marker-${fid}`);
        updatePhysicalMarkerStyle(marker, f);
      }

      updateStats();
      showPhysicalResultCard(fid, 'wrong');
    }
  }

  // --- Result Flashcards ---
  function showCountryResultCard(cid, status) {
    const country = state.upscData.countries[cid];
    if (!country) return;

    hideAllPanels();
    elements.panelResult.classList.remove('hidden');

    elements.resultBanner.className = 'result-banner';
    if (status === 'correct') {
      elements.resultBanner.classList.add('banner-correct');
      elements.resultIcon.innerHTML = '<i class="fa-solid fa-check"></i>';
      elements.resultHeadline.textContent = 'Correct!';
      elements.resultSubline.textContent = 'Country marked green on your political map.';
    } else if (status === 'wrong') {
      elements.resultBanner.classList.add('banner-wrong');
      elements.resultIcon.innerHTML = '<i class="fa-solid fa-xmark"></i>';
      elements.resultHeadline.textContent = 'Incorrect!';
      elements.resultSubline.textContent = `Correct territory: ${country.name}`;
    } else {
      elements.resultBanner.classList.add('banner-study');
      elements.resultIcon.innerHTML = '<i class="fa-solid fa-book-open"></i>';
      elements.resultHeadline.textContent = 'UPSC Flashcard';
      elements.resultSubline.textContent = `${country.continent} • ${country.subregion || 'GS-I Syllabus'}`;
    }

    elements.cardCountryName.textContent = country.name;
    elements.cardCapital.textContent = country.capital ? `Capital: ${country.capital}` : 'Sovereign Territory';

    if (country.mnemonic) {
      elements.cardMnemonicBox.classList.remove('hidden');
      const headerEl = elements.cardMnemonicBox.querySelector('.mnemonic-header');
      if (country.mnemonic.includes('🎬 Spy Story:')) {
        const textClean = country.mnemonic.replace('🎬 Spy Story:', '').trim();
        if (headerEl) {
          headerEl.innerHTML = `
            <div class="mnemonic-header-left">
              <i class="fa-solid fa-clapperboard text-gold"></i>
              <strong>Mass Hero Spy Mission</strong>
            </div>
            <span class="mnemonic-tag-pill">UPSC Story Pun</span>
          `;
        }
        elements.cardMnemonicText.innerHTML = `<em>"${textClean}"</em>`;
      } else {
        if (headerEl) {
          headerEl.innerHTML = `
            <div class="mnemonic-header-left">
              <i class="fa-solid fa-lightbulb text-gold"></i>
              <strong>Memory Mnemonic</strong>
            </div>
          `;
        }
        elements.cardMnemonicText.textContent = country.mnemonic;
      }
    } else {
      elements.cardMnemonicBox.classList.add('hidden');
    }

    elements.cardNotesContent.textContent = country.notes || `Standard UPSC territorial outline for ${country.name}.`;

    elements.cardTagsContainer.innerHTML = '';
    (country.tags || []).forEach(tag => {
      const span = document.createElement('span');
      span.className = 'syllabus-tag';
      span.textContent = `# ${tag}`;
      elements.cardTagsContainer.appendChild(span);
    });

    elements.btnRetryCard.textContent = 'Retry Country';
    elements.btnNextUnanswered.textContent = 'Next Unanswered Country →';
  }

  function showPhysicalResultCard(fid, status) {
    const f = state.physicalData.features[fid];
    if (!f) return;
    const cat = CATEGORY_META[f.category] || CATEGORY_META.mountain;

    hideAllPanels();
    elements.panelResult.classList.remove('hidden');

    elements.resultBanner.className = 'result-banner';
    if (status === 'correct') {
      elements.resultBanner.classList.add('banner-correct');
      elements.resultIcon.innerHTML = '<i class="fa-solid fa-check"></i>';
      elements.resultHeadline.textContent = 'Correct!';
      elements.resultSubline.textContent = `${f.name} marked green on your physical map.`;
    } else if (status === 'wrong') {
      elements.resultBanner.classList.add('banner-wrong');
      elements.resultIcon.innerHTML = '<i class="fa-solid fa-xmark"></i>';
      elements.resultHeadline.textContent = 'Incorrect!';
      elements.resultSubline.textContent = `Correct feature: ${f.name} (${cat.name})`;
    } else {
      elements.resultBanner.classList.add('banner-study');
      elements.resultIcon.innerHTML = '<i class="fa-solid fa-book-open"></i>';
      elements.resultHeadline.textContent = `${cat.icon} UPSC Physical Flashcard`;
      elements.resultSubline.textContent = `${f.continent.toUpperCase()} • ${cat.name}`;
    }

    elements.cardCountryName.textContent = f.name;
    elements.cardCapital.textContent = `${cat.icon} ${cat.name} • ${f.countries || 'International Waters / Region'}`;

    if (f.mnemonic) {
      elements.cardMnemonicBox.classList.remove('hidden');
      elements.cardMnemonicText.textContent = f.mnemonic;
    } else {
      elements.cardMnemonicBox.classList.add('hidden');
    }

    elements.cardNotesContent.textContent = f.notes || `UPSC GS-I physical geography key feature.`;

    elements.cardTagsContainer.innerHTML = '';
    const tags = ['UPSC GS-I', 'Physical Map', cat.name, f.continent];
    tags.forEach(tag => {
      const span = document.createElement('span');
      span.className = 'syllabus-tag';
      span.textContent = `# ${tag}`;
      elements.cardTagsContainer.appendChild(span);
    });

    elements.btnRetryCard.textContent = 'Retry Feature';
    elements.btnNextUnanswered.textContent = 'Next Unanswered Feature →';
  }

  // --- "Find Country / Feature" Mode ---
  function pickNextFindTarget() {
    if (state.mapType === 'political') {
      pickNextFindCountryTarget();
    } else {
      pickNextFindPhysicalTarget();
    }
  }

  function pickNextFindCountryTarget() {
    const continentCountries = getActiveContinentCountryIds();
    const uncompleted = continentCountries.filter(cid => !state.progress[cid] || state.progress[cid].status !== 'correct');

    elements.findTargetTypeLabel.textContent = 'Locate this country on the map:';

    if (uncompleted.length === 0) {
      elements.findTargetName.innerHTML = 'Continent Mastered! <i class="fa-solid fa-trophy text-gold"></i>';
      elements.findTargetHint.textContent = 'All countries in this continent are completed.';
      state.targetCountryId = null;
      return;
    }

    const nextCid = uncompleted[Math.floor(Math.random() * uncompleted.length)];
    state.targetCountryId = nextCid;
    const meta = state.upscData.countries[nextCid];

    elements.findTargetName.textContent = meta.name;
    elements.findTargetHint.textContent = meta.capital ? `(Capital: ${meta.capital})` : '';
  }

  function pickNextFindPhysicalTarget() {
    const visibleFeats = getAllActivePhysicalFeatures();
    const uncompleted = visibleFeats.filter(f => !state.physicalProgress[f.id] || state.physicalProgress[f.id].status !== 'correct');

    if (uncompleted.length === 0) {
      elements.findTargetName.innerHTML = 'Category Mastered! <i class="fa-solid fa-trophy text-gold"></i>';
      elements.findTargetHint.textContent = 'All features in this category are completed.';
      state.targetPhysicalId = null;
      return;
    }

    const nextF = uncompleted[Math.floor(Math.random() * uncompleted.length)];
    state.targetPhysicalId = nextF.id;
    const cat = CATEGORY_META[nextF.category] || CATEGORY_META.mountain;

    elements.findTargetTypeLabel.textContent = `Locate this ${cat.name} on the map:`;
    elements.findTargetName.textContent = nextF.name;
    elements.findTargetHint.textContent = nextF.countries ? `(Location: ${nextF.countries})` : `(${cat.name})`;
  }

  function handleFindCountryClick(clickedCid) {
    if (!state.targetCountryId) return;

    const targetCid = state.targetCountryId;
    const isCorrect = clickedCid === targetCid;

    if (isCorrect) {
      state.progress[targetCid] = { status: 'correct', attempts: 1 };
      saveProgress();

      const path = d3.select(`#country-${targetCid}`);
      path.classed('animate-correct', true);
      setTimeout(() => path.classed('animate-correct', false), 600);
      updateCountryPathStyle(path, targetCid);
      updateStats();
      selectCountry(targetCid);

      setTimeout(() => {
        pickNextFindTarget();
      }, 1200);
    } else {
      state.progress[clickedCid] = { status: 'wrong', attempts: 1 };
      saveProgress();

      const wrongPath = d3.select(`#country-${clickedCid}`);
      wrongPath.classed('animate-wrong', true);
      setTimeout(() => wrongPath.classed('animate-wrong', false), 600);
      updateCountryPathStyle(wrongPath, clickedCid);

      const targetPath = d3.select(`#country-${targetCid}`);
      targetPath.classed('country-selected', true);
      setTimeout(() => {
        targetPath.classed('country-selected', false);
      }, 1800);

      updateStats();
      selectCountry(clickedCid);
    }
  }

  function handleFindPhysicalClick(clickedFid) {
    if (!state.targetPhysicalId) return;

    const targetFid = state.targetPhysicalId;
    const isCorrect = clickedFid === targetFid;
    const clickedF = state.physicalData.features[clickedFid];
    const targetF = state.physicalData.features[targetFid];

    if (isCorrect) {
      state.physicalProgress[targetFid] = { status: 'correct', attempts: 1 };
      saveProgress();

      if (targetF.category === 'desert') {
        const dPath = d3.select(`#desert-${targetFid}`);
        if (!dPath.empty()) updateDesertPathStyle(dPath, targetFid);
      } else if (targetF.category === 'mountain') {
        const mPath = d3.select(`#mountain-${targetFid}`);
        if (!mPath.empty()) updateMountainPathStyle(mPath, targetFid);
      } else if (targetF.category === 'lake') {
        const lPath = d3.select(`#lake-${targetFid}`);
        if (!lPath.empty()) updateLakePathStyle(lPath, targetFid);
      } else if (targetF.category === 'river') {
        const rPath = d3.select(`#river-${targetFid}`);
        if (!rPath.empty()) updateRiverPathStyle(rPath, targetFid);
      } else {
        const marker = d3.select(`#marker-${targetFid}`);
        updatePhysicalMarkerStyle(marker, targetF);
      }

      updateStats();
      selectPhysicalFeature(targetFid);

      setTimeout(() => {
        pickNextFindTarget();
      }, 1200);
    } else {
      state.physicalProgress[clickedFid] = { status: 'wrong', attempts: 1 };
      saveProgress();

      if (clickedF.category === 'desert') {
        const dPath = d3.select(`#desert-${clickedFid}`);
        if (!dPath.empty()) updateDesertPathStyle(dPath, clickedFid);
      } else if (clickedF.category === 'mountain') {
        const mPath = d3.select(`#mountain-${clickedFid}`);
        if (!mPath.empty()) updateMountainPathStyle(mPath, clickedFid);
      } else if (clickedF.category === 'lake') {
        const lPath = d3.select(`#lake-${clickedFid}`);
        if (!lPath.empty()) updateLakePathStyle(lPath, clickedFid);
      } else if (clickedF.category === 'river') {
        const rPath = d3.select(`#river-${clickedFid}`);
        if (!rPath.empty()) updateRiverPathStyle(rPath, clickedFid);
      } else {
        const wrongMarker = d3.select(`#marker-${clickedFid}`);
        updatePhysicalMarkerStyle(wrongMarker, clickedF);
      }

      // Briefly highlight target
      if (targetF.category === 'desert') {
        const targetPath = d3.select(`#desert-${targetFid}`);
        targetPath.classed('desert-selected', true);
        setTimeout(() => targetPath.classed('desert-selected', false), 1800);
      } else if (targetF.category === 'mountain') {
        const targetPath = d3.select(`#mountain-${targetFid}`);
        targetPath.classed('mountain-selected', true);
        setTimeout(() => targetPath.classed('mountain-selected', false), 1800);
      } else if (targetF.category === 'lake') {
        const targetPath = d3.select(`#lake-${targetFid}`);
        targetPath.classed('lake-selected', true);
        setTimeout(() => targetPath.classed('lake-selected', false), 1800);
      } else if (targetF.category === 'river') {
        const targetPath = d3.select(`#river-${targetFid}`);
        targetPath.classed('river-selected', true);
        setTimeout(() => targetPath.classed('river-selected', false), 1800);
      } else {
        const targetMarker = d3.select(`#marker-${targetFid}`);
        targetMarker.classed('marker-selected', true);
        setTimeout(() => targetMarker.classed('marker-selected', false), 1800);
      }

      updateStats();
      selectPhysicalFeature(clickedFid);
    }
  }

  // --- Helper: Get Country IDs in Current Continent ---
  function getActiveContinentCountryIds() {
    const list = [];
    state.worldFeatures.forEach(f => {
      const cid = String(f.id);
      if (isCountryInActiveContinent(f) && state.upscData.countries[cid]) {
        list.push(cid);
      }
    });
    return list;
  }

  // --- Next Unanswered Action ---
  function selectNextUnanswered() {
    if (state.mapType === 'political') {
      const continentCountries = getActiveContinentCountryIds();
      const unattempted = continentCountries.filter(cid => !state.progress[cid]);

      if (unattempted.length > 0) {
        const nextCid = unattempted[0];
        zoomToCountry(nextCid);
        selectCountry(nextCid);
      } else {
        alert('All countries in this continent have been attempted! Review your incorrect answers or reset the continent map.');
      }
    } else {
      const visible = getAllActivePhysicalFeatures();
      const unattempted = visible.filter(f => !state.physicalProgress[f.id]);

      if (unattempted.length > 0) {
        const nextF = unattempted[0];
        zoomToFeature(nextF.id, nextF.coords);
        selectPhysicalFeature(nextF.id);
      } else {
        alert('All features in this category have been attempted! Review your answers or reset the progress.');
      }
    }
  }

  // --- Canonical D3 Zoom Helpers (Always Perfectly Centered) ---
  function zoomToCountry(cid) {
    const feature = state.worldFeatures.find(f => String(f.id) === cid);
    if (!feature) return;

    const bounds = geoPath.bounds(feature);
    const x0 = bounds[0][0];
    const y0 = bounds[0][1];
    const x1 = bounds[1][0];
    const y1 = bounds[1][1];
    const dx = x1 - x0;
    const dy = y1 - y0;
    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;

    const scale = Math.max(1, Math.min(10, 0.75 / Math.max(dx / width, dy / height)));

    svg.transition()
      .duration(650)
      .call(
        zoomBehavior.transform,
        d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(scale)
          .translate(-cx, -cy)
      );
  }

  function zoomToFeature(fid, coords) {
    const shapeFeat = (state.landformsMap && state.landformsMap[fid]) || (state.waterwaysMap && state.waterwaysMap[fid]);
    if (shapeFeat && shapeFeat.geometry) {
      try {
        const bounds = geoPath.bounds(shapeFeat.geometry);
        const x0 = bounds[0][0];
        const y0 = bounds[0][1];
        const x1 = bounds[1][0];
        const y1 = bounds[1][1];
        const dx = x1 - x0;
        const dy = y1 - y0;
        if (dx > 0 && dy > 0) {
          const cx = (x0 + x1) / 2;
          const cy = (y0 + y1) / 2;
          const scale = Math.max(1.3, Math.min(6, 0.75 / Math.max(dx / width, dy / height)));

          svg.transition()
            .duration(650)
            .call(
              zoomBehavior.transform,
              d3.zoomIdentity
                .translate(width / 2, height / 2)
                .scale(scale)
                .translate(-cx, -cy)
            );
          return;
        }
      } catch (e) {
        console.warn('Could not zoom to shape bounds', e);
      }
    }

    zoomToCoords(coords);
  }

  function zoomToCoords(coords) {
    if (!coords) return;
    const pt = projection(coords);
    if (!pt || isNaN(pt[0]) || isNaN(pt[1])) return;

    const scale = 3.5;
    svg.transition()
      .duration(650)
      .call(
        zoomBehavior.transform,
        d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(scale)
          .translate(-pt[0], -pt[1])
      );
  }

  function resetZoom() {
    svg.transition()
      .duration(450)
      .call(zoomBehavior.transform, d3.zoomIdentity);
  }

  // --- Stats Bar ---
  function updateStats() {
    if (state.mapType === 'political') {
      const continentCountries = getActiveContinentCountryIds();
      const total = continentCountries.length;

      let correctCount = 0;
      let wrongCount = 0;

      continentCountries.forEach(cid => {
        const res = state.progress[cid];
        if (res) {
          if (res.status === 'correct') correctCount++;
          else if (res.status === 'wrong') wrongCount++;
        }
      });

      const attempted = correctCount + wrongCount;
      const pct = total > 0 ? Math.round((attempted / total) * 100) : 0;
      const accuracy = attempted > 0 ? Math.round((correctCount / attempted) * 100) : 0;

      elements.statProgress.textContent = `${attempted} / ${total}`;
      elements.statCorrect.textContent = correctCount;
      elements.statIncorrect.textContent = wrongCount;
      elements.statAccuracy.textContent = `${accuracy}%`;
      elements.progressFill.style.width = `${pct}%`;
    } else {
      const visible = getAllActivePhysicalFeatures();
      const total = visible.length;

      let correctCount = 0;
      let wrongCount = 0;

      visible.forEach(f => {
        const res = state.physicalProgress[f.id];
        if (res) {
          if (res.status === 'correct') correctCount++;
          else if (res.status === 'wrong') wrongCount++;
        }
      });

      const attempted = correctCount + wrongCount;
      const pct = total > 0 ? Math.round((attempted / total) * 100) : 0;
      const accuracy = attempted > 0 ? Math.round((correctCount / attempted) * 100) : 0;

      elements.statProgress.textContent = `${attempted} / ${total}`;
      elements.statCorrect.textContent = correctCount;
      elements.statIncorrect.textContent = wrongCount;
      elements.statAccuracy.textContent = `${accuracy}%`;
      elements.progressFill.style.width = `${pct}%`;
    }
  }

  // --- Mode Switching UI ---
  function updateUIForMode() {
    elements.modeBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === state.activeMode);
    });

    const isPhysical = state.mapType === 'physical';

    if (state.activeMode === 'click-name') {
      elements.findBanner.classList.add('hidden');
      elements.guidancePill.classList.remove('hidden');
      elements.guidanceText.innerHTML = isPhysical
        ? `Click any desert, mountain, river, or lake to name it. Correct turns <strong class="text-green">Green</strong>, incorrect turns <strong class="text-red">Red</strong>.`
        : `Click any country outline to name it. Correct turns <strong class="text-green">Green</strong>, incorrect turns <strong class="text-red">Red</strong>.`;
    } else if (state.activeMode === 'find-country') {
      elements.findBanner.classList.remove('hidden');
      elements.guidancePill.classList.add('hidden');
      pickNextFindTarget();
    } else if (state.activeMode === 'study') {
      elements.findBanner.classList.add('hidden');
      elements.guidancePill.classList.remove('hidden');
      elements.guidanceText.innerHTML = isPhysical
        ? `Study Mode active: Hover or click any physical feature to inspect its UPSC Prelims syllabus facts, origin, and mnemonics.`
        : `Study Mode active: Click any outline to inspect its UPSC syllabus facts and mnemonics.`;
    }

    if (physicalLayer) {
      physicalLayer.selectAll('.physical-marker').each(function (d) {
        updatePhysicalMarkerStyle(d3.select(this), d);
      });
    }
  }

  // --- Master Mnemonic Story: Mass Hero Secret Mission ---
  const MASS_HERO_STORY = [
    {
      id: "act-1",
      number: "Act 1",
      badge: "🌍 Act 1 • Africa",
      title: "The Africa Air Drop & The Gold Coast Escape",
      summary: "Plane drop with Mr. Rabbit → Horn of Africa HOP → Great Lakes & ChicKEN → 3 Zombies & Diamond Nib → Rangoli Contest & James Cameroon → Singing Elephant → GMail Magic Carpet",
      scenes: [
        {
          title: "1. Descent & Mr. Rabbit's Secret Code",
          text: "We are a Tamil movie mass hero on a secret mission to pursue villain <strong>'X'</strong>, who has nuclear codes! We start on a plane on top of Africa ready to descend. Before jumping, a rabbit gives us the hint <strong>MALE</strong> and plays a <strong>TUNE</strong>!",
          entities: [
            { id: "504", name: "Morocco", flag: "🇲🇦", pun: "M in MALE", type: "political" },
            { id: "012", name: "Algeria", flag: "🇩🇿", pun: "A in MALE", type: "political" },
            { id: "434", name: "Libya", flag: "🇱🇾", pun: "L in MALE", type: "political" },
            { id: "818", name: "Egypt", flag: "🇪🇬", pun: "E in MALE", type: "political" },
            { id: "788", name: "Tunisia", flag: "🇹🇳", pun: "Plays a TUNE", type: "political" }
          ]
        },
        {
          title: "2. Nile Shooting & Horn of Africa Edge",
          text: "At Egypt, we hear <strong>SHOOTing</strong> sounds! To escape, we take a ship on the road and <strong>sail south</strong>. From there, floating rocks appear where we <strong>HOP</strong> to reach the highest one. A Navi character stands there showing us the <strong>EDGE</strong>, but suddenly pushes us down!",
          entities: [
            { id: "729", name: "Sudan", flag: "🇸🇩", pun: "SHOOTing sounds", type: "political" },
            { id: "728", name: "South Sudan", flag: "🇸🇸", pun: "Sail South", type: "political" },
            { id: "231", name: "Ethiopia", flag: "🇪🇹", pun: "HOP on floating rocks", type: "political" },
            { id: "232", name: "Eritrea", flag: "🇪🇷", pun: "ED in EDGE", type: "political" },
            { id: "262", name: "Djibouti", flag: "🇩🇯", pun: "GE in EDGE", type: "political" }
          ]
        },
        {
          title: "3. Giant ChicKEN, BRU Coffee & Dancing with Victoria",
          text: "We fall and are saved by an old man who shouts <strong>'Somal'</strong> (go milk!). But instead of a cow, there is a giant <strong>ChicKEN</strong>! Beside it sits a massive cup of <strong>BRU</strong> coffee. After drinking, we meet Victoria, who <strong>Dances</strong> with us!",
          entities: [
            { id: "706", name: "Somalia", flag: "🇸🇴", pun: "Somal (go milk)", type: "political" },
            { id: "404", name: "Kenya", flag: "🇰🇪", pun: "Giant ChicKEN", type: "political" },
            { id: "108", name: "Burundi", flag: "🇧🇮", pun: "B in BRU Coffee", type: "political" },
            { id: "646", name: "Rwanda", flag: "🇷🇼", pun: "R in BRU Coffee", type: "political" },
            { id: "800", name: "Uganda", flag: "🇺🇬", pun: "U in BRU Coffee", type: "political" },
            { id: "africa-lake-victoria", name: "Lake Victoria", flag: "🌊", pun: "Victoria", type: "physical" },
            { id: "834", name: "Tanzania", flag: "🇹🇿", pun: "Dances (Tan-zania)", type: "political" }
          ]
        },
        {
          title: "4. The Mall, 3 Zombies & The Diamond Nib",
          text: "Then we go to a <strong>mall</strong>, where we suddenly spot <strong>3 zombies</strong>! To escape them, we take a boat in sands and sail south again (<strong>SL</strong>). In the desert sands, we see a statue of a pen's <strong>nib</strong> which cries diamonds!",
          entities: [
            { id: "454", name: "Malawi", flag: "🇲🇼", pun: "The Mall", type: "political" },
            { id: "894", name: "Zambia", flag: "🇿🇲", pun: "Zombie 1", type: "political" },
            { id: "716", name: "Zimbabwe", flag: "🇿🇼", pun: "Zombie 2", type: "political" },
            { id: "508", name: "Mozambique", flag: "🇲🇿", pun: "Zombie 3", type: "political" },
            { id: "072", name: "Botswana", flag: "🇧🇼", pun: "Boat in sands", type: "political" },
            { id: "710", name: "South Africa", flag: "🇿🇦", pun: "Sail south again", type: "political" },
            { id: "748", name: "Eswatini", flag: "🇸🇿", pun: "S in SL", type: "political" },
            { id: "426", name: "Lesotho", flag: "🇱🇸", pun: "L in SL", type: "political" },
            { id: "516", name: "Namibia", flag: "🇳🇦", pun: "Pen's Nib crying diamonds", type: "political" }
          ]
        },
        {
          title: "5. The Rangoli Contest & James Cameroon",
          text: "We learn of a <strong>rangoli</strong> competition with 3 sections: a <strong>gap (margin)</strong>, a <strong>King Kong</strong>, and a <strong>King Kong in a doctor's suit with stethoscope</strong>! But we don't win. When protested, the judge pulls a <strong>GUN</strong>! The winner turns out to be <strong>James Cameroon</strong>, about to hop into his <strong>CAR</strong> looking <strong>sad</strong>.",
          entities: [
            { id: "024", name: "Angola", flag: "🇦🇴", pun: "Rangoli contest", type: "political" },
            { id: "266", name: "Gabon", flag: "🇬🇦", pun: "Gap (margin)", type: "political" },
            { id: "178", name: "Republic of the Congo", flag: "🇨🇬", pun: "King Kong", type: "political" },
            { id: "180", name: "Democratic Republic of the Congo", flag: "🇨🇩", pun: "Doctor King Kong", type: "political" },
            { id: "226", name: "Equatorial Guinea", flag: "🇬🇶", pun: "Judge shows a GUN", type: "political" },
            { id: "120", name: "Cameroon", flag: "🇨🇲", pun: "James Cameroon", type: "political" },
            { id: "140", name: "Central African Republic", flag: "🇨🇫", pun: "Cameroon's CAR", type: "political" },
            { id: "148", name: "Chad", flag: "🇹🇩", pun: "Cameroon is Sad", type: "political" }
          ]
        },
        {
          title: "6. Ginger Ice Cream, Ben 10 & The Singing Elephant",
          text: "We buy Cameroon <strong>ginger ice cream</strong> in a <strong>cafeteria</strong>. He tells us he was scammed by a <strong>Ben 10</strong> watch, jailed, and forced to <strong>GO TO</strong> a stage and <strong>sing ghana</strong> by a <strong>barking elephant</strong>! We fight and <strong>liberate</strong> him. He shares directions about X and leaves; we are <strong>so alone</strong>.",
          entities: [
            { id: "562", name: "Niger", flag: "🇳🇪", pun: "Ginger ice cream", type: "political" },
            { id: "566", name: "Nigeria", flag: "🇳🇬", pun: "Cafeteria", type: "political" },
            { id: "204", name: "Benin", flag: "🇧🇯", pun: "Ben 10 scam", type: "political" },
            { id: "768", name: "Togo", flag: "🇹🇬", pun: "GO TO stage", type: "political" },
            { id: "288", name: "Ghana", flag: "🇬🇭", pun: "Sing ghana", type: "political" },
            { id: "384", name: "Côte d'Ivoire", flag: "🇨🇮", pun: "Elephant", type: "political" },
            { id: "854", name: "Burkina Faso", flag: "🇧🇫", pun: "Barking elephant", type: "political" },
            { id: "430", name: "Liberia", flag: "🇱🇷", pun: "Liberate Cameroon", type: "political" },
            { id: "694", name: "Sierra Leone", flag: "🇸🇱", pun: "So Alone", type: "political" }
          ]
        },
        {
          title: "7. The Gambler, GMail Carpet & Spiked Saw",
          text: "Left alone, we see a <strong>gal busy gambling</strong>. We hop onto a <strong>GMail</strong> themed carpet. In the scorching sun our skin turns <strong>tan</strong>. The carpet crash-lands on a <strong>saw</strong> with spikes, so we make a hasty sea escape in a boat!",
          entities: [
            { id: "686", name: "Senegal", flag: "🇸🇳", pun: "Gal", type: "political" },
            { id: "270", name: "The Gambia", flag: "🇬🇲", pun: "Gambling", type: "political" },
            { id: "624", name: "Guinea-Bissau", flag: "🇬🇼", pun: "Busy gambling", type: "political" },
            { id: "324", name: "Guinea", flag: "🇬🇳", pun: "G in GMail carpet", type: "political" },
            { id: "466", name: "Mali", flag: "🇲🇱", pun: "Mail in GMail carpet", type: "political" },
            { id: "478", name: "Mauritania", flag: "🇲🇷", pun: "Skin turns Tan", type: "political" },
            { id: "732", name: "Western Sahara", flag: "🇪🇭", pun: "Saw with spikes", type: "political" }
          ]
        }
      ]
    },
    {
      id: "act-2",
      number: "Act 2",
      badge: "🏰 Act 2 • Europe",
      title: "The European Pursuit & The Nordic Trail",
      summary: "Iberian Port & Sprained Leg → Net, Germs & Lux Soap → Ostrich Checkmate → Crow Boss Balkan Van → Greek Bull & Magical Dove → Baltic LLEF & Nordic King's Ire",
      scenes: [
        {
          title: "1. Port Landing & Sprained Leg",
          text: "Our boat lands safely at a <strong>port</strong>. But leaping out, hero sprains his <strong>leg</strong>! To add to the misery, a tree <strong>branch</strong> snaps and crashes directly onto the leg!",
          entities: [
            { id: "620", name: "Portugal", flag: "🇵🇹", pun: "Lands on a Port", type: "political" },
            { id: "724", name: "Spain", flag: "🇪🇸", pun: "Sprain Leg", type: "political" },
            { id: "250", name: "France", flag: "🇫🇷", pun: "Branch falls on leg", type: "political" }
          ]
        },
        {
          title: "2. The Net, Germs Infection & Lux Soap",
          text: "A nearby fisherman ties a fishing <strong>net</strong> around the wound, causing a <strong>germs</strong> infection! The leg starts to <strong>bulge</strong>. We buy <strong>Lux soap</strong> to wash it, and eat delicious <strong>sweets</strong> to soothe our fatigue.",
          entities: [
            { id: "528", name: "Netherlands", flag: "🇳🇱", pun: "Fisherman's Net", type: "political" },
            { id: "276", name: "Germany", flag: "🇩🇪", pun: "Germs infection", type: "political" },
            { id: "056", name: "Belgium", flag: "🇧🇪", pun: "Leg Bulges", type: "political" },
            { id: "442", name: "Luxembourg", flag: "🇱🇺", pun: "Lux soap", type: "political" },
            { id: "756", name: "Switzerland", flag: "🇨🇭", pun: "Eat Sweets", type: "political" }
          ]
        },
        {
          title: "3. The Idly Shop & The Ostrich Checkmate",
          text: "We head to an <strong>idly shop</strong> for a proper meal. Suddenly, an <strong>ostrich</strong> swoops down and steals our idly! Giving chase, we hear the eerie whisper <strong>'checkmate'</strong>!",
          entities: [
            { id: "380", name: "Italy", flag: "🇮🇹", pun: "Idly Shop", type: "political" },
            { id: "040", name: "Austria", flag: "🇦🇹", pun: "Ostrich steals idly", type: "political" },
            { id: "203", name: "Czechia", flag: "🇨🇿", pun: "Checkmate", type: "political" }
          ]
        },
        {
          title: "4. The Crow Boss Food Van & Balkan Feast",
          text: "Starving, we spot a <strong>slow moving van</strong> full of hot food owned by a notorious <strong>crow boss</strong>. He promises us food if we help: we <strong>serve</strong> <strong>10 eggs</strong> in a row! Pleased, he gives us a <strong>bun</strong> when we are <strong>hungry</strong>, and reveals intel that villain X is in a <strong>maze</strong>!",
          entities: [
            { id: "703", name: "Slovakia", flag: "🇸🇰", pun: "Slow moving van", type: "political" },
            { id: "705", name: "Slovenia", flag: "🇸🇮", pun: "Slow van", type: "political" },
            { id: "191", name: "Croatia", flag: "🇭🇷", pun: "Crow Boss", type: "political" },
            { id: "070", name: "Bosnia and Herz.", flag: "🇧🇦", pun: "Crow Boss", type: "political" },
            { id: "688", name: "Serbia", flag: "🇷🇸", pun: "Server of food", type: "political" },
            { id: "499", name: "Montenegro", flag: "🇲🇪", pun: "10 eggs in a row", type: "political" },
            { id: "008", name: "Albania", flag: "🇦🇱", pun: "Eat a Bun", type: "political" },
            { id: "348", name: "Hungary", flag: "🇭🇺", pun: "Hungry", type: "political" },
            { id: "807", name: "North Macedonia", flag: "🇲🇰", pun: "Villain in a Maze", type: "political" }
          ]
        },
        {
          title: "5. Grease, Strong Bull & The Magical Dove",
          text: "Distrusting the crow boss, we flee, slip on <strong>grease</strong>, and slam into a strong <strong>bull</strong>! The bull asks why we are <strong>roaming</strong>. Hearing our plight, he tells us to follow a <strong>magical dove</strong>, cross where it <strong>rains all the time</strong>, leap through the land of <strong>poles</strong>, and swing on a <strong>bell</strong>!",
          entities: [
            { id: "300", name: "Greece", flag: "🇬🇷", pun: "Slip on Grease", type: "political" },
            { id: "100", name: "Bulgaria", flag: "🇧🇬", pun: "Strong Bull", type: "political" },
            { id: "642", name: "Romania", flag: "🇷🇴", pun: "Why Roaming?", type: "political" },
            { id: "498", name: "Moldova", flag: "🇲🇩", pun: "Magical Dove", type: "political" },
            { id: "804", name: "Ukraine", flag: "🇺🇦", pun: "Rains all the time", type: "political" },
            { id: "616", name: "Poland", flag: "🇵🇱", pun: "Land of Poles", type: "political" },
            { id: "112", name: "Belarus", flag: "🇧🇾", pun: "Swing on a Bell", type: "political" }
          ]
        },
        {
          title: "6. Landing on LLEF & The Den of Kings",
          text: "We swing from the bell and land on <strong>LLEF</strong> in front of a <strong>den</strong>! We <strong>find way</strong> and exit the den. Captain Hogan suggests we ask the King. But in the court, we draw the King's <strong>ire</strong>! He locks us in the <strong>land of ice</strong>. Mass hero breaks jail and lands to <strong>touch grass</strong>!",
          entities: [
            { id: "440", name: "Lithuania", flag: "🇱🇹", pun: "L in LLEF", type: "political" },
            { id: "428", name: "Latvia", flag: "🇱🇻", pun: "L in LLEF", type: "political" },
            { id: "233", name: "Estonia", flag: "🇪🇪", pun: "E in LLEF", type: "political" },
            { id: "246", name: "Finland", flag: "🇫🇮", pun: "F in LLEF", type: "political" },
            { id: "208", name: "Denmark", flag: "🇩🇰", pun: "Den / Captain Hogan", type: "political" },
            { id: "578", name: "Norway", flag: "🇳🇴", pun: "Find way", type: "political" },
            { id: "752", name: "Sweden", flag: "🇸🇪", pun: "Exit the den", type: "political" },
            { id: "826", name: "United Kingdom", flag: "🇬🇧", pun: "Ask the King", type: "political" },
            { id: "372", name: "Ireland", flag: "🇮🇪", pun: "King's Ire", type: "political" },
            { id: "352", name: "Iceland", flag: "🇮🇸", pun: "Land of Ice", type: "political" },
            { id: "304", name: "Greenland", flag: "🇬🇱", pun: "Touch Grass", type: "political" }
          ]
        }
      ]
    },
    {
      id: "act-3",
      number: "Act 3",
      badge: "🌎 Act 3 • Americas",
      title: "The Americas Crossing",
      summary: "Queen's Rebuff → Goat Halwa & Honda Car → Caribbean PUB HD CJ → Columbus Ghost & Zoo → Olivia's Paragon Slippers → Pacific Ocean Dive",
      scenes: [
        {
          title: "1. CAN you help US? & Bhel Puri Diner",
          text: "We approach the Queen across the ocean: she questions <strong>'CAN you help US?'</strong> But guards kick us out the door and we are totally <strong>Vexed</strong>! We stop at a diner, order <strong>Bhel Puri</strong>, and spot a <strong>goat</strong> across the table ordering <strong>Halwa</strong>!",
          entities: [
            { id: "124", name: "Canada", flag: "🇨🇦", pun: "CAN you help", type: "political" },
            { id: "840", name: "United States of America", flag: "🇺🇸", pun: "Help US", type: "political" },
            { id: "484", name: "Mexico", flag: "🇲🇽", pun: "Vexed", type: "political" },
            { id: "084", name: "Belize", flag: "🇧🇿", pun: "Bhel Puri", type: "political" },
            { id: "320", name: "Guatemala", flag: "🇬🇹", pun: "Goat across table", type: "political" },
            { id: "222", name: "El Salvador", flag: "🇸🇻", pun: "Orders Halwa", type: "political" }
          ]
        },
        {
          title: "2. The Honda Car, Pan Bridge & Caribbean PUB",
          text: "The goat agrees to help and gives us keys to a <strong>Honda Car</strong>. We race it to the <strong>coast</strong> and cross a giant <strong>pan shaped bridge</strong>. Up above, there's a <strong>PUB</strong> with an <strong>HD</strong> TV that <strong>C</strong> and <strong>J</strong> are watching!",
          entities: [
            { id: "340", name: "Honduras", flag: "🇭🇳", pun: "Honda Car", type: "political" },
            { id: "558", name: "Nicaragua", flag: "🇳🇮", pun: "Honda CAR", type: "political" },
            { id: "188", name: "Costa Rica", flag: "🇨🇷", pun: "Ride to Coast", type: "political" },
            { id: "591", name: "Panama", flag: "🇵🇦", pun: "Pan shaped bridge", type: "political" },
            { id: "630", name: "Puerto Rico", flag: "🇵🇷", pun: "P in PUB", type: "political" },
            { id: "044", name: "Bahamas", flag: "🇧🇸", pun: "B in PUB", type: "political" },
            { id: "332", name: "Haiti", flag: "🇭🇹", pun: "H in HD", type: "political" },
            { id: "214", name: "Dominican Rep.", flag: "🇩🇴", pun: "D in HD", type: "political" },
            { id: "192", name: "Cuba", flag: "🇨🇺", pun: "C watching TV", type: "political" },
            { id: "388", name: "Jamaica", flag: "🇯🇲", pun: "J watching TV", type: "political" }
          ]
        },
        {
          title: "3. Ghost of Columbus, Surfer & Starry Bridge",
          text: "Crossing over, we meet the ghost of <strong>Christopher Columbus</strong>, pass through a wild <strong>zoo</strong>, and cheer a guy <strong>surfing</strong> on ocean waves. Ahead glows a majestic <strong>bright bridge with stars</strong>!",
          entities: [
            { id: "170", name: "Colombia", flag: "🇨🇴", pun: "Ghost of Columbus", type: "political" },
            { id: "862", name: "Venezuela", flag: "🇻🇪", pun: "Past a Zoo", type: "political" },
            { id: "328", name: "Guyana", flag: "🇬🇾", pun: "A Guy", type: "political" },
            { id: "740", name: "Suriname", flag: "🇸🇷", pun: "Surfing", type: "political" },
            { id: "076", name: "Brazil", flag: "🇧🇷", pun: "Bright bridge with stars", type: "political" }
          ]
        },
        {
          title: "4. Olivia's Paragon Slippers, Chilli & Pacific Escape",
          text: "We spot <strong>Olivia</strong> on the sidewalk and wink. Offended, she whacks hero with <strong>paragon slippers</strong>! Our shirt becomes <strong>rugged</strong>. We try to <strong>urgently go</strong>, but she drags us to market to buy <strong>Chilli and Pepper</strong>! Hero spots an <strong>escape door</strong> and dives straight into the Pacific Ocean!",
          entities: [
            { id: "068", name: "Bolivia", flag: "🇧🇴", pun: "Olivia on sidewalk", type: "political" },
            { id: "600", name: "Paraguay", flag: "🇵🇾", pun: "Paragon slippers", type: "political" },
            { id: "858", name: "Uruguay", flag: "🇺🇾", pun: "Shirt is Rugged", type: "political" },
            { id: "032", name: "Argentina", flag: "🇦🇷", pun: "Urgently go", type: "political" },
            { id: "152", name: "Chile", flag: "🇨🇱", pun: "Buy Chilli", type: "political" },
            { id: "604", name: "Peru", flag: "🇵🇪", pun: "Buy Pepper", type: "political" },
            { id: "218", name: "Ecuador", flag: "🇪🇨", pun: "Escape door", type: "political" }
          ]
        }
      ]
    },
    {
      id: "act-4",
      number: "Act 4",
      badge: "☢️ Act 4 • West & Central Asia",
      title: "Villain X's Flight Across West & Central Asia",
      summary: "Maze Biryani & Cardboard Train → Lord Yaman Chase & Tar → Rocky Bhai Showdown → Rush to Russia → Underground Core & Goli Monkey TUK KiT",
      scenes: [
        {
          title: "1. The Maze Biryani, Naan & Cardboard Train",
          text: "Scene cuts to villain X fleeing in the <strong>Maze</strong>! He orders <strong>Turkey biriyani</strong>, <strong>Cereal</strong>, and <strong>Naan</strong>. Frantic, he asks <strong>'is a rail?'</strong> He is told yes, but it turns out to be a fake <strong>cardboard train</strong>! Instead he grabs keys to an <strong>Audi car</strong>.",
          entities: [
            { id: "807", name: "North Macedonia", flag: "🇲🇰", pun: "X in Maze", type: "political" },
            { id: "792", name: "Türkiye", flag: "🇹🇷", pun: "Turkey Biriyani", type: "political" },
            { id: "760", name: "Syria", flag: "🇸🇾", pun: "Cereal", type: "political" },
            { id: "422", name: "Lebanon", flag: "🇱🇧", pun: "Naan", type: "political" },
            { id: "376", name: "Israel", flag: "🇮🇱", pun: "Is a rail?", type: "political" },
            { id: "400", name: "Jordan", flag: "🇯🇴", pun: "Cardboard train", type: "political" },
            { id: "682", name: "Saudi Arabia", flag: "🇸🇦", pun: "Audi car", type: "political" }
          ]
        },
        {
          title: "2. Lord Yaman Chase, Ignite Turbo & Beetroot Rain",
          text: "Lord <strong>Yaman</strong> pursues him, making X screech <strong>'oh man!'</strong> X slams the vehicle's nitro <strong>ignite button</strong>! Rocket backfire covers his face in <strong>tar</strong>, followed by pouring <strong>beetroot rain</strong>. He parks and <strong>waits</strong> for backup.",
          entities: [
            { id: "887", name: "Yemen", flag: "🇾🇪", pun: "Lord Yaman", type: "political" },
            { id: "512", name: "Oman", flag: "🇴🇲", pun: "Oh Man!", type: "political" },
            { id: "784", name: "United Arab Emirates", flag: "🇦🇪", pun: "Ignite button", type: "political" },
            { id: "634", name: "Qatar", flag: "🇶🇦", pun: "Tar hits face", type: "political" },
            { id: "048", name: "Bahrain", flag: "🇧🇭", pun: "Beetroot rain", type: "political" },
            { id: "414", name: "Kuwait", flag: "🇰🇼", pun: "Waits for friend", type: "political" }
          ]
        },
        {
          title: "3. Rocky Bhai Showdown & Russian Dash",
          text: "Instead of his friend, <strong>Rocky Bhai</strong> of KGF steps into view! Terrified, <strong>X ran</strong>! He scavenges <strong>arms</strong>, meets treacherous friend <strong>George</strong>, waves <strong>Bye Bye</strong> to Rocky Bhai, and they <strong>rush to Russia</strong>!",
          entities: [
            { id: "368", name: "Iraq", flag: "🇮🇶", pun: "Rocky Bhai", type: "political" },
            { id: "364", name: "Iran", flag: "🇮🇷", pun: "X Ran", type: "political" },
            { id: "051", name: "Armenia", flag: "🇦🇲", pun: "Finds Arms", type: "political" },
            { id: "268", name: "Georgia", flag: "🇬🇪", pun: "Friend George", type: "political" },
            { id: "031", name: "Azerbaijan", flag: "🇦🇿", pun: "Wave Bye Bye", type: "political" },
            { id: "643", name: "Russia", flag: "🇷🇺", pun: "Rush to Russia", type: "political" }
          ]
        },
        {
          title: "4. Underground Core, Chin Hurt & Goli Monkey TUK KiT",
          text: "They <strong>jump</strong> into the underground <strong>core</strong> bunker, hurting X's <strong>chin</strong>. A monkey playing <strong>goli</strong> snatches the nuclear codes! To distract it, X plays viral <strong>TUK KiT</strong> videos! Codes secured, they take a cab shouting to <strong>'off the ghana'</strong>!",
          entities: [
            { id: "392", name: "Japan", flag: "🇯🇵", pun: "Jump", type: "political" },
            { id: "408", name: "North Korea", flag: "🇰🇵", pun: "Core bunker", type: "political" },
            { id: "410", name: "South Korea", flag: "🇰🇷", pun: "Core bunker", type: "political" },
            { id: "156", name: "China", flag: "🇨🇳", pun: "Chin hurt", type: "political" },
            { id: "496", name: "Mongolia", flag: "🇲🇳", pun: "Monkey playing Goli", type: "political" },
            { id: "795", name: "Turkmenistan", flag: "🇹🇲", pun: "T in TUK KiT", type: "political" },
            { id: "860", name: "Uzbekistan", flag: "🇺🇿", pun: "U in TUK KiT", type: "political" },
            { id: "398", name: "Kazakhstan", flag: "🇰🇿", pun: "K in TUK KiT", type: "political" },
            { id: "417", name: "Kyrgyzstan", flag: "🇰🇬", pun: "K in TUK KiT", type: "political" },
            { id: "762", name: "Tajikistan", flag: "🇹🇯", pun: "T in TUK KiT", type: "political" },
            { id: "004", name: "Afghanistan", flag: "🇦🇫", pun: "Off the Ghana", type: "political" }
          ]
        }
      ]
    },
    {
      id: "act-5",
      number: "Act 5",
      badge: "🌴 Act 5 • South & SE Asia",
      title: "South & Southeast Asia Sting",
      summary: "Park Cab & Bulb Bang → Betrayal M.T & Lost → Camping & Philip Contest → Bru Coffee & Singam Lays → Kangaroo Ride",
      scenes: [
        {
          title: "1. Parking Cab, Street Bulb Bang & Empty Car",
          text: "They <strong>park the cab</strong> and take a <strong>nap</strong> under an overhead <strong>bulb</strong>. The bulb falls and detonates with a loud <strong>BANG</strong>! Waking up, X realizes the car is completely empty (<strong>M.T</strong>)—George has betrayed him and fled!",
          entities: [
            { id: "586", name: "Pakistan", flag: "🇵🇰", pun: "Park the cab", type: "political" },
            { id: "524", name: "Nepal", flag: "🇳🇵", pun: "Nap", type: "political" },
            { id: "064", name: "Bhutan", flag: "🇧🇹", pun: "Under a bulb", type: "political" },
            { id: "050", name: "Bangladesh", flag: "🇧🇩", pun: "Loud BANG", type: "political" },
            { id: "104", name: "Myanmar", flag: "🇲🇲", pun: "M in M.T (empty)", type: "political" },
            { id: "764", name: "Thailand", flag: "🇹🇭", pun: "T in M.T (empty)", type: "political" }
          ]
        },
        {
          title: "2. Lost, Camping & The Name Changing Contest",
          text: "Stranded without wheels, X is utterly <strong>lost</strong>. He resorts to <strong>camping</strong> in the deep woods. Hearing loudspeakers for a <strong>name changing competition</strong>, he changes his identity to <strong>Philip</strong> and wins!",
          entities: [
            { id: "418", name: "Laos", flag: "🇱🇦", pun: "X is Lost", type: "political" },
            { id: "116", name: "Cambodia", flag: "🇰🇭", pun: "X is Camping", type: "political" },
            { id: "704", name: "Vietnam", flag: "🇻🇳", pun: "Name changing contest", type: "political" },
            { id: "608", name: "Philippines", flag: "🇵🇭", pun: "Renames Philip", type: "political" }
          ]
        },
        {
          title: "3. Bru Coffee, Singam Lays & Kangaroo Flight",
          text: "As contest prize, X gets <strong>Bru coffee</strong> and <strong>Singam</strong> shaped <strong>Lays</strong> chips! Annoyed by the reward, he yells <strong>'I am done'</strong>! But officials placate him with the grand prize: a free <strong>Kangaroo ride</strong> to Australia!",
          entities: [
            { id: "096", name: "Brunei", flag: "🇧🇳", pun: "Bru Coffee", type: "political" },
            { id: "702", name: "Singapore", flag: "🇸🇬", pun: "Singam", type: "political" },
            { id: "458", name: "Malaysia", flag: "🇲🇾", pun: "Lays chips", type: "political" },
            { id: "360", name: "Indonesia", flag: "🇮🇩", pun: "I am Done", type: "political" },
            { id: "036", name: "Australia", flag: "🇦🇺", pun: "Kangaroo Ride", type: "political" }
          ]
        }
      ]
    },
    {
      id: "act-6",
      number: "Act 6",
      badge: "🌊 Act 6 • Pacific Climax",
      title: "Australia, New Zealand & Pacific Climax",
      summary: "Busted Down Under → Victoria Love & NZ Honeymoon → Sealed PoST with Figs from Mr. Rabbit!",
      scenes: [
        {
          title: "1. The Australia Bust, Victoria Love & NZ Honeymoon",
          text: "While X makes a deal with a rogue scientist in <strong>Australia</strong>, mass hero swims across the Pacific and busts him! Victoria from Africa, having fallen for hero, follows him all the way to Australia. Reunited, they take off to <strong>NZ</strong> for their honeymoon!",
          entities: [
            { id: "036", name: "Australia", flag: "🇦🇺", pun: "Busted in Australia", type: "political" },
            { id: "africa-lake-victoria", name: "Lake Victoria", flag: "🌊", pun: "Victoria in love", type: "physical" },
            { id: "554", name: "New Zealand", flag: "🇳🇿", pun: "NZ honeymoon", type: "political" }
          ]
        },
        {
          title: "2. The Mystery PoST & Mr. Rabbit's Figs",
          text: "At their honeymoon suite, hero receives a sealed <strong>PoST</strong> delivery packed with fresh <strong>figs</strong>! Reading the note, hero realizes it was sent by <strong>Mr. Rabbit</strong> from the beginning, and gives a mass-hero victory smile!",
          entities: [
            { id: "598", name: "Papua New Guinea", flag: "🇵🇬", pun: "P in PoST", type: "political" },
            { id: "090", name: "Solomon Is.", flag: "🇸🇧", pun: "S in PoST", type: "political" },
            { id: "242", name: "Fiji", flag: "🇫🇯", pun: "Figs in package", type: "political" }
          ]
        }
      ]
    }
  ];

  // Jump from any mnemonic chip directly to continent, coordinates & flashcard
  function jumpToMnemonicEntity(id, type) {
    if (elements.mnemonicsDialog) {
      elements.mnemonicsDialog.close();
    }

    if (type === 'physical') {
      setMapType('physical');
      const f = state.physicalData && state.physicalData.features[id];
      if (f) {
        if (state.activeContinent !== f.continent && state.activeContinent !== 'world') {
          switchContinent(f.continent);
        }
        setTimeout(() => {
          zoomToFeature(f.id, f.coords);
          selectPhysicalFeature(f.id);
        }, 350);
      }
    } else {
      setMapType('political');
      const cMeta = state.upscData.countries[id];
      if (cMeta) {
        let targetCont = 'world';
        if (cMeta.continent === 'Africa') targetCont = 'africa';
        else if (cMeta.continent === 'West Asia') targetCont = 'west-asia';
        else if (cMeta.continent === 'Europe') targetCont = 'europe';
        else if (cMeta.continent === 'East & Central Asia') targetCont = 'east-central-asia';
        else if (cMeta.continent === 'South & Southeast Asia') targetCont = 'south-se-asia';
        else if (cMeta.continent === 'South America') targetCont = 'south-america';
        else if (cMeta.continent === 'North America') targetCont = 'north-america';

        if (state.activeContinent !== targetCont && state.activeContinent !== 'world') {
          switchContinent(targetCont);
        }

        setTimeout(() => {
          zoomToCountry(id);
          selectCountry(id);
        }, 350);
      }
    }
  }

  // --- Mnemonics Deck & Story Mode Rendering ---
  function renderMnemonicsDeck() {
    renderStoryMode();
    renderAcronymDeck();
  }

  function renderStoryMode() {
    if (!elements.storyActNav || !elements.storyActsContainer) return;

    let totalEntities = 0;
    const actCounts = {};
    MASS_HERO_STORY.forEach(act => {
      let count = 0;
      act.scenes.forEach(sc => { count += (sc.entities || []).length; });
      actCounts[act.id] = count;
      totalEntities += count;
    });

    // Render Act Filter Bar
    elements.storyActNav.innerHTML = '';
    const allBtn = document.createElement('button');
    allBtn.type = 'button';
    allBtn.className = 'act-nav-pill active';
    allBtn.dataset.act = 'all';
    allBtn.innerHTML = `<span>All Acts (${totalEntities})</span>`;
    allBtn.addEventListener('click', () => filterStoryAct('all'));
    elements.storyActNav.appendChild(allBtn);

    MASS_HERO_STORY.forEach(act => {
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = 'act-nav-pill';
      pill.dataset.act = act.id;
      pill.innerHTML = `<span>${act.number} (${actCounts[act.id]})</span>`;
      pill.addEventListener('click', () => filterStoryAct(act.id));
      elements.storyActNav.appendChild(pill);
    });

    // Render Act Cards
    elements.storyActsContainer.innerHTML = '';
    MASS_HERO_STORY.forEach(act => {
      const actCard = document.createElement('div');
      actCard.className = 'story-act-card';
      actCard.dataset.actId = act.id;

      let scenesHtml = '';
      act.scenes.forEach(scene => {
        let chipsHtml = '';
        (scene.entities || []).forEach(ent => {
          chipsHtml += `
            <button type="button" class="story-chip-btn" data-id="${ent.id}" data-type="${ent.type || 'political'}" title="Jump & zoom to ${ent.name}">
              <span>${ent.flag || '📍'}</span>
              <span class="chip-name">${ent.name}</span>
              <span class="chip-pun">${ent.pun}</span>
            </button>
          `;
        });

        scenesHtml += `
          <div class="story-scene-block">
            <div class="story-scene-headline">
              <i class="fa-solid fa-play"></i>
              <span>${scene.title}</span>
            </div>
            <p class="story-narrative-p">${scene.text}</p>
            <div class="story-chips-tray">
              ${chipsHtml}
            </div>
          </div>
        `;
      });

      actCard.innerHTML = `
        <div class="story-act-header">
          <div class="story-act-title-wrap">
            <span class="story-act-badge">${act.badge}</span>
            <h3 class="story-act-title">${act.title}</h3>
          </div>
          <span class="story-act-count">${actCounts[act.id]} Geo-Entities</span>
        </div>
        <p style="font-size:0.82rem; color:var(--text-dim); margin:0;">${act.summary}</p>
        <div class="story-scene-list">
          ${scenesHtml}
        </div>
      `;

      elements.storyActsContainer.appendChild(actCard);
    });

    // Attach click events to all story chips
    elements.storyActsContainer.querySelectorAll('.story-chip-btn[data-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        jumpToMnemonicEntity(btn.dataset.id, btn.dataset.type);
      });
    });
  }

  function filterStoryAct(actId) {
    if (!elements.storyActNav || !elements.storyActsContainer) return;

    elements.storyActNav.querySelectorAll('.act-nav-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.act === actId);
    });

    elements.storyActsContainer.querySelectorAll('.story-act-card').forEach(card => {
      if (actId === 'all' || card.dataset.actId === actId) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  }

  function renderAcronymDeck() {
    const politicalMnemonics = (state.upscData && state.upscData.mnemonics) || [];
    
    const physicalMnemonics = [
      {
        title: "North America: Great Lakes (West to East)",
        mnemonic: "SMHEO (Super Man Helps Everyone Ontario) / HOMES",
        notes: "Superior (largest freshwater), Michigan (entirely in US), Huron, Erie (connected by Niagara Falls to Ontario), Ontario. St. Lawrence River connects Ontario to Atlantic.",
        type: "physical",
        letters: [
          { letter: "S", country: "Lake Superior", id: "na-lake-superior" },
          { letter: "M", country: "Lake Michigan", id: "na-lake-michigan" },
          { letter: "H", country: "Lake Huron", id: "na-lake-huron" },
          { letter: "E", country: "Lake Erie", id: "na-lake-erie" },
          { letter: "O", country: "Lake Ontario", id: "na-lake-ontario" }
        ]
      },
      {
        title: "East African Rift Valley Lakes (North to South)",
        mnemonic: "C P A C B (Albert, Edward, Kivu, Tanganyika, Nyasa)",
        notes: "Tectonic graben lakes along Great Rift Valley. Lake Victoria is NOT a rift lake (shallow depression between rifts, traversed by Equator). Lake Tanganyika is 2nd deepest in world.",
        type: "physical",
        letters: [
          { letter: "A", country: "Lake Albert", id: "africa-lake-albert" },
          { letter: "E", country: "Lake Edward", id: "africa-lake-edward" },
          { letter: "K", country: "Lake Kivu", id: "africa-lake-kivu" },
          { letter: "T", country: "Lake Tanganyika", id: "africa-lake-tanganyika" },
          { letter: "M", country: "Lake Malawi / Nyasa", id: "africa-lake-malawi" }
        ]
      },
      {
        title: "Siberian Rivers Flowing North to Arctic",
        mnemonic: "BSA cycle Reindeer peg (Ob, Yenisey, Lena)",
        notes: "All flow South to North into Arctic Ocean (Kara & Laptev Seas). Frozen mouths create massive spring floods in West Siberian Plain.",
        type: "physical",
        letters: [
          { letter: "O", country: "Ob River (Kara Sea)", id: "eca-river-ob" },
          { letter: "Y", country: "Yenisey River (Kara Sea)", id: "eca-river-yenisey" },
          { letter: "L", country: "Lena River (Laptev Sea)", id: "eca-river-lena" }
        ]
      },
      {
        title: "North-West Africa: Atlas Mountains Countries",
        mnemonic: "MAT (Morocco, Algeria, Tunisia)",
        notes: "Fold mountain chain created by Eurasian and African plate collision. Toubkal (4,167 m) in Morocco is highest peak.",
        type: "physical",
        letters: [
          { letter: "M", country: "Morocco", id: "africa-mountain-atlas" },
          { letter: "A", country: "Algeria", id: "africa-mountain-atlas" },
          { letter: "T", country: "Tunisia", id: "africa-mountain-atlas" }
        ]
      }
    ];

    const allMnemonics = [...politicalMnemonics, ...physicalMnemonics];
    elements.mnemonicsGrid.innerHTML = '';

    allMnemonics.forEach(item => {
      const card = document.createElement('div');
      card.className = 'mnemonic-card';

      let chipsHtml = '';
      (item.letters || []).forEach(entry => {
        if (entry.id) {
          chipsHtml += `
            <button type="button" class="mnemonic-chip-btn" data-id="${entry.id}" data-type="${item.type || 'political'}" title="Jump to ${entry.country}">
              <strong>${entry.letter}</strong> <span>${entry.country}</span>
            </button>
          `;
        } else {
          chipsHtml += `
            <span class="mnemonic-chip-btn" style="opacity:0.7">
              <strong>${entry.letter}</strong> <span>${entry.country}</span>
            </span>
          `;
        }
      });

      card.innerHTML = `
        <div class="mnemonic-card-top">
          <h3 class="mnemonic-card-title">${item.title}</h3>
          <span class="mnemonic-card-acronym">${item.mnemonic}</span>
        </div>
        <div class="mnemonic-breakdown-list">
          ${chipsHtml}
        </div>
        <div class="mnemonic-card-footer">
          <i class="fa-solid fa-lightbulb text-gold"></i> ${item.notes}
        </div>
      `;

      elements.mnemonicsGrid.appendChild(card);
    });

    elements.mnemonicsGrid.querySelectorAll('.mnemonic-chip-btn[data-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        jumpToMnemonicEntity(btn.dataset.id, btn.dataset.type);
      });
    });
  }

// --- Search Autocomplete ---
  function setupSearch() {
    const input = elements.searchInput;
    const dropdown = elements.searchDropdown;

    input.addEventListener('input', () => {
      const query = input.value.trim().toLowerCase();
      if (!query || query.length < 2) {
        dropdown.classList.add('hidden');
        return;
      }

      const results = [];

      // Search Political Countries
      if (state.upscData && state.upscData.countries) {
        Object.values(state.upscData.countries).forEach(c => {
          if (
            c.name.toLowerCase().includes(query) ||
            c.aliases.some(a => a.includes(query)) ||
            (c.tags && c.tags.some(t => t.toLowerCase().includes(query)))
          ) {
            results.push({ type: 'country', item: c });
          }
        });
      }

      // Search Physical Features
      if (state.physicalData && state.physicalData.features) {
        Object.values(state.physicalData.features).forEach(f => {
          const cat = CATEGORY_META[f.category] || CATEGORY_META.mountain;
          if (
            f.name.toLowerCase().includes(query) ||
            (f.aliases && f.aliases.some(a => a.toLowerCase().includes(query))) ||
            (f.countries && f.countries.toLowerCase().includes(query)) ||
            (f.notes && f.notes.toLowerCase().includes(query))
          ) {
            results.push({ type: 'physical', item: f, catMeta: cat });
          }
        });
      }

      if (results.length === 0) {
        dropdown.innerHTML = `<div style="padding:10px; color:#888; font-size:0.8rem">No matching countries or features found</div>`;
        dropdown.classList.remove('hidden');
        return;
      }

      dropdown.innerHTML = results.slice(0, 12).map(r => {
        if (r.type === 'country') {
          return `
            <div class="search-result-item" data-type="country" data-id="${r.item.id}">
              <span class="search-result-country">🗺️ ${r.item.name}</span>
              <span class="search-result-continent">${r.item.continent}</span>
            </div>
          `;
        } else {
          return `
            <div class="search-result-item" data-type="physical" data-id="${r.item.id}">
              <span class="search-result-country">${r.catMeta.icon} ${r.item.name}</span>
              <span class="search-result-continent">${r.catMeta.name} • ${r.item.continent.toUpperCase()}</span>
            </div>
          `;
        }
      }).join('');

      dropdown.classList.remove('hidden');

      dropdown.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
          const type = item.dataset.type;
          const id = item.dataset.id;
          input.value = '';
          dropdown.classList.add('hidden');

          if (type === 'country') {
            setMapType('political');
            const cMeta = state.upscData.countries[id];
            if (cMeta) {
              let targetCont = 'world';
              if (cMeta.continent === 'Africa') targetCont = 'africa';
              else if (cMeta.continent === 'West Asia') targetCont = 'west-asia';
              else if (cMeta.continent === 'Europe') targetCont = 'europe';
              else if (cMeta.continent === 'East & Central Asia') targetCont = 'east-central-asia';
              else if (cMeta.continent === 'South & Southeast Asia') targetCont = 'south-se-asia';
              else if (cMeta.continent === 'South America') targetCont = 'south-america';
              else if (cMeta.continent === 'North America') targetCont = 'north-america';

              if (state.activeContinent !== targetCont && state.activeContinent !== 'world') {
                switchContinent(targetCont);
              }

              setTimeout(() => {
                zoomToCountry(id);
                selectCountry(id);
              }, 300);
            }
          } else {
            setMapType('physical');
            const f = state.physicalData.features[id];
            if (f) {
              if (state.activeContinent !== f.continent && state.activeContinent !== 'world') {
                switchContinent(f.continent);
              }
              setTimeout(() => {
                zoomToFeature(f.id, f.coords);
                selectPhysicalFeature(f.id);
              }, 300);
            }
          }
        });
      });
    });

    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden');
      }
    });
  }

  // --- Reset Current Map Progress ---
  function resetCurrentContinent() {
    if (state.mapType === 'political') {
      const continentCountries = getActiveContinentCountryIds();
      const confirmed = confirm(`Reset all political answers for ${state.activeContinent.toUpperCase()}?`);
      if (!confirmed) return;

      continentCountries.forEach(cid => {
        delete state.progress[cid];
      });
      saveProgress();

      renderCountries();
      deselectCurrent();
      updateStats();

      if (state.activeMode === 'find-country') {
        pickNextFindTarget();
      }
    } else {
      const visible = getAllActivePhysicalFeatures();
      const confirmed = confirm(`Reset all physical features answers for ${state.activeContinent.toUpperCase()} (${state.activePhysicalCategory.toUpperCase()})?`);
      if (!confirmed) return;

      visible.forEach(f => {
        delete state.physicalProgress[f.id];
      });
      saveProgress();

      renderLandforms();
      renderWaterways();
      renderPhysicalFeatures();
      deselectCurrent();
      updateStats();

      if (state.activeMode === 'find-country') {
        pickNextFindTarget();
      }
    }
  }

  // --- Event Listeners Setup ---
  function setupEventListeners() {
    // Map Type switcher buttons
    elements.mapTypeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        setMapType(btn.dataset.mapType);
      });
    });

    // Mode switcher buttons
    elements.modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        state.activeMode = btn.dataset.mode;
        updateUIForMode();
        if (state.mapType === 'political' && state.selectedCountryId) {
          selectCountry(state.selectedCountryId);
        } else if (state.mapType === 'physical' && state.selectedPhysicalId) {
          selectPhysicalFeature(state.selectedPhysicalId);
        }
      });
    });

    // Zoom buttons with smooth centering
    elements.zoomInBtn.addEventListener('click', () => {
      svg.transition().duration(250).call(zoomBehavior.scaleBy, 1.4);
    });
    elements.zoomOutBtn.addEventListener('click', () => {
      svg.transition().duration(250).call(zoomBehavior.scaleBy, 0.7);
    });
    elements.zoomResetBtn.addEventListener('click', resetZoom);

    // Quiz form submit & giveup
    elements.quizForm.addEventListener('submit', handleAnswerSubmit);
    elements.btnGiveupAnswer.addEventListener('click', handleGiveUp);
    elements.btnCloseQuiz.addEventListener('click', deselectCurrent);
    elements.btnCloseResult.addEventListener('click', deselectCurrent);

    // Card retry & next buttons
    elements.btnRetryCard.addEventListener('click', () => {
      if (state.mapType === 'political' && state.selectedCountryId) {
        delete state.progress[state.selectedCountryId];
        saveProgress();
        updateCountryPathStyle(d3.select(`#country-${state.selectedCountryId}`), state.selectedCountryId);
        updateStats();
        showCountryQuizPrompt(state.selectedCountryId);
      } else if (state.mapType === 'physical' && state.selectedPhysicalId) {
        delete state.physicalProgress[state.selectedPhysicalId];
        saveProgress();
        const f = state.physicalData.features[state.selectedPhysicalId];
        if (f.category === 'desert') {
          const dPath = d3.select(`#desert-${state.selectedPhysicalId}`);
          if (!dPath.empty()) updateDesertPathStyle(dPath, state.selectedPhysicalId);
        } else if (f.category === 'mountain') {
          const mPath = d3.select(`#mountain-${state.selectedPhysicalId}`);
          if (!mPath.empty()) updateMountainPathStyle(mPath, state.selectedPhysicalId);
        } else if (f.category === 'lake') {
          const lPath = d3.select(`#lake-${state.selectedPhysicalId}`);
          if (!lPath.empty()) updateLakePathStyle(lPath, state.selectedPhysicalId);
        } else if (f.category === 'river') {
          const rPath = d3.select(`#river-${state.selectedPhysicalId}`);
          if (!rPath.empty()) updateRiverPathStyle(rPath, state.selectedPhysicalId);
        } else {
          updatePhysicalMarkerStyle(d3.select(`#marker-${state.selectedPhysicalId}`), f);
        }
        updateStats();
        showPhysicalQuizPrompt(state.selectedPhysicalId);
      }
    });
    elements.btnNextUnanswered.addEventListener('click', selectNextUnanswered);

    // Find mode skip
    elements.findSkipBtn.addEventListener('click', pickNextFindTarget);

    // Reset progress button
    elements.resetContinentBtn.addEventListener('click', resetCurrentContinent);

    // Mnemonics dialog controls
    elements.mnemonicsBtn.addEventListener('click', () => {
      elements.mnemonicsDialog.showModal();
    });
    elements.btnCloseModal.addEventListener('click', () => {
      elements.mnemonicsDialog.close();
    });
    elements.mnemonicsDialog.addEventListener('click', (e) => {
      const rect = elements.mnemonicsDialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        elements.mnemonicsDialog.close();
      }
    });

    // Modal navigation tabs (Story vs Acronym Deck)
    if (elements.modalTabStory && elements.modalTabDeck) {
      elements.modalTabStory.addEventListener('click', () => {
        elements.modalTabStory.classList.add('active');
        elements.modalTabStory.setAttribute('aria-selected', 'true');
        elements.modalTabDeck.classList.remove('active');
        elements.modalTabDeck.setAttribute('aria-selected', 'false');
        elements.storyPane.classList.remove('hidden');
        elements.deckPane.classList.add('hidden');
      });
      elements.modalTabDeck.addEventListener('click', () => {
        elements.modalTabDeck.classList.add('active');
        elements.modalTabDeck.setAttribute('aria-selected', 'true');
        elements.modalTabStory.classList.remove('active');
        elements.modalTabStory.setAttribute('aria-selected', 'false');
        elements.deckPane.classList.remove('hidden');
        elements.storyPane.classList.add('hidden');
      });
    }

    setupSearch();
  }

  // Kickstart on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
