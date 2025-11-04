/**
 * Supabase 연결 및 테이블 확인 스크립트
 * 실행: node scripts/check-supabase.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n🔍 Supabase 연결 테스트\n');

// 1. 환경 변수 확인
console.log('1️⃣ 환경 변수 확인:');
console.log('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ 설정됨' : '❌ 없음');
console.log('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ 설정됨' : '❌ 없음');
console.log('- URL 값:', supabaseUrl);
console.log('');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

// 2. Supabase 클라이언트 생성
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSupabase() {
  try {
    // 3. 테이블 존재 확인
    console.log('2️⃣ 테이블 존재 확인:');
    
    const tables = ['users', 'posts', 'likes', 'comments', 'follows'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`- ${table}: ❌ 에러 - ${error.message}`);
        } else {
          console.log(`- ${table}: ✅ 존재함 (행 수: ${data?.length || 0})`);
        }
      } catch (err) {
        console.log(`- ${table}: ❌ 에러 - ${err.message}`);
      }
    }
    console.log('');

    // 4. Storage 버킷 확인
    console.log('3️⃣ Storage 버킷 확인:');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.log('❌ Storage 조회 에러:', bucketsError.message);
    } else {
      console.log('존재하는 버킷들:');
      buckets.forEach(bucket => {
        console.log(`- ${bucket.name} (${bucket.public ? 'Public' : 'Private'})`);
      });
      
      const uploadsExists = buckets.some(b => b.name === 'uploads');
      console.log('');
      console.log('uploads 버킷:', uploadsExists ? '✅ 존재함' : '❌ 없음');
    }
    console.log('');

    // 5. 사용자 존재 확인
    console.log('4️⃣ 사용자 테이블 확인:');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);
    
    if (usersError) {
      console.log('❌ 사용자 조회 에러:', usersError.message);
    } else {
      console.log(`✅ 사용자 수: ${users?.length || 0}`);
      if (users && users.length > 0) {
        console.log('샘플 사용자:');
        users.forEach(user => {
          console.log(`- ${user.name} (Clerk ID: ${user.clerk_id})`);
        });
      }
    }
    console.log('');

    // 6. 게시물 존재 확인
    console.log('5️⃣ 게시물 테이블 확인:');
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .limit(5);
    
    if (postsError) {
      console.log('❌ 게시물 조회 에러:', postsError.message);
    } else {
      console.log(`✅ 게시물 수: ${posts?.length || 0}`);
    }
    console.log('');

    console.log('✅ 테스트 완료!\n');
  } catch (error) {
    console.error('❌ 전체 테스트 에러:', error);
  }
}

checkSupabase();

