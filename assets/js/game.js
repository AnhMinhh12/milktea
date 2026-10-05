/**
 * Tiệm Trà Sữa Nhỏ - Boba Shop Simulator Engine
 * Tương thích Mobile, Tablet, Desktop (Client-side pure JS, LocalStorage)
 */

// ================= 1. HỆ THỐNG ÂM THANH (WEB AUDIO API SYNTHESIZER) =================
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    try {
      const saved = localStorage.getItem('tiemTraSua_sound');
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
      localStorage.setItem('tiemTraSua_sound', JSON.stringify(this.enabled));
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

  click() { this.playBeep(600, 'sine', 0.05, 0.1); }
  pour() { this.playBeep(320, 'triangle', 0.18, 0.2); }
  addIce() {
    this.playBeep(1200, 'sine', 0.06, 0.12);
    setTimeout(() => this.playBeep(1600, 'sine', 0.05, 0.1), 40);
  }
  addTopping() {
    this.playBeep(240, 'sine', 0.12, 0.25);
  }
  shake() {
    this.playBeep(180, 'square', 0.08, 0.15);
  }
  sealPop() {
    this.playBeep(450, 'sine', 0.08, 0.2);
    setTimeout(() => this.playBeep(850, 'triangle', 0.12, 0.25), 60);
  }
  serveSuccess() {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C E G C
    notes.forEach((f, idx) => {
      setTimeout(() => this.playBeep(f, 'sine', 0.15, 0.2), idx * 70);
    });
  }
  trashFail() {
    this.playBeep(180, 'sawtooth', 0.2, 0.2);
    setTimeout(() => this.playBeep(130, 'sawtooth', 0.25, 0.2), 120);
  }
  bell() {
    this.playBeep(880, 'sine', 0.4, 0.2);
    setTimeout(() => this.playBeep(1320, 'sine', 0.6, 0.15), 100);
  }
}

const audio = new SoundEngine();

// ================= 2. DỮ LIỆU DANH MỤC TRÒ CHƠI =================
const TEAS = [
  { id: 'black', name: 'Hồng Trà', icon: '🍂', color: '#8F3A15', liquid: '#B35E34', cost: 3000, price: 20000 },
  { id: 'oolong', name: 'Trà Ô Long', icon: '🪵', color: '#A06734', liquid: '#C48850', cost: 3500, price: 22000 },
  { id: 'green', name: 'Lục Trà Lài', icon: '🌼', color: '#BF982A', liquid: '#DCC060', cost: 3000, price: 20000 },
  { id: 'matcha', name: 'Matcha Nhật', icon: '🍵', color: '#557A28', liquid: '#77A33E', cost: 4500, price: 26000 }
];

const SUGAR_LEVELS = ['0%', '30%', '50%', '70%', '100%'];
const ICE_LEVELS = ['Nóng', '0%', '50%', '100%'];

const TOPPINGS = [
  { id: 'tapioca', name: 'Trân Châu Đen', icon: '⚫', cost: 2000, price: 5000 },
  { id: 'whitePearl', name: 'Trân Châu Trắng', icon: '⚪', cost: 2500, price: 6000 },
  { id: 'pudding', name: 'Pudding Trứng', icon: '🍮', cost: 3000, price: 7000 },
  { id: 'cheese', name: 'Kem Cheese', icon: '🧀', cost: 3500, price: 8000 },
  { id: 'coconut', name: 'Thạch Dừa', icon: '🧊', cost: 2000, price: 5000 },
  { id: 'peach', name: 'Đào Miếng', icon: '🍑', cost: 3000, price: 7000 }
];

const UPGRADES_LIST = [
  { id: 'autoSealer', name: 'Máy Dập Nắp Siêu Tốc', icon: '⚡', desc: 'Tự động dập nắp ly khi đủ nguyên liệu', cost: 200000 },
  { id: 'airConditioner', name: 'Điều Hòa Mát Rượi', icon: '❄️', desc: 'Khách đứng chờ kiên nhẫn hơn 30%', cost: 350000 },
  { id: 'lofiSpeaker', name: 'Loa Nhạc Lofi Chill', icon: '📻', desc: 'Tăng 20% khả năng khách cho thêm tiền Tip', cost: 250000 },
  { id: 'luckyCat', name: 'Mèo Chiêu Tài May Mắn', icon: '🐱', desc: 'Tăng 10% tổng doanh thu mỗi ngày', cost: 500000 }
];

const CUSTOMER_NAMES = [
  'Bé Vy', 'Khánh An', 'Minh Thư', 'Bảo Hân', 'Hoàng Nam',
  'Tuấn Anh', 'Cô Lan Văn Phòng', 'Chị Ngọc Yoga', 'Bạn Tiktoker Hảo'
];

const CUSTOMER_AVATARS = ['👧', '🧑', '👩‍🦰', '👱‍♂️', '👩‍💻', '👨‍🎓', '🧕', '🐱'];

const SAMPLE_REVIEWS_POS = [
  "Trà sữa thơm đậm vị trà, trân châu dai mềm đúng ý!",
  "Quán pha đúng 50% đường không bị ngọt khè, cho 5 sao.",
  "Kem cheese béo ngậy mặn mặn cực ngon, sẽ ủng hộ dài!",
  "Đóng gói sạch sẽ, giao hàng nhanh như chớp."
];

const SAMPLE_REVIEWS_NEG = [
  "Bảo lấy ô long mà thành hồng trà, thất vọng ghê.",
  "Chờ lâu quá xém muộn giờ làm, mong tiệm nhanh tay hơn.",
  "Quên bỏ trân châu của tui rồi quán ơiiii!"
];

