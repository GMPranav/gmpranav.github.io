import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import { tasProfileData } from "../tool-assisted-runs/data.js";
import { parseMarkup } from "../tool-assisted-runs/markup.js";

const require = createRequire(import.meta.url);
const { PROJECTS } = require("../static/projects-data.js");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
const TAR_DIR = path.resolve(REPO_ROOT, "tool-assisted-runs");

function getYouTubeId(url) {
    if (!url) return null;
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : null;
}

function escapeHtml(str) {
    if (!str) return "";
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function renderMediaItem(title, value, emptyText) {
    let bodyHtml = "";
    if (value && value.href) {
        bodyHtml = parseMarkup("[module:youtube|v=" + value.href + "]");
    } else {
        bodyHtml = parseMarkup("''" + (emptyText || "No " + title.toLowerCase() + " available.") + "''");
    }
    const iconClass = title.toLowerCase().includes("video") ? "fa-solid fa-play" : "fa-solid fa-microphone";
    return `
        <div class="notes-media-item">
            <div class="notes-header"><i class="${iconClass}"></i> ${escapeHtml(title)}</div>
            <div class="notes-media-body">${bodyHtml}</div>
        </div>`;
}

function renderRowOnly(record, isExpanded = false) {
    const slug = record.slug;
    const rowId = "run-" + slug.replace(/[^a-zA-Z0-9_-]/g, "_");
    const expandedAttr = isExpanded ? ' aria-expanded="true"' : ' aria-expanded="false"';
    const expandedClass = isExpanded ? ' is-expanded' : '';

    const obsoleteBadge = record.obsolete
        ? ' <span class="badge obsolete-tag">Obsolete</span>'
        : '';

    const inputFileHtml = record.inputFile
        ? `<a href="${escapeHtml(record.inputFile.href)}" target="_blank" rel="noopener noreferrer" download=""><i class="fa-solid fa-file-arrow-down"></i> File (${escapeHtml(record.inputFile.label)})</a>`
        : '<span class="dash">&mdash;</span>';

    return `
    <tr class="record-row${expandedClass}" tabindex="0"${expandedAttr} data-slug="${escapeHtml(slug)}" id="${escapeHtml(rowId)}">
        <td data-label="Platform"><span class="badge">${escapeHtml(record.platform)}</span></td>
        <td class="cell-game" data-label="Game">
            <a href="/tool-assisted-runs/${escapeHtml(slug)}/" class="run-link">
                <span class="name">${escapeHtml(record.game)}</span>
                <span class="branch">${escapeHtml(record.branch)}</span>
            </a>${obsoleteBadge}
        </td>
        <td data-label="Time"><span class="time">${escapeHtml(record.time)}</span></td>
        <td data-label="Emulator"><span class="emulator">${escapeHtml(record.emulator)}</span></td>
        <td data-label="Input File">
            <div class="links">
                ${inputFileHtml}
            </div>
        </td>
    </tr>`;
}

function renderActiveNotesRow(record, notesHtml) {
    return `
    <tr class="notes-row">
        <td colspan="5">
            <div class="notes-content">
                <div class="notes-media-grid">
                    ${renderMediaItem("Video", record.encode, "No video available.")}
                    ${renderMediaItem("Commentary", record.commentary, "No commentary track available.")}
                </div>
                <div class="notes-header"><i class="fa-solid fa-book-open"></i> Author Notes</div>
                <div class="notes-body">${notesHtml || "<p><em>No author notes provided.</em></p>"}</div>
            </div>
        </td>
    </tr>`;
}

function buildJsonLd(record) {
    const videoId = getYouTubeId(record.encode?.href);
    const commentaryId = getYouTubeId(record.commentary?.href);

    const schemaGraph = [
        {
            "@type": "Person",
            "@id": "https://gmpranav.github.io/#author",
            "name": "GMP",
            "alternateName": "GMPranav",
            "url": "https://gmpranav.github.io/",
            "sameAs": [
                "https://www.youtube.com/@GMPranav",
                "https://tasvideos.org/Users/Profile/GMP",
                "https://www.speedrun.com/users/GMP",
                "https://github.com/GMPranav"
            ]
        },
        {
            "@type": "BreadcrumbList",
            "@id": `https://gmpranav.github.io/tool-assisted-runs/${record.slug}/#breadcrumbs`,
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": "https://gmpranav.github.io/"
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Tool-Assisted Speedruns",
                    "item": "https://gmpranav.github.io/tool-assisted-runs/"
                },
                {
                    "@type": "ListItem",
                    "position": 3,
                    "name": `${record.game} - ${record.branch} (${record.platform})`,
                    "item": `https://gmpranav.github.io/tool-assisted-runs/${record.slug}/`
                }
            ]
        },
        {
            "@type": "ItemPage",
            "@id": `https://gmpranav.github.io/tool-assisted-runs/${record.slug}/#webpage`,
            "url": `https://gmpranav.github.io/tool-assisted-runs/${record.slug}/`,
            "name": `[TAS] ${record.game} (${record.platform}) - ${record.branch} in ${record.time} by GMP`,
            "description": `Tool-Assisted Speedrun (TAS) of ${record.game} for ${record.platform} in ${record.time} (${record.branch}) by GMP. Full author notes, input movie files, and video encodes.`,
            "author": { "@id": "https://gmpranav.github.io/#author" },
            "breadcrumb": { "@id": `https://gmpranav.github.io/tool-assisted-runs/${record.slug}/#breadcrumbs` }
        }
    ];

    if (videoId) {
        schemaGraph.push({
            "@type": "VideoObject",
            "name": `[TAS] ${record.game} (${record.platform}) - ${record.branch} in ${record.time} by GMP`,
            "description": `Tool-Assisted Speedrun (TAS) of ${record.game} (${record.platform}) in ${record.time} by GMP. Category: ${record.branch}. Emulator: ${record.emulator}.`,
            "thumbnailUrl": `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            "uploadDate": "2023-01-01T00:00:00Z",
            "contentUrl": `https://www.youtube.com/watch?v=${videoId}`,
            "embedUrl": `https://www.youtube.com/embed/${videoId}`,
            "author": { "@id": "https://gmpranav.github.io/#author" }
        });
    }

    if (commentaryId) {
        schemaGraph.push({
            "@type": "VideoObject",
            "name": `[Commentary] ${record.game} (${record.platform}) - ${record.branch} TAS in ${record.time} by GMP`,
            "description": `Full audio commentary and technical breakdown for ${record.game} (${record.branch} TAS) by GMP.`,
            "thumbnailUrl": `https://i.ytimg.com/vi/${commentaryId}/hqdefault.jpg`,
            "uploadDate": "2023-01-01T00:00:00Z",
            "contentUrl": `https://www.youtube.com/watch?v=${commentaryId}`,
            "embedUrl": `https://www.youtube.com/embed/${commentaryId}`,
            "author": { "@id": "https://gmpranav.github.io/#author" }
        });
    }

    return JSON.stringify({ "@context": "https://schema.org", "@graph": schemaGraph }, null, 2);
}

