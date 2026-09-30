// ===== Giriş animasiyası (3 saniyə) =====
const $ = id => document.getElementById(id);
const intro = $("intro");
const INTRO_MS = 3000;
const AWAY_MS = 3000;
let introTimer, hiddenAt = 0;

function closeIntro() {
  clearTimeout(introTimer);
  intro.classList.add("hide");
  document.body.classList.remove("is-loading");
}
function playIntro() {
  clearTimeout(introTimer);
  intro.style.transition = "none";
  intro.classList.remove("hide", "play");
  document.body.classList.add("is-loading");
  void intro.offsetWidth;
  intro.style.transition = "";
  intro.classList.add("play");
  introTimer = setTimeout(closeIntro, INTRO_MS);
}
intro.addEventListener("click", closeIntro);
playIntro();
document.addEventListener("visibilitychange", () => {
  if (document.hidden) hiddenAt = Date.now();
  else if (hiddenAt && Date.now() - hiddenAt > AWAY_MS) playIntro();
});
window.addEventListener("pageshow", e => { if (e.persisted) playIntro(); });

// ===== Elanlar =====
const phones = [
  { name: "iPhone 15 Pro 256GB", brand: "Apple",   price: 2350, city: "Bakı",    time: "Bu gün",  emoji: "📱", bg: "#dfe9ff" },
  { name: "iPhone 13 128GB",     brand: "Apple",   price: 1150, city: "Sumqayıt", time: "Dünən",   emoji: "📱", bg: "#e8f0ff" },
  { name: "Samsung S24 Ultra",   brand: "Samsung", price: 2100, city: "Bakı",    time: "Bu gün",  emoji: "📲", bg: "#ffeedd" },
  { name: "Samsung A54 128GB",   brand: "Samsung", price: 620,  city: "Gəncə",   time: "2 gün",   emoji: "📲", bg: "#fff3e2" },
  { name: "Xiaomi Redmi Note 13", brand: "Xiaomi", price: 430,  city: "Bakı",    time: "Bu gün",  emoji: "📱", bg: "#ffe6e6" },
  { name: "Xiaomi 14T Pro",      brand: "Xiaomi",  price: 1050, city: "Mingəçevir", time: "3 gün", emoji: "📱", bg: "#fdebf3" },
  { name: "Honor 200 256GB",     brand: "Honor",   price: 780,  city: "Bakı",    time: "Dünən",   emoji: "📲", bg: "#e6f6ee" },
  { name: "Realme 12 Pro",       brand: "Realme",  price: 560,  city: "Lənkəran", time: "4 gün",  emoji: "📱", bg: "#f1ecff" },
];

const grid = $("grid"), empty = $("empty"), searchEl = $("search");
searchEl.value = "";
window.addEventListener("pageshow", () => { searchEl.value = ""; render(); });
const chips = $("chips"), secTitle = $("secTitle");
const hero = document.querySelector(".hero");
const favCount = $("favCount"), navHome = $("navHome"), navFavs = $("navFavs");

let brand = "all";
let city = "all";
let view = "home";

let favs;
try { favs = new Set(JSON.parse(localStorage.getItem("mobilyol_favs") || "[]")); }
catch { favs = new Set(); }
const saveFavs = () => {
  try { localStorage.setItem("mobilyol_favs", JSON.stringify([...favs])); } catch {}
};

function render() {
  const inFavs = view === "favs";
  const q = searchEl.value.trim().toLowerCase();

  const list = phones.filter(p =>
    (inFavs ? favs.has(p.name) : (brand === "all" || p.brand === brand)) &&
    (city === "all" || p.city === city) &&
    p.name.toLowerCase().includes(q)
  );

  hero.hidden = inFavs;
  chips.hidden = inFavs;
  secTitle.textContent = inFavs ? "Seçilmişlər" : "Yeni elanlar";
  navHome.classList.toggle("on", !inFavs);
  navFavs.classList.toggle("on", inFavs);

  const n = phones.filter(p => favs.has(p.name)).length;
  favCount.textContent = n;
  favCount.hidden = n === 0;

  grid.innerHTML = list.map(p => `
    <article class="card" data-name="${p.name}">
      <div class="pic" style="background:${p.bg}">${p.photo ? `<img src="${p.photo}" style="width:100%;height:100%;object-fit:cover">` : p.emoji}</div>
      <button class="fav ${favs.has(p.name) ? "on" : ""}" data-name="${p.name}" aria-label="Seçilmişlərə əlavə et">♥</button>
      <div class="info">
        <div class="price">${p.price} ₼</div>
        <div class="name">${p.name}</div>
        <div class="meta">${p.city}, ${p.time}</div>
      </div>
    </article>
  `).join("");

  empty.textContent = inFavs
    ? "Seçilmiş elanın yoxdur. Bəyəndiyin telefonda ürək düyməsinə bas."
    : "Heç nə tapılmadı. Başqa söz yazıb yenidən yoxla.";
  empty.hidden = list.length > 0;
}

