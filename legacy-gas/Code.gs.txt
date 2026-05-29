/**
 * ระบบร้านค้าสหกรณ์โรงเรียน Google Apps Script Web App
 * ไฟล์: Code.gs
 * วิธีใช้: สร้าง Google Sheet ใหม่ > คัดลอก Sheet ID มาใส่ SHEET_ID > สร้างไฟล์ Index.html > Deploy เป็น Web app
 */

const SHEET_ID = '1hohdlL8dfmWteVJwxGXxTl2OPBP2o4Jv5IXPfcn8_eA';
const FOLDER_ID = '18588e6Aq6zZN9auooqP9XFnf34qIq5UK'; // ใช้กรณีอัปโหลดรูปสินค้า/QR พร้อมเพย์

const SHEETS = {
  USERS: 'Users',
  PRODUCTS: 'Products',
  MEMBERS: 'Members',
  SALES: 'Sales',
  SALE_ITEMS: 'SaleItems',
  SETTINGS: 'Settings',
  DIVIDENDS: 'Dividends',
  DIVIDEND_ITEMS: 'DividendItems'
};

const HEADERS = {
  Users: ['userId','name','username','password','role','status','lastLogin','createdAt'],
  Products: ['productId','productName','category','price','cost','stock','unit','barcode','imageUrl','description','status','createdAt','updatedAt'],
  Members: ['memberId','fullName','studentCode','classroom','shares','sharePrice','phone','joinedDate','status','note'],
  Sales: ['saleId','receiptNo','saleDate','memberId','customerName','totalAmount','totalCost','profit','paymentMethod','seller','createdAt'],
  SaleItems: ['itemId','saleId','productId','productName','quantity','price','cost','subtotal'],
  Settings: ['key','value'],
  Dividends: ['dividendId','roundName','academicYear','semester','startDate','endDate','totalSales','totalCost','netProfit','totalShares','dividendPerShare','rebateRate','calculationType','status','createdBy','createdAt'],
  DividendItems: ['itemId','dividendId','memberId','memberName','classroom','shares','shareValue','purchaseTotal','purchaseCount','shareDividend','purchaseRebate','totalDividend','paymentStatus','paidDate','paidBy','note']
};

function doGet() {
  ensureSetup();
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('ระบบร้านค้าสหกรณ์โรงเรียน')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function ss_() {
  if (!SHEET_ID || SHEET_ID === 'ใส่ Sheet ID ที่นี่') {
    throw new Error('กรุณาใส่ SHEET_ID ในไฟล์ Code.gs ก่อนใช้งาน');
  }
  return SpreadsheetApp.openById(SHEET_ID);
}

function getSheet_(name) {
  const ss = ss_();
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  const headers = HEADERS[name] || [];
  if (headers.length && sh.getLastRow() === 0) sh.appendRow(headers);
  const current = sh.getRange(1,1,1,Math.max(headers.length, sh.getLastColumn())).getValues()[0];
  if (headers.length && current.join('|') !== headers.join('|')) {
    sh.clear();
    sh.appendRow(headers);
  }
  return sh;
}

function ensureSetup() {
  Object.keys(HEADERS).forEach(getSheet_);
  seedDefaults_();
  return { ok: true };
}

function seedDefaults_() {
  const users = readTable_(SHEETS.USERS);
  if (users.length === 0) {
    appendRow_(SHEETS.USERS, {
      userId: makeId_('U'), name: 'ผู้ดูแลระบบ', username: 'admin', password: '123456', role: 'admin', status: 'active', lastLogin: '', createdAt: now_()
    });
    appendRow_(SHEETS.USERS, {
      userId: makeId_('U'), name: 'ครูผู้ดูแล', username: 'teacher', password: '123456', role: 'teacher', status: 'active', lastLogin: '', createdAt: now_()
    });
    appendRow_(SHEETS.USERS, {
      userId: makeId_('U'), name: 'พนักงานขาย', username: 'cashier', password: '123456', role: 'cashier', status: 'active', lastLogin: '', createdAt: now_()
    });
  }
  const settings = readTable_(SHEETS.SETTINGS);
  if (settings.length === 0) {
    const defaults = {
      shopName: 'ระบบร้านค้าสหกรณ์โรงเรียน',
      sharePrice: '10',
      barcodePrefix: 'SCH',
      receiptFooter: 'ขอบคุณที่ใช้บริการร้านค้าสหกรณ์',
      driveFolderId: FOLDER_ID,
      promptPayNumber: '0833642566',
      promptPayName: 'ร้านค้าสหกรณ์โรงเรียน',
      promptPayQr: ''
    };
    Object.keys(defaults).forEach(k => appendRow_(SHEETS.SETTINGS, { key: k, value: defaults[k] }));
  }
}

function readTable_(sheetName) {
  const sh = getSheet_(sheetName);
  const values = sh.getDataRange().getValues();
  if (values.length <= 1) return [];
  const headers = values[0];
  const tz = Session.getScriptTimeZone();
  return values.slice(1).filter(r => r.some(c => c !== '')).map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      const v = row[i];
      // Google Sheets คืน Date object สำหรับ cell ที่เป็นวันที่ — แปลงเป็น string
      if (v instanceof Date) {
        obj[h] = Utilities.formatDate(v, tz, 'yyyy-MM-dd HH:mm:ss');
      } else {
        obj[h] = v;
      }
    });
    return obj;
  });
}

function writeTable_(sheetName, rows) {
  const sh = getSheet_(sheetName);
  const headers = HEADERS[sheetName];
  sh.clearContents();
  sh.appendRow(headers);
  if (rows.length) {
    const data = rows.map(r => headers.map(h => r[h] !== undefined ? r[h] : ''));
    sh.getRange(2,1,data.length,headers.length).setValues(data);
  }
}

function appendRow_(sheetName, obj) {
  const sh = getSheet_(sheetName);
  const headers = HEADERS[sheetName];
  sh.appendRow(headers.map(h => obj[h] !== undefined ? obj[h] : ''));
}

