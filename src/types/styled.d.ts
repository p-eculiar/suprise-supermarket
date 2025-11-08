import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    breakpoints: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    colors: {
      // Text colors
      text: {
        primary: string;
        secondary: string;
        disabled: string;
        hint: string;
      };
      // Border colors
      border: {
        main: string;
        light: string;
        dark: string;
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
      };
      // Common colors
      common: {
        white: string;
        black: string;
        gray: {
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
      // Background colors
      background: {
        default: string;
        paper: string;
        overlay: string;
      };
    };
    spacing: (factor: number) => string;
    shape: {
      borderRadius: number;
      borderRadiusSm: number;
      borderRadiusMd: number;
      borderRadiusLg: number;
    };
    shadows: string[];
    // Add any other theme properties that might be missing
    [key: string]: any; // This allows for additional properties
  }
}
