const params = JSON.parse(localStorage.getItem('simulationParams') || '[]');

let topZIndex = 100;
// --- ParamsWindow Class ---
class ParamsWindow {
  /**
   * @param {string} id - DOMのID
   * @param {string} backgroundColor - CSSの色指定 (例: 'rgba(255, 200, 200, 0.9)')
   */
  constructor(id, backgroundColor = 'rgba(255, 255, 255, 0.52)') {
    this.el = document.getElementById(id);

    this.container = document.createElement('div');
    this.container.className = 'scroll-container';
    this.el.appendChild(this.container);
    this.el.style.backgroundColor = backgroundColor;

    this.el.addEventListener('mousedown', () => {
      topZIndex++;
      this.el.style.zIndex = topZIndex;
    });

    // Draggable
    interact(this.el).draggable({
      inertia: false,
      ignoreFrom: 'input, button, select, textarea',
      modifiers: [
        interact.modifiers.restrictRect({
          restriction: 'parent',
          endOnly: true
        })
      ],
      listeners: {
        move(event) {
          const target = event.target;
          const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
          const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
          target.style.transform = `translate(${x}px, ${y}px)`;
          target.setAttribute('data-x', x);
          target.setAttribute('data-y', y);
        }
      }
    });

    // Resizable
    interact(this.el).resizable({
      edges: { left: true, right: true, bottom: true, top: true },
      listeners: {
        move(event) {
          const target = event.target;

          let { width, height } = event.rect;
          target.style.width = `${width - 24}px`;
          target.style.height = `${height - 24}px`;
          let x = (parseFloat(target.getAttribute('data-x')) || 0) + event.deltaRect.left;
          let y = (parseFloat(target.getAttribute('data-y')) || 0) + event.deltaRect.top;

          target.style.transform = `translate(${x}px, ${y}px)`;
          target.setAttribute('data-x', x);
          target.setAttribute('data-y', y);
        }
      },
      modifiers: [
        interact.modifiers.restrictSize({
          min: { width: 150, height: 100 },
          max: { width: 600, height: 600 }
        })
      ],
      inertia: true
    });
  }

  show() {
    this.el.style.display = 'block';
  }
  hide() {
    this.el.style.display = 'none';
  }
  toggle(visible) {
    this.el.style.display = visible ? 'block' : 'none';
  }
  
  // Add Slider
  addSlider(label, min, max, value, step, onChange, sliderColor = '#009ddb') {
    if (!this.sliders) this.sliders = {}; // Inititalize (First Call)

    const wrapper = document.createElement('div');
    wrapper.style.marginBottom = '8px';

    const labelEl = document.createElement('label');
    labelEl.textContent = `${label}: `;
    wrapper.appendChild(labelEl);

    const valueEl = document.createElement('span');
    valueEl.textContent = value;
    wrapper.appendChild(valueEl);

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = min;
    slider.max = max;
    slider.step = step;
    slider.value = value;
    slider.style.width = '100%';
    slider.style.accentColor = sliderColor;
    slider.addEventListener('input', () => {
      valueEl.textContent = slider.value;
      if (typeof onChange === 'function') onChange(parseFloat(slider.value));
    });

    wrapper.appendChild(slider);
    this.container.appendChild(wrapper);

    this.sliders[label] = slider;
  }

  // Add Button
  addButton(label, onClick, draggable = false, color = 'rgb(92, 92, 92)') {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.style.display = 'block';
    btn.style.marginTop = '0px';
    btn.style.width = '160px';
    btn.style.backgroundColor = color;
    btn.style.border = "none";
    btn.style.padding = "6px";
    btn.style.fontSize = "14px";
    btn.style.color = 'white';

    btn.addEventListener('click', () => {
      if (typeof onClick === 'function') onClick();
    });
    btn.addEventListener('mousedown', () => {
      btn.classList.add('active');
    });
    btn.addEventListener('mouseup', () => {
      btn.classList.remove('active');
    });
    btn.addEventListener("mouseenter", () => {
      if(typeof onClick === 'function' && draggable && windowIsClicked) {
        btn.classList.add('active');
        onClick();
      }
    });
    btn.addEventListener('mouseleave', () => {
      btn.classList.remove('active');
    });
    this.container.appendChild(btn);
  }

  // Add Text Input
  addTextInput(label, onChange){
    const wrapper = document.createElement('div');
    wrapper.style.marginBottom = '8px';

    const labelEl = document.createElement('label');
    labelEl.textContent = `${label}: `;
    wrapper.appendChild(labelEl);

    const input = document.createElement('input');

    input.style.width = '100%';
    input.style.boxSizing = 'border-box';
    input.style.marginTop = '4px';
    
    input.addEventListener('input', () => {
      onChange(input.value);
    });

    wrapper.appendChild(input);
    this.container.appendChild(wrapper);

    // save to inputs
    if (!this.inputs) this.inputs = {};
    this.inputs[label] = input;
  }

  // Add Number Input
  addNumberInput(label, value, min, max, step, onChange){
    const wrapper = document.createElement('div');
    wrapper.style.marginBottom = '8px';

    const labelEl = document.createElement('label');
    labelEl.textContent = `${label}: `;
    wrapper.appendChild(labelEl);

    const input = document.createElement('input');
    input.type = 'number';
    input.value = value;
    if (min !== undefined) input.min = min;
    if (max !== undefined) input.max = max;
    if (step !== undefined) input.step = step;

    input.style.width = '100%';
    input.style.boxSizing = 'border-box';
    input.style.marginTop = '4px';
    
    input.addEventListener('wheel', (e) => {
      e.preventDefault();
      let current = parseFloat(input.value) || 0;
      let s = parseFloat(input.step) || 1;

      let min = input.min !== '' ? parseFloat(input.min) : undefined;
      let max = input.max !== '' ? parseFloat(input.max) : undefined;

      if (e.deltaY < 0) current += s;
      else current -= s;

      if (min !== undefined) current = Math.max(current, min);
      if (max !== undefined) current = Math.min(current, max);

      input.value = current;
      if (typeof onChange === 'function') onChange(current);
    });

    input.addEventListener('input', () => {
      const num = parseFloat(input.value);
      if (!isNaN(num) && typeof onChange === 'function') {
        onChange(num);
      }
    });

    wrapper.appendChild(input);
    this.container.appendChild(wrapper);

    // save to inputs
    if (!this.inputs) this.inputs = {};
    this.inputs[label] = input;
  }

  // Add File Input
  addFileInput(id){
    const input = document.createElement('input');
    input.type = 'file';
    input.id = id;
    input.multiple = true;
    input.accept = 'image/*';

    this.container.appendChild(input);
  }
}

// --- Create Windows ---
const windows = [
  new ParamsWindow('param-global', 'rgba(224, 230, 255, 0.52)'),
  new ParamsWindow('param-frames', 'rgba(224, 230, 255, 0.52)'),
  new ParamsWindow('param-objects', 'rgba(224, 230, 255, 0.52)'),
];

windows[0].addTextInput('textInput', () => {});
const sliderConfigs = [
  {name:'gravityX', sliderParam: [-100.0, 100.0, params.global.gravityX, 1.0], color: 'rgb(58, 58, 58)'},
  {name:'gravityY', sliderParam: [-100.0, 100.0, params.global.gravityY, 1.0], color: 'rgb(58, 58, 58)'},
  {name:'phi', sliderParam: [-1, 1, params.global.phi, 0.01], color: 'rgb(243, 243, 45)'},
  {name:'th', sliderParam: [-1, 1, params.global.th, 0.01], color: 'rgb(243, 243, 45)'},
  {name:'massGrowTime', sliderParam: [0, 10, 0.8, 0.1], color: 'rgb(190, 243, 45)'},
  {name:'massDecay', sliderParam: [0, 10, 1.4, 0.1], color: 'rgb(190, 243, 45)'},
  {name:'partMinVel', sliderParam: [0, 1000, 80, 10], color: 'rgb(243, 134, 45)'},
  {name:'velDecay', sliderParam: [0, 10, 0.2, 0.1], color: 'rgb(243, 134, 45)'},
  {name:'spawnVelFactor', sliderParam: [0, 10, 0.6, 0.1], color: 'rgb(243, 134, 45)'},
  {name:'colLight', sliderParam: [0.01, 1.0, 1.0, 0.01], color: 'rgb(220, 40, 40)'},
  {name:'scale', sliderParam: [0.1, 10.0, 1.0, 0.1], color: 'rgb(110, 110, 110)'},
];
sliderConfigs.forEach((sc)=>{
  windows[0].addSlider(sc.name, sc.sliderParam[0], sc.sliderParam[1], sc.sliderParam[2],sc.sliderParam[3], () => {}, sc.color);
});
const customInputList = {};
customInputList['isSave'] = false;
customInputList['sPosX'] = 200;
customInputList['sPosY'] = 200;
updateCustomInputList();
function updateCustomInputList(){
  for(let i = 0; i < sliderConfigs.length; i++){
    customInputList[sliderConfigs[i].name] = windows[0].sliders[sliderConfigs[i].name].value;
  }
  customInputList['dt'] = params.global.dt;
  customInputList['h'] = params.global.h;
  customInputList['mass'] = params.global.mass;
  customInputList['rho0'] = params.global.rho0;
  customInputList['B'] = params.global.B;
  customInputList['nB'] = params.global.nB;
  customInputList['viscosity'] = params.global.viscosity;
  customInputList['alpha'] = params.global.alpha;
  const h = customInputList.h;
  const rho0 = customInputList.rho0;
  const scl = customInputList.scale;
  customInputList['hSq'] = h*h;
  customInputList['inv_h'] = 1./h;
  customInputList['facSpiky'] = 6./(Math.PI*h*h);
  customInputList['facSpikydiv'] = -12./(Math.PI*h*h);
  customInputList['facNSpiky'] = 10./(Math.PI*h*h);
  customInputList['facNSpikydiv'] = -30./(Math.PI*h*h);
  customInputList['facVisclap'] = 20./(3*Math.PI*h*h*h*h);
  customInputList['facSTKernel'] = 32./(Math.PI*h*h*h*h*h*h);
  customInputList['inv_rho0'] = 1./rho0;
  customInputList['toonTH'] = params.global.TOON_THRESHOLD;
  customInputList['inv_scale'] = 1./scl;
}
windows[0].addNumberInput('flowDelay', 0, 0, 1, 1, () => {});

