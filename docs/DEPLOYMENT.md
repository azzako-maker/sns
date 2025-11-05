# 🚀 배포 가이드

이 문서는 Next.js + Clerk + Supabase 기반 SNS 프로젝트의 배포 절차를 안내합니다.

---

## 📋 사전 준비사항

### 1. 환경 변수 설정

프로덕션 환경에서 필요한 환경 변수들을 확인하고 설정하세요.

#### `.env.production` 파일 생성

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_STORAGE_BUCKET=uploads
```

#### 환경 변수 확인 체크리스트

- [ ] Clerk 프로덕션 키 발급 완료
- [ ] Supabase 프로덕션 프로젝트 생성 완료
- [ ] Supabase API 키 확인 완료
- [ ] Storage 버킷 (`uploads`) 생성 완료
- [ ] 모든 환경 변수가 `.env.production`에 설정됨

---

## 🔧 Vercel 배포 설정

### 1. Vercel 프로젝트 생성

1. [Vercel](https://vercel.com)에 로그인
2. "Add New Project" 클릭
3. GitHub 저장소 연결
4. 프로젝트 설정:
   - **Framework Preset**: Next.js
   - **Build Command**: `pnpm build` (또는 `npm run build`)
   - **Output Directory**: `.next`
   - **Install Command**: `pnpm install` (또는 `npm install`)

### 2. 환경 변수 설정 (Vercel Dashboard)

Vercel 대시보드에서 다음 환경 변수들을 설정하세요:

1. **Settings** → **Environment Variables** 이동
2. 각 환경 변수 추가:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
   - `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`
   - `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_STORAGE_BUCKET`

3. **Environment** 선택:
   - Production
   - Preview
   - Development (필요시)

### 3. Vercel 배포 설정 파일 (선택사항)

프로젝트 루트에 `vercel.json` 파일을 생성할 수 있습니다:

```json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["icn1"]
}
```

### 4. 배포 실행

1. GitHub에 코드 푸시
2. Vercel이 자동으로 배포 시작
3. 배포 완료 후 URL 확인

---

## 🗄️ Supabase 프로덕션 설정

### 1. 프로덕션 프로젝트 생성

1. [Supabase Dashboard](https://supabase.com/dashboard)에 로그인
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - **Name**: 프로젝트 이름
   - **Database Password**: 강력한 비밀번호 설정
   - **Region**: 가장 가까운 리전 선택

### 2. 마이그레이션 적용

프로덕션 데이터베이스에 마이그레이션을 적용하세요:

```bash
# Supabase CLI 설치 (없는 경우)
npm install -g supabase

# Supabase 로그인
supabase login

# 프로젝트 연결
supabase link --project-ref your-project-ref

# 마이그레이션 적용
supabase db push
```

또는 Supabase Dashboard에서 직접 SQL을 실행:

1. **SQL Editor** 이동
2. `supabase/migrations/` 디렉토리의 모든 SQL 파일 내용을 순서대로 실행

### 3. Storage 버킷 설정

#### 버킷 생성

1. Supabase Dashboard → **Storage** 이동
2. "Create a new bucket" 클릭
3. 버킷 정보:
   - **Name**: `uploads`
   - **Public bucket**: ✅ 체크 (공개 접근 허용)

#### RLS 정책 설정 (프로덕션)

프로덕션 환경에서는 RLS를 활성화하고 적절한 정책을 설정해야 합니다.

**주의**: 개발 중에는 RLS를 비활성화했지만, 프로덕션에서는 반드시 활성화해야 합니다.

**Storage RLS 정책 예시**:

```sql
-- Storage RLS 활성화 (이미 setup_storage.sql에 포함되어 있을 수 있음)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- INSERT 정책: 인증된 사용자만 자신의 폴더에 업로드 가능
CREATE POLICY "Users can upload to own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'uploads' AND
  (storage.foldername(name))[1] = auth.jwt()->>'sub'
);

-- SELECT 정책: 인증된 사용자만 파일 조회 가능
CREATE POLICY "Users can view own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'uploads' AND
  (storage.foldername(name))[1] = auth.jwt()->>'sub'
);

