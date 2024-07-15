#version 300 es
layout(location=0) in vec3 a_position;

uniform mat4 u_light_mvp;
void main() {
    gl_Position = u_light_mvp * vec4(a_position, 1);    // project the positions as seen from the light source
}