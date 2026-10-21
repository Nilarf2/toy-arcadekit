window.ARCADE_CONFIG = {
  title: '弹幕接接乐',
  subtitle: '接住好心情，屏蔽坏弹幕',
  eyebrow: '30 SECOND CHALLENGE',
  intro: '你的直播间开播啦！移动小电视，接住满屏的热情。',
  controls: '左右拖动接弹幕 · 电脑也可用 ← →',
  duration: 30,
  player: { name: '小电视', color: '#8a80ff', face: '•ᴗ•' },
  targets: [
    { text: '好耶！', color: '#62efcf', points: 10 },
    { text: '666', color: '#91b5ff', points: 10 },
    { text: '前排！', color: '#e1b6ff', points: 10 },
    { text: '一键三连', color: '#ffd277', points: 20 },
    { text: '好喜欢', color: '#ffb4d8', points: 15 },
    { text: '这就关注', color: '#62efcf', points: 15 }
  ],
  obstacles: [
    { text: '剧透警告', color: '#ff697e', penalty: 25 },
    { text: '网络卡顿', color: '#ff866a', penalty: 25 }
  ],
  difficulty: { startSpeed: 125, endSpeed: 265, spawnStart: 0.82, spawnEnd: 0.40, obstacleChance: 0.22 },
  theme: { accent: '#ad9bff', mint: '#62efcf', background: '#111126' },
  ranks: [
    { min: 700, title: '弹幕区的传说', line: '满屏的喜欢，被你接得稳稳当当。', icon: '🏆' },
    { min: 400, title: '人气小主播', line: '你一出现，直播间就热闹起来了。', icon: '🌟' },
    { min: 160, title: '接梗小能手', line: '快乐已收到，下次再多接一点！', icon: '✨' },
    { min: 0, title: '快乐实习生', line: '开播第一天，已经很有节目效果。', icon: '🛸' }
  ],
  storageKey: 'arcadekit-danmaku-best',
  footer: 'ARCADEKIT / ORIGINAL MINI GAME'
};
