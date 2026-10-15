// SPDX-License-Identifier: Apache-2.0
(function () {
  'use strict';
  var o = {};
  try { o = JSON.parse(decodeURIComponent(location.hash.slice(1))) || {}; } catch (_) {}
  var core = window.ClockCore, colors = core.palette(o);
  ['background','numeral','hand','second','pivot','date'].forEach(function (key,i) {
    document.documentElement.style.setProperty('--'+key, colors[i]);
  });
  var svg = document.getElementById('clock'), date = document.getElementById('date');
  var shiftEpoch=performance.now(), shiftTransform='';
  function updateShift() {
    var offset=core.pixelOffset(performance.now()-shiftEpoch,innerWidth,innerHeight,o.pixelShift !== false);
    var transform='translate('+offset.x+'px,'+offset.y+'px)';
    if (transform !== shiftTransform) { svg.style.transform=transform; shiftTransform=transform; }
  }
  var hour = document.getElementById('hour'), minute = document.getElementById('minute'), second = document.getElementById('second');
  second.style.display = o.showSeconds === false ? 'none' : '';
  date.style.display = o.showDate === false ? 'none' : '';
  function move(id,x,y) { document.getElementById(id).setAttribute('transform','translate('+x+' '+y+')'); }
  function resize() {
    if (!innerWidth || !innerHeight) return;
    var l = core.layout(innerWidth,innerHeight,o);
    svg.style.left = l.x+'px'; svg.style.top = l.y+'px';
    svg.style.width = l.width+'px'; svg.style.height = l.height+'px';
    svg.setAttribute('viewBox','0 0 '+l.vw+' '+l.vh);
    // Square art uses a 200x200 reference plane inset by ten units.
    move('twelve',10+l.dx,2); move('nine',2,-13+l.dy);
    move('three',14+2*l.dx,-13+l.dy); move('six',10+l.dx,-4+2*l.dy);
    move('hands',l.cx,l.cy);
    var pos = o.datePosition || 'Bottom left', right = pos.indexOf('right') !== -1;
    date.setAttribute('text-anchor',right ? 'end' : 'start');
    date.setAttribute('x',right ? l.vw-14 : 14);
    date.setAttribute('y',pos.indexOf('Top') === 0 ? 20 : l.vh-14);
    updateShift();
  }
  var zone = o.timeZone && o.timeZone !== 'Local' ? o.timeZone : undefined;
  var dateOptions = o.dateFormat === 'Numeric date' ? {year:'numeric',month:'2-digit',day:'2-digit'} :
    o.dateFormat === 'Day + short month' ? {day:'numeric',month:'short'} : {weekday:'short',day:'numeric'};
  var clockFormat, dateFormat, activeZone;
  function formatters() {
    try {
      clockFormat = new Intl.DateTimeFormat('en-GB-u-nu-latn',{timeZone:zone,hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23',hour12:false});
      dateFormat = new Intl.DateTimeFormat(undefined,Object.assign({},dateOptions,{timeZone:zone}));
      activeZone = new Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (_) { zone = undefined; formatters(); }
  }
  formatters();
  var previousSecond = -1, h=0,m=0,s=0, raf=0, lastZoneCheck=0;
  var wallAnchor=Date.now(), monoAnchor=performance.now();
  function currentTime() {
    var mono=performance.now(), wall=Date.now(), predicted=wallAnchor+mono-monoAnchor;
    // Sub-millisecond interpolation; resync every second and immediately on a
    // clock correction or wake. Wall time, never integrated frame deltas, wins.
    if (mono-monoAnchor >= 1000 || mono < monoAnchor || Math.abs(predicted-wall)>32) {
      wallAnchor=wall; monoAnchor=mono; return wall;
    }
    return predicted;
  }
  function render() {
    // Read wall time every frame: no integrated frame deltas, no long-term drift.
    var now = currentTime(), whole = Math.floor(now/1000);
    if (now-lastZoneCheck > 10000 || now < lastZoneCheck) {
      if (!zone && new Intl.DateTimeFormat().resolvedOptions().timeZone !== activeZone) { formatters(); previousSecond = -1; }
      lastZoneCheck = now;
    }
    if (whole !== previousSecond) {
      updateShift();
      var d = new Date(now);
      if (zone) {
        var parts = clockFormat.formatToParts(d);
        for (var i=0;i<parts.length;i++) {
          if (parts[i].type === 'hour') h = Number(parts[i].value)%24;
          if (parts[i].type === 'minute') m = Number(parts[i].value);
          if (parts[i].type === 'second') s = Number(parts[i].value);
        }
      } else { h = d.getHours(); m = d.getMinutes(); s = d.getSeconds(); }
      if (o.showDate !== false) {
        var label;
        if (!o.dateFormat || o.dateFormat === 'Short weekday + day') {
          var dp = dateFormat.formatToParts(d), weekday='',day='';
          dp.forEach(function(p) { if(p.type==='weekday') weekday=p.value; if(p.type==='day') day=p.value; });
          label = (weekday+' '+day).toLocaleUpperCase();
        } else label = dateFormat.format(d).toLocaleUpperCase();
        if (date.textContent !== label) date.textContent = label;
      }
      previousSecond = whole;
    }
    var a = core.angles(h,m,s,((now%1000)+1000)%1000);
    hour.style.transform = 'rotate('+a[0]+'deg)';
    minute.style.transform = 'rotate('+a[1]+'deg)';
    if (o.showSeconds !== false) second.style.transform = 'rotate('+a[2]+'deg)';
  }
  function tick() { raf=0; if (!document.hidden) { render(); raf=requestAnimationFrame(tick); } }
  function pause() { if (raf) cancelAnimationFrame(raf); raf=0; }
  function resume() { pause(); wallAnchor=Date.now(); monoAnchor=performance.now(); previousSecond=-1; lastZoneCheck=0; if(!document.hidden) tick(); }
  document.addEventListener('visibilitychange',function() { if(document.hidden) pause(); else resume(); });
  window.addEventListener('pagehide',pause);
  window.addEventListener('pageshow',resume);
  window.addEventListener('resize',resize);
  resize(); resume();
}());
