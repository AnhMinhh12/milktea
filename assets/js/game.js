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

// 1. Bình trà thuỷ tinh nắp bạc và vòi rót
function renderDispenserSvg(t, isSelected, qty, isPouring = false) {
  return `
    <svg viewBox="0 0 75 110" width="100%" height="100%" class="vivid-svg ${isPouring ? 'anim-pouring' : ''}">
      <defs>
        <linearGradient id="lid_${t.id}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FFFFFF"/>
          <stop offset="30%" stop-color="#CBD5E1"/>
          <stop offset="100%" stop-color="#64748B"/>
        </linearGradient>
        <linearGradient id="tea_${t.id}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="${t.liquid}" stop-opacity="0.95"/>
          <stop offset="50%" stop-color="${t.liquid}"/>
          <stop offset="100%" stop-color="${t.liquid}" stop-opacity="0.9"/>
        </linearGradient>
      </defs>
      
      <!-- Nắp kim loại sáng loáng -->
      <path d="M12 7 C12 2, 63 2, 63 7 L60 14 L15 14 Z" fill="url(#lid_${t.id})" stroke="#334155" stroke-width="1.6"/>
      <ellipse cx="37.5" cy="4" rx="6" ry="2.5" fill="#E2E8F0" stroke="#334155" stroke-width="1.2"/>

      <!-- Thân bình thuỷ tinh trong suốt -->
      <rect x="8" y="13" width="59" height="78" rx="6" fill="rgba(255,255,255,0.4)" stroke="#94A3B8" stroke-width="2"/>
      
      <!-- Nước trà sóng sánh bên trong -->
      <path d="M10.5 24 Q24 21 37.5 24 T64.5 24 L64.5 86 Q64.5 89 59 89 L16 89 Q10.5 89 10.5 86 Z" fill="url(#tea_${t.id})"/>
      <path d="M11 25 Q24 23 37.5 25 T64 25" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" fill="none"/>

      <!-- Vệt sáng phản quang -->
      <path d="M13 16 L13 83" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity="0.75"/>
      
      <!-- Biểu tượng hoa/trái cây -->
      <text x="37.5" y="46" font-size="16" text-anchor="middle" filter="drop-shadow(0 2px 2px rgba(0,0,0,0.5))">${t.icon}</text>

      <!-- Nhãn chữ to đậm viền bo góc -->
      <rect x="4" y="58" width="67" height="20" rx="3.5" fill="#FFFFFF" stroke="#3D2214" stroke-width="1.8"/>
      <text x="37.5" y="72" font-family="'Paytone One', 'Nunito', sans-serif" font-size="8.8" font-weight="900" fill="#3D2214" text-anchor="middle">${t.name}</text>

      <!-- Vòi rót kim loại đen ở đáy -->
      <g class="spout-assembly ${isPouring ? 'spout-open' : ''}">
        <path d="M31 91 L44 91 L41 100 L34 100 Z" fill="#1E293B" stroke="#0F172A" stroke-width="1.2"/>
        <path d="M35 100 L40 100 L39 107 L36 107 Z" fill="#0F172A"/>
        <circle cx="37.5" cy="95" r="2.5" fill="#64748B"/>
        <path d="M37.5 95 L46 ${isPouring ? 101 : 93}" stroke="#EF4444" stroke-width="2" stroke-linecap="round"/>
      </g>
    </svg>
  `;
}

