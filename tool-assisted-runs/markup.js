function generateHeadingId(text, usedIds = {}) {
    const clean = text.replace(/<[^>]+>/g, "");
    const words = clean.match(/[a-zA-Z0-9]+/g);
    let base = "section";
    if (words && words.length > 0) {
        base = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("");
    }
    const count = (usedIds[base] || 0) + 1;
    usedIds[base] = count;
    return count === 1 ? base : `${base}-${count}`;
}

function buildTocHtml(headings) {
    if (!headings || headings.length === 0) return "";

    let html = '<div class="toc-card"><div class="toc-header"><strong>Table of contents</strong></div><div class="toc-body">';

    let currentLevel = 0;

    for (const h of headings) {
        const level = h.level;

        if (currentLevel === 0) {
            html += "<ul>";
            currentLevel = level;
        } else if (level > currentLevel) {
            while (currentLevel < level) {
                html += "<ul>";
                currentLevel++;
            }
        } else if (level < currentLevel) {
            while (currentLevel > level) {
                html += "</li></ul>";
                currentLevel--;
            }
            html += "</li>";
        } else {
            html += "</li>";
        }

        html += `<li><a href="#${h.id}">${h.title}</a>`;
    }

    while (currentLevel > 0) {
        html += "</li></ul>";
        currentLevel--;
    }

    html += "</div></div>";
    return html;
}