function generateRunPageHtml(currentRecord, allRecords, notesHtmlMap) {
    const slug = currentRecord.slug;
    const pageTitle = `[TAS] ${currentRecord.game} (${currentRecord.platform}) - ${currentRecord.branch} in ${currentRecord.time} by GMP`;
    const metaDesc = `Tool-Assisted Speedrun (TAS) of ${currentRecord.game} for ${currentRecord.platform} in ${currentRecord.time} (${currentRecord.branch}) by GMP. Watch the official encode, audio commentary, download ${currentRecord.inputFile ? currentRecord.inputFile.label : 'movie'} input file, and read technical glitch breakdowns.`;
    const canonicalUrl = `https://gmpranav.github.io/tool-assisted-runs/${slug}/`;
    const jsonLd = buildJsonLd(currentRecord);

    const videoId = getYouTubeId(currentRecord.encode?.href);
    const ogImage = videoId
        ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
        : `https://avatars.githubusercontent.com/u/54983451?v=4`;

    // Render table rows: ONLY the active run gets a notes-row in the static HTML!
    // Inactive runs get only their lightweight tr row, avoiding code bloat & duplicate hidden iframes.
    let tableRowsHtml = "";
    for (const record of allRecords) {
        const isCurrent = record.slug === currentRecord.slug;
        tableRowsHtml += renderRowOnly(record, isCurrent) + "\n";
        if (isCurrent) {
            tableRowsHtml += renderActiveNotesRow(record, notesHtmlMap.get(record.slug)) + "\n";
        }
    }

    return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(pageTitle)}</title>

    <link rel="icon" href="https://avatars.githubusercontent.com/u/54983451?v=4" />
    <link rel="canonical" href="${canonicalUrl}" />
    <link rel="stylesheet" href="/tool-assisted-runs/style.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <link rel="stylesheet" href="/static/navbar.css" />
    <script src="/static/projects-data.js"></script>
    <script src="/static/navbar.js" defer></script>

    <!-- Open Graph / SEO -->
    <meta property="og:type" content="video.other" />
    <meta property="og:title" content="${escapeHtml(pageTitle)}" />
    <meta property="og:description" content="${escapeHtml(metaDesc)}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:image" content="${ogImage}" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(pageTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(metaDesc)}" />
    <meta name="twitter:image" content="${ogImage}" />

    <!-- Search Meta -->
    <meta name="description" content="${escapeHtml(metaDesc)}" />
    <meta name="keywords" content="${escapeHtml(currentRecord.game)}, ${escapeHtml(currentRecord.game)} TAS, Prince of Persia TAS, Tool-Assisted Speedrun, ${escapeHtml(currentRecord.branch)}, ${escapeHtml(currentRecord.platform)} speedrun, GMP, ${escapeHtml(currentRecord.emulator)}" />
    <meta name="author" content="GMP" />

    <!-- Structured Data (JSON-LD) for Google Video & AI Overviews -->
    <script type="application/ld+json">
