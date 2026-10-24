import { FormEvent, useEffect, useMemo, useState } from 'react'
import { rooms } from './data/rooms'
import { GameProgress, isCorrectAnswer, loadProgress, saveProgress } from './lib/progress'

type Feedback = 'idle' | 'correct' | 'wrong'

function App() {
  const [progress, setProgress] = useState<GameProgress>(loadProgress)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<Feedback>('idle')
  const [showHint, setShowHint] = useState(false)

  const room = useMemo(
    () => rooms.find((item) => item.id === progress.roomId) ?? rooms[0],
    [progress.roomId],
  )
  const puzzle = room.puzzles[progress.puzzleIndex] ?? room.puzzles[0]

  useEffect(() => saveProgress(progress), [progress])

  const startGame = () => setProgress({ ...progress, status: 'playing' })

  const checkAnswer = (event: FormEvent) => {
    event.preventDefault()
    if (!answer.trim()) return

    if (isCorrectAnswer(answer, puzzle.answers)) {
      setFeedback('correct')
      setProgress({ ...progress, status: 'solved' })
    } else {
      setFeedback('wrong')
    }
  }

  if (progress.status === 'intro') {
    return (
      <main className="app-shell intro-screen">
        <div className="noise" aria-hidden="true" />
        <section className="intro-content">
          <div className="sigil" aria-hidden="true"><span>Ⅻ</span></div>
          <p className="eyebrow">OFFLINE ESCAPE ROOM</p>
          <h1>{room.title}</h1>
          <p className="subtitle">— {room.subtitle} —</p>
          <div className="divider"><span>◆</span></div>
          <p className="intro-copy">{room.intro}</p>
        </section>
        <button className="primary-button" onClick={startGame}>
          게임 시작 <span aria-hidden="true">→</span>
        </button>
        <p className="offline-note"><span /> 인터넷 연결 없이 플레이할 수 있습니다</p>
      </main>
    )
  }

  return (
    <main className="app-shell game-screen">
      <div className="noise" aria-hidden="true" />
      <header className="game-header">
        <div>
          <p className="eyebrow">ROOM 01</p>
          <h1>{room.title}</h1>
        </div>
        <div className="progress-ring" aria-label={`${room.puzzles.length}개 중 1개 문제`}>
          <strong>{progress.status === 'solved' ? 1 : 0}</strong><span>/{room.puzzles.length}</span>
        </div>
      </header>

      <section className="puzzle-card" aria-labelledby="puzzle-title">
        <div className="puzzle-number">PUZZLE {puzzle.number}</div>
        <div className="clock-icon" aria-hidden="true"><span>Ⅻ</span><i /></div>
        <p className="story">{puzzle.story}</p>
        <h2 id="puzzle-title">{puzzle.title}</h2>
        <blockquote>{puzzle.prompt}</blockquote>

        {progress.status === 'solved' ? (
          <div className="result correct" role="status">
            <span className="result-icon">✓</span>
            <div><strong>정답입니다</strong><p>낡은 시계 안에서 작은 열쇠가 떨어졌다.</p></div>
          </div>
        ) : (
          <form onSubmit={checkAnswer}>
            <label htmlFor="answer">발견한 정답을 입력하세요</label>
            <div className={`answer-row ${feedback === 'wrong' ? 'has-error' : ''}`}>
              <input
                id="answer"
                value={answer}
                onChange={(event) => { setAnswer(event.target.value); setFeedback('idle') }}
                placeholder="정답 입력"
                inputMode="numeric"
                autoComplete="off"
                aria-describedby={feedback === 'wrong' ? 'answer-error' : undefined}
              />
              <button type="submit">확인</button>
            </div>
            {feedback === 'wrong' && <p className="error-message" id="answer-error" role="alert">틀렸습니다. 주변의 단서를 다시 살펴보세요.</p>}
          </form>
        )}

        <button className="hint-button" onClick={() => setShowHint(!showHint)} aria-expanded={showHint}>
          <span aria-hidden="true">◇</span> {showHint ? '힌트 닫기' : '힌트 보기'}
        </button>
        {showHint && <p className="hint" role="status">{puzzle.hint}</p>}
      </section>
    </main>
  )
}

export default App
