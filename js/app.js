(function () {
  const roleLabels = {
    admin: "ผู้ดูแลระบบ",
    teacher: "ครูผู้ดูแล",
    cashier: "พนักงานขาย",
    member: "สมาชิก"
  };

  const state = {
    user: null,
    page: "dashboard",
    dashboard: {
      todaySales: 0,
      todayCount: 0,
      totalMembers: 0,
      totalProducts: 0,
      lowStock: 0
    }
  };

  const menus = [
    { id: "dashboard", text: "ภาพรวมร้านค้า", icon: "fa-gauge-high", roles: ["admin", "teacher", "cashier"] },
    { id: "pos", text: "ขายสินค้า", icon: "fa-cart-shopping", roles: ["admin", "teacher", "cashier"] },
    { id: "products", text: "จัดการสินค้า", icon: "fa-boxes-stacked", roles: ["admin", "teacher"] },
    { id: "stock", text: "รับสินค้าเข้าสต็อก", icon: "fa-box-open", roles: ["admin", "teacher"] },
    { id: "members", text: "จัดการสมาชิก", icon: "fa-users", roles: ["admin", "teacher"] },
    { id: "dividends", text: "ปันผลเฉลี่ยคืนสมาชิก", icon: "fa-coins", roles: ["admin", "teacher"] },
    { id: "reports", text: "รายงานยอดขาย", icon: "fa-chart-line", roles: ["admin", "teacher"] },
    { id: "users", text: "จัดการผู้ใช้งาน", icon: "fa-user-shield", roles: ["admin"] },
    { id: "settings", text: "ตั้งค่าระบบ", icon: "fa-gear", roles: ["admin"] }
  ];

  const quickLinks = [
    { id: "pos", icon: "fa-cart-shopping", title: "ขายสินค้า", note: "ระบบขายแบบเร็ว", color: "quick-card--blue", roles: ["admin", "teacher", "cashier"] },
    { id: "products", icon: "fa-boxes-stacked", title: "จัดการสินค้า", note: "เพิ่ม/แก้ไข/ลบ", color: "quick-card--yellow", roles: ["admin", "teacher"] },
    { id: "stock", icon: "fa-box-open", title: "รับสินค้า", note: "เพิ่มสินค้าเข้าสต็อก", color: "quick-card--teal", roles: ["admin", "teacher"] },
    { id: "members", icon: "fa-users", title: "จัดการสมาชิก", note: "ข้อมูลสมาชิก", color: "quick-card--pink", roles: ["admin", "teacher"] },
    { id: "dividends", icon: "fa-coins", title: "ปันผล", note: "คำนวณเฉลี่ยคืน", color: "quick-card--teal", roles: ["admin", "teacher"] },
    { id: "reports", icon: "fa-chart-line", title: "รายงาน", note: "สถิติการขาย", color: "quick-card--orange", roles: ["admin", "teacher"] },
    { id: "users", icon: "fa-user-shield", title: "จัดการผู้ใช้", note: "สิทธิ์เข้าใช้งาน", color: "quick-card--indigo", roles: ["admin"] },
    { id: "settings", icon: "fa-gear", title: "ตั้งค่า", note: "ตั้งค่าระบบ", color: "quick-card--slate", roles: ["admin"] }
  ];

  const pageDetails = {
    dashboard: { title: "ภาพรวมร้านค้า", icon: "fa-gauge-high", note: "หน้า Dashboard โครงเปล่าตาม UI เดิม" },
    pos: { title: "ขายสินค้า", icon: "fa-cart-shopping", note: "ชุดที่ 1 ยังไม่ทำระบบ POS จริง" },
    products: { title: "จัดการสินค้า", icon: "fa-boxes-stacked", note: "เตรียมพื้นที่สำหรับจัดการข้อมูลสินค้า" },
    stock: { title: "รับสินค้าเข้าสต็อก", icon: "fa-box-open", note: "เตรียมพื้นที่สำหรับรับสินค้าเข้า" },
    members: { title: "จัดการสมาชิก", icon: "fa-users", note: "เตรียมพื้นที่สำหรับสมาชิกสหกรณ์" },
    dividends: { title: "ปันผลเฉลี่ยคืนสมาชิก", icon: "fa-coins", note: "เตรียมพื้นที่สำหรับคำนวณปันผล" },
    reports: { title: "รายงานยอดขาย", icon: "fa-chart-line", note: "เตรียมพื้นที่สำหรับรายงานยอดขาย" },
    users: { title: "จัดการผู้ใช้งาน", icon: "fa-user-shield", note: "เตรียมพื้นที่สำหรับกำหนดผู้ใช้และสิทธิ์" },
    settings: { title: "ตั้งค่าระบบ", icon: "fa-gear", note: "เตรียมพื้นที่สำหรับตั้งค่าระบบ" },
    member: { title: "พื้นที่สมาชิก", icon: "fa-id-card", note: "เตรียมไว้สำหรับสิทธิ์สมาชิกในอนาคต" }
  };

  const els = {};

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    cacheElements();
    bindEvents();
    window.initializeFirebaseApp();

    const currentUser = window.authService.getCurrentUser();
    document.getElementById("loading").classList.add("hidden");

    if (currentUser) {
      showApp(currentUser);
      return;
    }

    els.loginPage.classList.remove("hidden");
  }

  function cacheElements() {
    els.loginPage = document.getElementById("loginPage");
    els.loginForm = document.getElementById("loginForm");
    els.loginBtn = document.getElementById("loginBtn");
    els.loginMessage = document.getElementById("loginMessage");
    els.app = document.getElementById("app");
    els.sidebar = document.getElementById("sidebar");
    els.sidebarBackdrop = document.getElementById("sidebarBackdrop");
    els.menu = document.getElementById("menu");
    els.page = document.getElementById("page");
    els.breadcrumb = document.getElementById("breadcrumb");
    els.sideSales = document.getElementById("sideSales");
    els.sideCount = document.getElementById("sideCount");
    els.topName = document.getElementById("topName");
    els.topRole = document.getElementById("topRole");
  }

  function bindEvents() {
    els.loginForm.addEventListener("submit", handleLogin);
    document.getElementById("logoutBtn").addEventListener("click", logout);
    document.getElementById("openSidebarBtn").addEventListener("click", openSidebar);
    document.getElementById("closeSidebarBtn").addEventListener("click", closeSidebar);
    els.sidebarBackdrop.addEventListener("click", closeSidebar);
  }

  async function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!username || !password) {
      showLoginMessage("กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน");
      return;
    }

    setLoginLoading(true);
    showLoginMessage("");

    const result = await window.authService.login(username, password);
    setLoginLoading(false);

    if (!result.success) {
      showLoginMessage(result.message);
      return;
    }

    showApp(result.data);
  }

  function setLoginLoading(isLoading) {
    els.loginBtn.disabled = isLoading;
    els.loginBtn.innerHTML = isLoading
      ? '<i class="fa-solid fa-spinner fa-spin"></i><span>กำลังเข้าสู่ระบบ...</span>'
      : '<i class="fa-solid fa-right-to-bracket"></i><span>เข้าสู่ระบบ</span>';
  }

  function showLoginMessage(message) {
    els.loginMessage.textContent = message;
  }

  function showApp(user) {
    state.user = user;
    state.page = user.role === "member" ? "member" : "dashboard";

    els.loginPage.classList.add("hidden");
    els.app.classList.remove("hidden");

    updateUserSummary();
    updateMiniStats();
    renderMenu();
    renderPage(state.page);
  }

  function updateUserSummary() {
    els.topName.textContent = state.user.name || state.user.username;
    els.topRole.textContent = roleLabels[state.user.role] || state.user.role;
  }

  function updateMiniStats() {
    els.sideSales.textContent = money(state.dashboard.todaySales);
    els.sideCount.textContent = state.dashboard.todayCount;
  }

  function renderMenu() {
    const visibleMenus = menus.filter((menu) => menu.roles.includes(state.user.role));

    if (!visibleMenus.length) {
      els.menu.innerHTML = '<p class="role-note">สิทธิ์สมาชิกเตรียมไว้สำหรับการพัฒนาชุดถัดไป</p>';
      return;
    }

    els.menu.innerHTML = visibleMenus.map((menu) => `
      <button class="menu__item ${state.page === menu.id ? "active" : ""}" type="button" data-page="${menu.id}">
        <i class="fa-solid ${menu.icon}"></i>
        <span>${menu.text}</span>
      </button>
    `).join("");

    els.menu.querySelectorAll(".menu__item").forEach((button) => {
      button.addEventListener("click", () => {
        renderPage(button.dataset.page);
        closeSidebar();
      });
    });
  }

  function renderPage(pageId) {
    state.page = pageId;
    renderMenu();
    renderBreadcrumb(pageId);

    if (pageId === "dashboard") {
      renderDashboard();
      return;
    }

    renderPlaceholder(pageId);
  }

  function renderBreadcrumb(pageId) {
    const detail = pageDetails[pageId] || pageDetails.dashboard;
    els.breadcrumb.innerHTML = `
      <i class="fa-solid fa-house"></i>
      หน้าหลัก
      <i class="fa-solid fa-chevron-right breadcrumb__chevron"></i>
      ${detail.title}
    `;
  }

  function renderDashboard() {
    const role = state.user.role;
    const links = quickLinks.filter((link) => link.roles.includes(role));

    els.page.innerHTML = `
      <div class="card page-panel">
        ${pageTitle("fa-gauge-high", "ภาพรวมร้านค้า")}
        <div class="quick-grid">
          ${links.map((link) => quickCard(link)).join("")}
        </div>
        <div class="stats-grid">
          ${statCard("ยอดขายวันนี้", money(state.dashboard.todaySales), `${state.dashboard.todayCount} รายการ`, "fa-calendar", "color-blue")}
          ${statCard("สมาชิกทั้งหมด", state.dashboard.totalMembers, "สมาชิกที่ลงทะเบียน", "fa-users", "color-green")}
          ${statCard("สินค้าทั้งหมด", state.dashboard.totalProducts, "รายการสินค้า", "fa-box", "color-purple")}
          ${statCard("สินค้าใกล้หมด", state.dashboard.lowStock, "รายการ", "fa-triangle-exclamation", "color-yellow")}
        </div>
        <div class="dashboard-columns">
          <div class="card placeholder-card">
            <h3>การขายล่าสุด</h3>
            <div class="empty-state">
              <div>
                <i class="fa-solid fa-receipt"></i>
                <p>ยังไม่มีรายการขายในชุดที่ 1</p>
              </div>
            </div>
          </div>
          <div class="card placeholder-card">
            <h3>ยอดขาย 7 วันล่าสุด</h3>
            <div class="empty-state">
              <div>
                <i class="fa-solid fa-chart-line"></i>
                <p>รอเชื่อมข้อมูล Firebase ในชุดถัดไป</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    els.page.querySelectorAll("[data-page]").forEach((button) => {
      button.addEventListener("click", () => renderPage(button.dataset.page));
    });
  }

  function renderPlaceholder(pageId) {
    const detail = pageDetails[pageId] || pageDetails.dashboard;
    els.page.innerHTML = `
      <div class="card page-panel module-placeholder">
        ${pageTitle(detail.icon, detail.title)}
        <div class="module-placeholder__body">
          <div>
            <i class="fa-solid ${detail.icon}"></i>
            <h2>${detail.title}</h2>
            <p>${detail.note}</p>
          </div>
        </div>
      </div>
    `;
  }

  function pageTitle(icon, title) {
    return `
      <div class="page-title">
        <h1><i class="fa-solid ${icon}"></i>${title}</h1>
      </div>
    `;
  }

  function quickCard(link) {
    return `
      <button class="quick-card ${link.color}" type="button" data-page="${link.id}">
        <span>
          <i class="fa-solid ${link.icon}"></i>
          <h3>${link.title}</h3>
          <p>${link.note}</p>
        </span>
      </button>
    `;
  }

  function statCard(title, value, subtitle, icon, colorClass) {
    return `
      <div class="card stat-card">
        <div class="stat-card__top">
          <div>
            <h3>${title}</h3>
            <strong>${value}</strong>
            <p>${subtitle}</p>
          </div>
          <i class="fa-solid ${icon} ${colorClass}"></i>
        </div>
      </div>
    `;
  }

  function openSidebar() {
    els.sidebar.classList.add("open");
    els.sidebarBackdrop.classList.remove("hidden");
  }

  function closeSidebar() {
    els.sidebar.classList.remove("open");
    els.sidebarBackdrop.classList.add("hidden");
  }

  function logout() {
    window.authService.logout();
    state.user = null;
    state.page = "dashboard";
    els.app.classList.add("hidden");
    els.loginPage.classList.remove("hidden");
    els.page.innerHTML = "";
    els.menu.innerHTML = "";
    closeSidebar();
    document.getElementById("loginUsername").value = "admin";
    document.getElementById("loginPassword").value = "123456";
    showLoginMessage("");
  }

  function money(value) {
    return `฿${Number(value || 0).toLocaleString("th-TH", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })}`;
  }
})();
