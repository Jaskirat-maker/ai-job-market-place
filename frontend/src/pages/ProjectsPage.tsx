import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import Grid from '@mui/material/Grid'
import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { env } from '../lib/env'
import { demo } from '../lib/demoData'
import type { Project } from '../lib/types'
import { ProjectCard } from '../components/ProjectCard'
import { getAccessToken } from '../lib/auth'

export function ProjectsPage() {
  const qc = useQueryClient()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const isAuthed = Boolean(getAccessToken())

  const projectsQ = useQuery({
    queryKey: ['projects', q, env.demoMode],
    queryFn: async () => {
      if (env.demoMode) return demo.projects
      const res = await api.get<Project[]>('/api/projects', { params: q ? { q } : undefined })
      return res.data
    },
  })

  const filtered = useMemo(() => {
    const list = projectsQ.data ?? []
    if (!env.demoMode) return list
    if (!q.trim()) return list
    const s = q.trim().toLowerCase()
    return list.filter((p) => p.title.toLowerCase().includes(s) || p.description.toLowerCase().includes(s))
  }, [projectsQ.data, q])

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Projects
        </Typography>
        <TextField
          placeholder="Search projects…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          sx={{ flex: 1, maxWidth: 520 }}
        />
        <Button variant="contained" disabled={!isAuthed || env.demoMode} onClick={() => setOpen(true)}>
          Create project
        </Button>
      </Stack>

      <Grid container spacing={2}>
        {filtered.map((p) => (
          <Grid key={p.id} size={{ xs: 12, md: 6, lg: 4 }}>
            <ProjectCard project={p} />
          </Grid>
        ))}
      </Grid>

      <CreateProjectDialog
        open={open}
        onClose={() => setOpen(false)}
        onCreated={async () => {
          setOpen(false)
          await qc.invalidateQueries({ queryKey: ['projects'] })
        }}
      />
      {!isAuthed ? (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography color="text.secondary">
            Login to create projects, join teams, and use realtime chat/presence.
          </Typography>
        </Paper>
      ) : null}
    </Stack>
  )
}

function CreateProjectDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: () => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [stage, setStage] = useState('mvp')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create a project</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            minRows={4}
          />
          <TextField label="Stage (idea / mvp / growth)" value={stage} onChange={(e) => setStage(e.target.value)} />
          {error ? (
            <Paper variant="outlined" sx={{ p: 1.5, borderColor: 'rgba(255,0,0,0.4)' }}>
              <Typography color="error">{error}</Typography>
            </Paper>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={loading}
          onClick={async () => {
            setError(null)
            setLoading(true)
            try {
              await api.post('/api/projects', { title, description, stage })
              onCreated()
            } catch (e: any) {
              setError(e?.response?.data?.message ?? 'Failed to create project')
            } finally {
              setLoading(false)
            }
          }}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  )
}

