import { tasProfileData } from "./data.js";
import { parseMarkup } from "./markup.js";

const BASE_PATH = "/tool-assisted-runs/";

function getSlugFromPath(pathname) {
    if (!pathname) pathname = window.location.pathname;
    let sub = pathname;
    if (sub.startsWith(BASE_PATH)) {
        sub = sub.slice(BASE_PATH.length);
    }
    sub = sub.replace(/^\/+|\/+$/g, "");
    if (!sub || sub === "index.html") return null;
    return sub;
}

function scrollToRow(row) {
    if (!row) return;
    // Allow layout to settle before smooth scrolling
    setTimeout(function () {
        row.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
}

function renderBio() {
    var bioEl = document.getElementById("bio");
    if (bioEl && tasProfileData.profile.bio) {
        bioEl.textContent = tasProfileData.profile.bio;
    }

    var handleEl = document.getElementById("handle");
    if (handleEl && tasProfileData.profile.handle) {
        handleEl.textContent = tasProfileData.profile.handle;
    }

    var hobbyEl = document.getElementById("hobby");
    if (hobbyEl && tasProfileData.profile.hobby) {
        hobbyEl.textContent = tasProfileData.profile.hobby;
    }
}

function makeLinkCell(record, fieldKey) {
    var td = document.createElement("td");
    td.setAttribute("data-label", "Input File");

    var wrap = document.createElement("div");
    wrap.className = "links";

    var fields = [
        { key: "inputFile", text: "File" },
    ];

    var field = fields.find(f => f.key === fieldKey);
    var value = record[field.key];

    if (value) {
        var a = document.createElement("a");
        a.href = value.href;
        a.textContent = field.text + " (" + value.label + ")";
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.download = "";
        wrap.appendChild(a);
    } else {
        var dash = document.createElement("span");
        dash.className = "dash";
        dash.textContent = "\u2014";
        wrap.appendChild(dash);
    }

    td.appendChild(wrap);
    return td;
}

function makeRow(record) {
    var tr = document.createElement("tr");
    tr.className = "record-row";
    tr.setAttribute("tabindex", "0");
    tr.setAttribute("aria-expanded", "false");
    tr.setAttribute("data-slug", record.slug);
    tr.id = "run-" + record.slug.replace(/[^a-zA-Z0-9_-]/g, "_");

    var platformTd = document.createElement("td");
    platformTd.setAttribute("data-label", "Platform");
    var platformBadge = document.createElement("span");
    platformBadge.className = "badge";
    platformBadge.textContent = record.platform;
    platformTd.appendChild(platformBadge);
    tr.appendChild(platformTd);

    var gameTd = document.createElement("td");
    gameTd.className = "cell-game";
    gameTd.setAttribute("data-label", "Game");

    var runLink = document.createElement("a");
    runLink.className = "run-link";
    runLink.href = BASE_PATH + record.slug + "/";

    var nameSpan = document.createElement("span");
    nameSpan.className = "name";
    nameSpan.textContent = record.game;
    runLink.appendChild(nameSpan);

    var branchSpan = document.createElement("span");
    branchSpan.className = "branch";
    branchSpan.textContent = record.branch;
    runLink.appendChild(branchSpan);

    gameTd.appendChild(runLink);

    if (record.obsolete) {
        var obsoleteBadge = document.createElement("span");
        obsoleteBadge.className = "badge obsolete-tag";
        obsoleteBadge.textContent = "Obsolete";
        gameTd.appendChild(obsoleteBadge);
    }

    tr.appendChild(gameTd);

    var timeTd = document.createElement("td");
    timeTd.setAttribute("data-label", "Time");
    var timeSpan = document.createElement("span");
    timeSpan.className = "time";
    timeSpan.textContent = record.time;
    timeTd.appendChild(timeSpan);
    tr.appendChild(timeTd);

    var emulatorTd = document.createElement("td");
    emulatorTd.setAttribute("data-label", "Emulator");
    var emulatorSpan = document.createElement("span");
    emulatorSpan.className = "emulator";
    emulatorSpan.textContent = record.emulator;
    emulatorTd.appendChild(emulatorSpan);
    tr.appendChild(emulatorTd);

    tr.appendChild(makeLinkCell(record, "inputFile"));

    return tr;
}

function createMediaItem(title, value, emptyText) {
    var item = document.createElement("div");
    item.className = "notes-media-item";

    var header = document.createElement("div");
    header.className = "notes-header";
    header.textContent = title;
    item.appendChild(header);

    var body = document.createElement("div");
    body.className = "notes-media-body";

    if (value && value.href) {
        body.innerHTML = parseMarkup("[module:youtube|v=" + value.href + "]");
    } else {
        body.innerHTML = parseMarkup("''" + (emptyText || "No " + title.toLowerCase() + " available.") + "''");
    }

    item.appendChild(body);
    return item;
}

function makeNotesRow(record) {
    var notesTr = document.createElement("tr");
    notesTr.className = "notes-row";
    notesTr.hidden = true;

    var td = document.createElement("td");
    td.setAttribute("colspan", "5");

    var content = document.createElement("div");
    content.className = "notes-content";

    var mediaGrid = document.createElement("div");
    mediaGrid.className = "notes-media-grid";
    mediaGrid.appendChild(createMediaItem("Video", record.encode, "No video available."));
    mediaGrid.appendChild(createMediaItem("Commentary", record.commentary, "No commentary track available."));
    content.appendChild(mediaGrid);

    var header = document.createElement("div");
    header.className = "notes-header";
    header.textContent = "Author Notes";
    content.appendChild(header);

    var body = document.createElement("div");
    body.className = "notes-body";
    body.innerHTML = "<p><em>Loading author notes...</em></p>";
    content.appendChild(body);

    td.appendChild(content);
    notesTr.appendChild(td);

    return attachNotesLoader(record, notesTr, body);
}

function attachNotesLoader(record, notesTr, bodyEl) {
    var isLoaded = bodyEl && bodyEl.children.length > 0 && !bodyEl.querySelector("p > em:only-child");
    var isLoading = false;

    async function loadNotes() {
        if (isLoaded || isLoading) return;
        isLoading = true;
        if (bodyEl) {
            bodyEl.innerHTML = "<p><em>Loading author notes...</em></p>";
        }

        try {
            var rawNotes = "";
            if (typeof record.notesLoader === "function") {
                rawNotes = await record.notesLoader();
            } else if (typeof record.notes === "function") {
                rawNotes = await record.notes();
            } else if (typeof record.notes === "string") {
                rawNotes = record.notes;
            }

            if (bodyEl) {
                bodyEl.innerHTML = parseMarkup(rawNotes || "''No author notes provided.''");
            }
            isLoaded = true;
        } catch (err) {
            console.error("Failed to load author notes:", err);
            if (bodyEl) {
                bodyEl.innerHTML = "<p><em>Failed to load author notes.</em></p>";
            }
        } finally {
            isLoading = false;
        }
    }

    return {
        row: notesTr,
        loadNotes: loadNotes,
        isLoaded: function() { return isLoaded; }
    };
}

const rowControllers = new Map();

function setupRowController(record, row, existingNotesHandle = null) {
    var notesHandle = existingNotesHandle;

    function getOrCreateNotesHandle() {
        if (notesHandle && notesHandle.row) return notesHandle;
        var next = row.nextElementSibling;
        if (next && next.classList.contains("notes-row")) {
            var bodyEl = next.querySelector(".notes-body");
            notesHandle = attachNotesLoader(record, next, bodyEl);
            return notesHandle;
        }
        notesHandle = makeNotesRow(record);
        row.insertAdjacentElement("afterend", notesHandle.row);
        return notesHandle;
    }

    function expand(updateUrl = true, shouldScroll = true) {
        var nh = getOrCreateNotesHandle();
        row.setAttribute("aria-expanded", "true");
        nh.row.hidden = false;
        row.classList.add("is-expanded");
        nh.loadNotes();

        if (updateUrl) {
            const targetUrl = BASE_PATH + record.slug + "/";
            if (window.location.pathname !== targetUrl) {
                history.pushState({ slug: record.slug }, "", targetUrl);
            }
        }

        if (shouldScroll) {
            scrollToRow(row);
        }
    }

    function collapse(updateUrl = true) {
        row.setAttribute("aria-expanded", "false");
        if (notesHandle && notesHandle.row) {
            notesHandle.row.hidden = true;
        }
        row.classList.remove("is-expanded");

        if (updateUrl) {
            if (window.location.pathname !== BASE_PATH) {
                history.pushState({ slug: null }, "", BASE_PATH);
            }
        }
    }

    function toggle(updateUrl = true) {
        var isExpanded = row.getAttribute("aria-expanded") === "true";
        if (isExpanded) {
            collapse(updateUrl);
        } else {
            // Close other rows
            for (const [s, ctrl] of rowControllers.entries()) {
                if (s !== record.slug && ctrl.isExpanded()) {
                    ctrl.collapse(false);
                }
            }
            expand(updateUrl, true);
        }
    }

    const controller = {
        record: record,
        row: row,
        expand: expand,
        collapse: collapse,
        toggle: toggle,
        isExpanded: function() { return row.getAttribute("aria-expanded") === "true"; }
    };

    rowControllers.set(record.slug, controller);

    // Support alias lookups with "the-"
    if (record.slug.includes("prince-of-persia-sands-of-time")) {
        rowControllers.set(record.slug.replace("prince-of-persia-sands-of-time", "prince-of-persia-the-sands-of-time"), controller);
    }

    var clickHandler = function (e) {
        // If clicking download link, don't interfere
        if (e.target.closest("a[download]") || e.target.closest("a[target='_blank']")) {
            return;
        }

        // If clicking the run-link itself with meta keys, allow standard new-tab opening
        var runLink = e.target.closest("a.run-link");
        if (runLink && (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1)) {
            return;
        }

        e.preventDefault();
        toggle(true);
    };

    row.addEventListener("click", clickHandler);
    row.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle(true);
        }
    });

    return controller;
}

