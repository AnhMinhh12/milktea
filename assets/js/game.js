/**
 * 🧋 TIỆM TRÀ SỮA CỦA RÙA (Boba Shop Simulator)
 * PHIÊN BẢN CHUẨN ANIME COZY CAFE - TIỆM TRÀ MƠ ƯỚC / TIỆM TRÀ SỮA BÉ HEO
 * - To rõ ràng, màu sắc pastel ấm áp, sinh động và tràn đầy chuyển động
 * - Mái che rèm hồng, khách hàng chibi trò chuyện dễ thương với thanh Kiên Nhẫn
 * - Quầy trà vòi rót, thớt gỗ bàn pha ly to với nước trà dâng sóng sánh, đá bồng bềnh
 * - 15 khay topping ngon mắt, 9 chai siro vòi bơm lò xo, máy dập nắp retro rung lắc cơ học
 */

// ================= 1. HỆ THỐNG ÂM THANH =================
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    try {
      const saved = localStorage.getItem('tiemTraSuaRua_sound');
      if (saved !== null) this.enabled = JSON.parse(saved);
    } catch (e) {}
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    try {
      localStorage.setItem('tiemTraSuaRua_sound', JSON.stringify(this.enabled));
    } catch (e) {}
    return this.enabled;
  }

  playTone(freq = 440, type = 'sine', duration = 0.1, gainVal = 0.15) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  click() { this.playTone(600, 'sine', 0.05, 0.1); }
  
  pour() { 
    this.playTone(320, 'triangle', 0.25, 0.2);
    setTimeout(() => this.playTone(400, 'sine', 0.2, 0.15), 60);
    setTimeout(() => this.playTone(520, 'sine', 0.15, 0.1), 120);
  }

  pump() {
    this.playTone(280, 'sine', 0.1, 0.2);
    setTimeout(() => this.playTone(650, 'triangle', 0.12, 0.18), 70);
  }

  ice() {
    this.playTone(1300, 'sine', 0.07, 0.2);
    setTimeout(() => this.playTone(1750, 'sine', 0.06, 0.16), 50);
    setTimeout(() => this.playTone(2100, 'triangle', 0.05, 0.12), 100);
  }

  boba() { 
    this.playTone(240, 'sine', 0.12, 0.22);
    setTimeout(() => this.playTone(320, 'triangle', 0.1, 0.18), 50);
  }

  sealStamp() {
    this.playTone(180, 'sawtooth', 0.15, 0.3);
    setTimeout(() => this.playTone(120, 'triangle', 0.25, 0.35), 70);
    setTimeout(() => this.playTone(880, 'sine', 0.2, 0.25), 180);
  }

  serveSuccess() {
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((f, idx) => {
      setTimeout(() => this.playTone(f, 'sine', 0.16, 0.22), idx * 65);
    });
  }

  trash() {
    this.playTone(180, 'sawtooth', 0.15, 0.2);
  }

  sizzle() {
    this.playTone(360, 'sawtooth', 0.18, 0.22);
    setTimeout(() => this.playTone(280, 'triangle', 0.14, 0.18), 60);
  }

  ding() {
    this.playTone(880, 'sine', 0.12, 0.25);
    setTimeout(() => this.playTone(1320, 'sine', 0.18, 0.22), 60);
  }

  warning() {
    this.playTone(220, 'sawtooth', 0.14, 0.25);
    setTimeout(() => this.playTone(180, 'sawtooth', 0.14, 0.25), 70);
  }
}

const audio = new SoundEngine();

// ================= 2. NGUYÊN LIỆU (CHUẨN 100% THEO THIẾT KẾ) =================
const CUPS = [
  { id: 'M', name: 'Ly M', ml: '500ml', cost: 500, priceBonus: 0, shelfLife: 999 },
  { id: 'L', name: 'Ly L', ml: '700ml', cost: 800, priceBonus: 8000, shelfLife: 999 }
];

const TEAS = [
  { id: 'traDen', name: 'TRÀ ĐEN', icon: '🍂', liquid: '#5A2A14', cost: 3000, price: 20000, shelfLife: 2 },
  { id: 'oolong', name: 'TRÀ Ô LONG', icon: '🪵', liquid: '#A65A22', cost: 3000, price: 20000, shelfLife: 2 },
  { id: 'traXanh', name: 'TRÀ XANH', icon: '🌿', liquid: '#6F9C3E', cost: 3000, price: 20000, shelfLife: 2 },
  { id: 'traNhai', name: 'TRÀ NHÀI', icon: '🌸', liquid: '#D8BC50', cost: 3500, price: 22000, shelfLife: 2 },
  { id: 'hongTra', name: 'HỒNG TRÀ', icon: '🍵', liquid: '#C23B33', cost: 3200, price: 22000, shelfLife: 2 },
  { id: 'lucTra', name: 'LỤC TRÀ', icon: '🍃', liquid: '#529E30', cost: 3000, price: 20000, shelfLife: 2 },
  { id: 'traThai', name: 'TRÀ THÁI', icon: '🧋', liquid: '#E66E20', cost: 3500, price: 22000, shelfLife: 2 },
  { id: 'suaTuoi', name: 'SỮA TƯƠI', icon: '🥛', liquid: '#FFFBF2', cost: 3000, price: 20000, shelfLife: 1 },
  { id: 'duongDen', name: 'ĐƯỜNG ĐEN', icon: '🟤', liquid: '#381A0E', cost: 4000, price: 25000, shelfLife: 2 }
];

const SUGAR_LEVELS = ['0%', '50%', '70%', '100%'];
const ICE_LEVELS = ['Không', 'Ít', 'Bình thường', 'Nhiều'];

const TOPPINGS = [
  { id: 'tranChau', name: 'TRÂN CHÂU', icon: '🟤', cost: 2000, price: 5000, shelfLife: 2 },
  { id: 'tranChauHoangKim', name: 'TC HOÀNG KIM', icon: '✨', cost: 2800, price: 6500, shelfLife: 2 },
  { id: 'thachMatcha', name: 'THẠCH MATCHA', icon: '🍵', cost: 2500, price: 6000, shelfLife: 2 },
  { id: 'thach3Q', name: 'THẠCH 3Q', icon: '🔶', cost: 2500, price: 6000, shelfLife: 2 },
  { id: 'kemPhoMai', name: 'KEM PHÔ MAI', icon: '🧀', cost: 3500, price: 8000, shelfLife: 2 },
  { id: 'pudding', name: 'PUDDING', icon: '🍮', cost: 3000, price: 7000, shelfLife: 2 },
  { id: 'thachTraiCay', name: 'THẠCH TRÁI CÂY', icon: '🍓', cost: 2500, price: 6000, shelfLife: 2 },
  { id: 'thachTrang', name: 'THẠCH TRẮNG', icon: '⚪', cost: 2500, price: 6000, shelfLife: 2 },
  { id: 'suongSao', name: 'SƯƠNG SÁO', icon: '⬛', cost: 2000, price: 5000, shelfLife: 2 },
  { id: 'dauDo', name: 'ĐẬU ĐỎ', icon: '🫘', cost: 2500, price: 6000, shelfLife: 3 },
  { id: 'thachDua', name: 'THẠCH DỪA', icon: '🥥', cost: 2000, price: 5000, shelfLife: 3 },
  { id: 'nhaDam', name: 'NHA ĐAM', icon: '🌱', cost: 2200, price: 5000, shelfLife: 3 },
  { id: 'thachDen', name: 'THẠCH ĐEN', icon: '🟫', cost: 2000, price: 5000, shelfLife: 2 },
  { id: 'dauXanh', name: 'ĐẬU XANH', icon: '🟢', cost: 2500, price: 6000, shelfLife: 3 },
  { id: 'hatChia', name: 'HẠT CHIA', icon: '⚫', cost: 2000, price: 5000, shelfLife: 3 }
];

const SYRUPS = [
  { id: 'dau', name: 'DÂU', icon: '🍓', color: '#E53E3E', cost: 2000, price: 5000, shelfLife: 4 },
  { id: 'dao', name: 'ĐÀO', icon: '🍑', color: '#FB7185', cost: 2000, price: 5000, shelfLife: 4 },
  { id: 'nho', name: 'NHO', icon: '🍇', color: '#7E22CE', cost: 2000, price: 5000, shelfLife: 4 },
  { id: 'xoai', name: 'XOÀI', icon: '🥭', color: '#EAB308', cost: 2000, price: 5000, shelfLife: 4 },
  { id: 'kiwi', name: 'KIWI', icon: '🥝', color: '#22C55E', cost: 2000, price: 5000, shelfLife: 4 },
  { id: 'tao', name: 'TÁO', icon: '🍎', color: '#EF4444', cost: 2000, price: 5000, shelfLife: 4 },
  { id: 'vietQuat', name: 'VIỆT QUẤT', icon: '🫐', color: '#2563EB', cost: 2500, price: 6000, shelfLife: 4 },
  { id: 'vai', name: 'VẢI', icon: '🍈', color: '#F472B6', cost: 2200, price: 6000, shelfLife: 4 },
  { id: 'chanhDay', name: 'CHANH DÂY', icon: '🍋', color: '#CA8A04', cost: 2200, price: 6000, shelfLife: 4 }
];

const CUSTOMERS = [
  { id: 'piglet', name: 'Bé Heo', avatar: 'piglet' },
  { id: 'girl', name: 'Bé Na', avatar: 'girl' },
  { id: 'cat', name: 'Khánh An', avatar: 'cat' },
  { id: 'boy', name: 'Anh Minh', avatar: 'boy' },
  { id: 'cozy', name: 'Cô Lan', avatar: 'cozy' },
  { id: 'turtle', name: 'Bé Rùa', avatar: 'turtle' }
];

// ================= 2B. CƠ CHẾ BẾP MÌ CAY (CHUẨN 100% YÊU CẦU: TAP ĐỎ ➔ XANH) =================
const NOODLE_DISHES = [
  {
    id: 'kimchi',
    name: 'Mì Cay Kim Chi',
    icon: '🍲',
    themeColor: '#E11D48',
    soupColor: '#DC2626',
    price: 45000,
    ingredients: [
      { id: 'mi', name: 'Mì Hàn Quốc', icon: '🍜', isBase: true },
      { id: 'kimchi', name: 'Kim Chi', icon: '🥬', isBase: true },
      { id: 'bomy', name: 'Bò Mỹ', icon: '🥩', isBase: false },
      { id: 'xucxich', name: 'Xúc xích', icon: '🌭', isBase: true },
      { id: 'rau', name: 'Rau cải', icon: '🥗', isBase: true },
      { id: 'nam', name: 'Nấm', icon: '🍄', isBase: true },
      { id: 'trung', name: 'Trứng', icon: '🥚', isBase: false },
      { id: 'ot', name: 'Ớt cay', icon: '🌶️', isBase: false, isSpice: true }
    ]
  },
  {
    id: 'tomyum',
    name: 'Mì Cay Tom Yum',
    icon: '🦐',
    themeColor: '#EA580C',
    soupColor: '#EA580C',
    price: 52000,
    ingredients: [
      { id: 'mi', name: 'Mì Hàn Quốc', icon: '🍜', isBase: true },
      { id: 'nuoc_tomyum', name: 'Súp Tom Yum', icon: '🥣', isBase: true },
      { id: 'tom', name: 'Tôm sú', icon: '🦐', isBase: true },
      { id: 'muc', name: 'Mực ống', icon: '🦑', isBase: true },
      { id: 'cachua', name: 'Cà chua', icon: '🍅', isBase: true },
      { id: 'nam', name: 'Nấm rơm', icon: '🍄', isBase: true },
      { id: 'bomy', name: 'Bò Mỹ', icon: '🥩', isBase: false },
      { id: 'ot', name: 'Ớt cay', icon: '🌶️', isBase: false, isSpice: true }
    ]
  },
  {
    id: 'tuongden',
    name: 'Mì Tương Đen',
    icon: '🥣',
    themeColor: '#451A03',
    soupColor: '#27170E',
    price: 48000,
    ingredients: [
      { id: 'mi', name: 'Mì sợi tươi', icon: '🍜', isBase: true },
      { id: 'sot_tuongden', name: 'Sốt tương đen', icon: '🥣', isBase: true },
      { id: 'thitheo', name: 'Thịt ba chỉ', icon: '🥩', isBase: true },
      { id: 'dualeo', name: 'Dưa leo sợi', icon: '🥒', isBase: true },
      { id: 'trungcut', name: 'Trứng cút', icon: '🥚', isBase: true },
      { id: 'cucaivang', name: 'Củ cải vàng', icon: '🥔', isBase: false },
      { id: 'kimchi_side', name: 'Kim chi kèm', icon: '🥬', isBase: false }
    ]
  }
];

// Hàm vẽ Thố Đá Dolsot Hàn Quốc sôi bốc khói bằng SVG
function renderDolsotPotSvg(dish, selectedIngs, isDone) {
  const soupColor = dish ? dish.soupColor : '#DC2626';
  const hasNoodles = selectedIngs.includes('mi');
  const hasMeat = selectedIngs.some(i => ['bomy', 'thitheo', 'xucxich'].includes(i));
  const hasKimchi = selectedIngs.includes('kimchi') || selectedIngs.includes('kimchi_side');
  const hasSeafood = selectedIngs.includes('tom') || selectedIngs.includes('muc');
  const hasEgg = selectedIngs.includes('trung') || selectedIngs.includes('trungcut');
  const hasVeggies = selectedIngs.includes('rau') || selectedIngs.includes('cachua') || selectedIngs.includes('dualeo');

  return `
    <svg viewBox="0 0 200 110" width="100%" height="100%" class="dolsot-pot-svg">
      <defs>
        <!-- Lửa hoặc đế kim loại nóng -->
        <linearGradient id="potStoneGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#2D2D2D"/>
          <stop offset="60%" stop-color="#1A1A1A"/>
          <stop offset="100%" stop-color="#0A0A0A"/>
        </linearGradient>
        <radialGradient id="soupGrad" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stop-color="${dish?.id === 'tuongden' ? '#3B1F0E' : (dish?.id === 'tomyum' ? '#FB923C' : '#EF4444')}"/>
          <stop offset="70%" stop-color="${soupColor}"/>
          <stop offset="100%" stop-color="#180803"/>
        </radialGradient>
      </defs>

      <!-- Bóng đổ đáy thố -->
      <ellipse cx="100" cy="100" rx="85" ry="8" fill="rgba(0,0,0,0.55)"/>

      <!-- Thân thố đá Hàn Quốc (Dolsot) -->
      <path d="M22 42 Q20 85 55 96 Q100 102 145 96 Q180 85 178 42 Z" 
            fill="url(#potStoneGrad)" stroke="#EAB308" stroke-width="2.5"/>

      <!-- Quai thố đá hai bên -->
      <path d="M16 48 Q8 54 18 64" fill="none" stroke="#A1A1AA" stroke-width="4" stroke-linecap="round"/>
      <path d="M184 48 Q192 54 182 64" fill="none" stroke="#A1A1AA" stroke-width="4" stroke-linecap="round"/>

      <!-- Vành miệng thố đá -->
      <ellipse cx="100" cy="42" rx="78" ry="18" fill="#171717" stroke="#CA8A04" stroke-width="2"/>

      <!-- Nước dùng / súp mì cay sôi -->
      <ellipse cx="100" cy="43" rx="72" ry="15" fill="url(#soupGrad)"/>

      <!-- Váng dầu cay / bọt sôi -->
      <ellipse cx="75" cy="44" rx="14" ry="4" fill="rgba(255,255,255,0.22)"/>
      <ellipse cx="125" cy="42" rx="18" ry="5" fill="rgba(255,255,255,0.18)"/>
      <circle cx="95" cy="40" r="3" fill="#FEF08A" opacity="0.6"/>
      <circle cx="112" cy="45" r="2.5" fill="#FEF08A" opacity="0.5"/>
      <circle cx="68" cy="41" r="2" fill="#FEF08A" opacity="0.6"/>

      <!-- Nét vẽ nguyên liệu nổi trong thố -->
      ${hasNoodles ? `
        <!-- Sợi mì xoăn vàng óng -->
        <path d="M60 44 Q75 48 90 43 Q105 48 120 42 Q135 46 145 42" stroke="#FDE047" stroke-width="3" fill="none"/>
        <path d="M70 47 Q85 43 100 48 Q115 44 130 47" stroke="#FACC15" stroke-width="2.5" fill="none"/>
      ` : ''}

      ${hasKimchi ? `
        <!-- Miếng kim chi đỏ au -->
        <rect x="52" y="38" width="18" height="9" rx="3" fill="#DC2626" stroke="#991B1B" stroke-width="1" transform="rotate(-8 52 38)"/>
      ` : ''}

      ${hasMeat ? `
        <!-- Lát thịt bò / xúc xích -->
        <rect x="125" y="38" width="22" height="8" rx="4" fill="#B91C1C" stroke="#7F1D1D" stroke-width="1" transform="rotate(12 125 38)"/>
        <ellipse cx="136" cy="42" rx="4" ry="2" fill="#FCA5A5" opacity="0.8"/>
      ` : ''}

      ${hasSeafood ? `
        <!-- Tôm / Mực hải sản -->
        <path d="M128 35 Q140 32 142 42" stroke="#FB923C" stroke-width="4" fill="none" stroke-linecap="round"/>
      ` : ''}

      ${hasEgg ? `
        <!-- Trứng gà / trứng cút lòng đào -->
        <circle cx="100" cy="42" r="7" fill="#FFF"/>
        <circle cx="100" cy="42" r="4.2" fill="#F59E0B"/>
      ` : ''}

      ${hasVeggies ? `
        <!-- Lá rau cải xanh / dưa leo -->
        <ellipse cx="80" cy="45" rx="9" ry="4" fill="#22C55E" transform="rotate(-15 80 45)"/>
      ` : ''}

      <!-- Biểu tượng hoàn thành lấp lánh nếu đã xong -->
      ${isDone ? `
        <circle cx="100" cy="20" r="14" fill="#22C55E" stroke="#FFF" stroke-width="2"/>
        <text x="100" y="25" font-size="14" font-weight="bold" fill="#FFF" text-anchor="middle">✓</text>
      ` : ''}
    </svg>
  `;
}


