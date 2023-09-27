struct VertexInput {
  @location(0) pos: vec2f,
  @builtin(instance_index) instance: u32,
};

struct VertexOutput {
  @builtin(position) pos: vec4f,
  @location(0) @interpolate(flat) instance: u32
}

struct Particle {
  angle: f32,
  radius: f32,
  speed: f32,
  empty: f32
};

@group(0) @binding(0) var<uniform> frame: f32;
@group(0) @binding(1) var<uniform> res: vec2f;
@group(0) @binding(2) var<uniform> sizeFactor: f32;
@group(0) @binding(3) var<uniform> minRadius: f32;
@group(0) @binding(4) var<uniform> maxRadius: f32;
@group(0) @binding(5) var<uniform> timescale: f32;
@group(0) @binding(6) var<storage> state: array<Particle>;

@vertex 
fn vs( input : VertexInput ) ->  VertexOutput {
  let size = input.pos * sizeFactor;
  let aspect = res.y / res.x;
  
  let p = state[input.instance];
  let modifiedRadius = p.radius * (maxRadius - minRadius) + minRadius;
  let convertedPos = modifiedRadius * vec2f(cos(p.angle), sin(p.angle));
  
  var out: VertexOutput = VertexOutput();
  out.pos = vec4f(convertedPos.x - size.x * aspect, convertedPos.y + size.y, 0., 1.);
  out.instance = input.instance;
  
  return out; 
}

@fragment 
fn fs( input : VertexOutput  ) -> @location(0) vec4f {
  let p = state[input.instance];
  let modifiedRadius = p.radius * (maxRadius - minRadius) + minRadius;
  
  let red = .5 + sin(frame / 60. - modifiedRadius) * .5;
  let green = .5 + sin(frame / 120.) * .5;
  let blue = .5 + sin(modifiedRadius + frame / 180. ) * .5;
  return vec4f(red, green , blue , 1. );
}