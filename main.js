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
}

main()