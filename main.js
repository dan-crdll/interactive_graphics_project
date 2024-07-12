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


async function main() {
    const canvas = document.querySelector('canvas')
    const gl = canvas.getContext('webgl2')

    if(!gl) {
        console.error('WebGL not available.')
        return 
    }
    initializeCanvas(gl)

    /* SHADER SOURCE LOADING */
    const v_shader_source = await (await fetch('shaders/vertex_shader.glsl')).text()
    const f_shader_source = await (await fetch('shaders/fragment_shader.glsl')).text()
    const d_v_shader_source = await (await fetch('shaders/depth_vertex_shader.glsl')).text()
    const d_f_shader_source = await (await fetch('shaders/depth_fragment_shader.glsl')).text()

    /* CREATE PROGRAMS */
    const program = create_program(gl, v_shader_source, f_shader_source)
    const depth_program = create_program(gl, d_v_shader_source, d_f_shader_source)

    gl.enable(gl.DEPTH_TEST)
    gl.enable(gl.CULL_FACE)

    /* LOAD THE SCENE */
    const scene = await (await fetch('model/scene.obj')).text()
    let mesh = new ObjMesh()
    mesh.parse(scene)

    /* ATTRIBUTE AND UNIFORM LOCATIONS */
    const a_position = gl.getAttribLocation(program, 'a_position')
    const u_proj_matrix = gl.getUniformLocation(program, 'u_proj_matrix')
    const u_mv_matrix = gl.getUniformLocation(program, 'u_mv_matrix')
    const u_nmv_matrix = gl.getUniformLocation(program, 'u_nmv_matrix')
    const u_light_mvp = gl.getUniformLocation(program, 'u_light_mvp')
    const u_light_dir = gl.getUniformLocation(program, 'u_light_dir')
    const shadow_map = gl.getUniformLocation(program, 'shadow_map')
    const u_light_mvp_depth = gl.getUniformLocation(depth_program, 'u_light_mvp')

    /* LIGHT AND MATRICES DEFINITION */
    const projection = mat4.create()
    const mv = mat4.create()
    const nmv = mat4.create()
    const light_proj = mat4.create()
    const light_mv = mat4.create()
    const light_mvp = mat4.create()
    
    const light_dir = [1.0, 0.0, 0.0]

    mat4.perspective(projection, 45 * Math.PI / 180.0, canvas.width / canvas.width, 0.1, 100)
    mat4.translate(mv, mv, [0, 0, -10])
    mat4.invert(nmv, mv)
    mat4.transpose(nmv, nmv)

    mat4.ortho(light_proj, -1, 1, -1, 1, 0, 10)
    mat4.lookAt(light_mv, light_dir, [0, 0, 0], [0, 1, 0])

    mat4.multiply(light_mvp, light_proj, light_mv)
}

main()