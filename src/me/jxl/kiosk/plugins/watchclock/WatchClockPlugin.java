// SPDX-License-Identifier: Apache-2.0
package me.jxl.kiosk.plugins.watchclock;

import java.util.LinkedHashMap;
import java.util.Map;
import me.jxl.kiosk.plugins.KioskPlugin;
import me.jxl.kiosk.plugins.PluginHost;

/** Only registers content. All screensaver policy and input remain with KS. */
public final class WatchClockPlugin implements KioskPlugin {
    private PluginHost host;
    private Map<String, Object> published;

    public void start(PluginHost host, Map<String, Object> settings) {
        this.host = host;
        configure(settings);
    }

    public void configure(Map<String, Object> settings) {
        Map<String, Object> options = options(settings);
        if (host != null && !options.equals(published)) {
            host.publishScreensaverAsset("clock", "Watch Clock", "clock/index.html", options);
            published = options;
        }
    }

    static Map<String, Object> options(Map<String, Object> settings) {
        Map<String, Object> data = new LinkedHashMap<>();
        String[] keys = {"theme", "layout", "alignment", "datePosition", "dateFormat", "timeZone"};
        String[] defaults = {"Original Green", "Original proportions", "Centre", "Bottom left", "Short weekday + day", "Local"};
        for (int i = 0; i < keys.length; i++) {
            Object value = settings.get(keys[i]);
            data.put(keys[i], value instanceof String ? value : defaults[i]);
        }
        // Custom controls never affect a named preset, nor cause redundant reloads.
        if ("Custom".equals(data.get("theme"))) {
            String[] colors = {"backgroundColor", "numeralColor", "handColor", "secondColor", "pivotColor", "dateColor"};
            String[] values = {"#3F925D", "#000000", "#FFFFFF", "#D6E9CD", "#FFFFFF", "#000000"};
            for (int i = 0; i < colors.length; i++) {
                Object value = settings.get(colors[i]);
                data.put(colors[i], value instanceof String && ((String) value).matches("#[a-fA-F0-9]{6}") ? value : values[i]);
            }
        }
        Object size = settings.get("scale");
        double percent = size instanceof Number ? ((Number) size).doubleValue() : 100;
        data.put("scale", Double.isFinite(percent) ? Math.max(50, Math.min(100, percent)) : 100);
        for (String key : new String[] {"showDate", "showSeconds", "pixelShift"}) {
            Object value = settings.get(key);
            data.put(key, value instanceof Boolean ? value : true);
        }
        return data;
    }

    public void execute(String command, Map<String, Object> arguments) { }
    public void onEvent(String event, Map<String, Object> payload) { }
    public void stop() {
        if (host != null) host.removeScreensaver("clock");
        host = null;
        published = null;
    }
}
