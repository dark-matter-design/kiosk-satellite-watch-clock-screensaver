const assert = require('node:assert/strict');
const core = require('../assets/clock/clock-core.js');
assert.deepEqual(core.angles(0,0,0,0),[0,0,0]);
assert.deepEqual(core.angles(12,0,0,0),[0,0,0]);
const angles = core.angles(3,30,30,500);
assert(Math.abs(angles[0]-105.2541666667)<1e-6);
assert(Math.abs(angles[1]-183.05)<1e-6);
assert.equal(angles[2],183);
for (let ms=0; ms<300000; ms+=1000/60) {
  const a=core.angles(23,59,59,ms%1000);
  assert(a.every(Number.isFinite));
}
assert(core.angles(1,2,3,20)[2] > core.angles(1,2,3,0)[2]);
assert(Math.abs(core.angles(23,59,59,999)[2]-360)<.01);
for(const size of [[800,800],[1280,800],[1920,1080],[800,1280],[480,800],[160,160],[3000,200]]) {
  for(const mode of ['Original proportions','Adaptive']) for(const scale of [50,100]) {
    const l=core.layout(...size,{layout:mode,scale});
    assert(l.x>=0 && l.y>=0 && l.x+l.width<=size[0]+.001 && l.y+l.height<=size[1]+.001);
    assert(l.vw>=220-1e-8 && l.vh>=220-1e-8);
  }
}
assert.equal(Object.keys(core.presets).length,10);
assert.deepEqual(core.palette({theme:'Original Green',backgroundColor:'#123456'}),core.presets['Original Green']);
assert.equal(core.palette({theme:'Custom',backgroundColor:'#123456'})[0],'#123456');
assert.equal(core.palette({theme:'Custom',backgroundColor:'red'})[0],'#3F925D');
console.log('Renderer core passed: fractional angles, midnight, five-minute samples, layouts, palettes');
assert.deepEqual(core.pixelOffset(59999,800,800,true),{x:0,y:0});
assert.deepEqual(core.pixelOffset(60000,800,800,true),{x:12,y:0});
assert.deepEqual(core.pixelOffset(120000,800,800,true),{x:12,y:12});
assert.deepEqual(core.pixelOffset(180000,1920,1080,false),{x:0,y:0});
for(const [w,h] of [[800,800],[1920,1080],[480,800],[3000,200]]) {
  for(let i=0;i<100;i++) {
    const offset=core.pixelOffset(i*60000,w,h,true);
    assert(Math.abs(offset.x)<=Math.min(24,w*.015,h*.015));
    assert(Math.abs(offset.y)<=Math.min(24,w*.015,h*.015));
  }
}
console.log('Foreground pixel shift passed: minute timing, bounded offsets, disabled mode');
