@group(0) @binding(0) var<uniform> res: vec2f;
@group(0) @binding(1) var<uniform> leftFeed: f32;
@group(0) @binding(2) var<uniform> rightFeed: f32;
@group(0) @binding(3) var<uniform> leftKill: f32;
@group(0) @binding(4) var<uniform> rightKill: f32;
@group(0) @binding(5) var<uniform> diffusionA: f32;
@group(0) @binding(6) var<uniform> diffusionB: f32;
@group(0) @binding(7) var<uniform> timescale: f32;
@group(0) @binding(8) var<storage, read_write> stateAin: array<f32>;
@group(0) @binding(9) var<storage, read_write> stateAout: array<f32>;
@group(0) @binding(10) var<storage, read_write> stateBin: array<f32>;
@group(0) @binding(11) var<storage, read_write> stateBout: array<f32>;


fn index( x:i32, y:i32 ) -> u32 {
  let w = res.x;
  let h = res.y;
  return u32( (f32(y) % h) * w + (w*-.5) + (f32(x) % w) );
}

fn laplacianA( cell:vec3i ) -> f32 {
  const weights = array<f32, 9>(.05, .2, .05, .2, -1.0, .2, .05, .2, .05);

  var total = 0.0;
  for (var y = -1; y < 2; y++) {
    for (var x = -1; x < 2; x++) {
      total += weights[(y + 1) * 3 + (x + 1)] * stateAin[index(cell.x + x, cell.y + y)];
    }
  }

  return total;
}

fn laplacianB( cell:vec3i ) -> f32 {
  const weights = array<f32, 9>(.05, .2, .05, .2, -1.0, .2, .05, .2, .05);

  var total = 0.0;
  for (var y = -1; y < 2; y++) {
    for (var x = -1; x < 2; x++) {
      total += weights[(y + 1) * 3 + (x + 1)] * stateBin[index(cell.x + x, cell.y + y)];
    }
  }

  return total;
}

@compute
@workgroup_size(8,8)
fn cs( @builtin(global_invocation_id) _cell:vec3u ) {
  // Variables
  let cell = vec3i(_cell);
  let i = index(cell.x, cell.y);
  
  // Constants
  let A : f32 = stateAin[i];
  let B : f32 = stateBin[i];
  let xRatio : f32 = f32(cell.x) / res.x;
  
  // A
  let feed = leftFeed * (1 - xRatio) + rightFeed * xRatio;
  stateAout[i] = A + (((diffusionA * laplacianA(cell)) - (A * B * B) + (feed * (1 - A))) * timescale);
  stateAout[i] = clamp(stateAout[i], 0, 1);
  
  // B
  let kill = leftKill * (1 - xRatio) + rightKill * xRatio;
  stateBout[i] =  B + (((diffusionB * laplacianB(cell)) + (A * B * B) - ((kill + feed) * B))  * timescale);
  stateBout[i] = clamp(stateBout[i], 0, 1);
}