-- DELETE 정책: 인증된 사용자만 자신의 파일 삭제 가능
CREATE POLICY "Users can delete own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'uploads' AND
  (storage.foldername(name))[1] = auth.jwt()->>'sub'
);
```

### 4. 데이터베이스 RLS 정책 검토

프로덕션 환경에서는 모든 테이블에 적절한 RLS 정책을 설정해야 합니다.

**현재 상태**: 개발 중에는 RLS가 비활성화되어 있습니다.

**프로덕션 전환 시 체크리스트**:

- [ ] `users` 테이블 RLS 정책 설정
- [ ] `posts` 테이블 RLS 정책 설정
- [ ] `likes` 테이블 RLS 정책 설정
- [ ] `comments` 테이블 RLS 정책 설정
- [ ] `follows` 테이블 RLS 정책 설정
- [ ] Storage RLS 정책 설정

**RLS 정책 예시** (각 테이블별로 필요):

```sql
-- posts 테이블 예시
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 게시물 조회 가능
CREATE POLICY "Anyone can view posts"
ON posts
FOR SELECT
TO public
USING (true);

-- 인증된 사용자만 게시물 작성 가능
CREATE POLICY "Authenticated users can create posts"
ON posts
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 본인 게시물만 수정/삭제 가능
CREATE POLICY "Users can update own posts"
ON posts
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own posts"
ON posts
FOR DELETE
TO authenticated
USING (user_id = auth.uid());
```

**주의**: `auth.uid()`는 Supabase Auth의 사용자 ID를 반환합니다. 
이 프로젝트는 Clerk를 사용하므로, `auth.jwt()->>'sub'` (Clerk user ID)를 사용해야 합니다.

---

## 🧪 배포 후 테스트

### 1. 기능 테스트 체크리스트

- [ ] 홈 피드 로딩 확인
- [ ] 게시물 작성 기능 확인
- [ ] 좋아요 기능 확인
- [ ] 댓글 작성/삭제 기능 확인
- [ ] 프로필 페이지 확인
- [ ] 팔로우/언팔로우 기능 확인
- [ ] 게시물 상세 페이지 확인
- [ ] 이미지 업로드 확인
- [ ] 반응형 디자인 확인 (Desktop/Tablet/Mobile)

### 2. 성능 테스트

- [ ] Lighthouse 점수 확인
- [ ] 이미지 로딩 속도 확인
- [ ] API 응답 시간 확인
- [ ] 무한 스크롤 동작 확인

### 3. 보안 테스트

- [ ] 인증되지 않은 사용자 접근 제한 확인
- [ ] RLS 정책 동작 확인
- [ ] CORS 설정 확인
- [ ] 환경 변수 노출 여부 확인

---

## 📊 모니터링 설정

### 1. Vercel Analytics

Vercel 대시보드에서 Analytics를 활성화하여 성능을 모니터링할 수 있습니다.

### 2. Supabase Dashboard

Supabase Dashboard에서 다음을 모니터링:
- 데이터베이스 쿼리 성능
- Storage 사용량
- API 호출 수

### 3. 에러 모니터링 (선택사항)

Sentry, LogRocket 등의 에러 모니터링 서비스를 추가할 수 있습니다.

---

## 🔄 지속적 배포 (CI/CD)

### GitHub Actions (선택사항)

`.github/workflows/deploy.yml` 파일을 생성하여 자동 배포를 설정할 수 있습니다:

```yaml
name: Deploy to Vercel

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install -g pnpm
      - run: pnpm install
      - run: pnpm build
```

---

## 🐛 문제 해결

### 일반적인 문제

1. **환경 변수 누락**
   - Vercel 대시보드에서 모든 환경 변수가 설정되었는지 확인

2. **CORS 에러**
   - Supabase Dashboard에서 CORS 설정 확인
   - Clerk 설정에서 허용된 도메인 확인

3. **RLS 정책 에러**
   - 프로덕션에서 RLS 정책이 올바르게 설정되었는지 확인
   - `auth.jwt()->>'sub'`를 사용하여 Clerk user ID 확인

4. **이미지 로딩 실패**
   - `next.config.ts`에서 이미지 도메인 설정 확인
   - Supabase Storage 버킷이 공개로 설정되었는지 확인

---

## 📝 배포 체크리스트

배포 전 최종 확인:

### 환경 설정
- [ ] 모든 환경 변수 설정 완료
- [ ] 프로덕션 키 발급 완료
- [ ] 도메인 설정 완료 (필요시)

### 데이터베이스
- [ ] 마이그레이션 적용 완료
- [ ] RLS 정책 설정 완료
- [ ] Storage 버킷 생성 완료

### 보안
- [ ] RLS 정책 검토 완료
- [ ] 환경 변수 노출 방지 확인
- [ ] CORS 설정 확인

### 테스트
- [ ] 기능 테스트 완료
- [ ] 성능 테스트 완료
- [ ] 보안 테스트 완료

---

**마지막 업데이트**: 2025-01-04

