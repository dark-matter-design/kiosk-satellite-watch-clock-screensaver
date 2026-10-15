package me.jxl.kiosk.plugins.watchclock;

import java.lang.reflect.Proxy;
import java.util.HashMap;
import java.util.Map;
import me.jxl.kiosk.plugins.PluginHost;

public final class WatchClockTest {
    public static void main(String[] args) {
        final int[] published = {0}, removed = {0};
        PluginHost host = (PluginHost) Proxy.newProxyInstance(PluginHost.class.getClassLoader(), new Class<?>[]{PluginHost.class}, (proxy, method, values) -> {
            if (method.getName().equals("publishScreensaverAsset")) {
                assert values[0].equals("clock"); assert values[1].equals("Watch Clock");
                assert values[2].equals("clock/index.html"); published[0]++;
            } else if (method.getName().equals("removeScreensaver")) { assert values[0].equals("clock"); removed[0]++; }
            else throw new AssertionError("Unexpected host access: " + method.getName());
            return null;
        });
        WatchClockPlugin plugin = new WatchClockPlugin();
        Map<String,Object> settings = new HashMap<>();
        plugin.start(host, settings); assert published[0] == 1;
        plugin.configure(settings); assert published[0] == 1;
        assert WatchClockPlugin.options(settings).get("pixelShift").equals(true);
        settings.put("backgroundColor", "#123456");
        plugin.configure(settings); assert published[0] == 1;
        settings.put("theme", "Custom"); plugin.configure(settings); assert published[0] == 2;
        assert WatchClockPlugin.options(settings).get("backgroundColor").equals("#123456");
        settings.put("handColor", "bad"); assert WatchClockPlugin.options(settings).get("handColor").equals("#FFFFFF");
        settings.put("scale", Double.NaN); assert WatchClockPlugin.options(settings).get("scale").equals(100.0);
        settings.put("scale", 400); assert WatchClockPlugin.options(settings).get("scale").equals(100.0);
        settings.put("scale", -10); assert WatchClockPlugin.options(settings).get("scale").equals(50.0);
        settings.put("showSeconds", false); assert WatchClockPlugin.options(settings).get("showSeconds").equals(false);
        settings.put("pixelShift", false); assert WatchClockPlugin.options(settings).get("pixelShift").equals(false);
        plugin.stop(); assert removed[0] == 1;
        plugin.configure(settings); assert published[0] == 2;
        plugin.start(host, settings); assert published[0] == 3;
        plugin.stop(); assert removed[0] == 2;
        System.out.println("WatchClockTest passed: registration, updates, presets, bounds, stop and restart");
    }
}
