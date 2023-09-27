import { default as seagulls } from "./seagulls.js";
import { Pane } from "https://cdn.jsdelivr.net/npm/tweakpane@4.0.1/dist/tweakpane.min.js";

var params = {
  leftFeed: 0.13,
  rightFeed: 0.2,
  leftKill: 0.03,
  rightKill: 0.025,
  diffusionA: 1.0,
  diffusionB: 0.15,
  timescale: 1,
};

async function main() {
  const sg = await seagulls.init();
  const frag = await seagulls.import("./frag.wgsl");
  const compute = await seagulls.import("./compute.wgsl");
  
  // Tweakpane
  const pane = new Pane();
  pane
    .addBinding(params, "leftFeed", { min: 0, max: .5 })
    .on("change", (e) => {
      params.leftFeed = e.value;
    });
  pane
    .addBinding(params, "rightFeed", { min: 0, max: .5 })
    .on("change", (e) => {
      params.rightFeed = e.value;
    });
  pane
    .addBinding(params, "leftKill", { min: 0, max: .5 })
    .on("change", (e) => {
      params.leftKill = e.value;
    });
  pane
    .addBinding(params, "rightKill", { min: 0, max: .5 })
    .on("change", (e) => {
      params.rightKill = e.value;
    });
  pane
    .addBinding(params, "diffusionA", { min: 0, max: 1 })
    .on("change", (e) => {
      params.diffusionA = e.value;
    });
  pane
    .addBinding(params, "diffusionB", { min: 0, max: 1 })
    .on("change", (e) => {
      params.diffusionB = e.value;
    });
  // pane
  //   .addBinding(params, 'timescale', { min: .8, max: 4 })
  //   .on('change',  e => { 
  //     sg.uniforms.timescale = e.value; 
  // });
  pane
    .addButton({ title: "Reset" })
    .on("click", main);

  // Variables
  const render = seagulls.constants.vertex + frag;

  const size = window.innerWidth * window.innerHeight,
        stateA = new Float32Array(size),
        stateB = new Float32Array(size);

  const workgroups = [
    Math.round(window.innerWidth / 8),
    Math.round(window.innerHeight / 8),
    1,
  ];

  // Initialization    
  for( let i = 0; i < size; i++ ) {
    stateA[i] = Math.random();
    stateB[i] = .5;
  }

  const feedsize = 500;
  for (let x = -feedsize; x <= +feedsize; x++) {
    for (let y = window.innerHeight / 2 - feedsize; y <= window.innerHeight / 2 + feedsize; y++) {
        const index = y * window.innerWidth + x;
        stateA[index] = Math.random();
    }
  }

  // Seagull
  sg
    .buffers({
      stateA1: stateA,
      stateA2: stateA,
      stateB1: stateB,
      stateB2: stateB,
    })
    .uniforms({
      resolution: [window.innerWidth, window.innerHeight],
      leftFeed: params.leftFeed,
      rightFeed: params.rightFeed,  
      leftKill: params.leftKill,
      rightKill: params.rightKill,
      diffusionA: params.diffusionA,
      diffusionB: params.diffusionB,
      timescale: params.timescale,
    })
    .onframe(() => {
      sg.uniforms.leftFeed = params.leftFeed,
      sg.uniforms.rightFeed = params.rightFeed,  
      sg.uniforms.leftKill = params.leftKill,
      sg.uniforms.rightKill = params.rightKill,
      sg.uniforms.diffusionA = params.diffusionA;
      sg.uniforms.diffusionB = params.diffusionB;
      // sg.uniforms.timescale = params.timescale;
    })
    .backbuffer(false)
    .pingpong(1)
    .compute(compute, workgroups, { pingpong: ["stateA1", "stateB1"] })
    .render(render)
    .run();
}

main();
