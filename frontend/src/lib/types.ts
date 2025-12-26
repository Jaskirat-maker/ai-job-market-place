export type AuthResponse = { accessToken: string; refreshToken: string }

export type Project = {
  id: number
  title: string
  description: string
  stage: string
  createdAt: string
  ownerId: number
  ownerName: string
  totalContributionPoints: number
  memberCount: number
}

export type ProjectMember = { userId: number; displayName: string; role: string; joinedAt: string }

export type ProjectDetail = { project: Project; members: ProjectMember[] }

export type LeaderboardRow = { projectId: number; title: string; points: number }

export type Task = { id: number; title: string; status: string; assigneeId: number | null; createdAt: string }

export type Contribution = {
  id: number
  userId: number
  userName: string
  type: string
  points: number
  summary: string
  createdAt: string
}

export type PresenceUser = { userId: number; displayName: string; joinedAt: string }

export type PresenceSnapshot = { projectId: number; users: PresenceUser[] }

export type ChatMessage = {
  id: number
  projectId: number
  senderId: number
  senderName: string
  content: string
  createdAt: string
}