// 2. Máy đóng nắp retro vintage với cuộn hoa xoay
function renderSealerMachineSvg(isSealing, isReady) {
  return `
    <svg viewBox="0 0 110 130" width="100%" height="100%" class="vivid-svg ${isSealing ? 'anim-stamping' : ''}">
      <defs>
        <linearGradient id="sealerGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FB923C"/>
          <stop offset="100%" stop-color="#EA580C"/>
        </linearGradient>
      </defs>
      
      <!-- Cuộn màng hoa xoay tròn -->
      <g class="film-roll ${isSealing ? 'anim-spin' : ''}">
        <circle cx="25" cy="18" r="13" fill="url(#sealerGrad)" stroke="#9A3412" stroke-width="1.5"/>
        <circle cx="85" cy="18" r="13" fill="url(#sealerGrad)" stroke="#9A3412" stroke-width="1.5"/>
        <rect x="25" y="7" width="60" height="22" rx="3.5" fill="#FEF3C7" stroke="#EA580C" stroke-width="1.5"/>
        <text x="55" y="22" font-size="11" text-anchor="middle" fill="#EA580C">🌸 🌸 🌸</text>
      </g>

      <!-- Khung máy -->
      <path d="M12 30 L98 30 L94 90 L16 90 Z" fill="#F8FAFC" stroke="#334155" stroke-width="2"/>
      <rect x="18" y="36" width="74" height="34" rx="4" fill="#E2E8F0" stroke="#64748B" stroke-width="1.6"/>
      
      <!-- Nút ĐÓNG NẮP to nổi bật -->
      <rect x="25" y="43" width="60" height="21" rx="4.5" fill="${isReady ? '#22C55E' : '#64748B'}" stroke="#0F172A" stroke-width="1.6"/>
      <text x="55" y="57" font-family="'Paytone One', 'Nunito', sans-serif" font-size="9" font-weight="900" fill="#FFFFFF" text-anchor="middle">ĐÓNG NẮP</text>
      
      <!-- Trục dập nắp -->
      <rect x="35" y="72" width="40" height="${isSealing ? 26 : 14}" rx="2" fill="#475569" stroke="#0F172A" stroke-width="1.6"/>

      <!-- Khay đặt ly -->
      <ellipse cx="55" cy="112" rx="28" ry="9" fill="#E2E8F0" stroke="#334155" stroke-width="1.8"/>
      <ellipse cx="55" cy="112" rx="18" ry="5.5" fill="#CBD5E1" stroke="#64748B" stroke-width="1.2"/>
    </svg>
  `;
}

// 3. Khay Topping trong suốt với hình ảnh đồ ăn 3D
function renderToppingSvg(tp, inCup, qty) {
  return `
    <svg viewBox="0 0 85 85" width="100%" height="100%" class="vivid-svg ${inCup ? 'bounce-in' : ''}">
      <defs>
        <linearGradient id="trayGlass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="#E2E8F0" stop-opacity="0.6"/>
        </linearGradient>
      </defs>
      <!-- Khay thuỷ tinh viền kép -->
      <rect x="2" y="2" width="81" height="81" rx="8" fill="url(#trayGlass)" stroke="#94A3B8" stroke-width="2.2"/>
      <rect x="5.5" y="5.5" width="74" height="74" rx="6" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
      
      <!-- Đồ hoạ món ăn topping -->
      ${renderFoodGraphics(tp.id)}
      
      <!-- Bảng tên chữ to đậm viền đen bo góc -->
      <rect x="2" y="58" width="81" height="21" rx="3.5" fill="#FFFFFF" stroke="#3D2214" stroke-width="1.8"/>
      <text x="42.5" y="72.5" font-family="'Paytone One', 'Nunito', sans-serif" font-size="8.2" font-weight="900" fill="#3D2214" text-anchor="middle">${tp.name}</text>
    </svg>
  `;
}

