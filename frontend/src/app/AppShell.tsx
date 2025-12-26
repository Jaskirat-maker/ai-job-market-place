import type { PropsWithChildren } from 'react'
import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { clearTokens, getAccessToken } from '../lib/auth'

export function AppShell({ children }: PropsWithChildren) {
  const navigate = useNavigate()
  const isAuthed = Boolean(getAccessToken())

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" elevation={0} sx={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Toolbar>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{ color: 'text.primary', textDecoration: 'none', fontWeight: 700 }}
          >
            AI Market
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Button color="inherit" component={RouterLink} to="/projects">
            Projects
          </Button>
          <Button color="inherit" component={RouterLink} to="/leaderboard">
            Leaderboard
          </Button>
          <Box sx={{ width: 12 }} />
          {isAuthed ? (
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => {
                clearTokens()
                navigate('/login')
              }}
            >
              Logout
            </Button>
          ) : (
            <Button variant="contained" component={RouterLink} to="/login">
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {children}
      </Container>
    </Box>
  )
}

