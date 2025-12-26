import {
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import Grid from '@mui/material/Grid'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { env } from '../lib/env'
import { demo } from '../lib/demoData'
import type { ChatMessage, Contribution, PresenceSnapshot, ProjectDetail, Task } from '../lib/types'
import { createStompClient } from '../lib/ws'
import type { Client, IMessage } from '@stomp/stompjs'
import { getAccessToken } from '../lib/auth'

export function ProjectDetailPage() {
  const { projectId } = useParams()
  const id = Number(projectId)
  const qc = useQueryClient()
  const isAuthed = Boolean(getAccessToken())

  const detailQ = useQuery({
    queryKey: ['project', id, env.demoMode],
    queryFn: async () => {
      if (env.demoMode) return demo.projectDetail(id)
      const res = await api.get<ProjectDetail>(`/api/projects/${id}`)
      return res.data
    },
    enabled: Number.isFinite(id),
  })

  const tasksQ = useQuery({
    queryKey: ['tasks', id, env.demoMode],
    queryFn: async () => {
      if (env.demoMode) return demo.tasks
      const res = await api.get<Task[]>(`/api/projects/${id}/tasks`)
      return res.data
    },
    enabled: Number.isFinite(id) && isAuthed,
  })

  const contribQ = useQuery({
    queryKey: ['contributions', id, env.demoMode],
    queryFn: async () => {
      if (env.demoMode) return demo.contributions
      const res = await api.get<Contribution[]>(`/api/projects/${id}/contributions`)
      return res.data
    },
    enabled: Number.isFinite(id) && isAuthed,
  })

  const chatHistoryQ = useQuery({
    queryKey: ['chat', id, env.demoMode],
    queryFn: async () => {
      if (env.demoMode) return demo.chat(id)
      const res = await api.get<ChatMessage[]>(`/api/projects/${id}/chat`)
      return res.data.slice().reverse()
    },
    enabled: Number.isFinite(id) && isAuthed,
  })

  const joinM = useMutation({
    mutationFn: async () => {
      await api.post(`/api/projects/${id}/join`)
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['project', id] })
      await qc.invalidateQueries({ queryKey: ['tasks', id] })
      await qc.invalidateQueries({ queryKey: ['contributions', id] })
    },
  })

  const addTaskM = useMutation({
    mutationFn: async (title: string) => {
      await api.post(`/api/projects/${id}/tasks`, { title })
    },
    onSuccess: async () => qc.invalidateQueries({ queryKey: ['tasks', id] }),
  })

  const updateTaskM = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: number; status: string }) => {
      await api.put(`/api/projects/${id}/tasks/${taskId}/status`, { status })
    },
    onSuccess: async () => qc.invalidateQueries({ queryKey: ['tasks', id] }),
  })

  const addContribM = useMutation({
    mutationFn: async ({ summary, points }: { summary: string; points: number }) => {
      await api.post(`/api/projects/${id}/contributions`, { summary, points, type: 'OTHER' })
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['contributions', id] })
      await qc.invalidateQueries({ queryKey: ['project', id] })
    },
  })

  // realtime presence + chat
  const clientRef = useRef<Client | null>(null)
  const [presence, setPresence] = useState<PresenceSnapshot | null>(null)
  const [chat, setChat] = useState<ChatMessage[]>([])

  useEffect(() => {
    if (!isAuthed || env.demoMode) return
    if (!Number.isFinite(id)) return

    setChat(chatHistoryQ.data ?? [])
  }, [chatHistoryQ.data, id, isAuthed])

  useEffect(() => {
    if (!isAuthed || env.demoMode) {
      setPresence(env.demoMode ? demo.presence(id) : null)
      return
    }
    if (!Number.isFinite(id)) return

    const client = createStompClient()
    clientRef.current = client

    client.onConnect = () => {
      client.subscribe(`/topic/projects/${id}/presence`, (msg: IMessage) => {
        try {
          setPresence(JSON.parse(msg.body))
        } catch {
          // ignore
        }
      })
      client.subscribe(`/topic/projects/${id}/chat`, (msg: IMessage) => {
        try {
          const m = JSON.parse(msg.body) as ChatMessage
          setChat((prev) => [...prev, m])
        } catch {
          // ignore
        }
      })
      client.publish({ destination: `/app/projects/${id}/presence.join`, body: '{}' })
    }

    client.activate()
    return () => {
      client.deactivate()
      clientRef.current = null
    }
  }, [id, isAuthed])

  const project = detailQ.data?.project
  const members = detailQ.data?.members ?? []

  const tasks = tasksQ.data ?? []
  const contributions = contribQ.data ?? []
  const presenceUsers = presence?.users ?? []

  const [newTask, setNewTask] = useState('')
  const [newContrib, setNewContrib] = useState('')
  const [newContribPoints, setNewContribPoints] = useState('1')
  const [chatInput, setChatInput] = useState('')

  const canRealtime = isAuthed && !env.demoMode

  const memberNames = useMemo(() => new Set(members.map((m) => m.displayName)), [members])

  if (!project) {
    return (
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography>Loading…</Typography>
      </Paper>
    )
  }

  return (
    <Stack spacing={2}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
          <Stack sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 900 }}>
              {project.title}
            </Typography>
            <Typography color="text.secondary">{project.description}</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
              <Chip label={project.stage.toUpperCase()} color="secondary" variant="outlined" />
              <Chip label={`${project.memberCount} members`} />
              <Chip label={`${project.totalContributionPoints} points`} />
              <Chip label={`Owner: ${project.ownerName}`} variant="outlined" />
            </Stack>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button variant="contained" disabled={!isAuthed || env.demoMode || joinM.isPending} onClick={() => joinM.mutate()}>
              Join
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography sx={{ fontWeight: 800 }}>Members</Typography>
            <Stack spacing={1} sx={{ mt: 1 }}>
              {members.map((m) => (
                <Paper key={m.userId} variant="outlined" sx={{ p: 1.25 }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography sx={{ fontWeight: 700 }}>{m.displayName}</Typography>
                    <Chip size="small" label={m.role} />
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Typography sx={{ fontWeight: 800 }}>Live presence</Typography>
                <Typography variant="body2" color="text.secondary">
                  {canRealtime ? 'Updates instantly when someone joins/leaves.' : 'Login to enable realtime presence.'}
                </Typography>
                <Stack spacing={1} sx={{ mt: 1 }}>
                  {presenceUsers.length === 0 ? (
                    <Typography color="text.secondary">No one online in this project right now.</Typography>
                  ) : (
                    presenceUsers.map((u) => (
                      <Paper key={u.userId} variant="outlined" sx={{ p: 1.25 }}>
                        <Typography sx={{ fontWeight: 700 }}>
                          {u.displayName} {memberNames.has(u.displayName) ? '' : '(guest)'}
                        </Typography>
                      </Paper>
                    ))
                  )}
                </Stack>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Typography sx={{ fontWeight: 800 }}>Tasks</Typography>
                <Typography variant="body2" color="text.secondary">
                  Add tasks and mark them done to track project activity.
                </Typography>
                <Stack spacing={1} sx={{ mt: 1 }}>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      size="small"
                      placeholder="New task title"
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      fullWidth
                      disabled={!isAuthed || env.demoMode}
                    />
                    <Button
                      variant="contained"
                      disabled={!newTask.trim() || !isAuthed || env.demoMode || addTaskM.isPending}
                      onClick={() => {
                        addTaskM.mutate(newTask.trim())
                        setNewTask('')
                      }}
                    >
                      Add
                    </Button>
                  </Stack>
                  <Divider />
                  {tasks.map((t) => (
                    <Paper key={t.id} variant="outlined" sx={{ p: 1.25 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                        <Stack>
                          <Typography sx={{ fontWeight: 700 }}>{t.title}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {t.status}
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1}>
                          <Button size="small" disabled={!isAuthed || env.demoMode} onClick={() => updateTaskM.mutate({ taskId: t.id, status: 'TODO' })}>
                            TODO
                          </Button>
                          <Button size="small" disabled={!isAuthed || env.demoMode} onClick={() => updateTaskM.mutate({ taskId: t.id, status: 'IN_PROGRESS' })}>
                            Doing
                          </Button>
                          <Button size="small" variant="contained" disabled={!isAuthed || env.demoMode} onClick={() => updateTaskM.mutate({ taskId: t.id, status: 'DONE' })}>
                            Done
                          </Button>
                        </Stack>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography sx={{ fontWeight: 800 }}>Contributions</Typography>
                <Typography variant="body2" color="text.secondary">
                  Add contributions to increase project score and climb the leaderboard.
                </Typography>
                <Stack spacing={1} sx={{ mt: 1 }}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
                    <TextField
                      placeholder="What did you contribute?"
                      value={newContrib}
                      onChange={(e) => setNewContrib(e.target.value)}
                      fullWidth
                      disabled={!isAuthed || env.demoMode}
                    />
                    <TextField
                      placeholder="Points"
                      value={newContribPoints}
                      onChange={(e) => setNewContribPoints(e.target.value)}
                      sx={{ width: 120 }}
                      disabled={!isAuthed || env.demoMode}
                    />
                    <Button
                      variant="contained"
                      disabled={!newContrib.trim() || !isAuthed || env.demoMode || addContribM.isPending}
                      onClick={() => {
                        const pts = Math.max(1, Number(newContribPoints || '1') || 1)
                        addContribM.mutate({ summary: newContrib.trim(), points: pts })
                        setNewContrib('')
                        setNewContribPoints('1')
                      }}
                    >
                      Add contribution
                    </Button>
                  </Stack>
                  <Divider />
                  {contributions.map((c) => (
                    <Paper key={c.id} variant="outlined" sx={{ p: 1.25 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                        <Stack>
                          <Typography sx={{ fontWeight: 700 }}>{c.summary}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {c.userName} • {c.type}
                          </Typography>
                        </Stack>
                        <Chip label={`+${c.points}`} color="primary" />
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography sx={{ fontWeight: 800 }}>Live chat</Typography>
                <Typography variant="body2" color="text.secondary">
                  {canRealtime ? 'Realtime chat via WebSocket.' : 'Login to enable realtime chat.'}
                </Typography>
                <Stack spacing={1} sx={{ mt: 1 }}>
                  <Paper variant="outlined" sx={{ p: 1.25, maxHeight: 280, overflow: 'auto' }}>
                    <Stack spacing={1}>
                      {(chat ?? []).map((m) => (
                        <Paper key={m.id} variant="outlined" sx={{ p: 1.25 }}>
                          <Typography sx={{ fontWeight: 700 }}>{m.senderName}</Typography>
                          <Typography>{m.content}</Typography>
                        </Paper>
                      ))}
                      {chat.length === 0 ? <Typography color="text.secondary">No messages yet.</Typography> : null}
                    </Stack>
                  </Paper>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      placeholder="Type a message…"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      fullWidth
                      disabled={!isAuthed || env.demoMode}
                    />
                    <Button
                      variant="contained"
                      disabled={!chatInput.trim() || !isAuthed || env.demoMode}
                      onClick={() => {
                        const client = clientRef.current
                        if (!client?.connected) return
                        client.publish({
                          destination: `/app/projects/${id}/chat.send`,
                          body: JSON.stringify({ content: chatInput.trim() }),
                        })
                        setChatInput('')
                      }}
                    >
                      Send
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Stack>
  )
}