const thRange = 1.6;

let frameCount = 0;
let drawCount = 0;
const fps = 8;

const crossTime = params.global.crossTime;
const crossFactor = params.global.crossFactor*0.0001;

const convMapLen = 12;
const massGrowSlope = params.global.massGrowSlope;
const massCutoff = params.global.massCutoff;
const partVelNoiseScale = 0.02;
const partVelNoiseLevel = 40;
const partPosNoiseScale = 0.001;
const partPosNoiseLevel = 40;
const velDecayThreshold = 0.5;
const colDecay = params.global.colDecay;
const spawnFineAdjustN = params.global.spawnFineAdjustN;
const spawnFineAdjustV = params.global.spawnFineAdjustV;
const lastInitVel = params.global.lastInitVel;
const seed = Math.ceil(Date.now() % 0x7fffffff);
const group_size = 256;
const group_count = 1024;
const N = group_size * group_count;
const LAYER_NUM = Math.min(50, params.global.flowNum);
const GRID_SIZE_X = 256;
const GRID_SIZE_Y = 256;
const GRID_SIZE = GRID_SIZE_X * GRID_SIZE_Y * LAYER_NUM;
const MAX_SCAN_SIZE = 256;
const FSCAN_CHUNK_SIZE = Math.min(GRID_SIZE, MAX_SCAN_SIZE);
const FSCAN_CHUNK_NUM = Math.ceil(GRID_SIZE/FSCAN_CHUNK_SIZE);
const FSCAN_STEPS = Math.ceil(Math.log2(FSCAN_CHUNK_SIZE));
const SSCAN_CHUNK_SIZE = Math.min(FSCAN_CHUNK_NUM, MAX_SCAN_SIZE);
const SSCAN_CHUNK_NUM = Math.ceil(FSCAN_CHUNK_NUM/SSCAN_CHUNK_SIZE);
const SSCAN_STEPS = Math.ceil(Math.log2(SSCAN_CHUNK_SIZE));
let time = 0;
let isComputing = true;
let isInitializing = true;

let convMapPosCode = ``;
let convMapValCode = ``;
let convMapLength = 0;
let sharpness = 1/1.5;
for(let x = -convMapLen; x < convMapLen; ++x){
  for(let y = -convMapLen; y < convMapLen; ++y){
    const val = Math.max(kernel(Math.hypot(x, y)), 0.);
    if(val != 0){
      convMapPosCode += `vec2i(${[x, y]}),`;
      convMapValCode += `f32(${val}),`;
      ++convMapLength;
    }
  }
}

let spawnPosVel = [0, 0];
let settingSpawnPosVel = false;
let settingSpawnPos = false;
let settingOffsetPos = false;
let drawingTimestamps = false;
let brushDown = false;
let windowIsClicked = false;
windows[2].addFileInput('projectInput');
windows[2].addButton('Save as JSON', saveProject);
windows[2].addButton('Spawn Position', () => { settingSpawnPos = true }, false, 'rgb(40, 77, 34)');
windows[2].addButton('SP Velocity', () => { settingSpawnPosVel = true }, false, 'rgb(40, 77, 34)');
windows[2].addButton('reset SP Vel', resetSpVel, false, 'rgb(40, 77, 34)');
windows[2].addNumberInput('currentFlow', 0, 0, LAYER_NUM-1, 1, viewFlowParams);
windows[2].addButton('Offset', () => { settingOffsetPos = true }, false, 'rgb(0, 60, 88)');
windows[2].addButton('DrawTimestamp', drawTimeStamps, false, 'rgb(0, 60, 88)');
windows[2].addButton('ClearTimestamp', resetTimeStamps, false, 'rgb(0, 60, 88)');
windows[2].addNumberInput('flowDelay', 0, 0, 1, 1, updateFlowParams);
windows[2].addSlider('yMax', 0, 2000, 200, 10, updateFlowParams, 'rgb(255, 80, 80)');
windows[2].addSlider('crossFactor', -1.0, 1.0, 0.01, 0.01, updateFlowParams, 'rgb(255, 80, 80)');
windows[2].addSlider('crossRange', 0.1, 10, 0.1, 0.1, updateFlowParams, 'rgb(255, 80, 80)');
windows[2].addSlider('flowBold', 0.1, 10, 1.0, 0.1, updateFlowParams, 'rgb(255, 80, 80)');
windows[2].addSlider('flowOutVelStr', 0, 10, 0.5, 0.1, updateFlowParams, 'rgb(255, 80, 80)');

function kernel(r){
  let q = Math.max(1 - r*customInputList.inv_h*sharpness, 0);
  return customInputList.facSpiky * q * q * (sharpness**2);
}

const flowNum = params.global.flowNum;
let spawnPartId = 0;
let spawnVx = Array(flowNum).fill(0);
let spawnVy = Array(flowNum).fill(0);
let fluidLen = Array(flowNum).fill(0);
const initialInputList = [];
const flowParams = Array(flowNum).fill(0).map((_, i)=>{
  const res = {
    timeStamps: [],
    noiseLevel: params.global.noiseLevel,
    offsetPos: [0, 0, i%LAYER_NUM, 0],
    flowDelay: 0,
  };
  const keys = Object.keys(windows[2].sliders);
  for(let key of keys){
    res[key] = windows[2].sliders[key].value;
  }
  return res;
});
function viewFlowParams(){
  const idx = windows[2].inputs.currentFlow.value;
  const keys = Object.keys(windows[2].sliders);
  for(let key of keys){
    windows[2].sliders[key].value = flowParams[idx][key];
  }
  windows[2].inputs.flowDelay.value = flowParams[idx].flowDelay;
  for(let key of keys){
    windows[2].sliders[key].dispatchEvent(new Event('input'));
  }
  windows[2].inputs.flowDelay.dispatchEvent(new Event('input'));
}
function updateFlowParams(){
  const idx = windows[2].inputs.currentFlow.value;
  const keys = Object.keys(windows[2].sliders);
  for(let key of keys){
    flowParams[idx][key] = +windows[2].sliders[key].value;
  }
  flowParams[idx].flowDelay = +windows[2].inputs.flowDelay.value;
}
function putTimeStamp(){
  const idx = windows[2].inputs.currentFlow.value;
  flowParams[idx].timeStamps.push({
    x: defaultInputList.mouseX - customInputList.sPosX,
    y: -(defaultInputList.mouseY - customInputList.sPosY),
    spawning: defaultInputList.mouseIsPressed,
  });
}
function resetSpVel(){
  spawnPosVel[0] = 0;
  spawnPosVel[1] = 0;
}
function drawTimeStamps(){
  drawingTimestamps = true;
  resetTimeStamps();
}
function resetTimeStamps(){
  const idx = windows[2].inputs.currentFlow.value;
  flowParams[idx].timeStamps.length = 0;
}

const defaultInputList = {
  "windowW": 100.0,
  "windowH": 100.0,
  "motionX": 0.0,
  "motionY": 0.0,
  "mouseX": 0.0,
  "mouseY": 0.0,
  "mouseIsPressed": 0.0,
  "up" : 0.0,
  "down" : 0.0,
  "right" : 0.0,
  "left" : 0.0,
  "time" : 0.0,
  "tick" : 0.0,
};
// 0:custom
// 1:default
// 2:simulation
// 3:colorStorage
// 4:texture
const allBindings = ['customU','defaultU','flows','sim','cols','aColors','tex'];
const bindingConfigs = [
  {name: 'init', wgSize: [group_size], wgNum: [group_count], bind: [], isInit: true},
  {name: 'setpPos', wgSize: [group_size], wgNum: [group_count], bind: []},
  {name: 'culcHash', wgSize: [group_size], wgNum: [group_count], bind: []},
  {name: 'clearCount', wgSize: [1], wgNum: [GRID_SIZE_X, GRID_SIZE_Y, LAYER_NUM], bind: []},
  {name: 'countHash', wgSize: [group_size], wgNum: [group_count], bind: []},
  {name: 'atomicCountToReg', wgSize: [1], wgNum: [GRID_SIZE_X, GRID_SIZE_Y, LAYER_NUM], bind: []},
  {name: 'firstScan', wgSize: [FSCAN_CHUNK_SIZE], wgNum: [FSCAN_CHUNK_NUM], bind: []},
  {name: 'secondScan', wgSize: [SSCAN_CHUNK_SIZE], wgNum: [SSCAN_CHUNK_NUM], bind: []},
  {name: 'scanAarray2', wgSize: [SSCAN_CHUNK_SIZE], wgNum: [SSCAN_CHUNK_NUM], bind: []},
  {name: 'addAarray2to1', wgSize: [FSCAN_CHUNK_SIZE], wgNum: [FSCAN_CHUNK_NUM], bind: []},
  {name: 'addAarray1toOrigin', wgSize: [1], wgNum: [GRID_SIZE_X, GRID_SIZE_Y, LAYER_NUM], bind: []},
  {name: 'regToAtomicSums', wgSize: [1], wgNum: [GRID_SIZE_X, GRID_SIZE_Y, LAYER_NUM], bind: []},
  {name: 'fillIn', wgSize: [group_size], wgNum: [group_count], bind: []},
  {name: 'culcDens', wgSize: [group_size], wgNum: [group_count], bind: []},
  {name: 'culcN', wgSize: [group_size], wgNum: [group_count], bind: []},
  {name: 'culcForce', wgSize: [group_size], wgNum: [group_count], bind: []},
  {name: 'drawPart', wgSize: [group_size], wgNum: [group_count], bind: []},
  {name: 'atomicToRegPix', wgSize: [1], wgNum: [1], bind: []},
  {name: 'draw', wgSize: [1], wgNum: [1], bind: []},
  {name: 'updatePart', wgSize: [group_size], wgNum: [group_count], bind: []},
];

