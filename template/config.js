// 复制这个文件，修改内容即可制作自己的接取小游戏。
window.ARCADE_CONFIG = {
  title: '星星收集站',
  subtitle: '把今晚的星光装进口袋',
  eyebrow: 'ARCADEKIT / TEMPLATE',
  intro: '左右移动小机器人，接住星星，避开太空垃圾。',
  controls: '左右拖动 · 电脑也可用 ← →',
  duration: 30,
  player: { name: '收集机器人', color: '#77aaff', face: '•ᴗ•' },
  targets: [
    { text: '★ 星光', color: '#ffe18c', points: 10 },
    { text: '✦ 流星', color: '#9fd7ff', points: 20 }
  ],
  obstacles: [ { text: '太空垃圾', color: '#ff697e', penalty: 25 } ],
  difficulty: { startSpeed: 115, endSpeed: 240, spawnStart: 0.90, spawnEnd: 0.45, obstacleChance: 0.20 },
  theme: { accent: '#91b5ff', mint: '#ffe18c', background: '#111126' },
  ranks: [
    { min: 500, title: '银河收藏家', line: '整片夜空，都为你亮起来了。', icon: '🌌' },
    { min: 200, title: '追星小能手', line: '又收获了一口袋星光。', icon: '🌟' },
    { min: 0, title: '星际新朋友', line: '准备好开始下一场太空旅行了吗？', icon: '🚀' }
  ],
  storageKey: 'arcadekit-template-best',
  footer: 'ARCADEKIT / YOUR NEXT GAME'
};
