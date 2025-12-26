import { Alert, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { setTokens } from '../lib/auth'
import type { AuthResponse } from '../lib/types'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('alice@example.com')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  return (
    <Paper variant="outlined" sx={{ p: 3, maxWidth: 520, mx: 'auto' }}>
      <Stack spacing={2}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Login
        </Typography>
        <Typography color="text.secondary">
          Use seeded users in dev: <b>alice@example.com</b> / <b>password123</b>
        </Typography>
        {error ? <Alert severity="error">{error}</Alert> : null}
        <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          variant="contained"
          disabled={loading}
          onClick={async () => {
            setError(null)
            setLoading(true)
            try {
              const res = await api.post<AuthResponse>('/api/auth/login', { email, password })
              setTokens(res.data)
              navigate('/')
            } catch (e: any) {
              setError(e?.response?.data?.message ?? 'Login failed')
            } finally {
              setLoading(false)
            }
          }}
        >
          Sign in
        </Button>
        <Button component={RouterLink} to="/register" color="inherit">
          Create an account
        </Button>
      </Stack>
    </Paper>
  )
}