function renderFoodGraphics(id) {
  // Trân châu đen óng ánh
  if (id === 'tranChau') {
    return `
      <g>
        <circle cx="26" cy="26" r="9" fill="#181311"/><circle cx="23.5" cy="23.5" r="2.5" fill="#FFF" opacity="0.9"/>
        <circle cx="47" cy="24" r="9.5" fill="#181311"/><circle cx="44.5" cy="21.5" r="2.5" fill="#FFF" opacity="0.9"/>
        <circle cx="36" cy="40" r="10" fill="#181311"/><circle cx="33" cy="36.5" r="3" fill="#FFF" opacity="0.95"/>
        <circle cx="56" cy="40" r="8.5" fill="#181311"/><circle cx="53.5" cy="37.5" r="2.2" fill="#FFF" opacity="0.9"/>
      </g>
    `;
  }
  // Trân châu hoàng kim
  if (id === 'tranChauHoangKim') {
    return `
      <g>
        <circle cx="26" cy="26" r="9" fill="#EAB308"/><circle cx="23.5" cy="23.5" r="2.8" fill="#FFF" opacity="0.95"/>
        <circle cx="47" cy="24" r="9.5" fill="#CA8A04"/><circle cx="44.5" cy="21.5" r="2.8" fill="#FFF" opacity="0.95"/>
        <circle cx="36" cy="40" r="10" fill="#EAB308"/><circle cx="33" cy="36.5" r="3.2" fill="#FFF" opacity="0.98"/>
        <circle cx="56" cy="40" r="8.5" fill="#CA8A04"/>
      </g>
    `;
  }
  // Thạch matcha xanh mướt
  if (id === 'thachMatcha') {
    return `
      <g>
        <rect x="16" y="18" width="18" height="18" rx="2.5" fill="#15803D"/><polygon points="16,18 23,11 41,11 34,18" fill="#4ADE80"/><polygon points="34,18 41,11 41,29 34,36" fill="#166534"/>
        <rect x="39" y="27" width="19" height="19" rx="2.5" fill="#15803D"/><polygon points="39,27 46,20 65,20 58,27" fill="#4ADE80"/>
      </g>
    `;
  }
  // Thạch 3Q / Trái cây
  if (id === 'thach3Q' || id === 'thachTraiCay') {
    return `
      <g>
        <rect x="16" y="19" width="16" height="16" rx="2.5" fill="#F97316"/><polygon points="16,19 22,13 38,13 32,19" fill="#FDBA74"/>
        <rect x="42" y="15" width="17" height="17" rx="2.5" fill="#EF4444"/><polygon points="42,15 48,9 65,9 59,15" fill="#FCA5A5"/>
        <rect x="33" y="32" width="18" height="18" rx="2.5" fill="#22C55E"/><polygon points="33,32 39,26 57,26 51,32" fill="#86EFAC"/>
      </g>
    `;
  }
  // Kem phô mai
  if (id === 'kemPhoMai') {
    return `
      <g>
        <path d="M20 46 C20 32, 31 22, 42 16 C53 22, 64 32, 64 46 Z" fill="#FEF08A"/>
        <path d="M26 43 C32 32, 52 32, 58 43" stroke="#FACC15" stroke-width="2.5" fill="none"/>
        <path d="M42 16 C38 10, 46 8, 42 6" stroke="#FEF08A" stroke-width="3.5" stroke-linecap="round"/>
      </g>
    `;
  }
  // Pudding trứng
  if (id === 'pudding') {
    return `
      <g>
        <rect x="18" y="20" width="20" height="20" rx="3.5" fill="#FACC15"/><polygon points="18,20 25,13 45,13 38,20" fill="#FEF08A"/>
        <rect x="40" y="28" width="22" height="22" rx="3.5" fill="#FACC15"/><polygon points="40,28 47,21 69,21 62,28" fill="#FEF08A"/>
      </g>
    `;
  }
  // Sương sáo / Thạch đen
  if (id === 'suongSao' || id === 'thachDen') {
    return `
      <g>
        <rect x="16" y="18" width="18" height="18" rx="2" fill="#1E293B"/><polygon points="16,18 23,11 41,11 34,18" fill="#475569"/><polygon points="34,18 41,11 41,29 34,36" fill="#0F172A"/>
        <rect x="40" y="27" width="20" height="20" rx="2" fill="#1E293B"/><polygon points="40,27 47,20 67,20 60,27" fill="#64748B"/>
      </g>
    `;
  }
  // Đậu đỏ
  if (id === 'dauDo') {
    return `
      <g>
        <ellipse cx="26" cy="24" rx="8" ry="6" fill="#7F1D1D" transform="rotate(-15 26 24)"/><circle cx="24" cy="22" r="1.8" fill="#FFF" opacity="0.75"/>
        <ellipse cx="46" cy="21" rx="8" ry="6.5" fill="#991B1B" transform="rotate(20 46 21)"/><circle cx="44" cy="19" r="1.8" fill="#FFF" opacity="0.75"/>
        <ellipse cx="35" cy="36" rx="9" ry="6.5" fill="#7F1D1D"/><circle cx="33" cy="33.5" r="2" fill="#FFF" opacity="0.8"/>
      </g>
    `;
  }
  // Nha đam / Thạch trắng / Thạch dừa
  return `
    <g>
      <rect x="16" y="19" width="18" height="18" rx="2.5" fill="#ECFDF5" stroke="#A7F3D0" stroke-width="1.5"/><polygon points="16,19 23,12 41,12 34,19" fill="#FFFFFF"/>
      <rect x="40" y="26" width="20" height="20" rx="2.5" fill="#ECFDF5" stroke="#A7F3D0" stroke-width="1.5"/><polygon points="40,26 47,19 67,19 60,26" fill="#FFFFFF"/>
    </g>
  `;
}

