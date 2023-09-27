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
@group(0) @binding(2) var<uniform> size: vec2f;
@group(0) @binding(3) var<uniform> timescale: vec2f;
@group(0) @binding(4) var<storage> state: array<Particle>;

@vertex 
fn vs( input : VertexInput ) ->  VertexOutput {
  let size = input.pos * .015;
  let aspect = res.y / res.x;
  
  let p = state[input.instance];
  let pos = p.radius * vec2f(cos(p.angle), sin(p.angle));
  
  var out: VertexOutput = VertexOutput();
  out.pos = vec4f(pos.x - size.x * aspect, pos.y + size.y, 0., 1.);
  out.instance = input.instance;
  
  return out; 
}

@fragment 
fn fs( input : VertexOutput  ) -> @location(0) vec4f {
  let p = state[input.instance];
  return vec4f( p.radius*20, 1., 1., 1.);
}