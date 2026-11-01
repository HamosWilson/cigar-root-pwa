/* Hamos 的烟草生活 — local pipe tobacco reference catalog.
   Used by the “查资料” button before any online lookup. Facts are a curated
   starting point, not a substitute for the tin label. */
(function () {
  'use strict';

  const seed = (window.SEED && window.SEED.pipes ? window.SEED.pipes : []).map(function (p) {
    return {
      brand: p.brand,
      blend: p.blend,
      aliases: [],
      type: p.type,
      cut: p.cut,
      components: p.components || [],
      topping: p.topping || '无',
      weight: p.weight || 50,
      strength: p.strength || 3,
      roomNote: p.roomNote || 3,
      flavors: p.flavors || [],
      description: p.notes || '',
      source: { kind: 'builtin', name: '内置资料库' }
    };
  });

  const extra = [
    {
      brand: 'Samuel Gawith', blend: 'Best Brown Flake', aliases: ['BBF', 'Best Brown'],
      type: '弗吉尼亚', cut: '切片', components: ['弗吉尼亚'], topping: '无',
      weight: 50, strength: 3, roomNote: 3, flavors: ['hay', 'honey', 'toast', 'oak'],
      description: '纯 Virginia 切片，干草、蜂蜜和烤面包；揉松后慢抽，陈化潜力好。'
    },
    {
      brand: 'Samuel Gawith', blend: 'Skiff Mixture', aliases: ['Skiff'],
      type: '英式', cut: '细丝', components: ['弗吉尼亚', '拉塔基亚', '东方'], topping: '无',
      weight: 50, strength: 3, roomNote: 3, flavors: ['campfire', 'peat', 'leather', 'citrus'],
      description: '轻到中等英式，Latakia 不压过 Virginia 的柑橘与干草，适合日常。'
    },
    {
      brand: 'Samuel Gawith', blend: 'Grousemoor', aliases: ['Grouse'],
      type: '调味', cut: '细丝', components: ['弗吉尼亚'], topping: '花香',
      weight: 50, strength: 2, roomNote: 4, flavors: ['floral', 'citrus', 'hay', 'honey'],
      description: '传统英式加香，花香和柑橘很突出，室韵友好。'
    },
    {
      brand: 'Gawith Hoggarth', blend: 'Ennerdale Flake', aliases: ['Ennerdale'],
      type: '调味', cut: '切片', components: ['弗吉尼亚', '伯莱'], topping: '花香',
      weight: 50, strength: 3, roomNote: 4, flavors: ['floral', 'almond', 'citrus', 'honey'],
      description: '经典的湖区加香切片，花香、杏仁和柑橘，喜欢的人很上头。'
    },
    {
      brand: 'Cornell & Diehl', blend: 'Bayou Night', aliases: ['Bayou Night'],
      type: 'V/P', cut: '细丝', components: ['弗吉尼亚', '佩里克', '伯莱'], topping: '无',
      weight: 50, strength: 4, roomNote: 3, flavors: ['earth', 'black_pepper', 'dried_fruit', 'cocoa'],
      description: 'Perique 分量足的 V/P，胡椒、深色果干和泥土，劲道偏中上。'
    },
    {
      brand: 'G.L. Pease', blend: 'Quiet Nights', aliases: ['Quiet Nights'],
      type: '英式', cut: '细丝', components: ['弗吉尼亚', '拉塔基亚', '东方', '佩里克'], topping: '无',
      weight: 50, strength: 4, roomNote: 2, flavors: ['campfire', 'peat', 'leather', 'dark_choc'],
      description: '浓郁英式，Latakia、Perique 与深色巧克力；适合晚上慢慢抽。'
    },
    {
      brand: 'G.L. Pease', blend: 'Chelsea Morning', aliases: ['Chelsea Morning'],
      type: '英式', cut: '细丝', components: ['弗吉尼亚', '拉塔基亚', '东方'], topping: '无',
      weight: 50, strength: 3, roomNote: 3, flavors: ['campfire', 'citrus', 'honey', 'toast'],
      description: '明亮型英式，柑橘和蜂蜜在前，Latakia 在后段托底。'
    },
    {
      brand: 'Esoterica', blend: 'Stonehaven', aliases: ['Stonehaven'],
      type: '伯莱', cut: '切片', components: ['伯莱', '弗吉尼亚'], topping: '无',
      weight: 50, strength: 4, roomNote: 3, flavors: ['molasses', 'cocoa', 'earth', 'dried_fruit'],
      description: '深色 Burley 切片，糖蜜、可可和泥土；难买，陈化后更圆。'
    },
    {
      brand: 'Esoterica', blend: 'Margate', aliases: ['Margate'],
      type: '英式', cut: '细丝', components: ['弗吉尼亚', '拉塔基亚', '东方'], topping: '无',
      weight: 50, strength: 3, roomNote: 3, flavors: ['campfire', 'leather', 'earth', 'toast'],
      description: '老派英式，Latakia 与皮革、泥土，平衡耐抽。'
    },
    {
      brand: 'Mac Baren', blend: 'HH Acadian Perique', aliases: ['Acadian Perique'],
      type: 'V/P', cut: '切片', components: ['弗吉尼亚', '佩里克', '伯莱'], topping: '无',
      weight: 50, strength: 3, roomNote: 3, flavors: ['black_pepper', 'dried_fruit', 'earth', 'oak'],
      description: 'Acadian Perique 的果干与胡椒，Virginia 的甜味打底。'
    },
    {
      brand: "Rattray's", blend: "Hal O' The Wynd", aliases: ['Hal O The Wynd', 'HOTW'],
      type: 'V/P', cut: '细丝', components: ['弗吉尼亚', '佩里克'], topping: '无',
      weight: 50, strength: 3, roomNote: 3, flavors: ['black_pepper', 'dried_fruit', 'honey', 'toast'],
      description: 'Rattray 的经典 V/P，胡椒和果干，甜度适中。'
    },
    {
      brand: 'Solani', blend: '660', aliases: ['Silver Flake', '660 Silver Flake'],
      type: '伯莱', cut: '切片', components: ['伯莱', '弗吉尼亚'], topping: '无',
      weight: 50, strength: 3, roomNote: 3, flavors: ['cocoa', 'molasses', 'earth', 'toast'],
      description: 'Burley 为主的切片，可可、糖蜜和坚果，温和耐抽。'
    },
    {
      brand: 'Peter Stokkebye', blend: 'Luxury Navy Flake', aliases: ['LNF', 'Navy Flake'],
      type: 'V/P', cut: '切片', components: ['弗吉尼亚', '佩里克'], topping: '朗姆',
      weight: 50, strength: 3, roomNote: 3, flavors: ['rum', 'dried_fruit', 'honey', 'black_pepper'],
      description: '朗姆加香的 Navy Flake，果干、蜂蜜和轻胡椒，性价比高。'
    },
    {
      brand: 'Peter Stokkebye', blend: 'Luxury Bullseye Flake', aliases: ['LBF', 'Bullseye Flake'],
      type: 'V/P', cut: '圆片', components: ['弗吉尼亚', '佩里克', '卡文迪什'], topping: '无',
      weight: 50, strength: 3, roomNote: 3, flavors: ['dried_fruit', 'honey', 'cocoa', 'black_pepper'],
      description: '中心带 Cavendish 的圆片，果干、蜂蜜与柔和奶香。'
    },
    {
      brand: 'Seattle Pipe Club', blend: 'Plum Pudding', aliases: ['Plum Pudding'],
      type: '英式', cut: '细丝', components: ['弗吉尼亚', '拉塔基亚', '东方', '佩里克'], topping: '无',
      weight: 50, strength: 4, roomNote: 2, flavors: ['campfire', 'dried_fruit', 'dark_choc', 'leather'],
      description: '重 Latakia 的英式，李子干、黑巧克力和烟熏，劲道足。'
    },
    {
      brand: 'Peterson', blend: 'Elizabethan Mixture', aliases: ['Elizabethan'],
      type: 'V/P', cut: '细丝', components: ['弗吉尼亚', '佩里克'], topping: '无',
      weight: 50, strength: 3, roomNote: 3, flavors: ['black_pepper', 'dried_fruit', 'honey', 'toast'],
      description: '经典的 V/P 日常草，胡椒、果干和干草，平衡好上手。'
    },
    {
      brand: 'Peterson', blend: 'De Luxe Navy Rolls', aliases: ['Navy Rolls', 'DLNR'],
      type: 'V/P', cut: '圆片', components: ['弗吉尼亚', '佩里克'], topping: '无',
      weight: 50, strength: 3, roomNote: 3, flavors: ['dried_fruit', 'honey', 'black_pepper', 'oak'],
      description: '海军圆片，果干与蜂蜜，Perique 在后段给胡椒。'
    },
    {
      brand: 'Robert McConnell', blend: 'Scottish Flake', aliases: ['Scottish Cake'],
      type: '苏格兰', cut: '切片', components: ['弗吉尼亚', '伯莱', '拉塔基亚'], topping: '无',
      weight: 50, strength: 3, roomNote: 3, flavors: ['campfire', 'earth', 'honey', 'leather'],
      description: '苏格兰式调配，Virginia 的甜、Burley 的坚果与轻 Latakia。'
    },
    {
      brand: 'HU Tobacco', blend: 'Director’s Cut', aliases: ["Director's Cut", 'Directors Cut'],
      type: 'V/P', cut: '切片', components: ['弗吉尼亚', '佩里克', '伯莱'], topping: '无',
      weight: 50, strength: 4, roomNote: 3, flavors: ['black_pepper', 'dried_fruit', 'earth', 'cocoa'],
      description: '德式 V/P 切片，果干、胡椒和可可，劲道偏足。'
    }
  ];

  window.PIPE_CATALOG = seed.concat(extra);
  window.PIPE_CATALOG_VERSION = 1;
})();