// ================= 3. TRẠNG THÁI GAME =================
class GameState {
  constructor() {
    this.shopName = 'Tiệm Trà Sữa Của Rùa';
    this.day = 12;
    this.money = 1990000;
    this.rating = 4.8;
    this.inventoryLots = {};
    this.initDefaultInventoryLots();
    this.load();
    this.ensureAllItemsHaveInventory();
  }

  initDefaultInventoryLots() {
    const addInitial = (id, count, cost, shelf) => {
      this.inventoryLots[id] = [
        { id: 'lot_1_' + id, qty: Math.ceil(count * 0.5), buyDay: 1, expireDay: shelf >= 900 ? 999 : 14, cost },
        { id: 'lot_2_' + id, qty: Math.floor(count * 0.5), buyDay: 1, expireDay: shelf >= 900 ? 999 : 16, cost }
      ];
    };
    CUPS.forEach(c => addInitial('cup' + c.id, 60, c.cost, c.shelfLife));
    TEAS.forEach(t => addInitial(t.id, 50, t.cost, t.shelfLife));
    TOPPINGS.forEach(tp => addInitial(tp.id, 45, tp.cost, tp.shelfLife));
    SYRUPS.forEach(s => addInitial(s.id, 40, s.cost, s.shelfLife));
  }

  ensureAllItemsHaveInventory() {
    CUPS.forEach(c => {
      const k = 'cup' + c.id;
      if (!this.inventoryLots[k] || this.inventoryLots[k].length === 0) {
        this.inventoryLots[k] = [{ id: 'lot_def_' + k, qty: 50, buyDay: this.day, expireDay: 999, cost: c.cost }];
      }
    });
    TEAS.forEach(t => {
      if (!this.inventoryLots[t.id] || this.inventoryLots[t.id].length === 0) {
        this.inventoryLots[t.id] = [{ id: 'lot_def_' + t.id, qty: 40, buyDay: this.day, expireDay: this.day + 2, cost: t.cost }];
      }
    });
    TOPPINGS.forEach(tp => {
      if (!this.inventoryLots[tp.id] || this.inventoryLots[tp.id].length === 0) {
        this.inventoryLots[tp.id] = [{ id: 'lot_def_' + tp.id, qty: 35, buyDay: this.day, expireDay: this.day + 2, cost: tp.cost }];
      }
    });
    SYRUPS.forEach(s => {
      if (!this.inventoryLots[s.id] || this.inventoryLots[s.id].length === 0) {
        this.inventoryLots[s.id] = [{ id: 'lot_def_' + s.id, qty: 30, buyDay: this.day, expireDay: this.day + 4, cost: s.cost }];
      }
    });
  }

  save() {
    try {
      const data = {
        shopName: this.shopName, day: this.day, money: this.money, rating: this.rating,
        inventoryLots: this.inventoryLots
      };
      localStorage.setItem('tiemTraSuaRua_save_v6', JSON.stringify(data));
    } catch (e) {}
  }

  load() {
    try {
      const str = localStorage.getItem('tiemTraSuaRua_save_v6');
      if (str) Object.assign(this, JSON.parse(str));
    } catch (e) {}
  }

  getTotalQty(itemId) {
    const lots = this.inventoryLots[itemId] || [];
    return lots.reduce((sum, l) => sum + (l.qty || 0), 0);
  }

  consumeItem(itemId, qty = 1) {
    const lots = this.inventoryLots[itemId];
    if (!lots || lots.length === 0) return false;
    lots.sort((a, b) => a.expireDay - b.expireDay);
    let needed = qty;
    for (let i = 0; i < lots.length; i++) {
      const lot = lots[i];
      if (lot.qty <= needed) {
        needed -= lot.qty;
        lot.qty = 0;
      } else {
        lot.qty -= needed;
        needed = 0;
        break;
      }
    }
    this.inventoryLots[itemId] = lots.filter(l => l.qty > 0);
    this.save();
    return true;
  }
}

const state = new GameState();

// ================= 4. BỘ ĐỒ HOẠ SVG CHIBI VÀ CHI TIẾT GAME =================

// Chibi avatar khách hàng
function renderCustomerAvatarSvg(avatarType) {
  if (avatarType === 'piglet') {
    return `
      <svg viewBox="0 0 70 70" class="chibi-avatar-svg">
        <!-- Tai heo hồng -->
        <ellipse cx="18" cy="18" rx="8" ry="7" fill="#F472B6" stroke="#DB2777" stroke-width="2"/>
        <ellipse cx="18" cy="18" rx="4" ry="3.5" fill="#FBCFE8"/>
        <ellipse cx="52" cy="18" rx="8" ry="7" fill="#F472B6" stroke="#DB2777" stroke-width="2"/>
        <ellipse cx="52" cy="18" rx="4" ry="3.5" fill="#FBCFE8"/>
        <!-- Đầu mũ heo -->
        <circle cx="35" cy="38" r="26" fill="#FDF2F8" stroke="#DB2777" stroke-width="2.5"/>
        <!-- Tóc đen anime -->
        <path d="M18 36 Q35 20 52 36 Q35 30 18 36 Z" fill="#3D2214"/>
        <!-- Mắt long lanh -->
        <circle cx="26" cy="38" r="3.2" fill="#18181B"/><circle cx="25" cy="36.5" r="1.2" fill="#FFF"/>
        <circle cx="44" cy="38" r="3.2" fill="#18181B"/><circle cx="43" cy="36.5" r="1.2" fill="#FFF"/>
        <!-- Mũi heo nhỏ xinh -->
        <ellipse cx="35" cy="44" rx="5.5" ry="3.8" fill="#F472B6" stroke="#DB2777" stroke-width="1.2"/>
        <circle cx="33" cy="44" r="0.9" fill="#9D174D"/>
        <circle cx="37" cy="44" r="0.9" fill="#9D174D"/>
        <!-- Má hồng -->
        <circle cx="20" cy="42" r="3.5" fill="#FDA4AF" opacity="0.8"/>
        <circle cx="50" cy="42" r="3.5" fill="#FDA4AF" opacity="0.8"/>
      </svg>
    `;
  }
  if (avatarType === 'cat') {
    return `
      <svg viewBox="0 0 70 70" class="chibi-avatar-svg">
        <!-- Tai mèo -->
        <polygon points="14,24 24,10 32,22" fill="#FDE047" stroke="#CA8A04" stroke-width="2"/>
        <polygon points="17,22 24,14 30,21" fill="#FEF08A"/>
        <polygon points="56,24 46,10 38,22" fill="#FDE047" stroke="#CA8A04" stroke-width="2"/>
        <polygon points="53,22 46,14 40,21" fill="#FEF08A"/>
        <!-- Khuôn mặt -->
        <circle cx="35" cy="38" r="25" fill="#FEF9C3" stroke="#CA8A04" stroke-width="2.2"/>
        <!-- Mắt mèo -->
        <ellipse cx="27" cy="36" rx="3.5" ry="4" fill="#0F172A"/><circle cx="26" cy="34.5" r="1.2" fill="#FFF"/>
        <ellipse cx="43" cy="36" rx="3.5" ry="4" fill="#0F172A"/><circle cx="42" cy="34.5" r="1.2" fill="#FFF"/>
        <!-- Miệng mèo -->
        <path d="M32 44 Q35 46 38 44" stroke="#854D0E" stroke-width="1.6" fill="none"/>
        <circle cx="20" cy="41" r="3" fill="#FCA5A5" opacity="0.75"/>
        <circle cx="50" cy="41" r="3" fill="#FCA5A5" opacity="0.75"/>
      </svg>
    `;
  }
  if (avatarType === 'boy') {
    return `
      <svg viewBox="0 0 70 70" class="chibi-avatar-svg">
        <!-- Mũ lưỡi trai xanh -->
        <path d="M12 28 Q35 12 58 28 L64 32 L44 32 Z" fill="#3B82F6" stroke="#1D4ED8" stroke-width="2"/>
        <!-- Mặt -->
        <circle cx="35" cy="40" r="24" fill="#FFEDD5" stroke="#EA580C" stroke-width="2"/>
        <!-- Kính mắt tròn ngố -->
        <circle cx="26" cy="39" r="6" fill="none" stroke="#334155" stroke-width="1.8"/>
        <circle cx="44" cy="39" r="6" fill="none" stroke="#334155" stroke-width="1.8"/>
        <line x1="32" y1="39" x2="38" y2="39" stroke="#334155" stroke-width="1.8"/>
        <circle cx="26" cy="39" r="2.5" fill="#0F172A"/><circle cx="25" cy="37.5" r="0.8" fill="#FFF"/>
        <circle cx="44" cy="39" r="2.5" fill="#0F172A"/><circle cx="43" cy="37.5" r="0.8" fill="#FFF"/>
        <!-- Nụ cười -->
        <path d="M31 48 Q35 52 39 48" stroke="#C2410C" stroke-width="1.8" fill="none"/>
      </svg>
    `;
  }
  // Bé Na / Mặc định: bé gái tóc hai chùm xinh xắn
  return `
    <svg viewBox="0 0 70 70" class="chibi-avatar-svg">
      <!-- Nơ đỏ -->
      <circle cx="16" cy="18" r="6" fill="#EF4444" stroke="#B91C1C" stroke-width="1.5"/>
      <circle cx="54" cy="18" r="6" fill="#EF4444" stroke="#B91C1C" stroke-width="1.5"/>
      <!-- Tóc hai bên -->
      <circle cx="15" cy="28" r="9" fill="#451A03"/>
      <circle cx="55" cy="28" r="9" fill="#451A03"/>
      <!-- Khuôn mặt tròn baby -->
      <circle cx="35" cy="38" r="24" fill="#FFF1F2" stroke="#FDA4AF" stroke-width="2"/>
      <!-- Tóc mái ngố -->
      <path d="M16 32 Q35 20 54 32 Q35 26 16 32 Z" fill="#451A03"/>
      <!-- Đôi mắt to tròn long lanh -->
      <ellipse cx="26" cy="38" rx="3.8" ry="4.5" fill="#18181B"/>
      <circle cx="24.5" cy="36" r="1.5" fill="#FFF"/>
      <circle cx="27.5" cy="40" r="0.8" fill="#FFF"/>
      <ellipse cx="44" cy="38" rx="3.8" ry="4.5" fill="#18181B"/>
      <circle cx="42.5" cy="36" r="1.5" fill="#FFF"/>
      <circle cx="45.5" cy="40" r="0.8" fill="#FFF"/>
      <!-- Má hồng tròn xoe -->
      <circle cx="20" cy="43" r="3.5" fill="#FB7185" opacity="0.8"/>
      <circle cx="50" cy="43" r="3.5" fill="#FB7185" opacity="0.8"/>
      <!-- Nụ cười -->
      <path d="M32 45 Q35 48 38 45" stroke="#E11D48" stroke-width="1.6" fill="none"/>
    </svg>
  `;
}

// ================= 4. BỘ ĐỒ HOẠ SVG CHIBI VÀ CHI TIẾT GAME (CHUẨN ANIME COZY CAFE ẢNH 2) =================

// 0. Cọc ly giấy/nhựa xếp chồng (Takeaway Cup Stacks - Ly M & Ly L)
function renderCupStackSvg(size, qty, isActive) {
  const isL = size === 'L';
  const label = size;
  const rimSteps = isL ? [14, 19, 24, 29, 34, 39, 44, 49] : [20, 26, 32, 38, 44, 50];
  const topY = isL ? 12 : 18;
  const bottomY = 88;

  return `
    <svg viewBox="0 0 65 95" width="100%" height="100%" class="vivid-svg ${isActive ? 'cup-stack-active' : ''}">
      <defs>
        <linearGradient id="cupStackGrad_${size}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#FFFFFF"/>
          <stop offset="30%" stop-color="#F8FAFC"/>
          <stop offset="75%" stop-color="#E2E8F0"/>
          <stop offset="100%" stop-color="#CBD5E1"/>
        </linearGradient>
        <linearGradient id="cupRimGrad_${size}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#FFFFFF"/>
          <stop offset="50%" stop-color="#F1F5F9"/>
          <stop offset="100%" stop-color="#94A3B8"/>
        </linearGradient>
      </defs>

      <!-- Bóng đổ dưới đế cọc ly -->
      <ellipse cx="32.5" cy="91" rx="20" ry="3.5" fill="rgba(61, 34, 20, 0.22)"/>

      <!-- Thân cọc ly giấy xếp chồng -->
      <path d="M14 ${topY} L19 ${bottomY - 4} Q20 ${bottomY} 32.5 ${bottomY} Q45 ${bottomY} 46 ${bottomY - 4} L51 ${topY} Z" 
            fill="url(#cupStackGrad_${size})" stroke="#3A2012" stroke-width="1.8" stroke-linejoin="round"/>

      <!-- Các gờ vành ly xếp lồng nhau -->
      ${rimSteps.map(y => `
        <ellipse cx="32.5" cy="${y}" rx="${17 + (y - 12) * 0.05}" ry="3.2" fill="url(#cupRimGrad_${size})" stroke="#3A2012" stroke-width="1.3"/>
        <line x1="${16 + (y - 12) * 0.05}" y1="${y}" x2="${49 - (y - 12) * 0.05}" y2="${y}" stroke="rgba(255,255,255,0.85)" stroke-width="1"/>
      `).join('')}

      <!-- Vành mép ly ngoài cùng ở thân dưới -->
      <ellipse cx="32.5" cy="56" rx="16" ry="3.2" fill="url(#cupRimGrad_${size})" stroke="#3A2012" stroke-width="1.5"/>

      <!-- Tem tròn in size M hoặc L phong cách cà phê retro -->
      <circle cx="32.5" cy="72" r="9.5" fill="#FFFDF8" stroke="#3A2012" stroke-width="1.6"/>
      <circle cx="32.5" cy="72" r="8" fill="${isActive ? '#DCFCE7' : '#F8FAFC'}" stroke="${isActive ? '#16A34A' : '#E2E8F0'}" stroke-width="0.8"/>
      <text x="32.5" y="76.2" font-family="'Paytone One', 'Nunito', sans-serif" font-size="11.5" font-weight="900" fill="${isActive ? '#15803D' : '#3A2012'}" text-anchor="middle">${label}</text>

      <!-- Huy hiệu số lượng tồn kho tròn ở trên (Chuẩn ảnh 2) -->
      <circle cx="50" cy="11" r="8.5" fill="#FFFDF8" stroke="#3A2012" stroke-width="1.5"/>
      <text x="50" y="14.2" font-family="'Nunito', sans-serif" font-size="8.5" font-weight="900" fill="#3A2012" text-anchor="middle">${qty}</text>
    </svg>
  `;
}

