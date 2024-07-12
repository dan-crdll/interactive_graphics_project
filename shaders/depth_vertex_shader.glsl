#version 300 es

layout(location=0) in vec4 a_position;
uniform mat4 u_light_mvp;


void main() {
    vec4 light_seen_position = u_light_mvp * a_position;
    gl_Position = light_seen_position;  // assign position to vertex as seen from the light
}