searchEl.addEventListener("input", render);

$("citySel").addEventListener("change", e => {
  city = e.target.value;
  view = "home";
  render();
});

chips.addEventListener("click", e => {
  const btn = e.target.closest(".chip");
  if (!btn) return;
  chips.querySelector(".active").classList.remove("active");
  btn.classList.add("active");
  brand = btn.dataset.brand;
  render();
});

grid.addEventListener("click", e => {
  const fav = e.target.closest(".fav");
  if (fav) {
    const name = fav.dataset.name;
    favs.has(name) ? favs.delete(name) : favs.add(name);
    saveFavs();
    render();
    return;
  }
  const card = e.target.closest(".card");
  if (card) openDetail(card.dataset.name);
});

function go(e, next) {
  e.preventDefault();
  closeInbox(); closeProfile(); closeSettings();
  view = next;
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
navHome.addEventListener("click", e => go(e, "home"));
navFavs.addEventListener("click", e => go(e, "favs"));
$("navMsgs").addEventListener("click", e => { e.preventDefault(); openInbox(); });
$("navProfile").addEventListener("click", e => { e.preventDefault(); openProfile(); });

const sheet = $("sheet");
const openSheet = e => { if (e) e.preventDefault(); sheet.hidden = false; };
const closeSheet = () => { sheet.hidden = true; };

$("plusBtn").addEventListener("click", e => {
  e.preventDefault();
  if (fbReady && !currentUser) {
    authMode = "signup";
    openProfile();
    alert("Elan yerləşdirmək üçün əvvəl hesab aç.");
    return;
  }
  openSheet();
});
$("fCancel").addEventListener("click", () => { resetSheetForm(); closeSheet(); });
sheet.addEventListener("click", e => { if (e.target === sheet) closeSheet(); });

let selectedListingPhoto = null;
const fPhotoPreview = $("fPhotoPreview");

$("fPhotoInput").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    selectedListingPhoto = reader.result;
    fPhotoPreview.innerHTML = `<img src="${selectedListingPhoto}" alt="">`;
  };
  reader.readAsDataURL(file);
});

function resetSheetForm() {
  $("fName").value = ""; $("fPrice").value = ""; $("fCity").value = "";
  $("fRam").value = ""; $("fStorage").value = "";
  $("fCondition").value = "Yeni"; $("fDelivery").value = "Var";
  $("fDesc").value = "";
  selectedListingPhoto = null;
  fPhotoPreview.innerHTML = "📷";
}

$("fSave").addEventListener("click", () => {
  const name = $("fName").value.trim();
  const price = Number($("fPrice").value);
  if (!name || !price) { alert("Telefonun adını və qiymətini yaz."); return; }

  phones.unshift({
    name, brand: $("fBrand").value, price,
    city: $("fCity").value.trim() || "Bakı",
    ram: $("fRam").value,
    storage: $("fStorage").value,
    condition: $("fCondition").value,
    delivery: $("fDelivery").value,
    desc: $("fDesc").value.trim(),
    photo: selectedListingPhoto,
    time: "İndi", emoji: "📱", bg: "#dfe9ff"
  });
  resetSheetForm();
  view = "home";
  closeInbox(); closeProfile();
  render();
  closeSheet();
});

render();

// ===== Elanın ətraflı səhifəsi =====
const CONTACT = "994501234567";
const detail = $("detail");
let openName = null;