// ================= 3. TRẠNG THÁI TOÀN CỤC (STATE & STORAGE) =================
class GameState {
  constructor() {
    this.shopName = 'Tiệm Trà Sữa Nhỏ';
    this.day = 1;
    this.money = 150000;
    this.rating = 5.0;
    this.ratingCount = 5;
    this.level = 1;
    this.exp = 0;
    this.expMax = 100;
    
    // Kho nguyên liệu
    this.inventory = {
      cupM: 35,
      cupL: 25,
      black: 30,
      oolong: 25,
      green: 25,
      matcha: 15,
      tapioca: 40,
      whitePearl: 30,
      pudding: 20,
      cheese: 20,
      coconut: 25,
      peach: 15
    };

    // Nâng cấp đã sở hữu
    this.upgrades = {};

    // Lịch sử doanh thu
    this.history = [];
    this.reviews = [
      { name: "Khánh Ly", stars: 5, comment: "Trà sữa ngon xỉu, ngày nào cũng ghé!" },
      { name: "Anh Nam", stars: 5, comment: "Pha nhanh, trân châu chuẩn vị." }
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
        upgrades: this.upgrades,
        history: this.history,
        reviews: this.reviews
      };
      localStorage.setItem('tiemTraSua_save', JSON.stringify(data));
    } catch (e) {
      console.error("Lỗi lưu game", e);
    }
  }

  load() {
    try {
      const str = localStorage.getItem('tiemTraSua_save');
      if (str) {
        const obj = JSON.parse(str);
        Object.assign(this, obj);
      }
      if (this.inventory.cupM === undefined) this.inventory.cupM = 35;
      if (this.inventory.cupL === undefined) this.inventory.cupL = 25;
    } catch (e) {
      console.error("Lỗi đọc game", e);
    }
  }

  addExp(amount) {
    this.exp += amount;
    if (this.exp >= this.expMax) {
      this.level += 1;
      this.exp -= this.expMax;
      this.expMax = Math.round(this.expMax * 1.4);
      return true; // Level up!
    }
    return false;
  }
}

const state = new GameState();

