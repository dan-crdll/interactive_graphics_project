async function main() {
    const scene = createSceneWithTorusAndSphere();
    const canvas = document.querySelector('canvas');
    const gl = canvas.getContext('webgl2');

    if(!gl) {
        console.error('WebGL2 not available');
    }
    initializeCanvas(gl)

    const depth_vshader = await (await fetch('shaders/depth_v_shader_source.glsl')).text();
    const depth_fshader = await (await fetch('shaders/depth_f_shader_source.glsl')).text();
    const depth_program = create_program(gl, depth_vshader, depth_fshader);

    var light_direction = new Float32Array([35, 35, 0]);
    const u_light_mvp = gl.getUniformLocation(depth_program, 'u_light_mvp');
    const a_position = gl.getAttribLocation(depth_program, 'a_position');

    gl.enable(gl.DEPTH_TEST)
    gl.enable(gl.CULL_FACE)
    gl.cullFace(gl.FRONT)

    // 1. OUTPUTTING TO FRAME BUFFER Z VALUES FROM LIGHT POV
    gl.useProgram(depth_program);

    const vbuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbuffer);
    gl.bufferData(gl.ARRAY_BUFFER, scene.positions, gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_position);

    const ibuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, scene.indices, gl.STATIC_DRAW);

    let light_proj = mat4.create();
    let light_mv = mat4.create();
    let light_mvp = mat4.create();

    let aspect = gl.canvas.width / gl.canvas.height;
    let orthoLeft, orthoRight, orthoBottom, orthoTop;

    if (aspect > 1) {
        // Wide viewport
        orthoLeft = -50 * aspect;
        orthoRight = 50 * aspect;
        orthoBottom = -50;
        orthoTop = 50;
    } else {
        // Tall viewport
        orthoLeft = -50;
        orthoRight = 50;
        orthoBottom = -50 / aspect;
        orthoTop = 50 / aspect;
    }

    mat4.ortho(light_proj, orthoLeft, orthoRight, orthoBottom, orthoTop, 0.1, 100);
    mat4.lookAt(light_mv, light_direction, [0, 0, 0], [0, 1, 0]);
    mat4.multiply(light_mvp, light_proj, light_mv);
    gl.uniformMatrix4fv(u_light_mvp, false, light_mvp);

    // SHADOW MAP TEXTURE CREATION
    const depthmap_size = [1024, 1024];
    const shadow_map = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, shadow_map);
    gl.texStorage2D(gl.TEXTURE_2D, 1, gl.DEPTH_COMPONENT32F, depthmap_size[0], depthmap_size[1]);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_FUNC, gl.LEQUAL);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const frame_buffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frame_buffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, shadow_map, 0);

    gl.viewport(0, 0, depthmap_size[0], depthmap_size[1]);
    gl.drawElements(gl.TRIANGLES, scene.indices.length, gl.UNSIGNED_SHORT, 0); // Passing depth data to texture through framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // 2. MAIN RENDER
    const vshader = await (await fetch('shaders/v_shader_source.glsl')).text();
    const fshader = await (await fetch('shaders/f_shader_source.glsl')).text();
    const program = create_program(gl, vshader, fshader);

    gl.useProgram(program);

    gl.enable(gl.DEPTH_TEST);
    gl.cullFace(gl.BACK);

    const a_normal = gl.getAttribLocation(program, 'a_normal');
    const abuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, abuffer);
    gl.bufferData(gl.ARRAY_BUFFER, scene.normals, gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_normal);

    const u_proj = gl.getUniformLocation(program, 'u_proj');
    const u_mv = gl.getUniformLocation(program, 'u_mv');
    const u_nmv = gl.getUniformLocation(program, 'u_nmv');
    const u_shadowmap = gl.getUniformLocation(program, 'u_shadowmap');
    const u_light_mvp_main = gl.getUniformLocation(program, 'u_light_mvp');
    const u_light_dir = gl.getUniformLocation(program, 'u_light_dir');

    let proj = mat4.create();
    let mv = mat4.create();
    let nmv = mat4.create();
    mat4.perspective(proj, 45 * Math.PI / 180, canvas.width / canvas.height, 0.1, 1000);

    let camera_matrix = mat4.create();
    let camera_rot = -15;
    mat4.rotateY(camera_matrix, camera_matrix, camera_rot * Math.PI / 180);
    mat4.translate(camera_matrix, camera_matrix, [0, 0, 100]);

    mat4.invert(mv, camera_matrix);

    mat4.invert(nmv, mv);
    mat4.transpose(nmv, nmv);



    gl.uniformMatrix4fv(u_proj, false, proj);
    gl.uniformMatrix4fv(u_mv, false, mv);
    gl.uniformMatrix4fv(u_nmv, false, nmv);
    gl.uniformMatrix4fv(u_light_mvp_main, false, light_mvp);
    gl.uniform3fv(u_light_dir, light_direction, 0, 0);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.bindTexture(gl.TEXTURE_2D, shadow_map);
    gl.uniform1i(u_shadowmap, 0);

//    gl.useProgram(depth_program)

    const u_shadows = gl.getUniformLocation(program, 'u_shadows');
    const u_shading = gl.getUniformLocation(program, 'u_shading');

    let shade_on = 1;
    let shadow_on = 1;

    const shade_ckb = document.querySelector('#shade');
    const shadow_ckb = document.querySelector('#shadow');

    shade_ckb.addEventListener('input', (ev) => {
        if(shade_on) 
            shade_on = 0
        else
            shade_on = 1
    })

    shadow_ckb.addEventListener('input', (ev) => {
        if(shadow_on) 
            shadow_on = 0
        else
            shadow_on = 1
    })

    function Render() {
        gl.uniform1f(u_shading, shade_on);
        gl.uniform1f(u_shadows, shadow_on);

        gl.drawElements(gl.TRIANGLES, scene.indices.length, gl.UNSIGNED_SHORT, 0);
        requestAnimationFrame(Render);
    }
    Render()
}
main()