let pcustomInputList = {...customInputList};
let colorBuffer;
let aColorBuffer;

// uniform struct codes
let defaultInputCode = `struct defaultUniforms { `;
let customInputCode = `struct customUniforms { `;
function setUniforms(struct, list){
  let keys = Object.keys(list);
  for(let i = 0; i < keys.length; i++){
    struct += keys[i] + `:f32, `
  }
  return struct + `};`;
}
defaultInputCode = setUniforms(defaultInputCode, defaultInputList);
customInputCode = setUniforms(customInputCode, customInputList);
const aliasCode = `
  alias int = i32;
  alias uint = u32;
  alias float = f32;
  alias int2 = vec2<i32>;
  alias int3 = vec3<i32>;
  alias int4 = vec4<i32>;
  alias uint2 = vec2<u32>;
  alias uint3 = vec3<u32>;
  alias uint4 = vec4<u32>;
  alias float2 = vec2<f32>;
  alias float3 = vec3<f32>;
  alias float4 = vec4<f32>;
  alias bool2 = vec2<bool>;
  alias bool3 = vec3<bool>;
  alias bool4 = vec4<bool>;
  alias float2x2 = mat2x2<f32>;
  alias float2x3 = mat2x3<f32>;
  alias float2x4 = mat2x4<f32>;
  alias float3x2 = mat3x2<f32>;
  alias float3x3 = mat3x3<f32>;
  alias float3x4 = mat3x4<f32>;
  alias float4x2 = mat4x2<f32>;
  alias float4x3 = mat4x3<f32>;
  alias float4x4 = mat4x4<f32>;
`;

function arrayFromObjs(objs, key){
  let arr = [];
  for(let i = 0; i < objs.length; i++){
    arr.push(objs[i][key]);
  }
  return arr;
}