function openDetail(name) {
  const p = phones.find(x => x.name === name);
  if (!p) return;
  openName = name;
  $("dPic").innerHTML = p.photo ? `<img src="${p.photo}" style="width:100%;height:100%;object-fit:cover">` : p.emoji;
  $("dPrice").textContent = p.price + " ₼";
  $("dName").textContent = p.name;
  const metaParts = [p.brand, p.city, p.time];
  if (p.ram) metaParts.push(p.ram + " RAM");
  if (p.storage) metaParts.push(p.storage);
  if (p.condition) metaParts.push(p.condition);
  $("dMeta").textContent = metaParts.join(" • ");
  let descText = p.desc || "Satıcı hələ təsvir əlavə etməyib.";
  if (p.delivery) descText += (p.desc ? "\n\nÇatdırılma: " : "Çatdırılma: ") + p.delivery;
  $("dDesc").textContent = descText;
  const num = p.phone || CONTACT;
  $("dCall").href = "tel:+" + num;
  $("dWa").href = "https://wa.me/" + num + "?text=" +
    encodeURIComponent("Salam, MobilYol-da " + p.name + " elanı ilə maraqlanıram.");
  $("dFav").classList.toggle("on", favs.has(name));
  detail.hidden = false;
  detail.scrollTop = 0;
  document.body.style.overflow = "hidden";
}
function closeDetail() {
  detail.hidden = true;
  openName = null;
  document.body.style.overflow = "";
}
$("dBack").addEventListener("click", closeDetail);
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && !detail.hidden) closeDetail();
});
$("dFav").addEventListener("click", () => {
  if (!openName) return;
  favs.has(openName) ? favs.delete(openName) : favs.add(openName);
  saveFavs();
  $("dFav").classList.toggle("on", favs.has(openName));
  render();
});

// ===== Mesajlar =====
const inbox = $("inbox"), chat = $("chat");
const inboxList = $("inboxList"), inboxEmpty = $("inboxEmpty");
const cMsgs = $("cMsgs"), cText = $("cText");
let chatName = null;

let chats;
try { chats = JSON.parse(localStorage.getItem("mobilyol_chats") || "{}"); }
catch { chats = {}; }
const saveChats = () => {
  try { localStorage.setItem("mobilyol_chats", JSON.stringify(chats)); } catch {}
};

const esc = s => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const hhmm = t => new Date(t).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

function renderInbox() {
  const names = Object.keys(chats)
    .filter(n => chats[n].length)
    .sort((a, b) => chats[b][chats[b].length - 1].t - chats[a][chats[a].length - 1].t);
  inboxEmpty.hidden = names.length > 0;
  inboxList.innerHTML = names.map(n => {
    const p = phones.find(x => x.name === n);
    const last = chats[n][chats[n].length - 1];
    return `<div class="chat-row" data-name="${esc(n)}">
      <div class="avatar">${p ? p.emoji : "📱"}</div>
      <div class="row-body"><b>${esc(n)}</b><span>${esc(last.text)}</span></div>
      <small>${hhmm(last.t)}</small>
    </div>`;
  }).join("");
}

function openInbox() {
  closeDetail();
  closeSettings();
  renderInbox();
  inbox.hidden = false;
  navHome.classList.remove("on");
  navFavs.classList.remove("on");
  $("navMsgs").classList.add("on");
}
function closeInbox() {
  closeProfile();
  closeDetail();
  inbox.hidden = true;
  $("navMsgs").classList.remove("on");
}

function renderChat() {
  const list = chats[chatName] || [];
  cMsgs.innerHTML =
    '<p class="chat-hint">Sınaq rejimi: mesajlar hələlik yalnız bu telefonda saxlanılır.</p>' +
    list.map(m => `<div class="bubble ${m.from}">${esc(m.text)}<small>${hhmm(m.t)}</small></div>`).join("");
  cMsgs.scrollTop = cMsgs.scrollHeight;
}
function openChat(name) {
  const p = phones.find(x => x.name === name);
  chatName = name;
  $("cTitle").textContent = name;
  $("cSub").textContent = p ? `${p.city} • ${p.price} ₼` : "";
  renderChat();
  chat.hidden = false;
}
function closeChat() {
  chat.hidden = true;
  chatName = null;
  if (!inbox.hidden) renderInbox();
}
function sendMsg() {
  const text = cText.value.trim();
  if (!text || !chatName) return;
  (chats[chatName] = chats[chatName] || []).push({ from: "me", text, t: Date.now() });
  saveChats();
  cText.value = "";
  renderChat();
}

