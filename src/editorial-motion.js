(() => {
  const dialog = document.querySelector('#explainer-dialog');
  document.querySelectorAll('[data-open-explainer]').forEach(button => button.addEventListener('click', () => dialog?.showModal()));
  dialog?.querySelector('.dialog-close')?.addEventListener('click', () => dialog.close());
  dialog?.querySelectorAll('[data-close-explainer]').forEach(link => link.addEventListener('click', () => dialog.close()));
  dialog?.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });

  // The header is shared with the service and article pages.
  const path = location.pathname.replace(/\/$/, '') || '/';
  const homeLink = document.querySelector('.site-navigation>a[href="/"]');
  homeLink?.classList.toggle('is-active', path === '/');
  document.querySelectorAll('.site-navigation>a').forEach(link => {
    if (path !== '/' && link.getAttribute('href') === path) link.classList.add('is-active');
  });

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches) return;
  document.documentElement.classList.add('motion-ready');
  const revealObserver = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      entry.target.classList.remove('awaiting-reveal');
      revealObserver.unobserve(entry.target);
    }
  }, { threshold: 0.08, rootMargin: '0px 0px -15px 0px' });
  document.querySelectorAll('.reveal').forEach(element => {
    if (element.getBoundingClientRect().top > innerHeight) element.classList.add('awaiting-reveal');
    revealObserver.observe(element);
  });

  const hero = document.querySelector('.editorial-hero');
  if (!hero || !matchMedia('(hover: hover) and (min-width: 761px)').matches) return;
  let pointerX = 0, pointerY = 0, pointerFrame = 0;
  const updatePointer = () => {
    hero.style.setProperty('--pointer-x', pointerX.toFixed(3));
    hero.style.setProperty('--pointer-y', pointerY.toFixed(3));
    pointerFrame = 0;
  };
  hero.addEventListener('pointermove', event => {
    const rect = hero.getBoundingClientRect();
    pointerX = (event.clientX - rect.left) / rect.width - 0.5;
    pointerY = (event.clientY - rect.top) / rect.height - 0.5;
    if (!pointerFrame) pointerFrame = requestAnimationFrame(updatePointer);
  }, { passive: true });
  hero.addEventListener('pointerleave', () => {
    pointerX = pointerY = 0;
    if (!pointerFrame) pointerFrame = requestAnimationFrame(updatePointer);
  });

  // A small transparent WebGL layer adds atmospheric gold motes, rather than
  // displacing the photograph or text. It stops rendering outside the viewport.
  const canvas = hero.querySelector('.hero-atmosphere');
  const gl = canvas?.getContext('webgl', { alpha: true, antialias: false, powerPreference: 'low-power', depth: false });
  if (!gl) return;
  function shader(type, source) {
    const result = gl.createShader(type);
    gl.shaderSource(result, source); gl.compileShader(result);
    if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) { gl.deleteShader(result); return null; }
    return result;
  }
  const vertex = shader(gl.VERTEX_SHADER, 'attribute vec2 position;void main(){gl_Position=vec4(position,0.0,1.0);}');
  const fragment = shader(gl.FRAGMENT_SHADER, `precision highp float;
    uniform vec2 resolution; uniform float time; uniform vec2 pointer;
    float hash(float n){return fract(sin(n*127.1)*43758.5453);}
    void main(){
      vec2 uv=gl_FragCoord.xy/resolution;float light=0.0;
      for(int i=0;i<28;i++){
        float fi=float(i);vec2 seed=vec2(hash(fi+1.0),hash(fi+70.0));
        vec2 point=vec2(fract(seed.x+sin(time*.035+fi)*.025),fract(seed.y+time*(.004+seed.x*.006)));
        point+=pointer*.008;vec2 delta=(uv-point)*vec2(resolution.x/resolution.y,1.0);
        float radius=.0013+hash(fi+33.0)*.0015;
        float glow=exp(-dot(delta,delta)/(radius*radius*3.0));
        light+=glow*(.15+.17*sin(time*.5+fi));
      }
      float alpha=clamp(light,0.0,.36);gl_FragColor=vec4(vec3(1.0,.73,.35)*alpha,alpha);
    }`);
  if (!vertex || !fragment) return;
  const program = gl.createProgram(); gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);
  const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position'); gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  const resolutionUniform = gl.getUniformLocation(program, 'resolution');
  const timeUniform = gl.getUniformLocation(program, 'time'); const pointerUniform = gl.getUniformLocation(program, 'pointer');
  function resize() {
    const bounds = hero.getBoundingClientRect();
    const scale = Math.min(devicePixelRatio || 1, 1.25) * .75;
    canvas.width = Math.round(bounds.width * scale); canvas.height = Math.round(bounds.height * scale);
    gl.viewport(0,0,canvas.width,canvas.height); gl.uniform2f(resolutionUniform,canvas.width,canvas.height);
  }
  new ResizeObserver(resize).observe(hero); resize();
  let visible = false, frame = 0, lastDraw = 0, lost = false;
  function draw(now) {
    frame = 0;
    if (!visible || document.hidden || lost || reducedMotion.matches) return;
    if (now - lastDraw >= 33) {
      gl.uniform1f(timeUniform, now / 1000); gl.uniform2f(pointerUniform,pointerX,pointerY);
      gl.drawArrays(gl.TRIANGLES,0,6); lastDraw = now;
    }
    frame = requestAnimationFrame(draw);
  }
  const start = () => { if (!frame && visible && !document.hidden && !lost && !reducedMotion.matches) frame = requestAnimationFrame(draw); };
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) start(); else { cancelAnimationFrame(frame); frame = 0; }
  }).observe(hero);
  document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else start(); });
  canvas.addEventListener('webglcontextlost', () => { lost = true; cancelAnimationFrame(frame); frame = 0; });
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) { cancelAnimationFrame(frame); frame = 0; } else start(); });
  addEventListener('pagehide', () => { cancelAnimationFrame(frame); cancelAnimationFrame(pointerFrame); });
})();