async function main() {
  const adapter = await navigator.gpu?.requestAdapter();
  const hasBGRA8unormStorage = adapter.features.has('bgra8unorm-storage');
  const device = await adapter?.requestDevice({
    requiredFeatures: hasBGRA8unormStorage ? ['bgra8unorm-storage'] : [],});
  if (!device) {
    alert('need a browser that supports WebGPU');
    return;
  }

  // --- mouse & key events ---
  const gpuCanvas = document.getElementById('gpuCanvas');
  window.addEventListener('keydown', (event) => {
    const tag = event.target.tagName.toLowerCase();
    const isInputField = ['input', 'textarea'].includes(tag) || event.target.isContentEditable;
    if (!isInputField) {
      event.preventDefault();
      if(event.key == "s") savingFrames();
      if(event.key == "a") {
        spawnVx.fill(0);
        spawnVy.fill(0);
        time = 0;
        drawCount = 0;
        if(animateFrames) currentFrameIndex = 0;
      }
      if(event.key == "d") time = 1000;
      defaultInputList.up |= event.key == "w" ? 1 : 0;
      defaultInputList.left |= event.key == "a" ? 1 : 0;
      defaultInputList.down |= event.key == "s" ? 1 : 0;
      defaultInputList.right |= event.key == "d" ? 1 : 0;
      if(event.key == " ") {
        isComputing = !isComputing;
      }
    }
  }, false);
  window.addEventListener('keyup', (event) => {
    defaultInputList.up &= event.key == "w" ? 0 : 1;
    defaultInputList.down &= event.key == "s" ? 0 : 1;
    defaultInputList.right &= event.key == "d" ? 0 : 1;
    defaultInputList.left &= event.key == "a" ? 0 : 1;
  }, false);
  window.addEventListener('mousemove', (event) => {
    defaultInputList.motionX = event.movementX;
    defaultInputList.motionY = event.movementY;
    defaultInputList.mouseX = event.clientX;
    defaultInputList.mouseY = event.clientY;
  }, false);
  window.addEventListener('mousedown', (event) => {
    windowIsClicked |= event.button == 0 ? 1 : 0;
    if(event.target === gpuCanvas){
      defaultInputList.mouseIsPressed |= event.button == 0 ? 1 : 0;
      if(settingSpawnPos){
        if(event.button === 0){
          customInputList.sPosX = event.clientX;
          customInputList.sPosY = event.clientY;
        }
        settingSpawnPos = false;
      }
      if(settingSpawnPosVel){
        if(event.button === 0){
          spawnPosVel = [
            event.clientX - customInputList.sPosX,
            event.clientY - customInputList.sPosY,
          ];
        }
        settingSpawnPosVel = false;
      }
      if(settingOffsetPos){
        // 現在選択中のFlowのoffsetPosを更新したい
        const idx = windows[2].inputs.currentFlow.value;
        flowParams[idx].offsetPos[0] = event.clientX - customInputList.sPosX;
        flowParams[idx].offsetPos[1] = event.clientY - customInputList.sPosY;
        settingOffsetPos = false;
      }
      if(drawingTimestamps){
        if (event.button === 2) {
          drawingTimestamps = false;
          brushDown = false;
          const idx = windows[2].inputs.currentFlow.value;
          const currentTimeStamp = flowParams[idx].timeStamps;
          while (currentTimeStamp.length > 0 && !currentTimeStamp[currentTimeStamp.length - 1].spawning) {
            currentTimeStamp.pop();
          }
        } else if (event.button === 0) {
          brushDown = true;
        } else {
          brushDown = true;
        }
      }
    }
  }, false);
  window.addEventListener('mouseup', (event) => {
    windowIsClicked &= event.button == 0 ? 0 : 1;
    defaultInputList.mouseIsPressed &= event.button == 0 ? 0 : 1;
  }, false);
  document.addEventListener('contextmenu', function(event) {
    event.preventDefault();
  });

  const bgCanvas = document.getElementById('bgCanvas');
  const ctx = bgCanvas.getContext('2d');
  let currentFrameIndex = 0;
  let animateFrames = false;
  let loopFrames = false;
  windows[0].addFileInput('imageInput');
  function drawSquare(x, y, color){
    const dx = 10;
    ctx.fillStyle = color;
    ctx.fillRect(x-dx*.5, y-dx*.5, dx, dx);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x-dx*.5, y-dx*.5, dx, dx);
  }

  // --- draw bgCanvas ---
  function drawBackgroundFrame() {
    if(animateFrames) {
      if(drawCount % Math.ceil(60/fps) == 0) currentFrameIndex++;
    }
    if(loopFrames){
      currentFrameIndex = (currentFrameIndex+backgroundFrames.length) % backgroundFrames.length;
    }
    currentFrameIndex = Math.min(currentFrameIndex, backgroundFrames.length-1);

    const bg = backgroundFrames[currentFrameIndex];
    if (!bg) return;

    // 背景を描画（シミュレーション結果の前に呼ぶ）
    ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    ctx.drawImage(bg, 0, 0, bgCanvas.width, bgCanvas.height);

    // draw spawn point velocity
    const headLength = 10;
    const sx = settingSpawnPos ? defaultInputList.mouseX : customInputList.sPosX;
    const sy = settingSpawnPos ? defaultInputList.mouseY : customInputList.sPosY;
    if(!(spawnPosVel[0] == 0 && spawnPosVel[1] == 0) || settingSpawnPosVel){
      const stx = settingSpawnPosVel ? defaultInputList.mouseX : spawnPosVel[0]+sx;
      const sty = settingSpawnPosVel ? defaultInputList.mouseY : spawnPosVel[1]+sy;
      const svx = stx - sx;
      const svy = sty - sy;
      const angle = Math.atan2(svy, svx);
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(stx, sty);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(stx, sty);
      ctx.lineTo(stx - headLength * Math.cos(angle - Math.PI / 6),
                  sty - headLength * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(stx - headLength * Math.cos(angle + Math.PI / 6),
                  sty - headLength * Math.sin(angle + Math.PI / 6));
      ctx.lineTo(stx, sty);
      ctx.lineTo(stx - headLength * Math.cos(angle - Math.PI / 6),
                  sty - headLength * Math.sin(angle - Math.PI / 6));
      ctx.stroke();
      if(settingSpawnPosVel){
        // preview sp velocity
        ctx.beginPath();
        let pvTick = (drawCount * customInputList.dt) % (customInputList.scale);
        let pvx = svx*pvTick * customInputList.inv_scale;
        let pvy = svy*pvTick * customInputList.inv_scale;
        ctx.arc(sx+pvx, sy+pvy, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgb(49, 131, 255)';
        ctx.fill();
        ctx.stroke();
      }
    }

    // draw offset pos
    const idx = windows[2].inputs.currentFlow.value;
    const offsetPos = [...flowParams[idx].offsetPos];
    let dPosX = spawnPosVel[0] * drawCount * customInputList.dt * customInputList.inv_scale;
    let dPosY = spawnPosVel[1] * drawCount * customInputList.dt * customInputList.inv_scale;
    drawSquare(sx+offsetPos[0]+dPosX, sy+offsetPos[1]+dPosY, 'rgb(63, 130, 255)')

    // draw spawn point
    drawSquare(sx, sy, 'rgb(63, 233, 255)');

    // draw line
    const currentTimeStamp = flowParams[idx].timeStamps;
    if(currentTimeStamp.length > 0){
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx + currentTimeStamp[0].x, sy - currentTimeStamp[0].y);
      for(let i = 1; i < currentTimeStamp.length; i++){
        let x = sx + currentTimeStamp[i].x;
        let y = sy - currentTimeStamp[i].y;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      // draw dots
      currentTimeStamp.forEach(ts => {
        let x = sx + ts.x;
        let y = sy - ts.y;
        ctx.beginPath();
        ctx.arc(x, y, ts.spawning ? 6 : 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgb(255, 63, 63)';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
      });
    }
  }

  const context = gpuCanvas.getContext('webgpu');
  const presentationFormat = hasBGRA8unormStorage ? 
    navigator.gpu.getPreferredCanvasFormat() : 'rgba8unorm';
  context.configure({
    device, format: presentationFormat,
    alphaMode: "premultiplied",
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.STORAGE_BINDING,
  });

  /// --- wgsl code ---
  let ept = 0;
  const wgslCode = /* glsl */`
    ${defaultInputCode}
    ${customInputCode}
    ${aliasCode}

    const convMapPos = array<vec2i, ${convMapLength}>(
      ${convMapPosCode}
    );

    const convMapVal = array<f32, ${convMapLength}>(
      ${convMapValCode}
    );

    const nextCells = array<vec2i, 9>(
      vec2i(-1,-1),vec2i( 0,-1),vec2i( 1,-1),
      vec2i(-1, 0),vec2i( 0, 0),vec2i( 1, 0),
      vec2i(-1, 1),vec2i( 0, 1),vec2i( 1, 1),
    );
    
    fn kernel(r : f32) -> f32 {
      let q = max(1 - r*customU.inv_h, 0);
      return customU.facSpiky * q * q;
    }
    
    fn sKernel(r : f32) -> f32 {
      let q = max(1 - r*customU.inv_h, 0);
      return customU.facNSpiky * q * q * q;
    }

    fn kernelDiv(r : f32) -> f32 {
      let q = max(1 - r*customU.inv_h, 0);
      return customU.facSpikydiv * q;
    }

    fn sKernelDiv(r : f32) -> f32 {
      let q = max(1 - r*customU.inv_h, 0);
      return customU.facNSpikydiv * q * q;
    }

    fn kernelLap(r : f32) -> f32 {
      let q = max(1 - r*customU.inv_h, 0);
      return customU.facVisclap * q;
    }

    fn stKernel(r : f32) -> f32 {
      let q = max(1 - r*customU.inv_h, 0);
      return customU.facSTKernel*select(
        q*q*q*r*r*r,
        2*q*q*q*r*r*r-pow(customU.h, 3)*.015625,
        2*r < customU.h
      );
    }
    
    struct Particle 
    {
      pos: vec2f,
      pPos: vec2f,

      vel: vec2f,
      force: vec2f,

      cellPos: vec4i,

      n: vec2f,
      th: f32,
      sTime: f32,

      mass: f32,
      visc: f32,
      dens: f32,
      nDens: f32,

      pres: f32,
      nPres: f32,
      hash: u32,
      sortIndex: u32,
    } // 16 + 8 = 24 elms

    struct Cell
    {
      atomicCount: atomic<u32>,
      count: u32,
      sums: u32,
      atomicSums: atomic<u32>,
      vel: vec2f, // 2 elms
    } // 4 + 2 (+2) = 8 elms

    struct Simulation 
    {
      particles: array<Particle, ${N}>,
      grid: array<Cell, ${GRID_SIZE}>,
      aArray1: array<u32, ${FSCAN_CHUNK_NUM}>,
      aArray2: array<u32, ${SSCAN_CHUNK_NUM}>,
      aArray3: array<u32, ${SSCAN_CHUNK_NUM}>,
    }

    struct avec4i
    {
      x: atomic<i32>,
      y: atomic<i32>,
      z: atomic<i32>,
      w: atomic<i32>,
    }

    struct FlowParam
    {
      spawnVel: vec4f,
      offsetPos: vec4f,
      isSpawning: f32,
      spawnId: f32,
      spawnNum: f32,
      spawnBold: f32,
      yMax: f32,
      crossFactor: f32,
      crossRange: f32,
      flowOutVelStr: f32,
    } // 8 + 8 = 16 elms

    @group(0) @binding(0) var<uniform> customU: customUniforms;
    @group(0) @binding(1) var<uniform> defaultU: defaultUniforms;
    @group(0) @binding(2) var<storage, read_write> flows: array<FlowParam, ${flowNum}>;
    @group(0) @binding(3) var<storage, read_write> sim: Simulation;
    @group(0) @binding(4) var<storage, read_write> cols: array<vec4f>;
    @group(0) @binding(5) var<storage, read_write> aColors: array<avec4i>;
    @group(0) @binding(6) var tex: texture_storage_2d<${presentationFormat}, write>;


    //// init : Particles
    @compute @workgroup_size(${bindingConfigs[ept].wgSize}) fn ${bindingConfigs[ept++].name}(
      @builtin(global_invocation_id) idx:vec3u
    ) {
      state = vec4u(idx, ${seed});
      sim.particles[idx.x].mass = 0.;
      sim.particles[idx.x].pos = rand4().xy*customU.h*vec2f(${[GRID_SIZE_X, GRID_SIZE_Y]});
    }
    

    //// setpPos : Particles
    @compute @workgroup_size(${bindingConfigs[ept].wgSize}) fn ${bindingConfigs[ept++].name}(
      @builtin(global_invocation_id) idx:vec3u
    ) {
      let part = sim.particles[idx.x];
      sim.particles[idx.x].pPos = part.pos + part.vel*customU.dt;
    }

    //// culcHash : Particles
    @compute @workgroup_size(${bindingConfigs[ept].wgSize}) fn ${bindingConfigs[ept++].name}(
      @builtin(global_invocation_id) idx:vec3u
    ) {
      var part = sim.particles[idx.x];
      if(part.mass != 0){
        sim.particles[idx.x].hash = getHash(vec3u(vec2u(part.pPos * customU.inv_h), u32(part.cellPos.z)));
      } else {
        sim.particles[idx.x].hash = 0xffffffffu;
      }
    }

    //// clearCount : GRID
    @compute @workgroup_size(${bindingConfigs[ept].wgSize}) fn ${bindingConfigs[ept++].name}(
      @builtin(global_invocation_id) idx:vec3u
    ) {
      let cellInd = getCellInd(idx);
      atomicStore(&sim.grid[cellInd].atomicCount, 0);
      atomicStore(&sim.grid[cellInd].atomicSums, 0);
    }

    //// countHash : Particles
    @compute @workgroup_size(${bindingConfigs[ept].wgSize}) fn ${bindingConfigs[ept++].name}(
      @builtin(global_invocation_id) idx:vec3u
    ) {
      var part = sim.particles[idx.x];
      if(part.hash < ${GRID_SIZE}){
        atomicAdd(&sim.grid[part.hash].atomicCount, 1u);
      }
    }

    //// atomicCountToReg : GRID
    @compute @workgroup_size(${bindingConfigs[ept].wgSize}) fn ${bindingConfigs[ept++].name}(
      @builtin(global_invocation_id) idx:vec3u
    ) {
      let cellInd = getCellInd(idx);
      let val = atomicLoad(&sim.grid[cellInd].atomicCount);
      sim.grid[cellInd].count = val;
      sim.grid[cellInd].sums = val;
    }
    

    //// PREFIX SUM
    var<workgroup> sArray: array<u32, ${FSCAN_CHUNK_SIZE}>;
    //// firstScan : FSCAN_SIZE * FSCAN_NUM
    @compute @workgroup_size(${bindingConfigs[ept].wgSize}) fn ${bindingConfigs[ept++].name}(
      @builtin(global_invocation_id) idx:vec3u,
      @builtin(local_invocation_id) lid:vec3u,
      @builtin(workgroup_id) wid:vec3u
    ) {
      let cellInd = getCellInd(idx);
      sArray[lid.x] = select(0u, sim.grid[cellInd].sums, cellInd < ${GRID_SIZE});
      let initVal = sArray[lid.x];
      workgroupBarrier();

      // upsweep
      var stride = 1u;
      for(var i = 0; i < ${FSCAN_STEPS}; i++){
        let ch0 = (lid.x+1)*stride*2 - 1;
        if(ch0 < ${FSCAN_CHUNK_SIZE}){
          let ch1 = ch0 - stride;
          sArray[ch0] += sArray[ch1];
        }
        workgroupBarrier();
        stride <<= 1u;
      }

      // downsweep
      if(lid.x == 0u){
        sArray[${FSCAN_CHUNK_SIZE} - 1u] = 0u;
      }
      workgroupBarrier();

      stride = ${FSCAN_CHUNK_SIZE} >> 1u;
      for(var i = 0; i < ${FSCAN_STEPS}; i++){
        let ch0 = (lid.x+1)*stride*2 - 1;
        if(ch0 < ${FSCAN_CHUNK_SIZE}){
          let ch1 = ch0 - stride;
          let t = sArray[ch1];
          sArray[ch1] = sArray[ch0];
          sArray[ch0] += t;
        }
        workgroupBarrier();
        stride >>= 1u;
      }
      sArray[lid.x] += initVal;
      sim.grid[cellInd].sums = sArray[lid.x];
      if(lid.x == 0u){
        sim.aArray1[wid.x] = sArray[${FSCAN_CHUNK_SIZE} - 1u];
      }
    }
    
    //// secondScan : SSCAN_SIZE * SSCAN_NUM
    @compute @workgroup_size(${bindingConfigs[ept].wgSize}) fn ${bindingConfigs[ept++].name}(
      @builtin(global_invocation_id) idx:vec3u,
      @builtin(local_invocation_id) lid:vec3u,
      @builtin(workgroup_id) wid:vec3u
    ) {
      let cellInd = getCellInd(idx);
      sArray[lid.x] = select(0u, sim.aArray1[cellInd], cellInd < ${FSCAN_CHUNK_NUM});
      let initVal = sArray[lid.x];
      workgroupBarrier();

      // upsweep
      var stride = 1u;
      for(var i = 0; i < ${SSCAN_STEPS}; i++){
        let ch0 = (lid.x+1)*stride*2 - 1;
        if(ch0 < ${SSCAN_CHUNK_SIZE}){
          let ch1 = ch0 - stride;
          sArray[ch0] += sArray[ch1];
        }
        workgroupBarrier();
        stride <<= 1u;
      }

      // downsweep
      if(lid.x == 0u){
        sArray[${SSCAN_CHUNK_SIZE} - 1u] = 0u;
      }
      workgroupBarrier();

      stride = ${SSCAN_CHUNK_SIZE} >> 1u;
      for(var i = 0; i < ${SSCAN_STEPS}; i++){
        let ch0 = (lid.x+1)*stride*2 - 1;
        if(ch0 < ${SSCAN_CHUNK_SIZE}){
          let ch1 = ch0 - stride;
          let t = sArray[ch1];
          sArray[ch1] = sArray[ch0];
          sArray[ch0] += t;
        }
        workgroupBarrier();
        stride >>= 1u;
      }
      sArray[lid.x] += initVal;
      sim.aArray1[cellInd] = sArray[lid.x];
      if(lid.x == 0u){
        sim.aArray2[wid.x] = sArray[${SSCAN_CHUNK_SIZE} - 1u];
      }
    }
    
    //// scanAarray2 : GRID
    @compute @workgroup_size(${bindingConfigs[ept].wgSize}) fn ${bindingConfigs[ept++].name}(
      @builtin(global_invocation_id) idx:vec3u
    ) {
      let cellInd = getCellInd(idx);
      var sum = 0u;
      for(var i = 0u; i < cellInd; i++){
        sum += sim.aArray2[i];
      }
      sim.aArray3[cellInd] = sum;
    }
    
    //// addAarray2to1 : GRID
    @compute @workgroup_size(${bindingConfigs[ept].wgSize}) fn ${bindingConfigs[ept++].name}(
      @builtin(global_invocation_id) idx:vec3u
    ) {
      let cellInd = getCellInd(idx);
      sim.aArray1[cellInd] += sim.aArray3[cellInd/${SSCAN_CHUNK_SIZE}];
    }
    
    //// addAarray1toOrigin : GRID
    @compute @workgroup_size(${bindingConfigs[ept].wgSize}) fn ${bindingConfigs[ept++].name}(
      @builtin(global_invocation_id) idx:vec3u
    ) {
      let cellInd = getCellInd(idx);
      sim.grid[cellInd].sums += sim.aArray1[cellInd/${FSCAN_CHUNK_SIZE}-1];
    }


    //// regToAtomicSums : GRID
    @compute @workgroup_size(${bindingConfigs[ept].wgSize}) fn ${bindingConfigs[ept++].name}(
      @builtin(global_invocation_id) idx:vec3u
    ) {
      let cellInd = getCellInd(idx);
      atomicStore(&sim.grid[cellInd].atomicSums, sim.grid[cellInd].sums);
    }
    
    //// fillIn : Particles
    @compute @workgroup_size(${bindingConfigs[ept].wgSize}) fn ${bindingConfigs[ept++].name}(
      @builtin(global_invocation_id) idx:vec3u
    ) {
      let part = sim.particles[idx.x];
      if(part.hash < ${GRID_SIZE}){
        let val = atomicSub(&sim.grid[part.hash].atomicSums, 1u);
        sim.particles[val-1].sortIndex = idx.x;
      }
    }

    

    //// culcDens : Particles
    @compute @workgroup_size(${bindingConfigs[ept].wgSize}) fn ${bindingConfigs[ept++].name}(
      @builtin(global_invocation_id) idx:vec3u
    ) {
      var part = sim.particles[idx.x];
      if(part.mass != 0){
        // culc cellPos
        part.cellPos = vec4i(vec2i(part.pPos * customU.inv_h), part.cellPos.zw);
        part.dens = 0.0;
        part.nDens = 0.0;
        for(var k = 0; k < 9; k++) {
          let checkPos = part.cellPos.xy + nextCells[k];
          let nextInd = getHash(vec3u(vec2u(checkPos), u32(part.cellPos.z)));
          let end = sim.grid[nextInd].sums;
          let start = end - sim.grid[nextInd].count;
          for(var n = start; n < end; n++){
            let part2 = sim.particles[sim.particles[n].sortIndex];
            let dst = distance(part.pPos, part2.pPos);
            if(dst < customU.h){
              part.dens += part2.mass * kernel(dst);
              part.nDens += part2.mass * sKernel(dst);
            }
          }
        }

        part.pres = customU.B * (part.dens - customU.rho0);
        part.nPres = customU.nB * part.nDens;
      }
      sim.particles[idx.x] = part;
    }

    //// culcN : Particles
    @compute @workgroup_size(${bindingConfigs[ept].wgSize}) fn ${bindingConfigs[ept++].name}(
      @builtin(global_invocation_id) idx:vec3u
    ) {
      var part = sim.particles[idx.x];
      if(part.mass != 0){
        part.n = vec2f(0.);
        for(var k = 0; k < 9; k++) {
          let checkPos = part.cellPos.xy + nextCells[k];
          let nextInd = getHash(vec3u(vec2u(checkPos), u32(part.cellPos.z)));
          let end = sim.grid[nextInd].sums;
          let start = end - sim.grid[nextInd].count;
          for(var n = start; n < end; n++){
            let part2 = sim.particles[sim.particles[n].sortIndex];
            let rij = part2.pPos - part.pPos;
            let dst = length(rij);
            if(dst < customU.h){
              let nij = select(normalize(rij), vec2f(0), dst == 0);
              part.n -= customU.h * part2.mass / part2.dens * kernelDiv(dst) * nij;
            }
          }
        }
        sim.particles[idx.x].n = part.n;
      }
    }
    
    //// culcForce : Particles
    @compute @workgroup_size(${bindingConfigs[ept].wgSize}) fn ${bindingConfigs[ept++].name}(
      @builtin(global_invocation_id) idx:vec3u
    ) {
      var part = sim.particles[idx.x];
      if(part.mass != 0){
        part.force = vec2<f32>(0, 0);
        for(var k = 0; k < 9; k++) {
          let checkPos = part.cellPos.xy + nextCells[k];
          let nextInd = getHash(vec3u(vec2u(checkPos), u32(part.cellPos.z)));
          let end = sim.grid[nextInd].sums;
          let start = end - sim.grid[nextInd].count;
          for(var n = start; n < end; n++){
            let part2 = sim.particles[sim.particles[n].sortIndex];
            let rij = part2.pPos - part.pPos;
            let vij = part2.vel - part.vel;
            let dst = length(rij);
            if(dst < customU.h){
              let nij = select(normalize(rij), vec2f(0), dst == 0);
            
              let invdensj = 1 / (part2.dens);

              let slope = kernelDiv(dst);
              let nSlope = sKernelDiv(dst);
              let presFactor = part2.mass * invdensj * 0.5 * nij;
              let Fpressure = presFactor * (part.pres + part2.pres) * slope;
              let Fnpressure = presFactor * (part.nPres + part2.nPres) * nSlope;
            
              let visSlope = kernelLap(dst);
              let muc = part2.mass * (part.visc+part2.visc) * invdensj * 0.5 * visSlope;
              let Fvis = muc * vij;

              let stSlope = stKernel(dst);
              let Fcohesion = -customU.alpha * part.mass * part2.mass * stSlope * nij;
              let Fcurvature = -customU.alpha * part2.mass * (part.n - part2.n);
              let Kij = 2*customU.rho0 / (part.dens + part2.dens);
              let Fst = Kij * (Fcohesion + Fcurvature);

              part.force += Fpressure + Fnpressure + Fvis + Fst;
            }
          }
        }

        sim.particles[idx.x].force = part.force;
      }
    }

    //// drawPart : Particles
    @compute @workgroup_size(${bindingConfigs[ept].wgSize}) fn ${bindingConfigs[ept++].name}(
      @builtin(global_invocation_id) idx:vec3u
    ) {
      let part = sim.particles[idx.x];
      let sPos = vec2f(customU.sPosX, customU.sPosY);
      let dPos = part.pos - sPos;
      var tpos = vec2f(dPos.x*cos(part.th), dPos.y*cos(customU.phi*TWO_PI) + dPos.x*sin(part.th)*sin(customU.phi*TWO_PI));
      tpos = sPos + rotate2D(tpos, customU.th*TWO_PI);
      let rndx = smplx3d_fractal(vec3f(part.pos*${partPosNoiseScale}, f32(part.cellPos.z)));
      let rndy = smplx3d_fractal(vec3f(part.pos*${partPosNoiseScale}, f32(part.cellPos.z)+1000));
      tpos += vec2f(rndx, rndy)*${partPosNoiseLevel};
      let pixPos = vec2u(tpos);

      // use defaultU
      for(var i = 0; i < ${convMapLength}; i++){
        let cPixPos = pixPos+vec2u(convMapPos[i]);
        let posInd = getPixInd(cPixPos);
        let dens = part.mass * convMapVal[i];
        atomicAdd(&aColors[posInd].x, floatToInt(dens));
      }
    }

    //// atomicToRegPix : Pixel
    @compute @workgroup_size(${bindingConfigs[ept].wgSize}) fn ${bindingConfigs[ept++].name}(
      @builtin(global_invocation_id) idx : vec3u
    ) {
      // use defaultU
      let posInd0 = getPixInd(idx.xy);
      let val = intToFloat(atomicLoad(&aColors[posInd0].x));
      cols[posInd0].x = val;
      atomicStore(&aColors[posInd0].x, 0);
    }

    //// draw : Pixel
    @compute @workgroup_size(${bindingConfigs[ept].wgSize}) fn ${bindingConfigs[ept++].name}(
      @builtin(global_invocation_id) idx : vec3u
    ) {
      // use defaultU
      let pixPos = vec2u(vec2f(idx.xy)*customU.scale) - vec2u((customU.scale-1.)*vec2f(customU.sPosX, customU.sPosY));
      if(any(pixPos > vec2u(u32(defaultU.windowW), u32(defaultU.windowH)))) {
        textureStore(tex, idx.xy, select(vec4f(.1,.1,.1,.1), vec4f(0.), customU.isSave == 1));
        return;
      }
      let posInd0 = getPixInd(pixPos);

      // DEFAULT
      // let val = cols[posInd0].x;
      // TOON
      let val = step(customU.toonTH, cols[posInd0].x);

      // White
      // textureStore(tex, idx.xy, vec4f(val));
      // Red
      textureStore(tex, idx.xy, vec4f(customU.colLight * val, 0, 0, val));
    }

    //// updatePart : Particles
    @compute @workgroup_size(${bindingConfigs[ept].wgSize}) fn ${bindingConfigs[ept++].name}(
      @builtin(global_invocation_id) idx:vec3u
    ) {
      var part = sim.particles[idx.x];
      let currentTime = defaultU.time;
      let totalSpawnTime = currentTime - part.sTime;
      state = vec4u(idx, ${seed});
      let rnd = rand4();
      let surfRate = customU.inv_h*min(customU.h, length(part.n));
      part.mass = select(part.mass, 0, defaultU.right == 1);
      if(part.mass != 0){
        let velLen = length(part.vel);
        let vVec = normalize(part.vel);
        let nVec = cross(vec3f(vVec, 0), vec3f(0,0,1.)).xy;
        // 速度を減衰させたい
        let varF = -step(customU.partMinVel, velLen)*(part.vel)*customU.velDecay*customU.dt*surfRate*step(${velDecayThreshold}, surfRate*customU.h);
        //// 係数
        // 先端ほど高い係数
        let stCont = max(0, (flows[part.cellPos.w].crossRange - part.sTime)) / flows[part.cellPos.w].crossRange;
        // スポーン位置からの相対座標
        let relPos = part.pos - vec2f(customU.sPosX, customU.sPosY);
        let nRelPos = normalize(relPos);
        // スポーン位置からの距離
        let lenCont = step(flows[part.cellPos.w].yMax, length(relPos));
        // カーブの外向きベクトル
        let outVec = nVec;
        // 奇数レイヤー
        // let oddCont = f32(part.cellPos.w)%2;
        
        part.force += vec2f(customU.gravityX, customU.gravityY);
        let rndx = simplex3d(vec3f(part.pos*${partVelNoiseScale}, f32(part.cellPos.z)));
        let rndy = simplex3d(vec3f(part.pos*${partVelNoiseScale}, f32(part.cellPos.z)+1000));
        let vel = part.vel + (part.force + .01*velLen*vec2f(rndx, rndy)*${partVelNoiseLevel}) * customU.dt;

        // 外側に広げたい
        let outVel = normalize(outVec + nRelPos*6) * flows[part.cellPos.w].flowOutVelStr;
        part.vel = vel + varF + outVel;
        // 回転させたい
        part.vel = rotate2D(part.vel, -stCont*(velLen+stCont*200)*flows[part.cellPos.w].crossFactor*lenCont);
        part.pos += part.vel * customU.dt;
        part.force = vec2f(0.);

        let maxPos = vec2f(defaultU.windowW, defaultU.windowH);
        let center = maxPos * 0.5;
        let absPos = abs(part.pos - center);
        let isOutS = select(1., 0., any(absPos > center));
        part.mass *= isOutS;
      }

      //// spawn particles
      // find flow id
      var flowId = -1;
      var idu = 0u;
      for(var i = 0; i < ${flowNum}; i++){
        let numU = u32(flows[i].spawnNum);
        let a = u32(flows[i].spawnId);
        let b = a + numU;
        let fixNum = select(0u, u32(${N}), a > b && idx.x < b);
        let fixIdx = idx.x+fixNum;
        let fixb = b+fixNum;
        let isSpawnParticleID = (a <= fixIdx) && (fixIdx < fixb);
        idu = (fixIdx-a);

        if(isSpawnParticleID){
          flowId = i;
          break;
        }
      }
      if(flowId >= 0 && flows[flowId].isSpawning == 1){
        let idf = f32(idu);
        let idfn = idf % flows[flowId].spawnBold;
        let idfv = idf / flows[flowId].spawnBold;
        let spawnVel = mix(flows[flowId].spawnVel.zw, flows[flowId].spawnVel.xy, idf / flows[flowId].spawnNum);
        part.vel = customU.spawnVelFactor * spawnVel;
        let len0 = sqrt(customU.mass*customU.inv_rho0)*${spawnFineAdjustN};
        let velLen = length(part.vel);
        let vn = select(len0*part.vel/velLen, vec2f(0.), velLen == 0.0);
        let n = len0*cross(vec3f(0,0,1), vec3f(vn, 0)).xy;
        let offs = (flows[flowId].spawnBold-1)*.5;
        let r = vn*(idfv + idfn*flows[flowId].offsetPos.w) + n*(idfn-offs) + flows[flowId].offsetPos.xy;
        part.pos = vec2f(customU.sPosX, customU.sPosY) + r;
        part.cellPos.z = i32(flows[flowId].offsetPos.z);
        part.mass = ${massCutoff};
        part.visc = customU.viscosity;
        // part.th = f32(flowId)*2;
        // part.th = f32(flowId)%2.*PI+(sin(f32(flowId)*8451.1461)%1)*0.5;
        // part.th = f32(flowId)%2.*PI+(f32(xorshift(u32(flowId+${seed})))/0xffffffff - .5)*${thRange};
        // part.th = f32(flowId)%2.*PI;
        // part.th = 0.;
        part.sTime = currentTime;
        part.cellPos.w = flowId;
      }

      let decayMass = part.mass*(1-customU.massDecay*customU.dt);
      let growMass = max(${massCutoff}, customU.mass*min(1., ${massGrowSlope}*(defaultU.time-part.sTime)/customU.massGrowTime));
      part.mass = step(${massCutoff}, part.mass)*select(decayMass, growMass, defaultU.time-part.sTime<customU.massGrowTime);

      sim.particles[idx.x] = part;
    }

    // end of @compute
    ///////////////
    // functions //
    ///////////////
    fn rotate2D(vec: vec2<f32>, angle: f32) -> vec2<f32> {
      let cos_theta = cos(angle);
      let sin_theta = sin(angle);
      let rot = mat2x2<f32>(
        cos_theta, -sin_theta,
        sin_theta,  cos_theta
      );
      return rot * vec;
    }

    fn xorshift(seed: u32) -> u32 {
      var x = 123456789u + seed*215737;
      var y = 362436069u + seed*135183;
      var z = 521288629u + seed*123481;
      var w = 88675123u + seed*1247483;
      state.w = x ^ (x<<11);
      x = y; y = z; z = w;
      w ^= state.w ^ (state.w>>8) ^ (w>>19);
      return w;
    }

    fn getCellInd(pos: vec3u) -> u32
    {
      return pos.x + pos.y*u32(${GRID_SIZE_X}) + pos.z*u32(${GRID_SIZE_X*GRID_SIZE_Y});
    }

    fn getHash(pos: vec3u) -> u32
    {
      return (pos.x + pos.y*u32(${GRID_SIZE_X}) + pos.z*u32(${GRID_SIZE_X*GRID_SIZE_Y})) % ${GRID_SIZE};
    }

    fn getPixInd(pos: vec2u) -> u32
    {
      return pos.x + pos.y*u32(defaultU.windowW);
    }

    const fi_scale = 65536.0;
    const if_scale = 1./65536.0;

    fn floatToInt(f: f32) -> i32
    {
      return i32(f*fi_scale);
    }

    fn intToFloat(i: i32) -> f32
    {
      return f32(i)*if_scale;
    }

    const PI = ${Math.PI};
    const TWO_PI = ${2*Math.PI};
    const PI3 = ${Math.PI/3};
    const HALF_PI = ${Math.PI*.5};

    fn pallet(th: f32) -> vec3f
    {
      return vec3f((sin(th)+1)*.5, (sin(th+2*PI3)+1)*.5, (sin(th+4*PI3)+1)*.5);
    }

    var<private> state : uint4;

    fn pcg4d(a: uint4) -> uint4
    {
      var v = a * 1664525u + 1013904223u;
        v.x += v.y*v.w; v.y += v.z*v.x; v.z += v.x*v.y; v.w += v.y*v.z;
        v = v ^  ( v >> uint4(16u) );
        v.x += v.y*v.w; v.y += v.z*v.x; v.z += v.x*v.y; v.w += v.y*v.z;
        return v;
    }

    fn rand4() -> float4
    { 
      state = pcg4d(state);
      return float4(state)/float(0xffffffffu); 
    }

    fn rand3d(c: float3) -> float3
    {
      var j = 4096.0*sin(dot(c,vec3(17.0, 59.4, 15.0)));
      var r = float3(0.);
      r.z = fract(512.0*j);
      j *= .125;
      r.x = fract(512.0*j);
      j *= .125;
      r.y = fract(512.0*j);
      return r - 0.5;
    }

    const F3 = 0.3333333;
    const G3 = 0.1666667;

    fn simplex3d(p: float3) -> float
    {
      let s = floor(p + dot(p, vec3(F3)));
      let x = p - s + dot(s, vec3(G3));

      let e = step(vec3(0.0), x - x.yzx);
      let i1 = e*(1.0 - e.zxy);
      let i2 = 1.0 - e.zxy*(1.0 - e);

      let x1 = x - i1 + G3;
      let x2 = x - i2 + 2.0*G3;
      let x3 = x - 1.0 + 3.0*G3;

      var w = float4(0.);
      var d = float4(0.);

      w.x = dot(x, x);
      w.y = dot(x1, x1);
      w.z = dot(x2, x2);
      w.w = dot(x3, x3);

      w = max(0.6 - w, float4(0.0));

      d.x = dot(rand3d(s), x);
      d.y = dot(rand3d(s + i1), x1);
      d.z = dot(rand3d(s + i2), x2);
      d.w = dot(rand3d(s + 1.0), x3);

      w *= w;
      w *= w;
      d *= w;

      return dot(d, vec4(52.0));
    }
    const rot1 = mat3x3<f32>(-0.37, 0.36, 0.85,-0.14,-0.93, 0.34,0.92, 0.01,0.4);
    const rot2 = mat3x3<f32>(-0.55,-0.39, 0.74, 0.33,-0.91,-0.24,0.77, 0.12,0.63);
    const rot3 = mat3x3<f32>(-0.71, 0.52,-0.47,-0.08,-0.72,-0.68,-0.7,-0.45,0.56);

    /* directional artifacts can be reduced by rotating each octave */
    fn smplx3d_fractal(m: float3) -> float
    {
      return   0.5333333*simplex3d(m*rot1)
              +0.2666667*simplex3d(2.0*m*rot2)
              +0.1333333*simplex3d(4.0*m*rot3)
              +0.0666667*simplex3d(8.0*m);
    }
    // fn smplx3d_fractal(m: float3) -> float
    // {
    //   return   0.6666667*simplex3d(m*rot1)
    //           +0.3333333*simplex3d(2.0*m*rot2);
    // }
  `;

  sedUsedBindings(wgslCode, bindingConfigs);

  const module = device.createShaderModule({
    label: 'culc module',
    code: wgslCode,
  });

  //// pipelines
  const pipelines = Array(bindingConfigs.length).fill(0).map((_, i)=>{
    return device.createComputePipeline({
      label: bindingConfigs[i].name + 'pipeline',
      layout: 'auto',
      compute: { module, entryPoint: bindingConfigs[i].name },
    });
  });

  //// init buffers
  // default Uniform
  const dUniValues = new Float32Array(Object.values(defaultInputList));
  const dUniBuffer = device.createBuffer({
    label: 'default uniforms buffer',
    size: dUniValues.length * 4,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(dUniBuffer, 0, dUniValues);

  // customU Uniform
  const cUniValues = new Float32Array(Object.values(customInputList));
  const cUniBuffer = device.createBuffer({
    label: 'customU uniforms buffer',
    size: cUniValues.length * 4,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(cUniBuffer, 0, cUniValues);

  // flow params storage buffer
  const initValues = new Float32Array(Object.values(initialInputList.flat()));
  const initStorageBuffer = device.createBuffer({
    label: 'flow params storage buffer',
    size: (flowNum * 16) * 4,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(initStorageBuffer, 0, initValues);

  // storage buffer
  const storageBuffer = device.createBuffer({
    label: 'storage buffer',
    size: (N * 24 + GRID_SIZE * 8 + (FSCAN_CHUNK_NUM + SSCAN_CHUNK_NUM*2)) * 4,
    usage: GPUBufferUsage.STORAGE,
  });

  colorBuffer = device.createBuffer({
    label: 'color buffer',
    size: gpuCanvas.width * gpuCanvas.height * 4 * 4,
    usage: GPUBufferUsage.STORAGE,
  });

  aColorBuffer = device.createBuffer({
    label: 'atomic color buffer',
    size: gpuCanvas.width * gpuCanvas.height * 4 * 4,
    usage: GPUBufferUsage.STORAGE,
  });

  // --- rendering ---
  function render() {
    if(brushDown) putTimeStamp();
    drawBackgroundFrame();
    if(isComputing){
      const texture = context.getCurrentTexture();

      //// Update Buffer
      // update customU
      updateCustomInputList();
      if(JSON.stringify(customInputList) !== JSON.stringify(pcustomInputList)){
        const cUniValues = new Float32Array(Object.values(customInputList));
        device.queue.writeBuffer(cUniBuffer, 0, cUniValues);
      }
      pcustomInputList = {...customInputList};
      
      // update defaultU
      defaultInputList.time = time;
      const dUniValues = new Float32Array(Object.values(defaultInputList));
      device.queue.writeBuffer(dUniBuffer, 0, dUniValues);
      

      // update flow storage buffer
      const idx = windows[2].inputs.currentFlow.value;
      for(let i = 0; i < flowNum; i++){
        let spawnTrgX = customInputList.sPosX;
        let spawnTrgY = customInputList.sPosY;
        let isSpawning;
        let pSpawnVx = spawnVx[i];
        let pSpawnVy = spawnVy[i];
        const fxDrawCount = drawCount - (+windows[0].inputs.flowDelay.value + flowParams[i].flowDelay) * Math.ceil(60/fps);
        spawnVx[i] = 0;
        spawnVy[i] = 0;
        if(i == idx && defaultInputList.mouseIsPressed){
          spawnTrgX = defaultInputList.mouseX;
          spawnTrgY = defaultInputList.mouseY;
          isSpawning = defaultInputList.mouseIsPressed;
        } else if(fxDrawCount >= 0 && fxDrawCount < flowParams[i].timeStamps.length) {
          const ts = flowParams[i].timeStamps[fxDrawCount];
          let x = ts.x;
          let y = ts.y;
          spawnTrgX += x;
          spawnTrgY -= y;
          isSpawning = ts.spawning;
        } else {
          isSpawning = false;
        }
        spawnVx[i] = spawnTrgX - customInputList.sPosX;
        spawnVy[i] = spawnTrgY - customInputList.sPosY;

        if(time == 0){
          pSpawnVx = spawnVx[i];
          pSpawnVy = spawnVy[i];
        }
        
        const offsetPos = [...flowParams[i].offsetPos];
        let dPosX = spawnPosVel[0] * drawCount * customInputList.dt;
        let dPosY = spawnPosVel[1] * drawCount * customInputList.dt;
        offsetPos[0] += dPosX;
        offsetPos[1] += dPosY;

        const velLen = Math.sqrt(spawnVx[i]*spawnVx[i] + spawnVy[i]*spawnVy[i]);
        const spawnBold = Math.floor(Math.sqrt(velLen)*flowParams[i].flowBold);
        const dLen = customInputList.dt*customInputList.spawnVelFactor*velLen*spawnFineAdjustV;
        fluidLen[i] += dLen;
        const L = Math.sqrt(customInputList.mass*customInputList.inv_rho0);
        const spawnLen = Math.floor(fluidLen[i]/L);
        fluidLen[i] -= spawnLen*L;
        const spawnPartNum = isSpawning ? spawnLen*spawnBold : 0;
        
        initialInputList[i] = [
          spawnVx[i], spawnVy[i], pSpawnVx, pSpawnVy,
          ...offsetPos,
          isSpawning, spawnPartId, spawnPartNum, spawnBold,
          flowParams[i].yMax, flowParams[i].crossFactor*0.0001,
          flowParams[i].crossRange, flowParams[i].flowOutVelStr,
        ];
        
        spawnPartId += spawnPartNum;
        spawnPartId %= N;
      }
      const initValues = new Float32Array(Object.values(initialInputList.flat()));
      device.queue.writeBuffer(initStorageBuffer, 0, initValues);
      time += customInputList.dt;
      
      const passEncorders = [];
      for(let i = 0; i < bindingConfigs.length; i++){
        if(bindingConfigs[i].isInit == true && !isInitializing) {
          // do nothing
        }
        else {
          //// BindGroup
          const bindGroupEntrieRes = [
            { binding: 0, resource: { buffer: cUniBuffer }},
            { binding: 1, resource: { buffer: dUniBuffer }},
            { binding: 2, resource: { buffer: initStorageBuffer }},
            { binding: 3, resource: { buffer: storageBuffer }},
            { binding: 4, resource: { buffer: colorBuffer }},
            { binding: 5, resource: { buffer: aColorBuffer }},
            { binding: 6, resource: texture.createView() },
          ];
          
          const layout = pipelines[i].getBindGroupLayout(0);
          layout.label = bindingConfigs[i].name + 'BindGroupLayout';

          const pipeline = pipelines[i];
          const bindGroup = device.createBindGroup({
            label: bindingConfigs[i].name + 'BindGroup',
            layout: layout,
            entries: bindingConfigs[i].bind.map(j=>{
              return { binding: j, resource: bindGroupEntrieRes[j].resource }
            }),
          });
          const dispatchWorkgroups = bindingConfigs[i].wgNum;

          passEncorders.push({
            pipeline: pipeline, bindGroup:bindGroup, dispatchWorkgroups: dispatchWorkgroups
          });
        }
      }

      isInitializing = false;

      const encoder = device.createCommandEncoder({ label: 'my encoder' });
      const pass = encoder.beginComputePass();

      for(let i = 0; i < passEncorders.length; i++){
        pass.setPipeline(passEncorders[i].pipeline);
        pass.setBindGroup(0, passEncorders[i].bindGroup);
        pass.dispatchWorkgroups(...passEncorders[i].dispatchWorkgroups);
      }

      pass.end();
      const commandBuffer = encoder.finish();
      device.queue.submit([commandBuffer]);

      // save
      if(customInputList.isSave){
        if(drawCount % Math.ceil(60/fps) == 0){
          saveFrame(gpuCanvas);
        }
      } else if (wasSaving) {
        downloadAllFrames();
      }
      wasSaving = customInputList.isSave;
      drawCount++;

    }
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
  
  // --- Frameの読み込み ---
  async function updateFramesWindow(event)
  {
    const files = event.target.files;
    if (!files.length) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const imageBitmap = await createImageBitmap(file);
      backgroundFrames.push(imageBitmap);

      if (i === 0) {
        gpuCanvas.width = imageBitmap.width;
        gpuCanvas.height = imageBitmap.height;
        bgCanvas.width = imageBitmap.width;
        bgCanvas.height = imageBitmap.height;

        defaultInputList.windowW = gpuCanvas.width;
        defaultInputList.windowH = gpuCanvas.height;
        bindingConfigs.find(cf => cf.name === 'atomicToRegPix').wgNum = [gpuCanvas.width, gpuCanvas.height];
        bindingConfigs.find(cf => cf.name === 'draw').wgNum = [gpuCanvas.width, gpuCanvas.height];
        colorBuffer = device.createBuffer({
          label: 'color buffer',
          size: gpuCanvas.width * gpuCanvas.height * 4 * 4,
          usage: GPUBufferUsage.STORAGE,
        });
        aColorBuffer = device.createBuffer({
          label: 'atomic color buffer',
          size: gpuCanvas.width * gpuCanvas.height * 4 * 4,
          usage: GPUBufferUsage.STORAGE,
        });
      }

      windows[1].addButton(`Frame ${i}`, () => {
        currentFrameIndex = i;
        drawBackgroundFrame();
      }, true);
    }

    windows[1].addButton('Animation', () => {animateFrames = !animateFrames});
    windows[1].addButton('Loop', () => {loopFrames = !loopFrames});
    
    windows[0].inputs.flowDelay.max = files.length;
    windows[2].inputs.flowDelay.max = files.length;

    // 最初のフレームを表示
    drawBackgroundFrame();
  }
  document.getElementById('imageInput').addEventListener('change', updateFramesWindow);

  // --- projectのロード ---
  function loadProject(event){
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const jsonObject = JSON.parse(e.target.result);
        console.log('読み込んだJSONオブジェクト:', jsonObject);

        const globalData = jsonObject.win0;
        const flowData = jsonObject.win2;

        // globalパラメータのロード
        for(let i = 0; i < sliderConfigs.length; i++) {
          const key = sliderConfigs[i].name;
          windows[0].sliders[key].value = globalData[key] ?? windows[0].sliders[key].value;
          windows[0].sliders[key].dispatchEvent(new Event('input'));
        }

        // file name
        windows[0].inputs.textInput.value = globalData.fileName ?? windows[0].inputs.textInput.value;
        windows[0].inputs.flowDelay.value = globalData.flowDelay ?? windows[0].inputs.flowDelay.value;
        // スポーン座標
        customInputList.sPosX = globalData.sPosX ?? customInputList.sPosX;
        customInputList.sPosY = globalData.sPosY ?? customInputList.sPosY;
        // スポーン位置速度
        spawnPosVel[0] = globalData.spawnPosVelX ?? globalData.spawnPosVelX;
        spawnPosVel[1] = globalData.spawnPosVelY ?? globalData.spawnPosVelY;

        // 各flowのデータをロード
        for(let i = 0; i < Math.min(flowData.length, LAYER_NUM); i++)
        {
          flowParams[i].flowDelay = flowData[i].flowDelay ?? flowParams[i].flowDelay;
          flowParams[i].timeStamps = flowData[i].timeStamps ?? flowParams[i].timeStamps;
          flowParams[i].noiseLevel = flowData[i].noiseLevel ?? flowParams[i].noiseLevel;
          flowParams[i].offsetPos = flowData[i].offsetPos ?? flowParams[i].offsetPos;
          const keys = Object.keys(windows[2].sliders);
          for(let key of keys){
            flowParams[i][key] = flowData[i][key] ?? flowParams[i][key];
          }
        }
      } catch (err) {
        console.error('JSONのパースに失敗:', err);
      }
    };
    reader.readAsText(file);
  }
  document.getElementById('projectInput').addEventListener('change', loadProject);
}
let backgroundFrames = [];  // ← 全背景画像を保持

function sedUsedBindings(wgslCode, bindingConfigs) {
  // 全ての @compute の開始インデックスを取得
  const computeIndices = [...wgslCode.matchAll(/@compute/g)].map(match => match.index);

  for (let i = 0; i < bindingConfigs.length; i++) {
    const start = computeIndices[i];
    const end = computeIndices[i + 1] ?? wgslCode.length;
    const funcBlock = wgslCode.slice(start, end);

    // 関数名確認（念のため）
    const fnMatch = funcBlock.match(/fn\s+(\w+)\s*\(/);
    const funcName = fnMatch?.[1];
    if (!funcName || funcName !== bindingConfigs[i].name) {
      console.warn(`関数名が一致しません: 期待値=${bindingConfigs[i].name}, 実際=${funcName}`);
      continue;
    }

    // 関数本体の { ... } を抽出
    const bodyStart = funcBlock.indexOf('{');
    const body = extractBracedBlock(funcBlock, bodyStart);

    // 使われているbindingを抽出
    for (let j = 0; j < allBindings.length; j++) {
      if (body.includes(allBindings[j])) {
        bindingConfigs[i].bind.push(j);
      }
    }
  }
}

// 中括弧のブロック抽出（ネスト対応）
function extractBracedBlock(code, startIndex) {
  let depth = 0;
  let inString = false;
  let result = '';
  for (let i = startIndex; i < code.length; i++) {
    const char = code[i];
    result += char;
    if (char === '"' || char === "'") {
      inString = !inString;
    } else if (!inString && char === '{') {
      depth++;
    } else if (!inString && char === '}') {
      depth--;
      if (depth === 0) break;
    }
  }
  return result;
}

let wasSaving = false;
const savedFrames = [];
// フレームをPNGとして保存
function saveFrameAsPNG(canvas) {
  // Convert the gpuCanvas to data
  var image = canvas.toDataURL();
  // Create a link
  var aDownloadLink = document.createElement('a');
  // Add the name of the file to the link
  aDownloadLink.download = `canvas_image_${(frameCount+1).toString().padStart(4, '0')}.png`;
  // Attach the data to the link
  aDownloadLink.href = image;
  // Get the code to click the download link
  aDownloadLink.click();
  frameCount++;
}

function saveFrame(canvas) {
  const image = canvas.toDataURL();
  savedFrames.push(image);
}

async function downloadAllFrames() {
  const zip = new JSZip();
  const folder = zip.folder("frames");

  // DataURL をバイナリデータに変換して ZIP に追加
  for (let i = 0; i < savedFrames.length; i++) {
    const dataUrl = savedFrames[i];
    const base64 = dataUrl.split(',')[1];
    const fileName = `frame_${(i + 1).toString().padStart(4, '0')}.png`;
    folder.file(fileName, base64, { base64: true });
  }

  // ZIP生成 & ダウンロード
  const blob = await zip.generateAsync({ type: "blob" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = windows[0].inputs['textInput'].value + '.zip';
  a.click();

  savedFrames.length = 0; // キャッシュクリア
}

function savingFrames() {
  customInputList.isSave = !customInputList.isSave;
  frameCount = 0;
}

// projectをセーブ
function saveProject() {
  const globalParams = {};
  for(let i = 0; i < sliderConfigs.length; i++){
    globalParams[sliderConfigs[i].name] = windows[0].sliders[sliderConfigs[i].name].value;
  }
  globalParams.fileName = windows[0].inputs.textInput.value;
  globalParams.flowDelay = windows[0].inputs.flowDelay.value;
  globalParams.sPosX = customInputList.sPosX;
  globalParams.sPosY = customInputList.sPosY;
  globalParams.spawnPosVelX = spawnPosVel[0];
  globalParams.spawnPosVelY = spawnPosVel[1];
  const project = { win0:globalParams, win2:flowParams }
  downloadJSON(project, windows[0].inputs.textInput.value + '.json');
}

// objectをjson化して保存
function downloadJSON(obj, filename = 'data.json') {
  const jsonStr = JSON.stringify(obj, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url); // メモリ解放
}

// --- Toggle Button ---
let visible = true;
const toggleButton = document.getElementById('toggleButton');
toggleButton.addEventListener('click', () => {
  visible = !visible;
  windows.forEach(w => w.toggle(visible));
  toggleButton.textContent = visible ? 'パラメータ非表示' : 'パラメータ表示';
});
windows.forEach(w => w.toggle(visible));

main();