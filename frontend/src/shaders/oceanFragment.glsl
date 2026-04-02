// Ocean Fragment Shader
varying vec2 vUv;
varying float vElevation;
varying vec3 vNormal;
varying vec3 vViewPosition;

uniform float uTime;
uniform vec3 uColorDeep;
uniform vec3 uColorShallow;
uniform vec3 uSunDirection;
uniform float uSpecularStrength;
uniform float uTransparency;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);
  vec3 lightDir = normalize(uSunDirection);
  
  float mixStrength = smoothstep(-1.0, 1.0, vElevation);
  vec3 waterColor = mix(uColorDeep, uColorShallow, mixStrength);
  
  float foamThreshold = 0.7;
  vec3 foamColor = vec3(0.95, 0.95, 0.95);
  float foam = smoothstep(foamThreshold, 1.0, vElevation);
  waterColor = mix(waterColor, foamColor, foam * 0.5);
  
  float diff = max(dot(normal, lightDir), 0.0);
  vec3 diffuse = waterColor * (0.3 + 0.7 * diff);
  
  vec3 halfDir = normalize(lightDir + viewDir);
  float specAngle = max(dot(normal, halfDir), 0.0);
  float specular = pow(specAngle, 32.0) * uSpecularStrength;
  
  float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.0);
  
  vec3 finalColor = diffuse + vec3(specular) + vec3(fresnel * 0.3);
  
  float caustics = sin(vUv.x * 50.0 + uTime * 2.0) * sin(vUv.y * 50.0 + uTime * 1.5);
  caustics = smoothstep(0.8, 1.0, caustics) * 0.1 * diff;
  finalColor += vec3(caustics);
  
  float alpha = uTransparency + fresnel * 0.1 + foam * 0.2;
  alpha = clamp(alpha, 0.4, 0.95);
  
  gl_FragColor = vec4(finalColor, alpha);
}
