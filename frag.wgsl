@group(0) @binding(0) var<uniform> res: vec2f;
@group(0) @binding(1) var<uniform> leftFeed: f32;
@group(0) @binding(2) var<uniform> rightFeed: f32;
@group(0) @binding(3) var<uniform> leftKill: f32;
@group(0) @binding(4) var<uniform> rightKill: f32;
@group(0) @binding(5) var<uniform> diffusionA: f32;
@group(0) @binding(6) var<uniform> diffusionB: f32;
@group(0) @binding(7) var<uniform> timescale: f32;
@group(0) @binding(8) var<storage> stateA: array<f32>;
@group(0) @binding(10) var<storage> stateB: array<f32>;

@fragment 
fn fs( @builtin(position) pos : vec4f ) -> @location(0) vec4f {
  let idx : u32 = u32( pos.y * res.x + pos.x );
  let a = stateA[idx];
  let b = stateB[idx];
  
  return vec4f(b,b,b,1.);
}
