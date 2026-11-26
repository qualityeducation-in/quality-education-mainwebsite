// Home page (index.html) ka code. Card, reels aur text ka common code cards.js mein hai.
(function () {
  var Q = window.QE, sb = Q.sb, esc = Q.esc, T = Q.T, icon = Q.icon;
  var $ = function (id) { return document.getElementById(id); };
  Q.onHome = true;

  var ITEMS = [], REELS = [], courseFilter = "";

  function buildExams() {
    $("strip").innerHTML = [0, 1, 2, 3].map(function () {
      return Q.EXAMS.filter(function (e) { return e !== "Other"; }).map(function (e) { return "<span>" + esc(e) + "</span>"; }).join("");
    }).join("");
    var sel = $("f-exam"), cur = sel.value;
    sel.innerHTML = Q.EXAMS.map(function (e) { return "<option>" + esc(e) + "</option>"; }).join("");
    if (cur) sel.value = cur;
  }

  $("year").textContent = new Date().getFullYear();
  buildExams();

  /* ---------- menu, enquiry buttons, filter ---------- */
  var nav = $("nav"), menuBtn = $("menu-btn");
  menuBtn.addEventListener("click", function () { menuBtn.setAttribute("aria-expanded", nav.classList.toggle("open")); });
  nav.addEventListener("click", function (e) { if (e.target.closest("a")) nav.classList.remove("open"); });

  function fillForm(exam, interest, msg) {
    $("f-exam").value = exam;
    if (!$("f-exam").value) $("f-exam").value = "Other";
    if (Q.INTERESTS.indexOf(interest) > -1) $("f-interest").value = interest;
    $("f-msg").value = String(msg || "").slice(0, 500);
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-enq]");
    if (b) fillForm(b.dataset.exam, b.dataset.int, b.dataset.msg);
    var c = e.target.closest("#course-chips [data-f]");
    if (c) { courseFilter = c.dataset.f; renderCourses(); }
  });

  /* ---------- side mein khiskne wali line (slider) ke teer ---------- */
  var sliders = [].map.call(document.querySelectorAll(".slider"), function (s) {
    var track = s.querySelector(".grid3, .reels"), prev = s.querySelector(".s-prev"), next = s.querySelector(".s-next");
    var update = function () {
      prev.hidden = track.scrollLeft <= 4;
      next.hidden = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    };
    var move = function (dir) {
      track.scrollBy({ left: dir * Math.max(280, track.clientWidth * 0.8), behavior: "smooth" });
      setTimeout(update, 250); setTimeout(update, 700); // scroll khatam hone ke baad teer sahi dikhein
    };
    prev.addEventListener("click", function () { move(-1); });
    next.addEventListener("click", function () { move(1); });
    track.addEventListener("scroll", update, { passive: true });
    return { track: track, update: update };
  });
  function updateSliders() { sliders.forEach(function (s) { s.update(); }); }
  window.addEventListener("resize", updateSliders);
  window.addEventListener("load", updateSliders);

  /* ---------- rendering ---------- */
  var note = function (t) { return '<p class="load-note">' + t + "</p>"; };
  var ofKind = function (k) { return ITEMS.filter(function (x) { return x.kind === k; }); };

  // Pehle 8 item ek line mein, zyada hon to aakhir mein "View All" card aur upar "View All" link.
  function fillLine(gridId, type, rows, emptyText, moreCls) {
    var t = Q.TYPES[type], more = rows.length > Q.LIMIT;
    var grid = $(gridId);
    grid.innerHTML = rows.length
      ? rows.slice(0, Q.LIMIT).map(function (x) { return Q.cardHtml(x, t.interest); }).join("") + (more ? Q.moreHtml(type, moreCls) : "")
      : (emptyText ? note(emptyText) : "");
    grid.scrollLeft = 0;
    $(type + "-all").hidden = !more;
  }

  function renderCourses() {
    var courses = ofKind("course");
    // Filter ke button usi kram mein jis kram mein exams ki list hai.
    var exams = courses.map(function (c) { return c.exam; }).filter(function (e, i, a) { return a.indexOf(e) === i; });
    exams.sort(function (a, b) {
      var ia = Q.EXAMS.indexOf(a), ib = Q.EXAMS.indexOf(b);
      return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
    });
    if (exams.indexOf(courseFilter) < 0) courseFilter = "";
    $("course-chips").innerHTML = exams.length > 1
      ? '<button class="chip" type="button" aria-pressed="' + (courseFilter === "") + '" data-f="">' + esc(T("chip_all")) + "</button>" + exams.map(function (e) {
        return '<button class="chip" type="button" aria-pressed="' + (courseFilter === e) + '" data-f="' + esc(e) + '">' + esc(e) + "</button>";
      }).join("") : "";
    var shown = courses.filter(function (c) { return !courseFilter || c.exam === courseFilter; });
    fillLine("course-grid", "courses", shown, "Naye courses jald aa rahe hain. Jaankari ke liye enquiry bhejein.");
    // "View All" usi exam ki list khole jo abhi chuni hui hai.
    var href = "all.html?type=courses" + (courseFilter ? "&exam=" + encodeURIComponent(courseFilter) : "");
    $("courses-all").href = href;
    var card = $("course-grid").querySelector(".more-card");
    if (card) card.href = href;
    updateSliders();
  }

  // Books section: upar ka banner (Settings se) aur neeche books ki list (admin > Books se).
  var hasBanner = false, hasBooks = false;
  function showBooks() {
    $("book-banner").hidden = !hasBanner;
    $("book-list-title").hidden = !(hasBanner && hasBooks);
    $("books").hidden = !hasBanner && !hasBooks;
  }

  function renderItems() {
    renderCourses();
    fillLine("test-grid", "tests", ofKind("test"), "Nayi test series jald aa rahi hain.", "on-dark");
    var books = ofKind("book");
    fillLine("book-grid", "books", books, "");
    hasBooks = books.length > 0;
    showBooks();
    updateSliders();
  }

  function renderReels() {
    Q.stopReel();
    var html = REELS.slice(0, Q.LIMIT).map(Q.reelHtml).join("");
    var more = REELS.length > Q.LIMIT;
    $("reel-grid").innerHTML = html + (html && more ? Q.moreHtml("reels", "tall") : "");
    $("reels-all").hidden = !more;
    $("faculty").hidden = !html;
    updateSliders();
  }

  function renderResults(rows) {
    $("result-grid").innerHTML = rows.map(function (r, i) {
      return '<div class="stu"><div class="ava g' + (i % 4) + '">' + esc(String(r.name).charAt(0).toUpperCase()) + "</div><h4>" + esc(r.name) + "</h4><p>" + esc(r.detail) + "</p></div>";
    }).join("");
  }

  function renderApps() {
    var apps = [["mobile", "app1", "play_url"], ["tablet", "app2", "ios_url"], ["screen", "app3", "windows_url"]];
    $("app-grid").innerHTML = apps.map(function (a) {
      var link = Q.safeLink(Q.SET[a[2]]), name = T(a[1] + "_t");
      return '<div class="app"><i>' + icon(a[0]) + "</i><h3>" + esc(name) + "</h3><p>" + esc(T(a[1] + "_d")) + "</p>"
        + (link ? '<a class="btn dark" href="' + esc(link) + '" target="_blank" rel="noopener">' + esc(T(a[1] + "_btn")) + "</a>"
          : '<a class="btn line" ' + Q.enqAttrs("Other", "Video Course", name + " ka link chahiye.") + ">" + esc(T("app_ask")) + "</a>")
        + "</div>";
    }).join("");
  }

  function renderSettings() {
    var get = function (k) { return (Q.SET[k] || "").trim(); };

    buildExams();
    Q.applyTexts();
    document.title = T("brand_name") + " | " + T("brand_tag");

    $("notice-text").textContent = get("notice_text");
    $("notice").hidden = !get("notice_text");

    var social = [["Instagram", "instagram"], ["YouTube", "youtube"], ["Telegram", "telegram"], ["WhatsApp Channel", "whatsapp_channel"],
      ["Facebook", "facebook"], ["Twitter / X", "twitter"], ["LinkedIn", "linkedin"], [T("nav_app"), "play_url"]]
      .map(function (p) { return [p[0], Q.safeLink(get(p[1]))]; }).filter(function (p) { return p[1]; });
    $("connect-dd").innerHTML = social.map(function (p) { return '<a href="' + esc(p[1]) + '" target="_blank" rel="noopener">' + esc(p[0]) + "</a>"; }).join("");
    $("connect").hidden = !social.length;

    $("hero-stats").innerHTML = Q.pairs(get("hero_stats")).map(function (p) { return "<div><b>" + esc(p[0]) + "</b><small>" + esc(p[1]) + "</small></div>"; }).join("");
    $("result-stats").innerHTML = Q.pairs(get("result_stats")).map(function (p) { return "<div><b>" + esc(p[0]) + "</b><span>" + esc(p[1]) + "</span></div>"; }).join("");

    hasBanner = !!get("book_title");
    showBooks();
    $("book-title").textContent = get("book_title");
    $("book-desc").textContent = get("book_desc");
    $("book-points").innerHTML = Q.pairs(get("book_points")).map(function (p) { return "<span>" + icon("check") + esc(p[0]) + "</span>"; }).join("");
    $("book-btn").dataset.msg = get("book_title") + " order karni hai.";

    if (get("phone")) {
      document.querySelectorAll("[data-phone]").forEach(function (el) { el.textContent = get("phone"); });
      document.querySelectorAll("[data-tel]").forEach(function (el) { el.href = "tel:+91" + get("phone").replace(/\D/g, "").slice(-10); });
    }
    if (get("email")) {
      document.querySelectorAll("[data-email]").forEach(function (el) { el.textContent = get("email"); });
      $("mail-link").href = "mailto:" + get("email");
    }
    if (get("address")) document.querySelectorAll("[data-address]").forEach(function (el) { el.textContent = get("address"); });

    renderApps();
  }

  // "View All" page ke Enquire button se aaye hon to form pehle se bhara mile.
  function fromOtherPage() {
    var p = new URLSearchParams(location.search);
    if (!p.get("int")) return;
    fillForm(p.get("exam") || "", p.get("int"), p.get("msg") || "");
    $("contact").scrollIntoView();
  }

  /* ---------- load from Supabase ---------- */
  function failed() {
    var t = "Abhi list load nahi ho saki. Thodi der baad dobara dekhein ya humein call karein.";
    $("course-grid").innerHTML = note(t);
    $("test-grid").innerHTML = note(t);
    renderApps();
    fromOtherPage();
  }

  if (!sb) {
    failed();
  } else {
    Promise.all([
      sb.from("items").select("*").eq("is_active", true).order("sort").order("id"),
      sb.from("reels").select("*").eq("is_active", true).order("sort").order("id"),
      sb.from("results").select("*").order("sort").order("id"),
      sb.from("settings").select("*")
    ]).then(function (r) {
      if (r[0].error || r[3].error) return failed();
      Q.loadSettings(r[3].data);
      ITEMS = r[0].data || [];
      REELS = r[1].data || [];
      renderSettings();
      renderItems();
      renderReels();
      renderResults(r[2].data || []);
      fromOtherPage();
    }).catch(failed);
  }

  /* ---------- enquiry form ---------- */
  var form = $("enq-form"), msg = $("enq-msg"), btn = $("enq-btn");
  function say(text, ok) { msg.textContent = text; msg.className = "msg " + (ok ? "ok" : "err"); }
  var thanks = "Dhanyavaad! Aapki enquiry mil gayi hai, hamari team jald call karegi.";

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = $("f-name").value.trim(), phone = $("f-phone").value.replace(/\D/g, "");
    if (name.length < 2) return say("Kripya apna naam likhein.");
    if (!/^[6-9]\d{9}$/.test(phone)) return say("Mobile number 10 digit ka sahi number hona chahiye.");
    if ($("f-web").value) { form.reset(); return say(thanks, true); } // honeypot: bots yeh field bharte hain
    if (!sb) return say("Enquiry nahi bheji ja saki. Kripya humein call ya WhatsApp karein.");

    btn.disabled = true;
    sb.from("enquiries").insert({
      name: name.slice(0, 60), phone: phone, exam: $("f-exam").value.slice(0, 30), interest: $("f-interest").value,
      city: $("f-city").value.trim().slice(0, 60), message: $("f-msg").value.trim().slice(0, 500)
    }).then(function (r) {
      if (r.error) say("Enquiry nahi bheji ja saki. Dobara koshish karein ya humein call karein.");
      else { form.reset(); say(thanks, true); }
    }).catch(function () {
      say("Enquiry nahi bheji ja saki. Internet check karke dobara koshish karein.");
    }).then(function () { btn.disabled = false; });
  });
})();
