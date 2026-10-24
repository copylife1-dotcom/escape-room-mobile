import { FormEvent, useEffect, useRef, useState } from 'react'
import { rooms } from './data/rooms'
import { clearProgress, completePuzzle, createNewProgress, GameProgress, isCorrectAnswer, loadProgress, revealNextHint, saveProgress, selectPuzzle } from './lib/progress'

type Screen = 'home' | 'puzzle' | 'ending'
type Feedback = 'idle' | 'correct' | 'wrong'
const room = rooms[0]

function App() {
  const [progress, setProgress] = useState<GameProgress | null>(() => loadProgress(room))
  const [screen, setScreen] = useState<Screen>('home')
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<Feedback>('idle')
  const inputRef = useRef<HTMLInputElement>(null)
  const currentIndex = progress?.lastPlayedIndex ?? 0
  const puzzle = room.puzzles[currentIndex]
  const isSolved = Boolean(progress?.completedPuzzleIds.includes(puzzle.id))
  const revealedHintCount = progress?.revealedHints[puzzle.id] ?? 0

  useEffect(() => { if (progress) saveProgress(progress) }, [progress])

  useEffect(() => {
    const handleBack = () => {
      if (screen === 'ending') setScreen('puzzle')
      else if (screen === 'puzzle' && currentIndex > 0) setProgress((value) => value ? selectPuzzle(value, currentIndex - 1) : value)
      else if (screen === 'puzzle') setScreen('home')
    }
    window.addEventListener('popstate', handleBack)
    let removeNativeListener: (() => Promise<void>) | undefined
    import('@capacitor/app').then(({ App }) => App.addListener('backButton', handleBack)).then((handle) => { removeNativeListener = () => handle.remove() }).catch(() => undefined)
    return () => { window.removeEventListener('popstate', handleBack); void removeNativeListener?.() }
  }, [currentIndex, screen])

  const openPuzzle = (index: number) => {
    if (!progress || index > progress.unlockedIndex) return
    setProgress(selectPuzzle(progress, index)); setAnswer(''); setFeedback('idle'); setScreen('puzzle')
  }

  const startNewGame = () => {
    if (progress && !window.confirm('기존 진행 기록을 지우고 새 게임을 시작할까요?')) return
    setProgress(createNewProgress(room.id)); setScreen('puzzle'); setFeedback('idle'); setAnswer('')
  }

  const continueGame = () => { if (progress) setScreen(progress.isComplete ? 'ending' : 'puzzle') }
  const resetGame = () => {
    if (!progress || !window.confirm('모든 진행 기록과 힌트를 초기화할까요?')) return
    clearProgress(); setProgress(null); setScreen('home'); setFeedback('idle'); setAnswer('')
  }

  const checkAnswer = (event: FormEvent) => {
    event.preventDefault()
    if (!progress || isSolved || !answer.trim()) return
    inputRef.current?.blur()
    if (isCorrectAnswer(answer, puzzle.answers)) { setProgress(completePuzzle(progress, room, currentIndex)); setFeedback('correct') }
    else setFeedback('wrong')
  }

  const goNext = () => {
    if (!progress) return
    if (progress.isComplete) setScreen('ending')
    else openPuzzle(currentIndex + 1)
  }

  if (screen === 'home') {
    return <main className="app-shell intro-screen screen-enter">
      <div className="noise" aria-hidden="true" />
      <section className="intro-content"><div className="sigil" aria-hidden="true"><span>Ⅻ</span></div><p className="eyebrow">OFFLINE ESCAPE ROOM</p><h1>{room.title}</h1><p className="subtitle">— {room.subtitle} —</p><div className="divider"><span>◆</span></div><p className="intro-copy">{room.intro}</p></section>
      <div className="home-actions"><button className="primary-button" onClick={startNewGame}>새 게임 시작 <span aria-hidden="true">→</span></button><button className="secondary-button" onClick={continueGame} disabled={!progress}>이어하기</button><button className="text-button" onClick={resetGame} disabled={!progress}>진행 초기화</button></div>
      {progress && <p className="saved-progress">진행률 {progress.completedPuzzleIds.length}/{room.puzzles.length} · 자동 저장됨</p>}
      <p className="offline-note"><span /> 인터넷 연결 없이 플레이할 수 있습니다</p>
    </main>
  }

  if (screen === 'ending') {
    return <main className="app-shell ending-screen screen-enter"><div className="noise" aria-hidden="true" /><div className="celebration" aria-hidden="true">✦ <i>◆</i> ✧ <i>✦</i> ◆</div><section className="ending-content"><div className="ending-sigil" aria-hidden="true">✓</div><p className="eyebrow">ESCAPE COMPLETE</p><h1>방탈출 성공</h1><p>검은 서재의 모든 비밀을 풀고<br />마침내 잠긴 문을 열었습니다.</p><div className="completion-count"><strong>{room.puzzles.length}</strong><span>개의 문제 모두 해결</span></div><button className="primary-button" onClick={() => setScreen('home')}>홈으로 돌아가기</button><button className="secondary-button" onClick={startNewGame}>처음부터 다시 시작</button></section></main>
  }

  return <main className="app-shell game-screen screen-enter">
    <div className="noise" aria-hidden="true" />
    <header className="navigation-header"><button className="icon-button" aria-label="뒤로가기" onClick={() => currentIndex > 0 ? openPuzzle(currentIndex - 1) : setScreen('home')}>←</button><div><strong>{room.title}</strong><span>문제 {puzzle.number} / {String(room.puzzles.length).padStart(2, '0')}</span></div><button className="icon-button" aria-label="홈으로" onClick={() => setScreen('home')}>⌂</button></header>
    <div className="progress-track" aria-label={`${room.puzzles.length}개 중 ${progress?.completedPuzzleIds.length ?? 0}개 완료`}><i style={{ width: `${((progress?.completedPuzzleIds.length ?? 0) / room.puzzles.length) * 100}%` }} /></div>
    <section className="puzzle-card" aria-labelledby="puzzle-title">
      <div className="puzzle-number">PUZZLE {puzzle.number}</div><div className="clock-icon" aria-hidden="true"><span>{puzzle.number}</span><i /></div><p className="story">{puzzle.story}</p><h2 id="puzzle-title">{puzzle.title}</h2><blockquote>{puzzle.prompt}</blockquote>
      {isSolved ? <div className="result correct" role="status"><span className="result-icon">✓</span><div><strong>해결 완료</strong><p>{puzzle.successMessage}</p></div></div> : <form onSubmit={checkAnswer}><label htmlFor="answer">발견한 정답을 입력하세요</label><div className={`answer-row ${feedback === 'wrong' ? 'has-error' : ''}`}><input ref={inputRef} id="answer" value={answer} onChange={(event) => { setAnswer(event.target.value); setFeedback('idle') }} placeholder="정답 입력" inputMode={puzzle.inputMode ?? 'text'} enterKeyHint="done" autoComplete="off" aria-describedby={feedback === 'wrong' ? 'answer-error' : undefined} /><button type="submit">확인</button></div>{feedback === 'wrong' && <p className="error-message" id="answer-error" role="alert">틀렸습니다. 주변의 단서를 다시 살펴보세요.</p>}</form>}
      {isSolved && <button className="next-button" onClick={goNext}>{progress?.isComplete ? '엔딩 보기' : '다음 문제로'} <span aria-hidden="true">→</span></button>}
      <div className="hints-section">{puzzle.hints.slice(0, revealedHintCount).map((hint, index) => <p className="hint" key={hint}><b>힌트 {index + 1}</b>{hint}</p>)}{revealedHintCount < puzzle.hints.length && <button className="hint-button" onClick={() => progress && setProgress(revealNextHint(progress, room, currentIndex))}><span aria-hidden="true">◇</span> 힌트 {revealedHintCount + 1} 공개</button>}</div>
    </section>
    <nav className="puzzle-dots" aria-label="문제 목록">{room.puzzles.map((item, index) => { const locked = !progress || index > progress.unlockedIndex; return <button key={item.id} aria-label={`문제 ${item.number}${locked ? ' 잠김' : ''}`} disabled={locked} className={index === currentIndex ? 'active' : progress?.completedPuzzleIds.includes(item.id) ? 'done' : ''} onClick={() => openPuzzle(index)}>{locked ? '×' : item.number}</button> })}</nav>
  </main>
}

export default App
