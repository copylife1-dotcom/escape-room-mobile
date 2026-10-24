import type { Room } from '../data/rooms'

export type GameProgress = {
  version: 2
  roomId: string
  unlockedIndex: number
  completedPuzzleIds: string[]
  lastPlayedIndex: number
  revealedHints: Record<string, number>
  isComplete: boolean
  startedAt: string | null
  completedAt: string | null
}

export const STORAGE_KEY = 'escape-room-progress-v2'
const LEGACY_STORAGE_KEY = 'escape-room-progress-v1'

export function createNewProgress(roomId: string): GameProgress {
  return { version: 2, roomId, unlockedIndex: 0, completedPuzzleIds: [], lastPlayedIndex: 0, revealedHints: {}, isComplete: false, startedAt: new Date().toISOString(), completedAt: null }
}

function calculateUnlockedIndex(room: Room, completedPuzzleIds: string[]) {
  let unlockedIndex = 0
  for (let index = 1; index < room.puzzles.length; index += 1) {
    const condition = room.puzzles[index].unlockCondition
    const unlocked = condition.type === 'always' || completedPuzzleIds.includes(condition.puzzleId)
    if (!unlocked) break
    unlockedIndex = index
  }
  return unlockedIndex
}

function normalizeProgress(value: unknown, room: Room): GameProgress | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as Partial<GameProgress>
  if (raw.version !== 2 || raw.roomId !== room.id) return null

  const requestedCompleted = new Set(Array.isArray(raw.completedPuzzleIds) ? raw.completedPuzzleIds.filter((id): id is string => typeof id === 'string') : [])
  const completedPuzzleIds: string[] = []
  for (const puzzle of room.puzzles) {
    if (!requestedCompleted.has(puzzle.id)) break
    completedPuzzleIds.push(puzzle.id)
  }

  const highestUnlocked = calculateUnlockedIndex(room, completedPuzzleIds)
  const lastPlayedIndex = Math.max(0, Math.min(Number(raw.lastPlayedIndex) || 0, highestUnlocked))
  const revealedHints: Record<string, number> = {}
  const rawHints = raw.revealedHints && typeof raw.revealedHints === 'object' ? raw.revealedHints : {}
  room.puzzles.slice(0, highestUnlocked + 1).forEach((puzzle) => {
    const count = Number(rawHints[puzzle.id]) || 0
    if (count > 0) revealedHints[puzzle.id] = Math.min(Math.max(0, count), puzzle.hints.length)
  })

  const isComplete = completedPuzzleIds.length === room.puzzles.length
  return { version: 2, roomId: room.id, unlockedIndex: highestUnlocked, completedPuzzleIds, lastPlayedIndex, revealedHints, isComplete, startedAt: typeof raw.startedAt === 'string' ? raw.startedAt : null, completedAt: isComplete && typeof raw.completedAt === 'string' ? raw.completedAt : null }
}

function migrateLegacy(room: Room): GameProgress | null {
  try {
    const saved = localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!saved) return null
    const legacy = JSON.parse(saved) as { roomId?: string; status?: string }
    const progress = createNewProgress(room.id)
    if (legacy.roomId !== room.id) return progress
    if (legacy.status === 'solved' && room.puzzles[0]) {
      progress.completedPuzzleIds = [room.puzzles[0].id]
      progress.unlockedIndex = Math.min(1, room.puzzles.length - 1)
      progress.lastPlayedIndex = progress.unlockedIndex
    }
    return progress
  } catch {
    return null
  }
}

export function loadProgress(room: Room): GameProgress | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return normalizeProgress(JSON.parse(saved), room)
  } catch {
    // 손상된 저장 데이터는 레거시 데이터 또는 새 게임으로 복구합니다.
  }
  return migrateLegacy(room)
}

export function saveProgress(progress: GameProgress) { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)) }
export function clearProgress() { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(LEGACY_STORAGE_KEY) }

export function isCorrectAnswer(input: string, answers: string[]) {
  const normalize = (value: string) => value.trim().replace(/\s+/g, '').toLocaleLowerCase('ko-KR')
  const normalized = normalize(input)
  return answers.some((answer) => normalize(answer) === normalized)
}

export function completePuzzle(progress: GameProgress, room: Room, index: number): GameProgress {
  if (index > progress.unlockedIndex || index < 0 || !room.puzzles[index]) return progress
  const puzzleId = room.puzzles[index].id
  if (progress.completedPuzzleIds.includes(puzzleId)) return progress
  const completedPuzzleIds = [...progress.completedPuzzleIds, puzzleId]
  const isComplete = completedPuzzleIds.length === room.puzzles.length
  return { ...progress, completedPuzzleIds, unlockedIndex: calculateUnlockedIndex(room, completedPuzzleIds), isComplete, completedAt: isComplete ? new Date().toISOString() : null }
}

export function selectPuzzle(progress: GameProgress, index: number): GameProgress {
  if (!Number.isInteger(index) || index < 0 || index > progress.unlockedIndex) return progress
  return { ...progress, lastPlayedIndex: index }
}

export function revealNextHint(progress: GameProgress, room: Room, index: number): GameProgress {
  if (index > progress.unlockedIndex || !room.puzzles[index]) return progress
  const puzzle = room.puzzles[index]
  const current = progress.revealedHints[puzzle.id] ?? 0
  if (current >= puzzle.hints.length) return progress
  return { ...progress, revealedHints: { ...progress.revealedHints, [puzzle.id]: current + 1 } }
}