inboxList.addEventListener("click", e => {
  const row = e.target.closest(".chat-row");
  if (row) openChat(row.dataset.name);
});
$("cBack").addEventListener("click", closeChat);
$("cSend").addEventListener("click", sendMsg);
cText.addEventListener("keydown", e => { if (e.key === "Enter") sendMsg(); });
$("dMsg").addEventListener("click", e => { e.preventDefault(); if (openName) openChat(openName); });

// ===== Profil və giriş (Firebase) =====
const firebaseConfig = {
  apiKey: "AIzaSyD9PQBrveAB_lscWoBS4g7wXWcyzhaAw38",
  authDomain: "mobilyol-35b61.firebaseapp.com",
  projectId: "mobilyol-35b61",
  storageBucket: "mobilyol-35b61.firebasestorage.app",
  messagingSenderId: "101432761607",
  appId: "1:101432761607:web:92301bd413ab6091e8f9a2"
};

const fbReady = typeof firebase !== "undefined" && firebaseConfig.apiKey !== "BURAYA";
const profile = $("profile"), profileBody = $("profileBody");
let currentUser = null;
let authMode = "login";
let editingProfile = false;
let selectedPhoto = null;

function getAvatar(uid) {
  try { return localStorage.getItem("mobilyol_avatar_" + uid) || null; } catch { return null; }
}
function setAvatarStore(uid, dataUrl) {
  try { localStorage.setItem("mobilyol_avatar_" + uid, dataUrl); } catch {}
}

if (fbReady) {
  firebase.initializeApp(firebaseConfig);
  firebase.auth().onAuthStateChanged(u => { currentUser = u; renderProfile(); });
}

const AUTH_ERR = {
  "auth/email-already-in-use": "Bu email ilə artıq hesab var. \"Daxil ol\" bölməsinə keç.",
  "auth/invalid-email": "Email düzgün yazılmayıb.",
  "auth/weak-password": "Şifrə ən azı 6 simvol olmalıdır.",
  "auth/invalid-credential": "Email və ya şifrə səhvdir.",
  "auth/user-not-found": "Bu email ilə hesab tapılmadı.",
  "auth/wrong-password": "Şifrə səhvdir.",
  "auth/too-many-requests": "Çox cəhd etdin. Bir az sonra yenidən yoxla.",
  "auth/network-request-failed": "İnternet bağlantısını yoxla.",
  "auth/operation-not-allowed": "Firebase-də Email/Password girişi aktiv edilməyib."
};

