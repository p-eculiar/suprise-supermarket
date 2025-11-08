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
      primary: {
        main: string;
        light: string;
        dark: string;
        contrastText: string;
      };
      secondary: {
        main: string;
        light: string;
        dark: string;
        contrastText: string;
      };
      accent: {
        main: string;
        light: string;
        dark: string;
        contrastText: string;
      };
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
      status: {
        success: string;
        info: string;
        warning: string;
        error: string;
      };
      background: {
        default: string;
        paper: string;
        overlay: string;
      };
      text: {
        primary: string;
        secondary: string;
        disabled: string;
        hint: string;
        placeholder: string;
      };
      border: {
        light: string;
        main: string;
        dark: string;
        contrastText: string;
      };
    };
    spacing: (factor: number) => string;
    shadows: string[];
  }
}
