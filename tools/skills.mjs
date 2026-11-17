// Sincroniza las skills del proyecto (formato Agent Skills, SKILL.md):
//  - .agents/skills/  →  .claude/skills/   (Claude Code lee esta carpeta; Codex y Antigravity leen .agents/skills)
//  - arma arte/SKILLS-IA.md con el índice y las skills propias, para subirlo a un Gem de Gemini o a un Proyecto de ChatGPT.
// Uso: node tools/skills.mjs
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const src = path.join(root, '.agents', 'skills'), dst = path.join(root, '.claude', 'skills');
const PROPIAS = ['el-metro-desarrollo', 'el-metro-arte', 'medellin-fiel'];
fs.mkdirSync(dst, { recursive: true });
let n = 0;
for (const name of fs.readdirSync(src)) {
  const from = path.join(src, name), to = path.join(dst, name);
  if (fs.statSync(from).isDirectory()) { fs.rmSync(to, { recursive: true, force: true }); fs.cpSync(from, to, { recursive: true }); n++; }
  else fs.copyFileSync(from, to);
}
const idx = fs.readFileSync(path.join(src, 'README.md'), 'utf8').replace(/^# /, '## ');
let out = `# SKILLS PARA IA · El Metro\n\n> Archivo para subir como **conocimiento** a un Gem de Gemini o a un **Proyecto** de ChatGPT (junto con \`CONTEXTO-IA.md\`). Reúne el índice de skills y las **skills propias del proyecto**. Los agentes de código (Claude Code, Codex, Antigravity) las leen directo del repositorio en \`.agents/skills/\` y \`.claude/skills/\`.\n\n${idx}\n`;
for (const p of PROPIAS) {
  const body = fs.readFileSync(path.join(src, p, 'SKILL.md'), 'utf8').replace(/^---[\s\S]*?---\n/, m => '```yaml\n' + m.replace(/^---\n|---\n$/g, '') + '```\n').replace(/^(#{1,4}) /gm, (m, h) => '#'.repeat(Math.min(6, h.length + 1)) + ' ');
  out += `\n---\n\n# Skill · ${p}\n\n${body}\n`;
}
fs.writeFileSync(path.join(root, 'arte', 'SKILLS-IA.md'), out);
console.log(`.claude/skills ← ${n} skills · arte/SKILLS-IA.md ${Math.round(out.length / 1024)} KB`);
