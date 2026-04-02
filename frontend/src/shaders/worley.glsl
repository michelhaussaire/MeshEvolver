// Worley Noise GLSL Shader
// También conocido como "Cellular Noise" o "Voronoi Noise"
// Genera patrones de celdas basados en puntos aleatorios

// Distancia a F1 (la celda más cercana)
// Distancia a F2-F1 (diferencia entre segunda más cercana y más cercana)

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 mod7(vec3 x) {
  return x - floor(x * (1.0 / 7.0)) * 7.0;
}

vec3 permute(vec3 x) {
  return mod289((34.0 * x + 1.0) * x);
}

// Worley noise - F1 distance only
float worleyF1(vec3 P) {
  vec3 Pi = mod289(floor(P));
  vec3 Pf = fract(P);

  float F1 = 1.0;

  // Iterate over the neighboring cells
  for(int k = -1; k <= 1; k++) {
    for(int j = -1; j <= 1; j++) {
      for(int i = -1; i <= 1; i++) {
        vec3 neighbor = vec3(float(i), float(j), float(k));
        vec3 p = neighbor - Pf;
        
        vec3 Pi2 = mod289(Pi + neighbor);
        vec3 o = permute(permute(Pi2.x + vec3(0.0, 1.0, 0.0)) + Pi2.y + vec3(0.0, 1.0, 0.0)) + Pi2.z;
        
        vec3 o2 = mod7(o)*o;
        vec3 r = fract(o2 * (1.0 / 41.0));
        
        p += r;
        
        float d = dot(p, p);
        F1 = min(F1, d);
      }
    }
  }
  
  return sqrt(F1);
}

// Worley noise - F2-F1 (cracks pattern)
float worleyF2F1(vec3 P) {
  vec3 Pi = mod289(floor(P));
  vec3 Pf = fract(P);

  float F1 = 1.0;
  float F2 = 1.0;

  // Iterate over the neighboring cells
  for(int k = -1; k <= 1; k++) {
    for(int j = -1; j <= 1; j++) {
      for(int i = -1; i <= 1; i++) {
        vec3 neighbor = vec3(float(i), float(j), float(k));
        vec3 p = neighbor - Pf;
        
        vec3 Pi2 = mod289(Pi + neighbor);
        vec3 o = permute(permute(Pi2.x + vec3(0.0, 1.0, 0.0)) + Pi2.y + vec3(0.0, 1.0, 0.0)) + Pi2.z;
        
        vec3 o2 = mod7(o)*o;
        vec3 r = fract(o2 * (1.0 / 41.0));
        
        p += r;
        
        float d = dot(p, p);
        
        if(d < F1) {
          F2 = F1;
          F1 = d;
        } else if(d < F2) {
          F2 = d;
        }
      }
    }
  }
  
  return sqrt(F2) - sqrt(F1);
}
