import { tasProfileData } from "./data.js";

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
    td.setAttribute("data-label", "Links");

    var wrap = document.createElement("div");
    wrap.className = "links";

    var fields = [
        { key: "inputFile", text: "File" },
        { key: "encode", text: "Watch" },
        { key: "commentary", text: "Watch" },
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
    tr.appendChild(makeLinkCell(record, "encode"));
    tr.appendChild(makeLinkCell(record, "commentary"));

    return tr;
}

function renderTable() {
    var records = tasProfileData.completedProjects;

    var countEl = document.getElementById("record-count");
    countEl.textContent = records.length + " runs";

    var tbody = document.getElementById("records-body");
    for (var i = 0; i < records.length; i++) {
        tbody.appendChild(makeRow(records[i]));
    }
}

function init() {
    renderBio();
    renderTable();
}

document.addEventListener("DOMContentLoaded", init);
