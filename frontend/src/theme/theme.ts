import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#4f46e5' },
    secondary: { main: '#06b6d4' },
    background: { default: '#0b1220', paper: '#0f1a2e' },
    text: { primary: '#e5e7eb', secondary: '#9ca3af' },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
})

