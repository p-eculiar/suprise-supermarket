// Theme configuration based on the logo colors
export const theme = {
  breakpoints: {
    xs: '0px',
    sm: '600px',
    md: '960px',
    lg: '1280px',
    xl: '1920px',
  },
  colors: {
    // Text colors
    text: {
      primary: '#2D3436',
      secondary: '#636E72',
      disabled: '#B2BEC3',
      hint: '#74B9FF',
      placeholder: '#9CA3AF',
    },
    // Border colors
    border: {
      main: '#DFE6E9',
      light: '#F1F2F6',
      dark: '#B2BEC3',
      contrastText: '#2D3436',
    },
    // Primary colors from logo (60% - Bright Lime Green)
    primary: {
      main: '#B8E803',    // Bright Lime Green from logo
      light: '#D4FF3D',   // Lighter lime
      dark: '#8FBF00',    // Darker lime
      contrastText: '#1A1A1A'
    },
    secondary: {
      main: '#FF8C00',    // Orange from logo (30%)
      light: '#FFA040',   // Lighter orange
      dark: '#CC7000',    // Darker orange
      contrastText: '#FFFFFF'
    },
    accent: {
      main: '#2D7A2D',    // Dark Green from logo (10%)
      light: '#4CAF50',   // Lighter green
      dark: '#1B5E20',    // Darker green
      contrastText: '#FFFFFF',
      warning: '#FFC107',
      error: '#DC3545'
    },
    // Additional colors
    common: {
      white: '#FFFFFF',
      black: '#000000',
      gray: {
        50: '#F9FAFB',
        100: '#F5F7FA',
        200: '#E9ECEF',
        300: '#DEE2E6',
        400: '#ADB5BD',
        500: '#6C757D',
        600: '#495057',
        700: '#343A40',
        800: '#212529',
        900: '#121416'
      }
    },
    // Warning colors
    warning: {
      main: '#FFC107',
      light: '#FFE082',
      dark: '#FFA000',
      contrastText: '#000000'
    },
    // Grey colors (alternative spelling)
    grey: {
      50: '#F9FAFB',
      100: '#F5F7FA',
      200: '#E9ECEF',
      300: '#DEE2E6',
      400: '#ADB5BD',
      500: '#6C757D',
      600: '#495057',
      700: '#343A40',
      800: '#212529',
      900: '#121416'
    },
    // Error colors
    error: {
      main: '#DC3545',
      light: '#F8D7DA',
      dark: '#C82333',
      contrastText: '#FFFFFF'
    },
    // Success colors (using logo's dark green)
    success: {
      main: '#2D7A2D',
      light: '#C8E6C9',
      dark: '#1B5E20',
      contrastText: '#FFFFFF'
    },
    // Status colors (kept for backward compatibility)
    status: {
      success: '#2D7A2D',  // Updated to match logo green
      info: '#17A2B8',
      warning: '#FFC107',
      error: '#DC3545'
    },
    // Background colors
    background: {
      default: '#F8F9FA',
      paper: '#FFFFFF',
      light: '#F1F5F9',
      secondary: '#F5F7FA',
      overlay: 'rgba(0, 0, 0, 0.5)'
    }
  },
  typography: {
    fontFamily: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      fontFamily: '"Syne", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.25,
      fontFamily: '"Syne", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
      fontFamily: '"Syne", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.35,
      fontFamily: '"Syne", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
      fontFamily: '"Syne", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.45,
      fontFamily: '"Syne", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.57
    },
    button: {
      fontSize: '0.9375rem',
      fontWeight: 600,
      lineHeight: 1.5,
      textTransform: 'none'
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.66
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 600,
      lineHeight: 1.66,
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    }
  },
  shape: {
    borderRadius: 8,
    borderRadiusSm: 4,
    borderRadiusMd: 12,
    borderRadiusLg: 16,
    borderRadiusXl: 24
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '16px',
    xl: '24px',
    full: '9999px'
  },
  radii: {
    sm: '4px',
    md: '8px',
    lg: '16px',
    xl: '24px',
    full: '9999px'
  },
  fonts: {
    body: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    heading: '"Syne", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"Fira Code", "Courier New", monospace'
  },
  spacing: (...args: number[]) => {
    if (args.length === 1) return `${0.5 * args[0]}rem`;
    if (args.length === 2) return `${0.5 * args[0]}rem ${0.5 * args[1]}rem`;
    return args.map(arg => `${0.5 * arg}rem`).join(' ');
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    outline: '0 0 0 3px rgba(66, 153, 225, 0.5)'
  },
  transitions: {
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)'
    },
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195
    }
  },
  zIndex: {
    mobileStepper: 1000,
    speedDial: 1050,
    appBar: 1100,
    drawer: 1200,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500
  }
};

export type Theme = typeof theme;
