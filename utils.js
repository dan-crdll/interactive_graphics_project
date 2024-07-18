function create_sphere(radius, latitudeBands, longitudeBands, centerX, centerY, centerZ) {
  const positions = [];
  const normals = [];
  const indices = [];

  for (let latNumber = 0; latNumber <= latitudeBands; latNumber++) {
      const theta = latNumber * Math.PI / latitudeBands;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);

      for (let longNumber = 0; longNumber <= longitudeBands; longNumber++) {
          const phi = longNumber * 2 * Math.PI / longitudeBands;
          const sinPhi = Math.sin(phi);
          const cosPhi = Math.cos(phi);

          const x = cosPhi * sinTheta;
          const y = cosTheta;
          const z = sinPhi * sinTheta;
          const u = 1 - (longNumber / longitudeBands);
          const v = 1 - (latNumber / latitudeBands);

          // Positions
          const px = radius * x + centerX;
          const py = radius * y + centerY;
          const pz = radius * z + centerZ;

          // Normals
          const nx = x;
          const ny = y;
          const nz = z;

          positions.push(px, py, pz);
          normals.push(nx, ny, nz);
      }
  }

  for (let latNumber = 0; latNumber < latitudeBands; latNumber++) {
      for (let longNumber = 0; longNumber < longitudeBands; longNumber++) {
          const first = (latNumber * (longitudeBands + 1)) + longNumber;
          const second = first + longitudeBands + 1;

          indices.push(first, second, first + 1);
          indices.push(second, second + 1, first + 1);
      }
  }

  return {
      positions: positions,
      normals: normals,
      indices: indices
  };
}


function create_shader(gl, type, source) {
    let shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    return shader
}


function create_program(gl, vshader_source, fshader_source) {
    let vshader = create_shader(gl, gl.VERTEX_SHADER, vshader_source)
    let fshader = create_shader(gl, gl.FRAGMENT_SHADER, fshader_source)

    let program = gl.createProgram()
    gl.attachShader(program, vshader)
    gl.attachShader(program, fshader)
    gl.linkProgram(program)
    return program
}


function initializeCanvas(gl) {
    const canvas = gl.canvas
    const displayWidth  = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    canvas.width  = displayWidth;
    canvas.height = displayHeight;

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}

function createSceneWithTorusAndSphere() {
  const sphere = create_sphere(25, 50, 50, -20, 0, 0); // Example sphere with center at (2, 0, 0)
//   const torus = create_torus(10, 2, 50, 50, 20, 0, 0, 0, 30, 0); // Example sphere with center at (2, 0, 0)
  const sphere_2 = create_sphere(10, 50, 50, 20, 0, 0);
  const sphere_3 = create_sphere(5, 50, 50, 5, 25, 0);


  const positions = [];
  const normals = [];
  const indices = [];

  // Combine positions, normals and indices of the sphere and torus
  let indexOffset = 0;

  // Add sphere positions, normals, and indices
  for (let i = 0; i < sphere.positions.length; i++) {
      positions.push(sphere.positions[i]);
      normals.push(sphere.normals[i]);
  }
  for (let i = 0; i < sphere.indices.length; i++) {
      indices.push(sphere.indices[i] + indexOffset);
  }
  indexOffset += sphere.positions.length / 3;


  for (let i = 0; i < sphere_2.positions.length; i++) {
      positions.push(sphere_2.positions[i]);
      normals.push(sphere_2.normals[i]);
  }
  for (let i = 0; i < sphere_2.indices.length; i++) {
      indices.push(sphere_2.indices[i] + indexOffset);
  }
  indexOffset += sphere_2.positions.length / 3;

  for (let i = 0; i < sphere_3.positions.length; i++) {
    positions.push(sphere_3.positions[i]);
    normals.push(sphere_3.normals[i]);
    }
    for (let i = 0; i < sphere_3.indices.length; i++) {
        indices.push(sphere_3.indices[i] + indexOffset);
    }


  return {
      positions: new Float32Array(positions),
      normals: new Float32Array(normals),
      indices: new Uint16Array(indices)
  };
}