function makeId_(prefix) {
  return prefix + Utilities.getUuid().slice(0,8).toUpperCase();
}

function now_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
}

function toNum_(v) {
  const n = Number(v || 0);
  return isNaN(n) ? 0 : n;
}

function ok_(data) { return { success: true, data }; }
function fail_(message) { return { success: false, message }; }

function login(username, password) {
  ensureSetup();
  const users = readTable_(SHEETS.USERS);
  const user = users.find(u => String(u.username) === String(username) && String(u.password) === String(password));
  if (!user) return fail_('Username หรือ Password ไม่ถูกต้อง');
  if (user.status !== 'active') return fail_('ผู้ใช้งานนี้ถูกปิดใช้งาน');
  user.lastLogin = now_();
  writeTable_(SHEETS.USERS, users);
  delete user.password;
  return ok_(user);
}


/**
 * API Login แบบคืนค่าเป็นข้อความ JSON เพื่อเลี่ยงปัญหา google.script.run ได้ค่า undefined
 * ใช้คู่กับ Index.html เวอร์ชันแก้ไข
 */
function apiLogin(username, password) {
  try {
    const result = login(username, password);
    return JSON.stringify(result || fail_('ไม่พบการตอบกลับจากระบบ'));
  } catch (err) {
    return JSON.stringify(fail_(err && err.message ? err.message : String(err)));
  }
}

function getSettings_() {
  const rows = readTable_(SHEETS.SETTINGS);
  const obj = {};
  rows.forEach(r => obj[r.key] = r.value);
  return obj;
}

function saveSettings(settings) {
  const rows = Object.keys(settings).map(k => ({ key: k, value: settings[k] }));
  writeTable_(SHEETS.SETTINGS, rows);
  return ok_(getSettings_());
}

/**
 * ตรวจสอบสิทธิ์: admin เท่านั้น
 */
function requireAdmin_(role) {
  if (role !== 'admin') return fail_('คุณไม่มีสิทธิ์ดำเนินการนี้ (ต้องการสิทธิ์ admin)');
  return null;
}

/**
 * ตรวจสอบสิทธิ์: admin หรือ teacher
 */
function requireTeacherOrAdmin_(role) {
  if (role !== 'admin' && role !== 'teacher') return fail_('คุณไม่มีสิทธิ์ดำเนินการนี้ (ต้องการสิทธิ์ teacher หรือ admin)');
  return null;
}

function saveProduct(product, callerRole) {
  const denied = requireTeacherOrAdmin_(callerRole || 'cashier');
  if (denied) return denied;
  const rows = readTable_(SHEETS.PRODUCTS);
  const now = now_();
  if (product.productId) {
    const idx = rows.findIndex(p => p.productId === product.productId);
    if (idx < 0) return fail_('ไม่พบสินค้า');
    rows[idx] = { ...rows[idx], ...product, updatedAt: now };
  } else {
    product.productId = makeId_('P');
    product.createdAt = now;
    product.updatedAt = now;
    if (!product.barcode) product.barcode = (getSettings_().barcodePrefix || 'SCH') + Date.now().toString().slice(-8);
    rows.push(product);
  }
  writeTable_(SHEETS.PRODUCTS, rows);
  return ok_(rows);
}

function deleteProduct(productId, callerRole) {
  const denied = requireTeacherOrAdmin_(callerRole || 'cashier');
  if (denied) return denied;
  const rows = readTable_(SHEETS.PRODUCTS).filter(p => p.productId !== productId);
  writeTable_(SHEETS.PRODUCTS, rows);
  return ok_(rows);
}

function saveMember(member, callerRole) {
  const denied = requireTeacherOrAdmin_(callerRole || 'cashier');
  if (denied) return denied;
  const rows = readTable_(SHEETS.MEMBERS);
  const settings = getSettings_();
  if (!member.sharePrice) member.sharePrice = settings.sharePrice || 20;
  if (member.memberId) {
    const idx = rows.findIndex(m => m.memberId === member.memberId);
    if (idx < 0) return fail_('ไม่พบสมาชิก');
    rows[idx] = { ...rows[idx], ...member };
  } else {
    member.memberId = makeId_('M');
    if (!member.joinedDate) member.joinedDate = now_().slice(0,10);
    if (!member.status) member.status = 'active';
    rows.push(member);
  }
  writeTable_(SHEETS.MEMBERS, rows);
  return ok_(rows);
}

function deleteMember(memberId, callerRole) {
  const denied = requireTeacherOrAdmin_(callerRole || 'cashier');
  if (denied) return denied;
  const rows = readTable_(SHEETS.MEMBERS).filter(m => m.memberId !== memberId);
  writeTable_(SHEETS.MEMBERS, rows);
  return ok_(rows);
}

function saveUser(user, callerRole) {
  const denied = requireAdmin_(callerRole || 'cashier');
  if (denied) return denied;
  const rows = readTable_(SHEETS.USERS);
  if (user.userId) {
    const idx = rows.findIndex(u => u.userId === user.userId);
    if (idx < 0) return fail_('ไม่พบผู้ใช้งาน');
    if (!user.password) user.password = rows[idx].password;
    rows[idx] = { ...rows[idx], ...user };
  } else {
    if (rows.some(u => u.username === user.username)) return fail_('Username นี้ถูกใช้แล้ว');
    user.userId = makeId_('U');
    user.createdAt = now_();
    user.lastLogin = '';
    if (!user.status) user.status = 'active';
    rows.push(user);
  }
  writeTable_(SHEETS.USERS, rows);
  return ok_(rows.map(u => ({...u, password: ''})));
}

function deleteUser(userId, callerRole) {
  const denied = requireAdmin_(callerRole || 'cashier');
  if (denied) return denied;
  const rows = readTable_(SHEETS.USERS);
  const target = rows.find(u => u.userId === userId);
  if (target && target.username === 'admin') return fail_('ห้ามลบ Admin หลัก');
  const next = rows.filter(u => u.userId !== userId);
  writeTable_(SHEETS.USERS, next);
  return ok_(next.map(u => ({...u, password: ''})));
}

