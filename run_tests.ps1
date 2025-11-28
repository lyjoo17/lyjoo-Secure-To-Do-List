$serverProcess = Start-Process -FilePath "node" -ArgumentList "src/server.js" -PassThru -NoNewWindow -WorkingDirectory "backend"
Write-Host "서버 시작 중... (PID: $($serverProcess.Id))"
Start-Sleep -Seconds 5

try {
    Write-Host "테스트 스크립트 실행 중..."
    node backend/test-scenarios.js
} catch {
    Write-Host "테스트 실행 중 오류 발생: $_"
} finally {
    Write-Host "서버 종료 중..."
    Stop-Process -Id $serverProcess.Id
}