// ================= 4. GAME CONTROLLER & LOGIC =================
class GameApp {
  constructor() {
    this.viewMode = 'prep'; // 'prep' hoặc 'sell'
    this.activeTab = 'restock'; // 'restock' | 'upgrades' | 'ledger'
    
    // Trạng thái ngày bán hàng
    this.sellTimer = null;
    this.timeLeft = 60;
    this.customers = [];
    this.activeCustomerIdx = 0;
    this.spillActive = false;
    this.spillClicks = 0;

    // Ly đang pha trên bàn
    this.currentCup = {
      tea: null,
      sugar: '50%',
      ice: '100%',
      toppings: [],
      sealed: false
    };

    // Thống kê ngày hôm nay
    this.dailyReport = {
      served: 0,
      mistakes: 0,
      revenue: 0,
      cost: 0,
      tips: 0
    };

    // Cache elements
    this.elTopDay = document.getElementById('topDay');
    this.elTopMoney = document.getElementById('topMoney');
    this.elTopStars = document.getElementById('topStars');
    this.elTopRating = document.getElementById('topRating');
    this.elTopShopName = document.getElementById('topShopName');
    this.elBtnSound = document.getElementById('btnSound');
    this.elView = document.getElementById('view');
    this.elModal = document.getElementById('modal');
    this.elModalCard = document.getElementById('modalCard');
    this.elToast = document.getElementById('toast');

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

    // Click ngoài modal
    const overlay = document.getElementById('modalOverlay');
    if (overlay) overlay.onclick = () => this.closeModal();
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

  render() {
    this.renderTopBar();
    if (this.viewMode === 'prep') {
      this.renderPrepView();
    } else {
      this.renderSellView();
    }
  }

  renderTopBar() {
    this.elTopDay.textContent = `Ngày ${state.day}`;
    this.elTopMoney.textContent = `${state.money.toLocaleString('vi-VN')}đ`;
    this.elTopShopName.textContent = state.shopName;
    this.elTopRating.textContent = state.rating.toFixed(1);
    
    // Vẽ số sao vàng
    const fullStars = Math.round(state.rating);
    this.elTopStars.textContent = '⭐'.repeat(Math.max(1, fullStars));
  }

  // ================= 4.1. MÀN HÌNH CHUẨN BỊ (PREP VIEW) =================
  renderPrepView() {
    const expPercent = Math.min(100, Math.round((state.exp / state.expMax) * 100));

    this.elView.innerHTML = `
      <div class="prep-view">
        <div class="prep-left-col">
          <!-- Biển hiệu tiệm -->
          <div class="shop-sign">
            <div class="awning"></div>
            <div class="mascot">
              <svg viewBox="0 0 80 90" width="100%" height="100%">
                <ellipse cx="40" cy="55" rx="26" ry="28" fill="#FCEBD9" stroke="#7A4222" stroke-width="3"/>
                <!-- Tai gấu / Mèo -->
                <circle cx="20" cy="32" r="9" fill="#7A4222"/>
                <circle cx="20" cy="32" r="5" fill="#FCEBD9"/>
                <circle cx="60" cy="32" r="9" fill="#7A4222"/>
                <circle cx="60" cy="32" r="5" fill="#FCEBD9"/>
                <!-- Mắt & Miệng -->
                <circle cx="32" cy="52" r="3.5" fill="#3D2214"/>
                <circle cx="48" cy="52" r="3.5" fill="#3D2214"/>
                <path d="M36 58 Q40 62 44 58" fill="none" stroke="#3D2214" stroke-width="2.5" stroke-linecap="round"/>
                <!-- Má hồng -->
                <ellipse cx="26" cy="56" rx="4" ry="2.5" fill="#FFB6C1"/>
                <ellipse cx="54" cy="56" rx="4" ry="2.5" fill="#FFB6C1"/>
                <!-- Ly trà sữa cầm tay -->
                <rect x="34" y="62" width="12" height="15" rx="2" fill="#E86558" stroke="#3D2214" stroke-width="1.5"/>
                <circle cx="37" cy="72" r="1.5" fill="#3D2214"/>
                <circle cx="43" cy="72" r="1.5" fill="#3D2214"/>
              </svg>
            </div>
            <h1>${state.shopName}</h1>
            <p>Trà sữa thơm ngon - Đậm đà từng ngụm</p>
            <div class="level-row">
              <span>Cấp quán: <b>Level ${state.level}</b></span>
              <div class="level-bar"><i style="width: ${expPercent}%"></i></div>
              <small>${state.exp}/${state.expMax} EXP</small>
            </div>
          </div>

          <!-- Thẻ sự kiện hôm nay -->
          <div class="event-card">
            <div class="dot"></div>
            <div>
              <b>Hôm nay: Trời nắng đẹp</b>
              <small>Lượng khách thích uống trà sữa nhiều đá tăng vọt!</small>
            </div>
          </div>
        </div>

        <div class="prep-right-col">
          <!-- 3 Tabs Điều Hướng -->
          <div class="tabs-nav">
            <button class="tab-btn ${this.activeTab === 'restock' ? 'active' : ''}" data-tab="restock">📦 Nhập Hàng</button>
            <button class="tab-btn ${this.activeTab === 'upgrades' ? 'active' : ''}" data-tab="upgrades">✨ Nâng Cấp</button>
            <button class="tab-btn ${this.activeTab === 'ledger' ? 'active' : ''}" data-tab="ledger">📊 Sổ Sách</button>
          </div>

          <!-- Nội dung Tab -->
          <div class="tab-content" id="tabContent">
            ${this.getTabContentHtml()}
          </div>
        </div>

        <!-- Nút to dính đáy Mở tiệm -->
        <div class="dock-bar">
          <button class="btn-big-open" id="btnStartDay">
            <span>🚪</span> BẮT ĐẦU NGÀY BÁN HÀNG
          </button>
        </div>
      </div>
    `;

    // Gắn sự kiện chuyển Tab
    this.elView.querySelectorAll('.tab-btn').forEach(btn => {
      btn.onclick = () => {
        audio.click();
        this.activeTab = btn.dataset.tab;
        this.render();
      };
    });

    // Bắt đầu ngày bán hàng
    const btnStart = document.getElementById('btnStartDay');
    if (btnStart) {
      btnStart.onclick = () => this.startSellPhase();
    }

    this.attachTabEvents();
  }

  getTabContentHtml() {
    if (this.activeTab === 'restock') {
      return `
        <h3>Nguyên Liệu Cần Nhập <small>Tự động trừ tiền khi mua</small></h3>
        <div class="restock-list">
          <!-- Nhập Ly Nhựa M & L -->
          <div class="restock-item" style="background: #FFF9F2; border-radius: 8px; padding: 6px;">
            <div class="restock-icon">🥛</div>
            <div class="restock-info">
              <b>Ly Nhựa Size M (500ml)</b>
              <small>Giá nhập: 500đ/ly | Tồn kho: ${state.inventory.cupM || 0}</small>
            </div>
            <div class="qty-control">
              <button class="qty-btn" data-act="sub" data-item="cupM">-</button>
              <span class="qty-val">${state.inventory.cupM || 0}</span>
              <button class="qty-btn plus" data-act="add" data-item="cupM" data-cost="500">+</button>
            </div>
          </div>

          <div class="restock-item" style="background: #FFF9F2; border-radius: 8px; padding: 6px;">
            <div class="restock-icon">🧋</div>
            <div class="restock-info">
              <b>Ly Nhựa Size L (700ml)</b>
              <small>Giá nhập: 800đ/ly | Tồn kho: ${state.inventory.cupL || 0}</small>
            </div>
            <div class="qty-control">
              <button class="qty-btn" data-act="sub" data-item="cupL">-</button>
              <span class="qty-val">${state.inventory.cupL || 0}</span>
              <button class="qty-btn plus" data-act="add" data-item="cupL" data-cost="800">+</button>
            </div>
          </div>

          ${TEAS.map(t => `
            <div class="restock-item">
              <div class="restock-icon">${t.icon}</div>
              <div class="restock-info">
                <b>${t.name}</b>
                <small>Giá nhập: ${t.cost.toLocaleString('vi-VN')}đ/ly | Tồn kho: ${state.inventory[t.id] || 0}</small>
              </div>
              <div class="qty-control">
                <button class="qty-btn" data-act="sub" data-item="${t.id}">-</button>
                <span class="qty-val">${state.inventory[t.id] || 0}</span>
                <button class="qty-btn plus" data-act="add" data-item="${t.id}" data-cost="${t.cost}">+</button>
              </div>
            </div>
          `).join('')}

          ${TOPPINGS.map(tp => `
            <div class="restock-item">
              <div class="restock-icon">${tp.icon}</div>
              <div class="restock-info">
                <b>${tp.name}</b>
                <small>Giá nhập: ${tp.cost.toLocaleString('vi-VN')}đ | Tồn kho: ${state.inventory[tp.id] || 0}</small>
              </div>
              <div class="qty-control">
                <button class="qty-btn" data-act="sub" data-item="${tp.id}">-</button>
                <span class="qty-val">${state.inventory[tp.id] || 0}</span>
                <button class="qty-btn plus" data-act="add" data-item="${tp.id}" data-cost="${tp.cost}">+</button>
              </div>
            </div>
          `).join('')}
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
              <div class="upgrade-item">
                <div class="restock-icon">${u.icon}</div>
                <div class="upgrade-info">
                  <b>${u.name}</b>
                  <small>${u.desc}</small>
                </div>
                ${owned 
                  ? `<span class="btn-buy owned">Đã sở hữu</span>`
                  : `<button class="btn-buy" data-uid="${u.id}" data-cost="${u.cost}">${u.cost.toLocaleString('vi-VN')}đ</button>`
                }
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    if (this.activeTab === 'ledger') {
      return `
        <h3>Sổ Sách & Đánh Giá</h3>
        <div class="ledger-summary">
          <div class="ledger-card">
            <small>Đánh giá trung bình</small>
            <b>⭐ ${state.rating.toFixed(1)} / 5.0</b>
          </div>
          <div class="ledger-card">
            <small>Tổng số ly đã phục vụ</small>
            <b>🥤 ${(state.history.reduce((a, b) => a + (b.served || 0), 0) + 12)} ly</b>
          </div>
        </div>

        <h4 style="margin: 8px 0 4px; font-size: 13px;">Bình luận gần đây từ khách</h4>
        <div class="reviews-list">
          ${state.reviews.map(r => `
            <div class="review-item">
              <div class="review-header">
                <b>${r.name}</b>
                <span style="color: #ECC94B;">${'⭐'.repeat(r.stars)}</span>
              </div>
              <p class="review-comment">"${r.comment}"</p>
            </div>
          `).join('')}
        </div>
      `;
    }
  }

  attachTabEvents() {
    // Nút cộng trừ nhập hàng
    this.elView.querySelectorAll('.qty-btn').forEach(btn => {
      btn.onclick = () => {
        const item = btn.dataset.item;
        const act = btn.dataset.act;
        const cost = parseInt(btn.dataset.cost || '0', 10);

        if (act === 'add') {
          if (state.money < cost) {
            audio.trashFail();
            this.showToast('Không đủ tiền trong ngân quỹ!');
            return;
          }
          state.money -= cost;
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

    // Nút mua nâng cấp
    this.elView.querySelectorAll('.btn-buy').forEach(btn => {
      btn.onclick = () => {
        const uid = btn.dataset.uid;
        const cost = parseInt(btn.dataset.cost, 10);
        if (state.money < cost) {
          audio.trashFail();
          this.showToast('Không đủ tiền nâng cấp!');
          return;
        }
        state.money -= cost;
        state.upgrades[uid] = true;
        audio.serveSuccess();
        this.showToast('Nâng cấp thành công!');
        state.save();
        this.render();
      };
    });
  }

  // ================= 4.2. MÀN HÌNH BÁN HÀNG (SELL PHASE) =================
  startSellPhase() {
    audio.bell();
    this.viewMode = 'sell';
    this.timeLeft = 60;
    this.customers = [];
    this.activeCustomerIdx = 0;
    this.resetCup();

    this.dailyReport = {
      served: 0,
      mistakes: 0,
      revenue: 0,
      cost: 0,
      tips: 0
    };

    // Sinh 3 khách đầu tiên
    this.generateCustomer();
    this.generateCustomer();
    this.generateCustomer();

    // Vòng lặp đếm ngược thời gian ca bán
    clearInterval(this.sellTimer);
    this.sellTimer = setInterval(() => {
      this.timeLeft -= 1;
      
      // Giảm độ kiên nhẫn của khách hàng
      const patienceSpeed = state.upgrades.airConditioner ? 1.0 : 1.35;
      this.customers.forEach(c => {
        c.patience = Math.max(0, c.patience - patienceSpeed);
      });

      // Kiểm tra nếu khách hết kiên nhẫn bỏ về
      const angryIdx = this.customers.findIndex(c => c.patience <= 0);
      if (angryIdx !== -1) {
        audio.trashFail();
        const angryCust = this.customers.splice(angryIdx, 1)[0];
        this.dailyReport.mistakes += 1;
        state.rating = Math.max(1.0, state.rating - 0.15);
        this.showToast(`${angryCust.name} đã tức giận bỏ về!`);
        this.generateCustomer();
      }

      // Ngẫu nhiên tạo vũng nước đổ
      if (!this.spillActive && Math.random() < 0.05) {
        this.spillActive = true;
        this.spillClicks = 0;
      }

      if (this.timeLeft <= 0) {
        this.endSellPhase();
      } else {
        this.render();
      }
    }, 1000);

    this.render();
  }

  generateCustomer() {
    if (this.customers.length >= 3) return;

    // Chọn ngẫu nhiên size M hoặc L
    const randSize = Math.random() > 0.4 ? 'M' : 'L';
    const randTea = TEAS[Math.floor(Math.random() * TEAS.length)];
    const randSugar = SUGAR_LEVELS[Math.floor(Math.random() * SUGAR_LEVELS.length)];
    const randIce = ICE_LEVELS[Math.floor(Math.random() * ICE_LEVELS.length)];
    
    // Ngẫu nhiên 1-2 topping
    const numToppings = Math.random() > 0.4 ? 2 : 1;
    const shuffledToppings = [...TOPPINGS].sort(() => 0.5 - Math.random());
    const orderToppings = shuffledToppings.slice(0, numToppings).map(t => t.id);

    const name = CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)];
    const avatar = CUSTOMER_AVATARS[Math.floor(Math.random() * CUSTOMER_AVATARS.length)];

    this.customers.push({
      name,
      avatar,
      patience: 100,
      maxPatience: 100,
      order: {
        size: randSize,
        teaId: randTea.id,
        teaName: randTea.name,
        sugar: randSugar,
        ice: randIce,
        toppings: orderToppings
      }
    });
  }

  resetCup() {
    this.currentCup = {
      size: null, // 'M' hoặc 'L'
      tea: null,
      sugar: '50%',
      ice: '100%',
      toppings: [],
      sealed: false
    };
  }

  renderSellView() {
    const activeCust = this.customers[this.activeCustomerIdx] || null;

    this.elView.innerHTML = `
      <div class="sell-view">
        <!-- Phố và dãy khách hàng -->
        <div class="street-scene">
          <div class="canopy">
            <div class="sell-timer-badge">⏱️ Ca bán: ${this.timeLeft}s</div>
          </div>
          <div class="customer-lane">
            ${this.customers.map((c, idx) => {
              const ringOffset = 163 - (163 * (c.patience / 100));
              const isSelected = idx === this.activeCustomerIdx;
              return `
                <div class="customer-seat ${isSelected ? 'active' : ''}" data-cidx="${idx}">
                  <div class="customer-ring">
                    <svg class="progress-ring" width="52" height="52">
                      <circle cx="26" cy="26" r="23" stroke="#FFF" stroke-opacity="0.3" stroke-width="4" fill="none"/>
                      <circle cx="26" cy="26" r="23" stroke="${c.patience > 40 ? '#48BB78' : (c.patience > 20 ? '#ECC94B' : '#E53E3E')}" 
                              stroke-width="4" fill="none" stroke-dasharray="163" stroke-dashoffset="${ringOffset}" stroke-linecap="round"/>
                    </svg>
                    <div class="customer-face">${c.patience < 25 ? '😡' : c.avatar}</div>
                  </div>
                  <div class="customer-name">${c.name}</div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Vết nước đổ trên quầy/sàn -->
          ${this.spillActive ? `
            <div class="spill-spot" id="btnCleanSpill">
              ⚠️ Tràn nước! Chạm lau (${3 - this.spillClicks})
            </div>
          ` : ''}
        </div>

        <!-- Bong bóng gọi món của khách đang chọn -->
        ${activeCust ? `
          <div class="order-bubble">
            <div class="order-cup-preview">
              <span style="font-size: 32px;">🧋</span>
            </div>
            <div class="order-text">
              <b>${activeCust.name} gọi:</b> 1x ${activeCust.order.teaName} <span class="order-size-badge">Size ${activeCust.order.size}</span><br>
              <small>Đường: <b>${activeCust.order.sugar}</b> | Đá: <b>${activeCust.order.ice}</b></small><br>
              <small>Topping: <b>${activeCust.order.toppings.map(tid => TOPPINGS.find(t => t.id === tid)?.name).join(', ')}</b></small>
            </div>
            <div class="order-patience-bar">
              <i style="width: ${activeCust.patience}%; background: ${activeCust.patience > 40 ? '#48BB78' : '#E53E3E'};"></i>
            </div>
          </div>
        ` : `
          <div class="order-bubble" style="justify-content: center; text-align: center;">
            <p style="margin: 0; color: #7C5B49;">Đang đợi khách mới tới...</p>
          </div>
        `}

        <!-- Bàn pha chế chính (Kitchen Bar) -->
        <div class="kitchen-bar">
          <!-- HÀNG TRÊN: QUẦY TRÀ (Chồng ly M/L, Các bình ủ trà, Máy dập nắp) -->
          <div class="counter-header-tag">QUẦY TRÀ</div>
          <div class="top-shelf-row">
            <!-- Chồng ly M & L -->
            <div class="cup-stacks-wrapper">
              <button class="cup-stack-btn ${this.currentCup.size === 'M' ? 'selected' : ''}" data-pick-size="M" title="Lấy ly Size M (500ml)">
                <span class="cup-stack-qty">${state.inventory.cupM || 0}</span>
                <div class="cup-stack-visual stack-m">
                  <svg viewBox="0 0 34 50" width="30" height="44">
                    <path d="M5 14 L9 46 L25 46 L29 14 Z" fill="#FFF" stroke="#7A4222" stroke-width="1.8"/>
                    <line x1="7" y1="22" x2="27" y2="22" stroke="#7A4222" stroke-width="1" stroke-dasharray="2 1"/>
                    <line x1="8" y1="30" x2="26" y2="30" stroke="#7A4222" stroke-width="1" stroke-dasharray="2 1"/>
                    <line x1="8" y1="38" x2="26" y2="38" stroke="#7A4222" stroke-width="1" stroke-dasharray="2 1"/>
                    <ellipse cx="17" cy="14" rx="12" ry="3.5" fill="#E8F1F5" stroke="#7A4222" stroke-width="1.8"/>
                    <text x="17" y="27" font-family="'Paytone One', sans-serif" font-size="12" font-weight="bold" fill="#7A4222" text-anchor="middle">M</text>
                  </svg>
                </div>
                <b class="cup-size-letter">M</b>
              </button>

              <button class="cup-stack-btn ${this.currentCup.size === 'L' ? 'selected' : ''}" data-pick-size="L" title="Lấy ly Size L (700ml)">
                <span class="cup-stack-qty">${state.inventory.cupL || 0}</span>
                <div class="cup-stack-visual stack-l">
                  <svg viewBox="0 0 34 60" width="30" height="52">
                    <path d="M4 12 L8 56 L26 56 L30 12 Z" fill="#FFF" stroke="#7A4222" stroke-width="1.8"/>
                    <line x1="6" y1="21" x2="28" y2="21" stroke="#7A4222" stroke-width="1" stroke-dasharray="2 1"/>
                    <line x1="7" y1="30" x2="27" y2="30" stroke="#7A4222" stroke-width="1" stroke-dasharray="2 1"/>
                    <line x1="7" y1="39" x2="27" y2="39" stroke="#7A4222" stroke-width="1" stroke-dasharray="2 1"/>
                    <line x1="8" y1="48" x2="26" y2="48" stroke="#7A4222" stroke-width="1" stroke-dasharray="2 1"/>
                    <ellipse cx="17" cy="12" rx="13" ry="3.5" fill="#E8F1F5" stroke="#7A4222" stroke-width="1.8"/>
                    <text x="17" y="26" font-family="'Paytone One', sans-serif" font-size="13" font-weight="bold" fill="#7A4222" text-anchor="middle">L</text>
                  </svg>
                </div>
                <b class="cup-size-letter">L</b>
              </button>
            </div>

            <!-- Bình ủ trà -->
            <div class="tea-dispensers-shelf">
              ${TEAS.map(t => {
                const selected = this.currentCup.tea === t.id;
                const qty = state.inventory[t.id] || 0;
                return `
                  <button class="dispenser-jar-btn ${selected ? 'selected' : ''}" data-tea="${t.id}" title="${t.name}">
                    <span class="dispenser-qty">${qty}</span>
                    <div class="jar-body" style="--jar-color: ${t.liquid}">
                      <div class="jar-liquid" style="background: ${t.liquid};"></div>
                      <span class="jar-name">${t.name}</span>
                    </div>
                    <div class="jar-tap">🚰</div>
                  </button>
                `;
              }).join('')}
            </div>

            <!-- Máy dập nắp (Sealer Machine) -->
            <div class="sealer-machine-box">
              <div class="sealer-head">
                <div class="sealer-roll"></div>
                <div class="sealer-screen ${this.currentCup.sealed ? 'done' : 'ready'}">
                  ${this.currentCup.sealed ? 'DONE' : 'READY'}
                </div>
              </div>
              <button class="sealer-lever-btn" id="btnSealCup" title="Dập nắp ly">
                <span>${this.currentCup.sealed ? '✅ Đã dập' : '🔴 Dập nắp'}</span>
              </button>
            </div>
          </div>

          <!-- HÀNG DƯỚI: PHA LY (Bàn gỗ, Đá/Đường, Topping 12 ô) -->
          <div class="counter-header-tag" style="margin-top: 6px;">PHA LY</div>
          <div class="lower-counter-grid">
            <!-- Bàn gỗ đặt ly (Wooden board) -->
            <div class="wooden-prep-board ${!this.currentCup.size ? 'need-cup' : ''}">
              ${!this.currentCup.size ? `
                <div class="board-empty-prompt">
                  <span class="pointing-hand">👆</span>
                  <b>Lấy ly<br>M hoặc L</b>
                  <small>Chạm chồng ly</small>
                </div>
              ` : `
                <div class="cup-on-board">
                  <div class="cup-svg-wrapper size-${this.currentCup.size.toLowerCase()}">
                    ${this.renderCupSvg()}
                  </div>
                  <div class="cup-size-badge-on-board">Ly Size ${this.currentCup.size}</div>
                </div>
              `}
            </div>

            <!-- Khu giữa: Lắc Shaker + Đường & Đá -->
            <div class="middle-controls">
              <div class="shaker-pill-row">
                <button class="shaker-btn" id="btnShaker" title="Lắc Shaker">
                  🥛 Lắc đều
                </button>
              </div>

              <div class="mini-control-group">
                <small>Mức Đường</small>
                <div class="pill-group mini">
                  ${SUGAR_LEVELS.map(s => `
                    <button class="pill-btn ${this.currentCup.sugar === s ? 'active' : ''}" data-sugar="${s}">${s}</button>
                  `).join('')}
                </div>
              </div>

              <div class="mini-control-group">
                <small>Mức Đá</small>
                <div class="pill-group mini">
                  ${ICE_LEVELS.map(ice => `
                    <button class="pill-btn ${this.currentCup.ice === ice ? 'active' : ''}" data-ice="${ice}">${ice}</button>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- Khu phải: Khay Inox Topping (Topping Compartment Grid) -->
            <div class="topping-compartment-grid">
              ${TOPPINGS.map(tp => {
                const inCup = this.currentCup.toppings.includes(tp.id);
                const qty = state.inventory[tp.id] || 0;
                return `
                  <button class="topping-tray-slot ${inCup ? 'in-cup' : ''}" data-topping="${tp.id}" title="${tp.name}">
                    <span class="tray-qty">${qty}</span>
                    <span class="tray-icon">${tp.icon}</span>
                    <span class="tray-name">${tp.name}</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Nút hành động giao món & thùng rác -->
          <div class="action-row">
            <button class="btn-trash" id="btnTrash" title="Đổ ly làm lại">🗑️ Bỏ ly</button>
            <button class="btn-serve ${this.currentCup.sealed ? 'ready' : ''}" id="btnServe">
              <span>🥤</span> GIAO CHO KHÁCH
            </button>
          </div>
        </div>
      </div>
    `;

    this.attachSellEvents();
  }

  renderCupSvg() {
    if (!this.currentCup.size) return '';

    const isL = this.currentCup.size === 'L';
    let liquidColor = '#F2E8DC'; // Trắng kem khi chưa rót trà
    if (this.currentCup.tea) {
      const teaObj = TEAS.find(t => t.id === this.currentCup.tea);
      if (teaObj) liquidColor = teaObj.liquid;
    }

    const hasIce = this.currentCup.ice !== 'Nóng' && this.currentCup.ice !== '0%';
    const hasTopping = this.currentCup.toppings.length > 0;

    if (isL) {
      // Ly Size L (700ml) cao hơn
      return `
        <svg viewBox="0 0 70 96" width="100%" height="100%">
          <!-- Thân ly Size L -->
          <path d="M11 14 L17 88 Q18 92 23 92 L47 92 Q52 92 53 88 L59 14 Z" fill="url(#gCup)" stroke="#8A6348" stroke-width="2"/>
          
          <!-- Nước trà bên trong -->
          ${this.currentCup.tea ? `
            <path d="M13 22 L17 88 Q18 90 23 90 L47 90 Q52 90 53 88 L57 22 Z" fill="${liquidColor}"/>
          ` : ''}

          <!-- Viên đá -->
          ${hasIce ? `
            <rect x="21" y="28" width="12" height="11" rx="2" fill="#FFF" fill-opacity="0.7" stroke="#FFF" stroke-width="1"/>
            <rect x="37" y="34" width="12" height="11" rx="2" fill="#FFF" fill-opacity="0.7" stroke="#FFF" stroke-width="1"/>
            <rect x="26" y="44" width="11" height="10" rx="2" fill="#FFF" fill-opacity="0.6" stroke="#FFF" stroke-width="1"/>
          ` : ''}

          <!-- Topping dưới đáy ly -->
          ${hasTopping ? `
            <circle cx="24" cy="84" r="3.6" fill="#3D2214"/>
            <circle cx="32" cy="86" r="3.6" fill="#3D2214"/>
            <circle cx="40" cy="85" r="3.6" fill="#3D2214"/>
            <circle cx="46" cy="82" r="3.4" fill="#3D2214"/>
            <circle cx="27" cy="78" r="3.2" fill="#D4AF37"/>
            <circle cx="37" cy="79" r="3.2" fill="#FFB6C1"/>
          ` : ''}

          <!-- Màng nắp / Nắp ly -->
          ${this.currentCup.sealed ? `
            <rect x="7" y="10" width="56" height="5" rx="2.5" fill="#E86558" stroke="#3D2214" stroke-width="1"/>
            <line x1="44" y1="0" x2="38" y2="86" stroke="#FA8072" stroke-width="4" stroke-linecap="round"/>
          ` : `
            <ellipse cx="35" cy="14" rx="24" ry="4" fill="none" stroke="#8A6348" stroke-width="2"/>
          `}
        </svg>
      `;
    }

    // Ly Size M (500ml)
    return `
      <svg viewBox="0 0 70 82" width="100%" height="100%">
        <!-- Thân ly Size M -->
        <path d="M13 16 L18 74 Q19 78 24 78 L46 78 Q51 78 52 74 L57 16 Z" fill="url(#gCup)" stroke="#8A6348" stroke-width="2"/>
        
        <!-- Nước trà bên trong -->
        ${this.currentCup.tea ? `
          <path d="M15 24 L18 74 Q19 76 24 76 L46 76 Q51 76 52 74 L55 24 Z" fill="${liquidColor}"/>
        ` : ''}

        <!-- Viên đá -->
        ${hasIce ? `
          <rect x="22" y="30" width="11" height="10" rx="2" fill="#FFF" fill-opacity="0.7" stroke="#FFF" stroke-width="1"/>
          <rect x="36" y="34" width="11" height="10" rx="2" fill="#FFF" fill-opacity="0.7" stroke="#FFF" stroke-width="1"/>
        ` : ''}

        <!-- Topping -->
        ${hasTopping ? `
          <circle cx="26" cy="70" r="3.5" fill="#3D2214"/>
          <circle cx="34" cy="72" r="3.5" fill="#3D2214"/>
          <circle cx="42" cy="71" r="3.5" fill="#3D2214"/>
          <circle cx="29" cy="64" r="3.2" fill="#D4AF37"/>
          <circle cx="39" cy="65" r="3.2" fill="#FFB6C1"/>
        ` : ''}

        <!-- Nắp ly -->
        ${this.currentCup.sealed ? `
          <rect x="9" y="12" width="52" height="5" rx="2.5" fill="#E86558" stroke="#3D2214" stroke-width="1"/>
          <line x1="43" y1="2" x2="38" y2="72" stroke="#FA8072" stroke-width="4" stroke-linecap="round"/>
        ` : `
          <ellipse cx="35" cy="16" rx="22" ry="4" fill="none" stroke="#8A6348" stroke-width="2"/>
        `}
      </svg>
    `;
  }

  attachSellEvents() {
    // Chuyển khách hàng đang phục vụ
    this.elView.querySelectorAll('.customer-seat').forEach(seat => {
      seat.onclick = () => {
        audio.click();
        this.activeCustomerIdx = parseInt(seat.dataset.cidx, 10);
        this.render();
      };
    });

    // Lấy ly Size M hoặc L
    this.elView.querySelectorAll('[data-pick-size]').forEach(btn => {
      btn.onclick = () => {
        const size = btn.dataset.pickSize;
        const key = size === 'M' ? 'cupM' : 'cupL';
        if ((state.inventory[key] || 0) <= 0) {
          audio.trashFail();
          this.showToast(`Hết ly Size ${size}! Hãy nhập thêm trong kho.`);
          return;
        }
        audio.click();
        this.currentCup.size = size;
        this.showToast(`Đã lấy Ly Size ${size} đặt lên bàn!`);
        this.render();
      };
    });

    // Chọn Cốt trà
    this.elView.querySelectorAll('[data-tea]').forEach(btn => {
      btn.onclick = () => {
        if (!this.currentCup.size) {
          audio.trashFail();
          this.showToast('Hãy lấy ly (M hoặc L) trước khi rót trà!');
          return;
        }
        const teaId = btn.dataset.tea;
        if ((state.inventory[teaId] || 0) <= 0) {
          audio.trashFail();
          this.showToast('Hết cốt trà này! Hãy nhập thêm ở đầu ngày.');
          return;
        }
        audio.pour();
        this.currentCup.tea = teaId;
        this.checkAutoSealer();
        this.render();
      };
    });

    // Chọn Đường
    this.elView.querySelectorAll('[data-sugar]').forEach(btn => {
      btn.onclick = () => {
        audio.click();
        this.currentCup.sugar = btn.dataset.sugar;
        this.render();
      };
    });

    // Chọn Đá
    this.elView.querySelectorAll('[data-ice]').forEach(btn => {
      btn.onclick = () => {
        audio.addIce();
        this.currentCup.ice = btn.dataset.ice;
        this.render();
      };
    });

    // Thêm Topping
    this.elView.querySelectorAll('.topping-tray-slot').forEach(btn => {
      btn.onclick = () => {
        if (!this.currentCup.size) {
          audio.trashFail();
          this.showToast('Hãy lấy ly (M hoặc L) trước khi thêm topping!');
          return;
        }
        const tid = btn.dataset.topping;
        if ((state.inventory[tid] || 0) <= 0) {
          audio.trashFail();
          this.showToast('Hết loại topping này!');
          return;
        }

        const idx = this.currentCup.toppings.indexOf(tid);
        if (idx === -1) {
          audio.addTopping();
          this.currentCup.toppings.push(tid);
        } else {
          this.currentCup.toppings.splice(idx, 1);
        }
        this.checkAutoSealer();
        this.render();
      };
    });

    // Lắc shaker
    const btnShaker = document.getElementById('btnShaker');
    if (btnShaker) {
      btnShaker.onclick = () => {
        audio.shake();
        btnShaker.classList.add('shaking');
        setTimeout(() => btnShaker.classList.remove('shaking'), 350);
        this.showToast('Đã lắc đều ly trà!');
      };
    }

    // Dập nắp ly thủ công
    const btnSeal = document.getElementById('btnSealCup');
    if (btnSeal) {
      btnSeal.onclick = () => {
        if (!this.currentCup.size) {
          this.showToast('Chưa lấy ly!');
          return;
        }
        if (!this.currentCup.tea) {
          this.showToast('Ly chưa có trà!');
          return;
        }
        audio.sealPop();
        this.currentCup.sealed = true;
        this.showToast('Đã dập nắp ly thành công!');
        this.render();
      };
    }

    // Thùng rác (Hủy ly)
    const btnTrash = document.getElementById('btnTrash');
    if (btnTrash) {
      btnTrash.onclick = () => {
        audio.trashFail();
        this.resetCup();
        this.showToast('Đã bỏ ly làm lại!');
        this.render();
      };
    }

    // Giao món
    const btnServe = document.getElementById('btnServe');
    if (btnServe) {
      btnServe.onclick = () => this.handleServeCup();
    }

    // Lau sàn khi có nước đổ
    const btnClean = document.getElementById('btnCleanSpill');
    if (btnClean) {
      btnClean.onclick = () => {
        audio.click();
        this.spillClicks += 1;
        if (this.spillClicks >= 3) {
          audio.serveSuccess();
          this.spillActive = false;
          this.showToast('Đã lau sạch quầy!');
        }
        this.render();
      };
    }
  }

  checkAutoSealer() {
    if (state.upgrades.autoSealer && this.currentCup.size && this.currentCup.tea && this.currentCup.toppings.length > 0) {
      this.currentCup.sealed = true;
    }
  }

  handleServeCup() {
    const cust = this.customers[this.activeCustomerIdx];
    if (!cust) return;

    if (!this.currentCup.size) {
      audio.trashFail();
      this.showToast('Chưa lấy ly (Size M hoặc Size L)!');
      return;
    }

    if (!this.currentCup.tea) {
      audio.trashFail();
      this.showToast('Chưa rót trà vào ly!');
      return;
    }

    if (!this.currentCup.sealed) {
      audio.trashFail();
      this.showToast('Chưa dập nắp ly nước!');
      return;
    }

    // Trừ ly trong kho
    if (this.currentCup.size === 'M') {
      if (state.inventory.cupM > 0) state.inventory.cupM -= 1;
    } else {
      if (state.inventory.cupL > 0) state.inventory.cupL -= 1;
    }

    // Trừ nguyên liệu kho
    if (state.inventory[this.currentCup.tea] > 0) state.inventory[this.currentCup.tea] -= 1;
    this.currentCup.toppings.forEach(tid => {
      if (state.inventory[tid] > 0) state.inventory[tid] -= 1;
    });

    // So khớp đơn hàng
    let isCorrectSize = this.currentCup.size === cust.order.size;
    let isCorrectTea = this.currentCup.tea === cust.order.teaId;
    let isCorrectSugar = this.currentCup.sugar === cust.order.sugar;
    let isCorrectIce = this.currentCup.ice === cust.order.ice;
    
    // So khớp topping
    let isCorrectToppings = cust.order.toppings.every(t => this.currentCup.toppings.includes(t)) &&
                           this.currentCup.toppings.length === cust.order.toppings.length;

    const teaObj = TEAS.find(t => t.id === cust.order.teaId);
    const basePrice = teaObj ? teaObj.price : 20000;
    const toppingTotal = cust.order.toppings.reduce((sum, tid) => {
      const topObj = TOPPINGS.find(tp => tp.id === tid);
      return sum + (topObj ? topObj.price : 5000);
    }, 0);

    const sizeMultiplier = cust.order.size === 'L' ? 1.35 : 1.0;
    const fullPrice = Math.round((basePrice + toppingTotal) * sizeMultiplier);

    if (isCorrectSize && isCorrectTea && isCorrectSugar && isCorrectIce && isCorrectToppings) {
      // Đúng món hoàn hảo 100%!
      audio.serveSuccess();
      const tip = state.upgrades.lofiSpeaker ? Math.round(fullPrice * 0.25) : Math.round(fullPrice * 0.15);
      const earned = fullPrice + tip;

      state.money += earned;
      state.rating = Math.min(5.0, state.rating + 0.05);
      state.addExp(25);

      this.dailyReport.served += 1;
      this.dailyReport.revenue += earned;
      this.dailyReport.tips += tip;

      this.showToast(`Xuất sắc! +${earned.toLocaleString('vi-VN')}đ (Tip: ${tip.toLocaleString('vi-VN')}đ)`);
    } else if (isCorrectTea) {
      // Đúng trà nhưng lệch size/đường/đá
      audio.click();
      let earned = Math.round(fullPrice * 0.85);
      if (!isCorrectSize) earned = Math.round(fullPrice * 0.7);
      state.money += earned;
      state.addExp(12);

      this.dailyReport.served += 1;
      this.dailyReport.revenue += earned;

      const note = !isCorrectSize ? `Khách gọi Size ${cust.order.size} mà đưa Size ${this.currentCup.size}` : 'Hơi lệch vị đường/đá';
      this.showToast(`${note}: +${earned.toLocaleString('vi-VN')}đ`);
    } else {
      // Pha nhầm hẳn loại trà
      audio.trashFail();
      const penaltyPrice = Math.round(fullPrice * 0.5);
      state.money += penaltyPrice;
      state.rating = Math.max(1.0, state.rating - 0.1);
      this.dailyReport.mistakes += 1;
      this.dailyReport.revenue += penaltyPrice;
      this.showToast(`Khách phàn nàn sai loại trà! Chỉ trả ${penaltyPrice.toLocaleString('vi-VN')}đ`);
    }

    // Xóa khách vừa phục vụ và sinh khách mới
    this.customers.splice(this.activeCustomerIdx, 1);
    this.activeCustomerIdx = 0;
    this.resetCup();
    this.generateCustomer();
    this.render();
  }

  // ================= 4.3. KẾT THÚC NGÀY BÁN HÀNG =================
  endSellPhase() {
    clearInterval(this.sellTimer);
    audio.bell();

    const rentCost = 50000; // Tiền mặt bằng ngày
    const netProfit = this.dailyReport.revenue - rentCost;
    state.money -= rentCost;

    // Lưu vào lịch sử
    state.history.push({
      day: state.day,
      served: this.dailyReport.served,
      revenue: this.dailyReport.revenue,
      profit: netProfit
    });

    // Thêm review mới ngẫu nhiên
    if (this.dailyReport.served > 0) {
      const sample = this.dailyReport.mistakes === 0 ? SAMPLE_REVIEWS_POS : SAMPLE_REVIEWS_NEG;
      const comment = sample[Math.floor(Math.random() * sample.length)];
      const stars = this.dailyReport.mistakes === 0 ? 5 : 3;
      state.reviews.unshift({
        name: CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)],
        stars,
        comment
      });
      if (state.reviews.length > 10) state.reviews.pop();
    }

    // Modal tổng kết ngày
    const reportHtml = `
      <h2>🌙 Đóng Cửa Ngày ${state.day}</h2>
      <p style="color: #7C5B49; margin-top: 0;">Một ngày làm việc vất vả nhưng bội thu!</p>
      
      <div style="background: #FDF4E7; border-radius: 12px; padding: 12px; text-align: left; font-size: 13.5px; margin: 12px 0;">
        <div style="display: flex; justify-content: space-between; padding: 4px 0;">
          <span>Ly đã phục vụ:</span> <b>${this.dailyReport.served} ly</b>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 4px 0;">
          <span>Ly pha hỏng / sai:</span> <b style="color: #E53E3E;">${this.dailyReport.mistakes} ly</b>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 4px 0;">
          <span>Tổng doanh thu:</span> <b style="color: #48BB78;">+${this.dailyReport.revenue.toLocaleString('vi-VN')}đ</b>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 4px 0;">
          <span>Tiền mặt bằng cố định:</span> <b style="color: #E53E3E;">-${rentCost.toLocaleString('vi-VN')}đ</b>
        </div>
        <hr style="border: 0; border-top: 1px dashed #EAD2BC; margin: 8px 0;">
        <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 15px;">
          <span>Lợi nhuận ròng:</span> <b>${netProfit >= 0 ? '+' : ''}${netProfit.toLocaleString('vi-VN')}đ</b>
        </div>
      </div>

      <button id="btnNextDay" style="
        width: 100%;
        padding: 12px;
        background: #48BB78;
        color: #FFF;
        font-family: 'Paytone One', sans-serif;
        font-size: 16px;
        border-radius: 12px;
        box-shadow: 0 4px 0 #2F855A;
      ">TIẾP TỤC SANG NGÀY ${state.day + 1} ➔</button>
    `;

    this.openModal(reportHtml);

    const btnNext = document.getElementById('btnNextDay');
    if (btnNext) {
      btnNext.onclick = () => {
        state.day += 1;
        state.save();
        this.closeModal();
        this.viewMode = 'prep';
        this.render();
      };
    }

    state.save();
    this.renderTopBar();
  }
}

// Khởi chạy game khi tải xong tài liệu
window.addEventListener('DOMContentLoaded', () => {
  window.gameApp = new GameApp();
});