function renderProfile() {
  if (!fbReady) {
    profileBody.innerHTML = `
      <h2 class="pf-title">Profil</h2>
      <div class="pf-card">Hesab sistemi hələ qoşulmayıb. <b>script.js</b> faylındakı <b>firebaseConfig</b> hissəsinə Firebase məlumatlarını yaz.</div>`;
    return;
  }

  if (currentUser) {
    const name = currentUser.displayName || "İstifadəçi";
    const initial = (currentUser.displayName || currentUser.email || "?")[0].toUpperCase();
    const avatar = getAvatar(currentUser.uid);
    const fullName = currentUser.displayName || "";
    const [curAd, ...restSoyad] = fullName.split(" ");
    const curSoyad = restSoyad.join(" ");

    if (editingProfile) {
      if (selectedPhoto === null) selectedPhoto = avatar || "";
      profileBody.innerHTML = `
        <h2 class="pf-title">Profili düzəlt</h2>
        <div class="pf-photo-pick">
          <div class="pf-photo-preview" id="pfPhotoPreview">${selectedPhoto ? `<img src="${selectedPhoto}" alt="">` : esc(initial)}</div>
          <label class="pf-photo-btn" for="pfPhotoInput">📷 Şəkil əlavə et</label>
          <input type="file" id="pfPhotoInput" accept="image/*" hidden>
        </div>
        <div class="pf-form">
          <input id="pfAdEdit" placeholder="Ad" value="${esc(curAd || "")}">
          <input id="pfSoyadEdit" placeholder="Soyad" value="${esc(curSoyad || "")}">
          <p class="pf-err" id="pfEditErr" hidden></p>
          <button class="pf-btn" id="pfSaveEdit">Yadda saxla</button>
          <button class="pf-btn ghost" id="pfCancelEdit">Ləğv et</button>
        </div>`;
      return;
    }

    profileBody.innerHTML = `
      <div class="pf-head">
        <div class="pf-avatar">${avatar ? `<img src="${avatar}" alt="">` : esc(initial)}</div>
        <div><b>${esc(name)}</b><span>${esc(currentUser.email || "")}</span></div>
        <button class="pf-gear" id="pfGear" aria-label="Ayarlar">⚙️</button>
      </div>
      <button class="pf-btn ghost" id="pfEditBtn">Profili düzəlt</button>`;
    return;
  }

  const signup = authMode === "signup";
  profileBody.innerHTML = `
    <h2 class="pf-title">${signup ? "Hesab aç" : "Hesabına daxil ol"}</h2>
    <div class="pf-tabs">
      <button data-mode="login" class="${signup ? "" : "on"}">Daxil ol</button>
      <button data-mode="signup" class="${signup ? "on" : ""}">Qeydiyyat</button>
    </div>
    <div class="pf-form">
      ${signup ? '<input id="pfName" placeholder="Adın" autocomplete="name">' : ""}
      <input id="pfEmail" type="email" placeholder="Email" autocomplete="email">
      <input id="pfPass" type="password" placeholder="Şifrə (ən azı 6 simvol)" autocomplete="${signup ? "new-password" : "current-password"}">
      <p class="pf-err" id="pfErr" hidden></p>
      <button class="pf-btn" id="pfSubmit">${signup ? "Hesab aç" : "Daxil ol"}</button>
    </div>`;
}

function showAuthErr(msg) {
  const el = $("pfErr");
  if (!el) return;
  el.textContent = msg;
  el.hidden = false;
}

async function submitAuth() {
  const email = $("pfEmail").value.trim();
  const pass = $("pfPass").value;
  const signup = authMode === "signup";
  const name = signup ? $("pfName").value.trim() : "";
  if (!email || !pass || (signup && !name)) { showAuthErr("Bütün xanaları doldur."); return; }

  const btn = $("pfSubmit");
  btn.disabled = true;
  btn.textContent = "Gözlə...";
  try {
    if (signup) {
      const cred = await firebase.auth().createUserWithEmailAndPassword(email, pass);
      await cred.user.updateProfile({ displayName: name });
      currentUser = firebase.auth().currentUser;
      renderProfile();
    } else {
      await firebase.auth().signInWithEmailAndPassword(email, pass);
    }
  } catch (err) {
    showAuthErr(AUTH_ERR[err.code] || "Xəta baş verdi: " + err.code);
    btn.disabled = false;
    btn.textContent = signup ? "Hesab aç" : "Daxil ol";
  }
}

profileBody.addEventListener("click", async e => {
  const tab = e.target.closest("[data-mode]");
  if (tab) { authMode = tab.dataset.mode; renderProfile(); return; }
  if (e.target.closest("#pfSubmit")) { submitAuth(); return; }

  if (e.target.closest("#pfEditBtn")) { editingProfile = true; selectedPhoto = null; renderProfile(); return; }
  if (e.target.closest("#pfCancelEdit")) { editingProfile = false; renderProfile(); return; }
  if (e.target.closest("#pfGear")) { openSettings(); return; }

  const av = e.target.closest(".pf-avatar img");
  if (av) { openPhotoView(av.src); return; }

  if (e.target.closest("#pfSaveEdit")) {
    const ad = $("pfAdEdit").value.trim();
    const soyad = $("pfSoyadEdit").value.trim();
    const err = $("pfEditErr");
    if (!ad) { err.textContent = "Adını yaz."; err.hidden = false; return; }
    const fullName = soyad ? ad + " " + soyad : ad;
    try {
      await currentUser.updateProfile({ displayName: fullName });
      if (selectedPhoto) setAvatarStore(currentUser.uid, selectedPhoto);
      currentUser = firebase.auth().currentUser;
      editingProfile = false;
      renderProfile();
    } catch (err2) {
      err.textContent = "Xəta baş verdi, yenidən yoxla.";
      err.hidden = false;
    }
  }
});
profileBody.addEventListener("keydown", e => {
  if (e.key === "Enter" && e.target.tagName === "INPUT") submitAuth();
});
profileBody.addEventListener("change", e => {
  if (e.target.id !== "pfPhotoInput") return;
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => { selectedPhoto = reader.result; renderProfile(); };
  reader.readAsDataURL(file);
});

