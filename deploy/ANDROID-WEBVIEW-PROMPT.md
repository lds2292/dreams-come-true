# Android Studio AI 프롬프트 — DreamsComeTrue WebView 앱

Android Studio의 Gemini(또는 GitHub Copilot) 채팅창에 아래 프롬프트를 그대로 붙여넣어 사용하세요.

---

## 프롬프트

```
Create a native Android WebView application with the following specifications:

## App Info
- App name: DreamsComeTrue (꿈해몽·운세)
- Package name: com.dreamscometrue.app
- Minimum SDK: API 26 (Android 8.0)
- Target SDK: API 34 (Android 14)
- Language: Kotlin
- Build system: Gradle (Kotlin DSL)

## WebView Target URL
- Production URL: https://d1fjqnba5t46kv.cloudfront.net
- Load this URL on app launch

## WebView Configuration
Enable the following WebView settings:
- javaScriptEnabled = true
- domStorageEnabled = true  ← localStorage 사용 필수
- databaseEnabled = true
- allowFileAccess = false
- mixedContentMode = MIXED_CONTENT_NEVER_ALLOW
- setSupportZoom(false)     ← 핀치 줌 비활성화
- builtInZoomControls = false
- displayZoomControls = false
- useWideViewPort = true
- loadWithOverviewMode = true
- cacheMode = LOAD_DEFAULT

## WebViewClient
Implement a custom WebViewClient:
- Override shouldOverrideUrlLoading: keep all navigation within the WebView (do not open external browser) unless the URL scheme is not http/https (e.g. tel:, mailto: should open system app)
- Override onPageStarted: show a loading spinner
- Override onPageFinished: hide the loading spinner
- Override onReceivedError: show a custom error layout with a retry button that calls webView.reload()
- Override onReceivedSslError: call handler.cancel() (do not proceed on SSL error)

## WebChromeClient
Implement a custom WebChromeClient:
- Override onProgressChanged: update a progress bar (hide when progress reaches 100)
- Override onConsoleMessage: log to Logcat in debug builds only

## UI / Layout
- Use edge-to-edge display (WindowCompat.setDecorFitsSystemWindows = false)
- Status bar: transparent, dark icons (the web app has a dark purple background)
- Navigation bar: transparent, handle insets so WebView content is not obscured
- Splash screen: show app icon centered on #111022 background color until first page load completes (use the SplashScreen API for Android 12+, fallback for older versions)
- Loading overlay: full-screen semi-transparent (#111022) with a circular ProgressBar (color #7c3aed) shown while the page is loading

## Hardware Back Button
- Override onBackPressedDispatcher: if webView.canGoBack() → webView.goBack()
- If cannot go back → show an AlertDialog asking "앱을 종료하시겠습니까?" with 확인/취소 buttons
- Double-back-press-to-exit pattern (optional alternative)

## Network Handling
- Check network connectivity before loading the URL
- If no network: show an offline error layout with a "다시 시도" button
- Register a ConnectivityManager NetworkCallback to auto-reload when network is restored

## Permissions
Add to AndroidManifest.xml:
- <uses-permission android:name="android.permission.INTERNET" />
- <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

## AndroidManifest.xml - Activity settings
- android:configChanges="orientation|screenSize|keyboardHidden"
- android:windowSoftInputMode="adjustResize"  ← 키보드 올라올 때 WebView 리사이즈
- android:exported="true"
- android:screenOrientation="portrait"  ← 세로 고정

## JavaScript Bridge (선택)
Create a JavascriptInterface class named "AndroidBridge" with the following methods:
- fun getAppVersion(): String  → return BuildConfig.VERSION_NAME
- fun closeApp()               → finish() the activity
- fun vibrate(duration: Long)  → use Vibrator/VibrationEffect
Inject with: webView.addJavascriptInterface(AndroidBridge(this), "AndroidBridge")

## File Structure
Generate the following files:
1. MainActivity.kt — main activity with WebView setup
2. WebAppInterface.kt — JavascriptInterface bridge class
3. NetworkUtils.kt — network connectivity helper
4. activity_main.xml — layout with WebView + loading overlay + error layout
5. AndroidManifest.xml — with correct permissions and activity config
6. build.gradle.kts (app) — with correct dependencies

## Dependencies (build.gradle.kts)
implementation("androidx.core:core-ktx:1.12.0")
implementation("androidx.appcompat:appcompat:1.6.1")
implementation("androidx.core:core-splashscreen:1.0.1")
implementation("com.google.android.material:material:1.11.0")
implementation("androidx.constraintlayout:constraintlayout:2.1.4")

## Additional Notes
- The web app is a Vue 3 SPA with Korean content (꿈해몽, 사주, 운세 service)
- The web app uses localStorage for auth token (key: dct_user) and recent searches (key: dct_recent) — ensure domStorageEnabled is true
- The web app has viewport-fit=cover and handles safe-area-inset itself — match this with edge-to-edge setup
- The web app disables user zoom — match this by disabling WebView zoom as well
- Status bar color should match the web app's dark purple header (#111022 or #1B1A2E)
- The web app background is dark (#111022) — set the WebView background color to match to avoid white flash on load
```

---

## 추가 프롬프트 (기능별 확장)

### 앱 아이콘 설정
```
Generate adaptive icon resources for the DreamsComeTrue app:
- Foreground: a crescent moon SVG centered on transparent background
- Background color: #3b0764 (deep purple)
- Place in res/mipmap-* directories with correct densities (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)
- Also generate a monochrome icon for Android 13+ themed icons
```

### 딥링크 설정
```
Add deep link support to MainActivity so that URLs matching
https://d1fjqnba5t46kv.cloudfront.net/* open directly in the app instead of the browser.
Add the appropriate intent-filter with autoVerify="true" to AndroidManifest.xml,
and handle the incoming intent in onCreate/onNewIntent to load the correct URL path in the WebView.
```

### Google Play 릴리즈 준비
```
Configure the app for Google Play Store release:
- Set up signing config in build.gradle.kts using a keystore file (reference via local.properties)
- Add ProGuard/R8 rules to keep the WebView-related classes and JavascriptInterface methods
- Set versionCode and versionName (start with versionCode=1, versionName="1.0.0")
- Add a release build type with minifyEnabled=true and shrinkResources=true
```

---

## 참고 — 웹앱 연동 포인트

| 항목 | 웹앱 설정 | Android 대응 |
|------|----------|-------------|
| 핀치 줌 비활성 | `user-scalable=no` | `setSupportZoom(false)` |
| 다크 배경 | `background: #111022` | `webView.setBackgroundColor(Color.parseColor("#111022"))` |
| Safe Area | `viewport-fit=cover` + CSS env() | Edge-to-edge + transparent bars |
| 키보드 대응 | 스크롤 레이아웃 | `windowSoftInputMode="adjustResize"` |
| 로컬 스토리지 | localStorage 사용 | `domStorageEnabled = true` |
| JS Bridge | `window.AndroidBridge.*` 호출 가능 | `addJavascriptInterface` |
