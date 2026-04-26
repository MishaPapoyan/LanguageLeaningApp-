use wasm_bindgen::prelude::*;
use web_sys::{
    HtmlCanvasElement, WebGl2RenderingContext as GL, WebGlBuffer, WebGlFramebuffer, WebGlProgram,
    WebGlRenderbuffer, WebGlShader, WebGlTexture, WebGlUniformLocation, WebGlVertexArrayObject,
};

#[wasm_bindgen(start)]
pub fn _start() {
    std::panic::set_hook(Box::new(|info| {
        web_sys::console::error_1(&format!("{}", info).into());
    }));
}

// ─── Math helpers (column-major 4x4) ──────────────────────────────────────────

fn identity() -> [f32; 16] {
    let mut m = [0.0f32; 16];
    m[0] = 1.0;
    m[5] = 1.0;
    m[10] = 1.0;
    m[15] = 1.0;
    m
}

fn perspective(fov_rad: f32, aspect: f32, near: f32, far: f32) -> [f32; 16] {
    let f = 1.0 / (fov_rad / 2.0).tan();
    let nf = 1.0 / (near - far);
    let mut m = [0.0f32; 16];
    m[0] = f / aspect;
    m[5] = f;
    m[10] = (far + near) * nf;
    m[11] = -1.0;
    m[14] = 2.0 * far * near * nf;
    m
}

fn normalize3(v: [f32; 3]) -> [f32; 3] {
    let l = (v[0] * v[0] + v[1] * v[1] + v[2] * v[2]).sqrt();
    if l < 1e-6 {
        [0.0, 0.0, 0.0]
    } else {
        [v[0] / l, v[1] / l, v[2] / l]
    }
}

fn cross(a: [f32; 3], b: [f32; 3]) -> [f32; 3] {
    [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0],
    ]
}