function openProfile() {
  closeDetail();
  closeInbox();
  renderProfile();
  profile.hidden = false;
  navHome.classList.remove("on");
  navFavs.classList.remove("on");
  $("navProfile").classList.add("on");
}
function closeProfile() {
  profile.hidden = true;
  $("navProfile").classList.remove("on");
}
renderProfile();

// ===== Şəkilə baxış =====
const photoView = $("photoView"), pvImg = $("pvImg");
function openPhotoView(src) {
  pvImg.src = src;
  photoView.hidden = false;
}
function closePhotoView() {
  photoView.hidden = true;
  pvImg.src = "";
}
$("pvBack").addEventListener("click", closePhotoView);
photoView.addEventListener("click", e => { if (e.target === photoView) closePhotoView(); });

// ===== Ayarlar =====
const settings = $("settings"), settingsBody = $("settingsBody");
const bottomNav = document.querySelector(".bottom-nav");

function renderSettings() {
  settingsBody.innerHTML = `
    <div class="st-top">
      <button class="d-btn" id="stBack" aria-label="Geri">←</button>
      <b>Ayarlar</b>
    </div>
    <div class="st-list">
      <div class="st-item" data-item="privacy"><span>🔒 Gizlilik və Təhlükəsizlik</span><span class="arrow">›</span></div>
      <div class="st-item" data-item="help"><span>❓ Kömək</span><span class="arrow">›</span></div>
      <div class="st-item" data-item="about"><span>ℹ️ Haqqında</span><span class="arrow">›</span></div>
      <div class="st-item disabled"><span>🌐 Dil</span><span class="arrow">Tezliklə</span></div>
    </div>
    <button class="st-logout" id="stLogoutBtn">Çıxış</button>`;
}

function openSettings() {
  closeDetail();
  closeInbox();
  renderSettings();
  settings.hidden = false;
  bottomNav.style.display = "none";
}
function closeSettings() {
  settings.hidden = true;
  bottomNav.style.display = "";
}

settingsBody.addEventListener("click", e => {
  if (e.target.closest("#stBack")) { closeSettings(); return; }
  if (e.target.closest("#stLogoutBtn")) { openLogoutSheet(); return; }
  const item = e.target.closest(".st-item:not(.disabled)");
  if (item) alert("Bu bölmə tezliklə hazır olacaq.");
});

// ===== Çıxış təsdiqi =====
const logoutSheet = $("logoutSheet");
function openLogoutSheet() { logoutSheet.hidden = false; }
function closeLogoutSheet() {
  logoutSheet.hidden = true;
  $("loEmail").value = "";
  $("loPass").value = "";
  $("loErr").hidden = true;
}
$("loCancel").addEventListener("click", closeLogoutSheet);
logoutSheet.addEventListener("click", e => { if (e.target === logoutSheet) closeLogoutSheet(); });

$("loConfirm").addEventListener("click", async () => {
  const email = $("loEmail").value.trim();
  const pass = $("loPass").value;
  const err = $("loErr");
  if (!email || !pass) { err.textContent = "Email və şifrəni yaz."; err.hidden = false; return; }
  if (currentUser && currentUser.email && email.toLowerCase() !== currentUser.email.toLowerCase()) {
    err.textContent = "Bu email cari hesabla uyğun gəlmir."; err.hidden = false; return;
  }
  try {
    const cred = firebase.auth.EmailAuthProvider.credential(email, pass);
    await currentUser.reauthenticateWithCredential(cred);
    await firebase.auth().signOut();
    closeLogoutSheet();
    closeSettings();
  } catch (e2) {
    err.textContent = "Email və ya şifrə səhvdir.";
    err.hidden = false;
  }
});

// ===== Axtarış xanasının avtomatik doldurulmasının qarşısını al =====
searchEl.setAttribute("readonly", "true");
searchEl.addEventListener("focus", () => searchEl.removeAttribute("readonly"));