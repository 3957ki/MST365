import { MCPClient } from './mcp/mcpClient';

async function testSnapshot() {
  const client = new MCPClient();

  try {
    console.log('MCP 클라이언트 연결 중...');
    await client.connect();

    // 브라우저 시작
    console.log('브라우저 시작...');
    await client.executeAction('browserLaunch', {});

    // 브라우저 컨텍스트 생성
    console.log('브라우저 컨텍스트 생성...');
    await client.executeAction('browserNewContext', {});

    // 새 페이지 생성
    console.log('새 페이지 생성...');
    await client.executeAction('contextNewPage', {});

    // 페이지로 이동
    console.log('페이지로 이동...');
    await client.executeAction('pageGoto', { url: 'https://example.com' });

    // 페이지 로드 대기
    console.log('페이지 로드 대기...');
    await client.executeAction('pageWaitForLoadState', { timeout: 5000 });

    // 스냅샷 실행 및 결과 확인
    console.log('스냅샷 실행...');
    const snapshotResult = await client.executeAction('pageSnapshot', {});
    console.log('스냅샷 결과:', JSON.stringify(snapshotResult, null, 2));

    // 스크린샷도 함께 확인
    console.log('스크린샷 실행...');
    const screenshotResult = await client.executeAction('pageScreenshot', {});
    console.log(
      '스크린샷 결과 (바이너리 데이터 길이):',
      screenshotResult.binary ? screenshotResult.binary.length : 'No data'
    );

    // 브라우저 닫기
    console.log('브라우저 닫기...');
    await client.executeAction('contextClose', {});
  } catch (error) {
    console.error('테스트 실패:', error);
  } finally {
    // 연결 해제
    console.log('연결 해제...');
    await client.disconnect();
  }
}

// 테스트 실행
testSnapshot()
  .then(() => console.log('테스트 완료'))
  .catch((err) => console.error('테스트 오류:', err));
