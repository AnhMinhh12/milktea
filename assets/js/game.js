/**
 * 🧋 TIỆM TRÀ SỮA CỦA RÙA (Boba Shop Simulator)
 * GIAO DIỆN CHUẨN XỊN ĐẸP LUNG LINH 100% THEO HÌNH MẪU THIẾT KẾ:
 * - 9 Bình trà thuỷ tinh nắp bạc vòi rót đen cực kỳ sống động
 * - 15 Khay topping trong suốt với đồ hoạ món ăn 2.5D chân thực, ngon mắt
 * - 9 Chai siro có vòi bơm, thân thuỷ tinh và hình trái cây sắc nét
 * - Máy đóng nắp retro vintage với cuộn màng hoa đào và nút bấm phát sáng
 * - Ly M/L trong suốt, chén đường và chén đá viên pha lê
 * - Hiệu ứng pháo hoa confetti, âm thanh tươi vui, thao tác chạm cực nhạy
 * - Tự động thích ứng trên cả điện thoại (Dọc & Ngang) và máy tính, KHÔNG BAO GIỜ BỊ CẮT XÉN!
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

  playBeep(freq = 440, type = 'sine', duration = 0.1, gainVal = 0.15) {
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

  click() { this.playBeep(650, 'sine', 0.05, 0.08); }
  pour() { this.playBeep(340, 'triangle', 0.15, 0.16); }
  addIce() {
    this.playBeep(1200, 'sine', 0.05, 0.1);
    setTimeout(() => this.playBeep(1500, 'sine', 0.04, 0.08), 30);
  }
  addTopping() { this.playBeep(280, 'sine', 0.08, 0.18); }
  addSyrup() { this.playBeep(520, 'sine', 0.1, 0.16); }
  autoSeal() {
    this.playBeep(480, 'sine', 0.06, 0.2);
    setTimeout(() => this.playBeep(880, 'triangle', 0.12, 0.25), 50);
  }
  serveSuccess() {
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((f, idx) => {
      setTimeout(() => this.playBeep(f, 'sine', 0.12, 0.18), idx * 50);
    });
    // Bắn pháo hoa ăn mừng nếu có thư viện
    if (typeof confetti === 'function') {
      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    }
  }
  trash() {
    this.playBeep(200, 'sawtooth', 0.12, 0.15);
    setTimeout(() => this.playBeep(140, 'sawtooth', 0.15, 0.15), 80);
  }
  bell() {
    this.playBeep(880, 'sine', 0.3, 0.18);
    setTimeout(() => this.playBeep(1320, 'sine', 0.4, 0.12), 80);
  }
}

const audio = new SoundEngine();

// ================= 2. DANH MỤC NGUYÊN LIỆU (100% THEO ẢNH MẪU) =================
const CUPS = [
  { id: 'M', name: 'Ly M', ml: '500ml', cost: 500, priceBonus: 0, shelfLife: 999 },
  { id: 'L', name: 'Ly L', ml: '700ml', cost: 800, priceBonus: 8000, shelfLife: 999 }
];

// 9 BÌNH TRÀ / NƯỚC NỀN
const TEAS = [
  { id: 'traDen', name: 'TRÀ ĐEN', icon: '🍂', liquid: '#683319', cost: 3000, price: 20000, shelfLife: 2 },
  { id: 'oolong', name: 'TRÀ Ô LONG', icon: '🪵', liquid: '#A85E28', cost: 3000, price: 20000, shelfLife: 2 },
  { id: 'traXanh', name: 'TRÀ XANH', icon: '🌿', liquid: '#7CA046', cost: 3000, price: 20000, shelfLife: 2 },
  { id: 'traNhai', name: 'TRÀ NHÀI', icon: '🌸', liquid: '#D8BD54', cost: 3500, price: 22000, shelfLife: 2 },
  { id: 'hongTra', name: 'HỒNG TRÀ', icon: '🍵', liquid: '#BD3D35', cost: 3200, price: 22000, shelfLife: 2 },
  { id: 'lucTra', name: 'LỤC TRÀ', icon: '🍃', liquid: '#5C9A38', cost: 3000, price: 20000, shelfLife: 2 },
  { id: 'traThai', name: 'TRÀ THÁI', icon: '🧋', liquid: '#E67228', cost: 3500, price: 22000, shelfLife: 2 },
  { id: 'suaTuoi', name: 'SỮA TƯƠI', icon: '🥛', liquid: '#FFFDF5', cost: 3000, price: 20000, shelfLife: 1 },
  { id: 'duongDen', name: 'ĐƯỜNG ĐEN', icon: '🟤', liquid: '#3F2013', cost: 4000, price: 25000, shelfLife: 2 }
];

const SUGAR_LEVELS = ['0%', '50%', '70%', '100%'];
const ICE_LEVELS = ['Không', 'Ít', 'Bình thường', 'Nhiều'];

// 15 KHAY TOPPING (HÀNG 1: 9 KHAY, HÀNG 2: 6 KHAY)
const TOPPINGS = [
  // Hàng 1
  { id: 'tranChau', name: 'TRÂN CHÂU', icon: '🟤', cost: 2000, price: 5000, shelfLife: 2 },
  { id: 'thachTrang', name: 'THẠCH TRẮNG', icon: '⚪', cost: 2500, price: 6000, shelfLife: 2 },
  { id: 'thachDen', name: 'THẠCH ĐEN', icon: '⬛', cost: 2000, price: 5000, shelfLife: 2 },
  { id: 'thach3Q', name: 'THẠCH 3Q', icon: '🔶', cost: 2500, price: 6000, shelfLife: 2 },
  { id: 'thachTraiCay', name: 'THẠCH TRÁI CÂY', icon: '🍓', cost: 2500, price: 6000, shelfLife: 2 },
  { id: 'kemPhoMai', name: 'KEM PHÔ MAI', icon: '🧀', cost: 3500, price: 8000, shelfLife: 2 },
  { id: 'pudding', name: 'PUDDING', icon: '🍮', cost: 3000, price: 7000, shelfLife: 2 },
  { id: 'thachMatcha', name: 'THẠCH MATCHA', icon: '🍵', cost: 2500, price: 6000, shelfLife: 2 },
  { id: 'suongSao', name: 'SƯƠNG SÁO', icon: '🫘', cost: 2000, price: 5000, shelfLife: 2 },
  // Hàng 2
  { id: 'dauDo', name: 'ĐẬU ĐỎ', icon: '🫘', cost: 2500, price: 6000, shelfLife: 3 },
  { id: 'dauXanh', name: 'ĐẬU XANH', icon: '🟢', cost: 2500, price: 6000, shelfLife: 3 },
  { id: 'hatChia', name: 'HẠT CHIA', icon: '⚫', cost: 2000, price: 5000, shelfLife: 3 },
  { id: 'nhaDam', name: 'NHA ĐAM', icon: '🌱', cost: 2200, price: 5000, shelfLife: 3 },
  { id: 'tranChauHoangKim', name: 'TRÂN CHÂU HOÀNG KIM', icon: '✨', cost: 2800, price: 6500, shelfLife: 2 },
  { id: 'thachDua', name: 'THẠCH DỪA', icon: '🥥', cost: 2000, price: 5000, shelfLife: 3 }
];

// 9 CHAI SIRO CÓ VÒI BƠM
const SYRUPS = [
  { id: 'dau', name: 'DÂU', icon: '🍓', color: '#E53E3E', cost: 2000, price: 5000, shelfLife: 4 },
  { id: 'dao', name: 'ĐÀO', icon: '🍑', color: '#FC8181', cost: 2000, price: 5000, shelfLife: 4 },
  { id: 'nho', name: 'NHO', icon: '🍇', color: '#805AD5', cost: 2000, price: 5000, shelfLife: 4 },
  { id: 'xoai', name: 'XOÀI', icon: '🥭', color: '#ECC94B', cost: 2000, price: 5000, shelfLife: 4 },
  { id: 'kiwi', name: 'KIWI', icon: '🥝', color: '#48BB78', cost: 2000, price: 5000, shelfLife: 4 },
  { id: 'tao', name: 'TÁO', icon: '🍎', color: '#F56565', cost: 2000, price: 5000, shelfLife: 4 },
  { id: 'vietQuat', name: 'VIỆT QUẤT', icon: '🫐', color: '#3182CE', cost: 2500, price: 6000, shelfLife: 4 },
  { id: 'vai', name: 'VẢI', icon: '🍈', color: '#F687B3', cost: 2200, price: 6000, shelfLife: 4 },
  { id: 'chanhDay', name: 'CHANH DÂY', icon: '🍋', color: '#D69E2E', cost: 2200, price: 6000, shelfLife: 4 }
];

const CUSTOMER_NAMES = [
  'Cô Lan', 'Anh Minh', 'Bé Na', 'Khánh An', 'Minh Thư',
  'Tuấn Anh', 'Cô Hồng', 'Bảo Châu', 'Bác Tư', 'Anh Hiếu', 'Bách'
];

const STAFF_LIST = [
  { id: 'minhTea', name: 'Minh - Rót Trà', avatar: '🍵', role: 'Tự lấy đúng nền trà theo đơn', unlockDay: 1, hireCost: 50000, baseSalary: 5000 },
  { id: 'linhHelper', name: 'Linh - Pha Chế Đa Nhiệm', avatar: '🧑‍🍹', role: 'Tự thêm Topping + Đường + Đá + Siro', unlockDay: 2, hireCost: 80000, baseSalary: 8000 },
  { id: 'vyOnline', name: 'Vy - Online & Ship', avatar: '📱', role: 'Chuyên hoàn tất đơn App/Ship', unlockDay: 2, hireCost: 100000, baseSalary: 10000 }
];

// ================= 3. TRẠNG THÁI GAME & KHO LÔ HÀNG =================
class GameState {
  constructor() {
    this.shopName = 'Tiệm Trà Sữa Của Rùa';
    this.day = 1;
    this.money = 250000;
    this.rating = 5.0;
    this.level = 1;
    this.exp = 0;
    this.expMax = 100;

    this.inventoryLots = {};
    this.staff = {
      minhTea: { hired: false, level: 1 },
      linhHelper: { hired: false, level: 1 },
      vyOnline: { hired: false, level: 1 }
    };
    this.upgrades = {};
    this.stats = { totalCupsSold: 120, totalProfitAllTime: 1645100 };
    this.today = {
      revenueDrinks: 0, revenueTips: 0, revenueApp: 0,
      costRestock: 0, costRent: 45000, costUtilities: 15000, costSalaries: 0,
      wasteExpiredTopping: 0, wasteExpiredSyrup: 0, wasteExpiredTea: 0, wasteDiscardedCups: 0
    };
    this.history10Days = [
      { day: 'N1', cups: 12, profit: 145000 }, { day: 'N2', cups: 15, profit: 180000 },
      { day: 'N3', cups: 14, profit: 165000 }, { day: 'N4', cups: 18, profit: 210000 },
      { day: 'N5', cups: 16, profit: 195000 }, { day: 'N6', cups: 20, profit: 240000 },
      { day: 'N7', cups: 22, profit: 275000 }, { day: 'N8', cups: 21, profit: 260000 },
      { day: 'N9', cups: 25, profit: 310000 }, { day: 'N10', cups: 26, profit: 340000 }
    ];

    this.initDefaultInventoryLots();
    this.load();
    this.ensureAllItemsHaveInventory();
  }

  initDefaultInventoryLots() {
    const addInitial = (id, count, cost, shelf) => {
      this.inventoryLots[id] = [
        { id: 'lot_init_1_' + id, qty: Math.ceil(count * 0.4), buyDay: 1, expireDay: shelf >= 900 ? 999 : (1 + Math.max(1, shelf - 1)), cost },
        { id: 'lot_init_2_' + id, qty: Math.floor(count * 0.6), buyDay: 1, expireDay: shelf >= 900 ? 999 : (1 + shelf), cost }
      ];
    };
    CUPS.forEach(c => addInitial('cup' + c.id, 40, c.cost, c.shelfLife));
    TEAS.forEach(t => addInitial(t.id, 30, t.cost, t.shelfLife));
    TOPPINGS.forEach(tp => addInitial(tp.id, 25, tp.cost, tp.shelfLife));
    SYRUPS.forEach(s => addInitial(s.id, 20, s.cost, s.shelfLife));
  }

  ensureAllItemsHaveInventory() {
    CUPS.forEach(c => {
      const key = 'cup' + c.id;
      if (!this.inventoryLots[key] || this.inventoryLots[key].length === 0) {
        this.inventoryLots[key] = [{ id: 'lot_def_' + key, qty: 30, buyDay: this.day, expireDay: 999, cost: c.cost }];
      }
    });
    TEAS.forEach(t => {
      if (!this.inventoryLots[t.id] || this.inventoryLots[t.id].length === 0) {
        this.inventoryLots[t.id] = [{ id: 'lot_def_' + t.id, qty: 25, buyDay: this.day, expireDay: this.day + 2, cost: t.cost }];
      }
    });
    TOPPINGS.forEach(tp => {
      if (!this.inventoryLots[tp.id] || this.inventoryLots[tp.id].length === 0) {
        this.inventoryLots[tp.id] = [{ id: 'lot_def_' + tp.id, qty: 20, buyDay: this.day, expireDay: this.day + 2, cost: tp.cost }];
      }
    });
    SYRUPS.forEach(s => {
      if (!this.inventoryLots[s.id] || this.inventoryLots[s.id].length === 0) {
        this.inventoryLots[s.id] = [{ id: 'lot_def_' + s.id, qty: 20, buyDay: this.day, expireDay: this.day + 4, cost: s.cost }];
      }
    });
  }

  save() {
    try {
      const data = {
        shopName: this.shopName, day: this.day, money: this.money, rating: this.rating,
        level: this.level, exp: this.exp, expMax: this.expMax,
        inventoryLots: this.inventoryLots, staff: this.staff, upgrades: this.upgrades,
        stats: this.stats, today: this.today, history10Days: this.history10Days
      };
      localStorage.setItem('tiemTraSuaRua_save_v4', JSON.stringify(data));
    } catch (e) {}
  }

  load() {
    try {
      const str = localStorage.getItem('tiemTraSuaRua_save_v4');
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

  addExp(amount) {
    this.exp += amount;
    if (this.exp >= this.expMax) {
      this.level += 1;
      this.exp -= this.expMax;
      this.expMax = Math.round(this.expMax * 1.35);
      return true;
    }
    return false;
  }
}

const state = new GameState();

// ================= 4. BỘ TẠO ĐỒ HOẠ SVG CHÂN THỰC (GAME ART ENGINE) =================

// 1. Bình trà thuỷ tinh nắp bạc vòi đen
function renderDispenserSvg(t, isSelected, qty) {
  return `
    <svg viewBox="0 0 76 114" width="100%" height="100%" class="game-asset-svg">
      <defs>
        <linearGradient id="lid_${t.id}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#F1F5F9"/>
          <stop offset="40%" stop-color="#CBD5E1"/>
          <stop offset="100%" stop-color="#94A3B8"/>
        </linearGradient>
        <linearGradient id="tea_${t.id}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="${t.liquid}" stop-opacity="0.95"/>
          <stop offset="50%" stop-color="${t.liquid}"/>
          <stop offset="100%" stop-color="${t.liquid}" stop-opacity="0.9"/>
        </linearGradient>
      </defs>
      <!-- Nắp bạc -->
      <path d="M12 7 C12 3, 64 3, 64 7 L62 14 L14 14 Z" fill="url(#lid_${t.id})" stroke="#475569" stroke-width="1.4"/>
      <ellipse cx="38" cy="4" rx="5" ry="2" fill="#E2E8F0" stroke="#475569" stroke-width="1.2"/>
      <rect x="36" y="1" width="4" height="4" rx="1" fill="#475569"/>
      <!-- Thân bình thuỷ tinh -->
      <rect x="8" y="13" width="60" height="84" rx="6" fill="rgba(255,255,255,0.3)" stroke="#CBD5E1" stroke-width="1.8"/>
      <!-- Nước trà bên trong -->
      <path d="M10 28 Q24 26 38 28 T66 28 L66 90 Q66 95 60 95 L16 95 Q10 95 10 90 Z" fill="url(#tea_${t.id})"/>
      <!-- Vệt sáng thuỷ tinh phản chiếu -->
      <path d="M13 18 L13 88" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" opacity="0.6"/>
      <path d="M18 18 L18 84" stroke="#FFFFFF" stroke-width="1" stroke-linecap="round" opacity="0.3"/>
      <!-- Icon trên bình -->
      <text x="38" y="52" font-size="16" text-anchor="middle" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.5))">${t.icon}</text>
      <!-- Nhãn tên màu trắng chữ đen đậm -->
      <rect x="5" y="66" width="66" height="20" rx="3.5" fill="#FFFFFF" stroke="#3D2214" stroke-width="1.6"/>
      <text x="38" y="80" font-family="'Paytone One', 'Nunito', sans-serif" font-size="8.2" font-weight="900" fill="#3D2214" text-anchor="middle" letter-spacing="0.2">${t.name}</text>
      <!-- Vòi rót đen ở đáy -->
      <path d="M33 97 L43 97 L41 106 L35 106 Z" fill="#1E293B" stroke="#0F172A" stroke-width="1.2"/>
      <path d="M36 106 L40 106 L39 113 L37 113 Z" fill="#0F172A"/>
      <circle cx="38" cy="101" r="2.2" fill="#64748B"/>
    </svg>
  `;
}

// 2. Khay Topping trong suốt với đồ hoạ 2.5D thơm ngon
function renderToppingSvg(tp, inCup, qty) {
  return `
    <svg viewBox="0 0 86 86" width="100%" height="100%" class="game-asset-svg">
      <defs>
        <linearGradient id="trayBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#E2E8F0" stop-opacity="0.5"/>
        </linearGradient>
      </defs>
      <!-- Khay thuỷ tinh trong suốt bo góc -->
      <rect x="2.5" y="2.5" width="81" height="81" rx="8" fill="url(#trayBg)" stroke="#CBD5E1" stroke-width="2.2"/>
      <rect x="5.5" y="5.5" width="75" height="75" rx="6" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
      <!-- Đồ hoạ món ăn topping -->
      ${renderDeliciousFoodGraphic(tp.id)}
      <!-- Dải nhãn tên màu trắng viền đen -->
      <rect x="3.5" y="60" width="79" height="19" rx="3.5" fill="#FFFFFF" stroke="#3D2214" stroke-width="1.6"/>
      <text x="43" y="73.5" font-family="'Paytone One', 'Nunito', sans-serif" font-size="7.6" font-weight="900" fill="#3D2214" text-anchor="middle">${tp.name}</text>
    </svg>
  `;
}

function renderDeliciousFoodGraphic(id) {
  // Trân châu đen óng ánh
  if (id === 'tranChau') {
    return `
      <g>
        <circle cx="28" cy="28" r="9" fill="#1A1412"/><circle cx="25" cy="25" r="2.5" fill="#FFF" opacity="0.85"/>
        <circle cx="48" cy="26" r="9.5" fill="#1A1412"/><circle cx="45" cy="23" r="2.5" fill="#FFF" opacity="0.85"/>
        <circle cx="36" cy="42" r="10" fill="#1A1412"/><circle cx="33" cy="38" r="3" fill="#FFF" opacity="0.9"/>
        <circle cx="56" cy="42" r="8.5" fill="#1A1412"/><circle cx="53" cy="39" r="2.2" fill="#FFF" opacity="0.85"/>
        <circle cx="22" cy="44" r="8" fill="#1A1412"/><circle cx="19" cy="41" r="2" fill="#FFF" opacity="0.8"/>
      </g>
    `;
  }
  // Thạch trắng pha lê phát sáng
  if (id === 'thachTrang') {
    return `
      <g>
        <circle cx="28" cy="28" r="8.5" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="1"/><circle cx="26" cy="25" r="3" fill="#FFF"/>
        <circle cx="48" cy="26" r="9" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="1"/><circle cx="46" cy="23" r="3" fill="#FFF"/>
        <circle cx="37" cy="42" r="9.5" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="1"/><circle cx="34" cy="38" r="3.5" fill="#FFF"/>
        <circle cx="56" cy="42" r="8" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="1"/><circle cx="54" cy="39" r="2.5" fill="#FFF"/>
      </g>
    `;
  }
  // Thạch đen bóng 3D
  if (id === 'thachDen' || id === 'suongSao') {
    return `
      <g>
        <rect x="20" y="20" width="16" height="16" rx="2" fill="#1E293B"/><polygon points="20,20 26,14 42,14 36,20" fill="#334155"/><polygon points="36,20 42,14 42,30 36,36" fill="#0F172A"/>
        <rect x="42" y="30" width="18" height="18" rx="2" fill="#1E293B"/><polygon points="42,30 48,24 66,24 60,30" fill="#475569"/><polygon points="60,30 66,24 66,42 60,48" fill="#0F172A"/>
        <rect x="18" y="38" width="16" height="16" rx="2" fill="#1E293B"/><polygon points="18,38 24,32 40,32 34,38" fill="#334155"/>
      </g>
    `;
  }
  // Thạch 3Q & Thạch trái cây nhiều màu
  if (id === 'thach3Q' || id === 'thachTraiCay') {
    return `
      <g>
        <rect x="20" y="22" width="14" height="14" rx="2" fill="#F6AD55" opacity="0.9"/><polygon points="20,22 25,17 39,17 34,22" fill="#FBD38D"/>
        <rect x="42" y="18" width="15" height="15" rx="2" fill="#FC8181" opacity="0.9"/><polygon points="42,18 47,13 62,13 57,18" fill="#FEB2B2"/>
        <rect x="34" y="34" width="16" height="16" rx="2" fill="#68D391" opacity="0.9"/><polygon points="34,34 39,29 55,29 50,34" fill="#9AE6B4"/>
        <rect x="16" y="38" width="13" height="13" rx="2" fill="#ECC94B" opacity="0.9"/>
      </g>
    `;
  }
  // Kem phô mai mịn màng
  if (id === 'kemPhoMai') {
    return `
      <g>
        <path d="M22 48 C22 36, 32 26, 43 20 C54 26, 64 36, 64 48 C64 54, 22 54, 22 48 Z" fill="#FEF08A"/>
        <path d="M28 46 C34 36, 52 36, 58 46" stroke="#FDE047" stroke-width="2.5" fill="none"/>
        <path d="M43 20 C40 15, 46 14, 43 12" stroke="#FEF08A" stroke-width="3" stroke-linecap="round"/>
      </g>
    `;
  }
  // Pudding trứng vàng óng
  if (id === 'pudding') {
    return `
      <g>
        <rect x="22" y="24" width="18" height="18" rx="3" fill="#FACC15"/><polygon points="22,24 28,18 46,18 40,24" fill="#FEF08A"/>
        <rect x="42" y="32" width="19" height="19" rx="3" fill="#FACC15"/><polygon points="42,32 48,26 67,26 61,32" fill="#FEF08A"/>
        <path d="M24 26 Q32 22 40 26" stroke="#B45309" stroke-width="2.5" fill="none"/><!-- Lớp caramen -->
      </g>
    `;
  }
  // Thạch matcha xanh biếc
  if (id === 'thachMatcha') {
    return `
      <g>
        <rect x="20" y="22" width="16" height="16" rx="2" fill="#16A34A"/><polygon points="20,22 26,16 42,16 36,22" fill="#4ADE80"/><polygon points="36,22 42,16 42,32 36,38" fill="#15803D"/>
        <rect x="40" y="30" width="17" height="17" rx="2" fill="#16A34A"/><polygon points="40,30 46,24 63,24 57,30" fill="#4ADE80"/>
      </g>
    `;
  }
  // Đậu đỏ & Đậu xanh
  if (id === 'dauDo') {
    return `
      <g>
        <ellipse cx="28" cy="26" rx="7" ry="5" fill="#7F1D1D" transform="rotate(-15 28 26)"/><circle cx="26" cy="24" r="1.5" fill="#FFF" opacity="0.6"/>
        <ellipse cx="46" cy="24" rx="7" ry="5.5" fill="#991B1B" transform="rotate(20 46 24)"/><circle cx="44" cy="22" r="1.5" fill="#FFF" opacity="0.6"/>
        <ellipse cx="36" cy="38" rx="8" ry="5.5" fill="#7F1D1D" transform="rotate(5 36 38)"/><circle cx="34" cy="36" r="1.8" fill="#FFF" opacity="0.7"/>
        <ellipse cx="54" cy="40" rx="7" ry="5" fill="#991B1B" transform="rotate(-25 54 40)"/>
      </g>
    `;
  }
  if (id === 'dauXanh') {
    return `
      <g>
        <circle cx="28" cy="26" r="6" fill="#65A30D"/><circle cx="26" cy="24" r="1.5" fill="#FFF" opacity="0.6"/>
        <circle cx="46" cy="24" r="6" fill="#4D7C0F"/><circle cx="44" cy="22" r="1.5" fill="#FFF" opacity="0.6"/>
        <circle cx="36" cy="38" r="6.5" fill="#65A30D"/><circle cx="34" cy="36" r="1.6" fill="#FFF" opacity="0.7"/>
        <circle cx="52" cy="40" r="5.5" fill="#4D7C0F"/>
      </g>
    `;
  }
  // Hạt chia
  if (id === 'hatChia') {
    return `
      <g fill="#1E293B">
        <circle cx="24" cy="22" r="2.5"/><circle cx="36" cy="20" r="2.2"/><circle cx="48" cy="23" r="2.5"/><circle cx="60" cy="21" r="2.2"/>
        <circle cx="28" cy="32" r="2.4"/><circle cx="42" cy="31" r="2.6"/><circle cx="54" cy="33" r="2.3"/>
        <circle cx="23" cy="42" r="2.3"/><circle cx="35" cy="43" r="2.5"/><circle cx="48" cy="42" r="2.4"/><circle cx="59" cy="44" r="2.2"/>
      </g>
    `;
  }
  // Nha đam trong suốt thanh mát
  if (id === 'nhaDam') {
    return `
      <g>
        <rect x="22" y="24" width="15" height="15" rx="3" fill="#ECFDF5" stroke="#A7F3D0" stroke-width="1.2"/>
        <rect x="42" y="28" width="17" height="17" rx="3" fill="#ECFDF5" stroke="#A7F3D0" stroke-width="1.2"/>
        <rect x="26" y="38" width="16" height="16" rx="3" fill="#ECFDF5" stroke="#A7F3D0" stroke-width="1.2"/>
      </g>
    `;
  }
  // Trân châu hoàng kim vàng rực
  if (id === 'tranChauHoangKim') {
    return `
      <g>
        <circle cx="28" cy="28" r="8.5" fill="#EAB308"/><circle cx="26" cy="25" r="2.5" fill="#FFF" opacity="0.9"/>
        <circle cx="48" cy="26" r="9" fill="#CA8A04"/><circle cx="45" cy="23" r="2.5" fill="#FFF" opacity="0.9"/>
        <circle cx="36" cy="42" r="9.5" fill="#EAB308"/><circle cx="33" cy="38" r="3" fill="#FFF" opacity="0.95"/>
        <circle cx="56" cy="42" r="8" fill="#CA8A04"/><circle cx="54" cy="39" r="2.2" fill="#FFF" opacity="0.9"/>
      </g>
    `;
  }
  // Thạch dừa trắng tinh khôi
  return `
    <g>
      <rect x="20" y="22" width="16" height="16" rx="2" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.2"/><polygon points="20,22 26,16 42,16 36,22" fill="#F8FAFC"/>
      <rect x="42" y="28" width="18" height="18" rx="2" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.2"/><polygon points="42,28 48,22 66,22 60,28" fill="#F8FAFC"/>
      <rect x="24" y="38" width="16" height="16" rx="2" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.2"/>
    </g>
  `;
}

// 3. Chai siro có vòi bơm và hình trái cây
function renderSyrupSvg(s, inCup, qty) {
  return `
    <svg viewBox="0 0 76 114" width="100%" height="100%" class="game-asset-svg">
      <defs>
        <linearGradient id="syrup_${s.id}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="${s.color}" stop-opacity="0.95"/>
          <stop offset="50%" stop-color="${s.color}"/>
          <stop offset="100%" stop-color="${s.color}" stop-opacity="0.9"/>
        </linearGradient>
      </defs>
      <!-- Đầu vòi bơm đen -->
      <path d="M34 16 L42 16 L42 22 L34 22 Z" fill="#334155"/>
      <path d="M38 7 L38 16" stroke="#334155" stroke-width="3" stroke-linecap="round"/>
      <path d="M22 6 L44 6 C46 6, 47 8, 45 10 L38 11" fill="#1E293B" stroke="#0F172A" stroke-width="1.2"/>
      <path d="M22 6 L19 10 L25 9 Z" fill="#0F172A"/>
      <!-- Thân chai thuỷ tinh -->
      <path d="M22 32 C22 26, 54 26, 54 32 L58 98 C58 103, 18 103, 18 98 Z" fill="rgba(255,255,255,0.3)" stroke="#CBD5E1" stroke-width="1.8"/>
      <!-- Siro bên trong -->
      <path d="M20 42 C20 40, 56 40, 56 42 L56 97 Q56 101 50 101 L26 101 Q20 101 20 97 Z" fill="url(#syrup_${s.id})"/>
      <!-- Phản quang thuỷ tinh -->
      <path d="M23 36 L23 94" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
      <!-- Thẻ nhãn trắng -->
      <rect x="13" y="58" width="50" height="36" rx="3.5" fill="#FFFFFF" stroke="#3D2214" stroke-width="1.6"/>
      <text x="38" y="72" font-family="'Paytone One', 'Nunito', sans-serif" font-size="8.8" font-weight="900" fill="#3D2214" text-anchor="middle">${s.name}</text>
      <!-- Icon trái cây -->
      <text x="38" y="89" font-size="14" text-anchor="middle" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.3))">${s.icon}</text>
    </svg>
  `;
}

// 4. Máy Đóng Nắp Retro Vintage
function renderSealerMachineSvg(isSealing, isReady) {
  return `
    <svg viewBox="0 0 110 130" width="100%" height="100%" class="game-asset-svg">
      <defs>
        <linearGradient id="sealerOrange" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FB923C"/>
          <stop offset="100%" stop-color="#EA580C"/>
        </linearGradient>
      </defs>
      <!-- Cuộn màng hoa văn trên cùng -->
      <g class="film-roll ${isSealing ? 'anim-rotate' : ''}">
        <circle cx="26" cy="20" r="13" fill="url(#sealerOrange)" stroke="#C2410C" stroke-width="1.4"/>
        <circle cx="84" cy="20" r="13" fill="url(#sealerOrange)" stroke="#C2410C" stroke-width="1.4"/>
        <rect x="26" y="9" width="58" height="22" rx="4" fill="#FEF3C7" stroke="#EA580C" stroke-width="1.4"/>
        <text x="55" y="24" font-size="10" text-anchor="middle" fill="#EA580C">🌸 🌸 🌸</text>
      </g>
      <!-- Thân máy kim loại vintage -->
      <path d="M16 34 L94 34 L90 94 L20 94 Z" fill="#F1F5F9" stroke="#334155" stroke-width="2"/>
      <rect x="22" y="40" width="66" height="34" rx="4" fill="#E2E8F0" stroke="#64748B" stroke-width="1.5"/>
      <!-- Nút bấm ĐÓNG NẮP -->
      <rect x="28" y="46" width="54" height="22" rx="4" fill="${isReady ? '#22C55E' : '#64748B'}" stroke="#0F172A" stroke-width="1.5"/>
      <text x="55" y="60.5" font-family="'Paytone One', 'Nunito', sans-serif" font-size="8.5" font-weight="900" fill="#FFFFFF" text-anchor="middle">ĐÓNG NẮP</text>
      <circle cx="88" cy="57" r="3" fill="${isReady ? '#22C55E' : '#EF4444'}" stroke="#0F172A" stroke-width="1"/>
      <!-- Piston dập nắp -->
      <rect x="36" y="76" width="38" height="${isSealing ? 26 : 14}" rx="2" fill="#475569" stroke="#0F172A" stroke-width="1.5"/>
      <!-- Khay đế đựng ly tròn -->
      <ellipse cx="55" cy="114" rx="28" ry="9" fill="#E2E8F0" stroke="#334155" stroke-width="1.8"/>
      <ellipse cx="55" cy="114" rx="19" ry="6" fill="#CBD5E1" stroke="#64748B" stroke-width="1.4"/>
    </svg>
  `;
}

// 5. Ly M và L trong suốt
function renderCupArtSvg(size) {
  const isL = size === 'L';
  const h = isL ? 38 : 32;
  return `
    <svg viewBox="0 0 44 48" width="34" height="42" class="cup-asset-svg">
      <path d="M6 6 L10 ${h + 6} Q11 ${h + 8} 16 ${h + 8} L28 ${h + 8} Q33 ${h + 8} 34 ${h + 6} L38 6 Z" fill="rgba(255,255,255,0.6)" stroke="#7A4222" stroke-width="1.8"/>
      <ellipse cx="22" cy="6" rx="16" ry="3" fill="none" stroke="#7A4222" stroke-width="1.6"/>
      <circle cx="22" cy="${isL ? 25 : 22}" r="8" fill="#FFFFFF" stroke="#7A4222" stroke-width="1.4"/>
      <text x="22" y="${isL ? 29 : 26}" font-family="'Paytone One', 'Nunito', sans-serif" font-size="10" font-weight="900" fill="#7A4222" text-anchor="middle">${size}</text>
    </svg>
  `;
}

// ================= 5. CONTROLLER GAME =================
class GameApp {
  constructor() {
    this.viewMode = 'sell';
    this.layoutMode = 'auto'; // 'auto', 'portrait', 'landscape'
    this.isPaused = false;

    this.sellTimer = null;
    this.staffTimer = null;
    this.gameSeconds = 0;
    this.maxDaySeconds = 90;

    this.orders = [];
    this.activeOrderIndex = 0;
    this.orderCounterId = 2960;

    this.currentCup = {
      cup: null, tea: null, syrup: null,
      sugar: null, ice: null, toppings: [],
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
          <button class="btn-modal-primary" id="btnResume">▶️ Tiếp Tục Pha Chế</button>
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
    this.elTopDay.textContent = `NGÀY ${state.day}`;
    this.elTopMoney.textContent = `${Math.round(state.money / 1000)}K`;
    this.elTopRating.textContent = state.rating.toFixed(1);
    this.elTopStars.textContent = '⭐'.repeat(Math.max(1, Math.round(state.rating)));

    const startHour = 8;
    const progress = this.gameSeconds / this.maxDaySeconds;
    const totalMinutes = Math.floor(progress * 14 * 60);
    const currentH = startHour + Math.floor(totalMinutes / 60);
    const currentM = totalMinutes % 60;
    this.elTopClock.textContent = `${String(currentH).padStart(2, '0')}:${String(currentM).padStart(2, '0')}`;
  }

  startSellPhase() {
    this.viewMode = 'sell';
    this.isPaused = false;
    this.gameSeconds = 0;
    this.orders = [];
    this.activeOrderIndex = 0;
    this.resetCup();

    this.generateOrder('counter');
    this.generateOrder('online');

    clearInterval(this.sellTimer);
    this.sellTimer = setInterval(() => {
      if (this.isPaused) return;

      this.gameSeconds += 1;
      this.orders.forEach(ord => {
        ord.patience = Math.max(0, ord.patience - 0.9);
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
    const hasCounter = this.orders.some(o => o.type === 'counter');
    const hasOnline = this.orders.some(o => o.type === 'online');

    if (!hasCounter && this.orders.length < 3) this.generateOrder('counter');
    if (!hasOnline && this.orders.length < 3) this.generateOrder('online');
    if (this.orders.length < 2) this.generateOrder();
  }

  generateOrder(forcedType = null) {
    if (this.orders.length >= 3) return;

    this.orderCounterId += 1;
    const isOnline = forcedType ? (forcedType === 'online') : (Math.random() > 0.5);
    const name = CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)];
    const randCup = Math.random() > 0.4 ? 'M' : 'L';
    const randTea = TEAS[Math.floor(Math.random() * TEAS.length)];
    const randSugar = SUGAR_LEVELS[Math.floor(Math.random() * SUGAR_LEVELS.length)];
    const randIce = ICE_LEVELS[Math.floor(Math.random() * ICE_LEVELS.length)];

    const hasSyrup = Math.random() > 0.4;
    const randSyrup = hasSyrup ? SYRUPS[Math.floor(Math.random() * SYRUPS.length)] : null;

    const numTops = Math.random() > 0.35 ? 2 : 1;
    const shuffled = [...TOPPINGS].sort(() => 0.5 - Math.random());
    const randTops = shuffled.slice(0, numTops).map(t => t.id);

    this.orders.push({
      id: `#${this.orderCounterId}`,
      type: isOnline ? 'online' : 'counter',
      name,
      patience: 100,
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
      sugar: null, ice: null, toppings: [],
      isSealing: false, isDelivering: false
    };
  }

  // ================= 6. RENDER GIAO DIỆN QUẦY CHUẨN XỊN =================
  renderSellView() {
    const activeOrd = this.orders[this.activeOrderIndex] || null;
    const isMatched = this.isOrderMatched(activeOrd);

    this.elView.innerHTML = `
      <div class="shop-counter-screen">
        
        <!-- 1. HÀNG ORDER CARD NGANG Ở TRÊN -->
        <div class="orders-top-strip">
          ${this.renderOrdersLane()}
        </div>

        <!-- 2. QUẦY PHA CHẾ CHÍNH ĐẸP LUNG LINH -->
        <div class="cozy-kitchen-table">
          
          <!-- CỘT BÊN TRÁI: LY, ĐƯỜNG, ĐÁ -->
          <div class="left-ingredients-panel">
            
            <!-- Ô LY (M & L) -->
            <div class="panel-section-box">
              <div class="box-title-label">LY</div>
              <div class="cups-vertical-stack">
                <button class="cup-btn-card ${this.currentCup.cup === 'M' ? 'selected' : ''}" data-pick-cup="M">
                  <span class="qty-bubble">${state.getTotalQty('cupM')}</span>
                  ${renderCupArtSvg('M')}
                </button>
                <button class="cup-btn-card ${this.currentCup.cup === 'L' ? 'selected' : ''}" data-pick-cup="L">
                  <span class="qty-bubble">${state.getTotalQty('cupL')}</span>
                  ${renderCupArtSvg('L')}
                </button>
              </div>
            </div>

            <!-- Ô ĐƯỜNG -->
            <div class="panel-section-box">
              <div class="box-title-label">Đường</div>
              <!-- Chén đường sứ trắng muỗng bạc -->
              <div class="condiment-bowl-svg-wrap">
                <svg viewBox="0 0 60 36" width="46" height="28">
                  <ellipse cx="30" cy="22" rx="24" ry="11" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.6"/>
                  <ellipse cx="30" cy="19" rx="20" ry="8" fill="#F8FAFC"/>
                  <path d="M16 19 Q30 14 44 19 Q30 22 16 19" fill="#FFFFFF" opacity="0.95"/>
                  <!-- Muỗng bạc -->
                  <path d="M10 8 L32 20" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round"/>
                  <ellipse cx="10" cy="8" rx="4" ry="2.5" fill="#CBD5E1"/>
                </svg>
              </div>
              <div class="segmented-picker-row">
                ${SUGAR_LEVELS.map(s => `
                  <button class="seg-btn ${this.currentCup.sugar === s ? 'active' : ''}" data-pick-sugar="${s}">${s}</button>
                `).join('')}
              </div>
            </div>

            <!-- Ô ĐÁ -->
            <div class="panel-section-box">
              <div class="box-title-label">Đá</div>
              <!-- Bát đá viên pha lê -->
              <div class="condiment-bowl-svg-wrap">
                <svg viewBox="0 0 60 36" width="46" height="28">
                  <ellipse cx="30" cy="22" rx="24" ry="11" fill="rgba(255,255,255,0.7)" stroke="#93C5FD" stroke-width="1.6"/>
                  <!-- Đá viên bên trong -->
                  <rect x="20" y="14" width="8" height="8" rx="1.5" fill="#BFDBFE" stroke="#60A5FA" stroke-width="1"/>
                  <rect x="29" y="12" width="9" height="9" rx="1.5" fill="#DBEAFE" stroke="#93C5FD" stroke-width="1"/>
                  <rect x="25" y="19" width="8" height="8" rx="1.5" fill="#EFF6FF" stroke="#BFDBFE" stroke-width="1"/>
                </svg>
              </div>
              <div class="segmented-picker-row">
                ${ICE_LEVELS.map(ice => `
                  <button class="seg-btn ${this.currentCup.ice === ice ? 'active' : ''}" data-pick-ice="${ice}">${ice}</button>
                `).join('')}
              </div>
            </div>

            <!-- NÚT ĐỔ LY -->
            ${this.currentCup.cup ? `
              <button class="btn-trash-action" id="btnDiscardCup">🗑 Đổ Ly</button>
            ` : ''}
          </div>

          <!-- CỘT KỆ CHÍNH BÊN PHẢI -->
          <div class="right-shelves-panel">
            
            <!-- KỆ TRÊN: 9 BÌNH TRÀ + MÁY ĐÓNG NẮP -->
            <div class="shelf-wrapper shelf-teas">
              <div class="shelf-header-pill">🌱 TRÀ / NƯỚC NỀN (9 khung)</div>
              
              <div class="teas-and-sealer-flex">
                <div class="dispensers-grid-9">
                  ${TEAS.map(t => {
                    const isSelected = this.currentCup.tea === t.id;
                    const qty = state.getTotalQty(t.id);
                    return `
                      <button class="dispenser-btn ${isSelected ? 'selected' : ''}" data-pick-tea="${t.id}" title="${t.name}">
                        <span class="qty-bubble">${qty}</span>
                        ${renderDispenserSvg(t, isSelected, qty)}
                      </button>
                    `;
                  }).join('')}
                </div>

                <!-- MÁY ĐÓNG NẮP RETRO VINTAGE -->
                <div class="sealer-machine-box ${this.currentCup.isSealing ? 'sealing' : ''}">
                  <button class="sealer-interactive-btn" id="btnManualSealServe">
                    ${renderSealerMachineSvg(this.currentCup.isSealing, isMatched)}
                  </button>
                  <!-- Ly đang pha hiển thị trên đế máy -->
                  ${this.currentCup.cup ? `
                    <div class="staged-cup-slot">
                      ${this.renderStagedCupSvg()}
                    </div>
                  ` : ''}
                </div>
              </div>
            </div>

            <!-- KỆ GIỮA: 15 KHAY TOPPING (9 HÀNG 1, 6 HÀNG 2) -->
            <div class="shelf-wrapper shelf-toppings">
              <div class="shelf-header-pill">🧆 TOPPING (15 khung)</div>
              
              <div class="toppings-grid-container">
                <div class="toppings-row-1">
                  ${TOPPINGS.slice(0, 9).map(tp => {
                    const inCup = this.currentCup.toppings.includes(tp.id);
                    const qty = state.getTotalQty(tp.id);
                    return `
                      <button class="topping-btn ${inCup ? 'in-cup' : ''}" data-pick-topping="${tp.id}">
                        <span class="qty-bubble">${qty}</span>
                        ${renderToppingSvg(tp, inCup, qty)}
                      </button>
                    `;
                  }).join('')}
                </div>

                <div class="toppings-row-2">
                  ${TOPPINGS.slice(9, 15).map(tp => {
                    const inCup = this.currentCup.toppings.includes(tp.id);
                    const qty = state.getTotalQty(tp.id);
                    return `
                      <button class="topping-btn ${inCup ? 'in-cup' : ''}" data-pick-topping="${tp.id}">
                        <span class="qty-bubble">${qty}</span>
                        ${renderToppingSvg(tp, inCup, qty)}
                      </button>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>

            <!-- KỆ DƯỚI: 9 CHAI SIRO CÓ VÒI BƠM -->
            <div class="shelf-wrapper shelf-syrups">
              <div class="shelf-header-pill">🧴 SIRO (9 khung)</div>
              
              <div class="syrups-grid-9">
                ${SYRUPS.map(s => {
                  const inCup = this.currentCup.syrup === s.id;
                  const qty = state.getTotalQty(s.id);
                  return `
                    <button class="syrup-btn ${inCup ? 'in-cup' : ''}" data-pick-syrup="${s.id}">
                      <span class="qty-bubble">${qty}</span>
                      ${renderSyrupSvg(s, inCup, qty)}
                    </button>
                  `;
                }).join('')}
              </div>
            </div>

          </div>
        </div>
      </div>
    `;

    this.attachSellEvents();
  }

  renderStagedCupSvg() {
    if (!this.currentCup.cup) return '';
    const isL = this.currentCup.cup === 'L';
    let liquidColor = '#FDF5EC';

    if (this.currentCup.tea) {
      const teaObj = TEAS.find(t => t.id === this.currentCup.tea);
      if (teaObj) liquidColor = teaObj.liquid;
    }
    if (this.currentCup.syrup) {
      const sObj = SYRUPS.find(s => s.id === this.currentCup.syrup);
      if (sObj) liquidColor = sObj.color;
    }

    const hasIce = this.currentCup.ice && this.currentCup.ice !== 'Không';
    const hasTops = this.currentCup.toppings.length > 0;

    return `
      <svg viewBox="0 0 60 76" width="34" height="44" class="staged-cup-svg">
        <path d="M10 8 L15 68 Q16 71 20 71 L40 71 Q44 71 45 68 L50 8 Z" fill="rgba(255,255,255,0.4)" stroke="#7A4222" stroke-width="1.8"/>
        ${this.currentCup.tea || this.currentCup.syrup ? `
          <path d="M12 14 L15 68 Q16 70 20 70 L40 70 Q44 70 45 68 L48 14 Z" fill="${liquidColor}"/>
        ` : ''}
        ${hasIce ? `
          <rect x="20" y="24" width="8" height="7" rx="2" fill="#FFF" fill-opacity="0.8"/>
          <rect x="32" y="30" width="8" height="7" rx="2" fill="#FFF" fill-opacity="0.8"/>
        ` : ''}
        ${hasTops ? `
          <circle cx="22" cy="65" r="3" fill="#1A1412"/>
          <circle cx="30" cy="66" r="3" fill="#1A1412"/>
          <circle cx="38" cy="65" r="3" fill="#1A1412"/>
        ` : ''}
        <ellipse cx="30" cy="8" rx="20" ry="3.5" fill="none" stroke="#7A4222" stroke-width="1.8"/>
      </svg>
    `;
  }

  renderOrdersLane() {
    if (this.orders.length === 0) {
      return '<div class="no-orders-banner">Đang chờ khách gọi món... 🐢</div>';
    }

    return `
      <div class="horizontal-orders-list">
        ${this.orders.map((ord, idx) => {
          const isSelected = idx === this.activeOrderIndex;
          const isApp = ord.type === 'online';

          const cupDone = this.currentCup.cup === ord.recipe.cup;
          const teaDone = this.currentCup.tea === ord.recipe.tea;
          const sugarDone = this.currentCup.sugar === ord.recipe.sugar;
          const iceDone = this.currentCup.ice === ord.recipe.ice;
          const syrupDone = ord.recipe.syrup ? (this.currentCup.syrup === ord.recipe.syrup) : !this.currentCup.syrup;

          let totalSteps = 4 + (ord.recipe.syrup ? 1 : 0) + ord.recipe.toppings.length;
          let finishedSteps = (cupDone ? 1 : 0) + (teaDone ? 1 : 0) + (sugarDone ? 1 : 0) + (iceDone ? 1 : 0) +
                              (syrupDone ? 1 : 0) + ord.recipe.toppings.filter(tid => this.currentCup.toppings.includes(tid)).length;
          let percent = Math.min(100, Math.round((finishedSteps / totalSteps) * 100));

          return `
            <div class="order-h-card ${isSelected ? 'active' : ''} ${isApp ? 'app-type' : 'counter-type'}" data-order-idx="${idx}">
              <div class="order-h-icon">${isApp ? '🛵' : '👩'}</div>
              <div class="order-h-details">
                <div class="order-h-header-row">
                  ${isApp ? `<span class="badge-app">Đơn app ${ord.id}</span>` : `<span class="badge-counter">Quầy ${ord.id}</span>`}
                  <b class="order-h-name">${ord.name}:</b>
                  <span class="order-h-drink">${ord.recipe.teaName} ${ord.recipe.syrupName ? `+ ${ord.recipe.syrupName}` : ''} (Ly ${ord.recipe.cup})</span>
                </div>

                <div class="order-h-checklist-row">
                  <span class="req-tag ${cupDone ? 'done' : 'pending'}">${cupDone ? '🟢✓' : '🔴'} Ly ${ord.recipe.cup}</span>
                  <span class="req-tag ${teaDone ? 'done' : 'pending'}">${teaDone ? '🟢✓' : '🔴'} ${ord.recipe.teaName}</span>
                  ${ord.recipe.syrupName ? `<span class="req-tag ${syrupDone ? 'done' : 'pending'}">${syrupDone ? '🟢✓' : '🔴'} ${ord.recipe.syrupName}</span>` : ''}
                  <span class="req-tag ${sugarDone ? 'done' : 'pending'}">${sugarDone ? '🟢✓' : '🔴'} ${ord.recipe.sugar}</span>
                  <span class="req-tag ${iceDone ? 'done' : 'pending'}">${iceDone ? '🟢✓' : '🔴'} ${ord.recipe.ice}</span>
                  ${ord.recipe.toppings.map(tid => {
                    const tDone = this.currentCup.toppings.includes(tid);
                    const tObj = TOPPINGS.find(t => t.id === tid);
                    return `<span class="req-tag ${tDone ? 'done' : 'pending'}">${tDone ? '🟢✓' : '🔴'} ${tObj?.name || 'Topping'}</span>`;
                  }).join('')}
                  <b class="order-percent ${percent === 100 ? 'done' : ''}">${percent}%</b>
                </div>

                <div class="patience-track-horizontal">
                  <i style="width: ${ord.patience}%; background: ${ord.patience > 35 ? '#22C55E' : (ord.patience > 20 ? '#F59E0B' : '#EF4444')};"></i>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  attachSellEvents() {
    this.elView.querySelectorAll('[data-order-idx]').forEach(card => {
      card.onclick = () => {
        audio.click();
        this.activeOrderIndex = parseInt(card.dataset.orderIdx, 10);
        this.render();
      };
    });

    this.elView.querySelectorAll('[data-pick-cup]').forEach(btn => {
      btn.onclick = () => {
        const size = btn.dataset.pickCup;
        if (state.getTotalQty('cup' + size) <= 0) {
          audio.trash();
          this.showToast(`Hết Ly ${size} trong kho!`);
          return;
        }
        audio.click();
        this.currentCup.cup = size;
        this.checkAndTriggerAutoSeal();
        this.render();
      };
    });

    this.elView.querySelectorAll('[data-pick-tea]').forEach(btn => {
      btn.onclick = () => {
        if (!this.currentCup.cup) {
          audio.trash();
          this.showToast('Hãy bấm chọn Ly M hoặc Ly L trước!');
          return;
        }
        const tid = btn.dataset.pickTea;
        if (state.getTotalQty(tid) <= 0) {
          audio.trash();
          this.showToast('Hết loại cốt trà này trong kho!');
          return;
        }
        audio.pour();
        this.currentCup.tea = tid;
        this.checkAndTriggerAutoSeal();
        this.render();
      };
    });

    this.elView.querySelectorAll('[data-pick-sugar]').forEach(btn => {
      btn.onclick = () => {
        audio.click();
        this.currentCup.sugar = btn.dataset.pickSugar;
        this.checkAndTriggerAutoSeal();
        this.render();
      };
    });

    this.elView.querySelectorAll('[data-pick-ice]').forEach(btn => {
      btn.onclick = () => {
        audio.addIce();
        this.currentCup.ice = btn.dataset.pickIce;
        this.checkAndTriggerAutoSeal();
        this.render();
      };
    });

    this.elView.querySelectorAll('[data-pick-syrup]').forEach(btn => {
      btn.onclick = () => {
        if (!this.currentCup.cup) {
          audio.trash();
          this.showToast('Hãy chọn Ly trước khi bơm siro!');
          return;
        }
        const sid = btn.dataset.pickSyrup;
        if (this.currentCup.syrup === sid) {
          audio.click();
          this.currentCup.syrup = null;
          this.showToast('Đã bỏ siro ra khỏi ly!');
        } else {
          if (state.getTotalQty(sid) <= 0) {
            audio.trash();
            this.showToast('Chai siro này đã hết trong kho!');
            return;
          }
          audio.addSyrup();
          this.currentCup.syrup = sid;
        }
        this.checkAndTriggerAutoSeal();
        this.render();
      };
    });

    this.elView.querySelectorAll('[data-pick-topping]').forEach(btn => {
      btn.onclick = () => {
        if (!this.currentCup.cup) {
          audio.trash();
          this.showToast('Hãy chọn Ly trước khi thêm topping!');
          return;
        }
        const tid = btn.dataset.pickTopping;
        if (state.getTotalQty(tid) <= 0) {
          audio.trash();
          this.showToast('Topping này đã hết trong kho!');
          return;
        }

        const idx = this.currentCup.toppings.indexOf(tid);
        if (idx === -1) {
          audio.addTopping();
          this.currentCup.toppings.push(tid);
        } else {
          this.currentCup.toppings.splice(idx, 1);
        }
        this.checkAndTriggerAutoSeal();
        this.render();
      };
    });

    const btnTrash = document.getElementById('btnDiscardCup');
    if (btnTrash) {
      btnTrash.onclick = () => {
        audio.trash();
        this.resetCup();
        this.showToast('Đã đổ ly làm lại!');
        this.render();
      };
    }

    const btnManualSeal = document.getElementById('btnManualSealServe');
    if (btnManualSeal) {
      btnManualSeal.onclick = () => {
        const ord = this.orders[this.activeOrderIndex];
        if (ord && this.isOrderMatched(ord)) {
          this.checkAndTriggerAutoSeal(true);
        } else {
          audio.click();
          this.showToast('Chưa đủ nguyên liệu theo công thức!');
        }
      };
    }
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

  checkAndTriggerAutoSeal(isManual = false) {
    const ord = this.orders[this.activeOrderIndex];
    if (!ord || this.currentCup.isSealing || this.currentCup.isDelivering) return;

    if (this.isOrderMatched(ord)) {
      this.currentCup.isSealing = true;
      audio.autoSeal();
      this.showToast('✨ Máy đang tự động dập nắp...');
      this.render();

      setTimeout(() => {
        this.currentCup.isSealing = false;
        this.currentCup.isDelivering = true;
        this.executeDelivery(ord);
      }, 400);
    }
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
    state.stats.totalCupsSold += 1;
    state.addExp(25);

    this.dailyReport.served += 1;
    this.dailyReport.revenue += totalEarned;
    this.dailyReport.tips += tip;

    if (ord.type === 'online') {
      state.today.revenueApp += totalEarned;
      this.showToast(`+${totalEarned.toLocaleString()}đ 🛵 Đã giao Đơn app ${ord.id}!`);
    } else {
      state.today.revenueDrinks += fullPrice;
      state.today.revenueTips += tip;
      this.showToast(`+${totalEarned.toLocaleString()}đ 💰 Đã giao khách ${ord.name}!`);
    }

    this.orders.splice(this.activeOrderIndex, 1);
    this.activeOrderIndex = 0;
    this.resetCup();
    this.ensureOrderBalance();
    this.render();
  }

  endSellPhase() {
    clearInterval(this.sellTimer);
    clearInterval(this.staffTimer);
    audio.bell();

    const rentCost = state.today.costRent;
    const utilitiesCost = state.today.costUtilities;
    const totalRevenue = this.dailyReport.revenue;
    const totalExpenses = rentCost + utilitiesCost;
    const netProfit = totalRevenue - totalExpenses;

    state.money -= totalExpenses;
    state.stats.totalProfitAllTime += netProfit;

    state.history10Days.push({
      day: `N${state.day}`,
      cups: this.dailyReport.served,
      profit: netProfit
    });
    if (state.history10Days.length > 10) state.history10Days.shift();

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
