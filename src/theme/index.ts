// Theme configuration based on the logo colors
export const theme = {
  colors: {
    // Primary colors from logo
    primary: {
      main: '#E67E22',    // Orange/Terracotta (60%)
      light: '#F39C12',   // Lighter shade
      dark: '#D35400',    // Darker shade
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: '#2C3E50',    // Navy Blue (30%)
      light: '#34495E',   // Lighter shade
      dark: '#1F2D3D',    // Darker shade
      contrastText: '#FFFFFF'
    },
    accent: {
      main: '#27AE60',    // Green (10%)
      light: '#2ECC71',   // Lighter shade
      dark: '#219653',    // Darker shade
      contrastText: '#FFFFFF'
    },
    // Additional colors
    common: {
      white: '#FFFFFF',
      black: '#000000',
      gray: {
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
    // Status colors
    status: {
      success: '#28A745',
      info: '#17A2B8',
      warning: '#FFC107',
      error: '#DC3545'
    },
    // Background colors
    background: {
      default: '#F8F9FA',
      paper: '#FFFFFF',
      overlay: 'rgba(0, 0, 0, 0.5)'
    }
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.25
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.35
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.45
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
  spacing: (factor: number) => `${0.5 * factor}rem`,
  shadows: [
    'none',
    '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  ],
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
} as const;

export type Theme = typeof theme;
