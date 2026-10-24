import { describe, expect, it } from 'vitest'
import { rooms } from '../data/rooms'
import { loadProgress, STORAGE_KEY } from './progress'

describe('progress restoration security', () => {
  it('removes non-contiguous completions and clamps locked navigation', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 2, roomId: 'black-library', completedPuzzleIds: ['final-code'], unlockedIndex: 99, lastPlayedIndex: 99, revealedHints: { 'final-code': 3 }, isComplete: true }))
    const restored = loadProgress(rooms[0])
    expect(restored?.completedPuzzleIds).toEqual([]); expect(restored?.unlockedIndex).toBe(0); expect(restored?.lastPlayedIndex).toBe(0); expect(restored?.isComplete).toBe(false)
  })

  it('migrates a solved v1 save to puzzle two', () => {
    localStorage.setItem('escape-room-progress-v1', JSON.stringify({ status: 'solved', roomId: 'black-library', puzzleIndex: 0 }))
    const restored = loadProgress(rooms[0])
    expect(restored?.completedPuzzleIds).toEqual(['clock-note']); expect(restored?.unlockedIndex).toBe(1)
  })
})
