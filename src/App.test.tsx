import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

async function begin() { const user = userEvent.setup(); render(<App />); await user.click(screen.getByRole('button', { name: /새 게임 시작/ })); return user }
async function answer(user: ReturnType<typeof userEvent.setup>, value: string) { await user.type(screen.getByLabelText('발견한 정답을 입력하세요'), value); await user.click(screen.getByRole('button', { name: '확인' })) }

describe('sequential escape room flow', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('shows wrong-answer feedback without unlocking the next puzzle', async () => {
    const user = await begin(); await answer(user, '1111')
    expect(screen.getByRole('alert')).toHaveTextContent('틀렸습니다')
    expect(screen.getByRole('button', { name: '문제 02 잠김' })).toBeDisabled()
  })

  it('unlocks the next puzzle only after a correct answer', async () => {
    const user = await begin(); await answer(user, '0000')
    expect(screen.getByRole('status')).toHaveTextContent('해결 완료')
    expect(screen.getByRole('button', { name: '문제 02' })).toBeEnabled()
    await user.click(screen.getByRole('button', { name: /다음 문제로/ }))
    expect(screen.getByRole('heading', { name: '봉인된 편지' })).toBeInTheDocument()
  })

  it('continues at the last played puzzle and keeps revealed hints', async () => {
    const user = await begin(); await answer(user, '1200'); await user.click(screen.getByRole('button', { name: /다음 문제로/ })); await user.click(screen.getByRole('button', { name: '힌트 1 공개' })); await user.click(screen.getByRole('button', { name: '홈으로' })); await user.click(screen.getByRole('button', { name: '이어하기' }))
    expect(screen.getByRole('heading', { name: '봉인된 편지' })).toBeInTheDocument()
    expect(screen.getByText('이 방에 남겨진 기록들이 품고 있는 것을 생각해 보세요.')).toBeInTheDocument()
  })

  it('can revisit a solved puzzle without changing the current unlock state', async () => {
    const user = await begin(); await answer(user, '0000'); await user.click(screen.getByRole('button', { name: /다음 문제로/ })); await user.click(screen.getByRole('button', { name: '뒤로가기' }))
    expect(screen.getByRole('heading', { name: '멈춰 버린 시계' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('해결 완료')
    expect(screen.getByRole('button', { name: '문제 02' })).toBeEnabled()
  })

  it('resets progress after confirmation', async () => {
    const user = await begin(); await answer(user, '0000'); await user.click(screen.getByRole('button', { name: '홈으로' })); vi.spyOn(window, 'confirm').mockReturnValue(true); await user.click(screen.getByRole('button', { name: '진행 초기화' }))
    expect(screen.getByRole('button', { name: '이어하기' })).toBeDisabled()
    expect(localStorage.getItem('escape-room-progress-v2')).toBeNull()
  })

  it('shows the ending after all three puzzles are solved', async () => {
    const user = await begin(); await answer(user, '0000'); await user.click(screen.getByRole('button', { name: /다음 문제로/ })); await answer(user, '기억'); await user.click(screen.getByRole('button', { name: /다음 문제로/ })); await answer(user, '1203'); await user.click(screen.getByRole('button', { name: '엔딩 보기' }))
    expect(screen.getByRole('heading', { name: '방탈출 성공' })).toBeInTheDocument()
    expect(screen.getByText('개의 문제 모두 해결')).toBeInTheDocument()
  })
})