// 1. Bình trà thuỷ tinh nắp bạc và vòi rót kim loại (Chuẩn Ảnh 2)
function renderDispenserSvg(t, isSelected, qty, isPouring = false) {
  return `
    <svg viewBox="0 0 68 105" width="100%" height="100%" class="vivid-svg ${isPouring ? 'anim-pouring' : ''}">
      <defs>
        <!-- Nắp kim loại chrome sáng bóng -->
        <linearGradient id="lid_${t.id}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#E2E8F0"/>
          <stop offset="25%" stop-color="#FFFFFF"/>
          <stop offset="65%" stop-color="#CBD5E1"/>
          <stop offset="100%" stop-color="#64748B"/>
        </linearGradient>
        
        <!-- Màu nước trà sóng sánh đa tầng -->
        <linearGradient id="teaGrad_${t.id}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="${t.liquid}" stop-opacity="0.9"/>
          <stop offset="35%" stop-color="${t.liquid}"/>
          <stop offset="70%" stop-color="${t.liquid}" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="${t.liquid}" stop-opacity="0.85"/>
        </linearGradient>

        <linearGradient id="spigotGrad_${t.id}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#94A3B8"/>
          <stop offset="50%" stop-color="#E2E8F0"/>
          <stop offset="100%" stop-color="#475569"/>
        </linearGradient>
      </defs>

      <!-- Bóng đổ bình -->
      <ellipse cx="34" cy="92" rx="22" ry="3.5" fill="rgba(61, 34, 20, 0.18)"/>

      <!-- Nắp vòm kim loại có núm tròn phía trên -->
      <circle cx="34" cy="7" r="4" fill="url(#lid_${t.id})" stroke="#3A2012" stroke-width="1.3"/>
      <circle cx="32.8" cy="5.8" r="1.2" fill="#FFF" opacity="0.9"/>
      <path d="M14 17 C14 10, 54 10, 54 17 L51 22 L17 22 Z" fill="url(#lid_${t.id})" stroke="#3A2012" stroke-width="1.5" stroke-linejoin="round"/>
      <line x1="18" y1="17" x2="50" y2="17" stroke="#FFF" stroke-width="1.2" opacity="0.8"/>

      <!-- Thân bình thuỷ tinh trong suốt dày dặn -->
      <rect x="10" y="21" width="48" height="65" rx="6" fill="rgba(255, 255, 255, 0.55)" stroke="#3A2012" stroke-width="1.7"/>

      <!-- Nước trà bên trong có mặt nước uốn lượn -->
      <path d="M12 34 Q23 31 34 34 T56 34 L56 80 Q56 84 51 84 L17 84 Q12 84 12 80 Z" fill="url(#teaGrad_${t.id})"/>
      <path d="M12.5 34.5 Q23 32 34 34.5 T55.5 34.5" stroke="rgba(255, 255, 255, 0.7)" stroke-width="1.5" fill="none"/>

      <!-- Vệt phản quang ánh sáng thuỷ tinh hai bên -->
      <path d="M14 25 L14 78" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" opacity="0.75"/>
      <path d="M18 27 L18 40" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round" opacity="0.5"/>

      <!-- Nhãn giấy vintage cổ điển ở giữa bình (Chuẩn Ảnh 2) -->
      <rect x="9" y="47" width="50" height="23" rx="3" fill="#FFFDF8" stroke="#3A2012" stroke-width="1.5"/>
      <rect x="11" y="49" width="46" height="19" rx="1.8" fill="none" stroke="#D5B084" stroke-width="0.8"/>
      <text x="34" y="62" font-family="'Paytone One', 'Nunito', sans-serif" font-size="8.2" font-weight="900" fill="#3A2012" text-anchor="middle" letter-spacing="0.01em">${t.name}</text>

      <!-- Vòi rót kim loại inox / chrome ở đáy -->
      <g class="spigot-assembly ${isPouring ? 'spout-open' : ''}">
        <!-- Cổ nối vòi -->
        <rect x="28" y="85" width="12" height="6" rx="1.5" fill="url(#spigotGrad_${t.id})" stroke="#3A2012" stroke-width="1.2"/>
        <!-- Đầu vòi chúc xuống -->
        <path d="M31 90 L37 90 L36 98 L32 98 Z" fill="#334155" stroke="#3A2012" stroke-width="1.2"/>
        <!-- Núm xoay vòi kim loại -->
        <circle cx="34" cy="88" r="2.5" fill="#E2E8F0" stroke="#3A2012" stroke-width="1"/>
        <line x1="34" y1="88" x2="${isPouring ? 41 : 34}" y2="${isPouring ? 94 : 83}" stroke="#EF4444" stroke-width="2" stroke-linecap="round"/>
        ${isPouring ? `
          <!-- Dòng nước trà đang rót xuống -->
          <path d="M34 98 L34 104" stroke="${t.liquid}" stroke-width="2.8" stroke-linecap="round"/>
          <circle cx="34" cy="104" r="1.5" fill="${t.liquid}"/>
        ` : ''}
      </g>

      <!-- Huy hiệu số lượng tồn kho tròn ở góc phải trên (Chuẩn Ảnh 2) -->
      <circle cx="54" cy="11" r="8" fill="#FFFDF8" stroke="#3A2012" stroke-width="1.4"/>
      <text x="54" y="14" font-family="'Nunito', sans-serif" font-size="8" font-weight="900" fill="#3A2012" text-anchor="middle">${qty}</text>
    </svg>
  `;
}

// 2. Máy dập nắp ly trà sữa Retro (Chuẩn Máy Dập Ảnh 2)
function renderSealerMachineSvg(isSealing, isReady) {
  return `
    <svg viewBox="0 0 76 105" width="100%" height="100%" class="vivid-svg ${isSealing ? 'anim-stamping' : ''}">
      <defs>
        <linearGradient id="sealerBodyGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#F58748"/>
          <stop offset="40%" stop-color="#E26A2C"/>
          <stop offset="85%" stop-color="#C2410C"/>
          <stop offset="100%" stop-color="#9A3412"/>
        </linearGradient>
        <linearGradient id="sealerPanelGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FFFDF8"/>
          <stop offset="100%" stop-color="#F3E8DB"/>
        </linearGradient>
      </defs>

      <!-- Bóng máy dập -->
      <ellipse cx="38" cy="100" rx="28" ry="3.5" fill="rgba(61, 34, 20, 0.22)"/>

      <!-- Khung thân máy chính retro cam ấm -->
      <path d="M9 25 C9 19, 67 19, 67 25 L64 96 L12 96 Z" fill="url(#sealerBodyGrad)" stroke="#3A2012" stroke-width="1.8" stroke-linejoin="round"/>

      <!-- Mái vòm trong suốt hiển thị cuộn màng dập bên trong (Chuẩn Ảnh 2) -->
      <rect x="16" y="7" width="44" height="22" rx="7" fill="#FEF3C7" stroke="#3A2012" stroke-width="1.5"/>
      <g class="film-roll ${isSealing ? 'anim-spin' : ''}">
        <circle cx="27" cy="18" r="7" fill="#F472B6" stroke="#9D174D" stroke-width="1.1"/>
        <circle cx="49" cy="18" r="7" fill="#F472B6" stroke="#9D174D" stroke-width="1.1"/>
        <line x1="27" y1="18" x2="49" y2="18" stroke="#FBCFE8" stroke-width="2.5"/>
        <text x="38" y="21" font-size="7.5" text-anchor="middle">🌸🌸</text>
      </g>

      <!-- Bảng điều khiển màu kem cổ điển -->
      <rect x="16" y="33" width="44" height="33" rx="4" fill="url(#sealerPanelGrad)" stroke="#3A2012" stroke-width="1.5"/>

      <!-- Màn hình LED nhỏ báo nhiệt độ -->
      <rect x="20" y="37" width="18" height="10" rx="2" fill="#18181B" stroke="#3A2012" stroke-width="0.8"/>
      <text x="29" y="44.8" font-family="'Nunito', monospace" font-size="6.8" font-weight="900" fill="#4ADE80" text-anchor="middle">165°</text>

      <!-- Đèn báo trạng thái READY -->
      <circle cx="44" cy="42" r="2.8" fill="${isReady ? '#22C55E' : '#64748B'}" stroke="#3A2012" stroke-width="0.8"/>
      <text x="52" y="44.2" font-family="'Nunito', sans-serif" font-size="5.5" font-weight="900" fill="#3A2012">OK</text>

      <!-- Nút bấm dập nắp to nổi bật -->
      <rect x="20" y="50" width="36" height="12" rx="2.8" fill="${isReady ? '#22C55E' : '#475569'}" stroke="#3A2012" stroke-width="1.2"/>
      <text x="38" y="58.5" font-family="'Paytone One', 'Nunito', sans-serif" font-size="6.5" font-weight="900" fill="#FFF" text-anchor="middle">DẬP NẮP</text>

      <!-- Trục dập nắp kim loại trượt lên xuống -->
      <rect x="26" y="68" width="24" height="${isSealing ? 20 : 10}" rx="1.8" fill="#94A3B8" stroke="#3A2012" stroke-width="1.3"/>

      <!-- Khay trượt chứa ly ở đáy -->
      <ellipse cx="38" cy="94" rx="22" ry="5.5" fill="#E2E8F0" stroke="#3A2012" stroke-width="1.5"/>
      <ellipse cx="38" cy="94" rx="14" ry="3.5" fill="#94A3B8" stroke="#3A2012" stroke-width="1"/>
    </svg>
  `;
}

// 3. Khay Topping Inox Gastronorm (Chuẩn Khay Buffet Inox Đẹp Như Ảnh 2)
function renderToppingSvg(tp, inCup, qty) {
  return `
    <svg viewBox="0 0 88 80" width="100%" height="100%" class="vivid-svg ${inCup ? 'bounce-in' : ''}">
      <defs>
        <!-- Viền Inox kim loại sáng bóng của khay chuẩn nhà hàng -->
        <linearGradient id="metalRimGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#FFFFFF"/>
          <stop offset="25%" stop-color="#E2E8F0"/>
          <stop offset="60%" stop-color="#94A3B8"/>
          <stop offset="85%" stop-color="#CBD5E1"/>
          <stop offset="100%" stop-color="#64748B"/>
        </linearGradient>

        <!-- Lòng khay sâu có bóng đổ bên trong -->
        <linearGradient id="panInnerGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1E293B"/>
          <stop offset="100%" stop-color="#334155"/>
        </linearGradient>
      </defs>

      <!-- Bóng đổ khay -->
      <rect x="3" y="4" width="82" height="73" rx="7" fill="rgba(61, 34, 20, 0.22)"/>

      <!-- Vành khay Inox kim loại kép bo góc (Chuẩn Ảnh 2) -->
      <rect x="2" y="2" width="84" height="74" rx="7" fill="url(#metalRimGrad)" stroke="#3A2012" stroke-width="1.8"/>
      
      <!-- Gờ viền trong của khay Inox -->
      <rect x="4.5" y="4.5" width="79" height="69" rx="5" fill="#F8FAFC" stroke="#94A3B8" stroke-width="0.8"/>
      
      <!-- Lòng khay sâu chứa topping -->
      <rect x="6" y="6" width="76" height="52" rx="4" fill="url(#panInnerGrad)"/>
      <rect x="6" y="6" width="76" height="52" rx="4" fill="rgba(0,0,0,0.2)"/>

      <!-- Hình ảnh món ăn Topping cực kỳ ngon mắt và chi tiết -->
      ${renderFoodGraphics(tp.id)}

      <!-- Thẻ tên nguyên liệu kiểu vintage bên dưới (Chuẩn Ảnh 2) -->
      <rect x="6" y="58" width="76" height="17" rx="3" fill="#FFFDF8" stroke="#3A2012" stroke-width="1.4"/>
      <text x="44" y="69.8" font-family="'Paytone One', 'Nunito', sans-serif" font-size="7.6" font-weight="900" fill="#3A2012" text-anchor="middle" letter-spacing="0.01em">${tp.name}</text>

      <!-- Huy hiệu số lượng tròn phong cách anime Image 2 -->
      <circle cx="74" cy="11" r="8" fill="#FFFDF8" stroke="#3A2012" stroke-width="1.4"/>
      <text x="74" y="14" font-family="'Nunito', sans-serif" font-size="8" font-weight="900" fill="#3A2012" text-anchor="middle">${qty}</text>
    </svg>
  `;
}