function memberLoginCode_(member) {
  return String(member.studentCode || member.memberId || '').trim();
}

function createMemberLoginUsers(callerRole) {
  const denied = requireAdmin_(callerRole || 'cashier');
  if (denied) return denied;

  const users = readTable_(SHEETS.USERS);
  const members = readTable_(SHEETS.MEMBERS);
  const protectedRoles = ['admin', 'teacher', 'cashier'];
  const now = now_();
  let created = 0;
  let updated = 0;
  const skipped = [];

  members.forEach((member, idx) => {
    const code = memberLoginCode_(member);
    if (!code) {
      skipped.push({ row: idx + 2, name: member.fullName || '', reason: 'ไม่มีรหัสนักเรียน/รหัสสมาชิก' });
      return;
    }

    const existing = users.find(u => String(u.username || '').trim() === code);
    if (existing) {
      if (protectedRoles.includes(existing.role)) {
        skipped.push({ row: idx + 2, name: member.fullName || '', code, reason: 'รหัสนี้ถูกใช้โดยบัญชีผู้ดูแล/ครู/แคชเชียร์ จึงไม่แก้ไข' });
        return;
      }
      existing.name = member.fullName || existing.name || code;
      existing.password = code;
      existing.role = 'member';
      existing.status = member.status === 'inactive' ? 'inactive' : 'active';
      updated++;
      return;
    }

    users.push({
      userId: makeId_('U'),
      name: member.fullName || code,
      username: code,
      password: code,
      role: 'member',
      status: member.status === 'inactive' ? 'inactive' : 'active',
      lastLogin: '',
      createdAt: now
    });
    created++;
  });

  writeTable_(SHEETS.USERS, users);
  return ok_({
    created,
    updated,
    skipped,
    users: users.map(u => ({...u, password: ''}))
  });
}

function recordSale(payload) {
  const products = readTable_(SHEETS.PRODUCTS);
  const items = payload.items || [];
  if (!items.length) return fail_('ยังไม่มีสินค้าในตะกร้า');
  let totalAmount = 0, totalCost = 0;
  items.forEach(it => {
    const p = products.find(x => x.productId === it.productId);
    if (!p) throw new Error('ไม่พบสินค้า: ' + it.productName);
    if (toNum_(p.stock) < toNum_(it.quantity)) throw new Error('สินค้าไม่พอขาย: ' + p.productName);
    totalAmount += toNum_(it.price) * toNum_(it.quantity);
    totalCost += toNum_(p.cost) * toNum_(it.quantity);
  });
  const saleId = makeId_('S');
  const receiptNo = 'RC' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMddHHmmss');
  const saleDate = now_();
  appendRow_(SHEETS.SALES, {
    saleId, receiptNo, saleDate,
    memberId: payload.memberId || '',
    customerName: payload.customerName || 'ลูกค้าทั่วไป',
    totalAmount, totalCost, profit: totalAmount-totalCost,
    paymentMethod: payload.paymentMethod || 'เงินสด',
    seller: payload.seller || '',
    createdAt: saleDate
  });
  items.forEach(it => {
    const p = products.find(x => x.productId === it.productId);
    p.stock = toNum_(p.stock) - toNum_(it.quantity);
    appendRow_(SHEETS.SALE_ITEMS, {
      itemId: makeId_('I'), saleId, productId: it.productId, productName: it.productName,
      quantity: it.quantity, price: it.price, cost: p.cost, subtotal: toNum_(it.price)*toNum_(it.quantity)
    });
  });
  writeTable_(SHEETS.PRODUCTS, products);
  const sales = readTable_(SHEETS.SALES);
  const saleItems = readTable_(SHEETS.SALE_ITEMS);
  const members = readTable_(SHEETS.MEMBERS);
  return ok_({ saleId, receiptNo, saleDate, totalAmount, totalCost, profit: totalAmount-totalCost, products, dashboard: getDashboardDataFast_(products, members, sales) });
}

