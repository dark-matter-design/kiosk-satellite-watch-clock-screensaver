# Watch Clock for Kiosk Satellite

A colourful analogue clock screensaver for [Kiosk Satellite](https://github.com/jxlarrea/kiosk-satellite), with oversized vector numerals, rounded hands and a sweeping seconds hand. Choose a colour preset or make your own, then adjust the layout, date and time zone from the native plugin settings.

![Watch Clock in the Original Green colour scheme](docs/previews/square.png)

## Requirements

- Android 7.0 (API 24) or newer.
- A current Kiosk Satellite build supporting SDK 1 asset screensavers and conditional native settings.

## Installation

### Install button

Open the plugin in Kiosk Satellite, review it and choose **Trust and install**.

[![Install in Kiosk Satellite](https://kiosksatellite.com/img/badges/plugin-add.svg)](https://kiosksatellite.com/redirect/plugin/?repository=dark-matter-design/kiosk-satellite-watch-clock-screensaver)

The button uses the [Community Plugins](https://kiosksatellite.com/plugins/) installer. If the plugin is not available there yet, use the manual steps below. Once listed, you can also search for **Watch Clock** under **Settings > Plugin Manager > Browse plugins**.

### Manual installation

1. Open **Settings > Plugin Manager** and turn on **Enable Plugins**.
2. Choose **Add plugin**, paste the repository URL below and choose **Preview**.
3. Review the plugin and choose **Trust and install**.

```text
https://github.com/dark-matter-design/kiosk-satellite-watch-clock-screensaver
```

For local development, use **Developer Tools > Install from ZIP** with a built package from `dist/`. A local ZIP cannot replace a GitHub-installed copy.

## Set up the screensaver

1. Enable **Watch Clock** in Plugin Manager.
2. Select **Screensaver > Screensaver mode > Watch Clock (Watch Clock)**. You can also use it in screensaver schedules.
3. Open **Plugin Manager > Watch Clock** to customise the face. Changes apply without restarting Kiosk Satellite.

Keep Kiosk Satellite's **Screensaver > Pixel shift** off when using the plugin's **Clock pixel shift**. The plugin moves the numerals, hands and date once per minute while keeping the background fixed; the host setting moves the whole surface and can expose black edges.

## Settings

| Setting | Options and defaults |
| --- | --- |
| Colour scheme | Original Green (default), Midnight Black, Deep Blue, Navy, Red, Orange, Purple, Pink, Cream, White or Custom |
| Custom colours | Separate colours for the background, numerals, hands, seconds hand, pivot and date; shown when Custom is selected |
| Layout | Original proportions (default) or Adaptive |
| Scale and alignment | 50-100% scale (100% default); Centre (default), Left, Right, Top or Bottom |
| Clock pixel shift | Enabled by default; shifts clock content once per minute |
| Seconds hand | Enabled by default |
| Date | Enabled by default, in the bottom-left corner; all four corners are available |
| Date format | Short weekday + day (default), Day + short month or Numeric date |
| Time zone | Local device time (default), or an IANA name such as `Australia/Sydney` or `UTC` |

Preset themes keep your saved custom colours, so you can switch back to Custom later. Invalid colours fall back to the green theme; an invalid time zone falls back to local time. Dates follow the device locale.

**Original proportions** keeps a centred square composition. **Adaptive** spreads the cardinal numerals along the longer screen axis while retaining the hands' proportions. Scale and alignment work within the available viewport, including space beside Now Playing.

## Privacy

Watch Clock runs entirely on the kiosk. It makes no network requests, sends no data to external services and uses local assets and fonts. The only requested plugin capability is `screensaver`.

## Development and validation

See [development instructions](docs/DEVELOPMENT.md) for the toolchain, build, tests, rendering implementation and release process. The [validation checklist](docs/VALIDATION.md) covers automated tests and device acceptance, confirmed by the maintainer on 20 October 2026.

## License

[Apache-2.0](LICENSE). See [third-party notices](THIRD_PARTY_NOTICES.md) for attribution. This is an independent community plugin and is not affiliated with Apple. The numerals are original geometric paths; no proprietary Apple font or artwork is bundled.
