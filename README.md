# 검은 서재 — 오프라인 방탈출

갤럭시 Z 폴드7을 포함한 Android 스마트폰에서 오프라인으로 실행하는 방탈출 게임입니다. React, TypeScript, Vite, Capacitor로 제작했습니다.

## 실행

```bash
npm install
npm run dev
```

## 검사 및 빌드

```bash
npm test
npm run build
npm run android:sync
```

Android SDK가 준비된 환경에서 디버그 APK를 생성하려면 다음을 실행합니다.

```bash
npm run android:apk
```

APK는 `android/app/build/outputs/apk/debug/app-debug.apk`에 생성됩니다. 갤럭시 Z 폴드7로 옮긴 뒤 기기 설정에서 출처를 알 수 없는 앱 설치를 허용하여 직접 설치할 수 있습니다.

## 콘텐츠 추가

방과 문제 데이터는 `src/data/rooms.ts`에 UI와 분리되어 있습니다. `puzzles` 배열 끝에 제목, 이야기, 문제, 허용 정답, 최대 3개의 힌트, 해금 조건, 정답 메시지를 같은 형식으로 추가하면 됩니다.

문제는 앞 문제 완료 여부에 따라 순차 해금됩니다. 진행 상태, 완료한 문제, 마지막 위치, 공개한 힌트와 완료 시각은 기기의 `localStorage`에 자동 저장되므로 앱을 종료하거나 재부팅해도 유지됩니다. 이전 v1 저장 데이터는 자동으로 v2 구조로 마이그레이션됩니다.
