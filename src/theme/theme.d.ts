import 'styled-components';

declare module 'styled-components' {
  // Type for spacing function
  type SpacingFunction = (factor: number) => string;
  
  // Shadow types
  type Shadow = 
    | 'none'
    | 'sm'
    | 'md'
    | 'lg'
    | 'xl'
    | '2xl'
    | 'inner'
    | 'outline'
    | string;

  export interface DefaultTheme {
    breakpoints: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    
    // Spacing function for consistent margins/paddings
    spacing: (...args: number[]) => string;
    colors: {
      // Text colors
      text: {
        primary: string;
        secondary: string;
        disabled: string;
        hint: string;
        placeholder?: string;
      };
      // Border colors
      border: {
        main: string;
        light: string;
        dark: string;
        contrastText: string;
      };
      // Primary colors
      primary: {
        main: string;
        light: string;
        dark: string;
        contrastText: string;
      };
      // Secondary colors
      secondary: {
        main: string;
        light: string;
        dark: string;
        contrastText: string;
      };
      // Accent colors
      accent: {
        main: string;
        light: string;
        dark: string;
        contrastText: string;
        warning: string;
        error: string;
      };
      // Background colors
      background: {
        default: string;
        paper: string;
        light: string;
        secondary: string;
        overlay: string;
      };
      // Common colors
      common: {
        white: string;
        black: string;
        gray: {
          50: string;
          100: string;
          200: string;
          300: string;
          400: string;
          500: string;
          600: string;
          700: string;
          800: string;
          900: string;
        };
      };
      // Warning colors
      warning: {
        main: string;
        light: string;
        dark: string;
        contrastText: string;
      };
      // Grey colors (alternative spelling)
      grey: {
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
      };
      // Error colors
      error: {
        main: string;
        light: string;
        dark: string;
        contrastText: string;
      };
      // Success colors
      success: {
        main: string;
        light: string;
        dark: string;
        contrastText: string;
      };
      // Status colors (kept for backward compatibility)
      status: {
        success: string;
        info: string;
        warning: string;
        error: string;
      };
    };
    
    // Typography
    typography: {
      fontFamily: string;
      h1: {
        fontSize: string;
        fontWeight: number;
        lineHeight: number;
      };
      h2: {
        fontSize: string;
        fontWeight: number;
        lineHeight: number;
      };
      h3: {
        fontSize: string;
        fontWeight: number;
        lineHeight: number;
      };
      h4: {
        fontSize: string;
        fontWeight: number;
        lineHeight: number;
      };
      h5: {
        fontSize: string;
        fontWeight: number;
        lineHeight: number;
      };
      h6: {
        fontSize: string;
        fontWeight: number;
        lineHeight: number;
      };
      body1: {
        fontSize: string;
        lineHeight: number;
      };
      body2: {
        fontSize: string;
        lineHeight: number;
      };
      button: {
        fontSize: string;
        fontWeight: number;
        lineHeight: number;
        textTransform: string;
      };
      caption: {
        fontSize: string;
        lineHeight: number;
      };
      overline: {
        fontSize: string;
        fontWeight: number;
        lineHeight: number;
        textTransform: string;
        letterSpacing: string;
      };
    };
    
    // Shape
    shape: {
      borderRadius: number;
      borderRadiusSm: number;
      borderRadiusMd: number;
      borderRadiusLg: number;
      borderRadiusXl: number;
    };
    
    // Border radius
    borderRadius: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
      full: string;
    };
    
    // Radii (alias for borderRadius)
    radii: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
      full: string;
    };
    
    // Fonts
    fonts: {
      body: string;
      heading: string;
      mono: string;
    };
    
    // Shadows
    shadows: {
      none: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
      inner: string;
      outline: string;
      [key: string]: string;
    };
    
    // Z-index
    zIndex: {
      mobileStepper: number;
      speedDial: number;
      appBar: number;
      drawer: number;
      modal: number;
      snackbar: number;
      tooltip: number;
    };
    
    // Transitions
    transitions: {
      duration: {
        shortest: number;
        shorter: number;
        short: number;
        standard: number;
        complex: number;
        enteringScreen: number;
        leavingScreen: number;
      };
      easing: {
        easeInOut: string;
        easeOut: string;
        easeIn: string;
        sharp: string;
      };
    };
  };
}