${jsonLd}
    </script>

    <!-- Performance Hints -->
    <link rel="preconnect" href="https://avatars.githubusercontent.com" />
    <link rel="preconnect" href="https://i.ytimg.com" />
    <link rel="preconnect" href="https://www.youtube.com" />
</head>

<body>

    <gmp-navbar active="tas"></gmp-navbar>

    <header class="hero">
        <div class="wrap">
            <nav class="breadcrumbs" aria-label="Breadcrumbs">
                <a href="/">Home</a>
                <span class="sep">/</span>
                <a href="/tool-assisted-runs/">Tool-Assisted Speedruns</a>
                <span class="sep">/</span>
                <span>${escapeHtml(currentRecord.game)} (${escapeHtml(currentRecord.branch)})</span>
            </nav>
        </div>
        <div class="wrap hero-grid">
            <div>
                <h1><span id="handle">GMP</span> - <span id="hobby">Tool-Assisted Speedruns</span></h1>
                <p class="bio" id="bio">${escapeHtml(tasProfileData.profile.bio)}</p>
            </div>
        </div>
    </header>

    <main>
        <section class="records">
            <div class="wrap">
                <div class="section-head">
                    <h2>Completed projects</h2>
                    <span class="count" id="record-count">${allRecords.length} runs</span>
                </div>

                <table class="records-table">
                    <caption>Input files, encodes, notes and commentary tracks for every finished run. Click to expand each run for videos and detailed notes.</caption>
                    <thead>
                        <tr>
                            <th scope="col">Platform</th>
                            <th scope="col">Game</th>
                            <th scope="col">Time</th>
                            <th scope="col">Emulator</th>
                            <th scope="col">Input File</th>
                        </tr>
                    </thead>
                    <tbody id="records-body">
