(function () {
  var Q = window.QE, sb = Q.sb, esc = Q.esc;
  var $ = function (id) { return document.getElementById(id); };
  var icon = function (n) { return '<svg class="i"><use href="#i-' + n + '"/></svg>'; };

  var SET = {};      // settings table ki saari values
  var ITEMS = null;  // courses, tests, books (load hone ke baad)

  // Website ka text: admin mein badla ho to wo, warna default (shared.js ki list se).
  function T(key) { return (SET["t_" + key] || "").trim() || Q.TEXT[key] || ""; }
  function applyTexts() {
    document.querySelectorAll("[data-t]").forEach(function (el) { el.textContent = T(el.dataset.t); });
  }

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

  /* ---------- menu, enquiry buttons, video popup ---------- */
  var nav = $("nav"), menuBtn = $("menu-btn");
  menuBtn.addEventListener("click", function () { menuBtn.setAttribute("aria-expanded", nav.classList.toggle("open")); });
  nav.addEventListener("click", function (e) { if (e.target.closest("a")) nav.classList.remove("open"); });

  var dlg = $("vid"), frame = dlg.querySelector("iframe");
  dlg.querySelector("button").addEventListener("click", function () { dlg.close(); });
  dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener("close", function () { frame.src = "about:blank"; });

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-enq]");
    if (b) {
      $("f-exam").value = b.dataset.exam;
      if (!$("f-exam").value) $("f-exam").value = "Other";
      $("f-interest").value = b.dataset.int;
      $("f-msg").value = b.dataset.msg || "";
    }
    var v = e.target.closest("[data-embed]");
    if (v) {
      dlg.classList.toggle("tall", v.dataset.embed.indexOf("instagram.com") > -1);
      frame.src = v.dataset.embed;
      dlg.showModal();
    }
    var c = e.target.closest("#course-chips [data-f]");
    if (c) {
      document.querySelectorAll("#course-chips .chip").forEach(function (x) { x.setAttribute("aria-pressed", x === c); });
      document.querySelectorAll("#course-grid .course").forEach(function (card) {
        card.hidden = !!c.dataset.f && card.dataset.exam !== c.dataset.f;
      });
    }
  });

  /* ---------- rendering ---------- */
  function grad(s) {
    var n = 0; s = String(s);
    for (var i = 0; i < s.length; i++) n += s.charCodeAt(i);
    return "g" + (n % 4);
  }
  function enq(exam, interest, msg) {
    return 'href="#contact" data-enq data-exam="' + esc(exam) + '" data-int="' + esc(interest) + '" data-msg="' + esc(msg) + '"';
  }
  function card(x, kind) {
    var price;
    if (x.is_free) price = '<span class="price" style="color:var(--emerald)">Free</span>';
    else if (x.price > 0) price = '<span class="price">' + Q.inr(x.price) + (x.mrp > x.price ? "<s>" + Q.inr(x.mrp) + "</s>" : "") + "</span>";
    else price = '<span class="price"><small>' + esc(T("fee_note")) + "</small></span>";
    var tag = x.tag || (x.is_free ? "Free" : "");
    var meta = String(x.meta || "").split("·").map(function (m) { return m.trim(); }).filter(Boolean)
      .map(function (m) { return "<b>" + esc(m) + "</b>"; }).join("");
    var embed = Q.embedUrl(x.video_url), photo = Q.safeLink(x.image_url), isBook = kind === "Book";
    // Thumbnail ho to wahi dikhta hai, usi jagah aur usi size mein. Na ho to exam ke naam wala rangeen design.
    var top = photo
      ? '<div class="c-img has-img"><img src="' + esc(photo) + '" alt="" loading="lazy"></div>'
      : '<div class="c-img ' + grad(x.exam) + '">' + esc(x.exam === "Other" ? "QE" : x.exam) + "</div>";
    return '<article class="course" data-exam="' + esc(x.exam) + '">' + top + '<div class="c-body">'
      + (tag ? '<span class="c-tag ' + (x.is_free ? "free" : "") + '">' + esc(tag) + "</span>" : "")
      + "<h3>" + esc(x.title) + "</h3><p>" + esc(x.descr) + "</p>"
      + (meta ? '<div class="c-meta">' + meta + "</div>" : "")
      + '<div class="c-foot">' + price + '<span class="btns">'
      + (embed ? '<button class="btn line sm" type="button" data-embed="' + esc(embed) + '">' + esc(T("btn_demo")) + "</button>" : "")
      + '<a class="btn sm" ' + enq(x.exam, kind, x.title + (isBook ? " order karni hai." : " ke baare mein jaankari chahiye.")) + ">"
      + esc(T(isBook ? "btn_order" : "btn_enquire")) + "</a></span></div></div></article>";
  }
  var note = function (t) { return '<p class="load-note">' + t + "</p>"; };

  // Books section: upar ka banner (Settings se) aur neeche books ki list (admin > Books se).
  var hasBanner = false, hasBooks = false;
  function showBooks() {
    $("book-banner").hidden = !hasBanner;
    $("book-list-title").hidden = !(hasBanner && hasBooks);
    $("books").hidden = !hasBanner && !hasBooks;
  }

  function renderItems() {
    var items = ITEMS || [];
    var of = function (k) { return items.filter(function (x) { return x.kind === k; }); };
    var courses = of("course"), tests = of("test"), books = of("book");
    // Filter ke button usi kram mein jis kram mein exams ki list hai.
    var exams = courses.map(function (c) { return c.exam; }).filter(function (e, i, a) { return a.indexOf(e) === i; });
    exams.sort(function (a, b) {
      var ia = Q.EXAMS.indexOf(a), ib = Q.EXAMS.indexOf(b);
      return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
    });
    $("course-chips").innerHTML = exams.length > 1
      ? '<button class="chip" type="button" aria-pressed="true" data-f="">' + esc(T("chip_all")) + "</button>" + exams.map(function (e) {
        return '<button class="chip" type="button" aria-pressed="false" data-f="' + esc(e) + '">' + esc(e) + "</button>";
      }).join("") : "";
    $("course-grid").innerHTML = courses.length ? courses.map(function (c) { return card(c, "Video Course"); }).join("") : note("Naye courses jald aa rahe hain. Jaankari ke liye enquiry bhejein.");
    $("test-grid").innerHTML = tests.length ? tests.map(function (t) { return card(t, "Test Series"); }).join("") : note("Nayi test series jald aa rahi hain.");
    $("book-grid").innerHTML = books.map(function (b) { return card(b, "Book"); }).join("");
    hasBooks = books.length > 0;
    showBooks();
  }

  function renderReels(reels) {
    var html = reels.map(function (r, i) {
      var inner = '<span class="play">' + icon("play") + "</span><h3>" + esc(r.title) + "</h3><p>" + esc(r.subtitle) + "</p>";
      var embed = Q.embedUrl(r.url), link = Q.safeLink(r.url);
      if (embed) return '<button class="reel g' + (i % 4) + '" type="button" data-embed="' + esc(embed) + '">' + inner + "</button>";
      if (link) return '<a class="reel g' + (i % 4) + '" href="' + esc(link) + '" target="_blank" rel="noopener">' + inner + "</a>";
      return "";
    }).join("");
    $("reel-grid").innerHTML = html;
    $("faculty").hidden = !html;
  }

  function renderResults(rows) {
    $("result-grid").innerHTML = rows.map(function (r, i) {
      return '<div class="stu"><div class="ava g' + (i % 4) + '">' + esc(String(r.name).charAt(0).toUpperCase()) + "</div><h4>" + esc(r.name) + "</h4><p>" + esc(r.detail) + "</p></div>";
    }).join("");
  }

  function renderApps() {
    var apps = [["mobile", "app1", "play_url"], ["tablet", "app2", "ios_url"], ["screen", "app3", "windows_url"]];
    $("app-grid").innerHTML = apps.map(function (a) {
      var link = Q.safeLink(SET[a[2]]), name = T(a[1] + "_t");
      return '<div class="app"><i>' + icon(a[0]) + "</i><h3>" + esc(name) + "</h3><p>" + esc(T(a[1] + "_d")) + "</p>"
        + (link ? '<a class="btn dark" href="' + esc(link) + '" target="_blank" rel="noopener">' + esc(T(a[1] + "_btn")) + "</a>"
          : '<a class="btn line" ' + enq("Other", "Video Course", name + " ka link chahiye.") + ">" + esc(T("app_ask")) + "</a>")
        + "</div>";
    }).join("");
  }

  function renderSettings() {
    var get = function (k) { return (SET[k] || "").trim(); };

    Q.setExams(get("exams"));
    buildExams();
    applyTexts();
    document.title = T("brand_name") + " | " + T("brand_tag");

    $("notice-text").textContent = get("notice_text");
    $("notice").hidden = !get("notice_text");

    var social = [["Instagram", "instagram"],["YouTube", "youtube"], ["Telegram", "telegram"], ["WhatsApp Channel", "whatsapp_channel"],
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

  /* ---------- load from Supabase ---------- */
  function failed() {
    var t = "Abhi list load nahi ho saki. Thodi der baad dobara dekhein ya humein call karein.";
    $("course-grid").innerHTML = note(t);
    $("test-grid").innerHTML = note(t);
    renderApps();
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
      (r[3].data || []).forEach(function (row) { SET[row.k] = row.v; });
      ITEMS = r[0].data || [];
      renderSettings();
      renderItems();
      renderReels(r[1].data || []);
      renderResults(r[2].data || []);
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
