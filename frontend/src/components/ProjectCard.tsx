import { Card, CardContent, Chip, Stack, Typography, Button, CardActions } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import type { Project } from '../lib/types'

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {project.title}
          </Typography>
          <Chip size="small" label={project.stage.toUpperCase()} color="secondary" variant="outlined" />
        </Stack>
        <Typography sx={{ mt: 1 }} color="text.secondary">
          {project.description}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }}>
          <Chip size="small" label={`${project.memberCount} members`} />
          <Chip size="small" label={`${project.totalContributionPoints} points`} />
          <Chip size="small" label={`Owner: ${project.ownerName}`} variant="outlined" />
        </Stack>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button component={RouterLink} to={`/projects/${project.id}`} variant="contained" fullWidth>
          Open project
        </Button>
      </CardActions>
    </Card>
  )
}