// markup.js
export function parseMarkup(input) {
    if (!input) return "";

    let text = input;

    // Detect if Table of Contents is requested
    const hasToc = /%%TOC%%/i.test(text);
    const usedHeadingIds = {};
    const tocHeadings = [];

    function makeHeading(level, title) {
        const cleanTitle = title.trim();
        const id = generateHeadingId(cleanTitle, usedHeadingIds);
        if (hasToc) {
            tocHeadings.push({ level, title: cleanTitle, id });
        }
        return `<h${level} id="${id}">${cleanTitle}</h${level}>`;
    }

    // 1. Escape literal vertical bar placeholders [|] first
    text = text.replace(/\[\|\]/g, "%%ESCAPED_PIPE%%");

    // 2. Escape HTML special characters
    text = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    // 3. Line breaks & horizontal rules
    text = text.replace(/%%%/g, "<br>");
    text = text.replace(/^----+$/gm, "<hr>");

    // 4. Headings:
    // Wiki style (===, ==, =)
    text = text.replace(/^======\s*(.*?)\s*======$/gm, (_, t) => makeHeading(6, t));
    text = text.replace(/^=====\s*(.*?)\s*=====/gm, (_, t) => makeHeading(5, t));
    text = text.replace(/^====\s*(.*?)\s*====$/gm, (_, t) => makeHeading(4, t));
    text = text.replace(/^===\s*(.*?)\s*===$/gm, (_, t) => makeHeading(3, t));
    text = text.replace(/^==\s*(.*?)\s*==$/gm, (_, t) => makeHeading(2, t));
    text = text.replace(/^=\s*(.*?)\s*=$/gm, (_, t) => makeHeading(1, t));

    // Exclamation style (! to !!!!!!)
    text = text.replace(/^!!!!!!\s*(.*?)$/gm, (_, t) => makeHeading(6, t));
    text = text.replace(/^!!!!!\s*(.*?)$/gm, (_, t) => makeHeading(5, t));
    text = text.replace(/^!!!!\s*(.*?)$/gm, (_, t) => makeHeading(4, t));
    text = text.replace(/^!!!\s*(.*?)$/gm, (_, t) => makeHeading(2, t));
    text = text.replace(/^!!\s*(.*?)$/gm, (_, t) => makeHeading(3, t));
    text = text.replace(/^!\s*(.*?)$/gm, (_, t) => makeHeading(4, t));

    // Inject Table of Contents if present
    if (hasToc) {
        const tocHtml = buildTocHtml(tocHeadings);
        text = text.replace(/%%TOC%%/gi, tocHtml);
    }

    // 5. Blockquotes & Code
    text = text.replace(/\[quote=(.*?)\]([\s\S]*?)\[\/quote\]/gi, "<blockquote><cite>$1 wrote:</cite><p>$2</p></blockquote>");
    text = text.replace(/\[quote\]([\s\S]*?)\[\/quote\]/gi, "<blockquote><p>$1</p></blockquote>");
    text = text.replace(/\[code\]([\s\S]*?)\[\/code\]/gi, "<pre><code>$1</code></pre>");
    text = text.replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>");
    text = text.replace(/`([^`]+)`/g, "<code>$1</code>");

    // 6. Emphasis / Bold / Italic / Strike / Small / Sub / Sup
    text = text.replace(/'''''(.*?)'''''/g, "<strong><em>$1</em></strong>");
    text = text.replace(/'''(.*?)'''/g, "<strong>$1</strong>");
    text = text.replace(/''(.*?)''/g, "<em>$1</em>");
    text = text.replace(/__((?:[^\n_]|_[^_])+)__/g, "<strong>$1</strong>");
    text = text.replace(/~~(.*?)~~/g, "<del>$1</del>");
    text = text.replace(/---([^\n-]+)---/g, "<del>$1</del>");
    text = text.replace(/\{\{([^\n{}]+)\}\}/g, "<code>$1</code>");
    text = text.replace(/⸢([^\n⸢⸣]+)⸣/g, "<sup>$1</sup>");
    text = text.replace(/⸤([^\n⸤⸥]+)⸥/g, "<sub>$1</sub>");
    text = text.replace(/««([^\n«»]+)»»/g, "<q>$1</q>");

    // Handle nested small ((text))
    while (/\(\(([^\n()]+)\)\)/.test(text)) {
        text = text.replace(/\(\(([^\n()]+)\)\)/g, "<small>$1</small>");
    }

    // 7. Links & Reference Syntax
    // External links with label: [https://url|label] or [https://url label]
    text = text.replace(/\[(https?:\/\/[^\s\]|"\'<]+)(?:\s+|\|)([^\]]+)\]/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$2</a>');
    // External raw link in brackets: [https://url]
    text = text.replace(/\[(https?:\/\/[^\s\]|"\'<]+)\]/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');

    // Submissions: [1234S|label] or [1234S label] or [1234S]
    text = text.replace(/\[(\d+)S(?:\s+|\|)([^\]]+)\]/g, '<a href="https://tasvideos.org/$1S" target="_blank" rel="noopener noreferrer">$2</a>');
    text = text.replace(/\[(\d+)S\]/g, '<a href="https://tasvideos.org/$1S" target="_blank" rel="noopener noreferrer">#$1</a>');

    // Movies / Publications: [1234M|label] or [1234M] or [m:1234|label] or [m:1234]
    text = text.replace(/\[(\d+)M(?:\s+|\|)([^\]]+)\]/g, '<a href="https://tasvideos.org/$1M" target="_blank" rel="noopener noreferrer">$2</a>');
    text = text.replace(/\[(\d+)M\]/g, '<a href="https://tasvideos.org/$1M" target="_blank" rel="noopener noreferrer">Movie #$1</a>');
    text = text.replace(/\[m:(\d+)(?:\s+|\|)([^\]]+)\]/g, '<a href="https://tasvideos.org/$1M" target="_blank" rel="noopener noreferrer">$2</a>');
    text = text.replace(/\[m:(\d+)\]/g, '<a href="https://tasvideos.org/$1M" target="_blank" rel="noopener noreferrer">Publication #$1</a>');

    // Resources: [r:1234|label] or [r:1234]
    text = text.replace(/\[r:(\d+)(?:\s+|\|)([^\]]+)\]/g, '<a href="https://tasvideos.org/Resource/$1" target="_blank" rel="noopener noreferrer">$2</a>');
    text = text.replace(/\[r:(\d+)\]/g, '<a href="https://tasvideos.org/Resource/$1" target="_blank" rel="noopener noreferrer">Resource #$1</a>');

    // User profiles: [user:name|label] or [user:name]
    text = text.replace(/\[user:([a-zA-Z0-9_.-]+)(?:\s+|\|)([^\]]+)\]/g, '<a href="https://tasvideos.org/Users/Profile/$1" target="_blank" rel="noopener noreferrer">$2</a>');
    text = text.replace(/\[user:([a-zA-Z0-9_.-]+)\]/g, '<a href="https://tasvideos.org/Users/Profile/$1" target="_blank" rel="noopener noreferrer">$1</a>');

    // Internal paths: UserFiles, Forum, Games, GameResources, or prefix '='
    text = text.replace(/\[(?:=)?(UserFiles\/[a-zA-Z0-9_./#?=&%-]+)(?:\s+|\|)([^\]]+)\]/g, '<a href="https://tasvideos.org/$1" target="_blank" rel="noopener noreferrer">$2</a>');
    text = text.replace(/\[(?:=)?(UserFiles\/[a-zA-Z0-9_./#?=&%-]+)\]/g, '<a href="https://tasvideos.org/$1" target="_blank" rel="noopener noreferrer">$1</a>');
    text = text.replace(/\[(?:=)?(Forum\/[a-zA-Z0-9_./#?=&%-]+)(?:\s+|\|)([^\]]+)\]/g, '<a href="https://tasvideos.org/$1" target="_blank" rel="noopener noreferrer">$2</a>');
    text = text.replace(/\[(?:=)?(Forum\/[a-zA-Z0-9_./#?=&%-]+)\]/g, '<a href="https://tasvideos.org/$1" target="_blank" rel="noopener noreferrer">$1</a>');
    text = text.replace(/\[(?:=)?(Games\/[a-zA-Z0-9_./#?=&%-]+)(?:\s+|\|)([^\]]+)\]/g, '<a href="https://tasvideos.org/$1" target="_blank" rel="noopener noreferrer">$2</a>');
    text = text.replace(/\[(?:=)?(Games\/[a-zA-Z0-9_./#?=&%-]+)\]/g, '<a href="https://tasvideos.org/$1" target="_blank" rel="noopener noreferrer">$1</a>');
    text = text.replace(/\[(?:=)?(GameResources\/[a-zA-Z0-9_./#?=&%-]+)(?:\s+|\|)([^\]]+)\]/g, '<a href="https://tasvideos.org/$1" target="_blank" rel="noopener noreferrer">$2</a>');
    text = text.replace(/\[(?:=)?(GameResources\/[a-zA-Z0-9_./#?=&%-]+)\]/g, '<a href="https://tasvideos.org/$1" target="_blank" rel="noopener noreferrer">$1</a>');
    text = text.replace(/\[=([a-zA-Z0-9_./#?=&%-]+)(?:\s+|\|)([^\]]+)\]/g, '<a href="https://tasvideos.org/$1" target="_blank" rel="noopener noreferrer">$2</a>');
    text = text.replace(/\[=([a-zA-Z0-9_./#?=&%-]+)\]/g, '<a href="https://tasvideos.org/$1" target="_blank" rel="noopener noreferrer">$1</a>');

    // Autolink standalone raw URLs
    text = text.replace(/(^|[\s(])(https?:\/\/[^\s<)"']+)/g, '$1<a href="$2" target="_blank" rel="noopener noreferrer">$2</a>');

    // 8. Modules
    // YouTube Module: [module:youtube|v=CODE|w=WIDTH|h=HEIGHT|align=left/right/center|start=SECONDS|loop=SECONDS|hidelink]
    text = text.replace(/\[(?:module:)?youtube(?:\s*\|\s*([^\]]*))?\]/gi, (_, paramStr) => {
        if (!paramStr) return "";

        const params = {};
        const parts = paramStr.split("|");

        for (const part of parts) {
            const trimmed = part.trim();
            if (!trimmed) continue;
            const eqIdx = trimmed.indexOf("=");
            if (eqIdx !== -1) {
                const key = trimmed.slice(0, eqIdx).trim().toLowerCase();
                const val = trimmed.slice(eqIdx + 1).trim();
                params[key] = val;
            } else {
                const flag = trimmed.toLowerCase();
                if (flag === "hidelink") {
                    params.hidelink = true;
                } else if (flag === "left" || flag === "right" || flag === "center") {
                    params.align = flag;
                } else if (!params.v) {
                    params.v = trimmed;
                }
            }
        }

        let videoId = params.v || "";
        const urlMatch = videoId.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?.*v=|embed\/|v\/|shorts\/))([a-zA-Z0-9_-]+)/i);
        if (urlMatch) {
            videoId = urlMatch[1];
        } else {
            videoId = videoId.replace(/[^a-zA-Z0-9_-]/g, "");
        }

        if (!videoId) return "";

        const width = parseInt(params.w, 10) || 425;
        const height = parseInt(params.h, 10) || 370;
        const align = (params.align || "").toLowerCase();
        const hideLink = params.hidelink === true || params.hidelink === "1" || params.hidelink === "true" || params.hidelink === "yes";

        const query = [];
        if (params.start && !isNaN(parseInt(params.start, 10))) {
            query.push(`start=${parseInt(params.start, 10)}`);
        }
        if (params.loop && !isNaN(parseInt(params.loop, 10))) {
            query.push(`end=${parseInt(params.loop, 10)}`);
        } else if (params.end && !isNaN(parseInt(params.end, 10))) {
            query.push(`end=${parseInt(params.end, 10)}`);
        }

        const queryString = query.length > 0 ? `?${query.join("&amp;")}` : "";
        const embedUrl = `https://www.youtube.com/embed/${encodeURIComponent(videoId)}${queryString}`;
        const watchUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;

        let alignClass = "";
        if (align === "left") alignClass = " align-left";
        else if (align === "right") alignClass = " align-right";
        else if (align === "center") alignClass = " align-center";

        let html = `<div class="youtube-embed${alignClass}" style="max-width: ${width}px;">`;
        html += `<div class="youtube-video" style="aspect-ratio: ${width} / ${height};">`;
        html += `<iframe src="${embedUrl}" width="${width}" height="${height}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen loading="lazy"></iframe>`;
        html += `</div>`;

        if (!hideLink) {
            html += `<div class="youtube-link"><a href="${watchUrl}" target="_blank" rel="noopener noreferrer">Watch on YouTube</a></div>`;
        }
        html += `</div>`;

        return html;
    });

    // 9. Table Row Parser Helper
    function parseTableRow(line) {
        if (!line.startsWith("|")) return null;

        const cells = [];
        let i = 0;
        let isHeader = false;

        if (line.startsWith("||")) {
            isHeader = true;
            i = 2;
        } else {
            isHeader = false;
            i = 1;
        }

        let currentCell = "";
        let bracketDepth = 0;

        while (i < line.length) {
            const char = line[i];
            const nextChar = line[i + 1];

            if (char === "<" && line.slice(i).startsWith("<a ")) {
                // Inside an anchor tag generated earlier
                const closeA = line.indexOf("</a>", i);
                if (closeA !== -1) {
                    currentCell += line.slice(i, closeA + 4);
                    i = closeA + 4;
                    continue;
                }
            }

            if (char === "[") {
                bracketDepth++;
                currentCell += char;
                i++;
            } else if (char === "]" && bracketDepth > 0) {
                bracketDepth--;
                currentCell += char;
                i++;
            } else if (bracketDepth === 0 && char === "|" && nextChar === "|") {
                cells.push({ isHeader, content: currentCell });
                currentCell = "";
                isHeader = true;
                i += 2;
            } else if (bracketDepth === 0 && char === "|") {
                cells.push({ isHeader, content: currentCell });
                currentCell = "";
                isHeader = false;
                i += 1;
            } else {
                currentCell += char;
                i++;
            }
        }

        if (currentCell.trim().length > 0) {
            cells.push({ isHeader, content: currentCell });
        }

        return cells;
    }

    // 10. Line-by-line block generation
    const lines = text.split("\n");
    const output = [];
    let listStack = []; // Array of 'ul' | 'ol'
    let paragraphBuffer = [];
    let tableRows = [];

    function flushParagraph() {
        if (paragraphBuffer.length > 0) {
            output.push("<p>" + paragraphBuffer.join("<br>") + "</p>");
            paragraphBuffer = [];
        }
    }

    function closeLists() {
        while (listStack.length > 0) {
            const type = listStack.pop();
            output.push(`</${type}>`);
        }
    }

    function flushTable() {
        if (tableRows.length === 0) return;

        let html = '<div class="table-wrap"><table><tbody>';
        for (const row of tableRows) {
            html += "<tr>";
            for (const cell of row) {
                const tag = cell.isHeader ? "th" : "td";
                const cellHtml = cell.content.trim().replace(/%%ESCAPED_PIPE%%/g, "|");
                html += `<${tag}>${cellHtml}</${tag}>`;
            }
            html += "</tr>";
        }
        html += "</tbody></table></div>";
        output.push(html);
        tableRows = [];
    }

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (!line) {
            flushParagraph();
            closeLists();
            flushTable();
            continue;
        }

        // Table lines starting with '|'
        if (line.startsWith("|")) {
            flushParagraph();
            closeLists();
            const cells = parseTableRow(line);
            if (cells && cells.length > 0) {
                tableRows.push(cells);
            }
            continue;
        }

        // Not a table line, so flush any pending table
        flushTable();

        // Check if line is a Heading or other block element
        if (/^<(h[1-6]|blockquote|pre|div|hr)/i.test(line)) {
            flushParagraph();
            closeLists();
            output.push(line);
            continue;
        }

        // Check for blockquote lines: > quote or &gt; quote
        const bqMatch = line.match(/^(?:&gt;|>)\s*(.*)$/);
        if (bqMatch) {
            flushParagraph();
            closeLists();
            output.push(`<blockquote><p>${bqMatch[1]}</p></blockquote>`);
            continue;
        }

        // Check for definition lists: ;Term:Definition
        const defMatch = line.match(/^;([^:]+):(.*)$/);
        if (defMatch) {
            flushParagraph();
            closeLists();
            output.push(`<dl><dt>${defMatch[1].trim()}</dt><dd>${defMatch[2].trim()}</dd></dl>`);
            continue;
        }

        // Check for bullet lists (*) or numbered lists (#)
        const bulletMatch = line.match(/^(\*+)\s*(.*)$/);
        const numberMatch = line.match(/^(#+)\s*(.*)$/);

        if (bulletMatch || numberMatch) {
            flushParagraph();
            const match = bulletMatch || numberMatch;
            const level = match[1].length;
            const content = match[2];
            const listType = bulletMatch ? "ul" : "ol";

            // Adjust stack depth
            while (listStack.length < level) {
                listStack.push(listType);
                output.push(`<${listType}>`);
            }
            while (listStack.length > level) {
                const closingType = listStack.pop();
                output.push(`</${closingType}>`);
            }

            // If same level but different type, switch
            if (listStack.length > 0 && listStack[listStack.length - 1] !== listType) {
                const oldType = listStack.pop();
                output.push(`</${oldType}>`);
                listStack.push(listType);
                output.push(`<${listType}>`);
            }

            output.push(`<li>${content}</li>`);
            continue;
        }

        // Regular prose lines
        closeLists();
        paragraphBuffer.push(line.replace(/%%ESCAPED_PIPE%%/g, "|"));
    }

    flushParagraph();
    closeLists();
    flushTable();

    return output.join("");
}