// Đồ hoạ món ăn chi tiết từng loại Topping (THỰC TẾ, TỰ NHIÊN, KHÔNG KHỐI HỘP MINECRAFT)
function renderFoodGraphics(id) {
  // 1. Trân châu đen óng ánh ngập siro đường đen (Black Tapioca Boba)
  if (id === 'tranChau') {
    return `
      <g>
        <!-- Lớp siro đường đen sâu ở đáy -->
        <path d="M8 48 C16 42, 28 44, 44 42 C60 40, 72 44, 80 48 L80 54 L8 54 Z" fill="#120A05"/>
        <ellipse cx="44" cy="46" rx="34" ry="7" fill="#201108" opacity="0.8"/>
        
        <!-- Lớp hạt trân châu tự nhiên dày đặc đan xen -->
        <circle cx="16" cy="40" r="6.2" fill="#1A110B"/><circle cx="14.5" cy="38.5" r="1.8" fill="#FFF" opacity="0.85"/>
        <circle cx="28" cy="42" r="6.5" fill="#150D08"/><circle cx="26.5" cy="40.5" r="1.8" fill="#FFF" opacity="0.9"/>
        <circle cx="41" cy="43" r="6.8" fill="#1A110B"/><circle cx="39.5" cy="41.2" r="2" fill="#FFF" opacity="0.95"/>
        <circle cx="55" cy="42" r="6.5" fill="#150D08"/><circle cx="53.5" cy="40.5" r="1.8" fill="#FFF" opacity="0.9"/>
        <circle cx="68" cy="40" r="6.2" fill="#1A110B"/><circle cx="66.5" cy="38.5" r="1.8" fill="#FFF" opacity="0.85"/>

        <circle cx="13" cy="29" r="6.5" fill="#1F130C"/><circle cx="11.5" cy="27.2" r="2" fill="#FFF" opacity="0.9"/>
        <circle cx="24" cy="31" r="7" fill="#170F09"/><circle cx="22.2" cy="29" r="2.2" fill="#FFF" opacity="0.95"/>
        <circle cx="37" cy="32" r="7.2" fill="#1F130C"/><circle cx="35" cy="29.8" r="2.3" fill="#FFF" opacity="0.98"/><circle cx="38.8" cy="33.8" r="1" fill="#FFF" opacity="0.5"/>
        <circle cx="50" cy="31" r="7" fill="#170F09"/><circle cx="48.2" cy="29" r="2.2" fill="#FFF" opacity="0.95"/>
        <circle cx="63" cy="29" r="6.8" fill="#1F130C"/><circle cx="61.2" cy="27.2" r="2.1" fill="#FFF" opacity="0.95"/>
        <circle cx="74" cy="32" r="6" fill="#150D08"/><circle cx="72.8" cy="30.5" r="1.6" fill="#FFF" opacity="0.85"/>

        <circle cx="19" cy="19" r="6.8" fill="#24150D"/><circle cx="17.2" cy="17" r="2.2" fill="#FFF" opacity="0.95"/>
        <circle cx="32" cy="18" r="7.2" fill="#1B1009"/><circle cx="30" cy="15.8" r="2.4" fill="#FFF" opacity="0.98"/><circle cx="33.8" cy="19.5" r="1.1" fill="#FFF" opacity="0.6"/>
        <circle cx="46" cy="17" r="7.4" fill="#24150D"/><circle cx="44" cy="14.8" r="2.5" fill="#FFF" opacity="0.98"/><circle cx="48" cy="18.8" r="1.1" fill="#FFF" opacity="0.6"/>
        <circle cx="59" cy="19" r="7" fill="#1B1009"/><circle cx="57.2" cy="17" r="2.3" fill="#FFF" opacity="0.98"/>
        <circle cx="71" cy="21" r="6.2" fill="#24150D"/><circle cx="69.5" cy="19.5" r="1.8" fill="#FFF" opacity="0.9"/>
        
        <circle cx="39" cy="10" r="6.8" fill="#2A1910"/><circle cx="37.2" cy="8" r="2.3" fill="#FFF" opacity="0.98"/>
        <circle cx="52" cy="10" r="6.8" fill="#24150D"/><circle cx="50.2" cy="8" r="2.3" fill="#FFF" opacity="0.98"/>
      </g>
    `;
  }

  // 2. Trân châu hoàng kim màu mật ong óng ả (Golden Honey Boba)
  if (id === 'tranChauHoangKim') {
    return `
      <g>
        <path d="M8 48 C16 42, 28 44, 44 42 C60 40, 72 44, 80 48 L80 54 L8 54 Z" fill="#78350F"/>
        <ellipse cx="44" cy="46" rx="34" ry="7" fill="#B45309" opacity="0.8"/>
        
        <circle cx="16" cy="40" r="6.2" fill="#D97706"/><circle cx="14.5" cy="38.5" r="1.8" fill="#FEF08A" opacity="0.95"/>
        <circle cx="28" cy="42" r="6.5" fill="#B45309"/><circle cx="26.5" cy="40.5" r="1.8" fill="#FFF" opacity="0.95"/>
        <circle cx="41" cy="43" r="6.8" fill="#D97706"/><circle cx="39.5" cy="41.2" r="2" fill="#FFF" opacity="0.98"/>
        <circle cx="55" cy="42" r="6.5" fill="#B45309"/><circle cx="53.5" cy="40.5" r="1.8" fill="#FEF08A" opacity="0.95"/>
        <circle cx="68" cy="40" r="6.2" fill="#D97706"/><circle cx="66.5" cy="38.5" r="1.8" fill="#FFF" opacity="0.95"/>

        <circle cx="13" cy="29" r="6.5" fill="#F59E0B"/><circle cx="11.5" cy="27.2" r="2" fill="#FFF" opacity="0.95"/>
        <circle cx="24" cy="31" r="7" fill="#D97706"/><circle cx="22.2" cy="29" r="2.2" fill="#FFF" opacity="0.98"/>
        <circle cx="37" cy="32" r="7.2" fill="#FBBF24"/><circle cx="35" cy="29.8" r="2.4" fill="#FFF" opacity="0.98"/>
        <circle cx="50" cy="31" r="7" fill="#D97706"/><circle cx="48.2" cy="29" r="2.2" fill="#FFF" opacity="0.98"/>
        <circle cx="63" cy="29" r="6.8" fill="#F59E0B"/><circle cx="61.2" cy="27.2" r="2.1" fill="#FFF" opacity="0.95"/>
        <circle cx="74" cy="32" r="6" fill="#D97706"/><circle cx="72.8" cy="30.5" r="1.6" fill="#FFF" opacity="0.9"/>

        <circle cx="19" cy="19" r="6.8" fill="#FBBF24"/><circle cx="17.2" cy="17" r="2.3" fill="#FFF" opacity="0.98"/>
        <circle cx="32" cy="18" r="7.2" fill="#F59E0B"/><circle cx="30" cy="15.8" r="2.5" fill="#FFF" opacity="0.98"/>
        <circle cx="46" cy="17" r="7.4" fill="#FBBF24"/><circle cx="44" cy="14.8" r="2.6" fill="#FFF" opacity="0.98"/>
        <circle cx="59" cy="19" r="7" fill="#F59E0B"/><circle cx="57.2" cy="17" r="2.4" fill="#FFF" opacity="0.98"/>
        <circle cx="71" cy="21" r="6.2" fill="#FBBF24"/><circle cx="69.5" cy="19.5" r="1.8" fill="#FFF" opacity="0.95"/>

        <circle cx="39" cy="10" r="6.8" fill="#FDE047"/><circle cx="37.2" cy="8" r="2.4" fill="#FFF" opacity="0.98"/>
        <circle cx="52" cy="10" r="6.8" fill="#FBBF24"/><circle cx="50.2" cy="8" r="2.4" fill="#FFF" opacity="0.98"/>
      </g>
    `;
  }

  // 3. Thạch Matcha Uji tự nhiên (Natural Cut Uji Matcha Jelly)
  if (id === 'thachMatcha') {
    return `
      <g>
        <path d="M8 48 C20 42, 40 44, 80 48 L80 54 L8 54 Z" fill="#052E16"/>
        <!-- Các miếng thạch matcha cắt vát tự nhiên óng ánh, không phải khối hộp -->
        <path d="M12 36 Q18 30 28 32 Q34 38 30 46 Q20 48 12 44 Z" fill="#15803D" stroke="#166534" stroke-width="1"/>
        <path d="M14 34 Q22 30 28 34" stroke="#86EFAC" stroke-width="2" fill="none" stroke-linecap="round"/>

        <path d="M26 34 Q38 28 48 32 Q54 40 46 48 Q32 48 26 42 Z" fill="#16A34A" stroke="#14532D" stroke-width="1"/>
        <path d="M28 32 Q38 28 46 32" stroke="#BBF7D0" stroke-width="2.2" fill="none" stroke-linecap="round"/>

        <path d="M48 34 Q62 28 72 34 Q76 44 68 48 Q54 48 48 42 Z" fill="#15803D" stroke="#166534" stroke-width="1"/>
        <path d="M50 32 Q62 28 70 34" stroke="#86EFAC" stroke-width="2" fill="none" stroke-linecap="round"/>

        <path d="M16 20 Q28 14 38 18 Q42 26 36 32 Q24 34 16 28 Z" fill="#22C55E" stroke="#15803D" stroke-width="1"/>
        <path d="M18 18 Q28 14 36 18" stroke="#DCFCE7" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <circle cx="28" cy="22" r="1.5" fill="#FFF" opacity="0.9"/>

        <path d="M38 16 Q52 10 64 16 Q68 26 58 32 Q46 32 38 24 Z" fill="#16A34A" stroke="#14532D" stroke-width="1"/>
        <path d="M40 14 Q52 10 62 16" stroke="#BBF7D0" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <circle cx="52" cy="18" r="1.6" fill="#FFF" opacity="0.9"/>

        <path d="M28 8 Q42 4 52 8 Q56 16 46 20 Q32 20 28 14 Z" fill="#4ADE80" stroke="#16A34A" stroke-width="1"/>
        <path d="M30 6 Q42 4 50 8" stroke="#FFF" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      </g>
    `;
  }

  // 4. Thạch 3Q ngọc trai giòn sần sật (3Q Crystal Boba Pearls)
  if (id === 'thach3Q') {
    return `
      <g>
        <ellipse cx="44" cy="46" rx="34" ry="7" fill="#CBD5E1" opacity="0.4"/>
        <!-- Dày đặc các hạt thạch ngọc trai trong suốt lấp lánh -->
        <circle cx="16" cy="40" r="6.2" fill="#F1F5F9" opacity="0.9"/><circle cx="14.5" cy="38.5" r="1.8" fill="#FFF"/>
        <circle cx="28" cy="42" r="6.5" fill="#FFFFFF" opacity="0.95"/><circle cx="26.5" cy="40.5" r="2" fill="#FFF"/>
        <circle cx="41" cy="43" r="6.8" fill="#F8FAFC" opacity="0.95"/><circle cx="39.5" cy="41.2" r="2.2" fill="#FFF"/>
        <circle cx="55" cy="42" r="6.5" fill="#FFFFFF" opacity="0.95"/><circle cx="53.5" cy="40.5" r="2" fill="#FFF"/>
        <circle cx="68" cy="40" r="6.2" fill="#F1F5F9" opacity="0.9"/><circle cx="66.5" cy="38.5" r="1.8" fill="#FFF"/>

        <circle cx="13" cy="29" r="6.5" fill="#F8FAFC" opacity="0.95"/><circle cx="11.5" cy="27.2" r="2" fill="#FFF"/>
        <circle cx="24" cy="31" r="7" fill="#FFFFFF" opacity="0.98"/><circle cx="22.2" cy="29" r="2.4" fill="#FFF"/>
        <circle cx="37" cy="32" r="7.2" fill="#F1F5F9" opacity="0.95"/><circle cx="35" cy="29.8" r="2.5" fill="#FFF"/>
        <circle cx="50" cy="31" r="7" fill="#FFFFFF" opacity="0.98"/><circle cx="48.2" cy="29" r="2.4" fill="#FFF"/>
        <circle cx="63" cy="29" r="6.8" fill="#F8FAFC" opacity="0.95"/><circle cx="61.2" cy="27.2" r="2.2" fill="#FFF"/>
        <circle cx="74" cy="32" r="6" fill="#F1F5F9" opacity="0.9"/><circle cx="72.8" cy="30.5" r="1.8" fill="#FFF"/>

        <circle cx="19" cy="19" r="6.8" fill="#FFFFFF" opacity="0.98"/><circle cx="17.2" cy="17" r="2.5" fill="#FFF"/>
        <circle cx="32" cy="18" r="7.2" fill="#F8FAFC" opacity="0.95"/><circle cx="30" cy="15.8" r="2.6" fill="#FFF"/>
        <circle cx="46" cy="17" r="7.4" fill="#FFFFFF" opacity="0.98"/><circle cx="44" cy="14.8" r="2.8" fill="#FFF"/>
        <circle cx="59" cy="19" r="7" fill="#F8FAFC" opacity="0.95"/><circle cx="57.2" cy="17" r="2.5" fill="#FFF"/>
        <circle cx="71" cy="21" r="6.2" fill="#FFFFFF" opacity="0.98"/><circle cx="69.5" cy="19.5" r="2" fill="#FFF"/>

        <circle cx="39" cy="10" r="6.8" fill="#FFFFFF" opacity="0.98"/><circle cx="37.2" cy="8" r="2.6" fill="#FFF"/>
        <circle cx="52" cy="10" r="6.8" fill="#FFFFFF" opacity="0.98"/><circle cx="50.2" cy="8" r="2.6" fill="#FFF"/>
      </g>
    `;
  }

  // 5. Kem phô mai béo ngậy mềm mịn với muỗng inox (Velvet Cheese Foam with Metal Scoop)
  if (id === 'kemPhoMai') {
    return `
      <g>
        <!-- Lớp kem phô mai béo ngậy uốn lượn mềm mịn -->
        <path d="M8 50 C14 36, 26 32, 42 35 C58 38, 70 30, 80 44 L80 54 L8 54 Z" fill="#FDE047"/>
        <path d="M8 44 C20 24, 38 28, 54 22 C68 18, 76 26, 80 34 L80 52 L8 52 Z" fill="#FEF08A"/>
        
        <!-- Sóng vân kem xoáy mềm mại -->
        <path d="M12 42 Q28 28 46 34 Q64 40 76 30" fill="none" stroke="#FDE68A" stroke-width="3" stroke-linecap="round"/>
        <path d="M18 36 Q36 20 54 26 Q70 32 78 22" fill="none" stroke="#FFF" stroke-width="3.5" stroke-linecap="round" opacity="0.9"/>
        <path d="M26 26 Q40 12 56 16" fill="none" stroke="#FFF" stroke-width="3" stroke-linecap="round" opacity="0.95"/>
        <path d="M34 16 Q44 6 52 10" fill="none" stroke="#FFF" stroke-width="2.5" stroke-linecap="round"/>

        <!-- Muỗng múc inox cắm xéo góc phải chuẩn Ảnh 2 -->
        <g transform="translate(44, 4) rotate(26)">
          <path d="M10 2 L14 2 L13 30 L9 30 Z" fill="#CBD5E1" stroke="#334155" stroke-width="1.2"/>
          <line x1="12" y1="2" x2="11" y2="30" stroke="#FFF" stroke-width="1"/>
          <ellipse cx="11" cy="31" rx="6.5" ry="7.5" fill="#E2E8F0" stroke="#334155" stroke-width="1.2"/>
          <ellipse cx="10" cy="30" rx="4.5" ry="5.5" fill="#94A3B8"/>
          <path d="M9 28 Q11 26 13 28" stroke="#FFF" stroke-width="1" fill="none"/>
        </g>
      </g>
    `;
  }

  // 6. Pudding trứng mềm mượt sốt caramel (Silky Custard Pudding with Caramel Sauce)
  if (id === 'pudding') {
    return `
      <g>
        <!-- Nước sốt caramel nâu óng ở đáy -->
        <path d="M8 48 C20 40, 44 42, 80 48 L80 54 L8 54 Z" fill="#9A3412"/>
        
        <!-- Từng miếng bánh flan custard mềm mại, cạnh bo tròn mềm mại không vuông vức -->
        <!-- Miếng 1 -->
        <path d="M12 36 Q18 28 30 30 Q36 38 32 46 Q20 48 12 44 Z" fill="#F59E0B" stroke="#D97706" stroke-width="1"/>
        <path d="M14 34 Q22 26 30 30" stroke="#FEF08A" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path d="M22 36 Q24 44 26 46" stroke="#9A3412" stroke-width="2" fill="none" stroke-linecap="round"/>

        <!-- Miếng 2 (chính giữa) -->
        <path d="M28 32 Q40 24 54 28 Q60 38 52 48 Q36 48 28 40 Z" fill="#FBBF24" stroke="#D97706" stroke-width="1"/>
        <path d="M30 30 Q42 22 52 28" stroke="#FFF" stroke-width="2.8" fill="none" stroke-linecap="round"/>
        <!-- Vệt caramel chảy xuống -->
        <path d="M38 30 Q40 40 42 46" stroke="#B45309" stroke-width="2.5" fill="none" stroke-linecap="round"/>

        <!-- Miếng 3 -->
        <path d="M52 34 Q66 26 76 32 Q80 42 70 48 Q58 48 52 42 Z" fill="#F59E0B" stroke="#D97706" stroke-width="1"/>
        <path d="M54 32 Q66 26 74 32" stroke="#FEF08A" stroke-width="2.5" fill="none" stroke-linecap="round"/>

        <!-- Tầng trên đỉnh mềm mịn -->
        <path d="M22 18 Q36 10 50 14 Q56 24 46 30 Q30 30 22 24 Z" fill="#FDE047" stroke="#F59E0B" stroke-width="1"/>
        <path d="M24 16 Q36 10 48 14" stroke="#FFF" stroke-width="3" fill="none" stroke-linecap="round"/>
        <circle cx="36" cy="18" r="1.8" fill="#FFF" opacity="0.95"/>
        <!-- Dòng caramel đậm đà trên đỉnh -->
        <path d="M40 12 Q44 20 42 26" stroke="#9A3412" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      </g>
    `;
  }

  // 7. Thạch trái cây tươi đa sắc (Fresh Diced Fruit Medley - Dâu, Xoài, Kiwi)
  if (id === 'thachTraiCay') {
    return `
      <g>
        <!-- Nước siro hoa quả bóng bẩy ở đáy -->
        <path d="M8 48 C20 42, 40 44, 80 48 L80 54 L8 54 Z" fill="#991B1B" opacity="0.6"/>
        
        <!-- Miếng Dâu tây đỏ tươi có hạt (trái) -->
        <path d="M12 36 Q18 28 28 30 Q34 38 28 46 Q18 48 12 42 Z" fill="#DC2626" stroke="#B91C1C" stroke-width="1"/>
        <path d="M14 34 Q20 28 26 32" stroke="#FCA5A5" stroke-width="2" fill="none" stroke-linecap="round"/>
        <circle cx="20" cy="38" r="0.8" fill="#FEF08A"/><circle cx="24" cy="42" r="0.8" fill="#FEF08A"/>

        <!-- Miếng Xoài vàng cam mọng nước (giữa) -->
        <path d="M28 32 Q40 24 50 28 Q56 38 48 48 Q34 48 28 40 Z" fill="#EA580C" stroke="#C2410C" stroke-width="1"/>
        <path d="M30 30 Q40 24 48 28" stroke="#FED7AA" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        <circle cx="38" cy="36" r="1.6" fill="#FFF" opacity="0.9"/>

        <!-- Miếng Kiwi xanh tươi có hạt đen (phải) -->
        <path d="M48 34 Q62 26 74 32 Q78 42 70 48 Q56 48 48 40 Z" fill="#16A34A" stroke="#15803D" stroke-width="1"/>
        <path d="M50 32 Q62 26 72 32" stroke="#BBF7D0" stroke-width="2" fill="none" stroke-linecap="round"/>
        <circle cx="58" cy="38" r="0.8" fill="#18181B"/><circle cx="62" cy="40" r="0.8" fill="#18181B"/><circle cx="66" cy="37" r="0.8" fill="#18181B"/>

        <!-- Tầng trên: Miếng dâu tây đỏ đỉnh -->
        <path d="M18 18 Q30 10 40 14 Q44 24 36 30 Q24 30 18 24 Z" fill="#EF4444" stroke="#DC2626" stroke-width="1"/>
        <path d="M20 16 Q30 10 38 14" stroke="#FFF" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <circle cx="26" cy="22" r="0.9" fill="#FEF08A"/><circle cx="32" cy="24" r="0.9" fill="#FEF08A"/>

        <!-- Miếng xoài chín vàng đỉnh -->
        <path d="M38 14 Q52 8 62 14 Q66 24 58 30 Q44 30 38 22 Z" fill="#F97316" stroke="#EA580C" stroke-width="1"/>
        <path d="M40 12 Q52 8 60 14" stroke="#FFEDD5" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <circle cx="48" cy="18" r="1.8" fill="#FFF" opacity="0.95"/>
      </g>
    `;
  }

  // 8. Thạch trắng ngọc bích (White Crystal Jelly)
  if (id === 'thachTrang') {
    return `
      <g>
        <path d="M8 48 C20 40, 44 42, 80 48 L80 54 L8 54 Z" fill="#94A3B8" opacity="0.4"/>
        <!-- Các miếng thạch trắng trong veo cắt vát tự nhiên óng ả -->
        <path d="M12 36 Q18 28 28 30 Q34 38 30 46 Q20 48 12 44 Z" fill="#E2E8F0" opacity="0.9"/>
        <path d="M14 34 Q22 28 28 32" stroke="#FFFFFF" stroke-width="2.5" fill="none" stroke-linecap="round"/>

        <path d="M26 32 Q38 24 50 28 Q56 38 48 48 Q32 48 26 40 Z" fill="#F1F5F9" opacity="0.95"/>
        <path d="M28 30 Q38 24 48 28" stroke="#FFFFFF" stroke-width="2.8" fill="none" stroke-linecap="round"/>
        <circle cx="36" cy="34" r="1.8" fill="#BAE6FD"/>

        <path d="M48 34 Q62 26 74 32 Q78 42 70 48 Q56 48 48 40 Z" fill="#E2E8F0" opacity="0.9"/>
        <path d="M50 32 Q62 26 72 32" stroke="#FFFFFF" stroke-width="2.5" fill="none" stroke-linecap="round"/>

        <path d="M18 18 Q30 10 40 14 Q44 24 36 30 Q24 30 18 24 Z" fill="#F8FAFC" opacity="0.95"/>
        <path d="M20 16 Q30 10 38 14" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round"/>

        <path d="M38 14 Q52 8 62 14 Q66 24 58 30 Q44 30 38 22 Z" fill="#FFFFFF" opacity="0.98"/>
        <path d="M40 12 Q52 8 60 14" stroke="#BAE6FD" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <circle cx="48" cy="18" r="2" fill="#FFF"/>
      </g>
    `;
  }

  // 9. Sương sáo / Thạch đen (Herbal Grass Jelly Chunks)
  if (id === 'suongSao' || id === 'thachDen') {
    return `
      <g>
        <path d="M8 48 C20 40, 44 42, 80 48 L80 54 L8 54 Z" fill="#020617"/>
        <!-- Các miếng sương sáo cắt khúc tự nhiên đen bóng -->
        <path d="M12 36 Q18 28 28 30 Q34 38 30 46 Q20 48 12 44 Z" fill="#0F172A" stroke="#020617" stroke-width="1"/>
        <path d="M14 34 Q22 28 28 32" stroke="#475569" stroke-width="2" fill="none" stroke-linecap="round"/>

        <path d="M26 32 Q38 24 50 28 Q56 38 48 48 Q32 48 26 40 Z" fill="#1E293B" stroke="#0F172A" stroke-width="1"/>
        <path d="M28 30 Q38 24 48 28" stroke="#94A3B8" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <circle cx="38" cy="34" r="1.6" fill="#FFF" opacity="0.9"/>

        <path d="M48 34 Q62 26 74 32 Q78 42 70 48 Q56 48 48 40 Z" fill="#0F172A" stroke="#020617" stroke-width="1"/>
        <path d="M50 32 Q62 26 72 32" stroke="#475569" stroke-width="2" fill="none" stroke-linecap="round"/>

        <path d="M18 18 Q30 10 40 14 Q44 24 36 30 Q24 30 18 24 Z" fill="#1E293B" stroke="#0F172A" stroke-width="1"/>
        <path d="M20 16 Q30 10 38 14" stroke="#94A3B8" stroke-width="2.5" fill="none" stroke-linecap="round"/>

        <path d="M38 14 Q52 8 62 14 Q66 24 58 30 Q44 30 38 22 Z" fill="#334155" stroke="#1E293B" stroke-width="1"/>
        <path d="M40 12 Q52 8 60 14" stroke="#CBD5E1" stroke-width="2.8" fill="none" stroke-linecap="round"/>
        <circle cx="48" cy="18" r="1.8" fill="#FFF" opacity="0.95"/>
      </g>
    `;
  }

  // 10. Đậu đỏ nấu đường hạt mẩy bóng bẩy (Sweet Azuki Red Beans - Real Bean Shape)
  if (id === 'dauDo') {
    return `
      <g>
        <path d="M8 48 C20 40, 44 42, 80 48 L80 54 L8 54 Z" fill="#450A0A" opacity="0.7"/>
        <!-- Từng hạt đậu đỏ Azuki hình hạt đậu thật cong mẩy căng mọng -->
        <!-- Hạt 1 -->
        <path d="M12 40 C12 34, 18 32, 24 35 C28 38, 26 46, 20 46 C15 46, 12 44, 12 40 Z" fill="#7F1D1D" stroke="#450A0A" stroke-width="1"/>
        <path d="M15 36 Q20 34 24 38" stroke="#FCA5A5" stroke-width="1.6" fill="none" stroke-linecap="round"/>
        <line x1="17" y1="39" x2="21" y2="41" stroke="#FFF" stroke-width="0.9"/>

        <!-- Hạt 2 -->
        <path d="M26 38 C26 32, 34 30, 40 33 C44 36, 42 45, 36 45 C30 45, 26 42, 26 38 Z" fill="#991B1B" stroke="#581C1C" stroke-width="1"/>
        <path d="M29 34 Q36 32 40 36" stroke="#FFF" stroke-width="1.8" fill="none" stroke-linecap="round"/>
        <line x1="32" y1="38" x2="36" y2="39" stroke="#FEF08A" stroke-width="1"/>

        <!-- Hạt 3 -->
        <path d="M44 40 C44 34, 52 32, 58 35 C62 38, 60 46, 54 46 C48 46, 44 44, 44 40 Z" fill="#7F1D1D" stroke="#450A0A" stroke-width="1"/>
        <path d="M47 36 Q54 34 58 38" stroke="#FCA5A5" stroke-width="1.6" fill="none" stroke-linecap="round"/>

        <!-- Hạt 4 -->
        <path d="M60 38 C60 32, 68 30, 74 34 C78 37, 76 45, 70 45 C64 45, 60 42, 60 38 Z" fill="#991B1B" stroke="#581C1C" stroke-width="1"/>
        <path d="M63 34 Q70 32 74 36" stroke="#FFF" stroke-width="1.8" fill="none" stroke-linecap="round"/>

        <!-- Tầng trên -->
        <path d="M18 24 C18 18, 26 16, 32 19 C36 22, 34 31, 28 31 C22 31, 18 28, 18 24 Z" fill="#991B1B" stroke="#581C1C" stroke-width="1"/>
        <path d="M21 20 Q28 18 32 22" stroke="#FFF" stroke-width="2" fill="none" stroke-linecap="round"/>

        <path d="M36 22 C36 16, 44 14, 50 17 C54 20, 52 29, 46 29 C40 29, 36 26, 36 22 Z" fill="#B91C1C" stroke="#7F1D1D" stroke-width="1"/>
        <path d="M39 18 Q46 16 50 20" stroke="#FFF" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        <circle cx="43" cy="22" r="1.3" fill="#FFF"/>

        <path d="M54 24 C54 18, 62 16, 68 19 C72 22, 70 31, 64 31 C58 31, 54 28, 54 24 Z" fill="#7F1D1D" stroke="#450A0A" stroke-width="1"/>
        <path d="M57 20 Q64 18 68 22" stroke="#FCA5A5" stroke-width="1.8" fill="none" stroke-linecap="round"/>

        <!-- Hạt đỉnh chóp -->
        <path d="M28 10 C28 4, 38 2, 44 6 C48 9, 46 18, 40 18 C34 18, 28 15, 28 10 Z" fill="#B91C1C" stroke="#7F1D1D" stroke-width="1"/>
        <path d="M32 6 Q40 4 44 8" stroke="#FFF" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      </g>
    `;
  }

  // 11. Thạch dừa Nata de Coco giòn dai mọng nước (Chewy Coconut Jelly)
  if (id === 'thachDua') {
    return `
      <g>
        <path d="M8 48 C20 40, 44 42, 80 48 L80 54 L8 54 Z" fill="#BAE6FD" opacity="0.3"/>
        <!-- Các miếng thạch dừa trắng đục giòn dai với nước dừa trong suốt -->
        <path d="M12 36 Q18 28 28 30 Q34 38 30 46 Q20 48 12 44 Z" fill="#F1F5F9" opacity="0.95"/>
        <path d="M14 34 Q22 28 28 32" stroke="#FFFFFF" stroke-width="2.5" fill="none" stroke-linecap="round"/>

        <path d="M26 32 Q38 24 50 28 Q56 38 48 48 Q32 48 26 40 Z" fill="#FFFFFF" opacity="0.98"/>
        <path d="M28 30 Q38 24 48 28" stroke="#BAE6FD" stroke-width="2.8" fill="none" stroke-linecap="round"/>
        <circle cx="36" cy="34" r="1.8" fill="#FFF"/>

        <path d="M48 34 Q62 26 74 32 Q78 42 70 48 Q56 48 48 40 Z" fill="#F1F5F9" opacity="0.95"/>
        <path d="M50 32 Q62 26 72 32" stroke="#FFFFFF" stroke-width="2.5" fill="none" stroke-linecap="round"/>

        <path d="M18 18 Q30 10 40 14 Q44 24 36 30 Q24 30 18 24 Z" fill="#FFFFFF" opacity="0.98"/>
        <path d="M20 16 Q30 10 38 14" stroke="#E0F2FE" stroke-width="3" fill="none" stroke-linecap="round"/>

        <path d="M38 14 Q52 8 62 14 Q66 24 58 30 Q44 30 38 22 Z" fill="#FFFFFF" opacity="0.98"/>
        <path d="M40 12 Q52 8 60 14" stroke="#FFF" stroke-width="3" fill="none" stroke-linecap="round"/>
        <circle cx="48" cy="18" r="2.2" fill="#BAE6FD"/>
      </g>
    `;
  }

  // 12. Nha đam tươi giòn mọng nước (Fresh Succulent Aloe Vera)
  if (id === 'nhaDam') {
    return `
      <g>
        <path d="M8 48 C20 40, 44 42, 80 48 L80 54 L8 54 Z" fill="#A7F3D0" opacity="0.4"/>
        <!-- Nha đam trong veo ánh ngọc bích non mọng nước -->
        <path d="M12 36 Q18 28 28 30 Q34 38 30 46 Q20 48 12 44 Z" fill="#D1FAE5" opacity="0.9"/>
        <path d="M14 34 Q22 28 28 32" stroke="#A7F3D0" stroke-width="2.2" fill="none" stroke-linecap="round"/>

        <path d="M26 32 Q38 24 50 28 Q56 38 48 48 Q32 48 26 40 Z" fill="#ECFDF5" opacity="0.95"/>
        <path d="M28 30 Q38 24 48 28" stroke="#6EE7B7" stroke-width="2.6" fill="none" stroke-linecap="round"/>
        <circle cx="36" cy="34" r="1.8" fill="#FFF"/>

        <path d="M48 34 Q62 26 74 32 Q78 42 70 48 Q56 48 48 40 Z" fill="#D1FAE5" opacity="0.9"/>
        <path d="M50 32 Q62 26 72 32" stroke="#A7F3D0" stroke-width="2.2" fill="none" stroke-linecap="round"/>

        <path d="M18 18 Q30 10 40 14 Q44 24 36 30 Q24 30 18 24 Z" fill="#ECFDF5" opacity="0.95"/>
        <path d="M20 16 Q30 10 38 14" stroke="#FFF" stroke-width="2.8" fill="none" stroke-linecap="round"/>

        <path d="M38 14 Q52 8 62 14 Q66 24 58 30 Q44 30 38 22 Z" fill="#D1FAE5" opacity="0.95"/>
        <path d="M40 12 Q52 8 60 14" stroke="#6EE7B7" stroke-width="2.8" fill="none" stroke-linecap="round"/>
        <circle cx="48" cy="18" r="2" fill="#FFF" opacity="0.95"/>
      </g>
    `;
  }

  // 13. Đậu xanh nghiền bùi béo (Sweet Mung Bean Puree with Split Beans)
  if (id === 'dauXanh') {
    return `
      <g>
        <path d="M8 50 C14 36, 26 32, 42 35 C58 38, 70 30, 80 44 L80 54 L8 54 Z" fill="#BEF264"/>
        <path d="M8 44 C20 24, 38 28, 54 22 C68 18, 76 26, 80 34 L80 52 L8 52 Z" fill="#D9F99D"/>
        
        <!-- Sóng đậu xanh mịn màng -->
        <path d="M12 40 Q28 28 46 32 Q64 36 76 28" fill="none" stroke="#A3E635" stroke-width="3" stroke-linecap="round"/>
        <path d="M18 34 Q36 20 54 24 Q70 28 78 20" fill="none" stroke="#FFF" stroke-width="3" stroke-linecap="round" opacity="0.8"/>

        <!-- Từng hạt đậu xanh cà vỏ rắc tự nhiên lên bề mặt -->
        <ellipse cx="22" cy="36" rx="3.5" ry="2.6" fill="#65A30D"/><circle cx="21" cy="35" r="0.8" fill="#FFF"/>
        <ellipse cx="36" cy="38" rx="4" ry="2.8" fill="#84CC16"/><circle cx="35" cy="37" r="0.9" fill="#FFF"/>
        <ellipse cx="50" cy="34" rx="3.8" ry="2.6" fill="#65A30D"/>
        <ellipse cx="66" cy="32" rx="3.5" ry="2.5" fill="#84CC16"/>
        <ellipse cx="28" cy="22" rx="4" ry="2.8" fill="#84CC16"/><circle cx="27" cy="21" r="1" fill="#FFF"/>
        <ellipse cx="44" cy="20" rx="4.2" ry="3" fill="#65A30D"/><circle cx="43" cy="19" r="1" fill="#FFF"/>
        <ellipse cx="60" cy="22" rx="3.8" ry="2.8" fill="#84CC16"/>
        <ellipse cx="38" cy="10" rx="4" ry="2.8" fill="#84CC16"/><circle cx="37" cy="9" r="1" fill="#FFF"/>
      </g>
    `;
  }

  // 14. Hạt chia ngâm nở trong veo (Bloomed Chia Seeds in Jelly)
  return `
    <g>
      <!-- Nước gel thạch trong suốt chứa hàng chục hạt chia đen ngâm nở tự nhiên -->
      <path d="M8 48 C20 40, 44 42, 80 48 L80 54 L8 54 Z" fill="#E2E8F0" opacity="0.6"/>
      <ellipse cx="44" cy="32" rx="34" ry="18" fill="#F8FAFC" opacity="0.85"/>
      <ellipse cx="44" cy="32" rx="34" ry="18" stroke="#E2E8F0" stroke-width="1.2" fill="none"/>
      
      <!-- Hạt chia tự nhiên rải đều có vòng gel trong suốt bao quanh -->
      ${[
        [16, 24], [26, 18], [38, 19], [50, 18], [62, 22], [72, 26],
        [20, 32], [32, 28], [44, 27], [56, 30], [68, 34],
        [14, 40], [25, 42], [37, 39], [49, 41], [61, 43], [73, 42],
        [22, 48], [34, 47], [46, 49], [58, 48],
        [30, 13], [44, 11], [58, 12]
      ].map(([x, y]) => `
        <ellipse cx="${x}" cy="${y}" rx="3.4" ry="2.6" fill="#E2E8F0" opacity="0.85"/>
        <ellipse cx="${x}" cy="${y}" rx="2" ry="1.5" fill="#18181B"/>
        <circle cx="${x - 0.6}" cy="${y - 0.5}" r="0.6" fill="#FFF"/>
      `).join('')}
    </g>
  `;
}

