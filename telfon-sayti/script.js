// ===== Giriş animasiyası (3 saniyə) =====
// Sayta hər girəndə çıxır. Saytdan çıxıb (başqa tab, başqa tətbiq) geri qayıdanda da yenidən çıxır.
const $ = id => document.getElementById(id);
const intro = $("intro");
const INTRO_MS = 3000;   // animasiyanın müddəti
const AWAY_MS = 3000;    // bu qədər müddət çölə çıxıbsa, qayıdanda yenidən göstər
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
  void intro.offsetWidth;             // animasiyanı sıfırlayır
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
const chips = $("chips"), secTitle = $("secTitle");
const hero = document.querySelector(".hero");
const favCount = $("favCount"), navHome = $("navHome"), navFavs = $("navFavs");

let brand = "all";
let city = "all";
let view = "home"; // "home" və ya "favs"

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
      <div class="pic" style="background:${p.bg}">${p.emoji}</div>
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

// ===== Axtarış, şəhər və filtr =====
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

// ===== Ürək düyməsi =====
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

// ===== Alt menyu =====
function go(e, next) {
  e.preventDefault();
  view = next;
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
navHome.addEventListener("click", e => go(e, "home"));
navFavs.addEventListener("click", e => go(e, "favs"));
$("navSearch").addEventListener("click", e => { go(e, "home"); searchEl.focus(); });
$("navProfile").addEventListener("click", e => {
  e.preventDefault();
  alert("Profil səhifəsi növbəti mərhələdə əlavə olunacaq.");
});

// ===== Elan yerləşdirmə =====
const sheet = $("sheet");
const openSheet = e => { if (e) e.preventDefault(); sheet.hidden = false; };
const closeSheet = () => { sheet.hidden = true; };

$("plusBtn").addEventListener("click", openSheet);
$("fCancel").addEventListener("click", closeSheet);
sheet.addEventListener("click", e => { if (e.target === sheet) closeSheet(); });

$("fSave").addEventListener("click", () => {
  const name = $("fName").value.trim();
  const price = Number($("fPrice").value);
  if (!name || !price) { alert("Telefonun adını və qiymətini yaz."); return; }

  phones.unshift({
    name, brand: $("fBrand").value, price,
    city: $("fCity").value.trim() || "Bakı",
    time: "İndi", emoji: "📱", bg: "#dfe9ff"
  });
  $("fName").value = ""; $("fPrice").value = ""; $("fCity").value = "";
  view = "home";
  render();
  closeSheet();
});

render();

// ===== Elanın ətraflı səhifəsi =====
const CONTACT = "994501234567"; // öz nömrəni yaz: ölkə kodu ilə, + və boşluqsuz
const detail = $("detail");
let openName = null;

function openDetail(name) {
  const p = phones.find(x => x.name === name);
  if (!p) return;
  openName = name;
  $("dPic").textContent = p.emoji;
  $("dPrice").textContent = p.price + " ₼";
  $("dName").textContent = p.name;
  $("dMeta").textContent = `${p.brand} • ${p.city} • ${p.time}`;
  $("dDesc").textContent = p.desc || "Satıcı hələ təsvir əlavə etməyib.";
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