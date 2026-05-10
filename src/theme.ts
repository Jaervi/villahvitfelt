import { createTheme, MantineColorsTuple } from '@mantine/core';

const lightGreen: MantineColorsTuple = [
  '#ebfbee',
  '#d3f9d8',
  '#b2f2bb',
  '#8ce99a',
  '#69db7c',
  '#51cf66',
  '#40c057',
  '#37b24d',
  '#2f9e44',
  '#2b8a3e',
];

const forestGreen: MantineColorsTuple = [
  '#eaf2ea',
  '#cbdccb',
  '#aac5aa',
  '#89af89',
  '#689868',
  '#517c51',
  '#3f603f',
  '#2d452d',
  '#1c2b1c',
  '#0a110a',
];

export const theme = createTheme({
  primaryColor: 'forestGreen',
  primaryShade: { light: 8, dark: 7 },
  defaultRadius: 'md',
  white: '#e2e8e2', // Set global light-mode background color (grey-green)
  fontFamily: 'var(--font-geist-sans), sans-serif',
  headings: {
    fontFamily: 'var(--font-geist-sans), sans-serif',
    fontWeight: '800',
  },
  colors: {
    lightGreen,
    forestGreen,
  },
  components: {
    Container: {
      defaultProps: {
        size: 'xl',
      },
    },
    Paper: {
      defaultProps: {
        withBorder: true,
        shadow: 'sm',
      },
    },
    Title: {
      styles: {
        root: {
          color: 'var(--mantine-color-text)',
          letterSpacing: '-0.02em',
        },
      },
    },
    Button: {
      defaultProps: {
        fw: 700,
      },
    },
    Badge: {
      defaultProps: {
        variant: 'light',
      },
    },
  },
});
