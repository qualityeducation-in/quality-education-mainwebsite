// Home page aur "View All" page dono mein kaam aane wala code:
// website ka text, course / test / book ke card, reels aur video chalana.
(function () {
  var Q = window.QE, esc = Q.esc;
  var icon = Q.icon = function (n) { return '<svg class="i"><use href="#i-' + n + '"/></svg>'; };

  Q.SET = {};        // settings table ki saari values
  Q.onHome = false;  // home page par true (app.js set karta hai)
  Q.LIMIT = 8;       // home page par ek line mein kitne item, uske baad "View All"

  Q.loadSettings = function (rows) {
    (rows || []).forEach(function (row) { Q.SET[row.k] = row.v; });
    Q.setExams(Q.SET.exams);
  };

  // Website ka text: admin mein badla ho to wo, warna default (shared.js ki list se).
  var T = Q.T = function (key) { return (Q.SET["t_" + key] || "").trim() || Q.TEXT[key] || ""; };
  Q.applyTexts = function () {
    document.querySelectorAll("[data-t]").forEach(function (el) { el.textContent = T(el.dataset.t); });
  };

  // Har tarah ki list ki jaankari. "type" wahi hai jo all.html?type=... mein aata hai.
  Q.TYPES = {
    courses: { kind: "course", interest: "Video Course", eyebrow: "courses_eyebrow", title: "courses_title" },
    tests: { kind: "test", interest: "Test Series", eyebrow: "tests_eyebrow", title: "tests_title" },
    books: { kind: "book", interest: "Book", eyebrow: "books_eyebrow", title: "books_title" },
    reels: { eyebrow: "faculty_eyebrow", title: "faculty_title" }
  };

  // Enquiry ka link: home page par form bhar kar wahin le jata hai, doosre page se home ke form par.
  Q.enqAttrs = function (exam, interest, msg) {
    if (Q.onHome) return 'href="#contact" data-enq data-exam="' + esc(exam) + '" data-int="' + esc(interest) + '" data-msg="' + esc(msg) + '"';
    return 'href="index.html?exam=' + encodeURIComponent(exam) + "&amp;int=" + encodeURIComponent(interest) + "&amp;msg=" + encodeURIComponent(msg) + '#contact"';
  };

  function grad(s) {
    var n = 0; s = String(s);
    for (var i = 0; i < s.length; i++) n += s.charCodeAt(i);
    return "g" + (n % 4);
  }

  Q.cardHtml = function (x, interest) {
    var price;
    if (x.is_free) price = '<span class="price" style="color:var(--emerald)">Free</span>';
    else if (x.price > 0) price = '<span class="price">' + Q.inr(x.price) + (x.mrp > x.price ? "<s>" + Q.inr(x.mrp) + "</s>" : "") + "</span>";
    else price = '<span class="price"><small>' + esc(T("fee_note")) + "</small></span>";
    var tag = x.tag || (x.is_free ? "Free" : "");
    var meta = String(x.meta || "").split("·").map(function (m) { return m.trim(); }).filter(Boolean)
      .map(function (m) { return "<b>" + esc(m) + "</b>"; }).join("");
    var embed = Q.embedUrl(x.video_url), photo = Q.safeLink(x.image_url), isBook = interest === "Book";
    // Thumbnail ho to wahi dikhti hai (poori, 16:9). Na ho to exam ke naam wala rangeen design, usi size mein.
    var top = photo
      ? '<div class="c-img has-img"><img src="' + esc(photo) + '" alt="" loading="lazy"></div>'
      : '<div class="c-img ' + grad(x.exam) + '">' + esc(x.exam === "Other" ? "QE" : x.exam) + "</div>";
    return '<article class="course" data-exam="' + esc(x.exam) + '">' + top + '<div class="c-body">'
      + (tag ? '<span class="c-tag ' + (x.is_free ? "free" : "") + '">' + esc(tag) + "</span>" : "")
      + "<h3>" + esc(x.title) + "</h3><p>" + esc(x.descr) + "</p>"
      + (meta ? '<div class="c-meta">' + meta + "</div>" : "")
      + '<div class="c-foot">' + price + '<span class="btns">'
      + (embed ? '<button class="btn line sm" type="button" data-embed="' + esc(embed) + '">' + esc(T("btn_demo")) + "</button>" : "")
      + '<a class="btn sm" ' + Q.enqAttrs(x.exam, interest, x.title + (isBook ? " order karni hai." : " ke baare mein jaankari chahiye.")) + ">"
      + esc(T(isBook ? "btn_order" : "btn_enquire")) + "</a></span></div></div></article>";
  };

  Q.reelHtml = function (r, i) {
    var info = Q.videoInfo(r.url), link = Q.safeLink(r.url);
    var thumb = Q.safeLink(r.image_url) || (info ? info.thumb : "");
    var inner = (thumb ? '<img class="r-img" src="' + esc(thumb) + '" alt="" loading="lazy">' : "")
      + '<span class="play">' + icon("play") + "</span><h3>" + esc(r.title) + "</h3><p>" + esc(r.subtitle) + "</p>";
    var cls = "reel g" + (i % 4) + (thumb ? " has-img" : "");
    if (info) return '<div class="' + cls + '" role="button" tabindex="0" data-kind="' + info.type + '" data-embed="' + esc(info.embed) + '">' + inner + "</div>";
    if (link) return '<a class="' + cls + '" href="' + esc(link) + '" target="_blank" rel="noopener">' + inner + "</a>";
    return "";
  };

  Q.fmtDate = function (iso) {
    var d = new Date(iso);
    return isNaN(d) ? "" : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  // Blog post ka card (home page ki line aur blog page dono mein).
  Q.postCard = function (p) {
    var photo = Q.safeLink(p.image_url);
    return '<a class="course post" href="blog.html?id=' + encodeURIComponent(p.id) + '">'
      + (photo ? '<div class="c-img has-img"><img src="' + esc(photo) + '" alt="" loading="lazy"></div>' : '<div class="c-img g2">' + esc(T("blog_title")) + "</div>")
      + '<div class="c-body"><span class="c-date">' + esc(Q.fmtDate(p.created_at)) + "</span><h3>" + esc(p.title) + "</h3><p>" + esc(p.summary) + "</p>"
      + '<div class="c-foot"><span class="read">' + esc(T("blog_read")) + " " + icon("arrow") + "</span></div></div></a>";
  };

  // Blog ka likha hua text ko surakshit HTML mein badalta hai. Chalne wali cheezein:
  // khaali line = naya paragraph, "## " = heading, "- " = bullet, **mota**, aur link apne aap.
  Q.richText = function (text) {
    var inline = function (s) {
      return esc(s)
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/(https?:\/\/[^\s<]+[^\s<.,;:!?)])/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    };
    return String(text || "").replace(/\r/g, "").split(/\n\s*\n/).map(function (block) {
      var lines = block.split("\n").filter(function (l) { return l.trim() !== ""; });
      if (!lines.length) return "";
      if (/^#{1,3}\s+/.test(lines[0]) && lines.length === 1) return "<h2>" + inline(lines[0].replace(/^#{1,3}\s+/, "")) + "</h2>";
      if (lines.every(function (l) { return /^\s*[-•]\s+/.test(l); })) return "<ul>" + lines.map(function (l) { return "<li>" + inline(l.replace(/^\s*[-•]\s+/, "")) + "</li>"; }).join("") + "</ul>";
      return "<p>" + lines.map(inline).join("<br>") + "</p>";
    }).join("");
  };

  // Line ke aakhir mein "View All" wala card.
  Q.moreHtml = function (type, cls) {
    return '<a class="more-card ' + (cls || "") + '" href="all.html?type=' + type + '"><span>' + icon("arrow") + "</span>" + esc(T("view_all")) + "</a>";
  };

  /* ---------- reel usi box mein chalti hai; ek samay mein ek hi ---------- */
  var playing = null, playingHtml = "";
  var stopReel = Q.stopReel = function () {
    if (!playing) return;
    playing.classList.remove("playing");
    playing.innerHTML = playingHtml;
    playing = null;
  };
  function playReel(card) {
    stopReel();
    playing = card; playingHtml = card.innerHTML;
    var ig = card.dataset.kind === "ig", f = document.createElement("iframe");
    f.title = "Video";
    f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    f.allowFullscreen = true;
    f.src = card.dataset.embed + (ig ? "" : "?autoplay=1&playsinline=1&rel=0");
    if (ig) {
      // Instagram ka player 326px se chhota nahi banta, isliye use box ke hisaab se chhota karke dikhate hain.
      var w = card.clientWidth, h = card.clientHeight, k = Math.min(1, w / 326);
      f.style.cssText = "width:" + (w / k) + "px;height:" + (h / k) + "px;transform:scale(" + k + ");transform-origin:0 0";
    }
    card.classList.add("playing");
    card.innerHTML = '<button class="r-close" type="button" aria-label="Video band karein">✕</button>';
    card.appendChild(f);
  }

  /* ---------- video popup (course ka Watch Demo) ---------- */
  var dlg = document.getElementById("vid"), frame = dlg && dlg.querySelector("iframe");
  if (dlg) {
    dlg.querySelector("button").addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener("close", function () { frame.src = "about:blank"; });
  }

  document.addEventListener("click", function (e) {
    var rl = e.target.closest(".reel[data-embed]");
    if (rl) {
      if (e.target.closest(".r-close")) stopReel();
      else if (!rl.classList.contains("playing")) playReel(rl);
      return;
    }
    var v = e.target.closest("[data-embed]");
    if (v && dlg) {
      dlg.classList.toggle("tall", v.dataset.embed.indexOf("instagram.com") > -1);
      frame.src = v.dataset.embed;
      dlg.showModal();
    }
  });
  document.addEventListener("keydown", function (e) {
    if ((e.key === "Enter" || e.key === " ") && e.target.matches && e.target.matches(".reel[data-embed]:not(.playing)")) {
      e.preventDefault(); playReel(e.target);
    }
  });
  // Thumbnail load na ho paye to tooti hui photo ki jagah rangeen design dikhta hai.
  document.addEventListener("error", function (e) {
    var t = e.target;
    if (!t.classList || !t.classList.contains("r-img")) return;
    var c = t.closest(".reel");
    if (c) c.classList.remove("has-img");
    t.remove();
  }, true);
})();
