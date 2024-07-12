#version 300 es

layout(location=0) in vec4 a_position;
in vec3 a_normals;

uniform mat4 u_proj_matrix;
uniform mat4 u_mv_matrix;
uniform mat4 u_nmv_matrix;
uniform mat4 u_light_mvp;

out vec3 v_normals;
out vec4 v_light_seen_position;

void main() {
    gl_Position = u_proj_matrix * u_mv_matrix * a_position;

    v_normals = normalize(u_nmv_matrix * vec4(a_normals, 0.0)).xyz;
    v_light_seen_position = u_light_mvp * a_position;
}