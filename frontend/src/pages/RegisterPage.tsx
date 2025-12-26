import { Alert, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { setTokens } from '../lib/auth'
import type { AuthResponse } from '../lib/types'

export function RegisterPage() {
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  return (
    <Paper variant="outlined" sx={{ p: 3, maxWidth: 520, mx: 'auto' }}>
      <Stack spacing={2}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Create account
        </Typography>
        {error ? <Alert severity="error">{error}</Alert> : null}
        <TextField label="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          helperText="At least 8 characters"
        />
        <Button
          variant="contained"
          disabled={loading}
          onClick={async () => {
            setError(null)
            setLoading(true)
            try {
              const res = await api.post<AuthResponse>('/api/auth/register', { email, displayName, password })
              setTokens(res.data)
              navigate('/')
            } catch (e: any) {
              setError(e?.response?.data?.message ?? 'Registration failed')
            } finally {
              setLoading(false)
            }
          }}
        >
          Sign up
        </Button>
        <Button component={RouterLink} to="/login" color="inherit">
          Back to login
        </Button>
      </Stack>
    </Paper>
  )
}

