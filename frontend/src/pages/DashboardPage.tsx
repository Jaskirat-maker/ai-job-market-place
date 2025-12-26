import { Box, Paper, Stack, Typography, Button } from '@mui/material'
import Grid from '@mui/material/Grid'
import { useQuery } from '@tanstack/react-query'
import { Link as RouterLink } from 'react-router-dom'
import { api } from '../lib/api'
import { env } from '../lib/env'
import { demo } from '../lib/demoData'
import type { LeaderboardRow, Project } from '../lib/types'
import { ProjectCard } from '../components/ProjectCard'

export function DashboardPage() {
  const leaderboardQ = useQuery({
    queryKey: ['leaderboard', 5, env.demoMode],
    queryFn: async () => {
      if (env.demoMode) return demo.leaderboard
      const res = await api.get<LeaderboardRow[]>('/api/leaderboard/projects?limit=5')
      return res.data
    },
  })

  const projectsQ = useQuery({
    queryKey: ['projects', env.demoMode],
    queryFn: async () => {
      if (env.demoMode) return demo.projects
      const res = await api.get<Project[]>('/api/projects')
      return res.data
    },
  })

  return (
    <Stack spacing={3}>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack spacing={1}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            AI Job Market + Live Collaboration
          </Typography>
          <Typography color="text.secondary">
            Join projects, contribute in real time, and track the most active teams.
          </Typography>
          <Box>
            <Button component={RouterLink} to="/projects" variant="contained">
              Explore projects
            </Button>
          </Box>
        </Stack>
      </Paper>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={1}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Top Contributed Projects
              </Typography>
              <Stack spacing={1}>
                {(leaderboardQ.data ?? []).map((row, idx) => (
                  <Paper key={row.projectId} variant="outlined" sx={{ p: 1.5 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Stack>
                        <Typography sx={{ fontWeight: 700 }}>
                          #{idx + 1} {row.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {row.points} contribution points
                        </Typography>
                      </Stack>
                      <Button component={RouterLink} to={`/projects/${row.projectId}`} size="small" variant="contained">
                        Open
                      </Button>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={2}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Projects
            </Typography>
            <Grid container spacing={2}>
              {(projectsQ.data ?? []).slice(0, 4).map((p) => (
                <Grid size={{ xs: 12, md: 6 }} key={p.id}>
                  <ProjectCard project={p} />
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  )
}