${tableRowsHtml}
                    </tbody>
                </table>
            </div>
        </section>
    </main>

    <footer>
        <div class="wrap">
            <a href="https://gmpranav.github.io/tool-assisted-runs/">GMP's Tool-Assisted Speedruns</a>
            &copy; 2021-2026 by <a href="https://www.youtube.com/@GMPranav">GMP</a>
            is licensed under <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>
        </div>
        <br>
        <div class="wrap">
            Both the page and input files are hosted in <a href="https://github.com/GMPranav/Tool-Assisted-Runs">GitHub</a>. All Encodes are hosted in <a href="https://www.youtube.com/@GMPranav">YouTube</a>.
        </div>
    </footer>

    <script type="module" src="/tool-assisted-runs/app.js"></script>
</body>

</html>`;
}

function generateHubIndexHtml(allRecords) {
    let tableRowsHtml = "";
    for (const record of allRecords) {
        tableRowsHtml += renderRowOnly(record, false) + "\n";
    }

    return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GMP's Tool-Assisted Speedruns</title>

    <link rel="icon" href="https://avatars.githubusercontent.com/u/54983451?v=4" />
    <link rel="canonical" href="https://gmpranav.github.io/tool-assisted-runs/" />
    <link rel="stylesheet" href="/tool-assisted-runs/style.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <link rel="stylesheet" href="/static/navbar.css" />
    <script src="/static/projects-data.js"></script>
    <script src="/static/navbar.js" defer></script>

    <!-- Open Graph -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="GMP's Tool-Assisted Speedruns">
    <meta property="og:description" content="A small bio and the archive of Tool-Assisted Speedruns developed by Prince of Persia speedrunner GMP. Includes movie files, commentary tracks, and technical notes.">
    <meta property="og:url" content="https://gmpranav.github.io/tool-assisted-runs/">
    <meta property="og:image" content="https://avatars.githubusercontent.com/u/54983451?v=4">

    <!-- Meta Tags -->
    <meta name="description" content="Archive of Tool-Assisted Speedruns (TAS) developed by Prince of Persia speedrunner GMP. Includes movie input files, YouTube video encodes, audio commentary tracks, and deep technical glitch notes.">
    <meta name="keywords" content="Tool-Assisted Speedrun, TAS, Prince of Persia TAS, Prince of Persia Sands of Time TAS, Prince of Persia speedrun, DOS speedrun, GMP speedrun, GMP Prince of Persia, TAS input files, movie files">
    <meta name="author" content="GMP">

    <!-- Performance Hints -->
    <link rel="preconnect" href="https://avatars.githubusercontent.com" />
    <link rel="preconnect" href="https://mirrors.creativecommons.org" crossorigin />
</head>

<body>

    <gmp-navbar active="tas"></gmp-navbar>

    <header class="hero">
        <div class="wrap hero-grid">
            <div>
                <h1><span id="handle">GMP</span> - <span id="hobby">Tool-Assisted Speedruns</span></h1>
                <p class="bio" id="bio">${escapeHtml(tasProfileData.profile.bio)}</p>
            </div>
        </div>
    </header>

    <main>
        <section class="records">
            <div class="wrap">
                <div class="section-head">
                    <h2>Completed projects</h2>
                    <span class="count" id="record-count">${allRecords.length} runs</span>
                </div>

                <table class="records-table">
                    <caption>Input files, encodes, notes and commentary tracks for every finished run. Click to expand each run for videos and detailed notes.</caption>
                    <thead>
                        <tr>
                            <th scope="col">Platform</th>
                            <th scope="col">Game</th>
                            <th scope="col">Time</th>
                            <th scope="col">Emulator</th>
                            <th scope="col">Input File</th>
                        </tr>
                    </thead>
                    <tbody id="records-body">
${tableRowsHtml}
                    </tbody>
                </table>
            </div>
        </section>
    </main>

    <footer>
        <div class="wrap">
            <a href="https://gmpranav.github.io/tool-assisted-runs/">GMP's Tool-Assisted Speedruns</a>
            &copy; 2021-2026 by <a href="https://www.youtube.com/@GMPranav">GMP</a>
            is licensed under <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>

            <img src="https://mirrors.creativecommons.org/presskit/icons/cc.svg" alt="" style="max-width: 1em;max-height:1em;margin-left: .2em;">
            <img src="https://mirrors.creativecommons.org/presskit/icons/by.svg" alt="" style="max-width: 1em;max-height:1em;margin-left: .2em;">
            <img src="https://mirrors.creativecommons.org/presskit/icons/sa.svg" alt="" style="max-width: 1em;max-height:1em;margin-left: .2em;">
        </div>
        <div class="wrap">
            What this means - You are free to share or modify any files I have provided here as long as you give appropriate credit with a link to this page, and distribute any modified versions under this exact same license.
        </div>
        <br>
        <div class="wrap">
            Both the page and input files are hosted in <a href="https://github.com/GMPranav/Tool-Assisted-Runs">GitHub</a>. All Encodes are hosted in <a href="https://www.youtube.com/@GMPranav">YouTube</a>.
        </div>
    </footer>

    <script type="module" src="/tool-assisted-runs/app.js"></script>
</body>

</html>`;
}

