/**
 * 🧋 TIỆM TRÀ SỮA CỦA RÙA (Boba Shop Simulator)
 * Hoàn thiện toàn diện theo Tài liệu yêu cầu:
 * 1. Kho nguyên liệu theo LÔ HÀNG & HẠN SỬ DỤNG (HSD, còn 1-2 ngày, hết hạn tối nay, hao hụt).
 * 2. 3 Nhân viên chốt: Minh (Rót trà), Linh (Topping + Đường/Đá/Siro), Vy (Online/Ship), mở khóa -> thuê -> nâng cấp.
 * 3. Tách rõ KHÁCH TẠI QUÁN vs ĐƠN APP/SHIP dạng CARD NGANG DÀI, thanh kiên nhẫn ngang sát đáy, trạng thái 🔴 -> 🟢✓.
 * 4. Màn hình pha chế CỐ ĐỊNH: BẤM, KHÔNG KÉO/SCROLL (9 Trà, 15 Topping, 9 Siro, Ly M/L, Đường, Đá, Máy đóng nắp).
 * 5. Sổ sách sâu: Tổng lãi, đã bán X ly, Biểu đồ lãi/lỗ 10 ngày, Báo cáo Thu - Chi - Hao hụt hôm nay.
 */

// ================= 1. ÂM THANH (SYNTHESIZER) =================
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
  pour() { this.playBeep(340, 'triangle', 0.14, 0.15); }
  addIce() {
    this.playBeep(1200, 'sine', 0.05, 0.1);
    setTimeout(() => this.playBeep(1500, 'sine', 0.04, 0.08), 30);
  }
  addTopping() { this.playBeep(280, 'sine', 0.08, 0.18); }
  addSyrup() { this.playBeep(520, 'sine', 0.1, 0.16); }
  autoSeal() {
    this.playBeep(480, 'sine', 0.06, 0.18);
    setTimeout(() => this.playBeep(880, 'triangle', 0.12, 0.22), 40);
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

// ================= 2. DANH MỤC NGUYÊN LIỆU (ĐÚNG SỐ LƯỢNG CỐ ĐỊNH) =================
const CUPS = [
  { id: 'M', name: 'Ly M', ml: '500ml', cost: 500, priceBonus: 0, shelfLife: 999 },
  { id: 'L', name: 'Ly L', ml: '700ml', cost: 800, priceBonus: 8000, shelfLife: 999 }
];

// CỐ ĐỊNH 9 TRÀ / NƯỚC NỀN
const TEAS = [
  { id: 'oolong', name: 'Ô long', icon: '🪵', liquid: '#C48850', cost: 3000, price: 20000, shelfLife: 2 },
  { id: 'black', name: 'Trà đen', icon: '🍂', liquid: '#9C441E', cost: 3000, price: 20000, shelfLife: 2 },
  { id: 'green', name: 'Trà xanh', icon: '🌼', liquid: '#DCC060', cost: 3000, price: 20000, shelfLife: 2 },
  { id: 'jasmine', name: 'Trà nhài', icon: '🌸', liquid: '#EAD68C', cost: 3500, price: 22000, shelfLife: 2 },
  { id: 'milk', name: 'Sữa tươi', icon: '🥛', liquid: '#F8EDE1', cost: 3000, price: 20000, shelfLife: 1 },
  { id: 'brownSugar', name: 'Đường đen', icon: '🧋', liquid: '#5A341E', cost: 4000, price: 25000, shelfLife: 2 },
  { id: 'hongTra', name: 'Hồng trà', icon: '🍵', liquid: '#BA4322', cost: 3200, price: 22000, shelfLife: 2 },
  { id: 'traSen', name: 'Trà sen', icon: '🪷', liquid: '#C29F68', cost: 3800, price: 24000, shelfLife: 2 },
  { id: 'thaiXanh', name: 'Thái xanh', icon: '🌿', liquid: '#4C8545', cost: 3500, price: 22000, shelfLife: 2 }
];

const SUGAR_LEVELS = ['0%', '30%', '50%', '70%', '100%'];
const ICE_LEVELS = ['Không đá', 'Ít đá', 'Bình thường', 'Nhiều đá'];

// CỐ ĐỊNH 15 TOPPING
const TOPPINGS = [
  { id: 'tapioca', name: 'Trân châu đen', icon: '🟤', cost: 2000, price: 5000, shelfLife: 2 },
  { id: 'whitePearl', name: 'Trân châu trắng', icon: '⚪', cost: 2500, price: 6000, shelfLife: 2 },
  { id: 'pudding', name: 'Pudding trứng', icon: '🍮', cost: 3000, price: 7000, shelfLife: 2 },
  { id: 'cheeseJelly', name: 'Thạch phô mai', icon: '🟡', cost: 3000, price: 7000, shelfLife: 2 },
  { id: 'coconut', name: 'Thạch dừa', icon: '🥥', cost: 2000, price: 5000, shelfLife: 3 },
  { id: 'peachSlice', name: 'Đào miếng', icon: '🍑', cost: 3000, price: 7000, shelfLife: 3 },
  { id: 'strawberryJelly', name: 'Thạch dâu', icon: '🍓', cost: 2500, price: 6000, shelfLife: 2 },
  { id: 'cheeseFoam', name: 'Cheese foam', icon: '🧀', cost: 3500, price: 8000, shelfLife: 2 },
  { id: 'herbalJelly', name: 'Sương sáo', icon: '🫘', cost: 2000, price: 5000, shelfLife: 2 },
  { id: 'chestnutPearl', name: 'Củ năng', icon: '🌰', cost: 2800, price: 6000, shelfLife: 2 },
  { id: 'redBean', name: 'Đậu đỏ', icon: '🫘', cost: 2500, price: 6000, shelfLife: 3 },
  { id: 'lotusSeed', name: 'Hạt sen', icon: '🪷', cost: 3000, price: 7000, shelfLife: 2 },
  { id: 'khucBach', name: 'Khúc bạch', icon: '🥛', cost: 3200, price: 7000, shelfLife: 2 },
  { id: 'aloeVera', name: 'Nha đam', icon: '🌱', cost: 2200, price: 5000, shelfLife: 3 },
  { id: 'goldenPearl', name: 'Trân châu vàng', icon: '✨', cost: 2800, price: 6500, shelfLife: 2 }
];

// CỐ ĐỊNH 9 SIRO TRÁI CÂY
const SYRUPS = [
  { id: 'peach', name: 'Siro Đào', icon: '🍑', color: '#FFB07C', cost: 2000, price: 5000, shelfLife: 4 },
  { id: 'strawberry', name: 'Siro Dâu', icon: '🍓', color: '#FF6B8B', cost: 2000, price: 5000, shelfLife: 4 },
  { id: 'mango', name: 'Siro Xoài', icon: '🥭', color: '#F6AD55', cost: 2000, price: 5000, shelfLife: 4 },
  { id: 'grape', name: 'Siro Nho', icon: '🍇', color: '#9F7AEA', cost: 2000, price: 5000, shelfLife: 4 },
  { id: 'orange', name: 'Siro Cam', icon: '🍊', color: '#ED8936', cost: 2000, price: 5000, shelfLife: 4 },
  { id: 'watermelon', name: 'Siro Dưa Hấu', icon: '🍉', color: '#FC8181', cost: 2000, price: 5000, shelfLife: 4 },
  { id: 'lychee', name: 'Siro Vải', icon: '🍈', color: '#F7FAFC', cost: 2200, price: 6000, shelfLife: 4 },
  { id: 'passion', name: 'Chanh Dây', icon: '🍋', color: '#ECC94B', cost: 2200, price: 6000, shelfLife: 4 },
  { id: 'blueberry', name: 'Việt Quất', icon: '🫐', color: '#6B46C1', cost: 2500, price: 6000, shelfLife: 4 }
];

const CUSTOMER_NAMES = [
  'Cô Lan', 'Anh Minh', 'Bé Na', 'Khánh An', 'Minh Thư',
  'Tuấn Anh', 'Cô Hồng', 'Bảo Châu', 'Bác Tư', 'Anh Hiếu', 'Bách'
];

// 3 NHÂN VIÊN CHỐT THEO YÊU CẦU
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

// ================= 3. TRẠNG THÁI GAME & QUẢN LÝ LÔ HÀNG (BATCHES) =================
class GameState {
  constructor() {
    this.shopName = 'Tiệm Trà Sữa Của Rùa';
    this.day = 1;
    this.money = 200000;
    this.rating = 5.0;
    this.ratingCount = 8;
    this.level = 1;
    this.exp = 0;
    this.expMax = 100;

    // Quản lý kho theo LÔ HÀNG có Hạn Sử Dụng
    // { [itemId]: [ { id, qty, buyDay, expireDay, cost } ] }
    this.inventoryLots = {};

    // 3 Nhân viên
    this.staff = {
      minhTea: { hired: false, level: 1, status: 'waiting' },
      linhHelper: { hired: false, level: 1, status: 'waiting' },
      vyOnline: { hired: false, level: 1, status: 'waiting' }
    };

    this.upgrades = {};

    // Sổ sách tài chính
    this.stats = {
      totalCupsSold: 120,
      totalProfitAllTime: 1645100
    };

    // Chi tiết tài chính ca bán ngày hiện tại
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

    // Lịch sử 10 ngày để vẽ biểu đồ
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
      { name: "Chị Lan", stars: 5, comment: "Trà sữa ô long đậm vị, trân châu mềm dẻo 10 điểm!" },
      { name: "Anh Nam", stars: 5, comment: "Máy dập nắp xịn xò, giao hàng online đóng gói kỹ lưỡng." },
      { name: "Bảo Châu", stars: 5, comment: "Quán Rùa cưng xỉu, siro đào thơm ngát tự nhiên." }
    ];

    this.initDefaultInventoryLots();
    this.load();
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
    TEAS.forEach(t => addInitial(t.id, 25, t.cost, t.shelfLife));
    TOPPINGS.forEach(tp => addInitial(tp.id, 25, tp.cost, tp.shelfLife));
    SYRUPS.forEach(s => addInitial(s.id, 20, s.cost, s.shelfLife));
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
      localStorage.setItem('tiemTraSuaRua_save_v2', JSON.stringify(data));
    } catch (e) {
      console.error("Lỗi lưu game", e);
    }
  }

  load() {
    try {
      const str = localStorage.getItem('tiemTraSuaRua_save_v2');
      if (str) {
        const obj = JSON.parse(str);
        Object.assign(this, obj);
      }
      // Đảm bảo đủ các thuộc tính nhân viên
      if (!this.staff.minhTea) this.staff.minhTea = { hired: false, level: 1, status: 'waiting' };
      if (!this.staff.linhHelper) this.staff.linhHelper = { hired: false, level: 1, status: 'waiting' };
      if (!this.staff.vyOnline) this.staff.vyOnline = { hired: false, level: 1, status: 'waiting' };
    } catch (e) {
      console.error("Lỗi nạp game", e);
    }
  }

  // Lấy tổng tồn kho của 1 mặt hàng
  getTotalQty(itemId) {
    const lots = this.inventoryLots[itemId] || [];
    return lots.reduce((sum, l) => sum + (l.qty || 0), 0);
  }

  // Tóm tắt hạn sử dụng của 1 mặt hàng (Còn 1 ngày, hết hạn tối nay...)
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

  // Mua hàng -> tạo LÔ MỚI có hạn sử dụng
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

  // Tiêu hao nguyên liệu (FIFO / Ưu tiên lô sắp hết hạn trước)
  consumeItem(itemId, qty = 1) {
    const lots = this.inventoryLots[itemId];
    if (!lots || lots.length === 0) return false;

    // Sắp xếp ưu tiên hạn hết trước (expireDay tăng dần)
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

  // Xử lý hết hạn cuối ngày (Hao hụt)
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
            // Hết hạn tối nay
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

// ================= 4. CONTROLLER GAME =================
class GameApp {
  constructor() {
    this.viewMode = 'prep'; // 'prep' hoặc 'sell'
    this.activeTab = 'restock'; // 'restock' | 'staff' | 'upgrades' | 'ledger'
    this.isPaused = false;

    this.sellTimer = null;
    this.staffTimer = null;
    this.vyTimer = null;
    this.gameSeconds = 0;
    this.maxDaySeconds = 75;

    this.orders = [];
    this.activeOrderIndex = 0;
    this.orderCounterId = 2960;

    // Ly đang pha trên bàn
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

    // Elements
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
    this.render();
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
    if (this.viewMode !== 'sell') return;
    this.isPaused = !this.isPaused;
    audio.click();

    if (this.isPaused) {
      this.openModal(`
        <h2>⏸ TẠM DỪNG</h2>
        <p style="color: #7C5B49; margin-bottom: 14px;">Quán đang tạm nghỉ ngơi một chút!</p>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <button class="btn-modal-primary" id="btnResume">▶️ Tiếp tục bán</button>
          <button class="btn-modal-cancel" id="btnToggleSoundModal">
            ${audio.enabled ? '🔊 Tắt âm thanh' : '🔇 Bật âm thanh'}
          </button>
          <button class="btn-modal-confirm" id="btnEndDayEarly">🌙 Đóng cửa tiệm sớm</button>
        </div>
      `);

      document.getElementById('btnResume').onclick = () => this.togglePause();
      document.getElementById('btnToggleSoundModal').onclick = () => {
        const on = audio.toggle();
        this.elBtnSound.textContent = on ? '🔊' : '🔇';
        this.togglePause();
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
            <div class="awning"></div>
            <div class="mascot-turtle">
              <svg viewBox="0 0 80 90" width="100%" height="100%">
                <ellipse cx="40" cy="54" rx="27" ry="24" fill="#529B2B" stroke="#2F6614" stroke-width="3"/>
                <ellipse cx="40" cy="52" rx="20" ry="17" fill="#68B936" stroke="#2F6614" stroke-width="1.5"/>
                <circle cx="40" cy="30" r="14" fill="#A0D864" stroke="#2F6614" stroke-width="2.5"/>
                <circle cx="34" cy="27" r="4.5" fill="#3D2214"/>
                <circle cx="33" cy="25.5" r="1.5" fill="#FFF"/>
                <circle cx="46" cy="27" r="4.5" fill="#3D2214"/>
                <circle cx="45" cy="25.5" r="1.5" fill="#FFF"/>
                <path d="M36 34 Q40 38 44 34" fill="none" stroke="#2F6614" stroke-width="2" stroke-linecap="round"/>
                <circle cx="31" cy="33" r="3" fill="#FFB6C1" opacity="0.8"/>
                <circle cx="49" cy="33" r="3" fill="#FFB6C1" opacity="0.8"/>
                <circle cx="20" cy="62" r="6" fill="#A0D864" stroke="#2F6614" stroke-width="2"/>
                <circle cx="60" cy="62" r="6" fill="#A0D864" stroke="#2F6614" stroke-width="2"/>
                <rect x="34" y="52" width="12" height="17" rx="3" fill="#FFF" stroke="#2F6614" stroke-width="1.8"/>
                <rect x="35" y="57" width="10" height="11" rx="2" fill="#E88358"/>
                <circle cx="38" cy="65" r="1.5" fill="#3D2214"/>
                <circle cx="42" cy="65" r="1.5" fill="#3D2214"/>
                <line x1="42" y1="46" x2="39" y2="62" stroke="#FF6B8B" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
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
            <span>🐢</span> MỞ TIỆM BÁN HÀNG NGÀY ${state.day}
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
      btnStart.onclick = () => this.startSellPhase();
    }

    this.attachTabEvents();
  }

  // ================= 4.2. NỘI DUNG TỪNG TAB =================
  getTabContentHtml() {
    // TAB 1: KHO NGUYÊN LIỆU VỚI LÔ HÀNG & HẠN SỬ DỤNG
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
                <span class="sub-desc">Dùng trong ngày · ${item.cost.toLocaleString()}đ/phần · Còn ${totalQty}</span>
              </div>
              <div class="lot-badges-row">
                ${summary.expToday > 0 ? `<span class="lot-badge badge-today">🔴 ${summary.expToday} hết hạn tối nay</span>` : ''}
                ${summary.expIn1Day > 0 ? `<span class="lot-badge badge-soon">🟡 Còn 1 ngày (${summary.expIn1Day})</span>` : ''}
                ${summary.expLater > 0 ? `<span class="lot-badge badge-ok">🟢 Còn ${summary.expLater} dài hạn</span>` : ''}
                ${summary.lots.length === 0 ? `<span class="lot-badge badge-out">⚠️ Đã hết hàng</span>` : ''}
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
          <small>Tự động xuất lô sắp hết hạn trước (FIFO) • Hết hạn tối nay sẽ tính vào Hao hụt</small>
        </div>
        <div class="restock-scroll-list">
          <div class="category-header">🥤 LY NHỰA (2 LOẠI CỐ ĐỊNH)</div>
          ${CUPS.map(c => renderItemRow(c, 'cup')).join('')}

          <div class="category-header">🍵 CỐT TRÀ & NƯỚC NỀN (9 LOẠI CỐ ĐỊNH)</div>
          ${TEAS.map(t => renderItemRow(t, 'tea')).join('')}

          <div class="category-header">🧋 TOPPING & THẠCH (15 LOẠI CỐ ĐỊNH)</div>
          ${TOPPINGS.map(tp => renderItemRow(tp, 'topping')).join('')}

          <div class="category-header">🍓 SIRO TRÁI CÂY (9 LOẠI CỐ ĐỊNH)</div>
          ${SYRUPS.map(s => renderItemRow(s, 'syrup')).join('')}
        </div>
      `;
    }

    // TAB 2: ĐỘI NGŨ 3 NHÂN VIÊN (MỞ KHÓA -> THUÊ -> NÂNG CẤP)
    if (this.activeTab === 'staff') {
      return `
        <div class="restock-header">
          <h3>👩‍🍳 Đội Ngũ 3 Nhân Viên Quán Rùa</h3>
          <small>Tự động hóa toàn diện • Nâng cấp tăng tốc độ làm việc</small>
        </div>
        <div class="staff-list">
          ${STAFF_LIST.map(st => {
            const current = state.staff[st.id] || { hired: false, level: 1, status: 'waiting' };
            const isUnlocked = state.day >= st.unlockDay || current.hired;
            const currentSalary = st.baseSalary + (current.level - 1) * 2000;
            const upgradeCost = current.level * 40000 + 30000;
            const speedSec = ((st.baseInterval - (current.level - 1) * 200) / 1000).toFixed(1);

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
                          ? `<span class="staff-badge doing">🟢 Đang làm việc • Tốc độ: ${speedSec}s • Lương: ${currentSalary.toLocaleString()}đ/ca</span>` 
                          : `<span class="staff-badge waiting">🟡 Sẵn sàng thuê • Lương: ${st.baseSalary.toLocaleString()}đ/ca</span>`)
                      : `<span class="staff-badge locked">🔒 Mở khóa ở Ngày ${st.unlockDay}</span>`
                    }
                  </div>
                </div>
                <div class="staff-btn-col">
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

    // TAB 3: TRANG THIẾT BỊ NÂNG CẤP
    if (this.activeTab === 'upgrades') {
      return `
        <div class="restock-header">
          <h3>✨ Trang Thiết Bị & Tiện Nghi</h3>
          <small>Nâng cao hiệu suất dập nắp và độ hài lòng của khách</small>
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
                  <span class="staff-badge ${owned ? 'doing' : 'waiting'}">
                    ${owned ? '🟢 Đã hoạt động vĩnh viễn' : '🟡 Có thể mua'}
                  </span>
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

    // TAB 4: SỔ SÁCH SÂU (BIỂU ĐỒ 10 NGÀY, THU CHI, HAO HỤT)
    if (this.activeTab === 'ledger') {
      const totalThu = state.today.revenueDrinks + state.today.revenueTips + state.today.revenueApp;
      let staffSalaries = 0;
      if (state.staff.minhTea?.hired) staffSalaries += STAFF_LIST[0].baseSalary + (state.staff.minhTea.level - 1) * 2000;
      if (state.staff.linhHelper?.hired) staffSalaries += STAFF_LIST[1].baseSalary + (state.staff.linhHelper.level - 1) * 2000;
      if (state.staff.vyOnline?.hired) staffSalaries += STAFF_LIST[2].baseSalary + (state.staff.vyOnline.level - 1) * 2000;

      const totalChi = state.today.costRestock + state.today.costRent + state.today.costUtilities + staffSalaries;
      const totalWaste = state.today.wasteExpiredTopping + state.today.wasteExpiredSyrup + state.today.wasteExpiredTea + state.today.wasteDiscardedCups;
      const netToday = totalThu - totalChi - totalWaste;

      return `
        <div class="ledger-container">
          <div class="ledger-stats-banner">
            <div class="ledger-stat-card highlight">
              <small>Tổng lãi từ khi mở quán</small>
              <b>+${(state.stats.totalProfitAllTime / 1000).toLocaleString()}k</b>
            </div>
            <div class="ledger-stat-card">
              <small>Đã bán</small>
              <b>${state.stats.totalCupsSold} ly</b>
            </div>
            <div class="ledger-stat-card">
              <small>Đánh giá khách</small>
              <b style="color: #D69E2E;">⭐ ${state.rating.toFixed(1)} / 5.0</b>
            </div>
          </div>

          <!-- BIỂU ĐỒ LÃI / LỖ 10 NGÀY -->
          <div class="ledger-section-box">
            <div class="section-box-header">
              <b>📈 BIỂU ĐỒ LÃI / LỖ 10 NGÀY GẦN NHẤT</b>
              <small>Theo dõi phong độ kinh doanh</small>
            </div>
            <div class="chart-wrapper">
              ${this.render10DaysChart()}
            </div>
          </div>

          <!-- HÔM NAY (BÁO CÁO TÀI CHÍNH CHI TIẾT) -->
          <div class="ledger-section-box">
            <div class="section-box-header">
              <b>📅 TÀI CHÍNH HÔM NAY (NGÀY ${state.day})</b>
              <small>Thu • Chi • Hao hụt</small>
            </div>

            <div class="fin-ledger-grid">
              <!-- THU -->
              <div class="fin-column income">
                <div class="fin-title">📥 THU</div>
                <div class="fin-item"><span>Tiền bán đồ uống</span><b class="pos">+${state.today.revenueDrinks.toLocaleString()}đ</b></div>
                <div class="fin-item"><span>Tiền tip</span><b class="pos">+${state.today.revenueTips.toLocaleString()}đ</b></div>
                <div class="fin-item"><span>Đơn App</span><b class="pos">+${state.today.revenueApp.toLocaleString()}đ</b></div>
                <div class="fin-total-row"><span>Tổng thu:</span><b class="pos">+${totalThu.toLocaleString()}đ</b></div>
              </div>

              <!-- CHI -->
              <div class="fin-column expense">
                <div class="fin-title">📤 CHI</div>
                <div class="fin-item"><span>Nhập hàng</span><b class="neg">-${state.today.costRestock.toLocaleString()}đ</b></div>
                <div class="fin-item"><span>Mặt bằng</span><b class="neg">-${state.today.costRent.toLocaleString()}đ</b></div>
                <div class="fin-item"><span>Điện nước</span><b class="neg">-${state.today.costUtilities.toLocaleString()}đ</b></div>
                <div class="fin-item"><span>Lương nhân viên</span><b class="neg">-${staffSalaries.toLocaleString()}đ</b></div>
                <div class="fin-total-row"><span>Tổng chi:</span><b class="neg">-${totalChi.toLocaleString()}đ</b></div>
              </div>

              <!-- HAO HỤT -->
              <div class="fin-column waste">
                <div class="fin-title">⚠️ HAO HỤT</div>
                <div class="fin-item"><span>Topping hết hạn</span><b class="neg">-${state.today.wasteExpiredTopping.toLocaleString()}đ</b></div>
                <div class="fin-item"><span>Siro hết hạn</span><b class="neg">-${state.today.wasteExpiredSyrup.toLocaleString()}đ</b></div>
                <div class="fin-item"><span>Trà hết hạn</span><b class="neg">-${state.today.wasteExpiredTea.toLocaleString()}đ</b></div>
                <div class="fin-item"><span>Ly làm hỏng</span><b class="neg">-${state.today.wasteDiscardedCups.toLocaleString()}đ</b></div>
                <div class="fin-total-row"><span>Tổng hao hụt:</span><b class="neg">-${totalWaste.toLocaleString()}đ</b></div>
              </div>
            </div>

            <div class="fin-net-profit-banner">
              <span>LÃI / LỖ DỰ KIẾN HÔM NAY:</span>
              <b class="${netToday >= 0 ? 'pos' : 'neg'}">${netToday >= 0 ? '+' : ''}${netToday.toLocaleString()}đ</b>
            </div>
          </div>

          <!-- ĐÁNH GIÁ CỦA KHÁCH -->
          <div class="ledger-section-box">
            <div class="section-box-header">
              <b>💬 ĐÁNH GIÁ KHÁCH HÀNG</b>
            </div>
            <div class="reviews-list-compact">
              ${state.reviews.map(r => `
                <div class="review-item">
                  <div style="display: flex; justify-content: space-between;">
                    <b>${r.name}</b>
                    <span style="color: #ECC94B;">${'⭐'.repeat(r.stars)}</span>
                  </div>
                  <p>"${r.comment}"</p>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }
  }

  render10DaysChart() {
    const list = state.history10Days.slice(-10);
    const maxVal = Math.max(...list.map(d => Math.abs(d.profit)), 350000);
    const height = 90;

    return `
      <div class="svg-chart-container">
        <svg viewBox="0 0 320 90" width="100%" height="90">
          <line x1="0" y1="75" x2="320" y2="75" stroke="#CBD5E0" stroke-width="1" stroke-dasharray="2 2"/>
          ${list.map((d, i) => {
            const x = 15 + i * 31;
            const barH = Math.max(6, Math.min(65, Math.round((Math.abs(d.profit) / maxVal) * 65)));
            const y = 75 - barH;
            const color = d.profit >= 0 ? '#38A169' : '#E53E3E';
            return `
              <rect x="${x}" y="${y}" width="18" height="${barH}" rx="3" fill="${color}"/>
              <text x="${x + 9}" y="87" font-size="8" fill="#718096" text-anchor="middle" font-weight="700">${d.day}</text>
              <text x="${x + 9}" y="${y - 3}" font-size="7" fill="${color}" text-anchor="middle" font-weight="800">${Math.round(d.profit / 1000)}k</text>
            `;
          }).join('')}
        </svg>
      </div>
    `;
  }

  attachTabEvents() {
    // 1. Mua thêm nguyên liệu (+5)
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

    // 2. Xem chi tiết các lô hàng
    this.elView.querySelectorAll('[data-view-lots]').forEach(btn => {
      btn.onclick = () => {
        const key = btn.dataset.viewLots;
        const name = btn.dataset.itemName;
        this.openLotsModal(key, name);
      };
    });

    // 3. Thuê nhân viên
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
        state.staff[sid].status = 'waiting';
        audio.serveSuccess();
        this.showToast('Đã thuê nhân viên thành công!');
        state.save();
        this.render();
      };
    });

    // 4. Nâng cấp nhân viên
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
        this.showToast(`Đã nâng cấp lên Level ${state.staff[sid].level}! Tốc độ tăng vượt bậc.`);
        state.save();
        this.render();
      };
    });

    // 5. Mua nâng cấp thiết bị
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
      <p style="color: #7C5B49; margin-top: 0; font-size: 12px;">Mỗi lần nhập hàng sẽ có hạn sử dụng riêng</p>

      <div style="max-height: 240px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; margin: 10px 0;">
        ${lots.length === 0 ? '<p style="text-align: center; color: #A0AEC0;">Hiện không còn lô hàng nào trong kho</p>' : ''}
        ${lots.map((lot, idx) => {
          const isExpToday = lot.expireDay <= state.day;
          const isExpTomorrow = lot.expireDay === state.day + 1;
          const badgeClass = isExpToday ? 'badge-today' : (isExpTomorrow ? 'badge-soon' : 'badge-ok');
          const badgeText = isExpToday ? '🔴 Hết hạn tối nay' : (isExpTomorrow ? '🟡 Hết hạn ngày mai' : `🟢 Còn đến Ngày ${lot.expireDay}`);

          return `
            <div style="background: #FFF; border: 1.5px solid #EAD2BC; border-radius: 8px; padding: 8px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <b>Lô #${idx + 1} • ${lot.qty} phần</b>
                <small style="display: block; font-size: 10px; color: #718096;">Nhập Ngày ${lot.buyDay} • Giá vốn: ${lot.cost.toLocaleString()}đ</small>
              </div>
              <span class="lot-badge ${badgeClass}" style="font-size: 10px;">${badgeText}</span>
            </div>
          `;
        }).join('')}
      </div>

      <button class="btn-modal-primary" id="btnCloseLotsModal" style="width: 100%;">ĐÃ HIỂU</button>
    `);

    document.getElementById('btnCloseLotsModal').onclick = () => this.closeModal();
  }

  // ================= 4.3. GIAO DIỆN BÁN HÀNG (SELL VIEW) =================
  startSellPhase() {
    audio.bell();
    this.viewMode = 'sell';
    this.isPaused = false;
    this.gameSeconds = 0;
    this.orders = [];
    this.activeOrderIndex = 0;
    this.resetCup();

    this.dailyReport = {
      served: 0,
      mistakes: 0,
      revenue: 0,
      tips: 0
    };

    // Sinh ban đầu: 1 Đơn Tại Quán & 1 Đơn App
    this.generateOrder('counter');
    this.generateOrder('online');

    clearInterval(this.sellTimer);
    this.sellTimer = setInterval(() => {
      if (this.isPaused) return;

      this.gameSeconds += 1;

      // Giảm kiên nhẫn
      const coolerMod = state.upgrades.coolerAir ? 0.9 : 1.3;
      this.orders.forEach(ord => {
        ord.patience = Math.max(0, ord.patience - coolerMod);
      });

      // Khách hết kiên nhẫn
      const angryIdx = this.orders.findIndex(ord => ord.patience <= 0);
      if (angryIdx !== -1) {
        audio.trash();
        const angryOrd = this.orders.splice(angryIdx, 1)[0];
        this.dailyReport.mistakes += 1;
        state.rating = Math.max(1.0, state.rating - 0.15);
        this.showToast(`${angryOrd.name} đã hủy đơn vì chờ quá lâu!`);
        this.ensureOrderBalance();
      }

      if (this.gameSeconds >= this.maxDaySeconds) {
        this.endSellPhase();
      } else {
        this.render();
      }
    }, 1000);

    // Kích hoạt tự động hóa của Nhân viên
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
    // 1. Tự động rót trà của Minh & Topping/Đường/Đá/Siro của Linh
    clearInterval(this.staffTimer);
    this.staffTimer = setInterval(() => {
      if (this.isPaused || this.viewMode !== 'sell') return;

      const activeOrd = this.orders[this.activeOrderIndex];
      if (!activeOrd || this.currentCup.isSealing || this.currentCup.isDelivering) return;

      // Nhân viên 1: Minh - Rót Trà
      if (state.staff.minhTea?.hired && this.currentCup.cup && !this.currentCup.tea) {
        if (state.getTotalQty(activeOrd.recipe.tea) > 0) {
          this.currentCup.tea = activeOrd.recipe.tea;
          audio.pour();
          this.checkAndTriggerAutoSeal();
          this.render();
          return;
        }
      }

      // Nhân viên 2: Linh - Đa Nhiệm (Topping + Đường + Đá + Siro)
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
    }, 1100);

    // 2. Tự động xử lý Đơn App của Vy (Nhân viên 3 - Online/Ship)
    clearInterval(this.vyTimer);
    const vySpeed = state.staff.vyOnline?.hired 
      ? Math.max(1000, 2200 - (state.staff.vyOnline.level - 1) * 300) 
      : 3000;

    this.vyTimer = setInterval(() => {
      if (this.isPaused || this.viewMode !== 'sell') return;
      if (!state.staff.vyOnline?.hired) return;

      // Tìm đơn App đang chờ
      const appOrdIdx = this.orders.findIndex((o, idx) => o.type === 'online' && idx !== this.activeOrderIndex);
      if (appOrdIdx !== -1) {
        const appOrd = this.orders[appOrdIdx];
        // Vy tự chuẩn bị và giao luôn đơn app này
        this.executeVyOnlineDelivery(appOrd, appOrdIdx);
      }
    }, vySpeed);
  }

  executeVyOnlineDelivery(ord, ordIdx) {
    // Trừ kho nguyên liệu
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
    const tip = Math.round(fullPrice * 0.15);
    const totalEarned = fullPrice + tip;

    state.money += totalEarned;
    state.today.revenueApp += totalEarned;
    state.stats.totalCupsSold += 1;
    state.addExp(20);

    this.dailyReport.served += 1;
    this.dailyReport.revenue += totalEarned;
    this.dailyReport.tips += tip;

    audio.serveSuccess();
    this.showToast(`🛵 Vy đã đóng gói & giao ${ord.id} (${ord.name}) +${totalEarned.toLocaleString()}đ!`);

    this.orders.splice(ordIdx, 1);
    this.ensureOrderBalance();
    this.render();
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

    const hasSyrup = Math.random() > 0.5;
    const randSyrup = hasSyrup ? SYRUPS[Math.floor(Math.random() * SYRUPS.length)] : null;

    const numTops = Math.random() > 0.4 ? 2 : 1;
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

  // ================= 4.4. MÀN HÌNH BÁN HÀNG CỐ ĐỊNH & CARD ORDER NGANG =================
  renderSellView() {
    const activeOrd = this.orders[this.activeOrderIndex] || null;

    this.elView.innerHTML = `
      <div class="sell-view-fixed">
        <!-- KHU VỰC ORDER NGANG: TÁCH RÕ KHÁCH TẠI QUÁN & ĐƠN APP -->
        <div class="orders-horizontal-container">
          ${this.renderOrdersLane()}
        </div>

        <!-- MÀN HÌNH PHA CHẾ CỐ ĐỊNH (GAMEPLAY = BẤM, KHÔNG KÉO/SCROLL) -->
        <div class="kitchen-fixed-bar">
          <!-- 1. HÀNG TRÊN: LY M/L & TRÀ/NƯỚC NỀN (9 KHUNG) -->
          <div class="fixed-shelf-top">
            <div class="shelf-label-mini">🥤 LY & 🍵 CỐT TRÀ (9 LOẠI)</div>
            <div class="top-row-flex">
              <!-- CỐ ĐỊNH 2 LY M & L -->
              <div class="cups-fixed-col">
                <button class="cup-fixed-btn ${this.currentCup.cup === 'M' ? 'selected' : ''}" data-pick-cup="M">
                  <span class="cup-qty-badge">${state.getTotalQty('cupM')}</span>
                  <span class="cup-icon-txt">🥤M</span>
                  <small>500ml</small>
                </button>
                <button class="cup-fixed-btn ${this.currentCup.cup === 'L' ? 'selected' : ''}" data-pick-cup="L">
                  <span class="cup-qty-badge">${state.getTotalQty('cupL')}</span>
                  <span class="cup-icon-txt">🥤L</span>
                  <small>700ml</small>
                </button>
              </div>

              <!-- CỐ ĐỊNH 9 KHUNG TRÀ / NƯỚC NỀN (2 DÃY: 5 + 4) -->
              <div class="teas-fixed-grid-9">
                ${TEAS.map((t, idx) => {
                  const isSelected = this.currentCup.tea === t.id;
                  const qty = state.getTotalQty(t.id);
                  return `
                    <button class="tea-slot-btn ${isSelected ? 'selected' : ''}" data-pick-tea="${t.id}" title="${t.name}">
                      <span class="item-qty-tag">${qty}</span>
                      <span class="tea-color-bullet" style="background: ${t.liquid};"></span>
                      <span class="tea-name-lbl">${t.name}</span>
                    </button>
                  `;
                }).join('')}
              </div>
            </div>
          </div>

          <!-- 2. HÀNG GIỮA: LY ĐANG PHA + ĐỘ ĐƯỜNG + ĐỘ ĐÁ -->
          <div class="fixed-shelf-mid">
            <!-- LY ĐANG PHA (SVG RENDER TRỰC QUAN) -->
            <div class="cup-workbench-card ${!this.currentCup.cup ? 'empty' : ''}">
              ${this.currentCup.cup ? `
                <button class="btn-discard-inline" id="btnDiscardCup" title="Đổ ly làm lại">🗑 Đổ</button>
                <div class="workbench-cup-visual">
                  ${this.renderCupSvg()}
                </div>
                <div class="workbench-cup-tag">Ly ${this.currentCup.cup}</div>
              ` : `
                <div class="workbench-empty-guide">
                  <span>👆</span>
                  <b>Chọn Ly M hoặc L</b>
                </div>
              `}
            </div>

            <!-- NÚT LỰA CHỌN CỐ ĐỊNH: ĐƯỜNG & ĐÁ -->
            <div class="sugar-ice-fixed-controls">
              <div class="control-subgroup">
                <div class="subgroup-lbl">🍯 MỨC ĐƯỜNG (CỐ ĐỊNH)</div>
                <div class="pills-fixed-row">
                  ${SUGAR_LEVELS.map(s => `
                    <button class="pill-fixed-btn ${this.currentCup.sugar === s ? 'active' : ''}" data-pick-sugar="${s}">${s}</button>
                  `).join('')}
                </div>
              </div>

              <div class="control-subgroup">
                <div class="subgroup-lbl">🧊 MỨC ĐÁ (CỐ ĐỊNH)</div>
                <div class="pills-fixed-row">
                  ${ICE_LEVELS.map(ice => `
                    <button class="pill-fixed-btn ${this.currentCup.ice === ice ? 'active' : ''}" data-pick-ice="${ice}">${ice}</button>
                  `).join('')}
                </div>
              </div>

              <!-- HINT HƯỚNG DẪN TRẠNG THÁI -->
              <div class="workbench-hint-bar ${this.getCupMismatchHintClass(activeOrd)}">
                ${this.getCupMismatchHint(activeOrd)}
              </div>
            </div>
          </div>

          <!-- 3. HÀNG TOPPING: CỐ ĐỊNH 15 KHUNG (3 HÀNG X 5 CỘT) -->
          <div class="fixed-shelf-toppings">
            <div class="shelf-label-mini">🧋 TOPPING (15 KHUNG CỐ ĐỊNH)</div>
            <div class="toppings-fixed-grid-15">
              ${TOPPINGS.map((tp, idx) => {
                const inCup = this.currentCup.toppings.includes(tp.id);
                const qty = state.getTotalQty(tp.id);
                return `
                  <button class="topping-slot-btn ${inCup ? 'in-cup' : ''}" data-pick-topping="${tp.id}">
                    <span class="item-qty-tag">${qty}</span>
                    <span class="topping-icon-ico">${tp.icon}</span>
                    <span class="topping-name-lbl">${tp.name}</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <!-- 4. HÀNG SIRO: CỐ ĐỊNH 9 KHUNG (2 HÀNG: 5 + 4) -->
          <div class="fixed-shelf-syrups">
            <div class="shelf-label-mini">🍓 SIRO TRÁI CÂY (9 KHUNG CỐ ĐỊNH)</div>
            <div class="syrups-fixed-grid-9">
              ${SYRUPS.map((s, idx) => {
                const inCup = this.currentCup.syrup === s.id;
                const qty = state.getTotalQty(s.id);
                return `
                  <button class="syrup-slot-btn ${inCup ? 'in-cup' : ''}" data-pick-syrup="${s.id}">
                    <span class="item-qty-tag">${qty}</span>
                    <span class="syrup-icon-ico">${s.icon}</span>
                    <span class="syrup-name-lbl">${s.name}</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <!-- 5. MÁY ĐÓNG NẮP TỰ ĐỘNG CỐ ĐỊNH -->
          <div class="machine-sealer-fixed-bar ${this.currentCup.isSealing ? 'sealing' : ''}">
            <span class="machine-icon">🤖</span>
            <div class="machine-txt-col">
              <b>${this.currentCup.isSealing ? 'MÁY ĐANG TỰ ĐỘNG DẬP NẮP...' : 'MÁY ĐÓNG NẮP TỰ ĐỘNG'}</b>
              <small>${this.currentCup.isSealing ? 'Chờ dập nắp và giao ngay' : 'Tự động dập nắp & giao khi đủ 100% nguyên liệu'}</small>
            </div>
            ${this.isOrderMatched(activeOrd) ? `
              <button class="btn-fast-seal" id="btnManualSealServe">✨ GIAO NGAY</button>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    this.attachSellEvents();
  }

  // ================= 4.5. KHU VỰC ORDER: DẠNG CARD KHUNG NGANG DÀI =================
  renderOrdersLane() {
    if (this.orders.length === 0) {
      return '<div class="no-orders-banner">Đang chờ khách gọi món mới... 🐢</div>';
    }

    const counterOrders = this.orders.map((o, idx) => ({ ord: o, idx })).filter(item => item.ord.type === 'counter');
    const onlineOrders = this.orders.map((o, idx) => ({ ord: o, idx })).filter(item => item.ord.type === 'online');

    const renderCard = (item) => {
      const { ord, idx } = item;
      const isSelected = idx === this.activeOrderIndex;

      // Kiểm tra checklist
      const cupDone = this.currentCup.cup === ord.recipe.cup;
      const teaDone = this.currentCup.tea === ord.recipe.tea;
      const sugarDone = this.currentCup.sugar === ord.recipe.sugar;
      const iceDone = this.currentCup.ice === ord.recipe.ice;
      const syrupDone = ord.recipe.syrup ? (this.currentCup.syrup === ord.recipe.syrup) : !this.currentCup.syrup;
      const topsDone = ord.recipe.toppings.every(tid => this.currentCup.toppings.includes(tid));

      // Tính % hoàn thành
      let totalSteps = 4 + (ord.recipe.syrup ? 1 : 0) + ord.recipe.toppings.length;
      let finishedSteps = (cupDone ? 1 : 0) + (teaDone ? 1 : 0) + (sugarDone ? 1 : 0) + (iceDone ? 1 : 0) +
                          (syrupDone ? 1 : 0) + ord.recipe.toppings.filter(tid => this.currentCup.toppings.includes(tid)).length;
      let percent = Math.min(100, Math.round((finishedSteps / totalSteps) * 100));

      const isApp = ord.type === 'online';

      return `
        <div class="order-card-horizontal ${isSelected ? 'active' : ''} ${isApp ? 'app-type' : 'counter-type'}" data-order-idx="${idx}">
          <div class="order-card-h-left">
            <span class="customer-avatar-ico">${isApp ? '🛵' : '👩'}</span>
            <span class="drink-mini-icon">🧋</span>
          </div>

          <div class="order-card-h-main">
            <!-- HÀNG 1: BADGE + TÊN KHÁCH + TÊN MÓN -->
            <div class="card-h-row1">
              ${isApp 
                ? `<span class="badge-app-blue">Đơn app ${ord.id}</span>` 
                : `<span class="badge-counter-warm">Quầy ${ord.id}</span>`
              }
              <b class="customer-name-bold">${ord.name}:</b>
              <span class="order-drink-desc">1 ly ${ord.recipe.teaName} ${ord.recipe.syrupName ? `+ ${ord.recipe.syrupName}` : ''} (Ly ${ord.recipe.cup})</span>
            </div>

            <!-- HÀNG 2: CHECKLIST TRẠNG THÁI 🔴 CHƯA LÀM -> 🟢✓ ĐÃ LÀM -->
            <div class="card-h-reqs-row">
              <span class="req-chip ${cupDone ? 'done' : 'pending'}">${cupDone ? '🟢✓' : '🔴'} Ly ${ord.recipe.cup}</span>
              <span class="req-chip ${teaDone ? 'done' : 'pending'}">${teaDone ? '🟢✓' : '🔴'} ${ord.recipe.teaName}</span>
              ${ord.recipe.syrupName ? `<span class="req-chip ${syrupDone ? 'done' : 'pending'}">${syrupDone ? '🟢✓' : '🔴'} ${ord.recipe.syrupName}</span>` : ''}
              <span class="req-chip ${sugarDone ? 'done' : 'pending'}">${sugarDone ? '🟢✓' : '🔴'} ${ord.recipe.sugar}</span>
              <span class="req-chip ${iceDone ? 'done' : 'pending'}">${iceDone ? '🟢✓' : '🔴'} ${ord.recipe.ice}</span>
              ${ord.recipe.toppings.map(tid => {
                const tDone = this.currentCup.toppings.includes(tid);
                const tObj = TOPPINGS.find(t => t.id === tid);
                return `<span class="req-chip ${tDone ? 'done' : 'pending'}">${tDone ? '🟢✓' : '🔴'} ${tObj?.name || 'Topping'}</span>`;
              }).join('')}
              <span class="percent-chip ${percent === 100 ? 'full' : ''}">${percent}%</span>
            </div>

            <!-- THANH THỜI GIAN/KIÊN NHẪN SÁT ĐÁY THEO CHIỀU NGANG -->
            <div class="order-patience-horizontal-bar">
              <i style="width: ${ord.patience}%; background: ${ord.patience > 35 ? '#38A169' : (ord.patience > 20 ? '#DD6B20' : '#E53E3E')};"></i>
            </div>
          </div>
        </div>
      `;
    };

    return `
      <!-- NHÓM 1: KHÁCH TẠI QUÁN -->
      <div class="order-group-section">
        <div class="order-group-header">👥 KHÁCH TẠI QUÁN (${counterOrders.length})</div>
        <div class="order-cards-column">
          ${counterOrders.length > 0 ? counterOrders.map(renderCard).join('') : '<div class="empty-lane-hint">Không có khách tại quầy</div>'}
        </div>
      </div>

      <!-- NHÓM 2: ĐƠN APP / SHIP -->
      <div class="order-group-section">
        <div class="order-group-header app">🚚 ĐƠN APP / SHIP (${onlineOrders.length})</div>
        <div class="order-cards-column">
          ${onlineOrders.length > 0 ? onlineOrders.map(renderCard).join('') : '<div class="empty-lane-hint">Không có đơn ship</div>'}
        </div>
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

    const hasIce = this.currentCup.ice && this.currentCup.ice !== 'Không đá';
    const hasTops = this.currentCup.toppings.length > 0;

    if (isL) {
      return `
        <svg viewBox="0 0 60 76" width="46" height="60">
          <path d="M10 10 L15 70 Q16 73 20 73 L40 73 Q44 73 45 70 L50 10 Z" fill="url(#gCup)" stroke="#7A4222" stroke-width="1.8"/>
          ${this.currentCup.tea || this.currentCup.syrup ? `
            <path d="M12 16 L15 70 Q16 72 20 72 L40 72 Q44 72 45 70 L48 16 Z" fill="${liquidColor}"/>
          ` : ''}
          ${hasIce ? `
            <rect x="20" y="24" width="9" height="8" rx="2" fill="#FFF" fill-opacity="0.75"/>
            <rect x="32" y="30" width="9" height="8" rx="2" fill="#FFF" fill-opacity="0.75"/>
          ` : ''}
          ${hasTops ? `
            <circle cx="22" cy="67" r="3" fill="#3D2214"/>
            <circle cx="30" cy="68" r="3" fill="#3D2214"/>
            <circle cx="38" cy="67" r="3" fill="#3D2214"/>
          ` : ''}
          <ellipse cx="30" cy="10" rx="20" ry="3.5" fill="none" stroke="#7A4222" stroke-width="1.8"/>
        </svg>
      `;
    }

    // Ly M
    return `
      <svg viewBox="0 0 60 66" width="44" height="52">
        <path d="M11 10 L16 60 Q17 63 21 63 L39 63 Q43 63 44 60 L49 10 Z" fill="url(#gCup)" stroke="#7A4222" stroke-width="1.8"/>
        ${this.currentCup.tea || this.currentCup.syrup ? `
          <path d="M13 16 L16 60 Q17 62 21 62 L39 62 Q43 62 44 60 L47 16 Z" fill="${liquidColor}"/>
        ` : ''}
        ${hasIce ? `
          <rect x="20" y="22" width="8" height="7" rx="2" fill="#FFF" fill-opacity="0.75"/>
          <rect x="32" y="26" width="8" height="7" rx="2" fill="#FFF" fill-opacity="0.75"/>
        ` : ''}
        ${hasTops ? `
          <circle cx="23" cy="57" r="2.8" fill="#3D2214"/>
          <circle cx="30" cy="58" r="2.8" fill="#3D2214"/>
          <circle cx="37" cy="57" r="2.8" fill="#3D2214"/>
        ` : ''}
        <ellipse cx="30" cy="10" rx="19" ry="3.5" fill="none" stroke="#7A4222" stroke-width="1.8"/>
      </svg>
    `;
  }

  attachSellEvents() {
    // 1. Chọn Order
    this.elView.querySelectorAll('[data-order-idx]').forEach(card => {
      card.onclick = () => {
        audio.click();
        this.activeOrderIndex = parseInt(card.dataset.orderIdx, 10);
        this.render();
      };
    });

    // 2. Chọn Ly M hoặc L
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

    // 3. Chọn Cốt Trà / Nước nền
    this.elView.querySelectorAll('[data-pick-tea]').forEach(btn => {
      btn.onclick = () => {
        if (!this.currentCup.cup) {
          audio.trash();
          this.showToast('Hãy lấy ly trước khi rót trà!');
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

    // 4. Chọn Đường
    this.elView.querySelectorAll('[data-pick-sugar]').forEach(btn => {
      btn.onclick = () => {
        audio.click();
        this.currentCup.sugar = btn.dataset.pickSugar;
        this.checkAndTriggerAutoSeal();
        this.render();
      };
    });

    // 5. Chọn Đá
    this.elView.querySelectorAll('[data-pick-ice]').forEach(btn => {
      btn.onclick = () => {
        audio.addIce();
        this.currentCup.ice = btn.dataset.pickIce;
        this.checkAndTriggerAutoSeal();
        this.render();
      };
    });

    // 6. Chọn Siro (Khu Siro)
    this.elView.querySelectorAll('[data-pick-syrup]').forEach(btn => {
      btn.onclick = () => {
        if (!this.currentCup.cup) {
          audio.trash();
          this.showToast('Hãy lấy ly trước khi bơm siro!');
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

    // 7. Chọn Topping
    this.elView.querySelectorAll('[data-pick-topping]').forEach(btn => {
      btn.onclick = () => {
        if (!this.currentCup.cup) {
          audio.trash();
          this.showToast('Hãy lấy ly trước khi thêm topping!');
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

    // 8. Đổ Ly (Hộp thoại xác nhận)
    const btnTrash = document.getElementById('btnDiscardCup');
    if (btnTrash) {
      btnTrash.onclick = () => {
        audio.click();
        this.openModal(`
          <h2>🗑 ĐỔ LY NÀY?</h2>
          <p style="color: #7C5B49; margin: 8px 0 16px;">
            Bạn có chắc muốn đổ ly đang pha dở này không? Các nguyên liệu đã dùng sẽ bị hao hụt!
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

    // 9. Nút Giao Ngay
    const btnManualSeal = document.getElementById('btnManualSealServe');
    if (btnManualSeal) {
      btnManualSeal.onclick = () => {
        const ord = this.orders[this.activeOrderIndex];
        if (ord && this.isOrderMatched(ord)) {
          this.checkAndTriggerAutoSeal(true);
        }
      };
    }
  }

  // ================= 4.6. KIỂM TRA CÔNG THỨC & TỰ ĐỘNG DẬP NẮP GIAO =================
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

  getCupMismatchHint(ord) {
    if (!ord || !this.currentCup.cup) return '👇 Bấm chọn Ly M hoặc Ly L';
    if (this.currentCup.isSealing) return '🤖 Máy đang tự động dập nắp...';
    if (this.currentCup.isDelivering) return '🛵 Đang giao cho khách...';

    if (this.currentCup.cup !== ord.recipe.cup) return `⚠️ Cần Ly ${ord.recipe.cup} (Bấm Đổ ly)`;
    if (!this.currentCup.tea) return '👇 Chọn loại cốt trà';
    if (this.currentCup.tea !== ord.recipe.tea) return '⚠️ Nhầm cốt trà (Bấm Đổ ly)';
    if (!this.currentCup.sugar) return '👇 Chọn mức đường';
    if (!this.currentCup.ice) return '👇 Chọn mức đá';
    if (ord.recipe.syrup && this.currentCup.syrup !== ord.recipe.syrup) return `👇 Bơm ${ord.recipe.syrupName}`;
    const missingTops = ord.recipe.toppings.filter(tid => !this.currentCup.toppings.includes(tid));
    if (missingTops.length > 0) {
      const tObj = TOPPINGS.find(t => t.id === missingTops[0]);
      return `👇 Thêm ${tObj?.name || 'Topping'}`;
    }
    return '✨ Đã đủ công thức! Máy tự dập nắp';
  }

  getCupMismatchHintClass(ord) {
    if (!ord || !this.currentCup.cup) return '';
    if (this.currentCup.cup !== ord.recipe.cup || (this.currentCup.tea && this.currentCup.tea !== ord.recipe.tea)) {
      return 'warn';
    }
    return '';
  }

  checkAndTriggerAutoSeal(isManual = false) {
    const ord = this.orders[this.activeOrderIndex];
    if (!ord || this.currentCup.isSealing || this.currentCup.isDelivering) return;

    if (this.isOrderMatched(ord)) {
      this.currentCup.isSealing = true;
      audio.autoSeal();
      this.showToast('✨ Đủ 100%! Máy tự động dập nắp...');
      this.render();

      const duration = state.upgrades.fastSealer ? 240 : 420;

      setTimeout(() => {
        this.currentCup.isSealing = false;
        this.currentCup.isDelivering = true;
        this.executeDelivery(ord);
      }, duration);
    }
  }

  executeDelivery(ord) {
    audio.serveSuccess();

    // Tiêu hao từ lô hàng
    state.consumeItem('cup' + this.currentCup.cup);
    state.consumeItem(this.currentCup.tea);
    if (this.currentCup.syrup) state.consumeItem(this.currentCup.syrup);
    this.currentCup.toppings.forEach(tid => state.consumeItem(tid));

    // Tính tiền
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
      this.showToast(`+${totalEarned.toLocaleString()}đ 🛵 Đã giao Đơn app ${ord.id} cho Shipper!`);
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

  // ================= 4.7. KẾT THÚC NGÀY BÁN HÀNG =================
  endSellPhase() {
    clearInterval(this.sellTimer);
    clearInterval(this.staffTimer);
    clearInterval(this.vyTimer);
    audio.bell();

    // 1. Kiểm tra và loại bỏ nguyên liệu hết hạn tối nay -> tính vào hao hụt
    const expiredCount = state.processEndOfDayExpiry();

    // 2. Chi phí mặt bằng & điện nước
    const rentCost = state.today.costRent;
    const utilitiesCost = state.today.costUtilities;

    // 3. Tính lương nhân viên
    let staffSalaries = 0;
    if (state.staff.minhTea?.hired) staffSalaries += STAFF_LIST[0].baseSalary + (state.staff.minhTea.level - 1) * 2000;
    if (state.staff.linhHelper?.hired) staffSalaries += STAFF_LIST[1].baseSalary + (state.staff.linhHelper.level - 1) * 2000;
    if (state.staff.vyOnline?.hired) staffSalaries += STAFF_LIST[2].baseSalary + (state.staff.vyOnline.level - 1) * 2000;
    state.today.costSalaries = staffSalaries;

    // Tổng chi & Hao hụt
    const totalRevenue = this.dailyReport.revenue;
    const totalExpenses = rentCost + utilitiesCost + staffSalaries;
    const totalWaste = state.today.wasteExpiredTea + state.today.wasteExpiredTopping + state.today.wasteExpiredSyrup + state.today.wasteDiscardedCups;
    const netProfit = totalRevenue - totalExpenses - totalWaste;

    state.money -= totalExpenses;
    state.stats.totalProfitAllTime += netProfit;

    // Lưu vào lịch sử 10 ngày
    state.history10Days.push({
      day: `N${state.day}`,
      cups: this.dailyReport.served,
      profit: netProfit
    });
    if (state.history10Days.length > 10) state.history10Days.shift();

    // Đánh giá mới
    const comments = [
      "Trà sữa ngọt béo vừa vặn, giao nhanh như chớp!",
      "Rùa pha chuẩn vị, topping đầy ắp mềm dẻo!",
      "Máy dập nắp cực kỳ hiện đại, không đổ giọt nào.",
      "Đơn app giao siêu nhanh, đúng 100% yêu cầu!"
    ];
    state.reviews.unshift({
      name: CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)],
      stars: 5,
      comment: comments[Math.floor(Math.random() * comments.length)]
    });
    if (state.reviews.length > 8) state.reviews.pop();

    this.openModal(`
      <h2>🌙 ĐÓNG CỬA NGÀY ${state.day}</h2>
      <p style="color: #7C5B49; margin-top: 0; font-size: 13px;">Một ngày kinh doanh tràn ngập niềm vui!</p>

      <div class="day-end-summary-box">
        <div class="summary-line"><span>Ly đã phục vụ:</span> <b>${this.dailyReport.served} ly</b></div>
        <div class="summary-line"><span>Doanh thu hôm nay:</span> <b class="pos">+${totalRevenue.toLocaleString()}đ</b></div>
        
        <div class="summary-subtitle">CHI PHÍ VẬN HÀNH:</div>
        <div class="summary-line sub"><span>Mặt bằng:</span> <b class="neg">-${rentCost.toLocaleString()}đ</b></div>
        <div class="summary-line sub"><span>Điện nước:</span> <b class="neg">-${utilitiesCost.toLocaleString()}đ</b></div>
        ${staffSalaries > 0 ? `<div class="summary-line sub"><span>Lương nhân viên:</span> <b class="neg">-${staffSalaries.toLocaleString()}đ</b></div>` : ''}

        ${totalWaste > 0 ? `
          <div class="summary-subtitle">HAO HỤT:</div>
          <div class="summary-line sub"><span>Hết hạn & hỏng:</span> <b class="neg">-${totalWaste.toLocaleString()}đ (${expiredCount} phần)</b></div>
        ` : ''}

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
      // Reset tracker cho ngày mới
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
      this.viewMode = 'prep';
      this.render();
    };

    state.save();
    this.renderTopBar();
  }
}

// Khởi chạy game khi DOM sẵn sàng
window.addEventListener('DOMContentLoaded', () => {
  window.gameApp = new GameApp();
});
