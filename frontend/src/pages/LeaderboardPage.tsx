import { Paper, Stack, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { env } from '../lib/env'
import { demo } from '../lib/demoData'
import type { LeaderboardRow } from '../lib/types'

export function LeaderboardPage() {
  const q = useQuery({
    queryKey: ['leaderboard', 20, env.demoMode],
    queryFn: async () => {
      if (env.demoMode) return demo.leaderboard
      const res = await api.get<LeaderboardRow[]>('/api/leaderboard/projects?limit=20')
      return res.data
    },
  })

  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ fontWeight: 800 }}>
        Top Contributed Projects
      </Typography>
      <Stack spacing={1}>
        {(q.data ?? []).map((row, idx) => (
          <Paper key={row.projectId} variant="outlined" sx={{ p: 2 }}>
            <Typography sx={{ fontWeight: 700 }}>
              #{idx + 1} {row.title}
            </Typography>
            <Typography color="text.secondary">{row.points} points</Typography>
          </Paper>
        ))}
      </Stack>
    </Stack>
  )
}

