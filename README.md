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

방과 문제 데이터는 `src/data/rooms.ts`에 UI와 분리되어 있습니다. `Room` 또는 `Puzzle` 항목을 추가해 콘텐츠를 확장할 수 있습니다. 진행 상태는 기기의 `localStorage`에 저장되므로 앱을 종료하거나 새로고침해도 유지됩니다.
