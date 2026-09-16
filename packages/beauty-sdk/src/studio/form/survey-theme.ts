/**
 * SurveyJS theme that maps onto the XG design tokens, applied via
 * `model.applyTheme(XG_SURVEY_THEME)`. The values are `var(--…)` references that
 * resolve against the host page's cascade, so the form follows the console's
 * light/dark theme automatically while keeping SurveyJS's own rendering.
 */
export const XG_SURVEY_THEME = {
  themeName: 'xg',
  colorPalette: 'dark',
  isPanelless: false,
  cssVariables: {
    '--sjs-font-family': 'var(--font-sans, ui-sans-serif, system-ui, sans-serif)',
    '--sjs-corner-radius': 'var(--radius, 0.625rem)',
    '--sjs-base-unit': '7px',

    // SurveyJS defaults run large (16px base). Tighten to console scale.
    '--sjs-font-size': '13px',
    '--sjs-font-questiontitle-size': '14px',
    '--sjs-font-questiondescription-size': '12px',
    '--sjs-font-editorfont-size': '13px',
    '--sjs-font-pagetitle-size': '15px',
    '--sjs-font-pagedescription-size': '12px',

    '--sjs-primary-backcolor': 'var(--primary)',
    '--sjs-primary-backcolor-light':
      'color-mix(in srgb, var(--primary) 16%, transparent)',
    '--sjs-primary-backcolor-dark':
      'color-mix(in srgb, var(--primary) 88%, #000)',
    '--sjs-primary-forecolor': 'var(--primary-foreground)',
    '--sjs-primary-forecolor-light':
      'color-mix(in srgb, var(--primary-foreground) 65%, transparent)',

    '--sjs-general-backcolor': 'var(--card)',
    '--sjs-general-backcolor-dark': 'color-mix(in srgb, var(--card) 90%, #000)',
    '--sjs-general-backcolor-dim': 'var(--background)',
    '--sjs-general-backcolor-dim-light': 'var(--muted)',
    '--sjs-general-backcolor-dim-dark':
      'color-mix(in srgb, var(--muted) 82%, #000)',

    '--sjs-general-forecolor': 'var(--foreground)',
    '--sjs-general-forecolor-light': 'var(--muted-foreground)',
    '--sjs-general-dim-forecolor': 'var(--foreground)',
    '--sjs-general-dim-forecolor-light': 'var(--muted-foreground)',

    '--sjs-border-default': 'var(--border)',
    '--sjs-border-light': 'color-mix(in srgb, var(--border) 60%, transparent)',

    '--sjs-shadow-small': 'none',
    '--sjs-shadow-medium': 'none',
    '--sjs-shadow-large': 'none',
    '--sjs-shadow-inner': 'none',
  },
} as const;