// 4. Chai siro thuỷ tinh có vòi bơm lò xo
function renderSyrupSvg(s, inCup, qty, isPumping = false) {
  return `
    <svg viewBox="0 0 75 110" width="100%" height="100%" class="vivid-svg ${isPumping ? 'anim-pumping' : ''}">
      <defs>
        <linearGradient id="syrup_${s.id}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="${s.color}" stop-opacity="0.95"/>
          <stop offset="50%" stop-color="${s.color}"/>
          <stop offset="100%" stop-color="${s.color}" stop-opacity="0.9"/>
        </linearGradient>
      </defs>

      <!-- Đầu vòi bơm lò xo -->
      <g class="pump-mechanism ${isPumping ? 'pressed' : ''}">
        <path d="M32 15 L43 15 L43 21 L32 21 Z" fill="#334155"/>
        <path d="M37.5 6 L37.5 15" stroke="#334155" stroke-width="3" stroke-linecap="round"/>
        <path d="M20 5 L45 5 C47 5, 48 8, 46 10 L37.5 11" fill="#1E293B" stroke="#0F172A" stroke-width="1.4"/>
      </g>

      <!-- Thân chai vai cong -->
      <path d="M20 29 C20 22, 55 22, 55 29 L58 92 C58 96, 17 96, 17 92 Z" fill="rgba(255,255,255,0.35)" stroke="#94A3B8" stroke-width="1.8"/>
      
      <!-- Nước siro tươi sáng -->
      <path d="M19 39 C19 37, 56 37, 56 39 L56 91 Q56 94 51 94 L24 94 Q19 94 19 91 Z" fill="url(#syrup_${s.id})"/>
      <path d="M22 32 L22 88" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>

      <!-- Thẻ nhãn to rõ -->
      <rect x="11" y="54" width="53" height="36" rx="3.5" fill="#FFFFFF" stroke="#3D2214" stroke-width="1.6"/>
      <text x="37.5" y="68" font-family="'Paytone One', 'Nunito', sans-serif" font-size="8.8" font-weight="900" fill="#3D2214" text-anchor="middle">${s.name}</text>
      <text x="37.5" y="85" font-size="15" text-anchor="middle">${s.icon}</text>
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
    this.viewMode = 'sell';
    this.isPaused = false;
    this.sellTimer = null;
    this.gameSeconds = 0;
    this.maxDaySeconds = 90;

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
        <h2>⏸ QUẢN LÝ TIỆM TRÀ SỮA</h2>
        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 12px;">
          <button class="btn-modal-primary" id="btnResume">▶️ Tiếp Tục Bán Hàng</button>
          <button class="btn-modal-confirm" id="btnResetCupEarly">🗑 Đổ Ly Đang Pha</button>
          <button class="btn-modal-cancel" id="btnEndDayEarly">🌙 Đóng Cửa Tiệm Sớm</button>
        </div>
      `);

      document.getElementById('btnResume').onclick = () => this.togglePause();
      document.getElementById('btnResetCupEarly').onclick = () => {
        this.resetCup();
        this.showToast('Đã đổ ly làm lại!');
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
    this.renderSellView();
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
                    <span class="qty-tag">${qty}</span>
                    ${renderDispenserSvg(t, isSelected, qty, isPouring)}
                  </button>
                `;
              }).join('')}
            </div>

            <!-- Máy đóng nắp retro bên phải -->
            <div class="sealer-retro-box">
              <button class="sealer-btn-touch" id="btnManualSealServe">
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

            <!-- Chọn ly M / L -->
            <div class="cups-select-row">
              <button class="cup-item-pill ${this.currentCup.cup === 'M' ? 'active' : ''}" data-pick-cup="M">
                <span class="qty-tag">${state.getTotalQty('cupM')}</span>
                <span style="font-size: 16px;">🥤</span>
                <span class="cup-name-label">Ly M</span>
              </button>
              <button class="cup-item-pill ${this.currentCup.cup === 'L' ? 'active' : ''}" data-pick-cup="L">
                <span class="qty-tag">${state.getTotalQty('cupL')}</span>
                <span style="font-size: 18px;">🧋</span>
                <span class="cup-name-label">Ly L</span>
              </button>
            </div>

            <!-- THỚT GỖ ĐẶT LY TO SỐNG ĐỘNG -->
            <div class="cutting-board-mat">
              ${this.currentCup.cup ? `
                ${renderBigWorkbenchCupSvg(this.currentCup)}
              ` : `
                <div class="empty-cup-ghost">
                  <span style="font-size: 32px; opacity: 0.6;">🧋</span>
                  <span class="ghost-text">Chạm chọn Ly M hoặc Ly L để bắt đầu pha</span>
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
                    <button class="topping-tray-btn ${inCup ? 'in-cup' : ''}" data-pick-topping="${tp.id}">
                      <span class="qty-tag">${qty}</span>
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
                <button class="syrup-bottle-btn ${inCup ? 'in-cup' : ''}" data-pick-syrup="${s.id}">
                  <span class="qty-tag">${qty}</span>
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