function renderOrHydrateTable() {
    var records = tasProfileData.completedProjects;
    var countEl = document.getElementById("record-count");
    if (countEl) {
        countEl.textContent = records.length + " runs";
    }

    var tbody = document.getElementById("records-body");
    if (!tbody) return;

    var existingRows = tbody.querySelectorAll("tr.record-row");

    if (existingRows.length > 0) {
        // Hydrate statically pre-rendered rows
        existingRows.forEach(function (row) {
            var slug = row.getAttribute("data-slug");
            var record = records.find(r => r.slug === slug);
            if (!record) return;

            var notesRow = row.nextElementSibling;
            var notesHandle = null;
            if (notesRow && notesRow.classList.contains("notes-row")) {
                var bodyEl = notesRow.querySelector(".notes-body");
                notesHandle = attachNotesLoader(record, notesRow, bodyEl);
            }

            setupRowController(record, row, notesHandle);
        });
    } else {
        // Fallback rendering
        for (var i = 0; i < records.length; i++) {
            var record = records[i];
            var row = makeRow(record);
            tbody.appendChild(row);
            setupRowController(record, row, null);
        }
    }

    // Check if the page was opened with a run's URL
    var currentSlug = getSlugFromPath();
    if (currentSlug && rowControllers.has(currentSlug)) {
        var ctrl = rowControllers.get(currentSlug);
        // Expand and scroll to it
        ctrl.expand(false, true);
    }
}