function normalizeDate_(raw) {
  if (!raw) return '';
  if (raw instanceof Date) {
    return Utilities.formatDate(raw, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
  }
  return String(raw);
}

function normalizeDateKey_(raw) {
  return normalizeDate_(raw).slice(0,10);
}

function getSalesReport(filter) {
  const sales = readTable_(SHEETS.SALES);
  const items = readTable_(SHEETS.SALE_ITEMS);
  let start = filter && filter.startDate ? String(filter.startDate).slice(0,10) : '';
  let end = filter && filter.endDate ? String(filter.endDate).slice(0,10) : '';
  // normalize saleDate ก่อน filter (Sheets อาจคืน Date object แทน string)
  const normalizedSales = sales.map(s => ({
    ...s,
    saleDate: normalizeDate_(s.saleDate)
  }));
  const filtered = normalizedSales.filter(s => {
    const d = String(s.saleDate).slice(0,10);
    return (!start || d >= start) && (!end || d <= end);
  });
  const totalSales = filtered.reduce((a,s)=>a+toNum_(s.totalAmount),0);
  const totalCost = filtered.reduce((a,s)=>a+toNum_(s.totalCost),0);
  return ok_({
    rows: filtered,
    items,
    summary: { totalSales, totalCost, profit: totalSales-totalCost, count: filtered.length }
  });
}

function calculateDividend(filter) {
  const members = readTable_(SHEETS.MEMBERS);
  const sales = readTable_(SHEETS.SALES);
  const start = filter.startDate || '';
  const end = filter.endDate || '';
  const dividendRate = toNum_(filter.dividendRate) / 100;
  const rebateRate = toNum_(filter.rebateRate) / 100;
  const calculationType = filter.calculationType || 'both';
  const filteredSales = sales.filter(s => {
    const d = String(s.saleDate).slice(0,10);
    return (!start || d >= start) && (!end || d <= end);
  });
  const totalSales = filteredSales.reduce((a,s)=>a+toNum_(s.totalAmount),0);
  const totalCost = filteredSales.reduce((a,s)=>a+toNum_(s.totalCost),0);
  const netProfit = totalSales - totalCost;
  const totalShares = members.reduce((a,m)=>a+toNum_(m.shares),0);
  const totalShareValue = members.reduce((a,m)=>a+(toNum_(m.shares)*toNum_(m.sharePrice || getSettings_().sharePrice || 10)),0);
  const dividendPerShare = dividendRate;
  if ((calculationType === 'shares' || calculationType === 'both') && totalShareValue <= 0) return fail_('มูลค่าหุ้นทั้งหมดเป็น 0 ไม่สามารถคำนวณปันผลจากหุ้นได้');
  if (netProfit < 0) return fail_('รอบนี้ไม่มีกำไรสุทธิ ไม่สามารถปันผลได้');
  const rows = members.map(m => {
    const memberSales = filteredSales.filter(s => s.memberId === m.memberId || s.customerName === m.fullName);
    const purchaseTotal = memberSales.reduce((a,s)=>a+toNum_(s.totalAmount),0);
    const shares = toNum_(m.shares);
    const shareValue = shares * toNum_(m.sharePrice || getSettings_().sharePrice || 10);
    const shareDividend = (calculationType === 'shares' || calculationType === 'both') ? shareValue * dividendRate : 0;
    const purchaseRebate = (calculationType === 'purchase' || calculationType === 'both') ? purchaseTotal * rebateRate : 0;
    const totalDividend = shareDividend + purchaseRebate;
    return {
      memberId: m.memberId, memberName: m.fullName, classroom: m.classroom, shares, shareValue,
      purchaseTotal, purchaseCount: memberSales.length, shareDividend, purchaseRebate, totalDividend, paymentStatus: 'รอจ่าย'
    };
  }).filter(r => r.shares > 0 || r.purchaseTotal > 0);
  return ok_({ summary: { totalSales, totalCost, netProfit, totalShares, totalShareValue, dividendPerShare, dividendRate: dividendRate*100, rebateRate: rebateRate*100 }, rows });
}

function findMemberForUser_(username, userName) {
  const members = readTable_(SHEETS.MEMBERS);
  const keys = [username, userName].filter(v => v !== undefined && v !== null && String(v).trim() !== '').map(v => String(v).trim());
  if (!keys.length) return null;
  return members.find(m => keys.some(k =>
    String(m.memberId || '').trim() === k ||
    String(m.studentCode || '').trim() === k ||
    String(m.fullName || '').trim() === k ||
    String(m.phone || '').trim() === k
  )) || null;
}

function getMemberPortalData_(username, userName, filter) {
  const member = findMemberForUser_(username, userName);
  if (!member) return fail_('ไม่พบข้อมูลสมาชิกของผู้ใช้งานนี้ กรุณาตรวจสอบว่า Username ตรงกับรหัสนักเรียน/รหัสสมาชิก/ชื่อ/เบอร์โทร ในชีต Members');

  filter = filter || {};
  const sales = readTable_(SHEETS.SALES);
  const saleItems = readTable_(SHEETS.SALE_ITEMS);
  const allMembers = readTable_(SHEETS.MEMBERS);
  const start = filter.startDate ? String(filter.startDate).slice(0,10) : '';
  const end = filter.endDate ? String(filter.endDate).slice(0,10) : '';
  const dividendRate = toNum_(filter.dividendRate || 0) / 100;
  const rebateRate = toNum_(filter.rebateRate || 5) / 100;

  const filteredSales = sales.map(s => ({ ...s, saleDate: normalizeDate_(s.saleDate) })).filter(s => {
    const d = String(s.saleDate).slice(0,10);
    return (!start || d >= start) && (!end || d <= end);
  });
  const memberSales = filteredSales.filter(s =>
    String(s.memberId || '') === String(member.memberId || '') ||
    String(s.customerName || '') === String(member.fullName || '')
  );
  const memberSaleIds = memberSales.map(s => String(s.saleId || ''));
  const memberSaleItems = saleItems.filter(i => memberSaleIds.includes(String(i.saleId || '')));

  const totalSales = filteredSales.reduce((a,s)=>a+toNum_(s.totalAmount),0);
  const totalCost = filteredSales.reduce((a,s)=>a+toNum_(s.totalCost),0);
  const netProfit = totalSales - totalCost;
  const totalShares = allMembers.reduce((a,m)=>a+toNum_(m.shares),0);
  const totalShareValue = allMembers.reduce((a,m)=>a+(toNum_(m.shares)*toNum_(m.sharePrice || getSettings_().sharePrice || 10)),0);
  const dividendPerShare = dividendRate;
  const shares = toNum_(member.shares);
  const sharePrice = toNum_(member.sharePrice || getSettings_().sharePrice || 20);
  const purchaseTotal = memberSales.reduce((a,s)=>a+toNum_(s.totalAmount),0);
  const shareDividend = (shares * sharePrice) * dividendRate;
  const purchaseRebate = purchaseTotal * rebateRate;

  const savedDividendItems = readTable_(SHEETS.DIVIDEND_ITEMS)
    .filter(r => String(r.memberId || '') === String(member.memberId || '') || String(r.memberName || '') === String(member.fullName || ''))
    .reverse();

  return ok_({
    member,
    purchases: {
      rows: memberSales.slice().reverse(),
      totalAmount: purchaseTotal,
      count: memberSales.length,
      quantity: memberSaleItems.reduce((a,i)=>a+toNum_(i.quantity),0),
      items: memberSaleItems
    },
    estimate: {
      shares,
      sharePrice,
      shareValue: shares * sharePrice,
      totalSales,
      totalCost,
      netProfit,
      totalShares,
      totalShareValue,
      dividendPerShare,
      dividendRate: dividendRate * 100,
      rebateRate: rebateRate * 100,
      shareDividend,
      purchaseRebate,
      totalDividend: shareDividend + purchaseRebate,
      message: ''
    },
    savedDividends: savedDividendItems
  });
}

function saveDividendRound(payload, callerRole) {
  const denied = requireTeacherOrAdmin_(callerRole || 'cashier');
  if (denied) return denied;
  const calc = calculateDividend(payload.filter);
  if (!calc.success) return calc;
  const summary = calc.data.summary;
  const dividendId = makeId_('D');
  appendRow_(SHEETS.DIVIDENDS, {
    dividendId,
    roundName: payload.roundName || ('รอบปันผล ' + now_()),
    academicYear: payload.filter.academicYear || '', semester: payload.filter.semester || '',
    startDate: payload.filter.startDate || '', endDate: payload.filter.endDate || '',
    totalSales: summary.totalSales, totalCost: summary.totalCost, netProfit: summary.netProfit,
    totalShares: summary.totalShares, dividendPerShare: summary.dividendPerShare,
    rebateRate: summary.rebateRate, calculationType: payload.filter.calculationType || 'both',
    status: 'บันทึกแล้ว', createdBy: payload.createdBy || '', createdAt: now_()
  });
  calc.data.rows.forEach(r => appendRow_(SHEETS.DIVIDEND_ITEMS, {
    itemId: makeId_('DI'), dividendId, memberId: r.memberId, memberName: r.memberName, classroom: r.classroom,
    shares: r.shares, shareValue: r.shareValue, purchaseTotal: r.purchaseTotal, purchaseCount: r.purchaseCount,
    shareDividend: r.shareDividend, purchaseRebate: r.purchaseRebate, totalDividend: r.totalDividend,
    paymentStatus: 'รอจ่าย', paidDate: '', paidBy: '', note: ''
  }));
  return ok_({ dividendId, summary, rows: calc.data.rows });
}

function getDividendItems(dividendId) {
  return ok_(readTable_(SHEETS.DIVIDEND_ITEMS).filter(r => r.dividendId === dividendId));
}

function markDividendPaid(itemId, paidBy, callerRole) {
  const denied = requireTeacherOrAdmin_(callerRole || 'cashier');
  if (denied) return denied;
  const rows = readTable_(SHEETS.DIVIDEND_ITEMS);
  const idx = rows.findIndex(r => r.itemId === itemId);
  if (idx < 0) return fail_('ไม่พบรายการปันผล');
  rows[idx].paymentStatus = 'จ่ายแล้ว';
  rows[idx].paidDate = now_();
  rows[idx].paidBy = paidBy || '';
  writeTable_(SHEETS.DIVIDEND_ITEMS, rows);
  return ok_(rows[idx]);
}

function uploadBase64File(base64, filename, mimeType) {
  if (!FOLDER_ID || FOLDER_ID === 'ใส่ Folder ID ที่นี่') return fail_('กรุณาใส่ FOLDER_ID ก่อนอัปโหลดไฟล์');
  const bytes = Utilities.base64Decode(base64.split(',').pop());
  const blob = Utilities.newBlob(bytes, mimeType || 'image/png', filename || ('upload-' + Date.now()));
  const file = DriveApp.getFolderById(FOLDER_ID).createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return ok_('https://drive.google.com/thumbnail?id=' + file.getId() + '&sz=w1000');
}

/**
 * API โหลดข้อมูลเริ่มต้นแบบเร็ว
 * - ไม่เรียก ensureSetup ซ้ำ เพราะ doGet/init ทำไปแล้ว
 * - อ่านข้อมูลแต่ละชีตครั้งเดียว ลดเวลา reload/login
 * - โหลด Users เฉพาะ admin เท่านั้น
 */
function apiGetInitialDataFast(role, username, userName) {
  try {
    const result = getInitialDataFast_(role || 'cashier', username || '', userName || '');
    return JSON.stringify(result || fail_('โหลดข้อมูลเริ่มต้นไม่สำเร็จ'));
  } catch (err) {
    return JSON.stringify(fail_(err && err.message ? err.message : String(err)));
  }
}

function getInitialDataFast_(role, username, userName) {
  const settings = getSettings_();
  const products = readTable_(SHEETS.PRODUCTS);
  const members = readTable_(SHEETS.MEMBERS);
  const sales = readTable_(SHEETS.SALES);
  const memberPortal = role === 'member' ? getMemberPortalData_(username, userName, {}) : null;
  const payload = {
    settings: settings,
    products: role === 'member' ? [] : products,
    members: role === 'member' ? (memberPortal && memberPortal.success ? [memberPortal.data.member] : []) : members,
    users: role === 'admin' ? readTable_(SHEETS.USERS).map(u => ({...u, password: ''})) : [],
    dashboard: getDashboardDataFast_(products, members, sales),
    dividends: (role === 'admin' || role === 'teacher') ? readTable_(SHEETS.DIVIDENDS) : [],
    memberPortal: memberPortal && memberPortal.success ? memberPortal.data : null,
    memberPortalMessage: memberPortal && !memberPortal.success ? memberPortal.message : ''
  };
  return ok_(payload);
}

function apiGetMemberPortalData(username, userName, filter) {
  try {
    const result = getMemberPortalData_(username || '', userName || '', filter || {});
    return JSON.stringify(result || fail_('โหลดข้อมูลสมาชิกไม่สำเร็จ'));
  } catch (err) {
    return JSON.stringify(fail_(err && err.message ? err.message : String(err)));
  }
}

function getDashboardDataFast_(products, members, sales) {
  const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const todaySales = sales.filter(s => String(s.saleDate).slice(0,10) === today);
  const totalToday = todaySales.reduce((a,s)=>a+toNum_(s.totalAmount),0);
  const recentSales = sales.slice(-5).reverse();
  const lowStock = products.filter(p => toNum_(p.stock) <= 5).length;
  const chart = [];
  for (let i=6; i>=0; i--) {
    const d = new Date(); d.setDate(d.getDate()-i);
    const key = Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    chart.push({ date: key.slice(5), amount: sales.filter(s => String(s.saleDate).slice(0,10) === key).reduce((a,s)=>a+toNum_(s.totalAmount),0) });
  }
  return {
    todaySales: totalToday,
    todayCount: todaySales.length,
    totalMembers: members.length,
    totalProducts: products.length,
    lowStock: lowStock,
    recentSales: recentSales,
    chart: chart
  };
}

/* =====================================================================
 *  API WRAPPERS — คืนค่าเป็น JSON String ทุกฟังก์ชัน
 *  เพื่อแก้ปัญหา google.script.run คืน undefined / Object ที่ parse ไม่ได้
 * ===================================================================== */

function apiSaveProduct(product, callerRole) {
  try {
    const result = saveProduct(product, callerRole);
    return JSON.stringify(result || fail_('ไม่ได้รับการตอบกลับจากระบบ'));
  } catch (err) {
    return JSON.stringify(fail_(err && err.message ? err.message : String(err)));
  }
}

function apiDeleteProduct(productId, callerRole) {
  try {
    const result = deleteProduct(productId, callerRole);
    return JSON.stringify(result || fail_('ไม่ได้รับการตอบกลับจากระบบ'));
  } catch (err) {
    return JSON.stringify(fail_(err && err.message ? err.message : String(err)));
  }
}

function apiSaveMember(member, callerRole) {
  try {
    const result = saveMember(member, callerRole);
    return JSON.stringify(result || fail_('ไม่ได้รับการตอบกลับจากระบบ'));
  } catch (err) {
    return JSON.stringify(fail_(err && err.message ? err.message : String(err)));
  }
}

function apiDeleteMember(memberId, callerRole) {
  try {
    const result = deleteMember(memberId, callerRole);
    return JSON.stringify(result || fail_('ไม่ได้รับการตอบกลับจากระบบ'));
  } catch (err) {
    return JSON.stringify(fail_(err && err.message ? err.message : String(err)));
  }
}

function apiSaveUser(user, callerRole) {
  try {
    const result = saveUser(user, callerRole);
    return JSON.stringify(result || fail_('ไม่ได้รับการตอบกลับจากระบบ'));
  } catch (err) {
    return JSON.stringify(fail_(err && err.message ? err.message : String(err)));
  }
}

function apiDeleteUser(userId, callerRole) {
  try {
    const result = deleteUser(userId, callerRole);
    return JSON.stringify(result || fail_('ไม่ได้รับการตอบกลับจากระบบ'));
  } catch (err) {
    return JSON.stringify(fail_(err && err.message ? err.message : String(err)));
  }
}

function apiCreateMemberLoginUsers(callerRole) {
  try {
    const result = createMemberLoginUsers(callerRole);
    return JSON.stringify(result || fail_('ไม่ได้รับการตอบกลับจากระบบ'));
  } catch (err) {
    return JSON.stringify(fail_(err && err.message ? err.message : String(err)));
  }
}

function apiRecordSale(payload) {
  try {
    const result = recordSale(payload);
    return JSON.stringify(result || fail_('ไม่ได้รับการตอบกลับจากระบบ'));
  } catch (err) {
    return JSON.stringify(fail_(err && err.message ? err.message : String(err)));
  }
}

function apiSaveSettings(settings) {
  try {
    const result = saveSettings(settings);
    return JSON.stringify(result || fail_('ไม่ได้รับการตอบกลับจากระบบ'));
  } catch (err) {
    return JSON.stringify(fail_(err && err.message ? err.message : String(err)));
  }
}

function apiGetSalesReport(filter) {
  try {
    const result = getSalesReport(filter);
    return JSON.stringify(result || fail_('ไม่ได้รับการตอบกลับจากระบบ'));
  } catch (err) {
    return JSON.stringify(fail_(err && err.message ? err.message : String(err)));
  }
}

function apiCalculateDividend(filter) {
  try {
    const result = calculateDividend(filter);
    return JSON.stringify(result || fail_('ไม่ได้รับการตอบกลับจากระบบ'));
  } catch (err) {
    return JSON.stringify(fail_(err && err.message ? err.message : String(err)));
  }
}

function apiSaveDividendRound(payload, callerRole) {
  try {
    const result = saveDividendRound(payload, callerRole);
    return JSON.stringify(result || fail_('ไม่ได้รับการตอบกลับจากระบบ'));
  } catch (err) {
    return JSON.stringify(fail_(err && err.message ? err.message : String(err)));
  }
}

function apiMarkDividendPaid(itemId, paidBy, callerRole) {
  try {
    const result = markDividendPaid(itemId, paidBy, callerRole);
    return JSON.stringify(result || fail_('ไม่ได้รับการตอบกลับจากระบบ'));
  } catch (err) {
    return JSON.stringify(fail_(err && err.message ? err.message : String(err)));
  }
}

/* =====================================================================
 *  BATCH IMPORT MEMBERS — รับ array of member objects แล้วบันทึกทีเดียว
 * ===================================================================== */
function batchSaveMembers(members, callerRole) {
  const denied = requireTeacherOrAdmin_(callerRole || 'cashier');
  if (denied) return denied;
  if (!members || !members.length) return fail_('ไม่มีข้อมูลสมาชิกที่จะนำเข้า');

  const rows = readTable_(SHEETS.MEMBERS);
  const settings = getSettings_();
  const sharePrice = settings.sharePrice || 20;
  const now = now_();
  const added = [], skipped = [];

  members.forEach((m, idx) => {
    if (!m.fullName || !String(m.fullName).trim()) {
      skipped.push({ row: idx + 2, reason: 'ไม่มีชื่อ-นามสกุล' });
      return;
    }
    // ตรวจ duplicate รหัสนักเรียน
    if (m.studentCode && rows.some(r => String(r.studentCode) === String(m.studentCode).trim())) {
      skipped.push({ row: idx + 2, name: m.fullName, reason: 'รหัสนักเรียนซ้ำ: ' + m.studentCode });
      return;
    }
    const newMember = {
      memberId: makeId_('M'),
      fullName: String(m.fullName).trim(),
      studentCode: String(m.studentCode || '').trim(),
      classroom: String(m.classroom || '').trim(),
      shares: parseInt(m.shares) || 0,
      sharePrice: parseFloat(m.sharePrice) || sharePrice,
      phone: String(m.phone || '').trim(),
      joinedDate: m.joinedDate || now.slice(0, 10),
      status: m.status === 'inactive' ? 'inactive' : 'active',
      note: String(m.note || '').trim()
    };
    rows.push(newMember);
    added.push(newMember);
  });

  if (added.length > 0) writeTable_(SHEETS.MEMBERS, rows);
  return ok_({ added: added.length, skipped, members: rows });
}

function apiBatchSaveMembers(members, callerRole) {
  try {
    const result = batchSaveMembers(members, callerRole);
    return JSON.stringify(result || fail_('ไม่ได้รับการตอบกลับจากระบบ'));
  } catch (err) {
    return JSON.stringify(fail_(err && err.message ? err.message : String(err)));
  }
}

/* =====================================================================
 *  SALE ORDER MANAGEMENT — CRUD ยอดสั่งซื้อของสมาชิก
 * ===================================================================== */

/**
 * ดึงรายการซื้อทั้งหมดพร้อม SaleItems ของสมาชิกแต่ละคน
 */
function getSaleOrders(filter) {
  const sales = readTable_(SHEETS.SALES);
  const items = readTable_(SHEETS.SALE_ITEMS);
  const members = readTable_(SHEETS.MEMBERS);
  let rows = sales.map(s => ({ ...s, saleDate: normalizeDate_(s.saleDate) }));
  if (filter) {
    if (filter.startDate) rows = rows.filter(s => String(s.saleDate).slice(0,10) >= String(filter.startDate).slice(0,10));
    if (filter.endDate)   rows = rows.filter(s => String(s.saleDate).slice(0,10) <= String(filter.endDate).slice(0,10));
    if (filter.memberId)  rows = rows.filter(s => String(s.memberId) === String(filter.memberId));
    if (filter.keyword)   rows = rows.filter(s => String(s.customerName).includes(filter.keyword) || String(s.receiptNo).includes(filter.keyword));
  }
  return ok_({ rows, items, members });
}

function apiGetSaleOrders(filter) {
  try {
    const result = getSaleOrders(filter || {});
    return JSON.stringify(result || fail_('ไม่ได้รับการตอบกลับจากระบบ'));
  } catch (err) {
    return JSON.stringify(fail_(err && err.message ? err.message : String(err)));
  }
}

/**
 * แก้ไขข้อมูล Sale header (customerName, paymentMethod, memberId)
 * ไม่เปลี่ยนสินค้า/จำนวน เพื่อความปลอดภัยของ stock
 */
function updateSaleOrder(saleId, updateData, callerRole) {
  const denied = requireTeacherOrAdmin_(callerRole || 'cashier');
  if (denied) return denied;
  const sales = readTable_(SHEETS.SALES);
  const idx = sales.findIndex(s => String(s.saleId) === String(saleId));
  if (idx < 0) return fail_('ไม่พบรายการสั่งซื้อ saleId: ' + saleId);
  const allowed = ['customerName', 'memberId', 'paymentMethod', 'seller'];
  allowed.forEach(k => { if (updateData[k] !== undefined) sales[idx][k] = updateData[k]; });
  writeTable_(SHEETS.SALES, sales);
  return ok_(sales[idx]);
}

function apiUpdateSaleOrder(saleId, updateData, callerRole) {
  try {
    const result = updateSaleOrder(saleId, updateData || {}, callerRole);
    return JSON.stringify(result || fail_('ไม่ได้รับการตอบกลับจากระบบ'));
  } catch (err) {
    return JSON.stringify(fail_(err && err.message ? err.message : String(err)));
  }
}

/**
 * ลบรายการสั่งซื้อ — คืน stock สินค้ากลับ
 */
function deleteSaleOrder(saleId, callerRole) {
  const denied = requireTeacherOrAdmin_(callerRole || 'cashier');
  if (denied) return denied;
  const sales = readTable_(SHEETS.SALES);
  const saleIdx = sales.findIndex(s => String(s.saleId) === String(saleId));
  if (saleIdx < 0) return fail_('ไม่พบรายการสั่งซื้อ saleId: ' + saleId);
  // คืน stock
  const saleItems = readTable_(SHEETS.SALE_ITEMS);
  const relatedItems = saleItems.filter(i => String(i.saleId) === String(saleId));
  const products = readTable_(SHEETS.PRODUCTS);
  relatedItems.forEach(item => {
    const pIdx = products.findIndex(p => String(p.productId) === String(item.productId));
    if (pIdx >= 0) products[pIdx].stock = toNum_(products[pIdx].stock) + toNum_(item.quantity);
  });
  writeTable_(SHEETS.PRODUCTS, products);
  // ลบ SaleItems
  const remainItems = saleItems.filter(i => String(i.saleId) !== String(saleId));
  writeTable_(SHEETS.SALE_ITEMS, remainItems);
  // ลบ Sale
  const remainSales = sales.filter(s => String(s.saleId) !== String(saleId));
  writeTable_(SHEETS.SALES, remainSales);
  const members = readTable_(SHEETS.MEMBERS);
  return ok_({ sales: remainSales, dashboard: getDashboardDataFast_(products, members, remainSales) });
}

function apiDeleteSaleOrder(saleId, callerRole) {
  try {
    const result = deleteSaleOrder(saleId, callerRole);
    return JSON.stringify(result || fail_('ไม่ได้รับการตอบกลับจากระบบ'));
  } catch (err) {
    return JSON.stringify(fail_(err && err.message ? err.message : String(err)));
  }
}

/**
 * แก้ไขรายการสินค้าใน SaleItem (quantity, price) แล้วคำนวณยอดรวมใหม่
 * จัดการ stock ส่วนต่างอัตโนมัติ
 */
function updateSaleItem(itemId, quantity, price, callerRole) {
  const denied = requireTeacherOrAdmin_(callerRole || 'cashier');
  if (denied) return denied;
  const saleItems = readTable_(SHEETS.SALE_ITEMS);
  const itemIdx = saleItems.findIndex(i => String(i.itemId) === String(itemId));
  if (itemIdx < 0) return fail_('ไม่พบรายการสินค้า itemId: ' + itemId);
  const item = saleItems[itemIdx];
  const oldQty = toNum_(item.quantity);
  const newQty = toNum_(quantity);
  const newPrice = toNum_(price);
  if (newQty <= 0) return fail_('จำนวนต้องมากกว่า 0');
  // ปรับ stock
  const products = readTable_(SHEETS.PRODUCTS);
  const pIdx = products.findIndex(p => String(p.productId) === String(item.productId));
  if (pIdx >= 0) {
    const diff = oldQty - newQty; // ถ้าลดจำนวน stock เพิ่ม
    const newStock = toNum_(products[pIdx].stock) + diff;
    if (newStock < 0) return fail_('สินค้าไม่เพียงพอ ต้องการเพิ่มอีก ' + Math.abs(diff) + ' ชิ้น แต่มีเพียง ' + toNum_(products[pIdx].stock) + ' ชิ้น');
    products[pIdx].stock = newStock;
    writeTable_(SHEETS.PRODUCTS, products);
  }
  // อัปเดต item
  saleItems[itemIdx].quantity = newQty;
  saleItems[itemIdx].price = newPrice;
  saleItems[itemIdx].subtotal = newQty * newPrice;
  writeTable_(SHEETS.SALE_ITEMS, saleItems);
  // อัปเดต totalAmount ของ Sale
  const saleId = item.saleId;
  const sales = readTable_(SHEETS.SALES);
  const saleIdx = sales.findIndex(s => String(s.saleId) === String(saleId));
  if (saleIdx >= 0) {
    const relatedItems = saleItems.filter(i => String(i.saleId) === String(saleId));
    const newTotal = relatedItems.reduce((a, i) => a + toNum_(i.subtotal), 0);
    const newCost = relatedItems.reduce((a, i) => a + toNum_(i.cost) * toNum_(i.quantity), 0);
    sales[saleIdx].totalAmount = newTotal;
    sales[saleIdx].totalCost = newCost;
    sales[saleIdx].profit = newTotal - newCost;
    writeTable_(SHEETS.SALES, sales);
  }
  return ok_({ item: saleItems[itemIdx], saleItems: saleItems.filter(i => String(i.saleId) === String(saleId)) });
}

function apiUpdateSaleItem(itemId, quantity, price, callerRole) {
  try {
    const result = updateSaleItem(itemId, quantity, price, callerRole);
    return JSON.stringify(result || fail_('ไม่ได้รับการตอบกลับจากระบบ'));
  } catch (err) {
    return JSON.stringify(fail_(err && err.message ? err.message : String(err)));
  }
}

/**
 * ลบรายการสินค้าใน SaleItem และคืน stock + อัปเดตยอดรวม
 */
function deleteSaleItem(itemId, callerRole) {
  const denied = requireTeacherOrAdmin_(callerRole || 'cashier');
  if (denied) return denied;
  const saleItems = readTable_(SHEETS.SALE_ITEMS);
  const itemIdx = saleItems.findIndex(i => String(i.itemId) === String(itemId));
  if (itemIdx < 0) return fail_('ไม่พบรายการสินค้า');
  const item = saleItems[itemIdx];
  const saleId = item.saleId;
  // ตรวจว่าเป็นรายการสุดท้ายใน order ไหม
  const siblingsCount = saleItems.filter(i => String(i.saleId) === String(saleId)).length;
  if (siblingsCount <= 1) return fail_('ไม่สามารถลบรายการสุดท้ายในใบเสร็จได้ กรุณาลบทั้งใบเสร็จแทน');
  // คืน stock
  const products = readTable_(SHEETS.PRODUCTS);
  const pIdx = products.findIndex(p => String(p.productId) === String(item.productId));
  if (pIdx >= 0) { products[pIdx].stock = toNum_(products[pIdx].stock) + toNum_(item.quantity); writeTable_(SHEETS.PRODUCTS, products); }
  // ลบ item
  const remaining = saleItems.filter(i => String(i.itemId) !== String(itemId));
  writeTable_(SHEETS.SALE_ITEMS, remaining);
  // อัปเดตยอดรวม
  const sales = readTable_(SHEETS.SALES);
  const saleIdx = sales.findIndex(s => String(s.saleId) === String(saleId));
  if (saleIdx >= 0) {
    const relatedItems = remaining.filter(i => String(i.saleId) === String(saleId));
    const newTotal = relatedItems.reduce((a, i) => a + toNum_(i.subtotal), 0);
    const newCost = relatedItems.reduce((a, i) => a + toNum_(i.cost) * toNum_(i.quantity), 0);
    sales[saleIdx].totalAmount = newTotal;
    sales[saleIdx].totalCost = newCost;
    sales[saleIdx].profit = newTotal - newCost;
    writeTable_(SHEETS.SALES, sales);
  }
  return ok_({ saleItems: remaining.filter(i => String(i.saleId) === String(saleId)) });
}

function apiDeleteSaleItem(itemId, callerRole) {
  try {
    const result = deleteSaleItem(itemId, callerRole);
    return JSON.stringify(result || fail_('ไม่ได้รับการตอบกลับจากระบบ'));
  } catch (err) {
    return JSON.stringify(fail_(err && err.message ? err.message : String(err)));
  }
}
