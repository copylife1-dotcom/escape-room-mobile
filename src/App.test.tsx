import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('escape room flow', () => {
  it('starts the game and reports a wrong answer', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /게임 시작/ }))
    await user.type(screen.getByLabelText('발견한 정답을 입력하세요'), '1111')
    await user.click(screen.getByRole('button', { name: '확인' }))
    expect(screen.getByRole('alert')).toHaveTextContent('틀렸습니다')
  })

  it('accepts the answer and persists solved progress', async () => {
    const user = userEvent.setup()
    const firstRender = render(<App />)
    await user.click(screen.getByRole('button', { name: /게임 시작/ }))
    await user.type(screen.getByLabelText('발견한 정답을 입력하세요'), '0000')
    await user.click(screen.getByRole('button', { name: '확인' }))
    expect(screen.getByRole('status')).toHaveTextContent('정답입니다')

    firstRender.unmount()
    render(<App />)
    expect(screen.getByRole('status')).toHaveTextContent('정답입니다')
  })
})
