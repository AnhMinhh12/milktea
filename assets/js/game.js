/**
 * 🧋 TIỆM TRÀ SỮA CỦA RÙA (Boba Shop Simulator)
 * Game mobile 2D casual mô phỏng quản lý & pha chế trà sữa
 * Phiên bản hoàn thiện theo đặc tả chi tiết 66 mục
 */

// ================= 1. HỆ THỐNG ÂM THANH (WEB AUDIO API SYNTHESIZER) =================
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

  click() { this.playBeep(650, 'sine', 0.05, 0.1); }
  pour() { this.playBeep(340, 'triangle', 0.16, 0.18); }
  addIce() {
    this.playBeep(1200, 'sine', 0.05, 0.12);
    setTimeout(() => this.playBeep(1500, 'sine', 0.04, 0.1), 35);
  }
  addTopping() { this.playBeep(260, 'sine', 0.1, 0.22); }
  addSyrup() { this.playBeep(520, 'sine', 0.12, 0.2); }
  autoSeal() {
    this.playBeep(480, 'sine', 0.06, 0.2);
    setTimeout(() => this.playBeep(880, 'triangle', 0.12, 0.25), 50);
  }
  serveSuccess() {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C E G C
    notes.forEach((f, idx) => {
      setTimeout(() => this.playBeep(f, 'sine', 0.14, 0.2), idx * 60);
    });
  }
  trash() {
    this.playBeep(200, 'sawtooth', 0.15, 0.18);
    setTimeout(() => this.playBeep(140, 'sawtooth', 0.2, 0.2), 100);
  }
  bell() {
    this.playBeep(880, 'sine', 0.35, 0.2);
    setTimeout(() => this.playBeep(1320, 'sine', 0.5, 0.15), 90);
  }
}

const audio = new SoundEngine();

// ================= 2. DANH MỤC NGUYÊN LIỆU & CÔNG THỨC (THEO ĐẶC TẢ) =================
const CUPS = [
  { id: 'M', name: 'Ly M', ml: '500ml', cost: 500, priceBonus: 0 },
  { id: 'L', name: 'Ly L', ml: '700ml', cost: 800, priceBonus: 8000 }
];

const TEAS = [
  { id: 'oolong', name: 'Ô long', icon: '🪵', liquid: '#C48850', cost: 3000, price: 20000 },
  { id: 'black', name: 'Trà đen', icon: '🍂', liquid: '#9C441E', cost: 3000, price: 20000 },
  { id: 'green', name: 'Trà xanh', icon: '🌼', liquid: '#DCC060', cost: 3000, price: 20000 },
  { id: 'jasmine', name: 'Trà nhài', icon: '🌸', liquid: '#EAD68C', cost: 3500, price: 22000 },
  { id: 'milk', name: 'Sữa tươi', icon: '🥛', liquid: '#F8EDE1', cost: 3000, price: 20000 },
  { id: 'brownSugar', name: 'Đường đen', icon: '🧋', liquid: '#5A341E', cost: 4000, price: 25000 }
];

const SUGAR_LEVELS = ['0%', '30%', '50%', '70%', '100%'];
const ICE_LEVELS = ['Không đá', 'Ít đá', 'Bình thường', 'Nhiều đá'];

const SYRUPS = [
  { id: 'peach', name: 'Siro Đào', icon: '🍑', color: '#FFB07C', cost: 2000, price: 5000 },
  { id: 'strawberry', name: 'Siro Dâu', icon: '🍓', color: '#FF6B8B', cost: 2000, price: 5000 },
  { id: 'mango', name: 'Siro Xoài', icon: '🥭', color: '#F6AD55', cost: 2000, price: 5000 },
  { id: 'grape', name: 'Siro Nho', icon: '🍇', color: '#9F7AEA', cost: 2000, price: 5000 },
  { id: 'orange', name: 'Siro Cam', icon: '🍊', color: '#ED8936', cost: 2000, price: 5000 },
  { id: 'watermelon', name: 'Siro Dưa Hấu', icon: '🍉', color: '#FC8181', cost: 2000, price: 5000 }
];

const TOPPINGS = [
  { id: 'tapioca', name: 'Trân châu đen', icon: '🟤', cost: 2000, price: 5000 },
  { id: 'whitePearl', name: 'Trân châu trắng', icon: '⚪', cost: 2500, price: 6000 },
  { id: 'pudding', name: 'Pudding trứng', icon: '🍮', cost: 3000, price: 7000 },
  { id: 'cheeseJelly', name: 'Thạch phô mai', icon: '🟡', cost: 3000, price: 7000 },
  { id: 'coconut', name: 'Thạch dừa', icon: '🥥', cost: 2000, price: 5000 },
  { id: 'peachSlice', name: 'Đào miếng', icon: '🍑', cost: 3000, price: 7000 }
];

const FOAMS = [
  { id: 'cheeseFoam', name: 'Cheese foam', icon: '🧀', cost: 3500, price: 8000 },
  { id: 'milkFoam', name: 'Foam sữa', icon: '🍰', cost: 3000, price: 7000 }
];

// Khách hàng & Nhân viên
const CUSTOMER_NAMES = [
  'Chị Lan', 'Anh Minh', 'Bé Na', 'Khánh An', 'Minh Thư',
  'Tuấn Anh', 'Cô Hồng', 'Bạn Shipper Hảo', 'Tiktoker Mai'
];

const STAFF_LIST = [
  {
    id: 'minhTea',
    name: 'Minh - Rót Trà',
    avatar: '🍵',
    role: 'Tự động rót trà/sữa theo đơn',
    unlockDay: 1,
    hireCost: 50000,
    salary: 5000,
    interval: 1400
  },
  {
    id: 'linhHelper',
    name: 'Linh - Đa Nhiệm',
    avatar: '🧑‍🍹',
    role: 'Tự thêm Topping + Đường, Đá & Siro',
    unlockDay: 2,
    hireCost: 80000,
    salary: 8000,
    interval: 1200
  },
  {
    id: 'vyOnline',
    name: 'Vy - Đơn Online',
    avatar: '📱',
    role: 'Tự tiếp nhận & ưu tiên đơn app',
    unlockDay: 3,
    hireCost: 120000,
    salary: 12000,
    interval: 1000
  }
];

const UPGRADES_LIST = [
  { id: 'fastSealer', name: 'Máy dập nắp siêu tốc', icon: '⚡', desc: 'Dập nắp tự động nhanh gấp đôi', cost: 150000 },
  { id: 'turtleCharm', name: 'Bùa Rùa May Mắn', icon: '🐢', desc: 'Tăng 25% tiền Tip khách thưởng', cost: 200000 },
  { id: 'coolerAir', name: 'Điều hòa mát rượi', icon: '❄️', desc: 'Khách đứng chờ kiên nhẫn hơn 35%', cost: 250000 },
  { id: 'lofiMusic', name: 'Loa Lofi Chill', icon: '📻', desc: 'Khách vui vẻ đánh giá 5 sao dễ hơn', cost: 180000 }
];

