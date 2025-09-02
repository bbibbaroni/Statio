# 🚀 Statio Library

**React용 초경량 상태관리 라이브러리 - 복잡함은 버리고, 성능은 챙기세요**

[![npm version](https://img.shields.io/npm/v/statio-lib.svg)](https://www.npmjs.com/package/statio-lib)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/statio-lib.svg)](https://bundlephobia.com/package/statio-lib)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 왜 Statio인가?

- 🪶 **극도로 가벼움** - Redux의 1/10 크기
- ⚡ **번개같은 속도** - 불필요한 리렌더링 제로
- 🎯 **직관적인 API** - 5분이면 마스터
- 🔧 **강력한 미들웨어** - 확장성 무한대
- 🎨 **TypeScript 퍼스트** - 타입 안전성 보장

## 🎯 Quick Start

```bash
npm install statio-lib
```

```tsx
import { useStatio } from "statio-lib";

function TodoApp() {
  const [todos, setTodos] = useStatio("todoList", []);
  
  const addTodo = (text: string) => {
    setTodos([...todos, { id: Date.now(), text, done: false }]);
  };

  return (
    <div>
      {/* 마법처럼 동작하는 상태 관리 */}
      {todos.map(todo => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
      <AddTodo onAdd={addTodo} />
    </div>
  );
}
```

## 🔥 핵심 기능들

### 🎪 기본 상태 관리 - 심플하게!

```tsx
// 카운터? 한 줄이면 끝
const [count, setCount] = useStatio("counter", 0);

// 복잡한 객체도 OK
const [user, setUser] = useStatio("userProfile", {
  name: "김개발",
  email: "dev@example.com",
  preferences: { theme: "dark" }
});
```

### 🎯 스마트 셀렉터 - 필요한 것만!

```tsx
// 전체 객체 대신 필요한 부분만 구독
const userName = useStatioSelector("userProfile", user => user.name);
const isDarkMode = useStatioSelector("userProfile", user => user.preferences.theme === "dark");

// 리렌더링 최적화 자동!
```

### ⚡ 글로벌 스토어 - 어디서든 접근

```tsx
import { globalStore } from "statio-lib";

// 컴포넌트 외부에서도 자유자재로
globalStore.set("notifications", newNotifications);
const currentUser = globalStore.get("currentUser");

// 실시간 구독도 가능
globalStore.subscribe("cartItems", (items) => {
  console.log(`장바구니에 ${items.length}개 상품이 있습니다`);
});
```

## 🛠️ 파워풀한 미들웨어

### 💾 영속화 미들웨어
```tsx
import { globalStore, persistStatio } from "statio-lib";

// 새로고침해도 상태 유지!
globalStore.use(persistStatio({
  keys: ["userSettings", "cartItems"], // 저장할 키만 선택
  storage: "localStorage", // 또는 "sessionStorage"
}));
```

### 🔍 개발자 도구 연동
```tsx
// Redux DevTools로 상태 변화 추적
globalStore.use(devStatio("MyApp"));
globalStore.use(loggerStatio()); // 콘솔 로깅도 함께
```

### ⚡ 사이드 이펙트 처리
```tsx
// 특정 상태 변경 시 자동 실행
globalStore.use(effectStatio("user", (newUser, oldUser) => {
  if (newUser.id !== oldUser?.id) {
    analytics.track("user_changed", { userId: newUser.id });
  }
}));
```

### ✅ 유효성 검증
```tsx
// 잘못된 데이터는 자동 차단
globalStore.use(validateStatio("email", (email) => {
  return email.includes("@") ? true : "유효한 이메일을 입력하세요";
}));
```

## 🎨 권장 네이밍 컨벤션

### 🏗️ 도메인별 분류
```tsx
// ✅ 좋은 예시
const [userProfile, setUserProfile] = useStatio("userProfile", {});
const [authToken, setAuthToken] = useStatio("authToken", null);
const [themeSettings, setThemeSettings] = useStatio("themeSettings", {});
const [shoppingCartItems, setCartItems] = useStatio("shoppingCartItems", []);

// ❌ 피해야 할 예시  
const [data, setData] = useStatio("data", {}); // 너무 일반적
const [temp, setTemp] = useStatio("temp", {}); // 의미 불분명
```

### 🎯 타입별 네이밍
```tsx
// Boolean 상태
const [isLoading, setIsLoading] = useStatio("isLoading", false);
const [hasPermission, setHasPermission] = useStatio("hasPermission", false);
const [canEdit, setCanEdit] = useStatio("canEdit", false);

// 배열 상태
const [todoList, setTodoList] = useStatio("todoList", []);
const [userItems, setUserItems] = useStatio("userItems", []);
const [notificationQueue, setNotificationQueue] = useStatio("notificationQueue", []);

// 객체 상태
const [userInfo, setUserInfo] = useStatio("userInfo", {});
const [appSettings, setAppSettings] = useStatio("appSettings", {});
const [apiResponseData, setApiResponseData] = useStatio("apiResponseData", {});
```

## 📚 고급 패턴들

### 🔄 커스텀 훅 패턴
```tsx
// 재사용 가능한 상태 로직
function useAuth() {
  const [authState, setAuthState] = useStatio("authState", {
    user: null,
    token: null,
    isAuthenticated: false
  });

  const login = async (credentials) => {
    const response = await api.login(credentials);
    setAuthState({
      user: response.user,
      token: response.token,
      isAuthenticated: true
    });
  };

  const logout = () => {
    setAuthState({ user: null, token: null, isAuthenticated: false });
  };

  return { ...authState, login, logout };
}
```

### 🎭 상태 머신 패턴
```tsx
function useAsyncData(key: string) {
  const [state, setState] = useStatio(key, {
    status: "idle",
    data: null,
    error: null
  });

  const execute = async (asyncFn) => {
    setState({ status: "loading", data: null, error: null });
    try {
      const data = await asyncFn();
      setState({ status: "success", data, error: null });
    } catch (error) {
      setState({ status: "error", data: null, error: error.message });
    }
  };

  return { ...state, execute };
}
```

## 🚀 성능 최적화 팁

### 📊 메모리 효율성
```tsx
// 큰 데이터는 셀렉터로 분할
const totalPrice = useStatioSelector("shoppingCart", 
  cart => cart.items.reduce((sum, item) => sum + item.price, 0)
);

// 불필요한 전체 객체 구독 방지
// ❌ const [cart] = useStatio("shoppingCart", {});
// ✅ const totalPrice = useStatioSelector("shoppingCart", calculateTotal);
```

### ⚡ 렌더링 최적화
```tsx
// 컴포넌트 분리로 리렌더링 범위 최소화
function UserAvatar() {
  const avatar = useStatioSelector("user", user => user.avatar);
  return <img src={avatar} />;
}

function UserName() {
  const name = useStatioSelector("user", user => user.name);
  return <span>{name}</span>;
}
```

## 🔧 API 레퍼런스

### Hooks
| Hook | 설명 | 사용법 |
|------|------|--------|
| `useStatio` | 기본 상태 훅 | `const [state, setState] = useStatio(key, initial)` |
| `useStatioSelector` | 셀렉터 훅 | `const value = useStatioSelector(key, selector)` |

### Global Store
| 메서드 | 설명 | 사용법 |
|--------|------|--------|
| `get(key)` | 상태 조회 | `globalStore.get("user")` |
| `set(key, value)` | 상태 설정 | `globalStore.set("user", userData)` |
| `update(key, updater)` | 상태 업데이트 | `globalStore.update("count", n => n + 1)` |
| `subscribe(key, listener)` | 구독 | `globalStore.subscribe("user", callback)` |

### Middlewares
| 미들웨어 | 기능 | 설정 |
|----------|------|------|
| `persistStatio()` | 영속화 | 로컬/세션 스토리지 저장 |
| `loggerStatio()` | 로깅 | 상태 변경 콘솔 출력 |
| `devStatio()` | 개발도구 | Redux DevTools 연동 |
| `effectStatio()` | 사이드이펙트 | 상태 변경 시 콜백 실행 |
| `validateStatio()` | 유효성검증 | 상태 검증 및 에러 처리 |

## 🤝 Contributing

Statio를 더 멋지게 만들어주세요!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

MIT License - 자유롭게 사용하세요!

---

**Made with ❤️ by developers, for developers**

*"상태관리, 이제 스트레스 받지 마세요" - Statio*
