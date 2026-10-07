/**
 * 🧋 TIỆM TRÀ SỮA CỦA RÙA (Boba Shop Simulator)
 * GIAO DIỆN QUẦY CHUẨN XỊN THEO HÌNH ẢNH THIẾT KẾ:
 * - 9 Bình trà thuỷ tinh nắp bạc vòi rót đen
 * - 15 Khay topping trong suốt (Hàng 1: 9 khay, Hàng 2: 6 khay)
 * - 9 Chai siro có vòi bơm và hình trái cây
 * - Cột bên trái: Ly M / L, Chén đường, Chén đá
 * - Góc trên bên phải: Máy đóng nắp vintage retro có cuộn màng hoa
 * - Card order ngang dễ nhìn, không bị che khuất
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

// ================= 2. DANH MỤC NGUYÊN LIỆU (CHUẨN 100% THEO HÌNH ẢNH) =================
const CUPS = [
  { id: 'M', name: 'Ly M', ml: '500ml', cost: 500, priceBonus: 0, shelfLife: 999 },
  { id: 'L', name: 'Ly L', ml: '700ml', cost: 800, priceBonus: 8000, shelfLife: 999 }
];

// 9 BÌNH TRÀ / NƯỚC NỀN
const TEAS = [
  { id: 'traDen', name: 'TRÀ ĐEN', icon: '🍂', liquid: '#663319', cost: 3000, price: 20000, shelfLife: 2 },
  { id: 'oolong', name: 'TRÀ Ô LONG', icon: '🪵', liquid: '#9E5828', cost: 3000, price: 20000, shelfLife: 2 },
  { id: 'traXanh', name: 'TRÀ XANH', icon: '🌿', liquid: '#7A9A48', cost: 3000, price: 20000, shelfLife: 2 },
  { id: 'traNhai', name: 'TRÀ NHÀI', icon: '🌸', liquid: '#D4B856', cost: 3500, price: 22000, shelfLife: 2 },
  { id: 'hongTra', name: 'HỒNG TRÀ', icon: '🍵', liquid: '#BD3D35', cost: 3200, price: 22000, shelfLife: 2 },
  { id: 'lucTra', name: 'LỤC TRÀ', icon: '🍃', liquid: '#5E973B', cost: 3000, price: 20000, shelfLife: 2 },
  { id: 'traThai', name: 'TRÀ THÁI', icon: '🧋', liquid: '#E67228', cost: 3500, price: 22000, shelfLife: 2 },
  { id: 'suaTuoi', name: 'SỮA TƯƠI', icon: '🥛', liquid: '#FFFDF5', cost: 3000, price: 20000, shelfLife: 1 },
  { id: 'duongDen', name: 'ĐƯỜNG ĐEN', icon: '🟤', liquid: '#3F2013', cost: 4000, price: 25000, shelfLife: 2 }
];

const SUGAR_LEVELS = ['0%', '50%', '70%', '100%'];
const ICE_LEVELS = ['Không', 'Ít', 'Bình thường', 'Nhiều'];

// 15 KHAY TOPPING (HÀNG 1: 9 KHAY, HÀNG 2: 6 KHAY)
const TOPPINGS = [
  // Hàng 1
  { id: 'tranChau', name: 'TRÂN CHÂU', icon: '🟤', color: '#1A1412', cost: 2000, price: 5000, shelfLife: 2, type: 'pearl' },
  { id: 'thachTrang', name: 'THẠCH TRẮNG', icon: '⚪', color: '#EDF2F7', cost: 2500, price: 6000, shelfLife: 2, type: 'pearl' },
  { id: 'thachDen', name: 'THẠCH ĐEN', icon: '⬛', color: '#1A202C', cost: 2000, price: 5000, shelfLife: 2, type: 'cube' },
  { id: 'thach3Q', name: 'THẠCH 3Q', icon: '🔶', color: '#ED8936', cost: 2500, price: 6000, shelfLife: 2, type: 'cube' },
  { id: 'thachTraiCay', name: 'THẠCH TRÁI CÂY', icon: '🍓', color: '#E53E3E', cost: 2500, price: 6000, shelfLife: 2, type: 'cube' },
  { id: 'kemPhoMai', name: 'KEM PHÔ MAI', icon: '🧀', color: '#FEFCBF', cost: 3500, price: 8000, shelfLife: 2, type: 'foam' },
  { id: 'pudding', name: 'PUDDING', icon: '🍮', color: '#ECC94B', cost: 3000, price: 7000, shelfLife: 2, type: 'cube' },
  { id: 'thachMatcha', name: 'THẠCH MATCHA', icon: '🍵', color: '#48BB78', cost: 2500, price: 6000, shelfLife: 2, type: 'cube' },
  { id: 'suongSao', name: 'SƯƠNG SÁO', icon: '🫘', color: '#2D3748', cost: 2000, price: 5000, shelfLife: 2, type: 'cube' },
  // Hàng 2
  { id: 'dauDo', name: 'ĐẬU ĐỎ', icon: '🫘', color: '#742A2A', cost: 2500, price: 6000, shelfLife: 3, type: 'bean' },
  { id: 'dauXanh', name: 'ĐẬU XANH', icon: '🟢', color: '#687F3B', cost: 2500, price: 6000, shelfLife: 3, type: 'bean' },
  { id: 'hatChia', name: 'HẠT CHIA', icon: '⚫', color: '#2D3748', cost: 2000, price: 5000, shelfLife: 3, type: 'seed' },
  { id: 'nhaDam', name: 'NHA ĐAM', icon: '🌱', color: '#E2E8F0', cost: 2200, price: 5000, shelfLife: 3, type: 'cube' },
  { id: 'tranChauHoangKim', name: 'TRÂN CHÂU HOÀNG KIM', icon: '✨', color: '#D69E2E', cost: 2800, price: 6500, shelfLife: 2, type: 'pearl' },
  { id: 'thachDua', name: 'THẠCH DỪA', icon: '🥥', color: '#F7FAFC', cost: 2000, price: 5000, shelfLife: 3, type: 'cube' }
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
  {
    id: 'minhTea',
    name: 'Minh - Rót Trà',
    avatar: '🍵',
    role: 'Tự động lấy đúng nền trà/nước theo order',
    unlockDay: 1,
    hireCost: 50000,
    baseSalary: 5000,
    baseInterval: 1400
  },
  {
    id: 'linhHelper',
    name: 'Linh - Pha Chế Đa Nhiệm',
    avatar: '🧑‍🍹',
    role: 'Tự thêm Topping + Đường + Đá + Siro',
    unlockDay: 2,
    hireCost: 80000,
    baseSalary: 8000,
    baseInterval: 1200
  },
  {
    id: 'vyOnline',
    name: 'Vy - Online & Ship',
    avatar: '📱',
    role: 'Chuyên xử lý & hoàn tất Đơn App/Ship',
    unlockDay: 2,
    hireCost: 100000,
    baseSalary: 10000,
    baseInterval: 2000
  }
];

const UPGRADES_LIST = [
  { id: 'fastSealer', name: 'Máy dập nắp siêu tốc', icon: '⚡', desc: 'Dập nắp tự động nhanh gấp đôi', cost: 150000 },
  { id: 'turtleCharm', name: 'Bùa Rùa May Mắn', icon: '🐢', desc: 'Tăng 25% tiền Tip khách thưởng', cost: 200000 },
  { id: 'coolerAir', name: 'Điều hòa mát rượi', icon: '❄️', desc: 'Khách đứng chờ kiên nhẫn hơn 35%', cost: 250000 },
  { id: 'lofiMusic', name: 'Loa Lofi Chill', icon: '📻', desc: 'Khách vui vẻ đánh giá 5 sao dễ hơn', cost: 180000 }
];

// ================= 3. TRẠNG THÁI GAME & QUẢN LÝ LÔ HÀNG =================
class GameState {
  constructor() {
    this.shopName = 'Tiệm Trà Sữa Của Rùa';
    this.day = 1;
    this.money = 250000;
    this.rating = 5.0;
    this.ratingCount = 8;
    this.level = 1;
    this.exp = 0;
    this.expMax = 100;

    this.inventoryLots = {};

    this.staff = {
      minhTea: { hired: false, level: 1, status: 'waiting' },
      linhHelper: { hired: false, level: 1, status: 'waiting' },
      vyOnline: { hired: false, level: 1, status: 'waiting' }
    };

    this.upgrades = {};

    this.stats = {
      totalCupsSold: 120,
      totalProfitAllTime: 1645100
    };

    this.today = {
      revenueDrinks: 0,
      revenueTips: 0,
      revenueApp: 0,
      costRestock: 0,
      costRent: 45000,
      costUtilities: 15000,
      costSalaries: 0,
      wasteExpiredTopping: 0,
      wasteExpiredSyrup: 0,
      wasteExpiredTea: 0,
      wasteDiscardedCups: 0
    };

    this.history10Days = [
      { day: 'N1', cups: 12, profit: 145000 },
      { day: 'N2', cups: 15, profit: 180000 },
      { day: 'N3', cups: 14, profit: 165000 },
      { day: 'N4', cups: 18, profit: 210000 },
      { day: 'N5', cups: 16, profit: 195000 },
      { day: 'N6', cups: 20, profit: 240000 },
      { day: 'N7', cups: 22, profit: 275000 },
      { day: 'N8', cups: 21, profit: 260000 },
      { day: 'N9', cups: 25, profit: 310000 },
      { day: 'N10', cups: 26, profit: 340000 }
    ];

    this.reviews = [
      { name: "Chị Lan", stars: 5, comment: "Trà sữa đậm vị, trân châu mềm dẻo 10 điểm!" },
      { name: "Anh Nam", stars: 5, comment: "Máy dập nắp xịn xò, giao hàng online đóng gói kỹ lưỡng." },
      { name: "Bảo Châu", stars: 5, comment: "Quán Rùa cưng xỉu, siro đào thơm ngát tự nhiên." }
    ];

    this.initDefaultInventoryLots();
    this.load();
    this.ensureAllItemsHaveInventory();
  }

  initDefaultInventoryLots() {
    const addInitial = (id, count, cost, shelf) => {
      this.inventoryLots[id] = [
        {
          id: 'lot_init_1_' + id,
          qty: Math.ceil(count * 0.4),
          buyDay: 1,
          expireDay: shelf >= 900 ? 999 : (1 + Math.max(1, shelf - 1)),
          cost
        },
        {
          id: 'lot_init_2_' + id,
          qty: Math.floor(count * 0.6),
          buyDay: 1,
          expireDay: shelf >= 900 ? 999 : (1 + shelf),
          cost
        }
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
        shopName: this.shopName,
        day: this.day,
        money: this.money,
        rating: this.rating,
        ratingCount: this.ratingCount,
        level: this.level,
        exp: this.exp,
        expMax: this.expMax,
        inventoryLots: this.inventoryLots,
        staff: this.staff,
        upgrades: this.upgrades,
        stats: this.stats,
        today: this.today,
        history10Days: this.history10Days,
        reviews: this.reviews
      };
      localStorage.setItem('tiemTraSuaRua_save_v3', JSON.stringify(data));
    } catch (e) {
      console.error("Lỗi lưu game", e);
    }
  }

  load() {
    try {
      const str = localStorage.getItem('tiemTraSuaRua_save_v3');
      if (str) {
        const obj = JSON.parse(str);
        Object.assign(this, obj);
      }
      if (!this.staff.minhTea) this.staff.minhTea = { hired: false, level: 1, status: 'waiting' };
      if (!this.staff.linhHelper) this.staff.linhHelper = { hired: false, level: 1, status: 'waiting' };
      if (!this.staff.vyOnline) this.staff.vyOnline = { hired: false, level: 1, status: 'waiting' };
    } catch (e) {
      console.error("Lỗi nạp game", e);
    }
  }

  getTotalQty(itemId) {
    const lots = this.inventoryLots[itemId] || [];
    return lots.reduce((sum, l) => sum + (l.qty || 0), 0);
  }

  getExpiringLotsSummary(itemId) {
    const lots = this.inventoryLots[itemId] || [];
    let expToday = 0;
    let expIn1Day = 0;
    let expLater = 0;

    lots.forEach(l => {
      if (l.expireDay <= this.day) {
        expToday += l.qty;
      } else if (l.expireDay === this.day + 1) {
        expIn1Day += l.qty;
      } else {
        expLater += l.qty;
      }
    });

    return { expToday, expIn1Day, expLater, lots };
  }

  buyItemLot(itemId, qty, cost, shelfLife) {
    if (!this.inventoryLots[itemId]) this.inventoryLots[itemId] = [];
    const expireDay = shelfLife >= 900 ? 999 : (this.day + shelfLife);
    const newLot = {
      id: 'lot_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      qty,
      buyDay: this.day,
      expireDay,
      cost
    };
    this.inventoryLots[itemId].push(newLot);
    this.today.costRestock += qty * cost;
    this.save();
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

  processEndOfDayExpiry() {
    let expiredToppingCost = 0;
    let expiredSyrupCost = 0;
    let expiredTeaCost = 0;
    let totalExpiredCount = 0;

    const checkLots = (list, type) => {
      list.forEach(item => {
        const key = type === 'cup' ? ('cup' + item.id) : item.id;
        const lots = this.inventoryLots[key] || [];
        const validLots = [];

        lots.forEach(lot => {
          if (lot.expireDay <= this.day) {
            const loss = lot.qty * lot.cost;
            totalExpiredCount += lot.qty;
            if (type === 'topping') expiredToppingCost += loss;
            else if (type === 'syrup') expiredSyrupCost += loss;
            else if (type === 'tea') expiredTeaCost += loss;
          } else {
            validLots.push(lot);
          }
        });
        this.inventoryLots[key] = validLots;
      });
    };

    checkLots(TEAS, 'tea');
    checkLots(TOPPINGS, 'topping');
    checkLots(SYRUPS, 'syrup');

    this.today.wasteExpiredTea = expiredTeaCost;
    this.today.wasteExpiredTopping = expiredToppingCost;
    this.today.wasteExpiredSyrup = expiredSyrupCost;

    this.save();
    return totalExpiredCount;
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

// ================= 4. APP CONTROLLER =================
class GameApp {
  constructor() {
    this.viewMode = 'sell'; // Mở thẳng màn bán hàng cho trực quan
    this.activeTab = 'restock';
    this.isPaused = false;

    this.sellTimer = null;
    this.staffTimer = null;
    this.vyTimer = null;
    this.gameSeconds = 0;
    this.maxDaySeconds = 90;

    this.orders = [];
    this.activeOrderIndex = 0;
    this.orderCounterId = 2960;

    this.currentCup = {
      cup: null,
      tea: null,
      syrup: null,
      sugar: null,
      ice: null,
      toppings: [],
      isSealing: false,
      isDelivering: false
    };

    this.dailyReport = {
      served: 0,
      mistakes: 0,
      revenue: 0,
      tips: 0
    };

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
    this.elFxLayer = document.getElementById('fxLayer');

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
    if (this.viewMode !== 'sell') {
      this.viewMode = 'sell';
      this.render();
      return;
    }

    this.isPaused = !this.isPaused;
    audio.click();

    if (this.isPaused) {
      this.openModal(`
        <h2>⏸ QUẢN LÝ TIỆM TRÀ SỮA</h2>
        <p style="color: #7C5B49; margin-bottom: 12px; font-size: 13px;">Tạm dừng trò chơi hoặc mở giao diện kho & nhân viên</p>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <button class="btn-modal-primary" id="btnResume">▶️ Tiếp Tục Pha Chế</button>
          <button class="btn-modal-confirm" id="btnGoToPrepView" style="background: #3182CE; box-shadow: 0 3px 0 #2B6CB0;">📦 Mở Kho & Nhân Viên</button>
          <button class="btn-modal-cancel" id="btnEndDayEarly">🌙 Đóng Cửa Tiệm Sớm</button>
        </div>
      `);

      document.getElementById('btnResume').onclick = () => this.togglePause();
      document.getElementById('btnGoToPrepView').onclick = () => {
        this.closeModal();
        this.isPaused = false;
        this.viewMode = 'prep';
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
    if (this.viewMode === 'prep') {
      this.renderPrepView();
    } else {
      this.renderSellView();
    }
  }

  renderTopBar() {
    this.elTopDay.textContent = `NGÀY ${state.day}`;
    this.elTopMoney.textContent = `${Math.round(state.money / 1000)}K`;
    this.elTopRating.textContent = state.rating.toFixed(1);
    this.elTopStars.textContent = '⭐'.repeat(Math.max(1, Math.round(state.rating)));

    if (this.viewMode === 'sell') {
      const startHour = 8;
      const progress = this.gameSeconds / this.maxDaySeconds;
      const totalMinutes = Math.floor(progress * 14 * 60);
      const currentH = startHour + Math.floor(totalMinutes / 60);
      const currentM = totalMinutes % 60;
      this.elTopClock.textContent = `${String(currentH).padStart(2, '0')}:${String(currentM).padStart(2, '0')}`;
    } else {
      this.elTopClock.textContent = "Chuẩn bị";
    }
  }

  // ================= 4.1. GIAO DIỆN CHUẨN BỊ (PREP VIEW) =================
  renderPrepView() {
    const expPercent = Math.min(100, Math.round((state.exp / state.expMax) * 100));

    this.elView.innerHTML = `
      <div class="prep-view">
        <div class="prep-left-col">
          <div class="shop-sign">
            <h1>${state.shopName}</h1>
            <p>Trà sữa thơm béo • Rùa pha tận tâm</p>
            <div class="level-row">
              <span>Cấp quán: <b>Level ${state.level}</b></span>
              <div class="level-bar"><i style="width: ${expPercent}%"></i></div>
              <small>${state.exp}/${state.expMax} EXP</small>
            </div>
          </div>
        </div>

        <div class="prep-right-col">
          <div class="tabs-nav">
            <button class="tab-btn ${this.activeTab === 'restock' ? 'active' : ''}" data-tab="restock">📦 Kho & Hạn</button>
            <button class="tab-btn ${this.activeTab === 'staff' ? 'active' : ''}" data-tab="staff">👥 Nhân Viên</button>
            <button class="tab-btn ${this.activeTab === 'upgrades' ? 'active' : ''}" data-tab="upgrades">✨ Nâng Cấp</button>
            <button class="tab-btn ${this.activeTab === 'ledger' ? 'active' : ''}" data-tab="ledger">📊 Sổ Sách</button>
          </div>

          <div class="tab-content">
            ${this.getTabContentHtml()}
          </div>
        </div>

        <div class="dock-bar">
          <button class="btn-big-open" id="btnStartSellDay">
            <span>🐢</span> VÀO QUẦY BÁN HÀNG NGÀY ${state.day}
          </button>
        </div>
      </div>
    `;

    this.elView.querySelectorAll('.tab-btn').forEach(btn => {
      btn.onclick = () => {
        audio.click();
        this.activeTab = btn.dataset.tab;
        this.render();
      };
    });

    const btnStart = document.getElementById('btnStartSellDay');
    if (btnStart) {
      btnStart.onclick = () => {
        this.viewMode = 'sell';
        this.render();
      };
    }

    this.attachTabEvents();
  }

  getTabContentHtml() {
    if (this.activeTab === 'restock') {
      const renderItemRow = (item, type) => {
        const key = type === 'cup' ? ('cup' + item.id) : item.id;
        const totalQty = state.getTotalQty(key);
        const summary = state.getExpiringLotsSummary(key);

        return `
          <div class="restock-item-card">
            <div class="item-meta">
              <div class="item-meta-title">
                <b>${item.icon || '🥤'} ${item.name}</b>
                <span class="sub-desc">${item.cost.toLocaleString()}đ/phần • Còn ${totalQty}</span>
              </div>
              <div class="lot-badges-row">
                ${summary.expToday > 0 ? `<span class="lot-badge badge-today">🔴 ${summary.expToday} hết hạn tối nay</span>` : ''}
                ${summary.expIn1Day > 0 ? `<span class="lot-badge badge-soon">🟡 Còn 1 ngày (${summary.expIn1Day})</span>` : ''}
                ${summary.expLater > 0 ? `<span class="lot-badge badge-ok">🟢 Còn ${summary.expLater} dài hạn</span>` : ''}
              </div>
            </div>
            <div class="item-actions">
              <button class="btn-view-lots" data-view-lots="${key}" data-item-name="${item.name}">📋 Xem lô</button>
              <div class="qty-control">
                <button class="qty-btn" data-act="sub" data-item="${key}">-</button>
                <span class="qty-val">${totalQty}</span>
                <button class="qty-btn plus" data-act="add" data-item="${key}" data-cost="${item.cost}" data-shelflife="${item.shelfLife}">+5</button>
              </div>
            </div>
          </div>
        `;
      };

      return `
        <div class="restock-header">
          <h3>📦 Kho Nguyên Liệu Theo Lô Hạn Dùng</h3>
          <small>Tự động xuất lô sắp hết hạn trước (FIFO)</small>
        </div>
        <div class="restock-scroll-list">
          <div class="category-header">🥤 LY NHỰA (2 LOẠI)</div>
          ${CUPS.map(c => renderItemRow(c, 'cup')).join('')}

          <div class="category-header">🍵 CỐT TRÀ & NƯỚC NỀN (9 LOẠI)</div>
          ${TEAS.map(t => renderItemRow(t, 'tea')).join('')}

          <div class="category-header">🧋 TOPPING (15 LOẠI)</div>
          ${TOPPINGS.map(tp => renderItemRow(tp, 'topping')).join('')}

          <div class="category-header">🍓 SIRO TRÁI CÂY (9 LOẠI)</div>
          ${SYRUPS.map(s => renderItemRow(s, 'syrup')).join('')}
        </div>
      `;
    }

    if (this.activeTab === 'staff') {
      return `
        <div class="restock-header">
          <h3>👩‍🍳 Đội Ngũ 3 Nhân Viên Quán Rùa</h3>
          <small>Tự động hóa pha chế và đơn online</small>
        </div>
        <div class="staff-list">
          ${STAFF_LIST.map(st => {
            const current = state.staff[st.id] || { hired: false, level: 1, status: 'waiting' };
            const isUnlocked = state.day >= st.unlockDay || current.hired;
            const currentSalary = st.baseSalary + (current.level - 1) * 2000;
            const upgradeCost = current.level * 40000 + 30000;

            return `
              <div class="staff-card ${current.hired ? 'hired' : ''}">
                <div class="staff-avatar">${st.avatar}</div>
                <div class="staff-info">
                  <div class="staff-name-row">
                    <b>${st.name}</b>
                    ${current.hired ? `<span class="staff-level-badge">Lv.${current.level}</span>` : ''}
                  </div>
                  <small class="staff-role-desc">${st.role}</small>
                  <div class="staff-status-row">
                    ${isUnlocked 
                      ? (current.hired 
                          ? `<span class="staff-badge doing">🟢 Đang làm việc • Lương: ${currentSalary.toLocaleString()}đ/ca</span>` 
                          : `<span class="staff-badge waiting">🟡 Sẵn sàng thuê</span>`)
                      : `<span class="staff-badge locked">🔒 Mở khóa ở Ngày ${st.unlockDay}</span>`
                    }
                  </div>
                </div>
                <div>
                  ${isUnlocked 
                    ? (current.hired 
                        ? (current.level < 5 
                            ? `<button class="btn-hire upgrade" data-upgrade-staff="${st.id}" data-cost="${upgradeCost}">⬆️ Lên Lv.${current.level + 1}<br><small>${upgradeCost.toLocaleString()}đ</small></button>`
                            : `<button class="btn-hire owned" disabled>Max Lv.5</button>`)
                        : `<button class="btn-hire" data-hire="${st.id}" data-cost="${st.hireCost}">💰 Thuê<br><small>${st.hireCost.toLocaleString()}đ</small></button>`)
                    : `<button class="btn-hire locked-btn" disabled>Chưa mở</button>`
                  }
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    if (this.activeTab === 'upgrades') {
      return `
        <div class="restock-header">
          <h3>✨ Nâng Cấp Tiệm</h3>
        </div>
        <div class="upgrades-list">
          ${UPGRADES_LIST.map(u => {
            const owned = state.upgrades[u.id];
            return `
              <div class="staff-card ${owned ? 'hired' : ''}">
                <div class="staff-avatar">${u.icon}</div>
                <div class="staff-info">
                  <b>${u.name}</b>
                  <small>${u.desc}</small>
                </div>
                <div>
                  ${owned 
                    ? `<button class="btn-hire owned" disabled>Đã có</button>` 
                    : `<button class="btn-hire" data-upgrade="${u.id}" data-cost="${u.cost}">${u.cost.toLocaleString()}đ</button>`
                  }
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    if (this.activeTab === 'ledger') {
      return `
        <div class="ledger-container">
          <div class="ledger-stats-banner">
            <div class="ledger-stat-card highlight">
              <small>Tổng lãi</small>
              <b>+${(state.stats.totalProfitAllTime / 1000).toLocaleString()}k</b>
            </div>
            <div class="ledger-stat-card">
              <small>Đã bán</small>
              <b>${state.stats.totalCupsSold} ly</b>
            </div>
            <div class="ledger-stat-card">
              <small>Đánh giá</small>
              <b style="color: #D69E2E;">⭐ ${state.rating.toFixed(1)}</b>
            </div>
          </div>
          <div class="ledger-section-box">
            <b>📈 LÃI / LỖ 10 NGÀY</b>
            ${this.render10DaysChart()}
          </div>
        </div>
      `;
    }
  }

  render10DaysChart() {
    const list = state.history10Days.slice(-10);
    const maxVal = Math.max(...list.map(d => Math.abs(d.profit)), 350000);

    return `
      <div class="svg-chart-container" style="margin-top: 6px;">
        <svg viewBox="0 0 320 80" width="100%" height="80">
          <line x1="0" y1="65" x2="320" y2="65" stroke="#CBD5E0" stroke-width="1" stroke-dasharray="2 2"/>
          ${list.map((d, i) => {
            const x = 12 + i * 31;
            const barH = Math.max(6, Math.min(55, Math.round((Math.abs(d.profit) / maxVal) * 55)));
            const y = 65 - barH;
            const color = d.profit >= 0 ? '#38A169' : '#E53E3E';
            return `
              <rect x="${x}" y="${y}" width="18" height="${barH}" rx="3" fill="${color}"/>
              <text x="${x + 9}" y="76" font-size="8" fill="#718096" text-anchor="middle" font-weight="700">${d.day}</text>
              <text x="${x + 9}" y="${y - 2}" font-size="7" fill="${color}" text-anchor="middle" font-weight="800">${Math.round(d.profit / 1000)}k</text>
            `;
          }).join('')}
        </svg>
      </div>
    `;
  }

  attachTabEvents() {
    this.elView.querySelectorAll('.qty-btn').forEach(btn => {
      btn.onclick = () => {
        const item = btn.dataset.item;
        const act = btn.dataset.act;
        const cost = parseInt(btn.dataset.cost || '0', 10);
        const shelfLife = parseInt(btn.dataset.shelflife || '2', 10);

        if (act === 'add') {
          const bulkCost = cost * 5;
          if (state.money < bulkCost) {
            audio.trash();
            this.showToast('Không đủ tiền trong ngân quỹ!');
            return;
          }
          state.money -= bulkCost;
          state.buyItemLot(item, 5, cost, shelfLife);
          audio.pour();
          this.showToast(`Đã nhập 5 phần (+Lô mới)!`);
        } else if (act === 'sub') {
          if (state.getTotalQty(item) >= 1) {
            state.consumeItem(item, 1);
            audio.click();
          }
        }
        this.render();
      };
    });

    this.elView.querySelectorAll('[data-view-lots]').forEach(btn => {
      btn.onclick = () => {
        const key = btn.dataset.viewLots;
        const name = btn.dataset.itemName;
        this.openLotsModal(key, name);
      };
    });

    this.elView.querySelectorAll('[data-hire]').forEach(btn => {
      btn.onclick = () => {
        const sid = btn.dataset.hire;
        const cost = parseInt(btn.dataset.cost, 10);
        if (state.money < cost) {
          audio.trash();
          this.showToast('Không đủ tiền thuê nhân viên!');
          return;
        }
        state.money -= cost;
        state.staff[sid].hired = true;
        audio.serveSuccess();
        this.showToast('Đã thuê nhân viên thành công!');
        state.save();
        this.render();
      };
    });

    this.elView.querySelectorAll('[data-upgrade-staff]').forEach(btn => {
      btn.onclick = () => {
        const sid = btn.dataset.upgradeStaff;
        const cost = parseInt(btn.dataset.cost, 10);
        if (state.money < cost) {
          audio.trash();
          this.showToast('Không đủ tiền nâng cấp nhân viên!');
          return;
        }
        state.money -= cost;
        state.staff[sid].level += 1;
        audio.serveSuccess();
        this.showToast(`Đã nâng cấp lên Level ${state.staff[sid].level}!`);
        state.save();
        this.render();
      };
    });

    this.elView.querySelectorAll('[data-upgrade]').forEach(btn => {
      btn.onclick = () => {
        const uid = btn.dataset.upgrade;
        const cost = parseInt(btn.dataset.cost, 10);
        if (state.money < cost) {
          audio.trash();
          this.showToast('Không đủ tiền mua nâng cấp!');
          return;
        }
        state.money -= cost;
        state.upgrades[uid] = true;
        audio.serveSuccess();
        this.showToast('Nâng cấp tiệm thành công!');
        state.save();
        this.render();
      };
    });
  }

  openLotsModal(key, name) {
    audio.click();
    const lots = state.inventoryLots[key] || [];

    this.openModal(`
      <h2>📋 CHI TIẾT LÔ HÀNG: ${name}</h2>
      <div style="max-height: 240px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; margin: 10px 0;">
        ${lots.length === 0 ? '<p style="text-align: center; color: #A0AEC0;">Hết hàng</p>' : ''}
        ${lots.map((lot, idx) => `
          <div style="background: #FFF; border: 1.5px solid #EAD2BC; border-radius: 8px; padding: 6px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <b>Lô #${idx + 1} • ${lot.qty} phần</b>
              <small style="display: block; font-size: 10px; color: #718096;">Nhập Ngày ${lot.buyDay}</small>
            </div>
            <span class="lot-badge ${lot.expireDay <= state.day ? 'badge-today' : 'badge-ok'}">
              ${lot.expireDay <= state.day ? '🔴 Hết hạn hôm nay' : `🟢 Còn đến Ngày ${lot.expireDay}`}
            </span>
          </div>
        `).join('')}
      </div>
      <button class="btn-modal-primary" id="btnCloseLotsModal" style="width: 100%;">ĐÃ HIỂU</button>
    `);

    document.getElementById('btnCloseLotsModal').onclick = () => this.closeModal();
  }

  // ================= 4.2. BẮT ĐẦU PHA CHẾ =================
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
      if (this.isPaused || this.viewMode !== 'sell') return;

      this.gameSeconds += 1;
      const coolerMod = state.upgrades.coolerAir ? 0.7 : 1.1;
      this.orders.forEach(ord => {
        ord.patience = Math.max(0, ord.patience - coolerMod);
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

    this.startStaffAutomation();
    this.render();
  }

  ensureOrderBalance() {
    const hasCounter = this.orders.some(o => o.type === 'counter');
    const hasOnline = this.orders.some(o => o.type === 'online');

    if (!hasCounter && this.orders.length < 3) this.generateOrder('counter');
    if (!hasOnline && this.orders.length < 3) this.generateOrder('online');
    if (this.orders.length < 2) this.generateOrder();
  }

  startStaffAutomation() {
    clearInterval(this.staffTimer);
    this.staffTimer = setInterval(() => {
      if (this.isPaused || this.viewMode !== 'sell') return;

      const activeOrd = this.orders[this.activeOrderIndex];
      if (!activeOrd || this.currentCup.isSealing || this.currentCup.isDelivering) return;

      // Minh rót trà
      if (state.staff.minhTea?.hired && this.currentCup.cup && !this.currentCup.tea) {
        if (state.getTotalQty(activeOrd.recipe.tea) > 0) {
          this.currentCup.tea = activeOrd.recipe.tea;
          audio.pour();
          this.checkAndTriggerAutoSeal();
          this.render();
          return;
        }
      }

      // Linh đa nhiệm
      if (state.staff.linhHelper?.hired && this.currentCup.cup) {
        if (!this.currentCup.sugar) {
          this.currentCup.sugar = activeOrd.recipe.sugar;
          audio.click();
          this.checkAndTriggerAutoSeal();
          this.render();
          return;
        }
        if (!this.currentCup.ice) {
          this.currentCup.ice = activeOrd.recipe.ice;
          audio.addIce();
          this.checkAndTriggerAutoSeal();
          this.render();
          return;
        }
        if (activeOrd.recipe.syrup && !this.currentCup.syrup) {
          if (state.getTotalQty(activeOrd.recipe.syrup) > 0) {
            this.currentCup.syrup = activeOrd.recipe.syrup;
            audio.addSyrup();
            this.checkAndTriggerAutoSeal();
            this.render();
            return;
          }
        }
        for (const tid of activeOrd.recipe.toppings) {
          if (!this.currentCup.toppings.includes(tid)) {
            if (state.getTotalQty(tid) > 0) {
              this.currentCup.toppings.push(tid);
              audio.addTopping();
              this.checkAndTriggerAutoSeal();
              this.render();
              return;
            }
          }
        }
      }
    }, 1200);

    clearInterval(this.vyTimer);
    this.vyTimer = setInterval(() => {
      if (this.isPaused || this.viewMode !== 'sell' || !state.staff.vyOnline?.hired) return;
      const appOrdIdx = this.orders.findIndex((o, idx) => o.type === 'online' && idx !== this.activeOrderIndex);
      if (appOrdIdx !== -1) {
        const appOrd = this.orders[appOrdIdx];
        this.executeDelivery(appOrd, appOrdIdx);
      }
    }, 3500);
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
      cup: null,
      tea: null,
      syrup: null,
      sugar: null,
      ice: null,
      toppings: [],
      isSealing: false,
      isDelivering: false
    };
  }

  // ================= 4.3. RENDER MÀN HÌNH BÁN HÀNG CHUẨN XỊN =================
  renderSellView() {
    const activeOrd = this.orders[this.activeOrderIndex] || null;

    this.elView.innerHTML = `
      <div class="shop-counter-screen">
        <!-- 1. HÀNG ORDER CARD NGANG Ở TRÊN -->
        <div class="orders-top-strip">
          ${this.renderOrdersLane()}
        </div>

        <!-- 2. QUẦY PHA CHẾ CHÍNH CHUẨN HÌNH ẢNH MẪU -->
        <div class="cozy-kitchen-table">
          
          <!-- CỘT BÊN TRÁI: LY, ĐƯỜNG, ĐÁ -->
          <div class="left-ingredients-panel">
            <!-- PHẦN LY -->
            <div class="panel-section-box">
              <div class="box-title-label">LY</div>
              <div class="cups-vertical-stack">
                <button class="cup-item-art ${this.currentCup.cup === 'M' ? 'selected' : ''}" data-pick-cup="M">
                  <span class="qty-pill">${state.getTotalQty('cupM')}</span>
                  <div class="cup-glass-art cup-m">
                    <span class="cup-badge-letter">M</span>
                  </div>
                </button>

                <button class="cup-item-art ${this.currentCup.cup === 'L' ? 'selected' : ''}" data-pick-cup="L">
                  <span class="qty-pill">${state.getTotalQty('cupL')}</span>
                  <div class="cup-glass-art cup-l">
                    <span class="cup-badge-letter">L</span>
                  </div>
                </button>
              </div>
            </div>

            <!-- PHẦN ĐƯỜNG -->
            <div class="panel-section-box">
              <div class="box-title-label">Đường</div>
              <div class="condiment-bowl-art">
                <span class="bowl-icon">🥣</span>
              </div>
              <div class="segmented-picker-row">
                ${SUGAR_LEVELS.map(s => `
                  <button class="seg-btn ${this.currentCup.sugar === s ? 'active' : ''}" data-pick-sugar="${s}">${s}</button>
                `).join('')}
              </div>
            </div>

            <!-- PHẦN ĐÁ -->
            <div class="panel-section-box">
              <div class="box-title-label">Đá</div>
              <div class="condiment-bowl-art">
                <span class="bowl-icon">🧊</span>
              </div>
              <div class="segmented-picker-row">
                ${ICE_LEVELS.map(ice => `
                  <button class="seg-btn ${this.currentCup.ice === ice ? 'active' : ''}" data-pick-ice="${ice}">${ice}</button>
                `).join('')}
              </div>
            </div>

            <!-- NÚT ĐỔ LY -->
            ${this.currentCup.cup ? `
              <button class="btn-trash-bowl" id="btnDiscardCup">🗑 Đổ Ly</button>
            ` : ''}
          </div>

          <!-- KHU VỰC KỆ CHÍNH (BÊN PHẢI) -->
          <div class="right-shelves-panel">
            
            <!-- KỆ TRÊN: 9 BÌNH TRÀ + MÁY ĐÓNG NẮP RETRO -->
            <div class="shelf-wrapper shelf-teas">
              <div class="shelf-header-pill">🌱 TRÀ / NƯỚC NỀN (9 khung)</div>
              
              <div class="teas-and-sealer-row">
                <!-- 9 BÌNH Ủ TRÀ -->
                <div class="dispensers-grid-9">
                  ${TEAS.map((t, idx) => {
                    const isSelected = this.currentCup.tea === t.id;
                    const qty = state.getTotalQty(t.id);
                    return `
                      <button class="dispenser-card-art ${isSelected ? 'selected' : ''}" data-pick-tea="${t.id}" title="${t.name}">
                        <span class="qty-pill">${qty}</span>
                        <!-- Nắp bạc -->
                        <div class="dispenser-cap"></div>
                        <!-- Thân bình thuỷ tinh -->
                        <div class="dispenser-body">
                          <div class="tea-liquid-fill" style="background: ${t.liquid};"></div>
                          <div class="tea-art-icon">${t.icon}</div>
                          <div class="tea-label-banner">${t.name}</div>
                        </div>
                        <!-- Vòi rót đen -->
                        <div class="dispenser-spout"></div>
                      </button>
                    `;
                  }).join('')}
                </div>

                <!-- MÁY ĐÓNG NẮP VINTAGE RETRO -->
                <div class="retro-sealer-art-box ${this.currentCup.isSealing ? 'sealing-active' : ''}">
                  <div class="sealer-film-roll">
                    <span class="film-gear gear-l">⚙️</span>
                    <div class="film-tape-pattern">🌸 🌸 🌸</div>
                    <span class="film-gear gear-r">⚙️</span>
                  </div>

                  <div class="sealer-head-block">
                    <button class="btn-seal-stamp ${this.isOrderMatched(activeOrd) ? 'ready' : ''}" id="btnManualSealServe">
                      <span>ĐÓNG NẮP</span>
                      <i class="led-light ${this.isOrderMatched(activeOrd) ? 'on' : ''}"></i>
                    </button>
                  </div>

                  <!-- ĐẾ ĐẶT LY -->
                  <div class="sealer-cup-stage">
                    ${this.currentCup.cup ? `
                      <div class="staged-cup-preview">
                        ${this.renderCupSvg()}
                      </div>
                    ` : `
                      <div class="empty-stage-ring">
                        <small>Chưa có ly</small>
                      </div>
                    `}
                  </div>
                </div>
              </div>
            </div>

            <!-- KỆ GIỮA: 15 KHAY TOPPING (9 HÀNG TRÊN + 6 HÀNG DƯỚI) -->
            <div class="shelf-wrapper shelf-toppings">
              <div class="shelf-header-pill">🧆 TOPPING (15 khung)</div>
              
              <div class="toppings-container-grid">
                <!-- HÀNG 1: 9 KHAY -->
                <div class="toppings-row-1">
                  ${TOPPINGS.slice(0, 9).map(tp => this.renderToppingTrayHtml(tp)).join('')}
                </div>

                <!-- HÀNG 2: 6 KHAY -->
                <div class="toppings-row-2">
                  ${TOPPINGS.slice(9, 15).map(tp => this.renderToppingTrayHtml(tp)).join('')}
                </div>
              </div>
            </div>

            <!-- KỆ DƯỚI: 9 CHAI SIRO CÓ VÒI BƠM -->
            <div class="shelf-wrapper shelf-syrups">
              <div class="shelf-header-pill">🧴 SIRO (9 khung)</div>
              
              <div class="syrups-bottles-grid-9">
                ${SYRUPS.map(s => {
                  const inCup = this.currentCup.syrup === s.id;
                  const qty = state.getTotalQty(s.id);
                  return `
                    <button class="syrup-bottle-art ${inCup ? 'in-cup' : ''}" data-pick-syrup="${s.id}" title="${s.name}">
                      <span class="qty-pill">${qty}</span>
                      <!-- Vòi bơm đen -->
                      <div class="pump-head-art">
                        <div class="pump-spout-lip"></div>
                        <div class="pump-stem"></div>
                      </div>
                      <!-- Thân chai thuỷ tinh -->
                      <div class="bottle-glass-body">
                        <div class="syrup-liquid-fill" style="background: ${s.color};"></div>
                        <div class="bottle-label-card">
                          <b>${s.name}</b>
                          <span class="fruit-ico">${s.icon}</span>
                        </div>
                      </div>
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

  renderToppingTrayHtml(tp) {
    const inCup = this.currentCup.toppings.includes(tp.id);
    const qty = state.getTotalQty(tp.id);

    return `
      <button class="topping-tray-art ${inCup ? 'in-cup' : ''}" data-pick-topping="${tp.id}" title="${tp.name}">
        <span class="qty-pill">${qty}</span>
        <div class="tray-glass-inner">
          <div class="tray-food-graphic food-${tp.type}" style="--food-color: ${tp.color}">
            ${this.renderFoodVisual(tp)}
          </div>
          <div class="tray-white-badge">${tp.name}</div>
        </div>
      </button>
    `;
  }

  renderFoodVisual(tp) {
    if (tp.type === 'pearl') {
      return `
        <div class="pearls-cluster">
          <span style="background:${tp.color}"></span><span style="background:${tp.color}"></span>
          <span style="background:${tp.color}"></span><span style="background:${tp.color}"></span>
        </div>
      `;
    }
    if (tp.type === 'cube') {
      return `
        <div class="cubes-cluster">
          <span style="background:${tp.color}"></span><span style="background:${tp.color}"></span>
          <span style="background:${tp.color}"></span>
        </div>
      `;
    }
    if (tp.type === 'foam') {
      return `<div class="foam-swirl" style="background:${tp.color}"></div>`;
    }
    if (tp.type === 'bean') {
      return `
        <div class="beans-cluster">
          <span style="background:${tp.color}"></span><span style="background:${tp.color}"></span>
          <span style="background:${tp.color}"></span>
        </div>
      `;
    }
    return `<div class="seeds-cluster" style="background:${tp.color}"></div>`;
  }

  // ================= 4.4. CARD ORDER NGANG Ở TRÊN =================
  renderOrdersLane() {
    if (this.orders.length === 0) {
      return '<div class="no-orders-banner">Đang chờ khách gọi món mới... 🐢</div>';
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
                  <i style="width: ${ord.patience}%; background: ${ord.patience > 35 ? '#38A169' : (ord.patience > 20 ? '#DD6B20' : '#E53E3E')};"></i>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  renderCupSvg() {
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
      <svg viewBox="0 0 60 76" width="38" height="48">
        <path d="M10 8 L15 68 Q16 71 20 71 L40 71 Q44 71 45 68 L50 8 Z" fill="rgba(255,255,255,0.4)" stroke="#7A4222" stroke-width="1.8"/>
        ${this.currentCup.tea || this.currentCup.syrup ? `
          <path d="M12 14 L15 68 Q16 70 20 70 L40 70 Q44 70 45 68 L48 14 Z" fill="${liquidColor}"/>
        ` : ''}
        ${hasIce ? `
          <rect x="20" y="24" width="8" height="7" rx="2" fill="#FFF" fill-opacity="0.8"/>
          <rect x="32" y="30" width="8" height="7" rx="2" fill="#FFF" fill-opacity="0.8"/>
        ` : ''}
        ${hasTops ? `
          <circle cx="22" cy="65" r="3" fill="#3D2214"/>
          <circle cx="30" cy="66" r="3" fill="#3D2214"/>
          <circle cx="38" cy="65" r="3" fill="#3D2214"/>
        ` : ''}
        <ellipse cx="30" cy="8" rx="20" ry="3.5" fill="none" stroke="#7A4222" stroke-width="1.8"/>
      </svg>
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
        audio.click();
        this.openModal(`
          <h2>🗑 ĐỔ LY NÀY?</h2>
          <p style="color: #7C5B49; margin: 8px 0 16px;">
            Bạn có chắc muốn đổ ly đang pha dở này không?
          </p>
          <div class="modal-btns">
            <button class="btn-modal-cancel" id="btnCancelDiscard">HỦY</button>
            <button class="btn-modal-confirm" id="btnConfirmDiscard">ĐỔ LY</button>
          </div>
        `);

        document.getElementById('btnCancelDiscard').onclick = () => this.closeModal();
        document.getElementById('btnConfirmDiscard').onclick = () => {
          this.closeModal();
          audio.trash();
          state.today.wasteDiscardedCups += 1500;
          this.resetCup();
          this.showToast('Đã đổ ly làm lại!');
          this.render();
        };
      };
    }

    const btnManualSeal = document.getElementById('btnManualSealServe');
    if (btnManualSeal) {
      btnManualSeal.onclick = () => {
        const ord = this.orders[this.activeOrderIndex];
        if (ord && this.isOrderMatched(ord)) {
          this.checkAndTriggerAutoSeal(true);
        } else {
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

      const duration = state.upgrades.fastSealer ? 250 : 450;

      setTimeout(() => {
        this.currentCup.isSealing = false;
        this.currentCup.isDelivering = true;
        this.executeDelivery(ord);
      }, duration);
    }
  }

  executeDelivery(ord, explicitIdx = null) {
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
    const tipMod = state.upgrades.turtleCharm ? 0.25 : 0.15;
    const tip = Math.round(fullPrice * tipMod);
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

    const removeIdx = explicitIdx !== null ? explicitIdx : this.activeOrderIndex;
    this.orders.splice(removeIdx, 1);
    this.activeOrderIndex = 0;
    this.resetCup();
    this.ensureOrderBalance();
    this.render();
  }

  endSellPhase() {
    clearInterval(this.sellTimer);
    clearInterval(this.staffTimer);
    clearInterval(this.vyTimer);
    audio.bell();

    const expiredCount = state.processEndOfDayExpiry();
    const rentCost = state.today.costRent;
    const utilitiesCost = state.today.costUtilities;

    let staffSalaries = 0;
    if (state.staff.minhTea?.hired) staffSalaries += STAFF_LIST[0].baseSalary + (state.staff.minhTea.level - 1) * 2000;
    if (state.staff.linhHelper?.hired) staffSalaries += STAFF_LIST[1].baseSalary + (state.staff.linhHelper.level - 1) * 2000;
    if (state.staff.vyOnline?.hired) staffSalaries += STAFF_LIST[2].baseSalary + (state.staff.vyOnline.level - 1) * 2000;

    const totalRevenue = this.dailyReport.revenue;
    const totalExpenses = rentCost + utilitiesCost + staffSalaries;
    const totalWaste = state.today.wasteExpiredTea + state.today.wasteExpiredTopping + state.today.wasteExpiredSyrup + state.today.wasteDiscardedCups;
    const netProfit = totalRevenue - totalExpenses - totalWaste;

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
        <div class="summary-line sub"><span>Mặt bằng & Điện:</span> <b class="neg">-${(rentCost + utilitiesCost).toLocaleString()}đ</b></div>
        ${staffSalaries > 0 ? `<div class="summary-line sub"><span>Lương nhân viên:</span> <b class="neg">-${staffSalaries.toLocaleString()}đ</b></div>` : ''}
        ${totalWaste > 0 ? `<div class="summary-line sub"><span>Hao hụt:</span> <b class="neg">-${totalWaste.toLocaleString()}đ</b></div>` : ''}
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
      state.today = {
        revenueDrinks: 0,
        revenueTips: 0,
        revenueApp: 0,
        costRestock: 0,
        costRent: 45000,
        costUtilities: 15000,
        costSalaries: 0,
        wasteExpiredTopping: 0,
        wasteExpiredSyrup: 0,
        wasteExpiredTea: 0,
        wasteDiscardedCups: 0
      };
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
