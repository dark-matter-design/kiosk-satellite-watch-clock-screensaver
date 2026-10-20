# Development

Paths and commands below are relative to the repository root.

## Build and test

Based on the official [Hello World template](https://github.com/jxlarrea/kiosk-satellite-plugin-hello-world), source revision `fa121064e72d7d321464cdd69b3757951c47623a`. The unmodified SDK sources and Apache license are retained. Rendering follows the [screensaver API](https://github.com/jxlarrea/kiosk-satellite-plugin-hello-world/blob/main/docs/screensavers.md).

Install Python 3, JDK 17+ (tested with 21), Node.js 18+, and Android SDK platform 35 / build-tools 35.0.0. Set `JAVA_HOME` and `ANDROID_HOME`; put Node on PATH or set `NODE` to its executable.

```sh
python3 tools/test.py
python3 tools/build.py
```

On Windows, `python` can be used instead of `python3`. If using the workspace-local toolchain prepared during development, run:

```powershell
$env:JAVA_HOME = (Get-ChildItem .toolchain/jdk -Directory | Select-Object -First 1).FullName
$env:ANDROID_HOME = Join-Path (Get-Location) '.toolchain/android-sdk'
python tools/test.py
python tools/build.py
```

The builder produces `dist/watch-clock-1.0.1.zip`, its `.zip.sha256`, a matching standalone manifest and a compile-time SDK JAR. Only plugin DEX classes, the manifest, license, directory icon and four clock assets go into the installable ZIP; the SDK JAR is not bundled.

Optional browser validation uses Playwright and a Chromium browser:

```sh
npm install --no-save playwright@1.62.1
npx playwright install chromium
node tests/browser.test.cjs
```

Set `BROWSER_CHANNEL=chromium` for bundled Chromium, `chrome` for installed Chrome or `msedge` for installed Edge (the default). Preview PNGs are written to `docs/previews/`. Browser tooling is only for development and is never packaged.

## Implementation

`WatchClockPlugin.java` publishes `clock/index.html` with scalar settings during start and when effective options change, and removes it on stop. The stable mode is `plugin:watch-clock:clock`. It has no timers or host subscriptions. No renderer is published on animation frames.

`clock-core.js` contains palettes, angles and safe responsive geometry. `clock.js` uses a single `requestAnimationFrame` loop and SVG transforms. Time is interpolated with `performance.now()` between system-clock anchors, synchronized each second and immediately after a clock correction. Every hand includes fractional seconds. Hidden/page-hidden documents cancel their callback; resumption reads current time. No frame deltas are accumulated. Date text changes only when needed. All assets are local, with a restrictive content security policy.

KS owns activation, schedules, brightness, dismissal, screen-off, widgets, host-wide pixel shift and Now Playing. The plugin's Clock pixel shift moves only the clock content, keeping the background fixed; leave host-wide Screensaver > Pixel shift off to avoid moving the whole surface. Settings changes recreate the renderer as required by the SDK; they do not restart KS. The plugin does not implement any of those host policies.

The four numerals are original geometric SVG paths. No proprietary Apple typeface or artwork is included. The shapes closely approximate the reference; they are not pixel-identical to Apple's custom typography. The small date uses the device's local sans-serif font. Frame rate depends on the Android WebView and display; 60 FPS is a target, not a guarantee on all devices.

## Publish

Push this repository to your own public GitHub repository, commit the source and tag a version such as `v1.0.1`, then publish a stable GitHub release. `.github/workflows/build.yml` tests and builds the tagged source on GitHub and uploads the ZIP, checksum and matching manifest using `github.token`.

Use all three assets from the same workflow run. KS requires the uploader to be `github-actions[bot]`; manually uploaded release assets or uploads using a personal access token are rejected. Drafts and prereleases are not available through normal installation. The workflow can be retried manually against an existing release tag. See the official [release requirements](https://github.com/jxlarrea/kiosk-satellite-plugin-hello-world/blob/main/docs/creating-plugins.md#repository-and-release).

See [validation and device checklist](VALIDATION.md) for automated coverage and maintainer-confirmed device acceptance.
