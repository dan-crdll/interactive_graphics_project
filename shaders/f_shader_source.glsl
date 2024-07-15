#version 300 es
precision mediump float;

uniform mediump sampler2DShadow u_shadowmap;

out vec4 fragColor;
in vec4 v_light_pov;
in vec4 v_normal;
in vec3 v_light_dir;
in float v_shadows;
in float v_shading;

vec2 adjacentPixels[4] = vec2[](
  vec2(-1, 0), 
  vec2(1, 0), 
  vec2(0, 1), 
  vec2(0, -1)
);

float visibility = 1.0;
void main() {
  vec3 light_pov_position = (v_light_pov * 0.5 + 0.5).xyz;
  float bias = 0.04;
  light_pov_position = vec3(light_pov_position.xy, light_pov_position.z - bias);

  for (int i = 0; i < 4; i++) {
    vec3 biased = vec3(light_pov_position.xy + adjacentPixels[i]/1500.0, light_pov_position.z);
    float hit = texture(u_shadowmap, biased);
    visibility *= max(hit, 0.9);
  }

  vec3 normalized_normal = normalize(v_normal.xyz);
  float geometry = max(dot(normalized_normal, v_light_dir), 0.0);

  float lightness = max(geometry * visibility, 0.0);
  vec3 color = vec3(0.01f, 0.67f, 0.67f);

  if(v_shading > 0.0 && v_shadows > 0.0) 
    fragColor = vec4(color * visibility * lightness + 0.1, 1);
  else 
    if(v_shading > 0.0)
      fragColor = vec4(color * geometry, 1);
    else 
      if(v_shadows > 0.0)
        fragColor = vec4(color * visibility + 0.1, 1);
      else 
        fragColor = vec4(color, 1);
}