fn dot(a: [f32; 3], b: [f32; 3]) -> f32 {
    a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

fn look_at(eye: [f32; 3], center: [f32; 3], up: [f32; 3]) -> [f32; 16] {
    let f = normalize3([center[0] - eye[0], center[1] - eye[1], center[2] - eye[2]]);
    let s = normalize3(cross(f, up));
    let u = cross(s, f);
    let mut m = [0.0f32; 16];
    m[0] = s[0];
    m[1] = u[0];
    m[2] = -f[0];
    m[3] = 0.0;
    m[4] = s[1];
    m[5] = u[1];
    m[6] = -f[1];
    m[7] = 0.0;
    m[8] = s[2];
    m[9] = u[2];
    m[10] = -f[2];
    m[11] = 0.0;
    m[12] = -dot(s, eye);
    m[13] = -dot(u, eye);
    m[14] = dot(f, eye);
    m[15] = 1.0;
    m
}

fn mat_mul(a: [f32; 16], b: [f32; 16]) -> [f32; 16] {
    let mut r = [0.0f32; 16];
    for i in 0..4 {
        for j in 0..4 {
            let mut s = 0.0f32;
            for k in 0..4 {
                s += a[k * 4 + j] * b[i * 4 + k];
            }
            r[i * 4 + j] = s;
        }
    }
    r
}

fn translate(m: [f32; 16], tx: f32, ty: f32, tz: f32) -> [f32; 16] {
    let mut t = identity();
    t[12] = tx;
    t[13] = ty;
    t[14] = tz;
    mat_mul(m, t)
}

fn scale_mat(m: [f32; 16], sx: f32, sy: f32, sz: f32) -> [f32; 16] {
    let mut s = identity();
    s[0] = sx;
    s[5] = sy;
    s[10] = sz;
    mat_mul(m, s)
}

// ─── Shaders ──────────────────────────────────────────────────────────────────

const VS: &str = r#"#version 300 es
in vec3 a_pos;
in vec3 a_normal;
uniform mat4 u_mvp;
uniform mat4 u_model;
out vec3 v_normal;
void main() {
    v_normal = normalize(mat3(u_model) * a_normal);
    gl_Position = u_mvp * vec4(a_pos, 1.0);
}
"#;

const FS: &str = r#"#version 300 es
precision mediump float;
in vec3 v_normal;
uniform vec3 u_color;
uniform float u_highlight;
uniform vec3 u_light;
out vec4 fragColor;
void main() {
    float d = max(dot(v_normal, normalize(u_light)), 0.0);
    vec3 c = u_color * (0.4 + d * 0.6);
    if (u_highlight > 1.5 && u_highlight < 2.5) c = mix(c, vec3(0.2,0.95,0.4), 0.55);
    else if (u_highlight > 2.5) c = mix(c, vec3(0.95,0.2,0.2), 0.55);
    else if (u_highlight > 0.5) c = mix(c, vec3(1.0), 0.18);
    fragColor = vec4(c, 1.0);
}
"#;

const PICK_VS: &str = r#"#version 300 es
in vec3 a_pos;
uniform mat4 u_mvp;
void main() {
    gl_Position = u_mvp * vec4(a_pos, 1.0);
}
"#;

const PICK_FS: &str = r#"#version 300 es
precision mediump float;
uniform vec3 u_pickcolor;
out vec4 fragColor;
void main() {
    fragColor = vec4(u_pickcolor, 1.0);
}
"#;

// ─── Box mesh ────────────────────────────────────────────────────────────────

fn unit_cube() -> Vec<f32> {
    // 6 faces * 2 triangles * 3 verts = 36 verts; each vert has pos(3) + normal(3) = 6 floats
    let faces: [([f32; 3], [[f32; 3]; 4]); 6] = [
        // +X
        ([1.0, 0.0, 0.0], [[0.5, -0.5, -0.5], [0.5, 0.5, -0.5], [0.5, 0.5, 0.5], [0.5, -0.5, 0.5]]),
        // -X
        ([-1.0, 0.0, 0.0], [[-0.5, -0.5, 0.5], [-0.5, 0.5, 0.5], [-0.5, 0.5, -0.5], [-0.5, -0.5, -0.5]]),
        // +Y
        ([0.0, 1.0, 0.0], [[-0.5, 0.5, -0.5], [-0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [0.5, 0.5, -0.5]]),
        // -Y
        ([0.0, -1.0, 0.0], [[-0.5, -0.5, 0.5], [-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, -0.5, 0.5]]),
        // +Z
        ([0.0, 0.0, 1.0], [[0.5, -0.5, 0.5], [0.5, 0.5, 0.5], [-0.5, 0.5, 0.5], [-0.5, -0.5, 0.5]]),
        // -Z
        ([0.0, 0.0, -1.0], [[-0.5, -0.5, -0.5], [-0.5, 0.5, -0.5], [0.5, 0.5, -0.5], [0.5, -0.5, -0.5]]),
    ];
    let mut data = Vec::with_capacity(36 * 6);
    for (n, q) in faces.iter() {
        // tri 1: 0,1,2  tri 2: 0,2,3
        for &i in &[0usize, 1, 2, 0, 2, 3] {
            let p = q[i];
            data.extend_from_slice(&[p[0], p[1], p[2], n[0], n[1], n[2]]);
        }
    }
    data
}

// ─── Object model ────────────────────────────────────────────────────────────

#[derive(Clone)]
struct GameObject {
    id: &'static str,
    fr: &'static str,
    es: &'static str,
    color: [f32; 3],
    pos: [f32; 3],
    size: [f32; 3],
    pickable: bool,
}

fn level_objects() -> Vec<GameObject> {
    vec![
        GameObject { id: "floor", fr: "sol", es: "suelo", color: [0.9, 0.87, 0.82], pos: [0.0, 0.0, 0.0], size: [5.0, 0.1, 5.0], pickable: false },
        GameObject { id: "back_wall", fr: "mur", es: "pared", color: [0.96, 0.94, 0.9], pos: [0.0, 1.5, -2.5], size: [5.0, 3.0, 0.1], pickable: false },
        GameObject { id: "left_wall", fr: "mur", es: "pared", color: [0.93, 0.91, 0.88], pos: [-2.5, 1.5, 0.0], size: [0.1, 3.0, 5.0], pickable: false },
        GameObject { id: "right_wall", fr: "mur", es: "pared", color: [0.93, 0.91, 0.88], pos: [2.5, 1.5, 0.0], size: [0.1, 3.0, 5.0], pickable: false },
        GameObject { id: "window", fr: "fenêtre", es: "ventana", color: [0.6, 0.85, 0.95], pos: [0.0, 1.2, -2.4], size: [1.6, 1.2, 0.1], pickable: true },
        GameObject { id: "door", fr: "porte", es: "puerta", color: [0.65, 0.42, 0.25], pos: [-2.4, 0.9, 0.0], size: [0.1, 1.8, 1.0], pickable: true },
        GameObject { id: "bed", fr: "lit", es: "cama", color: [0.75, 0.25, 0.3], pos: [1.2, 0.3, 0.8], size: [1.6, 0.6, 2.4], pickable: true },
        GameObject { id: "chair", fr: "chaise", es: "silla", color: [0.95, 0.6, 0.2], pos: [-0.8, 0.5, 1.2], size: [0.6, 1.0, 0.6], pickable: true },
        GameObject { id: "lamp", fr: "lampe", es: "lámpara", color: [0.95, 0.85, 0.2], pos: [1.8, 0.8, -1.0], size: [0.15, 1.6, 0.15], pickable: true },
        GameObject { id: "table", fr: "table", es: "mesa", color: [0.45, 0.3, 0.2], pos: [0.2, 0.45, -0.8], size: [1.2, 0.9, 0.7], pickable: true },
        GameObject { id: "mirror", fr: "miroir", es: "espejo", color: [0.7, 0.8, 0.9], pos: [-2.35, 1.2, -1.0], size: [0.05, 1.0, 0.8], pickable: true },
        GameObject { id: "wardrobe", fr: "armoire", es: "armario", color: [0.3, 0.55, 0.5], pos: [2.3, 1.1, -1.5], size: [0.4, 2.2, 1.2], pickable: true },
    ]
}

// ─── Animation state ─────────────────────────────────────────────────────────

#[derive(Clone, Copy, PartialEq)]
enum AnimKind {
    None,
    Correct,
    Wrong,
}

struct Anim {
    kind: AnimKind,
    target: usize, // object index
    t0: f32,
}

// ─── Game ────────────────────────────────────────────────────────────────────

#[wasm_bindgen]
pub struct ImmersionGame {
    gl: GL,
    canvas: HtmlCanvasElement,
    width: i32,
    height: i32,

    // shaders
    prog: WebGlProgram,
    pick_prog: WebGlProgram,

    // attribs / uniforms (main)
    u_mvp: WebGlUniformLocation,
    u_model: WebGlUniformLocation,
    u_color: WebGlUniformLocation,
    u_highlight: WebGlUniformLocation,
    u_light: WebGlUniformLocation,

    // pick
    u_pick_mvp: WebGlUniformLocation,
    u_pick_color: WebGlUniformLocation,

    // mesh
    vao: WebGlVertexArrayObject,
    _vbo: WebGlBuffer,
    pick_vao: WebGlVertexArrayObject,
    vert_count: i32,

    // pick framebuffer
    pick_fb: WebGlFramebuffer,
    _pick_tex: WebGlTexture,
    _pick_depth: WebGlRenderbuffer,
    pick_w: i32,
    pick_h: i32,

    // state
    objects: Vec<GameObject>,
    language: String,
    queue: Vec<usize>, // pickable indices, shuffled
    queue_pos: usize,
    score: u32,
    hovered: Option<usize>,
    anim: Option<Anim>,
    last_time: f32,
    rng_state: u32,
}

#[wasm_bindgen]
impl ImmersionGame {
    #[wasm_bindgen(constructor)]
    pub fn new(canvas: HtmlCanvasElement, language: &str) -> Result<ImmersionGame, JsValue> {
        let gl = canvas
            .get_context("webgl2")?
            .ok_or_else(|| JsValue::from_str("WebGL2 not supported"))?
            .dyn_into::<GL>()?;

        let width = canvas.width() as i32;
        let height = canvas.height() as i32;

        let prog = link_program(&gl, VS, FS)?;
        let pick_prog = link_program(&gl, PICK_VS, PICK_FS)?;

        let u_mvp = gl.get_uniform_location(&prog, "u_mvp").ok_or("u_mvp")?;
        let u_model = gl.get_uniform_location(&prog, "u_model").ok_or("u_model")?;
        let u_color = gl.get_uniform_location(&prog, "u_color").ok_or("u_color")?;
        let u_highlight = gl.get_uniform_location(&prog, "u_highlight").ok_or("u_highlight")?;
        let u_light = gl.get_uniform_location(&prog, "u_light").ok_or("u_light")?;

        let u_pick_mvp = gl.get_uniform_location(&pick_prog, "u_mvp").ok_or("pick u_mvp")?;
        let u_pick_color = gl.get_uniform_location(&pick_prog, "u_pickcolor").ok_or("u_pickcolor")?;

        // VBO
        let cube = unit_cube();
        let vert_count = (cube.len() / 6) as i32;
        let vbo = gl.create_buffer().ok_or("vbo")?;
        gl.bind_buffer(GL::ARRAY_BUFFER, Some(&vbo));
        unsafe {
            let view = js_sys::Float32Array::view(&cube);
            gl.buffer_data_with_array_buffer_view(GL::ARRAY_BUFFER, &view, GL::STATIC_DRAW);
        }

        // Main VAO
        let vao = gl.create_vertex_array().ok_or("vao")?;
        gl.bind_vertex_array(Some(&vao));
        gl.bind_buffer(GL::ARRAY_BUFFER, Some(&vbo));
        let pos_loc = gl.get_attrib_location(&prog, "a_pos") as u32;
        let norm_loc = gl.get_attrib_location(&prog, "a_normal") as u32;
        gl.enable_vertex_attrib_array(pos_loc);
        gl.vertex_attrib_pointer_with_i32(pos_loc, 3, GL::FLOAT, false, 6 * 4, 0);
        gl.enable_vertex_attrib_array(norm_loc);
        gl.vertex_attrib_pointer_with_i32(norm_loc, 3, GL::FLOAT, false, 6 * 4, 3 * 4);
        gl.bind_vertex_array(None);

        // Pick VAO
        let pick_vao = gl.create_vertex_array().ok_or("pick_vao")?;
        gl.bind_vertex_array(Some(&pick_vao));
        gl.bind_buffer(GL::ARRAY_BUFFER, Some(&vbo));
        let ppos_loc = gl.get_attrib_location(&pick_prog, "a_pos") as u32;
        gl.enable_vertex_attrib_array(ppos_loc);
        gl.vertex_attrib_pointer_with_i32(ppos_loc, 3, GL::FLOAT, false, 6 * 4, 0);
        gl.bind_vertex_array(None);

        // Pick framebuffer
        let pick_w = width;
        let pick_h = height;
        let pick_tex = gl.create_texture().ok_or("pick_tex")?;
        gl.bind_texture(GL::TEXTURE_2D, Some(&pick_tex));
        gl.tex_image_2d_with_i32_and_i32_and_i32_and_format_and_type_and_opt_u8_array(
            GL::TEXTURE_2D, 0, GL::RGBA as i32, pick_w, pick_h, 0, GL::RGBA, GL::UNSIGNED_BYTE, None,
        )?;
        gl.tex_parameteri(GL::TEXTURE_2D, GL::TEXTURE_MIN_FILTER, GL::NEAREST as i32);
        gl.tex_parameteri(GL::TEXTURE_2D, GL::TEXTURE_MAG_FILTER, GL::NEAREST as i32);
        gl.tex_parameteri(GL::TEXTURE_2D, GL::TEXTURE_WRAP_S, GL::CLAMP_TO_EDGE as i32);
        gl.tex_parameteri(GL::TEXTURE_2D, GL::TEXTURE_WRAP_T, GL::CLAMP_TO_EDGE as i32);

        let pick_depth = gl.create_renderbuffer().ok_or("pick_depth")?;
        gl.bind_renderbuffer(GL::RENDERBUFFER, Some(&pick_depth));
        gl.renderbuffer_storage(GL::RENDERBUFFER, GL::DEPTH_COMPONENT16, pick_w, pick_h);

        let pick_fb = gl.create_framebuffer().ok_or("pick_fb")?;
        gl.bind_framebuffer(GL::FRAMEBUFFER, Some(&pick_fb));
        gl.framebuffer_texture_2d(GL::FRAMEBUFFER, GL::COLOR_ATTACHMENT0, GL::TEXTURE_2D, Some(&pick_tex), 0);
        gl.framebuffer_renderbuffer(GL::FRAMEBUFFER, GL::DEPTH_ATTACHMENT, GL::RENDERBUFFER, Some(&pick_depth));
        gl.bind_framebuffer(GL::FRAMEBUFFER, None);

        gl.enable(GL::DEPTH_TEST);
        gl.enable(GL::CULL_FACE);
        gl.cull_face(GL::BACK);

        let objects = level_objects();
        let mut game = ImmersionGame {
            gl,
            canvas,
            width,
            height,
            prog,
            pick_prog,
            u_mvp,
            u_model,
            u_color,
            u_highlight,
            u_light,
            u_pick_mvp,
            u_pick_color,
            vao,
            _vbo: vbo,
            pick_vao,
            vert_count,
            pick_fb,
            _pick_tex: pick_tex,
            _pick_depth: pick_depth,
            pick_w,
            pick_h,
            objects,
            language: language.to_string(),
            queue: vec![],
            queue_pos: 0,
            score: 0,
            hovered: None,
            anim: None,
            last_time: 0.0,
            rng_state: (js_sys::Date::now() as u32).wrapping_mul(2654435761).wrapping_add(1),
        };
        game.shuffle_queue();
        Ok(game)
    }

    fn next_rand(&mut self) -> u32 {
        // xorshift32
        let mut x = self.rng_state;
        x ^= x << 13;
        x ^= x >> 17;
        x ^= x << 5;
        self.rng_state = x;
        x
    }

    fn shuffle_queue(&mut self) {
        let mut q: Vec<usize> = self
            .objects
            .iter()
            .enumerate()
            .filter(|(_, o)| o.pickable)
            .map(|(i, _)| i)
            .collect();
        // Fisher-Yates
        for i in (1..q.len()).rev() {
            let j = (self.next_rand() as usize) % (i + 1);
            q.swap(i, j);
        }
        self.queue = q;
        self.queue_pos = 0;
    }

    fn current_target(&self) -> Option<usize> {
        if self.queue_pos < self.queue.len() {
            Some(self.queue[self.queue_pos])
        } else {
            None
        }
    }

    pub fn current_word(&self) -> String {
        if let Some(idx) = self.current_target() {
            let o = &self.objects[idx];
            if self.language == "es" {
                o.es.to_string()
            } else {
                o.fr.to_string()
            }
        } else {
            String::new()
        }
    }

    pub fn score(&self) -> u32 {
        self.score
    }

    pub fn total_tasks(&self) -> u32 {
        self.queue.len() as u32
    }

    pub fn tasks_done(&self) -> u32 {
        self.queue_pos as u32
    }

    pub fn reset(&mut self) {
        self.score = 0;
        self.anim = None;
        self.hovered = None;
        self.shuffle_queue();
    }

    fn view_proj(&self) -> [f32; 16] {
        let aspect = self.width as f32 / self.height as f32;
        let p = perspective(45.0_f32.to_radians(), aspect, 0.1, 100.0);
        let v = look_at([0.0, 4.5, 6.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
        mat_mul(p, v)
    }

    fn model_for(&self, obj: &GameObject, idx: usize, time: f32) -> ([f32; 16], f32) {
        // returns (model, highlight)
        let mut sx = obj.size[0];
        let mut sy = obj.size[1];
        let mut sz = obj.size[2];
        let mut tx = obj.pos[0];
        let ty = obj.pos[1];
        let tz = obj.pos[2];
        let mut highlight = 0.0f32;

        if let Some(h) = self.hovered {
            if h == idx && obj.pickable {
                highlight = 1.0;
            }
        }

        if let Some(a) = &self.anim {
            if a.target == idx {
                let dt = (time - a.t0).max(0.0);
                match a.kind {
                    AnimKind::Correct => {
                        let dur = 1.0;
                        if dt < dur {
                            let s = if dt < 0.25 {
                                1.0 + (dt / 0.25) * 0.25
                            } else if dt < 0.5 {
                                1.25 - ((dt - 0.25) / 0.25) * 0.25
                            } else {
                                1.0
                            };
                            sx *= s;
                            sy *= s;
                            sz *= s;
                            highlight = 2.0;
                        }
                    }
                    AnimKind::Wrong => {
                        let dur = 0.3;
                        if dt < dur {
                            let shake = (dt * 60.0).sin() * 0.08;
                            tx += shake;
                            highlight = 3.0;
                        }
                    }
                    AnimKind::None => {}
                }
            }
        }

        let m = identity();
        let m = translate(m, tx, ty, tz);
        let m = scale_mat(m, sx, sy, sz);
        (m, highlight)
    }

    pub fn render(&mut self, time_ms: f32) {
        let time = time_ms / 1000.0;
        self.last_time = time;

        // clear anim if expired
        if let Some(a) = &self.anim {
            let dt = time - a.t0;
            let limit = match a.kind {
                AnimKind::Correct => 1.0,
                AnimKind::Wrong => 0.3,
                AnimKind::None => 0.0,
            };
            if dt > limit {
                self.anim = None;
            }
        }

        // resize if needed
        let cw = self.canvas.width() as i32;
        let ch = self.canvas.height() as i32;
        if cw != self.width || ch != self.height {
            self.width = cw;
            self.height = ch;
        }

        let gl = &self.gl;
        gl.bind_framebuffer(GL::FRAMEBUFFER, None);
        gl.viewport(0, 0, self.width, self.height);
        gl.clear_color(0.08, 0.09, 0.13, 1.0);
        gl.clear(GL::COLOR_BUFFER_BIT | GL::DEPTH_BUFFER_BIT);

        gl.use_program(Some(&self.prog));
        gl.bind_vertex_array(Some(&self.vao));

        let vp = self.view_proj();
        gl.uniform3f(Some(&self.u_light), 1.0, 2.0, 1.0);

        // Snapshot objects to avoid borrow issues
        let objs = self.objects.clone();
        for (i, obj) in objs.iter().enumerate() {
            let (model, hl) = self.model_for(obj, i, time);
            let mvp = mat_mul(vp, model);
            gl.uniform_matrix4fv_with_f32_array(Some(&self.u_mvp), false, &mvp);
            gl.uniform_matrix4fv_with_f32_array(Some(&self.u_model), false, &model);
            gl.uniform3f(Some(&self.u_color), obj.color[0], obj.color[1], obj.color[2]);
            gl.uniform1f(Some(&self.u_highlight), hl);
            gl.draw_arrays(GL::TRIANGLES, 0, self.vert_count);
        }
        gl.bind_vertex_array(None);
    }

    fn render_pick(&self) {
        let gl = &self.gl;
        gl.bind_framebuffer(GL::FRAMEBUFFER, Some(&self.pick_fb));
        gl.viewport(0, 0, self.pick_w, self.pick_h);
        gl.clear_color(0.0, 0.0, 0.0, 1.0);
        gl.clear(GL::COLOR_BUFFER_BIT | GL::DEPTH_BUFFER_BIT);

        gl.use_program(Some(&self.pick_prog));
        gl.bind_vertex_array(Some(&self.pick_vao));

        let vp = self.view_proj();
        for (i, obj) in self.objects.iter().enumerate() {
            if !obj.pickable {
                continue;
            }
            let m = identity();
            let m = translate(m, obj.pos[0], obj.pos[1], obj.pos[2]);
            let m = scale_mat(m, obj.size[0], obj.size[1], obj.size[2]);
            let mvp = mat_mul(vp, m);
            gl.uniform_matrix4fv_with_f32_array(Some(&self.u_pick_mvp), false, &mvp);
            // encode idx+1 into red channel
            let r = ((i + 1) as f32) / 255.0;
            gl.uniform3f(Some(&self.u_pick_color), r, 0.0, 0.0);
            gl.draw_arrays(GL::TRIANGLES, 0, self.vert_count);
        }
        gl.bind_vertex_array(None);
        gl.bind_framebuffer(GL::FRAMEBUFFER, None);
    }

    fn pick_at(&self, x: f32, y: f32) -> Option<usize> {
        self.render_pick();
        let gl = &self.gl;
        gl.bind_framebuffer(GL::FRAMEBUFFER, Some(&self.pick_fb));
        let px = x as i32;
        let py = self.pick_h - (y as i32) - 1;
        if px < 0 || py < 0 || px >= self.pick_w || py >= self.pick_h {
            gl.bind_framebuffer(GL::FRAMEBUFFER, None);
            return None;
        }
        let mut buf = [0u8; 4];
        let _ = gl.read_pixels_with_opt_u8_array(
            px,
            py,
            1,
            1,
            GL::RGBA,
            GL::UNSIGNED_BYTE,
            Some(&mut buf),
        );
        gl.bind_framebuffer(GL::FRAMEBUFFER, None);
        let r = buf[0] as usize;
        if r == 0 {
            None
        } else {
            Some(r - 1)
        }
    }

    pub fn on_mouse_move(&mut self, x: f32, y: f32) {
        let hit = self.pick_at(x, y);
        self.hovered = hit;
    }

    pub fn on_click(&mut self, x: f32, y: f32) -> JsValue {
        let result = js_sys::Object::new();
        let hit = self.pick_at(x, y);

        let mut correct = false;
        let mut hit_flag = false;
        let mut word = String::new();
        let mut done = false;

        if let Some(idx) = hit {
            hit_flag = true;
            if let Some(target_idx) = self.current_target() {
                if idx == target_idx {
                    correct = true;
                    self.score += 10;
                    self.anim = Some(Anim { kind: AnimKind::Correct, target: idx, t0: self.last_time });
                    self.queue_pos += 1;
                    if self.queue_pos >= self.queue.len() {
                        done = true;
                    } else {
                        let next_idx = self.queue[self.queue_pos];
                        let o = &self.objects[next_idx];
                        word = if self.language == "es" { o.es.to_string() } else { o.fr.to_string() };
                    }
                } else {
                    self.score = self.score.saturating_sub(2);
                    self.anim = Some(Anim { kind: AnimKind::Wrong, target: idx, t0: self.last_time });
                    let o = &self.objects[target_idx];
                    word = if self.language == "es" { o.es.to_string() } else { o.fr.to_string() };
                }
            }
        } else if let Some(target_idx) = self.current_target() {
            let o = &self.objects[target_idx];
            word = if self.language == "es" { o.es.to_string() } else { o.fr.to_string() };
        }

        let _ = js_sys::Reflect::set(&result, &"hit".into(), &JsValue::from_bool(hit_flag));
        let _ = js_sys::Reflect::set(&result, &"correct".into(), &JsValue::from_bool(correct));
        let _ = js_sys::Reflect::set(&result, &"word".into(), &JsValue::from_str(&word));
        let _ = js_sys::Reflect::set(&result, &"done".into(), &JsValue::from_bool(done));
        let _ = js_sys::Reflect::set(&result, &"score".into(), &JsValue::from_f64(self.score as f64));
        let _ = js_sys::Reflect::set(&result, &"progress".into(), &JsValue::from_f64(self.queue_pos as f64));
        let _ = js_sys::Reflect::set(&result, &"total".into(), &JsValue::from_f64(self.queue.len() as f64));
        result.into()
    }
}

// ─── GL helpers ──────────────────────────────────────────────────────────────

fn compile_shader(gl: &GL, kind: u32, src: &str) -> Result<WebGlShader, String> {
    let s = gl.create_shader(kind).ok_or("create_shader")?;
    gl.shader_source(&s, src);
    gl.compile_shader(&s);
    if gl.get_shader_parameter(&s, GL::COMPILE_STATUS).as_bool().unwrap_or(false) {
        Ok(s)
    } else {
        Err(gl.get_shader_info_log(&s).unwrap_or_else(|| "shader err".into()))
    }
}

fn link_program(gl: &GL, vs: &str, fs: &str) -> Result<WebGlProgram, String> {
    let v = compile_shader(gl, GL::VERTEX_SHADER, vs)?;
    let f = compile_shader(gl, GL::FRAGMENT_SHADER, fs)?;
    let p = gl.create_program().ok_or("create_program")?;
    gl.attach_shader(&p, &v);
    gl.attach_shader(&p, &f);
    gl.link_program(&p);
    if gl.get_program_parameter(&p, GL::LINK_STATUS).as_bool().unwrap_or(false) {
        Ok(p)
    } else {
        Err(gl.get_program_info_log(&p).unwrap_or_else(|| "link err".into()))
    }
}
