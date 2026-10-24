export type UnlockCondition =
  | { type: 'always' }
  | { type: 'previous-completed'; puzzleId: string }

export type Puzzle = {
  id: string
  number: string
  title: string
  story: string
  prompt: string
  answers: string[]
  hints: string[]
  unlockCondition: UnlockCondition
  successMessage: string
  inputMode?: 'text' | 'numeric'
}

export type Room = {
  id: string
  title: string
  subtitle: string
  intro: string
  puzzles: Puzzle[]
}

// 새 문제는 puzzles 배열 끝에 같은 형식으로 추가하면 됩니다.
// answers에는 띄어쓰기와 대소문자를 제외하고 허용할 모든 정답을 적습니다.
export const rooms: Room[] = [
  {
    id: 'black-library',
    title: '검은 서재',
    subtitle: '사라진 기록',
    intro: '눈을 뜨자 낯선 서재의 문이 잠겨 있었다. 방 안에 흩어진 기록을 따라 자정 전에 이곳을 탈출하라.',
    puzzles: [
      {
        id: 'clock-note',
        number: '01',
        title: '멈춰 버린 시계',
        story: '오래된 괘종시계 아래에서 빛바랜 쪽지 한 장을 발견했다.',
        prompt: '“나는 하루에 두 번만 진실을 말한다. 시계의 두 바늘이 자정에 가리키는 네 자리 숫자는?”',
        answers: ['0000', '1200'],
        hints: ['시간이 멈춘 순간을 떠올려 보세요.', '시침과 분침이 같은 숫자를 가리킵니다.', '자정에는 두 바늘이 모두 12를 가리킵니다.'],
        unlockCondition: { type: 'always' },
        successMessage: '낡은 시계 안에서 붉은 밀랍 조각이 떨어졌다.',
        inputMode: 'numeric',
      },
      {
        id: 'sealed-letter',
        number: '02',
        title: '봉인된 편지',
        story: '붉은 밀랍과 같은 문양이 찍힌 편지가 책장 깊숙한 곳에서 발견됐다.',
        prompt: '“모든 이야기의 시작이자, 어둠 속에서도 사라지지 않는 것. 두 글자로 답하라.”',
        answers: ['기억'],
        hints: ['이 방에 남겨진 기록들이 품고 있는 것을 생각해 보세요.', '과거의 순간을 마음속에 간직하는 일입니다.', '첫 글자는 ‘기’, 마지막 글자는 ‘억’입니다.'],
        unlockCondition: { type: 'previous-completed', puzzleId: 'clock-note' },
        successMessage: '편지 속 문장이 드러나며 마지막 서랍의 위치를 알려준다.',
      },
      {
        id: 'final-code',
        number: '03',
        title: '마지막 암호',
        story: '책상 아래 숨겨진 서랍에는 네 자리 자물쇠와 마지막 기록이 놓여 있다.',
        prompt: '“첫 번째 답의 시작과 이 방의 문제 수를 이어 붙여라.” 정답은 네 자리 숫자다.',
        answers: ['1203'],
        hints: ['첫 번째 문제에서 허용된 답 하나를 다시 떠올려 보세요.', '그 답의 앞 두 자리 뒤에 전체 문제 수를 붙입니다.', '12 뒤에 03을 붙이면 됩니다.'],
        unlockCondition: { type: 'previous-completed', puzzleId: 'sealed-letter' },
        successMessage: '자물쇠가 열리고 서재의 문이 천천히 움직이기 시작한다.',
        inputMode: 'numeric',
      },
    ],
  },
]