// 4. Chai siro thuỷ tinh dáng Torani/Monin có vòi bơm lò xo (Chuẩn Ảnh 2)
function renderSyrupSvg(s, inCup, qty, isPumping = false) {
  return `
    <svg viewBox="0 0 68 105" width="100%" height="100%" class="vivid-svg ${isPumping ? 'anim-pumping' : ''}">
      <defs>
        <!-- Nước siro trong suốt phản quang -->
        <linearGradient id="syrupGrad_${s.id}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="${s.color}" stop-opacity="0.95"/>
          <stop offset="35%" stop-color="${s.color}"/>
          <stop offset="70%" stop-color="${s.color}" stop-opacity="0.98"/>
          <stop offset="100%" stop-color="${s.color}" stop-opacity="0.85"/>
        </linearGradient>
      </defs>

      <!-- Bóng đổ chai siro -->
      <ellipse cx="34" cy="94" rx="20" ry="3.5" fill="rgba(61, 34, 20, 0.2)"/>

      <!-- Đầu vòi bơm siro lò xo màu đen/inox (Pump Mechanism) -->
      <g class="pump-mechanism ${isPumping ? 'pressed' : ''}">
        <!-- Cổ nắp chai -->
        <rect x="29" y="19" width="10" height="6" rx="1.5" fill="#1E293B" stroke="#3A2012" stroke-width="1.2"/>
        <!-- Trục piston kim loại -->
        <line x1="34" y1="${isPumping ? 13 : 9}" x2="34" y2="19" stroke="#94A3B8" stroke-width="3" stroke-linecap="round"/>
        <!-- Đầu vòi pump cong chúc xuống -->
        <path d="M18 ${isPumping ? 14 : 10} L34 ${isPumping ? 11 : 7} Q37 ${isPumping ? 11 : 7} 38 ${isPumping ? 14 : 10} L36 ${isPumping ? 16 : 12} L19 ${isPumping ? 17 : 13} Z" 
              fill="#0F172A" stroke="#3A2012" stroke-width="1.3"/>
        ${isPumping ? `
          <!-- Giọt siro nhỏ ra khi bơm -->
          <circle cx="18" cy="20" r="1.8" fill="${s.color}"/>
        ` : ''}
      </g>

      <!-- Cổ chai thuỷ tinh thon dài -->
      <path d="M29 25 L29 35 C29 39, 16 42, 16 48 L17 91 Q17 94 34 94 Q51 94 51 91 L52 48 C52 42, 39 39, 39 35 L39 25 Z" 
            fill="rgba(255, 255, 255, 0.55)" stroke="#3A2012" stroke-width="1.8" stroke-linejoin="round"/>

      <!-- Nước siro tươi sáng ngập tràn trong chai -->
      <path d="M18 50 C18 45, 50 45, 50 50 L49 90 Q49 92 34 92 Q19 92 19 90 Z" fill="url(#syrupGrad_${s.id})"/>
      <path d="M18.5 50 Q34 47 49.5 50" stroke="rgba(255, 255, 255, 0.7)" stroke-width="1.5" fill="none"/>

      <!-- Vệt phản quang thân chai thuỷ tinh -->
      <path d="M21 44 L21 88" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" opacity="0.75"/>

      <!-- Nhãn chai vintage sang trọng với hình trái cây (Chuẩn Ảnh 2) -->
      <rect x="15" y="55" width="38" height="30" rx="3" fill="#FFFDF8" stroke="#3A2012" stroke-width="1.4"/>
      <rect x="17" y="57" width="34" height="26" rx="2" fill="none" stroke="#E2D0B6" stroke-width="0.8"/>
      <text x="34" y="66" font-family="'Paytone One', 'Nunito', sans-serif" font-size="7.5" font-weight="900" fill="#3A2012" text-anchor="middle">${s.name}</text>
      <text x="34" y="78" font-size="12" text-anchor="middle">${s.icon}</text>

      <!-- Huy hiệu số lượng tròn ở trên (Chuẩn Ảnh 2) -->
      <circle cx="54" cy="11" r="8" fill="#FFFDF8" stroke="#3A2012" stroke-width="1.4"/>
      <text x="54" y="14" font-family="'Nunito', sans-serif" font-size="8" font-weight="900" fill="#3A2012" text-anchor="middle">${qty}</text>
    </svg>
  `;
}


