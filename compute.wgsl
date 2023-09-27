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
@group(0) @binding(6) var<storage, read_write> state: array<Particle>;

fn cellindex( cell:vec3u ) -> u32 {
  let size = 8u;
  return cell.x + (cell.y * size) + (cell.z * size * size);
}

@compute
@workgroup_size(8,8)
fn cs(@builtin(global_invocation_id) cell:vec3u)  {
  // Variables
  let i = cellindex(cell);
  let p = state[i];
  
  // Calculation
  state[i].angle = (state[i].angle + state[i].speed * timescale) % 360;
}