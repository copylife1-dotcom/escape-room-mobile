export type GameStatus = 'intro' | 'playing' | 'solved'

export type GameProgress = {
  status: GameStatus
  roomId: string
  puzzleIndex: number
}

const STORAGE_KEY = 'escape-room-progress-v1'

export const initialProgress: GameProgress = {
  status: 'intro',
  roomId: 'black-library',
  puzzleIndex: 0,
}

export function loadProgress(): GameProgress {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return initialProgress

    const parsed = JSON.parse(saved) as Partial<GameProgress>
    if (
      !['intro', 'playing', 'solved'].includes(parsed.status ?? '') ||
      typeof parsed.roomId !== 'string' ||
      typeof parsed.puzzleIndex !== 'number'
    ) {
      return initialProgress
    }
    return parsed as GameProgress
  } catch {
    return initialProgress
  }
}

export function saveProgress(progress: GameProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function isCorrectAnswer(input: string, answers: string[]) {
  const normalized = input.trim().replace(/\s+/g, '').toLocaleLowerCase('ko-KR')
  return answers.some((answer) => answer.toLocaleLowerCase('ko-KR') === normalized)
}