function updateSitemap(allRecords) {
    const sitemapPath = path.resolve(REPO_ROOT, "sitemap.xml");
    const today = new Date().toISOString().split("T")[0];

    const staticUrls = [
        { loc: "https://gmpranav.github.io/", changefreq: "weekly", priority: "1.0" },
        ...PROJECTS.map(p => ({
            loc: `https://gmpranav.github.io/${p.url}`,
            changefreq: p.sitemap?.changefreq || "monthly",
            priority: p.sitemap?.priority || "0.8"
        }))
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    for (const u of staticUrls) {
        xml += `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>\n`;
    }

    for (const r of allRecords) {
        const priority = r.game.includes("Sands of Time") ? "0.9" : "0.8";
        xml += `  <url>\n    <loc>https://gmpranav.github.io/tool-assisted-runs/${r.slug}/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${priority}</priority>\n  </url>\n`;
    }

    xml += `</urlset>\n`;
    fs.writeFileSync(sitemapPath, xml, "utf-8");
    console.log(`Updated sitemap.xml with ${allRecords.length} run pages.`);
}

async function main() {
    console.log("Loading completed projects and parsing notes...");
    const allRecords = tasProfileData.completedProjects;
    const notesHtmlMap = new Map();

    for (const record of allRecords) {
        let rawNotes = "";
        try {
            if (typeof record.notesLoader === "function") {
                rawNotes = await record.notesLoader();
            } else if (typeof record.notes === "function") {
                rawNotes = await record.notes();
            } else if (typeof record.notes === "string") {
                rawNotes = record.notes;
            }
        } catch (err) {
            console.warn(`Warning: failed to load notes for ${record.slug}:`, err.message);
        }

        const html = rawNotes ? parseMarkup(rawNotes) : "";
        notesHtmlMap.set(record.slug, html);
    }

    console.log("Generating dedicated static HTML pages for each run...");
    for (const record of allRecords) {
        const targetDir = path.resolve(TAR_DIR, record.slug);
        fs.mkdirSync(targetDir, { recursive: true });

        const html = generateRunPageHtml(record, allRecords, notesHtmlMap);
        fs.writeFileSync(path.resolve(targetDir, "index.html"), html, "utf-8");
        console.log(`  -> Generated tool-assisted-runs/${record.slug}/index.html`);
    }

    console.log("Generating tool-assisted-runs/index.html (hub)...");
    const hubHtml = generateHubIndexHtml(allRecords);
    fs.writeFileSync(path.resolve(TAR_DIR, "index.html"), hubHtml, "utf-8");

    console.log("Updating sitemap.xml...");
    updateSitemap(allRecords);

    console.log("Static page generation complete!");
}

main().catch(err => {
    console.error("Error in generate-runs.js:", err);
    process.exit(1);
});