// 5. LY TRÀ SỮA TO SỐNG ĐỘNG TRÊN BÀN PHA (BIG WORKBENCH CUP)
function renderBigWorkbenchCupSvg(currentCup) {
  const isL = currentCup.cup === 'L';
  const cupH = isL ? 95 : 82;
  const topY = 12;
  const bottomY = topY + cupH;

  let liquidColor = null;
  if (currentCup.tea) {
    const tObj = TEAS.find(t => t.id === currentCup.tea);
    if (tObj) liquidColor = tObj.liquid;
  }
  if (currentCup.syrup) {
    const sObj = SYRUPS.find(s => s.id === currentCup.syrup);
    if (sObj) liquidColor = sObj.color;
  }

  const hasIce = currentCup.ice && currentCup.ice !== 'Không';
  const hasFoam = currentCup.toppings.includes('kemPhoMai');
  const otherTops = currentCup.toppings.filter(t => t !== 'kemPhoMai');

  return `
    <svg viewBox="0 0 100 125" class="live-workbench-cup-svg">
      <defs>
        <linearGradient id="cupGlassGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.6"/>
          <stop offset="15%" stop-color="#FFFFFF" stop-opacity="0.2"/>
          <stop offset="85%" stop-color="#FFFFFF" stop-opacity="0.1"/>
          <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.5"/>
        </linearGradient>
      </defs>

      <!-- Bóng đổ dưới đế ly -->
      <ellipse cx="50" cy="${bottomY + 5}" rx="28" ry="5.5" fill="rgba(61, 34, 20, 0.25)"/>

      <!-- Khung ly thuỷ tinh dày dặn -->
      <path d="M18 ${topY} L26 ${bottomY} Q27 ${bottomY + 4} 34 ${bottomY + 4} L66 ${bottomY + 4} Q73 ${bottomY + 4} 74 ${bottomY} L82 ${topY} Z" 
            fill="url(#cupGlassGrad)" stroke="#783E19" stroke-width="2.6"/>

      <!-- Nước trà dâng lên sóng sánh -->
      ${liquidColor ? `
        <g class="wave-liquid">
          <path d="M21 ${topY + 18} Q35 ${topY + 14} 50 ${topY + 18} T79 ${topY + 18} L74 ${bottomY} Q73 ${bottomY + 3} 66 ${bottomY + 3} L34 ${bottomY + 3} Q27 ${bottomY + 3} 26 ${bottomY} Z" 
                fill="${liquidColor}"/>
          <path d="M21 ${topY + 18} Q35 ${topY + 15} 50 ${topY + 18} T79 ${topY + 18}" 
                stroke="rgba(255,255,255,0.6)" stroke-width="2.5" fill="none"/>
        </g>
      ` : ''}

      <!-- Trân châu & thạch nằm ở đáy ly -->
      ${otherTops.length > 0 ? `
        <g class="bottom-toppings-group">
          <circle cx="34" cy="${bottomY - 4}" r="6" fill="#181311"/><circle cx="32" cy="${bottomY - 6}" r="1.8" fill="#FFF" opacity="0.8"/>
          <circle cx="48" cy="${bottomY - 5}" r="6.5" fill="#181311"/><circle cx="46" cy="${bottomY - 7}" r="2" fill="#FFF" opacity="0.8"/>
          <circle cx="62" cy="${bottomY - 4}" r="6" fill="#181311"/><circle cx="60" cy="${bottomY - 6}" r="1.8" fill="#FFF" opacity="0.8"/>
          <circle cx="41" cy="${bottomY - 14}" r="5.8" fill="#D97706"/><circle cx="39" cy="${bottomY - 16}" r="1.5" fill="#FFF" opacity="0.9"/>
          <circle cx="55" cy="${bottomY - 13}" r="5.5" fill="#15803D"/>
        </g>
      ` : ''}

      <!-- Viên đá bập bềnh trong ly -->
      ${hasIce ? `
        <g class="ice-floating">
          <rect x="30" y="${topY + 28}" width="16" height="15" rx="3" fill="#E0F2FE" stroke="#BAE6FD" stroke-width="1.6" opacity="0.92"/>
          <rect x="52" y="${topY + 34}" width="18" height="16" rx="3.5" fill="#F0F9FF" stroke="#BAE6FD" stroke-width="1.6" opacity="0.9"/>
          <rect x="42" y="${topY + 48}" width="15" height="14" rx="3" fill="#E0F2FE" stroke="#BAE6FD" stroke-width="1.6" opacity="0.85"/>
        </g>
      ` : ''}

      <!-- Lớp kem phô mai béo ngậy phủ trên cùng -->
      ${hasFoam ? `
        <path d="M20 ${topY + 16} Q50 ${topY + 12} 80 ${topY + 16} L78 ${topY + 28} Q50 ${topY + 33} 22 ${topY + 28} Z" 
              fill="#FEF08A" stroke="#FACC15" stroke-width="1.5"/>
      ` : ''}

      <!-- Vệt bóng loáng của thành ly thuỷ tinh -->
      <path d="M23 ${topY + 6} L28 ${bottomY - 4}" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity="0.7"/>

      <!-- Miệng ly tròn -->
      <ellipse cx="50" cy="${topY}" rx="32" ry="6.5" fill="none" stroke="#783E19" stroke-width="2.5"/>

      <!-- Màng dập nắp hoa & ống hút khi hoàn thành -->
      ${currentCup.isSealing || currentCup.isDelivering ? `
        <!-- Ống hút cắm chéo -->
        <line x1="56" y1="${topY - 16}" x2="38" y2="${bottomY - 10}" stroke="#F43F5E" stroke-width="6" stroke-linecap="round"/>
        <line x1="56" y1="${topY - 16}" x2="38" y2="${bottomY - 10}" stroke="#FFF" stroke-width="2" stroke-dasharray="6,4"/>
        <!-- Màng hoa dập nắp -->
        <ellipse cx="50" cy="${topY}" rx="33" ry="7" fill="#F472B6" stroke="#BE185D" stroke-width="2"/>
        <text x="50" y="${topY + 3}" font-size="9" text-anchor="middle" fill="#FFF">🌸 SAKURA 🌸</text>
      ` : ''}
    </svg>
  `;
}

