/* CIGAR ROOT — seed data: lexicon, palettes, starter humidor & smoking journal */
(function () {
  'use strict';

  const LEXICON_CATS = [
    { id: 'wood',   zh: '木质', en: 'Wood',    color: '#8a7355' },
    { id: 'sweet',  zh: '甜感', en: 'Sweet',   color: '#a95a4e' },
    { id: 'nut',    zh: '坚果', en: 'Nutty',   color: '#a8814b' },
    { id: 'spice',  zh: '香料', en: 'Spice',   color: '#a55b32' },
    { id: 'toast',  zh: '烘焙', en: 'Toasted', color: '#7d5a3a' },
    { id: 'earth',  zh: '泥土', en: 'Earthy',  color: '#6f6552' },
    { id: 'floral', zh: '花香', en: 'Floral',  color: '#7d6f8e' },
    { id: 'fruit',  zh: '果香', en: 'Fruit',   color: '#99505f' },
    { id: 'dairy',  zh: '乳脂', en: 'Creamy',  color: '#b18a58' }
  ];

  const LEXICON = [
    { id: 'cedar',       zh: '雪松',     en: 'cedar',        cat: 'wood' },
    { id: 'oak',         zh: '橡木',     en: 'oak',          cat: 'wood' },
    { id: 'sandalwood',  zh: '檀香',     en: 'sandalwood',   cat: 'wood' },
    { id: 'smoked_oak',  zh: '烟熏橡木', en: 'smoked oak',   cat: 'wood' },
    { id: 'campfire',    zh: '营火',     en: 'campfire',     cat: 'wood' },
    { id: 'pine',        zh: '松木',     en: 'pine',         cat: 'wood' },
    { id: 'peat',        zh: '泥煤',     en: 'peat',         cat: 'wood' },

    { id: 'honey',       zh: '蜂蜜',     en: 'honey',        cat: 'sweet' },
    { id: 'caramel',     zh: '焦糖',     en: 'caramel',      cat: 'sweet' },
    { id: 'vanilla',     zh: '香草',     en: 'vanilla',      cat: 'sweet' },
    { id: 'dark_choc',   zh: '黑巧克力', en: 'dark cocoa',   cat: 'sweet' },
    { id: 'milk_choc',   zh: '牛奶巧克力', en: 'milk cocoa', cat: 'sweet' },
    { id: 'molasses',    zh: '糖蜜',     en: 'molasses',     cat: 'sweet' },
    { id: 'dried_fruit', zh: '果干',     en: 'dried fruit',  cat: 'sweet' },
    { id: 'maple',       zh: '枫糖',     en: 'maple',        cat: 'sweet' },
    { id: 'rum',         zh: '朗姆',     en: 'rum',          cat: 'sweet' },
    { id: 'coconut',     zh: '椰子',     en: 'coconut',      cat: 'sweet' },

    { id: 'almond',      zh: '杏仁',     en: 'almond',       cat: 'nut' },
    { id: 'hazelnut',    zh: '榛果',     en: 'hazelnut',     cat: 'nut' },
    { id: 'walnut',      zh: '核桃',     en: 'walnut',       cat: 'nut' },
    { id: 'peanut',      zh: '花生',     en: 'peanut',       cat: 'nut' },

    { id: 'black_pepper',zh: '黑胡椒',   en: 'black pepper', cat: 'spice' },
    { id: 'white_pepper',zh: '白胡椒',   en: 'white pepper', cat: 'spice' },
    { id: 'cinnamon',    zh: '肉桂',     en: 'cinnamon',     cat: 'spice' },
    { id: 'clove',       zh: '丁香',     en: 'clove',        cat: 'spice' },
    { id: 'nutmeg',      zh: '肉豆蔻',   en: 'nutmeg',       cat: 'spice' },
    { id: 'anise',       zh: '茴香',     en: 'anise',        cat: 'spice' },
    { id: 'ginger',      zh: '生姜',     en: 'ginger',       cat: 'spice' },
    { id: 'licorice',    zh: '甘草',     en: 'licorice',     cat: 'spice' },

    { id: 'toast',       zh: '烤面包',   en: 'toast',        cat: 'toast' },
    { id: 'coffee',      zh: '咖啡',     en: 'coffee',       cat: 'toast' },
    { id: 'espresso',    zh: '浓缩咖啡', en: 'espresso',     cat: 'toast' },
    { id: 'cocoa',       zh: '可可',     en: 'cocoa',        cat: 'toast' },
    { id: 'char',        zh: '焦木',     en: 'charred wood', cat: 'toast' },
    { id: 'barbecue',    zh: '烤肉',     en: 'barbecue',     cat: 'toast' },

    { id: 'earth',       zh: '泥土',     en: 'earth',        cat: 'earth' },
    { id: 'leather',     zh: '皮革',     en: 'leather',      cat: 'earth' },
    { id: 'barnyard',    zh: '谷仓',     en: 'barnyard',     cat: 'earth' },
    { id: 'mineral',     zh: '矿物',     en: 'mineral',      cat: 'earth' },
    { id: 'slate',       zh: '板岩',     en: 'slate',        cat: 'earth' },
    { id: 'incense',     zh: '熏香',     en: 'incense',      cat: 'earth' },

    { id: 'floral',      zh: '花香',     en: 'floral',       cat: 'floral' },
    { id: 'hay',         zh: '干草',     en: 'hay',          cat: 'floral' },
    { id: 'black_tea',   zh: '红茶',     en: 'black tea',    cat: 'floral' },
    { id: 'mint',        zh: '薄荷',     en: 'mint',         cat: 'floral' },
    { id: 'grass',       zh: '青草',     en: 'grass',        cat: 'floral' },

    { id: 'citrus',      zh: '柑橘',     en: 'citrus',       cat: 'fruit' },
    { id: 'cherry',      zh: '樱桃',     en: 'cherry',       cat: 'fruit' },
    { id: 'plum',        zh: '李子',     en: 'plum',         cat: 'fruit' },
    { id: 'raisin',      zh: '葡萄干',   en: 'raisin',       cat: 'fruit' },
    { id: 'fig',         zh: '无花果',   en: 'fig',          cat: 'fruit' },

    { id: 'cream',       zh: '奶油',     en: 'cream',        cat: 'dairy' },
    { id: 'butter',      zh: '黄油',     en: 'butter',       cat: 'dairy' },
    { id: 'yogurt',      zh: '酸奶',     en: 'yogurt',       cat: 'dairy' }
  ];

  /* Brand tints — the card wash and the accent ink that sits on it */
  const PALETTES = [
    { tint: '#b4655c', ink: '#8a453c' },
    { tint: '#c08356', ink: '#8f5c30' },
    { tint: '#7f9271', ink: '#4f6544' },
    { tint: '#5f8a86', ink: '#3f615e' },
    { tint: '#7e7fa3', ink: '#535678' },
    { tint: '#b99a5e', ink: '#7c6533' },
    { tint: '#a76f5e', ink: '#7d5041' },
    { tint: '#6f8f7c', ink: '#44695a' }
  ];

  /* Wrapper tones used by the little cigar illustration */
  const WRAPPERS = {
    habano:      { body: '#7a4d2a', edge: '#5d3820' },
    maduro:      { body: '#432b1e', edge: '#2f1d14' },
    connecticut: { body: '#c3a06a', edge: '#a2834f' },
    broadleaf:   { body: '#3d2519', edge: '#2a180f' },
    corojo:      { body: '#8a5a2c', edge: '#6a4220' },
    cameroon:    { body: '#6f4a2b', edge: '#523520' },
    sumatra:     { body: '#63402a', edge: '#48301f' },
    criollo:     { body: '#7e5733', edge: '#5f3f24' },
    rosado:      { body: '#8e5a43', edge: '#6d4330' }
  };

  const CIGARS = [
    {
      id: 'c01', brand: 'Cohiba', series: 'Siglo VI', origin: '古巴',
      wrapper: 'Cuban Habano', wrapperType: 'habano', vitola: 'Cañonazo', shape: 'Toro Gordo',
      length: 5.9, ring: 52, qty: 2, price: 1580, rating: 9.3, resting: true,
      box: 'A-01', acquired: '2026-02-11', boxDate: '2021-06', strength: 4,
      flavors: ['cedar', 'cream', 'honey', 'cocoa'],
      notes: '2021 年盒，购于哈瓦那。已在 65% 环境静养近三年，计划再放一年。'
    },
    {
      id: 'c02', brand: 'Montecristo', series: 'No.2', origin: '古巴',
      wrapper: 'Cuban Habano', wrapperType: 'habano', vitola: 'Pirámide', shape: 'Pirámide',
      length: 6.1, ring: 52, qty: 3, price: 780, rating: 8.9, resting: false,
      box: 'A-02', acquired: '2026-05-06', boxDate: '2023-10', strength: 4,
      flavors: ['cedar', 'cocoa', 'leather', 'earth'],
      notes: '鱼雷的标杆。斜切后抽吸偏紧，喜欢再晾十分钟。'
    },
    {
      id: 'c03', brand: 'Partagás', series: 'Serie D No.4', origin: '古巴',
      wrapper: 'Cuban Habano', wrapperType: 'habano', vitola: 'Robusto', shape: 'Robusto',
      length: 4.9, ring: 50, qty: 5, price: 620, rating: 8.8, resting: false,
      box: 'A-03', acquired: '2025-12-18', boxDate: '2022-09', strength: 5,
      flavors: ['earth', 'leather', 'black_pepper', 'cocoa'],
      notes: '浓郁派的口粮。饭后配陈年朗姆，尾段胡椒很有力量。'
    },
    {
      id: 'c04', brand: 'Romeo y Julieta', series: 'Wide Churchill', origin: '古巴',
      wrapper: 'Cuban Habano', wrapperType: 'habano', vitola: 'Gordito', shape: 'Robusto Gordo',
      length: 5.1, ring: 55, qty: 4, price: 520, rating: 8.4, resting: false,
      box: 'A-04', acquired: '2026-05-02', boxDate: '2023-03', strength: 3,
      flavors: ['floral', 'honey', 'cedar', 'toast'],
      notes: '花香很清楚，适合下午配茶。'
    },
    {
      id: 'c05', brand: 'H. Upmann', series: 'Magnum 46', origin: '古巴',
      wrapper: 'Cuban Habano', wrapperType: 'habano', vitola: 'Corona Gorda', shape: 'Corona Gorda',
      length: 5.6, ring: 46, qty: 2, price: 560, rating: 8.7, resting: true,
      box: 'A-05', acquired: '2026-01-15', boxDate: '2022-11', strength: 3,
      flavors: ['cedar', 'almond', 'cream'],
      notes: '清淡优雅，正在等它再圆润一点。'
    },
    {
      id: 'c06', brand: 'Trinidad', series: 'Vigía', origin: '古巴',
      wrapper: 'Cuban Habano', wrapperType: 'habano', vitola: 'Gordito', shape: 'Toro',
      length: 4.3, ring: 50, qty: 1, price: 880, rating: 8.6, resting: true,
      box: 'A-06', acquired: '2026-03-15', boxDate: '2023-06', strength: 3,
      flavors: ['honey', 'floral', 'hay', 'toast'],
      notes: '只剩一支，舍不得。'
    },
    {
      id: 'c07', brand: 'Hoyo de Monterrey', series: 'Epicure No.2', origin: '古巴',
      wrapper: 'Cuban Habano', wrapperType: 'habano', vitola: 'Robusto', shape: 'Robusto',
      length: 4.9, ring: 50, qty: 4, price: 620, rating: 8.8, resting: false,
      box: 'A-07', acquired: '2026-03-21', boxDate: '2022-04', strength: 2,
      flavors: ['cream', 'cedar', 'cinnamon', 'honey'],
      notes: '奶油感很好，新手也会喜欢。'
    },
    {
      id: 'c08', brand: 'Bolívar', series: 'Royal Corona', origin: '古巴',
      wrapper: 'Cuban Habano', wrapperType: 'habano', vitola: 'Robusto', shape: 'Robusto',
      length: 4.9, ring: 50, qty: 2, price: 560, rating: 8.5, resting: true,
      box: 'A-08', acquired: '2026-06-14', boxDate: '2021-12', strength: 5,
      flavors: ['earth', 'leather', 'dark_choc', 'black_pepper'],
      notes: '重口，适合冷天。'
    },
    {
      id: 'c09', brand: 'Rafael González', series: 'Perlas', origin: '古巴',
      wrapper: 'Cuban Habano', wrapperType: 'habano', vitola: 'Panatela', shape: 'Perla',
      length: 4.0, ring: 40, qty: 8, price: 150, rating: 7.9, resting: false,
      box: 'B-01', acquired: '2026-08-09', boxDate: '2024-02', strength: 2,
      flavors: ['hay', 'floral', 'cedar', 'honey'],
      notes: '20 分钟一支的小口粮。'
    },
    {
      id: 'c10', brand: 'Davidoff', series: 'Millennium Blend Robusto', origin: '多米尼加',
      wrapper: 'Dominican Habano', wrapperType: 'habano', vitola: 'Robusto', shape: 'Robusto',
      length: 5.0, ring: 50, qty: 3, price: 420, rating: 8.4, resting: false,
      box: 'B-02', acquired: '2026-04-18', boxDate: '2023-05', strength: 3,
      flavors: ['cream', 'toast', 'almond', 'cedar'],
      notes: '稳定、干净，工作日的安全牌。'
    },
    {
      id: 'c11', brand: 'Davidoff', series: 'Winston Churchill Late Hour Toro', origin: '多米尼加',
      wrapper: 'Ecuador Habano', wrapperType: 'habano', vitola: 'Toro', shape: 'Toro',
      length: 6.0, ring: 52, qty: 2, price: 760, rating: 9.0, resting: true,
      box: 'B-03', acquired: '2025-11-29', boxDate: '2023-08', strength: 4,
      flavors: ['oak', 'dark_choc', 'black_pepper', 'leather'],
      notes: '威士忌桶陈烟叶，晚上喝一杯再点。'
    },
    {
      id: 'c12', brand: 'Arturo Fuente', series: 'Opus X Robusto', origin: '多米尼加',
      wrapper: 'Dominican Rosado', wrapperType: 'rosado', vitola: 'Robusto', shape: 'Robusto',
      length: 5.25, ring: 50, qty: 1, price: 1180, rating: 9.4, resting: true,
      box: 'B-04', acquired: '2026-10-10', boxDate: '2020-05', strength: 4,
      flavors: ['cedar', 'dark_choc', 'spice', 'floral'],
      notes: '压箱底的一支。特殊日子再开。'
    },
    {
      id: 'c13', brand: 'Arturo Fuente', series: 'Hemingway Short Story', origin: '多米尼加',
      wrapper: 'Cameroon', wrapperType: 'cameroon', vitola: 'Perfecto', shape: 'Perfecto',
      length: 4.0, ring: 46, qty: 6, price: 240, rating: 8.3, resting: false,
      box: 'B-05', acquired: '2026-05-24', boxDate: '2024-01', strength: 3,
      flavors: ['cedar', 'toast', 'almond', 'cream'],
      notes: '20 分钟的小完美，配冷萃咖啡。'
    },
    {
      id: 'c14', brand: 'Padrón', series: '1926 Serie No.9', origin: '尼加拉瓜',
      wrapper: 'Nicaraguan Habano Maduro', wrapperType: 'maduro', vitola: 'Toro', shape: 'Toro',
      length: 6.0, ring: 56, qty: 2, price: 680, rating: 9.1, resting: true,
      box: 'C-01', acquired: '2026-02-27', boxDate: '2022-07', strength: 5,
      flavors: ['dark_choc', 'cocoa', 'earth', 'black_pepper'],
      notes: '盒压，烟气浓稠。再放两年会更甜。'
    },
    {
      id: 'c15', brand: 'Padrón', series: '1964 Anniversary Exclusivo', origin: '尼加拉瓜',
      wrapper: 'Nicaraguan Habano Maduro', wrapperType: 'maduro', vitola: 'Robusto', shape: 'Robusto',
      length: 5.5, ring: 54, qty: 4, price: 500, rating: 8.9, resting: false,
      box: 'C-02', acquired: '2026-07-19', boxDate: '2023-05', strength: 4,
      flavors: ['cocoa', 'nutmeg', 'cedar', 'leather'],
      notes: '比 1926 更日常，甜香料很讨喜。'
    },
    {
      id: 'c16', brand: 'Oliva', series: 'Serie V Melanio Robusto', origin: '尼加拉瓜',
      wrapper: 'Ecuador Sumatra', wrapperType: 'sumatra', vitola: 'Robusto', shape: 'Robusto',
      length: 5.0, ring: 52, qty: 5, price: 300, rating: 8.7, resting: false,
      box: 'C-03', acquired: '2026-09-13', boxDate: '2024-03', strength: 4,
      flavors: ['cedar', 'coffee', 'dark_choc', 'black_pepper'],
      notes: '性价比之王，咖啡与黑巧。'
    },
    {
      id: 'c17', brand: 'My Father', series: 'Le Bijou 1922 Torpedo', origin: '尼加拉瓜',
      wrapper: 'Nicaraguan Habano Oscuro', wrapperType: 'maduro', vitola: 'Torpedo', shape: 'Torpedo',
      length: 6.1, ring: 52, qty: 3, price: 380, rating: 8.9, resting: false,
      box: 'C-04', acquired: '2026-04-05', boxDate: '2023-09', strength: 5,
      flavors: ['dark_choc', 'earth', 'black_pepper', 'leather'],
      notes: '力量型，别空腹抽。'
    },
    {
      id: 'c18', brand: 'Drew Estate', series: 'Liga Privada No.9', origin: '尼加拉瓜',
      wrapper: 'Connecticut Broadleaf', wrapperType: 'broadleaf', vitola: 'Toro', shape: 'Toro',
      length: 6.0, ring: 52, qty: 2, price: 560, rating: 8.8, resting: true,
      box: 'C-05', acquired: '2025-12-06', boxDate: '2022-12', strength: 4,
      flavors: ['molasses', 'cocoa', 'leather', 'earth'],
      notes: '甜、油、浓。醒一支要很久。'
    },
    {
      id: 'c19', brand: 'AJ Fernandez', series: 'New World Oscuro Toro', origin: '尼加拉瓜',
      wrapper: 'Nicaraguan Habano Oscuro', wrapperType: 'maduro', vitola: 'Toro', shape: 'Toro',
      length: 6.0, ring: 52, qty: 4, price: 160, rating: 8.1, resting: false,
      box: 'C-06', acquired: '2026-04-26', boxDate: '2024-06', strength: 4,
      flavors: ['black_pepper', 'cocoa', 'cedar', 'earth'],
      notes: '新手也能接受的浓郁，便宜大碗。'
    },
    {
      id: 'c20', brand: 'Aging Room', series: 'Quattro Nicaragua Maestro', origin: '尼加拉瓜',
      wrapper: 'Nicaraguan Habano', wrapperType: 'habano', vitola: 'Toro', shape: 'Toro',
      length: 6.0, ring: 52, qty: 2, price: 320, rating: 8.5, resting: false,
      box: 'C-07', acquired: '2026-01-31', boxDate: '2023-04', strength: 3,
      flavors: ['cedar', 'almond', 'cocoa', 'cinnamon'],
      notes: '轻盈一些的尼加拉瓜，配咖啡正好。'
    },
    {
      id: 'c21', brand: 'E.P. Carrillo', series: 'Pledge Prequel', origin: '多米尼加',
      wrapper: 'Connecticut Broadleaf', wrapperType: 'broadleaf', vitola: 'Robusto', shape: 'Robusto',
      length: 5.0, ring: 50, qty: 3, price: 360, rating: 9.0, resting: false,
      box: 'B-06', acquired: '2026-03-08', boxDate: '2023-11', strength: 4,
      flavors: ['dark_choc', 'molasses', 'black_pepper', 'oak'],
      notes: '2020 年度雪茄。甜苦平衡做得极好。'
    },
    {
      id: 'c22', brand: 'La Aurora', series: 'ADN Dominicano Robusto', origin: '多米尼加',
      wrapper: 'Dominican Corojo', wrapperType: 'corojo', vitola: 'Robusto', shape: 'Robusto',
      length: 5.0, ring: 50, qty: 2, price: 240, rating: 8.2, resting: false,
      box: 'B-07', acquired: '2026-06-27', boxDate: '2024-04', strength: 3,
      flavors: ['cedar', 'toast', 'honey', 'nutmeg'],
      notes: '老派多米尼加风格，温和。'
    },
    {
      id: 'c23', brand: 'Flor de las Antillas', series: 'Toro', origin: '尼加拉瓜',
      wrapper: 'Nicaraguan Habano', wrapperType: 'habano', vitola: 'Toro', shape: 'Toro',
      length: 6.0, ring: 52, qty: 3, price: 200, rating: 8.3, resting: false,
      box: 'C-08', acquired: '2026-04-12', boxDate: '2024-05', strength: 3,
      flavors: ['cedar', 'cream', 'cinnamon', 'toast'],
      notes: '2012 年度雪茄，柔和顺口。'
    },
    {
      id: 'c24', brand: 'Ashton', series: 'VSG Sorcerer', origin: '多米尼加',
      wrapper: 'Ecuador Sumatra', wrapperType: 'sumatra', vitola: 'Toro', shape: 'Toro',
      length: 6.0, ring: 52, qty: 2, price: 420, rating: 8.6, resting: false,
      box: 'B-08', acquired: '2025-11-15', boxDate: '2022-08', strength: 4,
      flavors: ['cedar', 'dark_choc', 'black_pepper', 'cream'],
      notes: 'VSG 的油亮茄衣很好看。'
    },
    {
      id: 'c25', brand: 'Camacho', series: 'Corojo Toro', origin: '洪都拉斯',
      wrapper: 'Honduran Corojo', wrapperType: 'corojo', vitola: 'Toro', shape: 'Toro',
      length: 6.0, ring: 50, qty: 3, price: 260, rating: 8.4, resting: false,
      box: 'D-01', acquired: '2026-05-30', boxDate: '2024-07', strength: 5,
      flavors: ['earth', 'black_pepper', 'leather', 'cedar'],
      notes: '洪都拉斯式的直接，配冰水。'
    },
    {
      id: 'c26', brand: '长城', series: '132 记忆', origin: '中国',
      wrapper: '什邡 Habano', wrapperType: 'habano', vitola: 'Robusto', shape: 'Robusto',
      length: 5.5, ring: 50, qty: 2, price: 260, rating: 8.0, resting: false,
      box: 'D-02', acquired: '2026-01-24', boxDate: '2025-03', strength: 3,
      flavors: ['earth', 'toast', 'cocoa', 'cedar'],
      notes: '国产手工，烘焙感明显，进步很大。'
    },
    {
      id: 'c27', brand: '王冠', series: '小国粹', origin: '中国',
      wrapper: '什邡 Habano', wrapperType: 'habano', vitola: 'Corona', shape: 'Corona',
      length: 4.5, ring: 42, qty: 5, price: 120, rating: 7.8, resting: false,
      box: 'D-03', acquired: '2026-03-28', boxDate: '2025-09', strength: 2,
      flavors: ['hay', 'cedar', 'honey', 'toast'],
      notes: '半小时的轻口粮。'
    },
    {
      id: 'c28', brand: 'Arturo Fuente', series: 'Don Carlos No.2', origin: '多米尼加',
      wrapper: 'Cameroon', wrapperType: 'cameroon', vitola: 'Belicoso', shape: 'Belicoso',
      length: 6.0, ring: 55, qty: 2, price: 520, rating: 8.9, resting: true,
      box: 'B-09', acquired: '2026-09-27', boxDate: '2023-02', strength: 3,
      flavors: ['cedar', 'almond', 'cream', 'cinnamon'],
      notes: '喀麦隆茄衣的甜香料，正在静养。'
    }
  ];

  const RECORDS = [
    {
      id: 'r01', cigarId: 'c02', date: '2026-10-18', rating: 9.0, minutes: 75,
      pairing: '单一麦芽威士忌', burn: '均匀', ash: '灰白紧实',
      flavors: ['cedar', 'cocoa', 'leather', 'honey'],
      head: '前几口是熟悉的雪松与烤坚果，烟气细腻，抽吸略紧。',
      mid: '中段转为可可与皮革，甜感慢慢浮上来，配威士忌很合。',
      finish: '尾段胡椒增强但没有苦味，最后三分之一依然干净。',
      location: '家中阳台'
    },
    {
      id: 'r02', cigarId: 'c15', date: '2026-10-06', rating: 8.8, minutes: 65,
      pairing: '陈年朗姆', burn: '均匀', ash: '灰白紧实',
      flavors: ['cocoa', 'nutmeg', 'leather', 'molasses'],
      head: '开盒的甜香，第一口就是可可粉与糖蜜。',
      mid: '肉豆蔻和皮革出现，浓度上来但不刺激。',
      finish: '尾段有黑巧的回甘，灰很稳。',
      location: '书房'
    },
    {
      id: 'r03', cigarId: 'c16', date: '2026-09-24', rating: 8.6, minutes: 55,
      pairing: '冰美式', burn: '轻微斜烧', ash: '偏黑松散',
      flavors: ['coffee', 'dark_choc', 'cedar', 'black_pepper'],
      head: '咖啡与黑巧直接，烟气饱满。',
      mid: '中段木质感增强，斜烧补了一次火。',
      finish: '尾段胡椒收尾，配冰美式正好。',
      location: '办公室露台'
    },
    {
      id: 'r04', cigarId: 'c07', date: '2026-09-10', rating: 8.9, minutes: 60,
      pairing: '正山小种', burn: '均匀', ash: '灰白紧实',
      flavors: ['cream', 'cedar', 'honey', 'cinnamon'],
      head: '奶油与雪松，轻得几乎像甜点。',
      mid: '蜂蜜和肉桂出来，烟气柔滑。',
      finish: '干净收尾，没有一点杂味。',
      location: '客厅'
    },
    {
      id: 'r05', cigarId: 'c11', date: '2026-08-29', rating: 9.1, minutes: 80,
      pairing: '雪莉桶单一麦芽', burn: '均匀', ash: '灰白紧实',
      flavors: ['oak', 'dark_choc', 'leather', 'black_pepper'],
      head: '橡木与黑巧，像在喝一杯陈年红酒。',
      mid: '皮革和胡椒逐渐展开，浓度控制得很好。',
      finish: '尾段仍是甜的，难得。',
      location: '威士忌吧'
    },
    {
      id: 'r06', cigarId: 'c13', date: '2026-08-12', rating: 8.2, minutes: 35,
      pairing: '冷萃咖啡', burn: '均匀', ash: '灰白紧实',
      flavors: ['toast', 'almond', 'cream', 'cedar'],
      head: '烤面包和杏仁，短短的 perfecto 很方便。',
      mid: '中段奶油感明显，适合早晨。',
      finish: '尾段略热，提前放下了。',
      location: '家中阳台'
    },
    {
      id: 'r07', cigarId: 'c03', date: '2026-07-30', rating: 8.7, minutes: 70,
      pairing: '陈年朗姆', burn: '需补火', ash: '偏黑紧实',
      flavors: ['earth', 'leather', 'black_pepper', 'cocoa'],
      head: '泥土与皮革，力量感很强。',
      mid: '中段补火一次，胡椒冲上来。',
      finish: '尾段可可回甘，配朗姆刚好。',
      location: '家中阳台'
    },
    {
      id: 'r08', cigarId: 'c26', date: '2026-07-14', rating: 8.0, minutes: 50,
      pairing: '普洱', burn: '均匀', ash: '灰白松散',
      flavors: ['toast', 'cocoa', 'earth', 'cedar'],
      head: '烘烤与木质，国产烟叶的辨识度。',
      mid: '中段可可和泥土，比预期柔和。',
      finish: '尾段略苦，配茶平衡得不错。',
      location: '成都家中'
    },
    {
      id: 'r09', cigarId: 'c04', date: '2026-06-27', rating: 8.4, minutes: 65,
      pairing: '香槟', burn: '轻微斜烧', ash: '灰白紧实',
      flavors: ['floral', 'honey', 'cedar', 'toast'],
      head: '花香很清楚，像春天。',
      mid: '蜂蜜与烤面包，烟气轻盈。',
      finish: '尾段稍显单薄，但整体舒服。',
      location: '餐厅露台'
    },
    {
      id: 'r10', cigarId: 'c23', date: '2026-06-13', rating: 8.3, minutes: 60,
      pairing: '冰水', burn: '均匀', ash: '灰白紧实',
      flavors: ['cedar', 'cream', 'cinnamon', 'toast'],
      head: '雪松与奶油，入口很顺。',
      mid: '肉桂和烤面包，浓度中等。',
      finish: '尾段干净，日常好选择。',
      location: '书房'
    },
    {
      id: 'r11', cigarId: 'c06', date: '2026-05-31', rating: 8.6, minutes: 55,
      pairing: '单一麦芽威士忌', burn: '均匀', ash: '灰白紧实',
      flavors: ['honey', 'floral', 'toast', 'hay'],
      head: '蜂蜜和干草，Trinidad 的细腻。',
      mid: '花香与烤面包，烟气很软。',
      finish: '尾段依旧温和，舍不得结束。',
      location: '家中阳台'
    },
    {
      id: 'r12', cigarId: 'c19', date: '2026-05-17', rating: 8.0, minutes: 50,
      pairing: '苏打水', burn: '均匀', ash: '偏黑松散',
      flavors: ['black_pepper', 'cocoa', 'cedar', 'earth'],
      head: '黑胡椒开场，很有尼加拉瓜的样子。',
      mid: '可可与雪松，便宜但完成度不错。',
      finish: '尾段略糙，配苏打水刚好。',
      location: '办公室露台'
    }
  ];

  window.LEXICON_CATS = LEXICON_CATS;
  window.LEXICON = LEXICON;
  window.PALETTES = PALETTES;
  window.WRAPPERS = WRAPPERS;
  window.SEED = { version: 1, cigars: CIGARS, records: RECORDS };
  window.PIPE_TYPE_PALETTES = {
    '英式': { tint: '#ecd8d3', ink: '#8b4a4a' },
    '弗吉尼亚': { tint: '#efe1c2', ink: '#a8792f' },
    'V/P': { tint: '#ead7dc', ink: '#885064' },
    '伯莱': { tint: '#e8dccb', ink: '#7d6448' },
    '调味': { tint: '#d9e9e4', ink: '#4f7f76' },
    '巴尔干': { tint: '#dce2ec', ink: '#566984' },
    '苏格兰': { tint: '#e2e6d4', ink: '#6e7d50' },
    '肯塔基': { tint: '#ead8c8', ink: '#9a5d37' },
    '卡文迪什': { tint: '#eedfd3', ink: '#9d7256' },
    '其他': { tint: '#e4e1da', ink: '#7a756b' }
  };
})();
 

