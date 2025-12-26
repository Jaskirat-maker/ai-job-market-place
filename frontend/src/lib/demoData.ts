import type { ChatMessage, LeaderboardRow, PresenceSnapshot, Project, ProjectDetail, Task, Contribution } from './types'

export const demo = {
  projects: [
    {
      id: 1,
      title: 'AI Resume Reviewer',
      description: 'A tool that gives resume feedback and matches candidates to roles.',
      stage: 'mvp',
      createdAt: new Date().toISOString(),
      ownerId: 1,
      ownerName: 'Alice',
      totalContributionPoints: 8,
      memberCount: 2,
    },
    {
      id: 2,
      title: 'Team Finder Platform',
      description: 'Find teammates by skills and collaborate in real time.',
      stage: 'idea',
      createdAt: new Date().toISOString(),
      ownerId: 2,
      ownerName: 'Bob',
      totalContributionPoints: 2,
      memberCount: 1,
    },
  ] satisfies Project[],
  leaderboard: [
    { projectId: 1, title: 'AI Resume Reviewer', points: 8 },
    { projectId: 2, title: 'Team Finder Platform', points: 2 },
  ] satisfies LeaderboardRow[],
  projectDetail(projectId: number): ProjectDetail {
    const p = demo.projects.find((x) => x.id === projectId) ?? demo.projects[0]
    return {
      project: p,
      members:
        p.id === 1
          ? [
              { userId: 1, displayName: 'Alice', role: 'OWNER', joinedAt: new Date().toISOString() },
              { userId: 2, displayName: 'Bob', role: 'MEMBER', joinedAt: new Date().toISOString() },
            ]
          : [{ userId: 2, displayName: 'Bob', role: 'OWNER', joinedAt: new Date().toISOString() }],
    }
  },
  tasks: [
    { id: 11, title: 'Design project cards', status: 'DONE', assigneeId: null, createdAt: new Date().toISOString() },
    { id: 12, title: 'Implement realtime presence', status: 'IN_PROGRESS', assigneeId: null, createdAt: new Date().toISOString() },
    { id: 13, title: 'Add leaderboard API', status: 'TODO', assigneeId: null, createdAt: new Date().toISOString() },
  ] satisfies Task[],
  contributions: [
    {
      id: 100,
      userId: 1,
      userName: 'Alice',
      type: 'DOCS',
      points: 3,
      summary: 'Wrote onboarding docs and contribution guide.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 101,
      userId: 2,
      userName: 'Bob',
      type: 'TASK_DONE',
      points: 5,
      summary: 'Implemented project search + filters.',
      createdAt: new Date().toISOString(),
    },
  ] satisfies Contribution[],
  presence(projectId: number): PresenceSnapshot {
    return {
      projectId,
      users: [
        { userId: 1, displayName: 'Alice', joinedAt: new Date().toISOString() },
        { userId: 2, displayName: 'Bob', joinedAt: new Date().toISOString() },
      ],
    }
  },
  chat(projectId: number): ChatMessage[] {
    return [
      { id: 1, projectId, senderId: 1, senderName: 'Alice', content: 'Welcome! Pick a task to start.', createdAt: new Date().toISOString() },
      { id: 2, projectId, senderId: 2, senderName: 'Bob', content: 'I can take realtime presence + chat.', createdAt: new Date().toISOString() },
    ]
  },
}

