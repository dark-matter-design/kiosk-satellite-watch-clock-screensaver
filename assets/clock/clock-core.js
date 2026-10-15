// SPDX-License-Identifier: Apache-2.0
(function (root) {
  'use strict';
  var presets = {
    'Original Green': ['#3F925D','#000000','#FFFFFF','#D6E9CD','#FFFFFF','#000000'],
    'Midnight Black': ['#08090B','#92969C','#FFFFFF','#F2C66D','#FFFFFF','#CFD1D4'],
    'Deep Blue': ['#2464AF','#080E1B','#FFFFFF','#D3E9FF','#FFFFFF','#080E1B'],
    'Navy': ['#172B46','#9EBDD8','#FFFFFF','#F2C66D','#FFFFFF','#C3D5E8'],
    'Red': ['#C84947','#240807','#FFFFFF','#FFE4C9','#FFFFFF','#240807'],
    'Orange': ['#E28B40','#241306','#FFFFFF','#422719','#FFFFFF','#241306'],
    'Purple': ['#8865AB','#170D24','#FFFFFF','#F5D8FE','#FFFFFF','#170D24'],
    'Pink': ['#E8A4BA','#32141F','#FFFFFF','#61233B','#FFFFFF','#32141F'],
    'Cream': ['#EDE2C6','#24231D','#FFFFFF','#816743','#FFFFFF','#24231D'],
    'White': ['#F5F5F2','#161719','#687580','#AD512E','#687580','#161719']
  };
  function palette(o) {
    var fallback = presets['Original Green'];
    if (o.theme !== 'Custom') return presets[o.theme] || fallback;
    return ['backgroundColor','numeralColor','handColor','secondColor','pivotColor','dateColor'].map(function (key,i) {
      return /^#[0-9a-f]{6}$/i.test(o[key]) ? o[key] : fallback[i];
    });
  }
  function angles(hours, minutes, seconds, milliseconds) {
    var s = seconds + milliseconds / 1000, m = minutes + s / 60;
    return [(hours % 12 + m / 60) * 30, m * 6, s * 6];
  }
  function layout(width, height, o) {
    var scale = typeof o.scale === 'number' && isFinite(o.scale) ? Math.max(50,Math.min(100,o.scale))/100 : 1;
    var side = Math.min(width,height) * scale;
    // Adaptive spacing uses extra room, capped to retain a coherent composition.
    var w = o.layout === 'Adaptive' ? Math.min(width * scale,side * 1.65) : side;
    var h = o.layout === 'Adaptive' ? Math.min(height * scale,side * 1.65) : side;
    var unit = side / 220, vw = w/unit, vh = h/unit;
    var x = (width-w)/2, y = (height-h)/2;
    if (o.alignment === 'Left') x = 0;
    if (o.alignment === 'Right') x = width-w;
    if (o.alignment === 'Top') y = 0;
    if (o.alignment === 'Bottom') y = height-h;
    return {x:x,y:y,width:w,height:h,vw:vw,vh:vh,cx:vw/2,cy:vh/2,dx:(vw-220)/2,dy:(vh-220)/2};
  }
  var shiftPositions = [[0,0],[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]];
  function pixelOffset(elapsed, width, height, enabled) {
    if (!enabled) return {x:0,y:0};
    var step = Math.max(0,Math.floor(elapsed/60000)) % shiftPositions.length;
    // Reserve the art's existing margins; cap by both viewport dimensions.
    var distance = Math.min(24,width*.015,height*.015);
    return {x:shiftPositions[step][0]*distance,y:shiftPositions[step][1]*distance};
  }
  var api = {presets:presets,palette:palette,angles:angles,layout:layout,pixelOffset:pixelOffset};
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ClockCore = api;
}(this));
