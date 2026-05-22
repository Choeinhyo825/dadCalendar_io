# 아빠 달력 (웹)

Android 앱 [`dadCalendar`](../dadCalendar)과 같은 4일 주기 근무(일반→휴무→당직→휴무)를 **브라우저**에서 보는 버전입니다.  
GitHub Pages로 배포해 iPhone·PC에서 URL만으로 사용할 수 있습니다.

## 기능

- 근무 표시: 일반(테두리), 당직(채움), 휴무(숫자만)
- 오늘: 붉은 원 + 흰 숫자 (근무 사각형 유지)
- 주말 색 (일 빨강, 토 파랑)
- 월 이동: ◀ ▶, 연·월 선택
- 기준일·근무(일반/당직) 설정 → `localStorage` 저장
- 오늘로 이동

앱에 없는 것: 위젯, 수동 변경, 공유

## 로컬에서 보기

```bash
cd D:\dev\dadCalendar_io
# ES module 이므로 로컬 서버 권장 (Python 예시)
python -m http.server 8080
```

브라우저에서 `http://localhost:8080` 접속.

> `index.html`을 파일로 직접 열면(`file://`) 브라우저에 따라 모듈 로드가 막힐 수 있습니다. GitHub Pages 또는 위처럼 간단한 서버를 쓰면 됩니다.

## GitHub Pages 연결

1. GitHub에서 새 저장소 생성 (예: `dadCalendar_io`, Public)
2. 이 폴더에서 원격 연결 후 push:

```bash
cd D:\dev\dadCalendar_io
git init
git add .
git commit -m "Add GitHub Pages web calendar"
git branch -M main
git remote add origin https://github.com/<사용자명>/dadCalendar_io.git
git push -u origin main
```

3. GitHub 저장소 → **Settings** → **Pages**
   - Source: **Deploy from a branch**
   - Branch: `main` / folder: **`/ (root)`**
4. **Settings → Pages → Build and deployment → Source:** `GitHub Actions`  
   (또는 Source: `Deploy from a branch`, Branch: `main`, Folder: `/ (root)`)

5. 배포 후 접속 (본인 계정 기준):

   **https://choeinhyo825.github.io/dadCalendar_io/**

iPhone Safari에서 위 URL을 열고 **공유 → 홈 화면에 추가**하면 앱처럼 쓸 수 있습니다.

> 첫 배포는 push 후 Actions 탭에서 workflow가 성공할 때까지 1~3분 걸릴 수 있습니다.

## Android 프로젝트와의 관계

| 항목 | `D:\dev\dadCalendar` | `D:\dev\dadCalendar_io` |
|------|----------------------|-------------------------|
| 플랫폼 | Android 앱 + 위젯 | 정적 웹 (GitHub Pages) |
| 저장소 | 별도 git (유지) | 이 폴더 전용 git |
| 근무 계산 | Java | JavaScript (`js/schedule.js`) |

두 프로젝트는 **같은 폴더 안에 있지 않으며**, 규칙을 맞춰 각각 유지합니다.
