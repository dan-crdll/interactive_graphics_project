#version 300 es
precision mediump float
out float fragment_depth;

void main() {
    fragment_depth = gl_FragCoord.z;    // outputs the z value as seen from the light
}