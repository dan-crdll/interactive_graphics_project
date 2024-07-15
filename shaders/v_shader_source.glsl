#version 300 es
layout(location=0) in vec3 a_position;
layout(location=1) in vec3 a_normal;

uniform mat4 u_proj;
uniform mat4 u_mv;
uniform mat4 u_nmv;
uniform vec3 u_light_dir;

uniform mat4 u_light_mvp;

uniform float u_shadows;
uniform float u_shading;

out vec4 v_light_pov;
out vec4 v_normal;
out vec3 v_light_dir;

out float v_shadows;
out float v_shading;
void main() {
    gl_Position = u_proj * u_mv * vec4(a_position, 1);

    // we want to pass to fragment shader the position as seen from the light for comparisons,
    // the normals for shading and the light direction
    v_light_pov = u_light_mvp * vec4(a_position, 1);
    v_normal = u_nmv * vec4(a_normal, 0);
    v_light_dir = normalize(u_light_dir);

    v_shading = u_shading;
    v_shadows = u_shadows;
}