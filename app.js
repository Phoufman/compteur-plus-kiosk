/* ==========================================================
  COMPTEUR+ — PLUG & PLAY (HORIZONTAL) — TABLET SAFE SCALE
  FILE 3/3 — app.js
  ✅ FIX: Pixel-perfect scaling using visualViewport (Android safe)
  ✅ FIX: “Prêt” translates (readyTxt is now updated)
  ✅ DEBUG: ?debug=1 shows safe frame + outlines
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

  const CONFIG = {
    qrMinMinutes: 2,
    qrMaxMinutes: 5,
    qrShowSeconds: 12,

    qrSizeBig: 1400,
    qrSizeSmall: 420,

    activationPortalUrl: "compteurplus.com",
    activationQrUrl: "https://compteurplus.com",

    platformLinks: {
      instagram: { url: "https://www.instagram.com/geniusaitech/" },
      facebook:  { url: "https://www.facebook.com/GeniusAiTech/" },
      tiktok:    { url: "https://www.tiktok.com/@geniusaitech" },
      google:    { url: "https://search.google.com/local/writereview?placeid=ChIJq7DtZrIfyUwR1Rn7liloi5A" }
    },

    weather: {
      city: "Blainville",
      postalCode: "",
      refreshMinutes: 20
    }
  };

  // ===== State
  let currentValue = 1300;
  let mode = "DEMO";
  let lang = "FR"; // FR | EN

  const settings = {
    LIVE: { interval: 8000, chance: 0.18 },
    DEMO: { interval: 2500, chance: 0.85 }
  };

  let rotateEnabled = true;
  const rotateEveryMs = 9000;
  let rotateTimer = null;
  let pollTimer = null;

  let qrTimer = null;
  let qrHideTimer = null;

  // ===== DOM
  const stage      = document.getElementById("stage");
  const brandPlus  = document.getElementById("brandPlus");
  const mainStage  = document.getElementById("mainStage");
  const qrCard     = document.getElementById("qrCard");
  const counterWrap= document.getElementById("counterWrap");

  const platformIcon = document.getElementById("platformIcon");
  const labelFR      = document.getElementById("labelFR");
  const labelEN      = document.getElementById("labelEN");
  const counter      = document.getElementById("counter");

  const qrSmallImg = document.getElementById("qrSmallImg");
  const qrBigImg   = document.getElementById("qrBigImg");

  const qrFR     = document.getElementById("qrFR");
  const qrEN     = document.getElementById("qrEN");
  const qrNoteFR = document.getElementById("qrNoteFR");
  const qrNoteEN = document.getElementById("qrNoteEN");

  const qrPlatIconBig = document.getElementById("qrPlatIconBig");
  const qrPlatNameFR  = document.getElementById("qrPlatNameFR");
  const qrPlatNameEN  = document.getElementById("qrPlatNameEN");

  const weatherPill = document.getElementById("weatherPill");
  const weatherText = document.getElementById("weatherText");

  // Activation DOM
  const activationCode  = document.getElementById("activationCode");
  const activationQrImg = document.getElementById("activationQrImg");
  const portalUrlText   = document.getElementById("portalUrlText");

  const langPill = document.getElementById("langPill");
  const langVal  = document.getElementById("langVal");

  const activateTitle = document.getElementById("activateTitle");
  const activateSub   = document.getElementById("activateSub");
  const step1Txt      = document.getElementById("step1Txt");
  const step2Txt      = document.getElementById("step2Txt");
  const step3Txt      = document.getElementById("step3Txt");
  const codeLabel     = document.getElementById("codeLabel");
  const codeSub       = document.getElementById("codeSub");

  const readyTxt       = document.getElementById("readyTxt");

  // ===== Debug mode
  const params = new URLSearchParams(location.search);
  const DEBUG = params.get("debug") === "1";
  if(DEBUG) document.body.classList.add("debug");

  // ==========================================================
  // ✅ SCALE ENGINE (REAL FIX FOR ANDROID / WEBVIEW)
  // ==========================================================
  const DESIGN_W = 1280;
  const DESIGN_H = 800;

  function getViewportSize(){
    const vv = window.visualViewport;
    if(vv && vv.width && vv.height){
      return { w: vv.width, h: vv.height };
    }
    return { w: window.innerWidth, h: window.innerHeight };
  }

  function applyScale(){
    const { w, h } = getViewportSize();
    const SAFE = 12;

    const sx = (w - SAFE) / DESIGN_W;
    const sy = (h - SAFE) / DESIGN_H;
    let s = Math.min(sx, sy);

    if(!isFinite(s) || s <= 0) s = 1;
    if(s > 1) s = 1;

    s = Math.floor(s * 1000) / 1000;
    document.documentElement.style.setProperty("--uiScale", String(s));
  }

  applyScale();
  window.addEventListener("resize", applyScale);
  window.addEventListener("orientationchange", () => setTimeout(applyScale, 250));
  window.visualViewport?.addEventListener("resize", applyScale);

  // ===== Platforms
  const platformsOrder = ["instagram", "facebook", "google", "tiktok"];
  let platformIndex = 0;

  const platforms = {
    instagram: {
      icon: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png",
      fr: "ABONNÉS INSTAGRAM",
      en: "INSTAGRAM FOLLOWERS",
      ctaFR: "SCANNEZ POUR SUIVRE",
      ctaEN: "SCAN TO FOLLOW",
      noteFR: "Ouvrez votre caméra et scannez",
      noteEN: "Open your camera and scan",
      glow: { a:"rgba(255,70,150,0.18)", b:"rgba(255,212,0,0.08)" }
    },
    facebook: {
      icon: "https://upload.wikimedia.org/wikipedia/commons/1/1b/Facebook_icon.svg",
      fr: "ABONNÉS FACEBOOK",
      en: "FACEBOOK FOLLOWERS",
      ctaFR: "SCANNEZ POUR SUIVRE",
      ctaEN: "SCAN TO FOLLOW",
      noteFR: "Ouvrez votre caméra et scannez",
      noteEN: "Open your camera and scan",
      glow: { a:"rgba(40,120,255,0.18)", b:"rgba(40,120,255,0.08)" }
    },
    google: {
      icon: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg",
      fr: "AVIS GOOGLE",
      en: "GOOGLE REVIEWS",
      ctaFR: "LAISSEZ UN AVIS ★★★★★",
      ctaEN: "LEAVE A REVIEW ★★★★★",
      noteFR: "Scannez pour laisser un avis Google",
      noteEN: "Scan to leave a Google review",
      glow: { a:"rgba(255,212,0,0.18)", b:"rgba(255,255,255,0.06)" }
    },
    tiktok: {
      icon: "https://raw.githubusercontent.com/Phoufman/compteur-plus-assets/main/tiktok_color.png",
      fr: "ABONNÉS TIKTOK",
      en: "TIKTOK FOLLOWERS",
      ctaFR: "SCANNEZ POUR SUIVRE",
      ctaEN: "SCAN TO FOLLOW",
      noteFR: "Ouvrez votre caméra et scannez",
      noteEN: "Open your camera and scan",
      glow: { a:"rgba(0,255,230,0.14)", b:"rgba(255,80,110,0.10)" }
    }
  };

  // ===== Utils
  function currentPlatform(){ return platformsOrder[platformIndex]; }

  function qrApiUrl(targetUrl, sizePx){
    return `https://api.qrserver.com/v1/create-qr-code/?size=${sizePx}x${sizePx}&data=${encodeURIComponent(targetUrl)}`;
  }

  function applyPlatformGlow(name){
    const p = platforms[name];
    if(!p?.glow) return;
    document.documentElement.style.setProperty("--plat", p.glow.a);
    document.documentElement.style.setProperty("--plat2", p.glow.b);
  }

  function applyQrForPlatform(name){
    const url = (CONFIG.platformLinks?.[name]?.url || "").trim() || "https://example.com";
    if(qrSmallImg) qrSmallImg.src = qrApiUrl(url, CONFIG.qrSizeSmall);
    if(qrBigImg)   qrBigImg.src   = qrApiUrl(url, CONFIG.qrSizeBig);

    const p = platforms[name];
    if(!p) return;

    if(qrFR) qrFR.textContent = p.ctaFR;
    if(qrEN) qrEN.textContent = p.ctaEN;
    if(qrNoteFR) qrNoteFR.textContent = p.noteFR;
    if(qrNoteEN) qrNoteEN.textContent = p.noteEN;

    if(qrPlatIconBig) qrPlatIconBig.src = p.icon;
    if(qrPlatNameFR)  qrPlatNameFR.textContent = p.fr;
    if(qrPlatNameEN)  qrPlatNameEN.textContent = p.en;
  }

  function setPlatform(name){
    const p = platforms[name];
    if(!p) return;

    if(platformIcon) platformIcon.src = p.icon;
    if(labelFR) labelFR.textContent = p.fr;
    if(labelEN) labelEN.textContent = p.en;

    applyPlatformGlow(name);
    applyQrForPlatform(name);
  }

  function rotatePlatform(){
    if(!rotateEnabled) return;
    platformIndex = (platformIndex + 1) % platformsOrder.length;
    setPlatform(currentPlatform());
  }

  function formatNumber(v){ return v.toLocaleString("en-US"); }

  function renderDigits(str){
    return `<div class="counterDigits">${
      [...str].map(ch => ch === "," ? `<span class="digit sep">,</span>` : `<span class="digit">${ch}</span>`).join("")
    }</div>`;
  }

  function pulsePlus(){
    if(!brandPlus) return;
    brandPlus.classList.remove("pulse");
    void brandPlus.offsetWidth;
    brandPlus.classList.add("pulse");
    setTimeout(()=> brandPlus.classList.remove("pulse"), 720);
  }

  function microBounce(el){
    if(!el) return;
    el.animate(
      [{ transform:"translateY(0)" }, { transform:"translateY(1px)" }, { transform:"translateY(0)" }],
      { duration: 220, easing:"cubic-bezier(.2,1,.2,1)" }
    );
  }

  function updateDigits(oldVal, newVal){
    const oldStr = formatNumber(oldVal);
    const newStr = formatNumber(newVal);
    if(counter) counter.innerHTML = renderDigits(newStr);

    const nodes = counter ? counter.querySelectorAll(".digit") : [];
    const oldChars = [...oldStr];
    const newChars = [...newStr];
    const maxLen = Math.max(oldChars.length, newChars.length);

    for(let i=0;i<maxLen;i++){
      const oldCh = oldChars[oldChars.length - 1 - i] || "";
      const newCh = newChars[newChars.length - 1 - i] || "";
      const idx = nodes.length - 1 - i;
      if(idx < 0) continue;

      if(newCh !== oldCh && /\d/.test(newCh)){
        const node = nodes[idx];
        node.classList.add("changed");
        setTimeout(()=> node.classList.remove("changed"), 560);
      }
    }
  }

  function updateCounter(newValue){
    if(newValue <= currentValue) return;
    updateDigits(currentValue, newValue);
    currentValue = newValue;

    if(!mainStage?.classList.contains("showQR")){
      pulsePlus();
      microBounce(counterWrap);
    }
  }

  function startPolling(){
    clearInterval(pollTimer);
    const { interval, chance } = settings[mode];

    pollTimer = setInterval(()=>{
      if(Math.random() < chance){
        updateCounter(currentValue + 1);
      }
    }, interval);
  }

  function setMode(newMode){
    mode = newMode;
    document.body.classList.toggle("live", mode === "LIVE");
    startPolling();
  }

  // ===== Views
  function showActivation(){
    if(!mainStage) return;
    mainStage.classList.remove("showQR");
    mainStage.classList.remove("showCounter");
    mainStage.classList.add("showActivate");
    pulsePlus();
  }

  function showCounter(){
    if(!mainStage) return;
    mainStage.classList.remove("showActivate");
    mainStage.classList.remove("showQR");
    mainStage.classList.add("showCounter");
    microBounce(counterWrap);
  }

  function showQR(){
    if(!mainStage) return;
    applyQrForPlatform(currentPlatform());

    if(qrCard){
      qrCard.classList.remove("sweep");
      void qrCard.offsetWidth;
      qrCard.classList.add("sweep");
      setTimeout(()=> qrCard.classList.remove("sweep"), 1100);
    }

    mainStage.classList.remove("showActivate");
    mainStage.classList.add("showQR");
    pulsePlus();

    clearTimeout(qrHideTimer);
    qrHideTimer = setTimeout(hideQR, (Number(CONFIG.qrShowSeconds)||12)*1000);
  }

  function hideQR(){
    if(!mainStage) return;
    mainStage.classList.remove("showQR");
    mainStage.classList.add("showCounter");
    microBounce(counterWrap);
    scheduleNextQR();
  }

  function msBetween(minMinutes, maxMinutes){
    const min = Math.max(0.5, Number(minMinutes)||2)*60*1000;
    const max = Math.max(min, Number(maxMinutes)||5)*60*1000;
    return Math.floor(min + Math.random()*(max-min));
  }

  function scheduleNextQR(){
    clearTimeout(qrTimer);
    qrTimer = setTimeout(showQR, msBetween(CONFIG.qrMinMinutes, CONFIG.qrMaxMinutes));
  }

  // ===== Activation mock
  function randomCode(){
    const n = Math.floor(100000 + Math.random()*900000);
    return String(n).slice(0,3) + " " + String(n).slice(3);
  }

  function renderActivation(){
    if(portalUrlText) portalUrlText.textContent = CONFIG.activationPortalUrl;
    if(activationCode) activationCode.textContent = randomCode();

    const qrUrl = (CONFIG.activationQrUrl || `https://${CONFIG.activationPortalUrl}` || "https://compteurplus.com").trim();
    if(activationQrImg) activationQrImg.src = qrApiUrl(qrUrl, 700);

    if(readyTxt) readyTxt.textContent = (lang === "FR") ? "Prêt" : "Ready";
  }

  // ===== Language
  function applyLanguage(){
    if(langVal) langVal.textContent = lang;

    if(lang === "FR"){
      document.documentElement.lang = "fr";
      if(activateTitle) activateTitle.textContent = "ACTIVATION";
      if(activateSub)   activateSub.textContent   = "BRANCHEZ L’APPAREIL, PUIS ACTIVEZ-LE EN 30 SECONDES.";
      if(step1Txt) step1Txt.textContent = "Ouvrez le portail Compteur+ sur votre téléphone ou ordinateur.";
      if(step2Txt) step2Txt.textContent = "Entrez le code d’activation.";
      if(step3Txt) step3Txt.textContent = "Choisissez votre plateforme et collez le lien de votre réseau social.";
      if(codeLabel) codeLabel.textContent = "CODE D’ACTIVATION";
      if(codeSub)   codeSub.textContent   = "Valide pour 10 minutes";
    }else{
      document.documentElement.lang = "en";
      if(activateTitle) activateTitle.textContent = "ACTIVATION";
      if(activateSub)   activateSub.textContent   = "PLUG THE DEVICE IN, THEN ACTIVATE IT IN 30 SECONDS.";
      if(step1Txt) step1Txt.textContent = "Open the Compteur+ portal on your phone or computer.";
      if(step2Txt) step2Txt.textContent = "Enter the activation code.";
      if(step3Txt) step3Txt.textContent = "Pick your platform and paste your social media link.";
      if(codeLabel) codeLabel.textContent = "ACTIVATION CODE";
      if(codeSub)   codeSub.textContent   = "Valid for 10 minutes";
    }
  }

  function toggleLang(){
    lang = (lang === "FR") ? "EN" : "FR";
    applyLanguage();
    renderActivation();
  }

  // ===== Hotkeys
  function hotkeySetPlatform(name){
    const idx = platformsOrder.indexOf(name);
    if(idx >= 0){
      platformIndex = idx;
      setPlatform(name);
    }
  }

  // ===== Weather (Open-Meteo)
  function normalizePostal(pc){
    return (pc||"").toUpperCase().replace(/[^A-Z0-9]/g,"").trim();
  }

  async function geoLookup(){
    const city = (CONFIG.weather?.city||"").trim();
    const postal = normalizePostal(CONFIG.weather?.postalCode||"");
    if(!city && !postal) return null;

    const q = postal || city;
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=fr&format=json`;
    const res = await fetch(url, { cache:"no-store" });
    const data = await res.json();
    const hit = data?.results?.[0];
    if(!hit) return null;
    return { lat: hit.latitude, lon: hit.longitude };
  }

  async function fetchWeather(){
    try{
      const geo = await geoLookup();
      if(!geo){
        if(weatherText) weatherText.textContent = "—";
        return;
      }
      const wUrl = `https://api.open-meteo.com/v1/forecast?latitude=${geo.lat}&longitude=${geo.lon}&current=temperature_2m&timezone=auto`;
      const res = await fetch(wUrl, { cache:"no-store" });
      const data = await res.json();
      const temp = data?.current?.temperature_2m;
      if(typeof temp !== "number") throw new Error("No temp");

      if(weatherText) weatherText.textContent = `${Math.round(temp)}°C`;
    }catch{
      if(weatherText) weatherText.textContent = "—";
    }
  }

  function startWeather(){
    const city = (CONFIG.weather?.city||"").trim();
    const postal = normalizePostal(CONFIG.weather?.postalCode||"");
    if(!city && !postal){
      if(weatherText) weatherText.textContent = "—";
      return;
    }
    if(weatherText) weatherText.textContent = "…";

    fetchWeather();
    const every = Math.max(10, Number(CONFIG.weather?.refreshMinutes)||20) * 60*1000;
    setInterval(fetchWeather, every);
  }

  function startRotation(){
    clearInterval(rotateTimer);
    rotateTimer = setInterval(()=>{
      if(!mainStage?.classList.contains("showQR")) rotatePlatform();
    }, rotateEveryMs);
  }

  // ===== Key events
  document.addEventListener("keydown", (e)=>{
    const k = e.key.toLowerCase();

    if(k==="a") showActivation();
    if(k==="c") showCounter();
    if(k==="q"){
      if(mainStage?.classList.contains("showQR")) hideQR();
      else showQR();
    }

    if(k==="l") toggleLang();

    if(k==="d") setMode(mode==="LIVE" ? "DEMO" : "LIVE");
    if(k==="r") rotateEnabled = !rotateEnabled;

    if(k==="i") hotkeySetPlatform("instagram");
    if(k==="f") hotkeySetPlatform("facebook");
    if(k==="g") hotkeySetPlatform("google");
    if(k==="t") hotkeySetPlatform("tiktok");

    if(e.code==="Space"){
      e.preventDefault();
      updateCounter(currentValue+1);
    }
  });

  langPill?.addEventListener("click", toggleLang);
  langPill?.addEventListener("keydown", (e)=>{
    if(e.key === "Enter" || e.key === " ") toggleLang();
  });

  // ===== Init
  if(counter) counter.innerHTML = renderDigits(formatNumber(currentValue));
  setPlatform(currentPlatform());

  applyLanguage();
  renderActivation();

  // default view: activation
  showActivation();

  setMode("DEMO");
  startPolling();
  startRotation();

  scheduleNextQR();
  startWeather();
});
