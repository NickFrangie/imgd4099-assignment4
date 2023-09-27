import { default as seagulls } from "./seagulls.js";
import { Pane } from "https://cdn.jsdelivr.net/npm/tweakpane@4.0.1/dist/tweakpane.min.js";

const WORKGROUP_SIZE = 8;
const NUM_PARTICLES = 2048; // must be evenly divisble by 4 to use wgsl structs
const NUM_PROPERTIES = 4;

let frame = 0;

var params = {
  size: 0.015,
  minRadius: .35,
  maxRadius: .75,
  timescale: 1,
};

async function main() {
  // Imports
  const sg = await seagulls.init();
  const render = await seagulls.import("./render.wgsl");
  const compute = await seagulls.import("./compute.wgsl");
  
  // Tweakpane
  const pane = new Pane();
  pane
    .addBinding(params, "size", { min: 0.005, max: .1 })
    .on("change", (e) => {
      sg.uniforms.size = e.value;
    });
  pane
    .addBinding(params, "minRadius", { min: 0, max: 1. })
    .on("change", (e) => {
      sg.uniforms.minRadius = e.value;
    });
  pane
    .addBinding(params, "maxRadius", { min: .0, max: 1. })
    .on("change", (e) => {
      sg.uniforms.maxRadius = e.value;
    });
  pane
    .addBinding(params, 'timescale', { min: .0, max: 10 })
    .on('change',  e => { 
      sg.uniforms.timescale = e.value; 
    });

  // Variables
  const state = new Float32Array(NUM_PARTICLES * NUM_PROPERTIES);

  // Initialization    
  for(let i = 0; i < NUM_PARTICLES * NUM_PROPERTIES; i+= NUM_PROPERTIES ) {
    state[ i ] = Math.random() * 360;
    state[ i + 1 ] = Math.random();
    state[ i + 2 ] = Math.random() * .01 + .01;
    state[ i + 3 ] = 0;
  }

  // Seagull
  sg.buffers({ state })
    .backbuffer(false)
    .blend(true)
    .uniforms({ 
      frame, 
      res: [sg.width, sg.height],
      size: params.size,
      minRadius: params.minRadius,  
      maxRadius: params.maxRadius,
      timescale: params.timescale,
    })
    .compute(compute, NUM_PARTICLES / (WORKGROUP_SIZE * WORKGROUP_SIZE) )
    .render(render)
    .onframe(() =>  {
      frame += params.timescale;
      sg.uniforms.frame = frame;
    })
    .run(NUM_PARTICLES)
}

main();
