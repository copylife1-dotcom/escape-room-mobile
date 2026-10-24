export type Puzzle = {
  id: string
  number: string
  title: string
  story: string
  prompt: string
  hint: string
  answers: string[]
}

export type Room = {
  id: string
  title: string
  subtitle: string
  intro: string
  puzzles: Puzzle[]
}

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
        hint: '시침과 분침이 모두 12를 가리킵니다.',
        answers: ['0000', '1200'],
      },
    ],
  },
]
