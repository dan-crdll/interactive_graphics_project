#version 300 es
precision mediump float;

uniform vec3 u_light_dir;

uniform mediump sampler2DShadow shadow_map;

in vec3 v_normals;
in vec4 v_light_seen_position;

out vec3 fragColor;

void main() {
    float enlighted = 1.0;
    float hit_light = texture(shadow_map, v_light_seen_position.xyz);
    enlighted *= hit_light;

    vec3 normalized_light_dir = normalize(u_light_dir);
    float geometry_factor = dot(v_normals, normalized_light_dir);

    float light_intensity = max(geometry_factor * enlighted, 0.1);
    fragColor = vec3(1, 1, 1) * max(light_intensity * enlighted, 0.1);
}