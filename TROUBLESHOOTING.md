# 🔧 500 에러 문제 해결 가이드

## 문제 증상
- 게시물 작성 시 500 에러 발생
- 게시물 목록 로딩 실패
- "게시물을 불러오는데 실패했습니다" 메시지 표시

## 해결 방법 (순서대로 확인)

### 1️⃣ Supabase Storage 버킷 생성 확인

**문제**: `uploads` 버킷이 없으면 파일 업로드가 실패합니다.

**확인 방법**:
1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. 좌측 메뉴에서 **Storage** 클릭
4. `uploads` 버킷이 있는지 확인

**없다면 생성**:
1. **"New bucket"** 클릭
2. Name: `uploads` 입력
3. **Public bucket** 체크 (또는 필요에 따라 선택)
4. **"Create bucket"** 클릭

---

### 2️⃣ 데이터베이스 마이그레이션 실행 확인

**문제**: 테이블이 생성되지 않았으면 데이터 조회/저장이 실패합니다.

**확인 방법**:
1. Supabase Dashboard → **SQL Editor**
2. 다음 쿼리 실행하여 테이블 존재 여부 확인:

```sql
-- 테이블 목록 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

**필요한 테이블**:
- `users`
- `posts`
- `likes`
- `comments`
- `follows`

**테이블이 없다면 마이그레이션 실행**:

#### 방법 1: SQL Editor에서 직접 실행

1. Supabase Dashboard → **SQL Editor** → **"New query"**
2. `supabase/migrations/sns.sql` 파일 내용 전체 복사
3. SQL Editor에 붙여넣기
4. **"Run"** 클릭
5. 성공 메시지 확인

#### 방법 2: 파일별로 순서대로 실행

1. `setup_schema.sql` 실행
2. `setup_storage.sql` 실행 (Storage RLS 정책)
3. `sns.sql` 실행 (메인 테이블들)

---

### 3️⃣ 환경 변수 확인

**문제**: 환경 변수가 없으면 Supabase 연결이 실패합니다.

**확인 방법**:

프로젝트 루트에 `.env` 파일이 있고 다음 값들이 모두 채워져 있는지 확인:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
NEXT_PUBLIC_STORAGE_BUCKET="uploads"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL="/"
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL="/"
```

**환경 변수 가져오기**:

1. Supabase Dashboard → **Settings** → **API**
2. 다음 값 복사:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

3. Clerk Dashboard → **API Keys**
4. 다음 값 복사:
   - **Publishable key** → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - **Secret key** → `CLERK_SECRET_KEY`

**⚠️ 환경 변수 변경 후 반드시**:
```bash
# 개발 서버 재시작 (Ctrl+C 후)
pnpm dev
```

---

### 4️⃣ 사용자 동기화 확인

**문제**: Clerk에 로그인했지만 Supabase `users` 테이블에 사용자가 없으면 게시물 작성이 실패합니다.

**확인 방법**:

1. Supabase Dashboard → **Table Editor** → `users` 테이블
2. 현재 로그인한 사용자가 있는지 확인

**사용자가 없다면**:
1. 웹사이트에서 로그아웃
2. 다시 로그인
3. 자동으로 `users` 테이블에 동기화됨
4. Supabase Dashboard에서 확인

---

## 서버 터미널 로그 확인

**가장 중요한 단계**: 개발 서버 터미널에서 실제 에러 메시지를 확인하세요.

```bash
# 개발 서버가 실행 중인 터미널에서 확인
# "pnpm dev" 명령어를 실행한 PowerShell 또는 CMD 창

# 에러 로그 예시:
# ❌ Storage 업로드 에러: { message: "Bucket not found" }
# ❌ 게시물 저장 에러: { code: "42P01", message: "relation 'posts' does not exist" }
# ❌ Error: Supabase URL or Service Role Key is missing
```

**에러 메시지를 복사해서 알려주시면 정확한 해결 방법을 제시할 수 있습니다.**

---

## 빠른 확인 스크립트

터미널에서 실행하여 환경 변수를 확인:

```bash
# Windows PowerShell
echo $env:NEXT_PUBLIC_SUPABASE_URL
echo $env:SUPABASE_SERVICE_ROLE_KEY

# Mac/Linux
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
```

값이 표시되지 않으면 `.env` 파일이 없거나 잘못 설정된 것입니다.

---

## 여전히 해결되지 않는다면

1. **서버 터미널의 전체 에러 로그** 복사
2. **브라우저 개발자 도구 (F12) → Network 탭 → /api/posts 요청 클릭 → Response 탭** 내용 복사
3. 위 내용을 알려주시면 정확한 해결 방법을 제시하겠습니다.

---

## 모든 것을 처음부터 다시 설정

위 방법들로 해결되지 않으면 다음 순서로 처음부터 설정:

1. Supabase에서 모든 테이블 삭제
2. SQL Editor에서 `supabase/migrations/sns.sql` 전체 실행
3. Storage에서 `uploads` 버킷 생성
4. `.env` 파일 다시 확인
5. 개발 서버 재시작
6. 로그아웃 후 다시 로그인 (사용자 동기화)
7. 게시물 작성 시도