function init() {
    renderBio();
    renderOrHydrateTable();

    // Browser Back/Forward navigation
    window.addEventListener("popstate", function (e) {
        var slug = (e.state && e.state.slug) || getSlugFromPath();
        if (slug && rowControllers.has(slug)) {
            var targetCtrl = rowControllers.get(slug);
            for (const ctrl of rowControllers.values()) {
                if (ctrl === targetCtrl) {
                    ctrl.expand(false, true);
                } else if (ctrl.isExpanded()) {
                    ctrl.collapse(false);
                }
            }
        } else {
            for (const ctrl of rowControllers.values()) {
                if (ctrl.isExpanded()) {
                    ctrl.collapse(false);
                }
            }
        }
    });

    // Event delegation for tab switching inside notes
    document.addEventListener("click", function (e) {
        var tabBtn = e.target.closest(".tab-btn");
        if (!tabBtn) return;

        var container = tabBtn.closest(".tabs-container");
        if (!container) return;

        var tabIndex = tabBtn.getAttribute("data-tab-index");
        if (tabIndex === null) return;

        // Update active tab buttons
        var buttons = container.querySelectorAll(".tab-btn");
        for (var b = 0; b < buttons.length; b++) {
            var isTargetBtn = buttons[b].getAttribute("data-tab-index") === tabIndex;
            buttons[b].classList.toggle("active", isTargetBtn);
            buttons[b].setAttribute("aria-selected", isTargetBtn ? "true" : "false");
        }

        // Update active tab panes
        var panes = container.querySelectorAll(".tab-pane");
        for (var p = 0; p < panes.length; p++) {
            var isTargetPane = panes[p].getAttribute("data-tab-index") === tabIndex;
            panes[p].classList.toggle("active", isTargetPane);
            panes[p].style.display = isTargetPane ? "block" : "none";
        }
    });
}

document.addEventListener("DOMContentLoaded", init);