// 6. Hiệu ứng hạt phần thưởng bay lên
function triggerFloatReward(x, y, text) {
  const el = document.createElement('div');
  el.className = 'fx-floating-reward';
  el.textContent = text;
  el.style.left = `${x || window.innerWidth / 2}px`;
  el.style.top = `${y || window.innerHeight / 2}px`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

// ================= 5. CONTROLLER GAME CHÍNH =================
class GameApp {
  constructor() {
    // Chế độ chơi: 'noodle' (Bếp Mì Cay) hoặc 'milktea' (Tiệm Trà Sữa)
    this.currentAppMode = 'noodle'; // Mặc định mở ngay Bếp Mì Cay để test cơ chế!

    this.viewMode = 'sell';
    this.isPaused = false;
    this.sellTimer = null;
    this.gameSeconds = 0;
    this.maxDaySeconds = 90;

    // Trà sữa
    this.orders = [];
    this.activeOrderIndex = 0;
    this.orderCounterId = 100;

    this.activePouringTea = null;
    this.activePumpingSyrup = null;
    this.activeBouncingTopping = null;

    this.currentCup = {
      cup: null, tea: null, syrup: null,
      sugar: '70%', ice: 'Bình thường', toppings: [],
      isSealing: false, isDelivering: false
    };

    // Mì Cay (Cơ chế Tap Đỏ 🔴 ➔ Xanh 🟢)
    this.currentNoodleDishId = 'kimchi';
    this.selectedNoodleIngredients = [];
    this.noodleOrders = [];
    this.activeNoodleOrderIndex = 0;
    this.noodleCounterId = 200;

    this.dailyReport = { served: 0, mistakes: 0, revenue: 0, tips: 0 };

    this.elTopDay = document.getElementById('topDay');
    this.elTopClock = document.getElementById('topClock');
    this.elTopMoney = document.getElementById('topMoney');
    this.elTopStars = document.getElementById('topStars');
    this.elTopRating = document.getElementById('topRating');
    this.elBtnPause = document.getElementById('btnPause');
    this.elBtnSound = document.getElementById('btnSound');
    this.elView = document.getElementById('view');
    this.elModal = document.getElementById('modal');
    this.elModalCard = document.getElementById('modalCard');
    this.elToast = document.getElementById('toast');

    this.generateNoodleOrder();
    this.initEvents();
    this.startSellPhase();
  }

  initEvents() {
    this.elBtnSound.onclick = () => {
      const on = audio.toggle();
      this.elBtnSound.textContent = on ? '🔊' : '🔇';
      this.showToast(on ? 'Đã bật âm thanh' : 'Đã tắt âm thanh');
    };
    this.elBtnSound.textContent = audio.enabled ? '🔊' : '🔇';

    this.elBtnPause.onclick = () => this.togglePause();

    // Mode Switcher: Chuyển qua lại Bếp Mì Cay & Tiệm Trà Sữa
    const tabNoodle = document.getElementById('tabModeNoodle');
    const tabMilktea = document.getElementById('tabModeMilktea');
    if (tabNoodle && tabMilktea) {
      tabNoodle.onclick = () => {
        audio.click();
        this.currentAppMode = 'noodle';
        tabNoodle.classList.add('active');
        tabMilktea.classList.remove('active');
        this.showToast('🍜 Chuyển sang Bếp Mì Cay (Cơ chế Đỏ ➔ Xanh)');
        this.render();
      };
      tabMilktea.onclick = () => {
        audio.click();
        this.currentAppMode = 'milktea';
        tabMilktea.classList.add('active');
        tabNoodle.classList.remove('active');
        this.showToast('🧋 Chuyển sang Tiệm Trà Sữa');
        this.render();
      };
    }

    const overlay = document.getElementById('modalOverlay');
    if (overlay) overlay.onclick = () => {
      if (this.isPaused) this.togglePause();
      else this.closeModal();
    };
  }

  showToast(msg) {
    if (!this.elToast) return;
    this.elToast.textContent = msg;
    this.elToast.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.elToast.classList.remove('show');
    }, 1800);
  }

  openModal(html) {
    this.elModalCard.innerHTML = html;
    this.elModal.hidden = false;
  }

  closeModal() {
    this.elModal.hidden = true;
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    audio.click();

    if (this.isPaused) {
      this.openModal(`
        <h2>⏸ QUẢN LÝ TIỆM</h2>
        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 12px;">
          <button class="btn-modal-primary" id="btnResume">▶️ Tiếp Tục Chơi</button>
          <button class="btn-modal-confirm" id="btnResetCupEarly">🗑 Nấu Lại Món Hiện Tại</button>
          <button class="btn-modal-cancel" id="btnEndDayEarly">🌙 Đóng Cửa Tiệm Sớm</button>
        </div>
      `);

      document.getElementById('btnResume').onclick = () => this.togglePause();
      document.getElementById('btnResetCupEarly').onclick = () => {
        if (this.currentAppMode === 'noodle') {
          this.selectedNoodleIngredients = [];
        } else {
          this.resetCup();
        }
        this.showToast('Đã làm lại món!');
        this.closeModal();
        this.isPaused = false;
        this.render();
      };
      document.getElementById('btnEndDayEarly').onclick = () => {
        this.closeModal();
        this.isPaused = false;
        this.endSellPhase();
      };
    } else {
      this.closeModal();
    }
  }

  render() {
    this.renderTopBar();
    if (this.currentAppMode === 'noodle') {
      this.renderNoodleKitchenView();
    } else {
      this.renderSellView();
    }
  }

  // ================= 5B. LOGIC BẾP MÌ CAY (TAP ĐỎ 🔴 ➔ XANH 🟢) =================
  generateNoodleOrder() {
    this.noodleCounterId += 1;
    const cust = CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];
    const dish = NOODLE_DISHES[Math.floor(Math.random() * NOODLE_DISHES.length)];

    let speech = '';
    let spiceLevelText = 'Không cay';
    let isSpicy = false;
    let extraIngredients = [];
    let required = [];

    if (dish.id === 'kimchi') {
      // Đơn hàng Mì Kim Chi theo đúng ví dụ thực tế trong yêu cầu
      const scenarios = [
        {
          spice: 'Không cay (0 cay)', isSpicy: false, extras: ['bomy'],
          text: `Dạ cho em 1 tô <b class="dialog-target-highlight">Mì Cay Kim Chi</b> thêm bò Mỹ, không cay nha!`
        },
        {
          spice: 'Cay Cấp 2 🌶️🌶️', isSpicy: true, extras: ['bomy', 'trung'],
          text: `Cho mình 1 tô <b class="dialog-target-highlight">Mì Kim Chi</b> bò Mỹ cấp 2 thêm trứng gà!`
        },
        {
          spice: 'Không cay (0 cay)', isSpicy: false, extras: ['trung'],
          text: `Cho em 1 tô <b class="dialog-target-highlight">Mì Kim Chi</b> thêm trứng, không cay nhé quán ơi!`
        },
        {
          spice: 'Cay Cấp 1 🌶️', isSpicy: true, extras: [],
          text: `Cho 1 tô <b class="dialog-target-highlight">Mì Cay Kim Chi</b> truyền thống, cay cấp 1!`
        }
      ];
      const sc = scenarios[Math.floor(Math.random() * scenarios.length)];
      spiceLevelText = sc.spice;
      isSpicy = sc.isSpicy;
      extraIngredients = sc.extras;
      speech = sc.text;
      // Nguyên liệu bắt buộc của Kim Chi
      required = ['mi', 'kimchi', 'xucxich', 'rau', 'nam', ...extraIngredients];
      if (isSpicy) required.push('ot');

    } else if (dish.id === 'tomyum') {
      // Mì Tom Yum Hải Sản
      const scenarios = [
        {
          spice: 'Chua Cay Vừa 🌶️', isSpicy: true, extras: ['bomy'],
          text: `Dạ cho em 1 tô <b class="dialog-target-highlight">Mì Tom Yum Hải Sản</b> thêm bò Mỹ, chua cay vừa!`
        },
        {
          spice: 'Không cay (0 cay)', isSpicy: false, extras: [],
          text: `Lấy mình 1 tô <b class="dialog-target-highlight">Mì Tom Yum Tôm Mực</b> đầy đặn, không cay nha!`
        },
        {
          spice: 'Cay Cấp 2 🌶️🌶️', isSpicy: true, extras: ['bomy'],
          text: `Cho 1 tô <b class="dialog-target-highlight">Mì Tom Yum</b> thêm bò Mỹ, cay cấp 2 ăn cho ấm bụng!`
        }
      ];
      const sc = scenarios[Math.floor(Math.random() * scenarios.length)];
      spiceLevelText = sc.spice;
      isSpicy = sc.isSpicy;
      extraIngredients = sc.extras;
      speech = sc.text;
      required = ['mi', 'nuoc_tomyum', 'tom', 'muc', 'cachua', 'nam', ...extraIngredients];
      if (isSpicy) required.push('ot');

    } else {
      // Mì Tương Đen Jajangmyeon
      const scenarios = [
        {
          spice: 'Không cay', isSpicy: false, extras: ['cucaivang'],
          text: `Cho mình 1 phần <b class="dialog-target-highlight">Mì Tương Đen Jajangmyeon</b> thêm củ cải vàng nha!`
        },
        {
          spice: 'Không cay', isSpicy: false, extras: ['kimchi_side'],
          text: `Dạ cho em 1 tô <b class="dialog-target-highlight">Mì Tương Đen Thịt Ba Chỉ</b> ăn kèm kim chi!`
        },
        {
          spice: 'Không cay', isSpicy: false, extras: ['cucaivang', 'kimchi_side'],
          text: `Lấy 1 phần <b class="dialog-target-highlight">Mì Tương Đen Đặc Biệt</b> kèm đủ củ cải vàng và kim chi!`
        }
      ];
      const sc = scenarios[Math.floor(Math.random() * scenarios.length)];
      spiceLevelText = sc.spice;
      isSpicy = sc.isSpicy;
      extraIngredients = sc.extras;
      speech = sc.text;
      required = ['mi', 'sot_tuongden', 'thitheo', 'dualeo', 'trungcut', ...extraIngredients];
    }

    // Tự động nhận diện và chuyển sang món đang được làm
    this.currentNoodleDishId = dish.id;
    this.selectedNoodleIngredients = [];

    const orderObj = {
      id: `#${this.noodleCounterId}`,
      customer: cust,
      name: cust.name,
      avatar: cust.avatar,
      patience: 100,
      speech,
      dishId: dish.id,
      dishName: dish.name,
      spiceLevelText,
      isSpicy,
      requiredIngredients: required
    };

    this.noodleOrders = [orderObj];
    this.activeNoodleOrderIndex = 0;
  }

  renderNoodleKitchenView() {
    const activeOrd = this.noodleOrders[this.activeNoodleOrderIndex] || null;
    const currentDish = NOODLE_DISHES.find(d => d.id === this.currentNoodleDishId) || NOODLE_DISHES[0];

    const reqList = activeOrd ? activeOrd.requiredIngredients : [];
    const isAllComplete = reqList.length > 0 && reqList.every(id => this.selectedNoodleIngredients.includes(id));
    const completedCount = reqList.filter(id => this.selectedNoodleIngredients.includes(id)).length;
    const totalCount = reqList.length;

    this.elView.innerHTML = `
      <div class="noodle-kitchen-view">
        <!-- KHU VỰC ĐƠN HÀNG KHÁCH YÊU CẦU -->
        ${activeOrd ? `
          <div class="noodle-order-box">
            <div class="noodle-order-head">
              <span class="noodle-dish-title">
                ${activeOrd.dishId === 'kimchi' ? '🍲' : (activeOrd.dishId === 'tomyum' ? '🦐' : '🥣')} 
                ${activeOrd.name} • ${activeOrd.dishName}
              </span>
              <span class="noodle-spice-badge ${activeOrd.isSpicy ? '' : 'no-spice'}">
                ${activeOrd.spiceLevelText}
              </span>
            </div>

            <div class="noodle-order-details">
              💬 ${activeOrd.speech}
            </div>

            <!-- Thanh kiên nhẫn của khách -->
            <div class="patience-row" style="margin-top: 3px;">
              <span class="patience-label">CHỜ ĐỢI:</span>
              <div class="patience-track">
                <div class="patience-bar-fill" style="width: ${activeOrd.patience}%; background: ${activeOrd.patience > 35 ? '#22C55E' : (activeOrd.patience > 20 ? '#F59E0B' : '#EF4444')};"></div>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- KHU VỰC NẤU: 3 THỐ MÌ ĐÁ (HỆ THỐNG TỰ NHẬN DIỆN MÓN ĐANG NẤU) -->
        <div class="noodle-cooking-station">
          <div class="station-title-bar">
            <span class="station-badge">🔥 BẾP THỐ ĐÁ HÀN QUỐC</span>
            <span style="font-size: 11px; font-weight: 800; color: #9A3412;">
              Tiến độ: <b>${completedCount}/${totalCount}</b> nguyên liệu
            </span>
          </div>

          <!-- Chọn món thố đang nấu -->
          <div class="stove-dishes-selector">
            ${NOODLE_DISHES.map(d => {
              const isActive = d.id === this.currentNoodleDishId;
              const isOrderDish = activeOrd && activeOrd.dishId === d.id;
              return `
                <button class="stove-dish-tab ${isActive ? 'active' : ''}" data-select-noodle-dish="${d.id}" title="${d.name}">
                  ${isOrderDish ? `<span class="stove-pot-indicator">Khách gọi</span>` : ''}
                  <span class="stove-dish-icon">${d.icon}</span>
                  <span class="stove-dish-name">${d.name}</span>
                </button>
              `;
            }).join('')}
          </div>

          <!-- THỐ ĐÁ TO ĐANG NẤU BỐC KHÓI -->
          <div class="big-pot-preview-box">
            <div class="pot-simmer-steam">♨️ ♨️ ♨️</div>
            <div class="pot-graphic-wrapper">
              ${renderDolsotPotSvg(currentDish, this.selectedNoodleIngredients, isAllComplete)}
            </div>
          </div>
        </div>

        <!-- KHUNG NGUYÊN LIỆU ĐỘNG (TỰ ĐỘNG THAY ĐỔI THEO MÓN ĐANG NẤU) -->
        <div class="dynamic-ingredients-section">
          <div class="ingredients-guide-banner">
            <span class="guide-text">
              📦 BỘ NGUYÊN LIỆU: <b>${currentDish.name.toUpperCase()}</b>
            </span>
            <div class="guide-legend">
              <span class="legend-item"><span class="legend-dot-red"></span> Chưa chọn</span>
              <span class="legend-item"><span class="legend-dot-green"></span> Đã chọn</span>
            </div>
          </div>

          <!-- Lưới các ô nguyên liệu: 100% Thao tác TAP/CHẠM, Không kéo thả -->
          <div class="ingredient-matrix-grid">
            ${currentDish.ingredients.map(ing => {
              const isRequired = reqList.includes(ing.id);
              const isSelected = this.selectedNoodleIngredients.includes(ing.id);

              let statusClass = 'req-not-needed';
              let badgeHtml = '<span class="req-status-tag" style="background:#E2E8F0; color:#64748B;">⚪ Không gọi</span>';

              if (isRequired) {
                if (isSelected) {
                  statusClass = 'req-done';
                  badgeHtml = '<span class="req-status-tag tag-green">✅ Đã chọn</span>';
                } else {
                  statusClass = 'req-pending';
                  badgeHtml = '<span class="req-status-tag tag-red">🔴 Cần cho</span>';
                }
              }

              return `
                <button class="ingredient-tap-slot ${statusClass}" 
                        data-noodle-ing="${ing.id}" 
                        data-required="${isRequired ? '1' : '0'}"
                        title="${ing.name}">
                  ${badgeHtml}
                  <span class="ing-slot-icon">${ing.icon}</span>
                  <span class="ing-slot-name">${ing.name}</span>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- BANNER THÔNG BÁO TIẾN ĐỘ -->
        <div class="noodle-status-banner ${isAllComplete ? 'ready' : 'incomplete'}">
          ${isAllComplete 
            ? '✨ ĐÃ ĐỦ NGUYÊN LIỆU! MÓN ĐÃ NẤU XONG! SẴN SÀNG GIAO MÓN 🎉' 
            : `⚠️ Còn thiếu ${totalCount - completedCount} nguyên liệu có viền đỏ 🔴 (Chạm để cho vào thố)`}
        </div>

        <!-- CÁC NÚT HÀNH ĐỘNG -->
        <div class="noodle-actions-bar">
          <button class="btn-noodle-reset" id="btnResetNoodlePot" title="Đổ thố làm lại">
            🗑 Nấu Lại
          </button>
          <button class="btn-noodle-serve ${isAllComplete ? 'ready' : ''}" id="btnServeNoodle" title="Giao thố mì cho khách">
            ${isAllComplete ? '🚚 GIAO MÓN NGAY ✨' : '⏳ Đang Nấu (Chưa đủ)'}
          </button>
        </div>
      </div>
    `;

    this.attachNoodleEvents();
  }

  attachNoodleEvents() {
    const activeOrd = this.noodleOrders[this.activeNoodleOrderIndex] || null;
    const reqList = activeOrd ? activeOrd.requiredIngredients : [];

    // 1. Chuyển đổi thố món đang nấu (Kim Chi, Tom Yum, Tương Đen)
    this.elView.querySelectorAll('[data-select-noodle-dish]').forEach(btn => {
      btn.onclick = () => {
        const dishId = btn.dataset.selectNoodleDish;
        audio.click();
        this.currentNoodleDishId = dishId;
        this.selectedNoodleIngredients = [];
        const dObj = NOODLE_DISHES.find(d => d.id === dishId);
        this.showToast(`Đã chuyển sang bộ nguyên liệu ${dObj ? dObj.name : ''}`);
        this.render();
      };
    });

    // 2. Chạm vào nguyên liệu (TAP / CLICK ĐỎ 🔴 ➔ XANH 🟢)
    this.elView.querySelectorAll('[data-noodle-ing]').forEach(btn => {
      btn.onclick = (e) => {
        const ingId = btn.dataset.noodleIng;
        const isRequired = btn.dataset.required === '1';
        const currentDish = NOODLE_DISHES.find(d => d.id === this.currentNoodleDishId);
        const ingObj = currentDish?.ingredients.find(i => i.id === ingId);

        // TH1: Nguyên liệu BẮT BUỘC theo đơn hàng
        if (isRequired) {
          const idx = this.selectedNoodleIngredients.indexOf(ingId);
          if (idx === -1) {
            // Chưa chọn ➔ CHUYỂN SANG VIỀN XANH
            audio.ding();
            audio.sizzle();
            this.selectedNoodleIngredients.push(ingId);
            triggerFloatReward(e.clientX, e.clientY, `+${ingObj?.name || 'Nguyên liệu'} ✅`);
          } else {
            // Đã chọn, chạm lại ➔ Cho phép gỡ ra chuyển lại ĐỎ
            audio.click();
            this.selectedNoodleIngredients.splice(idx, 1);
            triggerFloatReward(e.clientX, e.clientY, `Bỏ ${ingObj?.name || ''}`);
          }
          this.render();

        } else {
          // TH2: Nguyên liệu KHÔNG YÊU CẦU trong đơn (Ví dụ: dặn không cay mà bấm ớt)
          audio.warning();
          btn.classList.add('shake-invalid');
          setTimeout(() => btn.classList.remove('shake-invalid'), 400);

          if (ingObj?.isSpice) {
            this.showToast(`⚠️ Khách dặn ${activeOrd?.spiceLevelText || 'Không Cay'}, không chọn ớt nha!`);
          } else {
            this.showToast(`⚠️ Món này khách không gọi ${ingObj?.name || 'nguyên liệu này'}!`);
          }
        }
      };
    });

    // 3. Nút đổ thố nấu lại
    const btnReset = document.getElementById('btnResetNoodlePot');
    if (btnReset) {
      btnReset.onclick = () => {
        audio.trash();
        this.selectedNoodleIngredients = [];
        this.showToast('Đã làm trống thố, hãy chọn lại nguyên liệu!');
        this.render();
      };
    }

    // 4. Nút Giao Món
    const btnServe = document.getElementById('btnServeNoodle');
    if (btnServe) {
      btnServe.onclick = () => {
        const isAllComplete = reqList.length > 0 && reqList.every(id => this.selectedNoodleIngredients.includes(id));
        if (isAllComplete && activeOrd) {
          this.executeNoodleServe(activeOrd);
        } else {
          audio.warning();
          this.showToast('⚠️ Chưa đủ các nguyên liệu viền đỏ 🔴!');
        }
      };
    }
  }

  executeNoodleServe(order) {
    audio.serveSuccess();

    const dishObj = NOODLE_DISHES.find(d => d.id === order.dishId);
    const dishPrice = dishObj ? dishObj.price : 45000;
    const tip = 10000;
    const totalEarned = dishPrice + tip;

    state.money += totalEarned;
    state.rating = Math.min(5.0, state.rating + 0.1);

    this.dailyReport.served += 1;
    this.dailyReport.revenue += totalEarned;
    this.dailyReport.tips += tip;

    if (typeof confetti === 'function') {
      try {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}
    }

    triggerFloatReward(window.innerWidth / 2, window.innerHeight / 2, `+${totalEarned.toLocaleString()}đ 🍜`);
    this.showToast(`+${totalEarned.toLocaleString()}đ 🥰 ${order.name}: "Tô mì ngon xuất sắc, đúng yêu cầu! Cảm ơn quán!"`);

    this.selectedNoodleIngredients = [];
    setTimeout(() => {
      this.generateNoodleOrder();
      this.render();
    }, 600);
  }

  renderTopBar() {
    this.elTopDay.textContent = `Ngày ${state.day}`;
    this.elTopMoney.textContent = `${(state.money / 1000000).toFixed(2).replace('.', ',')}tr`;
    this.elTopRating.textContent = `${state.rating.toFixed(1)} - 257 đánh giá`;
    this.elTopStars.textContent = '⭐';

    const startHour = 8;
    const progress = this.gameSeconds / this.maxDaySeconds;
    const totalMinutes = Math.floor(progress * 14 * 60);
    const currentH = startHour + Math.floor(totalMinutes / 60);
    const currentM = totalMinutes % 60;
    this.elTopClock.textContent = `🕥 ${String(currentH).padStart(2, '0')}:${String(currentM).padStart(2, '0')}`;
  }

  startSellPhase() {
    this.viewMode = 'sell';
    this.isPaused = false;
    this.gameSeconds = 0;
    this.orders = [];
    this.activeOrderIndex = 0;
    this.resetCup();

    this.generateOrder('counter');

    clearInterval(this.sellTimer);
    this.sellTimer = setInterval(() => {
      if (this.isPaused) return;

      this.gameSeconds += 1;

      if (this.currentAppMode === 'noodle') {
        this.noodleOrders.forEach(ord => {
          ord.patience = Math.max(0, ord.patience - 0.5);
        });
        const angryNoodleIdx = this.noodleOrders.findIndex(ord => ord.patience <= 0);
        if (angryNoodleIdx !== -1) {
          audio.trash();
          const angryOrd = this.noodleOrders.splice(angryNoodleIdx, 1)[0];
          this.dailyReport.mistakes += 1;
          state.rating = Math.max(1.0, state.rating - 0.1);
          this.showToast(`${angryOrd.name} đã sốt ruột bỏ về vì đợi lâu!`);
          this.generateNoodleOrder();
        }
      } else {
        this.orders.forEach(ord => {
          ord.patience = Math.max(0, ord.patience - 0.7);
        });

        const angryIdx = this.orders.findIndex(ord => ord.patience <= 0);
        if (angryIdx !== -1) {
          audio.trash();
          const angryOrd = this.orders.splice(angryIdx, 1)[0];
          this.dailyReport.mistakes += 1;
          state.rating = Math.max(1.0, state.rating - 0.15);
          this.showToast(`${angryOrd.name} đã bỏ về vì chờ lâu!`);
          this.ensureOrderBalance();
        }
      }

      if (this.gameSeconds >= this.maxDaySeconds) {
        this.endSellPhase();
      } else {
        this.render();
      }
    }, 1000);

    this.render();
  }

  ensureOrderBalance() {
    if (this.orders.length === 0) {
      this.generateOrder();
    }
  }

  generateOrder(forcedType = null) {
    this.orderCounterId += 1;
    const cust = CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];
    const isOnline = forcedType ? (forcedType === 'online') : (Math.random() > 0.6);
    const randCup = Math.random() > 0.4 ? 'L' : 'M';
    const randTea = TEAS[Math.floor(Math.random() * TEAS.length)];
    const randSugar = SUGAR_LEVELS[Math.floor(Math.random() * SUGAR_LEVELS.length)];
    const randIce = ICE_LEVELS[Math.floor(Math.random() * ICE_LEVELS.length)];

    const hasSyrup = Math.random() > 0.45;
    const randSyrup = hasSyrup ? SYRUPS[Math.floor(Math.random() * SYRUPS.length)] : null;

    const numTops = Math.random() > 0.3 ? 2 : 1;
    const shuffled = [...TOPPINGS].sort(() => 0.5 - Math.random());
    const randTops = shuffled.slice(0, numTops).map(t => t.id);

    // Xây dựng lời thoại tiếng Việt tự nhiên chuẩn anime
    const teaName = randTea.name;
    const syrupName = randSyrup ? ` ${randSyrup.name.toLowerCase()}` : '';
    const topsName = randTops.map(id => {
      const o = TOPPINGS.find(x => x.id === id);
      return o ? o.name.toLowerCase() : '';
    }).join(' với ');

    const sugarStr = `${randSugar} đường`;
    const iceStr = randIce === 'Không' ? 'không đá' : (randIce === 'Ít' ? 'ít đá' : `${randIce.toLowerCase()} đá`);

    const speech = `Dạ cho em 1 ly <b class="dialog-target-highlight">${teaName}${syrupName} size ${randCup}</b>, ${topsName}, ${sugarStr} và ${iceStr} nha!`;

    this.orders.push({
      id: `#${this.orderCounterId}`,
      customer: cust,
      type: isOnline ? 'online' : 'counter',
      name: cust.name,
      avatar: cust.avatar,
      patience: 100,
      speech,
      recipe: {
        cup: randCup,
        tea: randTea.id,
        teaName: randTea.name,
        syrup: randSyrup ? randSyrup.id : null,
        syrupName: randSyrup ? randSyrup.name : null,
        sugar: randSugar,
        ice: randIce,
        toppings: randTops
      }
    });
  }

  resetCup() {
    this.currentCup = {
      cup: null, tea: null, syrup: null,
      sugar: '70%', ice: 'Bình thường', toppings: [],
      isSealing: false, isDelivering: false
    };
  }

  // ================= 6. RENDER GIAO DIỆN CHUẨN TIỆM TRÀ MƠ ƯỚC =================
  renderSellView() {
    const activeOrd = this.orders[this.activeOrderIndex] || null;
    const isMatched = this.isOrderMatched(activeOrd);

    // Kiểm tra checklist
    const cupDone = activeOrd && this.currentCup.cup === activeOrd.recipe.cup;
    const teaDone = activeOrd && this.currentCup.tea === activeOrd.recipe.tea;
    const sugarDone = activeOrd && this.currentCup.sugar === activeOrd.recipe.sugar;
    const iceDone = activeOrd && this.currentCup.ice === activeOrd.recipe.ice;
    const syrupDone = activeOrd && (activeOrd.recipe.syrup ? (this.currentCup.syrup === activeOrd.recipe.syrup) : !this.currentCup.syrup);

    this.elView.innerHTML = `
      <!-- MÁI CHE RÈM HỒNG PASTEL -->
      <div class="cafe-awning-canopy">
        <div class="cafe-awning-scallop"></div>
      </div>

      <!-- KHU VỰC KHÁCH HÀNG & LỜI THOẠI -->
      ${activeOrd ? `
        <div class="customer-dialog-section">
          <div class="chibi-avatar-container">
            ${renderCustomerAvatarSvg(activeOrd.avatar)}
          </div>
          <div class="customer-bubble-card">
            <div class="customer-header-row">
              <span class="customer-name-tag">
                👤 ${activeOrd.name}
              </span>
              <span class="order-badge-pill ${activeOrd.type === 'online' ? 'app' : 'counter'}">
                ${activeOrd.type === 'online' ? `Đơn App ${activeOrd.id}` : `Tại Quầy ${activeOrd.id}`}
              </span>
            </div>

            <div class="customer-dialog-text">
              ${activeOrd.speech}
            </div>

            <!-- Thanh Kiên Nhẫn -->
            <div class="patience-row">
              <span class="patience-label">KIÊN NHẪN:</span>
              <div class="patience-track">
                <div class="patience-bar-fill" style="width: ${activeOrd.patience}%; background: ${activeOrd.patience > 35 ? '#22C55E' : (activeOrd.patience > 20 ? '#F59E0B' : '#EF4444')};"></div>
              </div>
            </div>

            <!-- Checklist nhanh -->
            <div class="checklist-tags-row">
              <span class="req-pill ${cupDone ? 'done' : 'pending'}">${cupDone ? '🟢' : '🔴'} Ly ${activeOrd.recipe.cup}</span>
              <span class="req-pill ${teaDone ? 'done' : 'pending'}">${teaDone ? '🟢' : '🔴'} ${activeOrd.recipe.teaName}</span>
              ${activeOrd.recipe.syrupName ? `<span class="req-pill ${syrupDone ? 'done' : 'pending'}">${syrupDone ? '🟢' : '🔴'} ${activeOrd.recipe.syrupName}</span>` : ''}
              <span class="req-pill ${sugarDone ? 'done' : 'pending'}">${sugarDone ? '🟢' : '🔴'} ${activeOrd.recipe.sugar} đường</span>
              <span class="req-pill ${iceDone ? 'done' : 'pending'}">${iceDone ? '🟢' : '🔴'} ${activeOrd.recipe.ice} đá</span>
              ${activeOrd.recipe.toppings.map(tid => {
                const tDone = this.currentCup.toppings.includes(tid);
                const tObj = TOPPINGS.find(t => t.id === tid);
                return `<span class="req-pill ${tDone ? 'done' : 'pending'}">${tDone ? '🟢' : '🔴'} ${tObj?.name || 'Topping'}</span>`;
              }).join('')}
            </div>
          </div>
        </div>
      ` : ''}

      <!-- QUẦY CHÍNH BÁN HÀNG -->
      <div class="main-cozy-counter-body">
        
        <!-- HÀNG 1: QUẦY TRÀ (9 BÌNH TRÀ + MÁY ĐÓNG NẮP) -->
        <div class="counter-shelf-panel shelf-teas-row">
          <div class="counter-shelf-header">
            <span class="shelf-title-badge">🌱 QUẦY TRÀ</span>
          </div>

          <div class="teas-shelf-flex">
            <!-- Cuộn ngang 9 bình trà to rõ -->
            <div class="dispensers-scroll-grid">
              ${TEAS.map(t => {
                const isSelected = this.currentCup.tea === t.id;
                const isPouring = this.activePouringTea === t.id;
                const qty = state.getTotalQty(t.id);
                return `
                  <button class="dispenser-col-btn ${isSelected ? 'selected' : ''}" data-pick-tea="${t.id}" title="${t.name}">
                    ${renderDispenserSvg(t, isSelected, qty, isPouring)}
                  </button>
                `;
              }).join('')}
            </div>

            <!-- Máy đóng nắp retro bên phải -->
            <div class="sealer-retro-box">
              <button class="sealer-btn-touch" id="btnManualSealServe" title="Dập nắp ly trà sữa">
                ${renderSealerMachineSvg(this.currentCup.isSealing, isMatched)}
              </button>
            </div>
          </div>
        </div>

        <!-- HÀNG 2: BÀN PHA LY (TRÁI) & KHAY TOPPING (PHẢI) -->
        <div class="middle-workbench-split">
          
          <!-- CỘT TRÁI: BÀN PHA LY TO RÕ SỐNG ĐỘNG -->
          <div class="prep-station-col">
            <div class="counter-shelf-header">
              <span class="shelf-title-badge">🧋 PHA LY</span>
            </div>

            <!-- Cọc ly xếp chồng M / L (Chuẩn Ảnh 2) -->
            <div class="cups-select-row">
              <button class="cup-stack-btn ${this.currentCup.cup === 'M' ? 'active' : ''}" data-pick-cup="M" title="Lấy Ly M (500ml)">
                ${renderCupStackSvg('M', state.getTotalQty('cupM'), this.currentCup.cup === 'M')}
              </button>
              <button class="cup-stack-btn ${this.currentCup.cup === 'L' ? 'active' : ''}" data-pick-cup="L" title="Lấy Ly L (700ml)">
                ${renderCupStackSvg('L', state.getTotalQty('cupL'), this.currentCup.cup === 'L')}
              </button>
            </div>

            <!-- THỚT GỖ ĐẶT LY TO SỐNG ĐỘNG -->
            <div class="cutting-board-mat">
              ${this.currentCup.cup ? `
                ${renderBigWorkbenchCupSvg(this.currentCup)}
              ` : `
                <div class="empty-cup-ghost">
                  <span style="font-size: 32px; opacity: 0.6;">🧋</span>
                  <span class="ghost-text">Lấy ly M hoặc L</span>
                </div>
              `}
            </div>

            <!-- BỘ CHỌN ĐƯỜNG & ĐÁ -->
            <div class="condiments-under-cup">
              <div class="condiment-picker-bar">
                <span class="condiment-icon-label">🥄 Đường:</span>
                <div class="condiment-buttons-flex">
                  ${SUGAR_LEVELS.map(s => `
                    <button class="cond-step-btn ${this.currentCup.sugar === s ? 'active' : ''}" data-pick-sugar="${s}">${s}</button>
                  `).join('')}
                </div>
              </div>

              <div class="condiment-picker-bar">
                <span class="condiment-icon-label">🧊 Đá:</span>
                <div class="condiment-buttons-flex">
                  ${ICE_LEVELS.map(ice => `
                    <button class="cond-step-btn ${this.currentCup.ice === ice ? 'active' : ''}" data-pick-ice="${ice}">${ice}</button>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- CÁC NÚT THAO TÁC -->
            <div class="workbench-actions-row">
              <button class="btn-wb-discard" id="btnDiscardCup" ${!this.currentCup.cup ? 'disabled style="opacity: 0.5;"' : ''}>🗑 Đổ Ly</button>
              <button class="btn-wb-serve ${isMatched ? 'ready' : ''}" id="btnWorkbenchServe">
                ${isMatched ? '✨ DẬP NẮP & GIAO' : '⚡ Đang Pha...'}
              </button>
            </div>
          </div>

          <!-- CỘT PHẢI: KHAY TOPPING TO ĐẸP -->
          <div class="counter-shelf-panel toppings-station-col">
            <div class="counter-shelf-header">
              <span class="shelf-title-badge">🧆 KHAY TOPPING</span>
            </div>

            <div class="toppings-scroll-area">
              <div class="toppings-grid-matrix">
                ${TOPPINGS.map(tp => {
                  const inCup = this.currentCup.toppings.includes(tp.id);
                  const qty = state.getTotalQty(tp.id);
                  return `
                    <button class="topping-tray-btn ${inCup ? 'in-cup' : ''}" data-pick-topping="${tp.id}" title="${tp.name}">
                      ${renderToppingSvg(tp, inCup, qty)}
                    </button>
                  `;
                }).join('')}
              </div>
            </div>
          </div>

        </div>

        <!-- HÀNG 3: KỆ SIRO VÒI BƠM LÒ XO -->
        <div class="counter-shelf-panel shelf-syrups-row">
          <div class="counter-shelf-header">
            <span class="shelf-title-badge">🧴 KỆ SIRO</span>
          </div>

          <div class="syrups-scroll-grid">
            ${SYRUPS.map(s => {
              const inCup = this.currentCup.syrup === s.id;
              const isPumping = this.activePumpingSyrup === s.id;
              const qty = state.getTotalQty(s.id);
              return `
                <button class="syrup-bottle-btn ${inCup ? 'in-cup' : ''}" data-pick-syrup="${s.id}" title="${s.name}">
                  ${renderSyrupSvg(s, inCup, qty, isPumping)}
                </button>
              `;
            }).join('')}
          </div>
        </div>

      </div>
    `;

    this.attachSellEvents();
  }

  attachSellEvents() {
    // 1. Chọn cốc
    this.elView.querySelectorAll('[data-pick-cup]').forEach(btn => {
      btn.onclick = (e) => {
        const size = btn.dataset.pickCup;
        audio.click();
        this.currentCup.cup = size;
        triggerFloatReward(e.clientX, e.clientY, `+Ly ${size} 🥤`);
        this.checkAndTriggerAutoSeal();
        this.render();
      };
    });

    // 2. Chọn trà (vòi rót nước chuyển động)
    this.elView.querySelectorAll('[data-pick-tea]').forEach(btn => {
      btn.onclick = (e) => {
        if (!this.currentCup.cup) {
          audio.trash();
          this.showToast('Hãy chạm chọn Ly M hoặc Ly L trước!');
          return;
        }
        const tid = btn.dataset.pickTea;
        audio.pour();
        this.activePouringTea = tid;
        this.currentCup.tea = tid;
        const tObj = TEAS.find(t => t.id === tid);
        triggerFloatReward(e.clientX, e.clientY, `+${tObj ? tObj.name : 'Trà'} 🍃`);
        this.render();

        setTimeout(() => {
          this.activePouringTea = null;
          this.checkAndTriggerAutoSeal();
          this.render();
        }, 350);
      };
    });

    // 3. Chọn đường
    this.elView.querySelectorAll('[data-pick-sugar]').forEach(btn => {
      btn.onclick = (e) => {
        audio.click();
        const s = btn.dataset.pickSugar;
        this.currentCup.sugar = s;
        triggerFloatReward(e.clientX, e.clientY, `${s} Đường ✨`);
        this.checkAndTriggerAutoSeal();
        this.render();
      };
    });

    // 4. Chọn đá
    this.elView.querySelectorAll('[data-pick-ice]').forEach(btn => {
      btn.onclick = (e) => {
        audio.ice();
        const ice = btn.dataset.pickIce;
        this.currentCup.ice = ice;
        triggerFloatReward(e.clientX, e.clientY, `${ice} Đá 🧊`);
        this.checkAndTriggerAutoSeal();
        this.render();
      };
    });

    // 5. Bơm siro (vòi bơm thụt xuống và bật nảy)
    this.elView.querySelectorAll('[data-pick-syrup]').forEach(btn => {
      btn.onclick = (e) => {
        if (!this.currentCup.cup) {
          audio.trash();
          this.showToast('Hãy chọn Ly trước khi bơm siro!');
          return;
        }
        const sid = btn.dataset.pickSyrup;
        const sObj = SYRUPS.find(s => s.id === sid);
        if (this.currentCup.syrup === sid) {
          audio.click();
          this.currentCup.syrup = null;
          this.showToast('Đã bỏ siro ra!');
          this.render();
        } else {
          audio.pump();
          this.activePumpingSyrup = sid;
          this.currentCup.syrup = sid;
          triggerFloatReward(e.clientX, e.clientY, `+${sObj ? sObj.name : 'Siro'} 🧴`);
          this.render();

          setTimeout(() => {
            this.activePumpingSyrup = null;
            this.checkAndTriggerAutoSeal();
            this.render();
          }, 350);
        }
      };
    });

    // 6. Thêm topping (topping nảy bật lên)
    this.elView.querySelectorAll('[data-pick-topping]').forEach(btn => {
      btn.onclick = (e) => {
        if (!this.currentCup.cup) {
          audio.trash();
          this.showToast('Hãy chọn Ly trước khi thêm topping!');
          return;
        }
        const tid = btn.dataset.pickTopping;
        const tObj = TOPPINGS.find(t => t.id === tid);
        const idx = this.currentCup.toppings.indexOf(tid);
        if (idx === -1) {
          audio.boba();
          this.currentCup.toppings.push(tid);
          triggerFloatReward(e.clientX, e.clientY, `+${tObj ? tObj.name : 'Topping'} 🧋`);
        } else {
          audio.click();
          this.currentCup.toppings.splice(idx, 1);
        }
        this.checkAndTriggerAutoSeal();
        this.render();
      };
    });

    // 7. Nút đổ ly
    const btnTrash = document.getElementById('btnDiscardCup');
    if (btnTrash) {
      btnTrash.onclick = () => {
        audio.trash();
        this.resetCup();
        this.showToast('Đã đổ ly làm lại!');
        this.render();
      };
    }

    // 8. Nút Dập Nắp trên Máy & Nút Dập Nắp trên Bàn Pha
    const handleSealAction = () => {
      const ord = this.orders[this.activeOrderIndex];
      if (ord && this.isOrderMatched(ord)) {
        this.triggerManualSealAndServe(ord);
      } else {
        audio.click();
        this.showToast('Chưa đủ nguyên liệu theo công thức khách gọi!');
      }
    };

    const btnManualSeal = document.getElementById('btnManualSealServe');
    if (btnManualSeal) btnManualSeal.onclick = handleSealAction;

    const btnWbServe = document.getElementById('btnWorkbenchServe');
    if (btnWbServe) btnWbServe.onclick = handleSealAction;
  }

  isOrderMatched(ord) {
    if (!ord || !this.currentCup.cup) return false;
    const isCupMatch = this.currentCup.cup === ord.recipe.cup;
    const isTeaMatch = this.currentCup.tea === ord.recipe.tea;
    const isSugarMatch = this.currentCup.sugar === ord.recipe.sugar;
    const isIceMatch = this.currentCup.ice === ord.recipe.ice;
    const isSyrupMatch = ord.recipe.syrup ? (this.currentCup.syrup === ord.recipe.syrup) : (!this.currentCup.syrup);
    const isToppingsMatch = ord.recipe.toppings.every(t => this.currentCup.toppings.includes(t)) &&
                            this.currentCup.toppings.length === ord.recipe.toppings.length;
    return Boolean(isCupMatch && isTeaMatch && isSugarMatch && isIceMatch && isSyrupMatch && isToppingsMatch);
  }

  checkAndTriggerAutoSeal() {
    const ord = this.orders[this.activeOrderIndex];
    if (!ord || this.currentCup.isSealing || this.currentCup.isDelivering) return;

    if (this.isOrderMatched(ord)) {
      this.triggerManualSealAndServe(ord);
    }
  }

  triggerManualSealAndServe(ord) {
    if (this.currentCup.isSealing || this.currentCup.isDelivering) return;
    this.currentCup.isSealing = true;
    audio.sealStamp();

    // Rung màn hình sinh động
    const app = document.getElementById('app');
    if (app) app.classList.add('screen-shake');
    this.showToast('✨ Máy đang tự động dập nắp cơ học...');
    this.render();

    setTimeout(() => {
      if (app) app.classList.remove('screen-shake');
      this.currentCup.isSealing = false;
      this.currentCup.isDelivering = true;
      this.executeDelivery(ord);
    }, 450);
  }

  executeDelivery(ord) {
    audio.serveSuccess();

    state.consumeItem('cup' + ord.recipe.cup);
    state.consumeItem(ord.recipe.tea);
    if (ord.recipe.syrup) state.consumeItem(ord.recipe.syrup);
    ord.recipe.toppings.forEach(tid => state.consumeItem(tid));

    const teaObj = TEAS.find(t => t.id === ord.recipe.tea);
    const baseP = teaObj ? teaObj.price : 20000;
    const sizeP = ord.recipe.cup === 'L' ? 8000 : 0;
    const syrupP = ord.recipe.syrup ? 5000 : 0;
    const topP = ord.recipe.toppings.reduce((sum, tid) => {
      const topObj = TOPPINGS.find(t => t.id === tid);
      return sum + (topObj ? topObj.price : 5000);
    }, 0);

    const fullPrice = baseP + sizeP + syrupP + topP;
    const tip = Math.round(fullPrice * 0.2);
    const totalEarned = fullPrice + tip;

    state.money += totalEarned;
    state.rating = Math.min(5.0, state.rating + 0.05);

    this.dailyReport.served += 1;
    this.dailyReport.revenue += totalEarned;
    this.dailyReport.tips += tip;

    // Pháo hoa confetti rực rỡ
    if (typeof confetti === 'function') {
      try {
        confetti({ particleCount: 50, spread: 65, origin: { y: 0.6 } });
      } catch (e) {}
    }

    // Hiệu ứng chữ tiền bay lên
    triggerFloatReward(window.innerWidth / 2, window.innerHeight / 2, `+${totalEarned.toLocaleString()}đ 💰`);
    this.showToast(`+${totalEarned.toLocaleString()}đ 🥰 ${ord.name}: "Ngon quá trời! Cảm ơn tiệm nha!"`);

    this.orders.splice(this.activeOrderIndex, 1);
    this.activeOrderIndex = 0;
    this.resetCup();
    this.ensureOrderBalance();
    this.render();
  }

  endSellPhase() {
    clearInterval(this.sellTimer);
    audio.serveSuccess();

    const rentCost = 45000;
    const utilitiesCost = 15000;
    const totalRevenue = this.dailyReport.revenue;
    const totalExpenses = rentCost + utilitiesCost;
    const netProfit = totalRevenue - totalExpenses;

    state.money -= totalExpenses;

    this.openModal(`
      <h2>🌙 ĐÓNG CỬA NGÀY ${state.day}</h2>
      <div class="day-end-summary-box">
        <div class="summary-line"><span>Ly đã phục vụ:</span> <b>${this.dailyReport.served} ly</b></div>
        <div class="summary-line"><span>Doanh thu:</span> <b class="pos">+${totalRevenue.toLocaleString()}đ</b></div>
        <div class="summary-line sub"><span>Chi phí mặt bằng & điện:</span> <b class="neg">-${totalExpenses.toLocaleString()}đ</b></div>
        <hr style="border: 0; border-top: 1px dashed #EAD2BC; margin: 6px 0;">
        <div class="summary-line total">
          <span>LỢI NHUẬN RÒNG:</span> 
          <b class="${netProfit >= 0 ? 'pos' : 'neg'}">${netProfit >= 0 ? '+' : ''}${netProfit.toLocaleString()}đ</b>
        </div>
      </div>
      <button id="btnNextDay" class="btn-modal-primary" style="width: 100%; padding: 12px; font-size: 15px; border-radius: 12px;">
        TIẾP TỤC SANG NGÀY ${state.day + 1} ➔
      </button>
    `);

    document.getElementById('btnNextDay').onclick = () => {
      state.day += 1;
      state.save();
      this.closeModal();
      this.startSellPhase();
    };

    state.save();
    this.renderTopBar();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.gameApp = new GameApp();
});