// ================= 3. TRẠNG THÁI GAME & LOCAL STORAGE =================
class GameState {
  constructor() {
    this.shopName = 'Tiệm Trà Sữa Của Rùa';
    this.day = 1;
    this.money = 150000;
    this.rating = 5.0;
    this.ratingCount = 5;
    this.level = 1;
    this.exp = 0;
    this.expMax = 100;

    // Kho hàng
    this.inventory = {
      cupM: 40,
      cupL: 30,
      oolong: 30,
      black: 30,
      green: 25,
      jasmine: 20,
      milk: 30,
      brownSugar: 20,
      peach: 20,
      strawberry: 20,
      mango: 15,
      grape: 15,
      orange: 15,
      watermelon: 15,
      tapioca: 40,
      whitePearl: 30,
      pudding: 25,
      cheeseJelly: 20,
      coconut: 25,
      peachSlice: 20,
      cheeseFoam: 15,
      milkFoam: 15
    };

    // Nhân viên
    this.staff = {
      minhTea: { hired: false, level: 1, status: 'waiting' },
      linhHelper: { hired: false, level: 1, status: 'waiting' },
      vyOnline: { hired: false, level: 1, status: 'waiting' }
    };

    // Nâng cấp
    this.upgrades = {};

    // Sổ sách & review
    this.history = [];
    this.reviews = [
      { name: "Chị Lan", stars: 5, comment: "Trà sữa đậm vị, topping đầy ắp, Rùa cưng xỉu!" },
      { name: "Anh Nam", stars: 5, comment: "Pha nhanh, máy dập nắp hiện đại cực kỳ." }
    ];

    this.load();
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
        inventory: this.inventory,
        staff: this.staff,
        upgrades: this.upgrades,
        history: this.history,
        reviews: this.reviews
      };
      localStorage.setItem('tiemTraSuaRua_save', JSON.stringify(data));
    } catch (e) {
      console.error("Lỗi lưu game", e);
    }
  }

  load() {
    try {
      const str = localStorage.getItem('tiemTraSuaRua_save');
      if (str) {
        const obj = JSON.parse(str);
        Object.assign(this, obj);
      }
      // Khởi tạo các key thiếu
      if (!this.staff) {
        this.staff = {
          minhTea: { hired: false, level: 1, status: 'waiting' },
          linhHelper: { hired: false, level: 1, status: 'waiting' },
          vyOnline: { hired: false, level: 1, status: 'waiting' }
        };
      }
    } catch (e) {
      console.error("Lỗi nạp game", e);
    }
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

// ================= 4. GAME CONTROLLER & LOGIC BÁN HÀNG =================
class GameApp {
  constructor() {
    this.viewMode = 'prep'; // 'prep' hoặc 'sell'
    this.activeTab = 'restock'; // 'restock' | 'staff' | 'upgrades' | 'ledger'
    this.isPaused = false;

    // Giờ và ca bán
    this.sellTimer = null;
    this.staffTimer = null;
    this.gameSeconds = 0; // Đếm giờ trong ngày (08:00 - 22:00)
    this.maxDaySeconds = 75; // 75 giây thực = 1 ngày làm việc

    // Danh sách orders đang chờ
    this.orders = [];
    this.activeOrderIndex = 0;
    this.orderCounterId = 100;

    // Ly đang pha trên bàn gỗ
    this.currentCup = {
      cup: null,      // 'M' hoặc 'L'
      tea: null,      // tea id
      syrup: null,    // syrup id
      sugar: null,    // '0%', '30%', '50%', '70%', '100%'
      ice: null,      // 'Không đá', 'Ít đá', 'Bình thường', 'Nhiều đá'
      toppings: [],   // mảng topping ids
      foam: null,     // foam id
      isSealing: false,
      isDelivering: false
    };

    // Báo cáo ca bán
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

    // Đồng hồ giờ trong ngày (08:00 -> 22:00)
    if (this.viewMode === 'sell') {
      const startHour = 8;
      const progress = this.gameSeconds / this.maxDaySeconds;
      const totalMinutes = Math.floor(progress * 14 * 60); // 14 tiếng làm việc
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
          <!-- Biển hiệu tiệm với chú Rùa -->
          <div class="shop-sign">
            <div class="awning"></div>
            <div class="mascot-turtle">
              <svg viewBox="0 0 80 90" width="100%" height="100%">
                <!-- Mai rùa tròn màu xanh -->
                <ellipse cx="40" cy="54" rx="27" ry="24" fill="#529B2B" stroke="#2F6614" stroke-width="3"/>
                <ellipse cx="40" cy="52" rx="20" ry="17" fill="#68B936" stroke="#2F6614" stroke-width="1.5"/>
                <!-- Đầu rùa -->
                <circle cx="40" cy="30" r="14" fill="#A0D864" stroke="#2F6614" stroke-width="2.5"/>
                <!-- Mắt rùa to tròn long lanh -->
                <circle cx="34" cy="27" r="4.5" fill="#3D2214"/>
                <circle cx="33" cy="25.5" r="1.5" fill="#FFF"/>
                <circle cx="46" cy="27" r="4.5" fill="#3D2214"/>
                <circle cx="45" cy="25.5" r="1.5" fill="#FFF"/>
                <!-- Nụ cười -->
                <path d="M36 34 Q40 38 44 34" fill="none" stroke="#2F6614" stroke-width="2" stroke-linecap="round"/>
                <!-- Má hồng -->
                <circle cx="31" cy="33" r="3" fill="#FFB6C1" opacity="0.8"/>
                <circle cx="49" cy="33" r="3" fill="#FFB6C1" opacity="0.8"/>
                <!-- Chân rùa & Tay ôm ly boba -->
                <circle cx="20" cy="62" r="6" fill="#A0D864" stroke="#2F6614" stroke-width="2"/>
                <circle cx="60" cy="62" r="6" fill="#A0D864" stroke="#2F6614" stroke-width="2"/>
                <!-- Ly trà sữa cầm tay -->
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
          <!-- 4 Tabs Điều Hướng -->
          <div class="tabs-nav">
            <button class="tab-btn ${this.activeTab === 'restock' ? 'active' : ''}" data-tab="restock">📦 Kho</button>
            <button class="tab-btn ${this.activeTab === 'staff' ? 'active' : ''}" data-tab="staff">👥 Nhân Viên</button>
            <button class="tab-btn ${this.activeTab === 'upgrades' ? 'active' : ''}" data-tab="upgrades">✨ Nâng Cấp</button>
            <button class="tab-btn ${this.activeTab === 'ledger' ? 'active' : ''}" data-tab="ledger">📊 Sổ Sách</button>
          </div>

          <!-- Nội dung Tab -->
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

    // Events tab
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

  getTabContentHtml() {
    if (this.activeTab === 'restock') {
      return `
        <h3>Kho Nguyên Liệu <small>Tự động trừ tiền khi mua</small></h3>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <!-- Ly Nhựa M & L -->
          <div style="font-weight: 800; font-size: 11px; color: var(--boba-primary); margin-top: 2px;">🥤 LY NHỰA</div>
          ${CUPS.map(c => `
            <div class="restock-item" style="display: flex; align-items: center; justify-content: space-between; padding: 4px; background: #FFF9F2; border-radius: 6px;">
              <div>
                <b>${c.name} (${c.ml})</b>
                <small style="display: block; font-size: 10px; color: #7C5B49;">Giá: ${c.cost}đ | Tồn: ${state.inventory['cup' + c.id] || 0}</small>
              </div>
              <div class="qty-control">
                <button class="qty-btn" data-act="sub" data-item="cup${c.id}">-</button>
                <span class="qty-val" style="min-width: 24px; text-align: center; font-weight: 800;">${state.inventory['cup' + c.id] || 0}</span>
                <button class="qty-btn plus" data-act="add" data-item="cup${c.id}" data-cost="${c.cost}">+</button>
              </div>
            </div>
          `).join('')}

          <!-- Cốt Trà & Nước Nền -->
          <div style="font-weight: 800; font-size: 11px; color: var(--boba-primary); margin-top: 6px;">🍵 CỐT TRÀ & SỮA</div>
          ${TEAS.map(t => `
            <div class="restock-item" style="display: flex; align-items: center; justify-content: space-between; padding: 4px; background: #FFF9F2; border-radius: 6px;">
              <div>
                <b>${t.icon} ${t.name}</b>
                <small style="display: block; font-size: 10px; color: #7C5B49;">Giá: ${t.cost.toLocaleString()}đ | Tồn: ${state.inventory[t.id] || 0}</small>
              </div>
              <div class="qty-control">
                <button class="qty-btn" data-act="sub" data-item="${t.id}">-</button>
                <span class="qty-val" style="min-width: 24px; text-align: center; font-weight: 800;">${state.inventory[t.id] || 0}</span>
                <button class="qty-btn plus" data-act="add" data-item="${t.id}" data-cost="${t.cost}">+</button>
              </div>
            </div>
          `).join('')}

          <!-- SIRO TRÁI CÂY (Mục 64) -->
          <div style="font-weight: 800; font-size: 11px; color: var(--boba-primary); margin-top: 6px;">🍓 SIRO TRÁI CÂY (KHU SIRO)</div>
          ${SYRUPS.map(s => `
            <div class="restock-item" style="display: flex; align-items: center; justify-content: space-between; padding: 4px; background: #FFF9F2; border-radius: 6px;">
              <div>
                <b>${s.icon} ${s.name}</b>
                <small style="display: block; font-size: 10px; color: #7C5B49;">Giá: ${s.cost.toLocaleString()}đ | Tồn: ${state.inventory[s.id] || 0}</small>
              </div>
              <div class="qty-control">
                <button class="qty-btn" data-act="sub" data-item="${s.id}">-</button>
                <span class="qty-val" style="min-width: 24px; text-align: center; font-weight: 800;">${state.inventory[s.id] || 0}</span>
                <button class="qty-btn plus" data-act="add" data-item="${s.id}" data-cost="${s.cost}">+</button>
              </div>
            </div>
          `).join('')}

          <!-- TOPPINGS -->
          <div style="font-weight: 800; font-size: 11px; color: var(--boba-primary); margin-top: 6px;">🟤 TOPPING & FOAM</div>
          ${TOPPINGS.map(tp => `
            <div class="restock-item" style="display: flex; align-items: center; justify-content: space-between; padding: 4px; background: #FFF9F2; border-radius: 6px;">
              <div>
                <b>${tp.icon} ${tp.name}</b>
                <small style="display: block; font-size: 10px; color: #7C5B49;">Giá: ${tp.cost.toLocaleString()}đ | Tồn: ${state.inventory[tp.id] || 0}</small>
              </div>
              <div class="qty-control">
                <button class="qty-btn" data-act="sub" data-item="${tp.id}">-</button>
                <span class="qty-val" style="min-width: 24px; text-align: center; font-weight: 800;">${state.inventory[tp.id] || 0}</span>
                <button class="qty-btn plus" data-act="add" data-item="${tp.id}" data-cost="${tp.cost}">+</button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    if (this.activeTab === 'staff') {
      return `
        <h3>Đội Ngũ Nhân Viên <small>Tự động hóa pha chế</small></h3>
        <p style="font-size: 11px; color: #7C5B49; margin: 0 0 8px;">Nhân viên tự động làm các công đoạn theo order giúp bạn rảnh tay!</p>
        <div class="staff-list">
          ${STAFF_LIST.map(st => {
            const current = state.staff[st.id] || { hired: false, level: 1, status: 'locked' };
            const isUnlocked = state.day >= st.unlockDay || current.hired;
            return `
              <div class="staff-card ${current.hired ? 'hired' : ''}">
                <div class="staff-avatar">${st.avatar}</div>
                <div class="staff-info">
                  <b>${st.name} ${current.hired ? `<span style="color: #38A169;">(Lv.${current.level})</span>` : ''}</b>
                  <small>${st.role}</small>
                  ${isUnlocked 
                    ? (current.hired 
                        ? `<span class="staff-badge doing">🟢 Đang làm việc (Lương: ${st.salary.toLocaleString()}đ/ca)</span>` 
                        : `<span class="staff-badge waiting">🟡 Sẵn sàng thuê</span>`)
                    : `<span class="staff-badge locked">🔒 Mở khóa ở Ngày ${st.unlockDay}</span>`
                  }
                </div>
                <div>
                  ${isUnlocked 
                    ? (current.hired 
                        ? `<button class="btn-hire owned" style="font-size: 10px;">Đã thuê</button>` 
                        : `<button class="btn-hire" data-hire="${st.id}" data-cost="${st.hireCost}">${st.hireCost.toLocaleString()}đ</button>`)
                    : `<button class="btn-hire owned" disabled>Chưa mở</button>`
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
        <h3>Trang Thiết Bị & Nâng Cấp</h3>
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
                    ? `<button class="btn-hire owned">Đã sở hữu</button>` 
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
        <h3>Sổ Sách & Đánh Giá</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 8px;">
          <div style="background: #FDF4E7; border-radius: 8px; padding: 6px 8px;">
            <small style="color: #7C5B49; font-size: 10.5px;">Đánh giá của khách</small>
            <b style="display: block; font-size: 15px; color: var(--boba-primary);">⭐ ${state.rating.toFixed(1)} / 5.0</b>
          </div>
          <div style="background: #FDF4E7; border-radius: 8px; padding: 6px 8px;">
            <small style="color: #7C5B49; font-size: 10.5px;">Tổng ly đã phục vụ</small>
            <b style="display: block; font-size: 15px; color: var(--turtle-green-d);">🥤 ${(state.history.reduce((a, b) => a + (b.served || 0), 0) + 16)} ly</b>
          </div>
        </div>

        <h4 style="margin: 6px 0 4px; font-size: 12px;">Đánh giá gần đây từ khách hàng</h4>
        <div class="reviews-list">
          ${state.reviews.map(r => `
            <div style="padding: 6px 0; border-bottom: 1px dashed var(--border-color); font-size: 12px;">
              <div style="display: flex; justify-content: space-between;">
                <b>${r.name}</b>
                <span style="color: #ECC94B;">${'⭐'.repeat(r.stars)}</span>
              </div>
              <p style="margin: 2px 0 0; color: #3D2214;">"${r.comment}"</p>
            </div>
          `).join('')}
        </div>
      `;
    }
  }

  attachTabEvents() {
    // Nhập hàng
    this.elView.querySelectorAll('.qty-btn').forEach(btn => {
      btn.onclick = () => {
        const item = btn.dataset.item;
        const act = btn.dataset.act;
        const cost = parseInt(btn.dataset.cost || '0', 10);

        if (act === 'add') {
          const bulkCost = cost * 5;
          if (state.money < bulkCost) {
            audio.trash();
            this.showToast('Không đủ tiền trong ngân quỹ!');
            return;
          }
          state.money -= bulkCost;
          state.inventory[item] = (state.inventory[item] || 0) + 5;
          audio.pour();
        } else if (act === 'sub') {
          if ((state.inventory[item] || 0) >= 5) {
            state.inventory[item] -= 5;
            audio.click();
          }
        }
        state.save();
        this.render();
      };
    });

    // Thuê nhân viên
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
        this.showToast(`Đã thuê nhân viên thành công!`);
        state.save();
        this.render();
      };
    });

    // Mua nâng cấp
    this.elView.querySelectorAll('[data-upgrade]').forEach(btn => {
      btn.onclick = () => {
        const uid = btn.dataset.upgrade;
        const cost = parseInt(btn.dataset.cost, 10);
        if (state.money < cost) {
          audio.trash();
          this.showToast('Không đủ tiền nâng cấp!');
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

  // ================= 4.2. GIAO DIỆN BÁN HÀNG (SELL VIEW) =================
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

    // Sinh 3 đơn hàng ban đầu
    this.generateOrder();
    this.generateOrder();
    this.generateOrder();

    // Vòng lặp đếm giờ và quản lý kiên nhẫn
    clearInterval(this.sellTimer);
    this.sellTimer = setInterval(() => {
      if (this.isPaused) return;

      this.gameSeconds += 1;

      // Giảm độ kiên nhẫn
      const coolerMod = state.upgrades.coolerAir ? 0.9 : 1.35;
      this.orders.forEach(ord => {
        ord.patience = Math.max(0, ord.patience - coolerMod);
      });

      // Kiểm tra khách hết kiên nhẫn bỏ về
      const angryIdx = this.orders.findIndex(ord => ord.patience <= 0);
      if (angryIdx !== -1) {
        audio.trash();
        const angryOrd = this.orders.splice(angryIdx, 1)[0];
        this.dailyReport.mistakes += 1;
        state.rating = Math.max(1.0, state.rating - 0.15);
        this.showToast(`${angryOrd.name} đã tức giận bỏ về vì chờ lâu!`);
        this.generateOrder();
      }

      if (this.gameSeconds >= this.maxDaySeconds) {
        this.endSellPhase();
      } else {
        this.render();
      }
    }, 1000);

    // Vòng lặp hỗ trợ tự động của NHÂN VIÊN
    this.startStaffAutomation();

    this.render();
  }

  startStaffAutomation() {
    clearInterval(this.staffTimer);
    this.staffTimer = setInterval(() => {
      if (this.isPaused || this.viewMode !== 'sell') return;

      const activeOrd = this.orders[this.activeOrderIndex];
      if (!activeOrd || this.currentCup.isSealing || this.currentCup.isDelivering) return;

      // 1. Nhân viên Minh (Rót Trà): Nếu chưa có nước nền
      if (state.staff.minhTea?.hired && this.currentCup.cup && !this.currentCup.tea) {
        if (state.inventory[activeOrd.recipe.tea] > 0) {
          this.currentCup.tea = activeOrd.recipe.tea;
          audio.pour();
          this.checkAndTriggerAutoSeal();
          this.render();
          return;
        }
      }

      // 2. Nhân viên Linh (Đa Nhiệm: Topping, Đường, Đá, Siro)
      if (state.staff.linhHelper?.hired && this.currentCup.cup) {
        // Tự thêm đường
        if (!this.currentCup.sugar) {
          this.currentCup.sugar = activeOrd.recipe.sugar;
          audio.click();
          this.checkAndTriggerAutoSeal();
          this.render();
          return;
        }
        // Tự thêm đá
        if (!this.currentCup.ice) {
          this.currentCup.ice = activeOrd.recipe.ice;
          audio.addIce();
          this.checkAndTriggerAutoSeal();
          this.render();
          return;
        }
        // Tự thêm siro
        if (activeOrd.recipe.syrup && !this.currentCup.syrup) {
          if (state.inventory[activeOrd.recipe.syrup] > 0) {
            this.currentCup.syrup = activeOrd.recipe.syrup;
            audio.addSyrup();
            this.checkAndTriggerAutoSeal();
            this.render();
            return;
          }
        }
        // Tự thêm topping
        for (const tid of activeOrd.recipe.toppings) {
          if (!this.currentCup.toppings.includes(tid)) {
            if (state.inventory[tid] > 0) {
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
  }

  generateOrder() {
    if (this.orders.length >= 3) return;

    this.orderCounterId += 1;
    const isOnline = Math.random() > 0.45;
    const name = CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)];
    const randCup = Math.random() > 0.4 ? 'M' : 'L';
    const randTea = TEAS[Math.floor(Math.random() * TEAS.length)];
    const randSugar = SUGAR_LEVELS[Math.floor(Math.random() * SUGAR_LEVELS.length)];
    const randIce = ICE_LEVELS[Math.floor(Math.random() * ICE_LEVELS.length)];

    // Ngẫu nhiên siro (khoảng 50% đơn có siro trái cây)
    const hasSyrup = Math.random() > 0.5;
    const randSyrup = hasSyrup ? SYRUPS[Math.floor(Math.random() * SYRUPS.length)] : null;

    // Ngẫu nhiên 1 - 2 topping
    const numTops = Math.random() > 0.5 ? 2 : 1;
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
      foam: null,
      isSealing: false,
      isDelivering: false
    };
  }

  renderSellView() {
    const activeOrd = this.orders[this.activeOrderIndex] || null;

    this.elView.innerHTML = `
      <div class="sell-view">
        <!-- HÀNG ORDER: Hiển thị đơn và checklist 🔴/🟢✓ -->
        <div class="orders-lane-container">
          <div class="orders-row">
            ${this.orders.map((ord, idx) => {
              const isSelected = idx === this.activeOrderIndex;
              const cupDone = this.currentCup.cup === ord.recipe.cup;
              const teaDone = this.currentCup.tea === ord.recipe.tea;
              const sugarDone = this.currentCup.sugar === ord.recipe.sugar;
              const iceDone = this.currentCup.ice === ord.recipe.ice;
              const syrupDone = ord.recipe.syrup ? (this.currentCup.syrup === ord.recipe.syrup) : !this.currentCup.syrup;
              const topsDone = ord.recipe.toppings.every(tid => this.currentCup.toppings.includes(tid));

              // Báo thừa nguyên liệu nếu lỡ tay chọn nhầm
              const extraToppings = isSelected ? this.currentCup.toppings.filter(tid => !ord.recipe.toppings.includes(tid)) : [];
              const hasExtraSyrup = isSelected && Boolean(this.currentCup.syrup && this.currentCup.syrup !== ord.recipe.syrup);

              return `
                <div class="order-card ${isSelected ? 'active' : ''}" data-order-idx="${idx}">
                  <div class="order-card-header">
                    <b>${ord.name}</b>
                    <span class="order-type-chip ${ord.type}">
                      ${ord.type === 'online' ? '🚚 App' : '👩 Quầy'} ${ord.id}
                    </span>
                  </div>

                  <div class="order-recipe-title">
                    ${ord.recipe.teaName} ${ord.recipe.syrupName ? `+ ${ord.recipe.syrupName}` : ''}
                  </div>

                  <!-- Checklist thành phần: ĐỎ 🔴 vs XANH 🟢✓ vs CẢNH BÁO THỪA ⚠️ -->
                  <div class="recipe-checklist">
                    <span class="recipe-step-tag ${cupDone ? 'done' : 'pending'}">
                      ${cupDone ? '🟢✓' : '🔴'} Ly ${ord.recipe.cup}
                    </span>
                    <span class="recipe-step-tag ${teaDone ? 'done' : 'pending'}">
                      ${teaDone ? '🟢✓' : '🔴'} ${ord.recipe.teaName}
                    </span>
                    ${ord.recipe.syrupName ? `
                      <span class="recipe-step-tag ${syrupDone ? 'done' : 'pending'}">
                        ${syrupDone ? '🟢✓' : '🔴'} ${ord.recipe.syrupName}
                      </span>
                    ` : ''}
                    <span class="recipe-step-tag ${sugarDone ? 'done' : 'pending'}">
                      ${sugarDone ? '🟢✓' : '🔴'} ${ord.recipe.sugar}
                    </span>
                    <span class="recipe-step-tag ${iceDone ? 'done' : 'pending'}">
                      ${iceDone ? '🟢✓' : '🔴'} ${ord.recipe.ice}
                    </span>
                    ${ord.recipe.toppings.map(tid => {
                      const tDone = this.currentCup.toppings.includes(tid);
                      const tObj = TOPPINGS.find(t => t.id === tid);
                      return `
                        <span class="recipe-step-tag ${tDone ? 'done' : 'pending'}">
                          ${tDone ? '🟢✓' : '🔴'} ${tObj?.name || 'Topping'}
                        </span>
                      `;
                    }).join('')}

                    ${hasExtraSyrup ? `
                      <span class="recipe-step-tag warning" title="Bấm lại chai siro này để bỏ ra">
                        ⚠️ Thừa ${SYRUPS.find(s => s.id === this.currentCup.syrup)?.name || 'Siro'}
                      </span>
                    ` : ''}
                    ${extraToppings.map(tid => {
                      const tObj = TOPPINGS.find(t => t.id === tid);
                      return `
                        <span class="recipe-step-tag warning" title="Bấm lại topping này để bỏ ra">
                          ⚠️ Thừa ${tObj?.name || 'Topping'}
                        </span>
                      `;
                    }).join('')}
                  </div>

                  <div class="order-patience-track">
                    <i style="width: ${ord.patience}%; background: ${ord.patience > 35 ? '#38A169' : '#E53E3E'};"></i>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- BÀN PHA CHẾ CHÍNH (KITCHEN BAR 2 TẦNG CHUẨN) -->
        <div class="kitchen-bar">
          <!-- KỆ TRÊN: QUẦY TRÀ (Chồng ly M/L, Các bình ủ trà, Máy dập nắp) -->
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="section-label-tag">QUẦY TRÀ</span>
            <!-- Báo trạng thái nhân viên đang làm -->
            <div style="font-size: 10px; font-weight: 700; color: #386B1D;">
              ${state.staff.linhHelper?.hired ? '🧑‍🍹 Linh đang hỗ trợ' : (state.staff.minhTea?.hired ? '🍵 Minh đang rót' : 'Tự pha')}
            </div>
          </div>

          <div class="top-shelf-row">
            <!-- 1. Chồng ly M và L -->
            <div class="cup-stacks-wrapper">
              <button class="cup-stack-btn ${this.currentCup.cup === 'M' ? 'selected' : ''}" data-pick-cup="M" title="Lấy ly M">
                <span class="cup-stack-qty">${state.inventory.cupM || 0}</span>
                <svg viewBox="0 0 34 48" width="28" height="40">
                  <path d="M5 12 L9 44 L25 44 L29 12 Z" fill="#FFF" stroke="#7A4222" stroke-width="1.8"/>
                  <line x1="7" y1="20" x2="27" y2="20" stroke="#7A4222" stroke-width="1" stroke-dasharray="2 1"/>
                  <line x1="8" y1="28" x2="26" y2="28" stroke="#7A4222" stroke-width="1" stroke-dasharray="2 1"/>
                  <ellipse cx="17" cy="12" rx="12" ry="3.5" fill="#E8F1F5" stroke="#7A4222" stroke-width="1.8"/>
                  <text x="17" y="24" font-family="'Paytone One', sans-serif" font-size="11" font-weight="bold" fill="#7A4222" text-anchor="middle">M</text>
                </svg>
                <b style="font-size: 10px; color: #5C3826;">Ly M</b>
              </button>

              <button class="cup-stack-btn ${this.currentCup.cup === 'L' ? 'selected' : ''}" data-pick-cup="L" title="Lấy ly L">
                <span class="cup-stack-qty">${state.inventory.cupL || 0}</span>
                <svg viewBox="0 0 34 58" width="28" height="48">
                  <path d="M4 10 L8 54 L26 54 L30 10 Z" fill="#FFF" stroke="#7A4222" stroke-width="1.8"/>
                  <line x1="6" y1="19" x2="28" y2="19" stroke="#7A4222" stroke-width="1" stroke-dasharray="2 1"/>
                  <line x1="7" y1="28" x2="27" y2="28" stroke="#7A4222" stroke-width="1" stroke-dasharray="2 1"/>
                  <line x1="7" y1="37" x2="27" y2="37" stroke="#7A4222" stroke-width="1" stroke-dasharray="2 1"/>
                  <ellipse cx="17" cy="10" rx="13" ry="3.5" fill="#E8F1F5" stroke="#7A4222" stroke-width="1.8"/>
                  <text x="17" y="23" font-family="'Paytone One', sans-serif" font-size="12" font-weight="bold" fill="#7A4222" text-anchor="middle">L</text>
                </svg>
                <b style="font-size: 10px; color: #5C3826;">Ly L</b>
              </button>
            </div>

            <!-- 2. Quầy bình ủ trà & sữa -->
            <div class="tea-dispensers-shelf">
              ${TEAS.map(t => {
                const isSelected = this.currentCup.tea === t.id;
                const qty = state.inventory[t.id] || 0;
                return `
                  <button class="dispenser-jar-btn ${isSelected ? 'selected' : ''}" data-pick-tea="${t.id}" title="${t.name}">
                    <span style="position: absolute; top: 1px; right: 2px; font-size: 8px; font-weight: 800; background: rgba(0,0,0,0.6); color: #fff; padding: 0 3px; border-radius: 4px;">${qty}</span>
                    <div class="jar-body">
                      <div class="jar-liquid" style="background: ${t.liquid};"></div>
                      <span class="jar-name">${t.name}</span>
                    </div>
                    <span style="font-size: 9px; margin-top: 1px;">🚰</span>
                  </button>
                `;
              }).join('')}
            </div>

            <!-- 3. Máy Dập Nắp Tự Động (Tự kích hoạt) -->
            <div class="sealer-machine-box">
              <span style="font-size: 8.5px; font-weight: 800; color: #7C5B49; margin-bottom: 2px;">MÁY DẬP</span>
              <div class="sealer-screen ${this.currentCup.isSealing ? 'sealing' : ''}">
                ${this.currentCup.isSealing ? 'DẬP NẮP' : 'TỰ ĐỘNG'}
              </div>
              <span style="font-size: 18px; margin-top: 2px;">🤖</span>
            </div>
          </div>

          <!-- KỆ DƯỚI: PHA LY (Bàn gỗ, Đá/Đường, Topping Inox) -->
          <span class="section-label-tag">PHA LY</span>
          <div class="lower-counter-grid">
            <!-- Bàn gỗ đặt ly -->
            <div class="wooden-prep-board ${!this.currentCup.cup ? 'need-cup' : ''}">
              ${this.currentCup.cup ? `
                <button class="btn-trash-inline" id="btnDiscardCup" title="Đổ ly này để pha lại">🗑 Đổ</button>
                <div class="cup-on-board">
                  <div class="cup-svg-wrapper size-${this.currentCup.cup.toLowerCase()}">
                    ${this.renderCupSvg()}
                  </div>
                  <div class="cup-size-badge-on-board">Ly ${this.currentCup.cup}</div>
                </div>
                ${this.isOrderMatched(activeOrd) ? `
                  <button class="btn-seal-serve-action" id="btnManualSealServe">✨ ĐÓNG NẮP & GIAO</button>
                ` : `
                  <div class="cup-prep-hint ${this.getCupMismatchHintClass(activeOrd)}">
                    ${this.getCupMismatchHint(activeOrd)}
                  </div>
                `}
              ` : `
                <div class="board-empty-prompt">
                  <span style="font-size: 18px; animation: bounce 0.8s infinite alternate;">👆</span>
                  <b>Lấy ly<br>M hoặc L</b>
                  <small>Bấm vào chồng ly</small>
                </div>
              `}
            </div>

            <!-- Khu Giữa: Mức Đường & Mức Đá -->
            <div class="middle-controls">
              <div class="mini-control-group">
                <small>ĐỘ ĐƯỜNG</small>
                <div class="pill-group mini">
                  ${SUGAR_LEVELS.map(s => `
                    <button class="pill-btn ${this.currentCup.sugar === s ? 'active' : ''}" data-pick-sugar="${s}">${s}</button>
                  `).join('')}
                </div>
              </div>

              <div class="mini-control-group">
                <small>ĐỘ ĐÁ</small>
                <div class="pill-group mini">
                  ${ICE_LEVELS.map(ice => `
                    <button class="pill-btn ${this.currentCup.ice === ice ? 'active' : ''}" data-pick-ice="${ice}">${ice}</button>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- Khu Phải: Khay Topping Inox -->
            <div class="topping-compartment-grid">
              ${TOPPINGS.map(tp => {
                const inCup = this.currentCup.toppings.includes(tp.id);
                const qty = state.inventory[tp.id] || 0;
                return `
                  <button class="topping-tray-slot ${inCup ? 'in-cup' : ''}" data-pick-topping="${tp.id}" title="${tp.name}">
                    <span class="tray-qty">${qty}</span>
                    <span class="tray-icon">${tp.icon}</span>
                    <span class="tray-name">${tp.name}</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <!-- KHU SIRO TRÁI CÂY (Mục 64 - Dãy chai siro có vòi bơm ở phía dưới) -->
          <div class="syrup-rack-section">
            <span class="section-label-tag" style="background: #FFF3E0; border-color: #F6AD55;">KHU SIRO TRÁI CÂY</span>
            <div class="syrup-bottles-row">
              ${SYRUPS.map(s => {
                const inCup = this.currentCup.syrup === s.id;
                const qty = state.inventory[s.id] || 0;
                return `
                  <button class="syrup-bottle-btn ${inCup ? 'in-cup' : ''}" data-pick-syrup="${s.id}" title="${s.name}">
                    <span class="syrup-qty">${qty}</span>
                    <span class="syrup-pump">🧴</span>
                    <span class="syrup-icon">${s.icon}</span>
                    <span class="syrup-name">${s.name}</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Hàng thông báo tự động hóa -->
          <div class="auto-status-bar">
            <span>✨ Đủ nguyên liệu máy sẽ TỰ ĐỘNG DẬP NẮP & GIAO MÓN!</span>
            <span>🐢</span>
          </div>
        </div>
      </div>
    `;

    this.attachSellEvents();
  }

  renderCupSvg() {
    if (!this.currentCup.cup) return '';

    const isL = this.currentCup.cup === 'L';
    let liquidColor = '#FDF5EC'; // màu ly trống

    if (this.currentCup.tea) {
      const teaObj = TEAS.find(t => t.id === this.currentCup.tea);
      if (teaObj) liquidColor = teaObj.liquid;
    }
    // Nếu có siro thì pha màu siro
    if (this.currentCup.syrup) {
      const sObj = SYRUPS.find(s => s.id === this.currentCup.syrup);
      if (sObj) liquidColor = sObj.color;
    }

    const hasIce = this.currentCup.ice && this.currentCup.ice !== 'Không đá';
    const hasTops = this.currentCup.toppings.length > 0;

    if (isL) {
      return `
        <svg viewBox="0 0 70 94" width="100%" height="100%">
          <path d="M11 12 L17 86 Q18 90 23 90 L47 90 Q52 90 53 86 L59 12 Z" fill="url(#gCup)" stroke="#7A4222" stroke-width="2"/>
          ${this.currentCup.tea || this.currentCup.syrup ? `
            <path d="M13 20 L17 86 Q18 88 23 88 L47 88 Q52 88 53 86 L57 20 Z" fill="${liquidColor}"/>
          ` : ''}
          ${hasIce ? `
            <rect x="22" y="26" width="11" height="10" rx="2" fill="#FFF" fill-opacity="0.75" stroke="#FFF" stroke-width="1"/>
            <rect x="37" y="32" width="11" height="10" rx="2" fill="#FFF" fill-opacity="0.75" stroke="#FFF" stroke-width="1"/>
          ` : ''}
          ${hasTops ? `
            <circle cx="25" cy="82" r="3.5" fill="#3D2214"/>
            <circle cx="33" cy="84" r="3.5" fill="#3D2214"/>
            <circle cx="41" cy="83" r="3.5" fill="#3D2214"/>
            <circle cx="28" cy="76" r="3.2" fill="#ECC94B"/>
            <circle cx="38" cy="77" r="3.2" fill="#FFB6C1"/>
          ` : ''}
          <ellipse cx="35" cy="12" rx="24" ry="4" fill="none" stroke="#7A4222" stroke-width="2"/>
        </svg>
      `;
    }

    // Size M
    return `
      <svg viewBox="0 0 70 80" width="100%" height="100%">
        <path d="M13 14 L18 72 Q19 76 24 76 L46 76 Q51 76 52 72 L57 14 Z" fill="url(#gCup)" stroke="#7A4222" stroke-width="2"/>
        ${this.currentCup.tea || this.currentCup.syrup ? `
          <path d="M15 22 L18 72 Q19 74 24 74 L46 74 Q51 74 52 72 L55 22 Z" fill="${liquidColor}"/>
        ` : ''}
        ${hasIce ? `
          <rect x="22" y="28" width="10" height="9" rx="2" fill="#FFF" fill-opacity="0.75" stroke="#FFF" stroke-width="1"/>
          <rect x="36" y="32" width="10" height="9" rx="2" fill="#FFF" fill-opacity="0.75" stroke="#FFF" stroke-width="1"/>
        ` : ''}
        ${hasTops ? `
          <circle cx="26" cy="68" r="3.5" fill="#3D2214"/>
          <circle cx="34" cy="70" r="3.5" fill="#3D2214"/>
          <circle cx="42" cy="69" r="3.5" fill="#3D2214"/>
          <circle cx="29" cy="63" r="3.2" fill="#ECC94B"/>
          <circle cx="39" cy="64" r="3.2" fill="#FFB6C1"/>
        ` : ''}
        <ellipse cx="35" cy="14" rx="22" ry="4" fill="none" stroke="#7A4222" stroke-width="2"/>
      </svg>
    `;
  }

  attachSellEvents() {
    // 1. Chuyển đổi chọn order
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
        const invKey = 'cup' + size;
        if ((state.inventory[invKey] || 0) <= 0) {
          audio.trash();
          this.showToast(`Hết Ly ${size}! Hãy nhập thêm trong kho.`);
          return;
        }
        audio.click();
        this.currentCup.cup = size;
        this.checkAndTriggerAutoSeal();
        this.render();
      };
    });

    // 3. Chọn Cốt Trà / Sữa
    this.elView.querySelectorAll('[data-pick-tea]').forEach(btn => {
      btn.onclick = () => {
        if (!this.currentCup.cup) {
          audio.trash();
          this.showToast('Hãy lấy ly (M hoặc L) trước khi rót trà!');
          return;
        }
        const tid = btn.dataset.pickTea;
        if ((state.inventory[tid] || 0) <= 0) {
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

    // 6. Chọn Siro (Khu Siro) - Hỗ trợ bấm lại để gỡ ra
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
          if ((state.inventory[sid] || 0) <= 0) {
            audio.trash();
            this.showToast('Chai siro này đã hết!');
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
        if ((state.inventory[tid] || 0) <= 0) {
          audio.trash();
          this.showToast('Hết topping này trong kho!');
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

    // 8. Nút Đóng nắp & Giao món chủ động
    const btnSeal = document.getElementById('btnManualSealServe');
    if (btnSeal) {
      btnSeal.onclick = () => {
        const ord = this.orders[this.activeOrderIndex];
        if (ord && this.isOrderMatched(ord)) {
          this.checkAndTriggerAutoSeal(true);
        }
      };
    }

    // 9. Nút Đổ Ly với Hộp thoại xác nhận (Mục 22, 102, 103)
    const btnTrash = document.getElementById('btnDiscardCup');
    if (btnTrash) {
      btnTrash.onclick = () => {
        audio.click();
        this.openModal(`
          <h2>🗑 ĐỔ LY NÀY?</h2>
          <p style="color: #7C5B49; margin: 8px 0 16px;">
            Bạn có chắc muốn đổ ly này không? Các nguyên liệu đã dùng sẽ bị mất!
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
          this.resetCup();
          this.showToast('Đã đổ ly làm lại!');
          this.render();
        };
      };
    }
  }

  // ================= 4.3. KIỂM TRA CÔNG THỨC & TỰ ĐỘNG DẬP NẮP GIAO MÓN =================
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
    if (!ord || !this.currentCup.cup) return '';
    if (this.currentCup.isSealing) return '🤖 Máy đang dập nắp...';
    if (this.currentCup.isDelivering) return '🛵 Đang giao cho khách...';

    if (this.currentCup.syrup && this.currentCup.syrup !== ord.recipe.syrup) {
      const sObj = SYRUPS.find(s => s.id === this.currentCup.syrup);
      return `⚠️ Thừa ${sObj?.name || 'Siro'} (Bấm lại để bỏ)`;
    }
    const extraTops = this.currentCup.toppings.filter(tid => !ord.recipe.toppings.includes(tid));
    if (extraTops.length > 0) {
      const tObj = TOPPINGS.find(t => t.id === extraTops[0]);
      return `⚠️ Thừa ${tObj?.name || 'Topping'} (Bấm lại để bỏ)`;
    }
    if (this.currentCup.cup !== ord.recipe.cup) return `⚠️ Cần Ly ${ord.recipe.cup}`;
    if (!this.currentCup.tea) return '👇 Hãy rót trà';
    if (this.currentCup.tea !== ord.recipe.tea) return '⚠️ Nhầm cốt trà (Bấm Đổ ly)';
    if (!this.currentCup.sugar) return '👇 Chọn độ đường';
    if (!this.currentCup.ice) return '👇 Chọn độ đá';
    if (ord.recipe.syrup && this.currentCup.syrup !== ord.recipe.syrup) return `👇 Bơm ${ord.recipe.syrupName}`;
    const missingTops = ord.recipe.toppings.filter(tid => !this.currentCup.toppings.includes(tid));
    if (missingTops.length > 0) {
      const tObj = TOPPINGS.find(t => t.id === missingTops[0]);
      return `👇 Thêm ${tObj?.name || 'Topping'}`;
    }
    return '✨ Đã đủ công thức!';
  }

  getCupMismatchHintClass(ord) {
    if (!ord || !this.currentCup.cup) return '';
    if (this.currentCup.syrup && this.currentCup.syrup !== ord.recipe.syrup) return 'warn';
    const extraTops = this.currentCup.toppings.filter(tid => !ord.recipe.toppings.includes(tid));
    if (extraTops.length > 0) return 'warn';
    if (this.currentCup.tea && this.currentCup.tea !== ord.recipe.tea) return 'warn';
    return '';
  }

  checkAndTriggerAutoSeal(isManual = false) {
    const ord = this.orders[this.activeOrderIndex];
    if (!ord || this.currentCup.isSealing || this.currentCup.isDelivering) return;

    if (this.isOrderMatched(ord)) {
      // ĐỦ CÔNG THỨC -> KÍCH HOẠT MÁY ĐÓNG NẮP TỰ ĐỘNG
      this.currentCup.isSealing = true;
      audio.autoSeal();
      this.showToast('✨ Đủ nguyên liệu! Máy tự động đóng nắp...');
      this.render();

      const sealDuration = state.upgrades.fastSealer ? 260 : 450;

      setTimeout(() => {
        // TỰ ĐỘNG GIAO MÓN CHO KHÁCH
        this.currentCup.isSealing = false;
        this.currentCup.isDelivering = true;
        this.executeAutoDelivery(ord);
      }, sealDuration);
    }
  }

  executeAutoDelivery(ord) {
    audio.serveSuccess();

    // Trừ kho hàng
    if (state.inventory['cup' + this.currentCup.cup] > 0) state.inventory['cup' + this.currentCup.cup] -= 1;
    if (state.inventory[this.currentCup.tea] > 0) state.inventory[this.currentCup.tea] -= 1;
    if (this.currentCup.syrup && state.inventory[this.currentCup.syrup] > 0) state.inventory[this.currentCup.syrup] -= 1;
    this.currentCup.toppings.forEach(tid => {
      if (state.inventory[tid] > 0) state.inventory[tid] -= 1;
    });

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
    state.addExp(25);

    this.dailyReport.served += 1;
    this.dailyReport.revenue += totalEarned;
    this.dailyReport.tips += tip;

    // Hiệu ứng bay tiền & chén ly
    this.showToast(`+${totalEarned.toLocaleString()}đ 💰 Đã giao khách! Hãy lấy ly mới để làm đơn tiếp.`);

    // Xóa order đã phục vụ và sinh order mới
    this.orders.splice(this.activeOrderIndex, 1);
    this.activeOrderIndex = 0;
    this.resetCup();
    this.generateOrder();
    this.render();
  }

  // ================= 4.4. KẾT THÚC NGÀY BÁN HÀNG =================
  endSellPhase() {
    clearInterval(this.sellTimer);
    clearInterval(this.staffTimer);
    audio.bell();

    const rentCost = 45000;
    // Tính lương nhân viên
    let staffSalaries = 0;
    if (state.staff.minhTea?.hired) staffSalaries += STAFF_LIST[0].salary;
    if (state.staff.linhHelper?.hired) staffSalaries += STAFF_LIST[1].salary;
    if (state.staff.vyOnline?.hired) staffSalaries += STAFF_LIST[2].salary;

    const totalExpense = rentCost + staffSalaries;
    const netProfit = this.dailyReport.revenue - totalExpense;
    state.money -= totalExpense;

    state.history.push({
      day: state.day,
      served: this.dailyReport.served,
      revenue: this.dailyReport.revenue,
      profit: netProfit
    });

    // Đánh giá mới từ khách
    const posReviews = [
      "Trà sữa ngọt béo vừa vặn, giao nhanh như chớp!",
      "Rùa pha chuẩn vị, trân châu mềm dẻo 10 điểm!",
      "Máy dập nắp xịn xò, nước không bị tràn ra ngoài."
    ];
    state.reviews.unshift({
      name: CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)],
      stars: 5,
      comment: posReviews[Math.floor(Math.random() * posReviews.length)]
    });
    if (state.reviews.length > 8) state.reviews.pop();

    this.openModal(`
      <h2>🌙 ĐÓNG CỬA NGÀY ${state.day}</h2>
      <p style="color: #7C5B49; margin-top: 0;">Một ngày kinh doanh tràn ngập niềm vui!</p>

      <div style="background: #FDF4E7; border-radius: 12px; padding: 10px 12px; text-align: left; font-size: 13px; margin: 10px 0;">
        <div style="display: flex; justify-content: space-between; padding: 3px 0;">
          <span>Ly đã phục vụ:</span> <b>${this.dailyReport.served} ly</b>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 3px 0;">
          <span>Doanh thu:</span> <b style="color: #38A169;">+${this.dailyReport.revenue.toLocaleString()}đ</b>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 3px 0;">
          <span>Mặt bằng tiệm:</span> <b style="color: #E53E3E;">-${rentCost.toLocaleString()}đ</b>
        </div>
        ${staffSalaries > 0 ? `
          <div style="display: flex; justify-content: space-between; padding: 3px 0;">
            <span>Lương nhân viên:</span> <b style="color: #E53E3E;">-${staffSalaries.toLocaleString()}đ</b>
          </div>
        ` : ''}
        <hr style="border: 0; border-top: 1px dashed #EAD2BC; margin: 6px 0;">
        <div style="display: flex; justify-content: space-between; padding: 3px 0; font-size: 14.5px;">
          <span>Lợi nhuận ròng:</span> <b>${netProfit >= 0 ? '+' : ''}${netProfit.toLocaleString()}đ</b>
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
