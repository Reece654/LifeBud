/*
  Theme.js holds all our design colours, fonts, and spacing in one class.
  Instead of repeating hex codes in every CSS file main.js creates one Theme and calls
  applyToPage() on load so our whole app shares the same colours and spacing.
  */

// builds one theme object holding every colour, font, spacing and layout value
// applyToPage() (below) is what actually pushes these onto the page, this just sets them up
class Theme {
  constructor() {
   
    /*
      This is our colour palette from our Figma design.
      Each maps to a CSS variable in getCssVariables().
      If we change primary here, login buttons etc. all update together because they use var(--color-primary) in components.css.
    */

    // font stacks for headings/logo text vs normal body text, with safe fallbacks if the first font isnt available
    this.colors = {
      primary: "#6E93C4",
      white: "#FFFFFF",
      panel: "#2E496D",
      muted: "rgba(201, 201, 201, 0.29)",
      background: "#233A59",
      accentLight: "#BFCDDF",
      backgroundDeep: "#1A2D45",
      border: "rgba(191, 205, 223, 0.45)",
      textMuted: "rgba(255, 255, 255, 0.75)",
      danger: "#C45C5C",
      priorityHigh: "#C45C5C",
      priorityMedium: "#C4A35C",
      priorityLow: "#5C9A6E"
    };

    this.fonts = {
      logo: '"Tahoma", "Segoe UI", sans-serif',
      body: '"Segoe UI", Tahoma, sans-serif'
    };
    // consistent gap sizes used for padding and margins across components.css
    this.spacing = {
      xs: "0.5rem",
      sm: "0.75rem",
      md: "1rem",
      lg: "1.5rem",
      xl: "2rem"
    };

    // corner rounding for cards, buttons, and panels
    this.radii = {
      sm: "8px",
      md: "12px",
      lg: "16px"
    };

    /*
      Layout widths. 
      Used in pages.css for the dashboard grid and max widths on auth cards.
      Keeping them in Theme means we can make changes to our three column layout in one place.
    */

    this.layout = {
      sidebarWidth: "200px",
      upcomingWidth: "260px",
      maxPageWidth: "1200px",
      maxAuthWidth: "420px",
      maxWelcomeWidth: "520px"
    };
  }

  /*
    getCssVariables builds the names our CSS files expect (--color-primary, etc.).
    applyToPage will loop this object onto document.documentElement.
  */

  getCssVariables() {
    const c = this.colors;

    return {
      "--color-primary": c.primary,
      "--color-white": c.white,
      "--color-panel": c.panel,
      "--color-muted": c.muted,
      "--color-background": c.background,
      "--color-accent-light": c.accentLight,
      "--color-background-deep": c.backgroundDeep,
      "--color-border": c.border,
      "--color-text-muted": c.textMuted,
      "--color-danger": c.danger,
      "--color-priority-high": c.priorityHigh,
      "--color-priority-medium": c.priorityMedium,
      "--color-priority-low": c.priorityLow,
      "--font-logo": this.fonts.logo,
      "--font-body": this.fonts.body,
      "--space-xs": this.spacing.xs,
      "--space-sm": this.spacing.sm,
      "--space-md": this.spacing.md,
      "--space-lg": this.spacing.lg,
      "--space-xl": this.spacing.xl,
      "--radius-sm": this.radii.sm,
      "--radius-md": this.radii.md,
      "--radius-lg": this.radii.lg,
      "--sidebar-width": this.layout.sidebarWidth,
      "--upcoming-width": this.layout.upcomingWidth,
      "--max-page-width": this.layout.maxPageWidth,
      "--max-auth-width": this.layout.maxAuthWidth,
      "--max-welcome-width": this.layout.maxWelcomeWidth
    };
  }

  /*
    applyToPage called from main.js on every page.
    THis will writes our theme onto the root element so var(--color-primary) works in all linked CSS.
  */

  applyToPage() {
    const root = document.documentElement;
    const variables = this.getCssVariables();

    // loops through each css variable and applies it to the page
    for (const name in variables) {
      root.style.setProperty(name, variables[name]);
    }
  }
}