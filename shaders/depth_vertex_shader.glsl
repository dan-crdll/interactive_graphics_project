#version 300 es

layout(location=0) in vec4 a_position;
uniform mat4 u_light_mvp;


void main() {
    gl_Position = u_light_mvp * a_position;  // assign position to vertex as seen from the light
}