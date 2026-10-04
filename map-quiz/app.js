/**
 * UPSC Political Map Trainer
 * Interactive outline map engine using D3.js and TopoJSON.
 * Features:
 * - Continent switching with tailored geo projections
 * - "Click & Name" interactive quiz with alias tolerance
 * - "Find Country" target-seeking quiz mode
 * - "Study Mode" for UPSC prelims revision
 * - Strict Green (#22c55e) on correct, Red (#ef4444) on wrong
 * - High-Yield Mnemonics deck (BURGER T, LIST, MEN SOW SEEDS, TARIK, etc.)
 * - Pan, zoom, search, and progress persistence
 */

(function () {
  'use strict';

  // --- Constants & Config ---
  const STORAGE_KEY = 'upsc_map_progress_v2';
  
  // App State
  let state = {
    activeMode: 'click-name', // 'click-name' | 'find-country' | 'study'
    activeContinent: 'africa',
    selectedCountryId: null,
    targetCountryId: null, // For find-country mode
    progress: {}, // countryId -> { status: 'correct' | 'wrong', attempts: 1 }
    geoData: null,
    upscData: null,
    worldFeatures: []
  };

  // D3 Selection references
  let svg, mapGroup, projection, geoPath, zoomBehavior;
  let width = 900;
  let height = 650;

  // DOM Elements
  const elements = {
    viewport: document.getElementById('map-viewport'),
    mapSvg: document.getElementById('map-svg'),
    loadingOverlay: document.getElementById('loading-overlay'),
    continentTabs: document.getElementById('continent-tabs-container'),
    modeBtns: document.querySelectorAll('.mode-btn'),
    guidancePill: document.getElementById('mode-guidance-pill'),
    guidanceText: document.getElementById('guidance-text'),
    findBanner: document.getElementById('find-prompt-banner'),
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
    quizContinentLabel: document.getElementById('quiz-continent-label'),
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
    mnemonicsGrid: document.getElementById('mnemonics-grid'),

    // Search
    searchInput: document.getElementById('country-search-input'),
    searchDropdown: document.getElementById('search-dropdown'),
    resetContinentBtn: document.getElementById('reset-continent-btn')
  };

  // --- Initialize Application ---
  async function init() {
    loadProgress();
    setupEventListeners();
    await loadData();
    renderContinentTabs();
    initD3Map();
    renderMnemonicsDeck();
    updateUIForMode();
    updateStats();
  }

  // --- Data Loading ---
  async function loadData() {
    try {
      const [topoRes, upscRes] = await Promise.all([
        fetch('data/world.json'),
        fetch('data/upsc-data.json')
      ]);

      if (!topoRes.ok || !upscRes.ok) {
        throw new Error('Failed to load map data files');
      }

      state.geoData = await topoRes.json();
      state.upscData = await upscRes.json();

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
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        state.progress = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read saved progress', e);
      state.progress = {};
    }
  }

  function saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress));
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

    // Reset selection and close side panel
    state.selectedCountryId = null;
    hideAllPanels();
    elements.panelIdle.classList.remove('hidden');

    // Update map projection and redraw
    updateProjection();
    renderCountries();
    resetZoom();

    // Setup new target if in find-country mode
    if (state.activeMode === 'find-country') {
      pickNextFindTarget();
    }

    updateStats();
  }

  // --- D3 Map Engine ---
  function initD3Map() {
    const bbox = elements.viewport.getBoundingClientRect();
    width = bbox.width || 900;
    height = bbox.height || 650;

    svg = d3.select('#map-svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Zoom behavior
    zoomBehavior = d3.zoom()
      .scaleExtent([0.6, 25])
      .on('zoom', (event) => {
        mapGroup.attr('transform', event.transform);
      });

    svg.call(zoomBehavior)
       .on('dblclick.zoom', null); // Prevent accidental double-click zoom

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
          deselectCurrentCountry();
        }
      });

    updateProjection();
    renderCountries();

    // Window resize handler
    window.addEventListener('resize', handleResize);
  }

  function handleResize() {
    const bbox = elements.viewport.getBoundingClientRect();
    if (!bbox.width || !bbox.height) return;
    width = bbox.width;
    height = bbox.height;
    svg.attr('viewBox', `0 0 ${width} ${height}`);
    updateProjection();
    renderCountries();
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

  // Determine if feature belongs to active continent tab
  function isFeatureInActiveContinent(feature) {
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

  function renderCountries() {
    if (!state.worldFeatures.length) return;

    // Filter features or render with dim opacity for other continents
    const paths = mapGroup.selectAll('.country-path')
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
        // Hide small polar territories in regional maps
        if (d.id === '010' && state.activeContinent !== 'world') return 'none'; // Antarctica
        return null;
      })
      .style('opacity', d => {
        if (state.activeContinent === 'world') return 1;
        return isFeatureInActiveContinent(d) ? 1 : 0.18;
      })
      .style('pointer-events', d => {
        if (state.activeContinent === 'world') return 'all';
        return isFeatureInActiveContinent(d) ? 'all' : 'none';
      })
      .each(function (d) {
        updateCountryPathStyle(d3.select(this), String(d.id));
      })
      .on('mouseenter', handleMouseEnter)
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

  // --- Mouse & Tooltip Handlers ---
  function handleMouseEnter(event, d) {
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

  // --- Country Selection Logic ---
  function handleCountryClick(event, d) {
    event.stopPropagation();
    const cid = String(d.id);
    const country = state.upscData.countries[cid];
    if (!country) return;

    if (state.activeMode === 'find-country') {
      handleFindCountryClick(cid);
      return;
    }

    // Select country
    selectCountry(cid);
  }

  function selectCountry(cid) {
    state.selectedCountryId = cid;
    const country = state.upscData.countries[cid];

    // Refresh styling across all paths
    mapGroup.selectAll('.country-path').each(function (d) {
      updateCountryPathStyle(d3.select(this), String(d.id));
    });

    hideAllPanels();

    if (state.activeMode === 'study') {
      showResultCard(cid, 'study');
      return;
    }

    // Click & Name mode
    const existingResult = state.progress[cid];
    if (existingResult) {
      showResultCard(cid, existingResult.status);
    } else {
      showQuizPrompt(cid);
    }
  }

  function deselectCurrentCountry() {
    state.selectedCountryId = null;
    mapGroup.selectAll('.country-path').classed('country-selected', false);
    hideAllPanels();
    elements.panelIdle.classList.remove('hidden');
  }

  function hideAllPanels() {
    elements.panelIdle.classList.add('hidden');
    elements.panelQuiz.classList.add('hidden');
    elements.panelResult.classList.add('hidden');
  }

  // --- Quiz Prompt & Validation ---
  function showQuizPrompt(cid) {
    const country = state.upscData.countries[cid];
    elements.quizContinentLabel.textContent = country.continent || 'World';
    elements.answerInput.value = '';
    elements.panelQuiz.classList.remove('hidden');

    // Focus input
    setTimeout(() => {
      elements.answerInput.focus();
    }, 50);
  }

  function handleAnswerSubmit(e) {
    if (e) e.preventDefault();
    if (!state.selectedCountryId) return;

    const cid = state.selectedCountryId;
    const country = state.upscData.countries[cid];
    const userInput = elements.answerInput.value.trim().toLowerCase();

    if (!userInput) return;

    // Normalization helper
    const normalize = str => str
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip accents
      .toLowerCase()
      .replace(/[^a-z0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const normalizedInput = normalize(userInput);

    // Validation against aliases and official name
    const matches = country.aliases.some(alias => {
      const normAlias = normalize(alias);
      return normAlias === normalizedInput || normalizedInput.includes(normAlias) || normAlias.includes(normalizedInput);
    }) || normalize(country.name) === normalizedInput;

    const isCorrect = matches;

    // Save state
    state.progress[cid] = {
      status: isCorrect ? 'correct' : 'wrong',
      attempts: ((state.progress[cid] && state.progress[cid].attempts) || 0) + 1,
      lastAnswer: userInput
    };
    saveProgress();

    // Trigger visual outline flash
    const path = d3.select(`#country-${cid}`);
    path.classed(isCorrect ? 'animate-correct' : 'animate-wrong', true);
    setTimeout(() => {
      path.classed(isCorrect ? 'animate-correct' : 'animate-wrong', false);
    }, 600);

    // Update styling
    updateCountryPathStyle(path, cid);
    updateStats();

    // Display result flashcard
    showResultCard(cid, isCorrect ? 'correct' : 'wrong');
  }

  function handleGiveUp() {
    if (!state.selectedCountryId) return;
    const cid = state.selectedCountryId;

    state.progress[cid] = {
      status: 'wrong',
      attempts: ((state.progress[cid] && state.progress[cid].attempts) || 0) + 1,
      lastAnswer: 'revealed'
    };
    saveProgress();

    const path = d3.select(`#country-${cid}`);
    path.classed('animate-wrong', true);
    setTimeout(() => path.classed('animate-wrong', false), 600);
    updateCountryPathStyle(path, cid);
    updateStats();

    showResultCard(cid, 'wrong');
  }

  // --- Result & UPSC Fact Card ---
  function showResultCard(cid, status) {
    const country = state.upscData.countries[cid];
    if (!country) return;

    hideAllPanels();
    elements.panelResult.classList.remove('hidden');

    // Banner styling
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

    // Details
    elements.cardCountryName.textContent = country.name;
    elements.cardCapital.textContent = country.capital ? `Capital: ${country.capital}` : 'Sovereign Territory';

    // Mnemonic
    if (country.mnemonic) {
      elements.cardMnemonicBox.classList.remove('hidden');
      elements.cardMnemonicText.textContent = country.mnemonic;
    } else {
      elements.cardMnemonicBox.classList.add('hidden');
    }

    // Notes
    elements.cardNotesContent.textContent = country.notes || `Standard UPSC territorial outline for ${country.name}.`;

    // Tags
    elements.cardTagsContainer.innerHTML = '';
    (country.tags || []).forEach(tag => {
      const span = document.createElement('span');
      span.className = 'syllabus-tag';
      span.textContent = `# ${tag}`;
      elements.cardTagsContainer.appendChild(span);
    });
  }

  // --- "Find Country" Target Mode ---
  function pickNextFindTarget() {
    const continentCountries = getActiveContinentCountryIds();
    const uncompleted = continentCountries.filter(cid => !state.progress[cid] || state.progress[cid].status !== 'correct');

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

      // Show flashcard
      selectCountry(targetCid);

      // Advance to next target after brief pause
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

      // Flash target country outline so user learns where it is
      const targetPath = d3.select(`#country-${targetCid}`);
      targetPath.classed('country-selected', true);
      setTimeout(() => {
        targetPath.classed('country-selected', false);
      }, 1800);

      updateStats();
      selectCountry(clickedCid);
    }
  }

  // --- Helper: Get Country IDs in Current Continent ---
  function getActiveContinentCountryIds() {
    const list = [];
    state.worldFeatures.forEach(f => {
      const cid = String(f.id);
      if (isFeatureInActiveContinent(f) && state.upscData.countries[cid]) {
        list.push(cid);
      }
    });
    return list;
  }

  // --- Next Unanswered Country ---
  function selectNextUnanswered() {
    const continentCountries = getActiveContinentCountryIds();
    const unattempted = continentCountries.filter(cid => !state.progress[cid]);

    if (unattempted.length > 0) {
      const nextCid = unattempted[0];
      zoomToCountry(nextCid);
      selectCountry(nextCid);
    } else {
      alert('All countries in this continent have been attempted! Review your incorrect answers or reset the continent map.');
    }
  }

  // --- Zoom To Specific Country ---
  function zoomToCountry(cid) {
    const feature = state.worldFeatures.find(f => String(f.id) === cid);
    if (!feature) return;

    const bounds = geoPath.bounds(feature);
    const dx = bounds[1][0] - bounds[0][0];
    const dy = bounds[1][1] - bounds[0][1];
    const x = (bounds[0][0] + bounds[1][0]) / 2;
    const y = (bounds[0][1] + bounds[1][1]) / 2;

    const scale = Math.max(1, Math.min(12, 0.75 / Math.max(dx / width, dy / height)));
    const translate = [width / 2 - scale * x, height / 2 - scale * y];

    svg.transition()
      .duration(650)
      .call(
        zoomBehavior.transform,
        d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
      );
  }

  function resetZoom() {
    svg.transition()
      .duration(450)
      .call(zoomBehavior.transform, d3.zoomIdentity);
  }

  // --- Stats Bar ---
  function updateStats() {
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
  }

  // --- Mode Switching ---
  function updateUIForMode() {
    elements.modeBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === state.activeMode);
    });

    if (state.activeMode === 'click-name') {
      elements.findBanner.classList.add('hidden');
      elements.guidancePill.classList.remove('hidden');
      elements.guidanceText.innerHTML = `Click any country outline to name it. Correct turns <strong class="text-green">Green</strong>, incorrect turns <strong class="text-red">Red</strong>.`;
    } else if (state.activeMode === 'find-country') {
      elements.findBanner.classList.remove('hidden');
      elements.guidancePill.classList.add('hidden'); // Hide guidance pill so it never overlaps the target banner
      pickNextFindTarget();
    } else if (state.activeMode === 'study') {
      elements.findBanner.classList.add('hidden');
      elements.guidancePill.classList.remove('hidden');
      elements.guidanceText.innerHTML = `Study Mode active: Click any outline to inspect its UPSC syllabus facts and mnemonics.`;
    }
  }

  // --- Mnemonics Deck Rendering ---
  function renderMnemonicsDeck() {
    const mnemonics = state.upscData.mnemonics || [];
    elements.mnemonicsGrid.innerHTML = '';

    mnemonics.forEach(item => {
      const card = document.createElement('div');
      card.className = 'mnemonic-card';

      let chipsHtml = '';
      item.letters.forEach(entry => {
        if (entry.id) {
          chipsHtml += `
            <button type="button" class="mnemonic-chip-btn" data-cid="${entry.id}" title="Jump to ${entry.country}">
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

    // Attach click listeners to mnemonic chips
    elements.mnemonicsGrid.querySelectorAll('.mnemonic-chip-btn[data-cid]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cid = btn.dataset.cid;
        elements.mnemonicsDialog.close();

        // Switch to country's continent if needed
        const cMeta = state.upscData.countries[cid];
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
            zoomToCountry(cid);
            selectCountry(cid);
          }, 250);
        }
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
      Object.values(state.upscData.countries).forEach(c => {
        if (
          c.name.toLowerCase().includes(query) ||
          c.aliases.some(a => a.includes(query)) ||
          (c.tags && c.tags.some(t => t.toLowerCase().includes(query)))
        ) {
          results.push(c);
        }
      });

      if (results.length === 0) {
        dropdown.innerHTML = `<div style="padding:10px; color:#888; font-size:0.8rem">No countries found</div>`;
        dropdown.classList.remove('hidden');
        return;
      }

      dropdown.innerHTML = results.slice(0, 10).map(c => `
        <div class="search-result-item" data-cid="${c.id}">
          <span class="search-result-country">${c.name}</span>
          <span class="search-result-continent">${c.continent}</span>
        </div>
      `).join('');

      dropdown.classList.remove('hidden');

      dropdown.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
          const cid = item.dataset.cid;
          input.value = '';
          dropdown.classList.add('hidden');

          const cMeta = state.upscData.countries[cid];
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
              zoomToCountry(cid);
              selectCountry(cid);
            }, 300);
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

  // --- Reset Continent Map ---
  function resetCurrentContinent() {
    const continentCountries = getActiveContinentCountryIds();
    const confirmed = confirm(`Are you sure you want to reset all answers for ${state.activeContinent.toUpperCase()}?`);
    if (!confirmed) return;

    continentCountries.forEach(cid => {
      delete state.progress[cid];
    });
    saveProgress();

    renderCountries();
    deselectCurrentCountry();
    updateStats();

    if (state.activeMode === 'find-country') {
      pickNextFindTarget();
    }
  }

  // --- Event Listeners Setup ---
  function setupEventListeners() {
    // Mode switcher buttons
    elements.modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        state.activeMode = btn.dataset.mode;
        updateUIForMode();
        if (state.selectedCountryId) {
          selectCountry(state.selectedCountryId);
        }
      });
    });

    // Zoom buttons
    elements.zoomInBtn.addEventListener('click', () => {
      svg.transition().duration(250).call(zoomBehavior.scaleBy, 1.4);
    });
    elements.zoomOutBtn.addEventListener('click', () => {
      svg.transition().duration(250).call(zoomBehavior.scaleBy, 0.7);
    });
    elements.zoomResetBtn.addEventListener('click', resetZoom);

    // Quiz form submit
    elements.quizForm.addEventListener('submit', handleAnswerSubmit);
    elements.btnGiveupAnswer.addEventListener('click', handleGiveUp);
    elements.btnCloseQuiz.addEventListener('click', deselectCurrentCountry);
    elements.btnCloseResult.addEventListener('click', deselectCurrentCountry);

    // Card action buttons
    elements.btnRetryCard.addEventListener('click', () => {
      if (state.selectedCountryId) {
        delete state.progress[state.selectedCountryId];
        saveProgress();
        updateCountryPathStyle(d3.select(`#country-${state.selectedCountryId}`), state.selectedCountryId);
        updateStats();
        showQuizPrompt(state.selectedCountryId);
      }
    });
    elements.btnNextUnanswered.addEventListener('click', selectNextUnanswered);

    // Find country skip
    elements.findSkipBtn.addEventListener('click', pickNextFindTarget);

    // Reset continent
    elements.resetContinentBtn.addEventListener('click', resetCurrentContinent);

    // Mnemonics dialog controls
    elements.mnemonicsBtn.addEventListener('click', () => {
      elements.mnemonicsDialog.showModal();
    });
    elements.btnCloseModal.addEventListener('click', () => {
      elements.mnemonicsDialog.close();
    });
    elements.mnemonicsDialog.addEventListener('click', (e) => {
      // Light-dismiss if clicking backdrop
      const rect = elements.mnemonicsDialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        elements.mnemonicsDialog.close();
      }
    });

    setupSearch();
  }

  // Kickstart on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
