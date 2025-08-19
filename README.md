# Statio Library

Statio는 React 애플리케이션을 위한 가벼운 상태 관리 라이브러리입니다.

## 설치

```bash
npm install statio-lib
```

## 사용법

### 기본 사용법

```tsx
import { useStatio } from "statio-lib";

function Counter() {
  const [count, setCount] = useStatio("counter", 0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

### Selector 사용

```tsx
import { useStatioSelector } from "statio-lib";

function UserDisplay() {
  const userName = useStatioSelector("user", (user) => user.name);

  return <p>Hello, {userName}!</p>;
}
```

### 미들웨어 사용

```tsx
import { globalStore, persistStatio, loggerStatio } from "statio-lib";

// 로깅과 영속성 미들웨어 추가
globalStore.use(persistStatio());
globalStore.use(loggerStatio());
```

## API

### Hooks

- `useStatio(key, initialValue?)` - 상태와 setter를 반환
- `useStatioSelector(key, selector)` - 선택된 상태만 반환

### Store

- `globalStore.get(key)` - 상태 가져오기
- `globalStore.set(key, value)` - 상태 설정
- `globalStore.update(key, updater)` - 상태 업데이트
- `globalStore.subscribe(key, listener)` - 상태 변경 구독

### Middlewares

- `persistStatio(options)` - 로컬 스토리지에 상태 저장
- `loggerStatio()` - 상태 변경 로깅
- `devStatio(name)` - Redux DevTools 연동
- `effectStatio(key, effect)` - 특정 키 변경 시 효과 실행
- `validateStatio(key, validator)` - 상태 유효성 검증

### statio가 권장하는 네이밍

- `user`, `auth`, `theme`, `settings` 등 변수의 명확한 도메인 지정
- boolean → `is`, `has`, `can`
- 배열 → `List`, `Items`
- 객체 → `Data`, `Info`, `State`

## 라이센스

MIT
