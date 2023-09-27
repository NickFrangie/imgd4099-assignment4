import { default as seagulls } from "./seagulls.js";
import { Pane } from "https://cdn.jsdelivr.net/npm/tweakpane@4.0.1/dist/tweakpane.min.js";

const WORKGROUP_SIZE = 8;
const NUM_PARTICLES = 1024; // must be evenly divisble by 4 to use wgsl structs
const NUM_PROPERTIES = 4;

let frame = 0;

var params = {
  size: 0.15,
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
    .addBinding(params, "size", { min: 0, max: .5 })
    .on("change", (e) => {
      sg.uniforms.size = e.value;
    });
  pane
    .addBinding(params, 'timescale', { min: .8, max: 4 })
    .on('change',  e => { 
      sg.uniforms.timescale = e.value; 
    });

  // Variables
  const state = new Float32Array(NUM_PARTICLES * NUM_PROPERTIES);

  // Initialization    
  for( let i = 0; i < NUM_PARTICLES * NUM_PROPERTIES; i+= NUM_PROPERTIES ) {
    state[ i ] = -1 + Math.random() * 2
    state[ i + 1 ] = -1 + Math.random() * 2
    state[ i + 2 ] = Math.random() * 10
  }

  // Seagull
  sg.buffers({ state })
    .backbuffer(false)
    .blend(true)
    .uniforms({ 
      frame, 
      res: [sg.width, sg.height],
      size: params.size,
      timescale: params.timescale,
    })
    .compute(compute, NUM_PARTICLES / (WORKGROUP_SIZE * WORKGROUP_SIZE) )
    .render(render)
    .onframe(() =>  {
      sg.uniforms.frame = frame++  
    })
    .run( NUM_PARTICLES )
}

main();
