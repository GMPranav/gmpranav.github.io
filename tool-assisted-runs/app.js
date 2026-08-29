import { tasProfileData } from "./data.js";
import { parseMarkup } from "./markup.js";

function renderBio() {
    var bioEl = document.getElementById("bio");
    bioEl.textContent = tasProfileData.profile.bio;

    var handleEl = document.getElementById("handle");
    handleEl.textContent = tasProfileData.profile.handle;

    var hobbyEl = document.getElementById("hobby");
    hobbyEl.textContent = tasProfileData.profile.hobby;
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

    var nameSpan = document.createElement("span");
    nameSpan.className = "name";
    nameSpan.textContent = record.game;
    gameTd.appendChild(nameSpan);

    var branchSpan = document.createElement("span");
    branchSpan.className = "branch";
    branchSpan.textContent = record.branch;
    gameTd.appendChild(branchSpan);

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
    content.appendChild(body);

    td.appendChild(content);
    notesTr.appendChild(td);

    var isLoaded = false;
    var isLoading = false;

    async function loadNotes() {
        if (isLoaded || isLoading) return;
        isLoading = true;
        body.innerHTML = "<p><em>Loading author notes...</em></p>";

        try {
            var rawNotes = "";
            if (typeof record.notesLoader === "function") {
                rawNotes = await record.notesLoader();
            } else if (typeof record.notes === "function") {
                rawNotes = await record.notes();
            } else if (typeof record.notes === "string") {
                rawNotes = record.notes;
            }

            body.innerHTML = parseMarkup(rawNotes || "''No author notes provided.''");
            isLoaded = true;
        } catch (err) {
            console.error("Failed to load author notes:", err);
            body.innerHTML = "<p><em>Failed to load author notes.</em></p>";
        } finally {
            isLoading = false;
        }
    }

    return {
        row: notesTr,
        loadNotes: loadNotes,
    };
}

function renderTable() {
    var records = tasProfileData.completedProjects;

    var countEl = document.getElementById("record-count");
    countEl.textContent = records.length + " runs";

    var tbody = document.getElementById("records-body");
    for (var i = 0; i < records.length; i++) {
        (function (record) {
            var row = makeRow(record);
            var notesHandle = makeNotesRow(record);
            var notesRow = notesHandle.row;

            var toggleNotes = function (e) {
                if (e.target.closest("a")) return;
                var isExpanded = row.getAttribute("aria-expanded") === "true";
                var nextExpanded = !isExpanded;

                row.setAttribute("aria-expanded", nextExpanded);
                notesRow.hidden = !nextExpanded;
                row.classList.toggle("is-expanded", nextExpanded);

                if (nextExpanded) {
                    notesHandle.loadNotes();
                }
            };

            row.addEventListener("click", toggleNotes);
            row.addEventListener("keydown", function (e) {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleNotes(e);
                }
            });

            tbody.appendChild(row);
            tbody.appendChild(notesRow);
        })(records[i]);
    }
}

function init() {
    renderBio();
    renderTable();

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