# Validation

Development platform: Windows, OpenJDK 21, Android platform 35 and build-tools 35.0.0. Browser checks use headless Edge (Chromium). The build packages actual Android DEX, not JVM classes.

## Automated coverage

- Java SDK compilation and lifecycle tests: renderer registration, no redundant publishing, effective custom settings, invalid colour and scale handling, disable and re-enable.
- Official template build-tool tests: Android platform selection, manifest version handling, asset collection. Two platform-specific asset tests are skipped on Windows (symlinks and Windows-invalid filenames).
- Renderer unit tests: fractional second angles for all hands, midnight wrap, responsive geometry and colour precedence.
- Browser checks: 800×800, 1280×800, 1920×1080, 800×1280, and 480×800 reduced viewport. Check numeral/date bounds, SVG transforms, no JavaScript errors, local-only requests, custom colour application, hidden elements, resizing and invalid time-zone fallback.
- Virtual-time browser checks cross midnight and jump ahead five minutes, then change wall time to represent a suspended document resuming. This checks correctness; it does not benchmark real five-minute frame pacing.
- Previews in `docs/previews/` and `comparison.html` support side-by-side visual comparison with the user-supplied reference. `reference.png` is the unchanged user attachment, included only for documentation and excluded from the plugin ZIP. No physical watch bezel is drawn. Numeral outlines are an approximation made specifically for the project.

## Device acceptance — confirmed

On 20 October 2026, the maintainer confirmed that device acceptance testing was completed and the plugin was working. This records the maintainer's device verification; the desktop automated suite remains separate.

### Regression checklist

For future releases, repeat the following device checks:

- Select Watch Clock in normal mode and a schedule, with and without Now Playing and stock widgets.
- Observe the seconds hand for several real minutes, including the 12 o'clock wrap; confirm fluid movement on the target display.
- Dismiss by touch, reactivate, turn the screen off and wake, and background/foreground KS. Confirm the first visible frame shows current time.
- Rotate landscape/portrait and change Now Playing layouts while active. Check all numerals and date remain visible.
- Change every preset, custom colour, date setting, time zone, layout, alignment and scale while active. Verify presets retain custom settings and do not inherit them.
- Disable and re-enable the plugin, restart KS, and verify the selected mode reconnects.
- Test offline, at midnight, across a daylight-saving change and after a manual system-clock/time-zone change.
- Leave running overnight; check memory, frame pacing, device temperature and stock screen-off/wake policies.

Desktop tests cannot establish Android integration, hardware frame rate, physical wake behaviour or long-running device stability. Those results are intentionally not claimed here.
