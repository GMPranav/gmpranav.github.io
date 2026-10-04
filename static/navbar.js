/**
 * GMP Portfolio - Uniform Reusable Navbar Component
 * Standard Web Component: <gmp-navbar></gmp-navbar>
 */

(function () {
  // Determine site root path dynamically based on script location
  let rootPath = "/";
  if (document.currentScript && document.currentScript.src) {
    try {
      rootPath = new URL("../", document.currentScript.src).href;
    } catch (e) {
      rootPath = "/";
    }
  }

  // Helper to resolve links relative to the site root
  function resolveUrl(relativePath) {
    if (!relativePath) return rootPath;
    if (relativePath.startsWith("http://") || relativePath.startsWith("https://")) {
      return relativePath;
    }
    // Clean leading slash
    const cleanRel = relativePath.replace(/^\/+/, "");
    try {
      return new URL(cleanRel, rootPath).href;
    } catch (e) {
      return rootPath + cleanRel;
    }
  }

  function escapeHtml(str) {
    if (str == null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Detect active page key dynamically from projects list
  function detectActiveKey(projects, explicitKey) {
    if (explicitKey) return explicitKey;
    const path = window.location.pathname.toLowerCase();
    if (projects && projects.length) {
      for (const p of projects) {
        const cleanUrl = (p.url || "").replace(/\/+$/, "").toLowerCase();
        if (cleanUrl && path.includes("/" + cleanUrl)) {
          return p.id;
        }
      }
    }
    if (path.includes("pop_series_leaderboard") || path.includes("pop-series-leaderboard")) return "leaderboard";
    return "home";
  }

  function buildDesktopNavHtml(projects, categories, activeKey, resolveUrl) {
    const featuredNavItems = projects
      .filter(p => p.featuredNav)
      .sort((a, b) => (a.featuredNavOrder || 99) - (b.featuredNavOrder || 99));

    const featuredLinksHtml = featuredNavItems.map(p => `
      <li class="gmp-nav-item" role="none">
        <a href="${resolveUrl(p.url)}" class="gmp-nav-link ${activeKey === p.id ? 'active' : ''}" role="menuitem">${escapeHtml(p.headerNavTitle || p.navTitle || p.title)}</a>
      </li>
    `).join("");

    const dropdownCategoriesHtml = categories.map(cat => {
      const catProjects = projects.filter(p => p.category === cat.id);
      if (catProjects.length === 0) return "";
      const itemsHtml = catProjects.map(p => `
        <a href="${resolveUrl(p.url)}" class="gmp-dropdown-item ${activeKey === p.id ? 'active' : ''}" role="menuitem">
          <span class="gmp-dropdown-icon"><i class="${escapeHtml(p.icon)}"></i></span>
          <div class="gmp-dropdown-text">
            <span class="gmp-dropdown-title">${escapeHtml(p.navTitle || p.title)}</span>
            <span class="gmp-dropdown-desc">${escapeHtml(p.shortDesc || "")}</span>
          </div>
        </a>
      `).join("");

      return `
        <div class="gmp-dropdown-header">${escapeHtml(cat.navbarHeader || cat.label)}</div>
        ${itemsHtml}
      `;
    }).join("");

    return `
      <ul class="gmp-nav-links" id="gmpNavDefaultLinks" role="menubar">
        <li class="gmp-nav-item" role="none">
          <a href="${resolveUrl("")}" class="gmp-nav-link ${activeKey === 'home' ? 'active' : ''}" role="menuitem">Home</a>
        </li>
        ${featuredLinksHtml}

        <!-- Projects & Tools Dropdown -->
        <li class="gmp-nav-item has-dropdown" role="none">
          <button type="button" class="gmp-nav-link dropdown-toggle" aria-haspopup="true" aria-expanded="false" role="menuitem">
            <span>Projects</span>
            <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          <div class="gmp-nav-dropdown" role="menu" aria-label="Projects Menu">
            ${dropdownCategoriesHtml}
          </div>
        </li>
      </ul>
    `;
  }

  function buildMobileMenuHtml(projects, activeKey, resolveUrl) {
    const itemsHtml = projects.map(p => `
      <li><a href="${resolveUrl(p.url)}" class="${activeKey === p.id ? 'active' : ''}"><i class="${escapeHtml(p.icon)}"></i> ${escapeHtml(p.navTitle || p.title)}</a></li>
    `).join("");

    return `
      <ul class="gmp-mobile-menu">
        <li><a href="${resolveUrl("")}" class="${activeKey === 'home' ? 'active' : ''}"><i class="fa-solid fa-house"></i> Home / Portfolio</a></li>
        ${itemsHtml}
      </ul>
    `;
  }

  class GMPNavbar extends HTMLElement {
    // Normalize string HTML or Node into a DocumentFragment or Node
    _normalizeNode(item) {
      if (typeof item === "string") {
        const template = document.createElement("template");
        template.innerHTML = item.trim();
        return template.content;
      }
      return item;
    }

    // Public method: access a slot container ('left', 'center', 'right', 'custom', 'default-links')
    getSlot(name) {
      if (name === "left" || name === "left-extra") return this.querySelector("#gmpNavLeftExtra");
      if (name === "center" || name === "custom") return this.querySelector("#gmpNavCustomCenter");
      if (name === "right" || name === "actions") return this.querySelector("#gmpNavCustomRight");
      if (name === "default-links") return this.querySelector("#gmpNavDefaultLinks");
      return null;
    }

    // Public method: toggle visibility of default desktop portfolio links
    hideDefaultLinks(hide = true) {
      const defaultLinks = this.querySelector("#gmpNavDefaultLinks");
      if (defaultLinks) {
        defaultLinks.style.display = hide ? "none" : "";
      }
    }

    // Public method: add an element or HTML string to the left extra area (next to brand)
    addLeftItem(item) {
      const container = this.querySelector("#gmpNavLeftExtra");
      if (!container) return null;
      const node = this._normalizeNode(item);
      container.appendChild(node);
      return container.lastElementChild;
    }

    // Public method: set / replace the center area content
    setCenterContent(item, hideDefaultLinks = true) {
      const container = this.querySelector("#gmpNavCustomCenter");
      if (!container) return null;
      container.innerHTML = "";
      if (item) {
        const node = this._normalizeNode(item);
        container.appendChild(node);
      }
      if (hideDefaultLinks) {
        this.hideDefaultLinks(true);
      }
      return container;
    }

    // Public method: append an element or HTML string to the center area
    addCenterItem(item) {
      const container = this.querySelector("#gmpNavCustomCenter");
      if (!container) return null;
      const node = this._normalizeNode(item);
      container.appendChild(node);
      return container.lastElementChild;
    }

    // Public method: add an element or HTML string to the right action bar (before socials)
    addRightItem(item) {
      const container = this.querySelector("#gmpNavCustomRight");
      if (!container) return null;
      const node = this._normalizeNode(item);
      container.appendChild(node);
      return container.lastElementChild;
    }

    // Public method: clear custom content from all slots and restore default links
    clearCustomContent() {
      const left = this.querySelector("#gmpNavLeftExtra");
      const center = this.querySelector("#gmpNavCustomCenter");
      const right = this.querySelector("#gmpNavCustomRight");
      if (left) left.innerHTML = "";
      if (center) center.innerHTML = "";
      if (right) right.innerHTML = "";
      this.hideDefaultLinks(false);
    }

    connectedCallback() {
      if (this.dataset.rendered) return;
      this.dataset.rendered = "true";

      // Ensure stylesheet is loaded
      const styleId = "gmp-navbar-styles";
      if (!document.getElementById(styleId)) {
        const link = document.createElement("link");
        link.id = styleId;
        link.rel = "stylesheet";
        link.href = resolveUrl("static/navbar.css");
        document.head.appendChild(link);
      }

      // Ensure Font Awesome 6 is loaded
      const faStyleId = "gmp-font-awesome";
      if (!document.getElementById(faStyleId)) {
        const faLink = document.createElement("link");
        faLink.id = faStyleId;
        faLink.rel = "stylesheet";
        faLink.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css";
        document.head.appendChild(faLink);
      }

      // Preserve any declarative slot children provided in light DOM before overwriting innerHTML
      const initialLeftSlots = Array.from(this.querySelectorAll(':scope > [slot="left"], :scope > [slot="left-extra"]'));
      const initialCenterSlots = Array.from(this.querySelectorAll(':scope > [slot="center"], :scope > [slot="custom"]'));
      const initialRightSlots = Array.from(this.querySelectorAll(':scope > [slot="right"], :scope > [slot="actions"]'));

      const renderNav = (data) => {
        const categories = (data && data.CATEGORIES) || [];
        const projects = (data && data.PROJECTS) || [];
        const activeKey = detectActiveKey(projects, this.getAttribute("active"));

        const desktopNavHtml = buildDesktopNavHtml(projects, categories, activeKey, resolveUrl);
        const mobileMenuHtml = buildMobileMenuHtml(projects, activeKey, resolveUrl);

        this.innerHTML = `
          <div class="gmp-nav-wrapper">
            <!-- Left Section: Brand & Optional Subtitle/Badge -->
            <div class="gmp-nav-left">
              <a href="${resolveUrl("")}" class="gmp-nav-brand" aria-label="GMP Portfolio Home">
                <img src="https://avatars.githubusercontent.com/u/54983451?v=4" alt="GMP Avatar" class="gmp-nav-avatar" width="34" height="34" />
                <div class="gmp-nav-brand-title">
                  <span class="gmp-gold">GMP</span>
                  <span class="gmp-dim">Portfolio</span>
                </div>
              </a>
              <div class="gmp-nav-left-extra" id="gmpNavLeftExtra"></div>
            </div>

            <!-- Center Section: Default Nav Links OR Custom Center Content -->
            <div class="gmp-nav-center" id="gmpNavCenter">
              ${desktopNavHtml}
              <div class="gmp-nav-custom-center" id="gmpNavCustomCenter"></div>
            </div>

            <!-- Right Socials & Mobile Toggle -->
            <div class="gmp-nav-actions" id="gmpNavActions">
              <div class="gmp-nav-custom-right" id="gmpNavCustomRight"></div>

              <div class="gmp-nav-socials-group">
                <a href="https://github.com/GMPranav" class="gmp-nav-social" target="_blank" rel="noopener noreferrer" aria-label="GMP on GitHub" title="GitHub">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                </a>
                <a href="https://www.youtube.com/@GMPranav" class="gmp-nav-social" target="_blank" rel="noopener noreferrer" aria-label="GMP on YouTube" title="YouTube">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                <a href="https://www.speedrun.com/users/GMP" class="gmp-nav-social" target="_blank" rel="noopener noreferrer" aria-label="GMP on speedrun.com" title="speedrun.com">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.8 2.7 3.28 3.32V19H8v2h8v-2h-2.67v-2.74c1.48-.62 2.65-1.82 3.28-3.32C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
                  </svg>
                </a>
              </div>

              <!-- Mobile Hamburger Button -->
              <button class="gmp-nav-toggle" id="gmpNavToggle" aria-label="Toggle navigation menu" aria-expanded="false">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          <!-- Mobile Drawer -->
          <div class="gmp-mobile-drawer" id="gmpMobileDrawer" aria-hidden="true">
            ${mobileMenuHtml}

            <div class="gmp-mobile-socials">
              <a href="https://github.com/GMPranav" class="gmp-nav-social" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <svg viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              </a>
              <a href="https://www.youtube.com/@GMPranav" class="gmp-nav-social" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <svg viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a href="https://www.speedrun.com/users/GMP" class="gmp-nav-social" target="_blank" rel="noopener noreferrer" aria-label="speedrun.com">
                <svg viewBox="0 0 24 24"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.8 2.7 3.28 3.32V19H8v2h8v-2h-2.67v-2.74c1.48-.62 2.65-1.82 3.28-3.32C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/></svg>
              </a>
            </div>
          </div>
        `;

        // Mount slot children
        const leftContainer = this.querySelector("#gmpNavLeftExtra");
        const centerContainer = this.querySelector("#gmpNavCustomCenter");
        const rightContainer = this.querySelector("#gmpNavCustomRight");

        if (leftContainer && initialLeftSlots.length > 0) {
          initialLeftSlots.forEach(el => leftContainer.appendChild(el));
        }
        if (centerContainer && initialCenterSlots.length > 0) {
          initialCenterSlots.forEach(el => centerContainer.appendChild(el));
          this.hideDefaultLinks(true);
        }
        if (rightContainer && initialRightSlots.length > 0) {
          initialRightSlots.forEach(el => rightContainer.appendChild(el));
        }

        this.initEvents();
      };

      if (window.GMP_PROJECTS_DATA) {
        renderNav(window.GMP_PROJECTS_DATA);
      } else {
        const scriptId = "gmp-projects-data-script";
        let script = document.getElementById(scriptId);
        if (!script) {
          script = document.createElement("script");
          script.id = scriptId;
          script.src = resolveUrl("static/projects-data.js");
          document.head.appendChild(script);
        }
        script.addEventListener("load", () => {
          renderNav(window.GMP_PROJECTS_DATA);
        });
        // Graceful fallback
        setTimeout(() => {
          if (!this.querySelector(".gmp-nav-wrapper")) {
            renderNav(window.GMP_PROJECTS_DATA || { CATEGORIES: [], PROJECTS: [] });
          }
        }, 500);
      }
    }

    initEvents() {
      const toggle = this.querySelector("#gmpNavToggle");
      const drawer = this.querySelector("#gmpMobileDrawer");
      const dropdownBtn = this.querySelector(".dropdown-toggle");
      const dropdownParent = dropdownBtn ? dropdownBtn.closest(".gmp-nav-item") : null;

      if (toggle && drawer) {
        toggle.addEventListener("click", () => {
          const isOpen = drawer.classList.toggle("open");
          toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
          drawer.setAttribute("aria-hidden", isOpen ? "false" : "true");
        });
      }

      if (dropdownParent) {
        let closeTimer = null;

        const openMenu = () => {
          if (closeTimer) {
            clearTimeout(closeTimer);
            closeTimer = null;
          }
          dropdownParent.classList.add("open");
          if (dropdownBtn) dropdownBtn.setAttribute("aria-expanded", "true");
        };

        const closeMenu = (immediate = false) => {
          if (closeTimer) {
            clearTimeout(closeTimer);
            closeTimer = null;
          }
          if (immediate) {
            dropdownParent.classList.remove("open");
            if (dropdownBtn) dropdownBtn.setAttribute("aria-expanded", "false");
          } else {
            closeTimer = setTimeout(() => {
              dropdownParent.classList.remove("open");
              if (dropdownBtn) dropdownBtn.setAttribute("aria-expanded", "false");
              closeTimer = null;
            }, 280);
          }
        };

        dropdownParent.addEventListener("mouseenter", () => openMenu());
        dropdownParent.addEventListener("mouseleave", () => closeMenu(false));

        dropdownParent.addEventListener("focusin", () => openMenu());
        dropdownParent.addEventListener("focusout", (e) => {
          if (!dropdownParent.contains(e.relatedTarget)) {
            closeMenu(true);
          }
        });

        if (dropdownBtn) {
          dropdownBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (dropdownParent.classList.contains("open")) {
              closeMenu(true);
            } else {
              openMenu();
            }
          });
        }

        dropdownParent.querySelectorAll(".gmp-dropdown-item").forEach((item) => {
          item.addEventListener("click", () => {
            closeMenu(true);
          });
        });

        // Close dropdown or mobile menu when clicking outside
        document.addEventListener("click", (e) => {
          if (!dropdownParent.contains(e.target)) {
            closeMenu(true);
          }
          if (drawer && toggle && !this.contains(e.target)) {
            drawer.classList.remove("open");
            toggle.setAttribute("aria-expanded", "false");
            drawer.setAttribute("aria-hidden", "true");
          }
        });

        // Close on Escape key
        document.addEventListener("keydown", (e) => {
          if (e.key === "Escape") {
            closeMenu(true);
            if (drawer && toggle) {
              drawer.classList.remove("open");
              toggle.setAttribute("aria-expanded", "false");
              drawer.setAttribute("aria-hidden", "true");
            }
          }
        });
      } else {
        // Fallback outside click listener if no dropdownParent
        document.addEventListener("click", (e) => {
          if (drawer && toggle && !this.contains(e.target)) {
            drawer.classList.remove("open");
            toggle.setAttribute("aria-expanded", "false");
            drawer.setAttribute("aria-hidden", "true");
          }
        });

        document.addEventListener("keydown", (e) => {
          if (e.key === "Escape" && drawer && toggle) {
            drawer.classList.remove("open");
            toggle.setAttribute("aria-expanded", "false");
            drawer.setAttribute("aria-hidden", "true");
          }
        });
      }
    }
  }

  // Register Custom Element
  if (!customElements.get("gmp-navbar")) {
    customElements.define("gmp-navbar", GMPNavbar);
  }
})();
