/**
 * GMP Portfolio - Consolidated Projects & Categories Data Source
 * 
 * Single source of truth for:
 * 1. Home page project cards & category tabs (index.html)
 * 2. Navigation bar dropdowns, mobile drawer & featured nav links (navbar.js)
 * 3. Sitemap generator (scripts/generate-runs.js)
 * 
 * To add a new project: simply add an object to the PROJECTS array below.
 */

(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    // Node.js CommonJS
    module.exports = factory();
  } else {
    // Browser global
    root.GMP_PROJECTS_DATA = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {

  const CATEGORIES = [
    {
      id: "pop",
      label: "Prince of Persia",
      icon: "fa-solid fa-shield-halved",
      navbarHeader: "Prince of Persia"
    },
    {
      id: "utilities",
      label: "Speedrun Utilities",
      icon: "fa-solid fa-bolt",
      navbarHeader: "Speedrun Utilities"
    },
    {
      id: "apps",
      label: "Web Apps & Games",
      icon: "fa-solid fa-globe",
      navbarHeader: "Web Apps & Games"
    }
  ];

  const PROJECTS = [
    {
      id: "snf",
      title: "PoP: SnF Native PC Port",
      navTitle: "SnF Native PC Port",
      headerNavTitle: "SnF PC Port",
      url: "pop-snf-pc-bridge/",
      category: "pop",
      featured: true,
      featuredNav: true,
      featuredNavOrder: 1,
      icon: "fa-solid fa-fire",
      shortDesc: "PC Port of SnF Android/iOS remake",
      description: "Authentic native Windows x64 PC port of Prince of Persia: The Shadow and the Flame Android/iOS remake running via Dynarmic ARMv7 JIT dynamic binary retranslation, Desktop OpenGL, OpenAL Soft, and a dedicated launcher with an old-school theme.",
      actionText: "Explore PC Port",
      tags: [
        "prince of persia", "shadow and the flame", "snf", "pc port", "dynarmic",
        "armv7", "jit", "opengl", "openal", "sdl2", "launcher", "reverse engineering"
      ],
      sitemap: { changefreq: "weekly", priority: "0.9" }
    },
    {
      id: "tas",
      title: "Tool-Assisted Speedruns",
      navTitle: "TAS Archive",
      headerNavTitle: "TAS Archive",
      url: "tool-assisted-runs/",
      category: "pop",
      featured: true,
      featuredNav: true,
      featuredNavOrder: 2,
      icon: "fa-solid fa-gamepad",
      shortDesc: "Archive of my TAS movie files, notes",
      description: "Archive of completed TAS projects across classic Prince of Persia games and few others. Includes downloadable JRSR/movie input files, YouTube video encodes, audio commentary tracks, and technical notes.",
      actionText: "Explore TAS Archive",
      tags: [
        "prince of persia", "dos", "jpc-rr", "tas", "movie files", "speedrun",
        "commentary", "input files"
      ],
      sitemap: { changefreq: "weekly", priority: "0.9" }
    },
    {
      id: "puzzles",
      title: "PoP Puzzle Simulators",
      navTitle: "PoP Puzzle Simulators",
      url: "pop-puzzle-simulators/",
      category: "pop",
      featured: false,
      featuredNav: false,
      icon: "fa-solid fa-puzzle-piece",
      shortDesc: "Prince of Persia puzzles bruteforce solvers",
      description: "State-space puzzle simulators and bruteforce searchers for Prince of Persia speedruns, featuring interactive playable solvers for T2T King's Statue, TFS Water Pillar 3, and TFS Wii Gems.",
      actionText: "Play Simulators",
      tags: [
        "prince of persia", "puzzle simulators", "two thrones", "king statue",
        "forgotten sands", "water pillar", "wii gems", "bruteforce solver", "bfs", "c++"
      ],
      sitemap: { changefreq: "monthly", priority: "0.8" }
    },
    {
      id: "leaderboard",
      title: "PoP Series Leaderboard",
      navTitle: "PoP Series Leaderboard",
      url: "pop-series-leaderboard/",
      category: "pop",
      featured: false,
      featuredNav: false,
      icon: "fa-solid fa-trophy",
      shortDesc: "All-time franchise points ranking",
      description: "All-time franchise ranking and points algorithm across every Prince of Persia speedrun game and category, awarding cumulative points for every verified run ever performed on speedrun.com.",
      actionText: "View Series Leaderboard",
      tags: [
        "prince of persia", "series leaderboard", "speedrun points", "ranking",
        "all-time", "speedrun.com api", "python"
      ],
      sitemap: { changefreq: "weekly", priority: "0.8" }
    },
    {
      id: "splits",
      title: "Time Splits Generator",
      navTitle: "Time Splits Generator",
      headerNavTitle: "Time Splits Generator",
      url: "src-splits-generator/",
      category: "utilities",
      featured: true,
      featuredNav: true,
      featuredNavOrder: 3,
      icon: "fa-solid fa-stopwatch",
      shortDesc: "LiveSplit (.lss) markdown formatter",
      description: "Client-side parser for LiveSplit (.lss) files that automatically generates formatted Markdown timestamp tables for speedrun.com submission descriptions (splits.io replacement).",
      actionText: "Launch Splits Generator",
      tags: [
        "livesplit", "lss", "speedrun.com", "splits", "timestamps", "markdown generator", "utility tool"
      ],
      sitemap: { changefreq: "monthly", priority: "0.7" }
    },
    {
      id: "asls",
      title: "LiveSplit Auto Splitters (ASLs)",
      navTitle: "LiveSplit Auto Splitters",
      headerNavTitle: "ASLs",
      url: "asls/",
      category: "utilities",
      featured: true,
      featuredNav: true,
      featuredNavOrder: 4,
      icon: "fa-solid fa-bolt",
      shortDesc: "Raji, AppleWin, DOSBox-X IGT",
      description: "Collection of LiveSplit auto-splitter scripts (.asl) with memory scanning and automatic start, split, reset based on game state.",
      actionText: "Browse ASL Scripts",
      tags: [
        "livesplit", "asl", "auto splitter", "speedrun", "raji", "cell machine",
        "game inside a game", "applewin", "dosbox-x", "igt", "timing", "timer", "c#"
      ],
      sitemap: { changefreq: "monthly", priority: "0.8" }
    },
    {
      id: "srcdvd",
      title: "SRCDVD Video Auditor",
      navTitle: "SRCDVD Video Auditor",
      url: "srcdvd/",
      category: "utilities",
      featured: false,
      featuredNav: false,
      icon: "fa-solid fa-magnifying-glass",
      shortDesc: "Detect broken YouTube/Twitch runs",
      description: "Leaderboard audit utility combining speedrun.com REST API with Google YouTube API v3 and Twitch API to detect unviewable (deleted, private, or expired) run VODs across speedrun leaderboards.",
      actionText: "Inspect Video Auditor",
      tags: [
        "speedrun.com", "srcdvd", "deleted video detector", "youtube", "twitch",
        "api", "audit", "broken vods", "python"
      ],
      sitemap: { changefreq: "monthly", priority: "0.8" }
    },
    {
      id: "map",
      title: "UPSC Map Trainer",
      navTitle: "UPSC Map Trainer",
      url: "map-quiz/",
      category: "apps",
      featured: false,
      featuredNav: false,
      icon: "fa-solid fa-earth-americas",
      shortDesc: "Interactive political outline maps",
      description: "Interactive political outline maps for UPSC Civil Services Prelims. Practice naming countries by continent with instant green/red validation, mnemonics, straits, and mineral distributions.",
      actionText: "Launch Map Trainer",
      tags: [
        "upsc", "map reading", "political outline", "quiz", "civil services prelims",
        "geography", "mnemonics", "interactive", "d3"
      ],
      sitemap: { changefreq: "weekly", priority: "0.9" }
    },
    {
      id: "skong",
      title: "Silksong Timeline",
      navTitle: "Silksong Timeline",
      url: "skong-timeline/",
      category: "apps",
      featured: false,
      featuredNav: false,
      icon: "fa-solid fa-timeline",
      shortDesc: "Development news in absolute scale",
      description: "A timeline in absolute scale plotting all public info, trailers, Kickstarter blogs, and social media updates about the development of Hollow Knight: Silksong.",
      actionText: "View Silksong Timeline",
      tags: [
        "hollow knight", "silksong", "timeline", "team cherry", "news", "reddit",
        "absolute scale", "interactive"
      ],
      sitemap: { changefreq: "daily", priority: "0.9" }
    },
    {
      id: "tictactoe",
      title: "Tic-Tac-Toe",
      navTitle: "Tic-Tac-Toe",
      url: "tic-tac-toe/",
      category: "apps",
      featured: false,
      featuredNav: false,
      icon: "fa-solid fa-hashtag",
      shortDesc: "Responsive two-player mini game",
      description: "A clean, aesthetic two-player web implementation of the classic Tic-Tac-Toe game with dynamic turn indicators, state evaluation, and restart controls.",
      actionText: "Play Game",
      tags: [
        "tic tac toe", "game", "minigame", "javascript", "html", "css", "classic"
      ],
      sitemap: { changefreq: "yearly", priority: "0.5" }
    }
  ];

  return {
    CATEGORIES,
    PROJECTS
  };
});
