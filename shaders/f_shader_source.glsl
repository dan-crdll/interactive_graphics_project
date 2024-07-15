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
);  // adjacent pixel for smoothing the shadows

float visibility = 1.0; // how visible the fragment is from the light pov
void main() {
  vec3 light_pov_position = (v_light_pov * 0.5 + 0.5).xyz;  // normalize the position as seen from the light between 0 and 1
  float bias = 0.04;  // bias for shadow acne
  light_pov_position = vec3(light_pov_position.xy, light_pov_position.z - bias);  // biased position

  for (int i = 0; i < 4; i++) {
    vec3 biased = vec3(light_pov_position.xy + adjacentPixels[i]/1500.0, light_pov_position.z); // bias the position with neighbors
    float hit = texture(u_shadowmap, biased); // check wether the light hits the position or not
    visibility *= max(hit, 0.85); // 0.85 ^ 4 =  0.5 in case of not seen fragment
  }

  vec3 normalized_normal = normalize(v_normal.xyz);
  float geometry = max(dot(normalized_normal, v_light_dir), 0.0); // geometry factor for shading

  float lightness = max(geometry * visibility, 0.0);  // product between the shading and shadowing of a point
  vec3 color = vec3(0.01f, 0.67f, 0.67f);

  if(v_shading > 0.0 && v_shadows > 0.0)  // checkboxes
    fragColor = vec4(color * lightness + 0.1, 1);
  else 
    if(v_shading > 0.0)
      fragColor = vec4(color * geometry, 1);
    else 
      if(v_shadows > 0.0)
        fragColor = vec4(color * visibility + 0.1, 1);
      else 
        fragColor = vec4(color, 1);
}