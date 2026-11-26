(function () {
  var Q = window.QE, sb = Q.sb, esc = Q.esc;
  var $ = function (id) { return document.getElementById(id); };

  /* Har list ki definition. Naya field jodna ho to yahin jodein (aur Supabase table mein column bhi). */
  var itemFields = [
    ["title", "Title", "text", 150, true],
    ["exam", "Exam", "select", Q.EXAMS],
    ["tag", "Badge (jaise Most Popular)", "text", 40],
    ["meta", 'Highlights, " · " se alag karein (jaise 12 Months · PDF Notes)', "text", 120],
    ["descr", "Description", "textarea", 500],
    ["image_url", "Thumbnail photo", "image"],
    ["price", 'Fee ₹ (khaali = "enquiry karein")', "number"],
    ["mrp", "MRP ₹ (kati hui keemat, optional)", "number"],
    ["video_url", "Demo video link (YouTube ya Instagram, optional)", "text", 300],
    ["sort", "Order (chhota number pehle)", "number"],
    ["is_free", "Free hai", "check"],
    ["is_active", "Website par dikhayein", "check"]
  ];
  var ENT = {
    courses: { label: "Video Courses", one: "Video Course", table: "items", fixed: { kind: "course" }, fields: itemFields, cols: ["title", "exam", "price", "video_url", "is_active"] },
    tests: { label: "Test Series", one: "Test Series", table: "items", fixed: { kind: "test" }, fields: itemFields, cols: ["title", "exam", "price", "is_active"] },
    books: {
      label: "Books", one: "Book", table: "items", fixed: { kind: "book" }, cols: ["title", "exam", "price", "is_active"],
      hint: "Yahan jodi gayi har book website ke Books section mein card ke roop mein dikhti hai. Fee khaali chhodne par \"Fee ke liye enquiry karein\" dikhega.",
      fields: itemFields.map(function (f) {
        if (f[0] === "meta") return ["meta", 'Highlights, " · " se alag karein (jaise 450 Pages · PYQ 2018-2024)', "text", 120];
        if (f[0] === "price") return ["price", 'Price ₹ (khaali = "enquiry karein")', "number"];
        if (f[0] === "video_url") return ["video_url", "Book ka video link (YouTube ya Instagram, optional)", "text", 300];
        return f;
      })
    },
    reels: {
      label: "Videos / Reels", one: "Video", table: "reels", fixed: {}, cols: ["title", "url", "is_active"],
      hint: "Instagram reel ya YouTube video ka link paste karein. Website par card par thumbnail dikhti hai aur click karte hi video usi box mein chalti hai. Channel ya profile ka link ho to naya tab khulega.",
      fields: [
        ["title", "Title", "text", 100, true],
        ["subtitle", "Chhoti line (jaise Faculty Reel)", "text", 100],
        ["url", "Instagram reel ya YouTube video ka link", "text", 300, true],
        ["image_url", "Thumbnail photo", "image", "YouTube ki thumbnail apne aap aa jati hai, yahan photo lagane ki zaroorat nahi. Instagram reel ke liye yahan photo lagayein (khadi photo, 720 × 1280 sabse achhi), warna card par sirf rang dikhega. JPG, PNG ya WebP.", false, "tall"],
        ["sort", "Order (chhota number pehle)", "number"],
        ["is_active", "Website par dikhayein", "check"]
      ]
    },
    docs: {
      label: "PDFs", one: "PDF", table: "docs", fixed: {}, order: "created_at", cols: ["title", "category", "file_url", "is_active"],
      hint: "Yahan jodi gayi har PDF website ke Resources wale page par us section mein dikhti hai jo aap chunte hain, View aur Download button ke saath. Nayi PDF sabse upar aati hai.",
      fields: [
        ["title", "PDF ka naam (jaise 25 November 2026 Current Affairs)", "text", 150, true],
        ["category", "Kis section mein dikhe", "select", Q.DOC_CATS.map(function (c) { return [c[0], Q.TEXT[c[1]]]; })],
        ["descr", "Chhoti jaankari (optional)", "text", 200],
        ["file_url", "PDF file", "pdf", "Computer se PDF chunein (20 MB tak). Ya agar PDF Google Drive jaisi jagah par hai to uska link upar ke box mein paste kar dein.", true],
        ["is_active", "Website par dikhayein", "check"]
      ]
    },
    posts: {
      label: "Blog", one: "Blog Post", table: "posts", fixed: {}, order: "created_at", cols: ["title", "created_at", "is_active"],
      hint: "Har post website ke Blog page par dikhti hai, aur sabse nayi posts home page par bhi. Nayi post sabse upar aati hai.",
      fields: [
        ["title", "Post ka title", "text", 150, true],
        ["summary", "Chhota saar (card par dikhta hai, 1-2 line)", "textarea", 300],
        ["image_url", "Post ki photo (optional)", "image", "Sabse achha size 1280 × 720 (16:9). JPG, PNG ya WebP."],
        ["body", "Poora lekh", "longtext", 30000, true],
        ["is_active", "Website par dikhayein", "check"]
      ]
    },
    results: {
      label: "Results", one: "Selected Student", table: "results", fixed: {}, cols: ["name", "detail"],
      fields: [
        ["name", "Student ka naam", "text", 100, true],
        ["detail", "Detail (jaise Selected in RAS 2018)", "text", 200],
        ["sort", "Order (chhota number pehle)", "number"]
      ]
    }
  };
  var SETTINGS = [
    ["Exams ki list", [
      ["exams", "Har line mein ek exam. Yahi list course ke Exam, website ke filter button, upar ki chalti patti aur enquiry form mein aati hai. \"Other\" apne aap aakhir mein judta hai.", true]]],
    ["Notice aur Contact", [
      ["notice_text", "Upar ki notice patti (khaali = patti band)"], ["phone", "Phone / WhatsApp number"],
      ["email", "Support email"], ["address", "Offices"]]],
    ["Numbers (har line: number|label)", [
      ["hero_stats", "Hero ke 4 numbers", true], ["result_stats", "Results ke numbers", true]]],
    ["Book section", [
      ["book_title", "Book ka title (khaali = section band)"], ["book_desc", "Book ki jaankari", true],
      ["book_points", "Khaas baatein (har line mein ek)", true]]],
    ["App aur Social links (khaali = nahi dikhega)", [
      ["play_url", "Play Store link"], ["ios_url", "App Store link"], ["windows_url", "Windows app link"],
      ["instagram", "Instagram"], ["youtube", "YouTube"], ["telegram", "Telegram"], ["whatsapp_channel", "WhatsApp Channel"],
      ["facebook", "Facebook"], ["twitter", "Twitter / X"], ["linkedin", "LinkedIn"]]]
  ];
  var COL_LABEL = { is_active: "Status", video_url: "Demo video", url: "Link", price: "Fee", category: "Section", file_url: "File", created_at: "Date" };

  var S = { tab: "enquiries", edit: null, rows: [], enq: [], fq: "", fs: "" };
  var view = $("view");

  /* ---------- helpers ---------- */
  var flashTimer;
  function flash(text, bad) {
    var f = $("flash");
    f.textContent = text; f.className = "flash" + (bad ? " bad" : ""); f.hidden = false;
    clearTimeout(flashTimer);
    flashTimer = setTimeout(function () { f.hidden = true; }, 4500);
  }
  function fail(error) {
    flash("Kaam nahi ho saka" + (error && error.message ? ": " + error.message : ". Dobara koshish karein."), true);
  }
  function fmtDate(t) {
    return t ? new Date(t).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "";
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* ---------- login ---------- */
  function showLogin(text) {
    $("body").className = "auth"; $("app").hidden = true; $("login").hidden = false;
    $("login-msg").textContent = text || "";
  }
  function enter() {
    sb.rpc("is_admin").then(function (r) {
      if (r.error || r.data !== true) {
        return sb.auth.signOut().then(function () { showLogin("Is account ko admin access nahi diya gaya hai."); });
      }
      $("body").className = ""; $("login").hidden = true; $("app").hidden = false;
      drawTabs();
      sb.from("settings").select("*").eq("k", "exams").then(function (x) {
        if (x.data && x.data[0]) Q.setExams(x.data[0].v);
        render();
      });
    });
  }
  $("login").addEventListener("submit", function (e) {
    e.preventDefault();
    if (!sb) return;
    $("l-btn").disabled = true; $("login-msg").textContent = "";
    sb.auth.signInWithPassword({ email: $("l-email").value.trim(), password: $("l-pass").value }).then(function (r) {
      $("l-btn").disabled = false;
      if (r.error) return showLogin("Email ya password galat hai.");
      $("l-pass").value = "";
      enter();
    });
  });
  $("logout").addEventListener("click", function () { sb.auth.signOut().then(function () { showLogin(""); }); });

  if (!sb) {
    showLogin("Supabase ki details nahi mili. config.js mein URL aur key bharein.");
  } else {
    sb.auth.getSession().then(function (r) { if (r.data && r.data.session) enter(); });
  }

  /* ---------- tabs ---------- */
  function drawTabs() {
    var newCount = S.enq.filter(function (x) { return x.status === "new"; }).length;
    var tabs = [["enquiries", "Enquiries" + (newCount ? " <b>" + newCount + "</b>" : "")]]
      .concat(Object.keys(ENT).map(function (k) { return [k, ENT[k].label]; }), [["texts", "Website Text"], ["settings", "Settings"]]);
    $("tabs").innerHTML = tabs.map(function (t) {
      return '<button type="button" data-tab="' + t[0] + '" class="' + (S.tab === t[0] ? "on" : "") + '">' + t[1] + "</button>";
    }).join("");
  }
  $("tabs").addEventListener("click", function (e) {
    var b = e.target.closest("[data-tab]"); if (!b) return;
    S.tab = b.dataset.tab; S.edit = null; drawTabs(); render();
  });

  function render() {
    view.innerHTML = '<p class="loading">Load ho raha hai…</p>';
    if (S.tab === "enquiries") loadEnquiries();
    else if (S.tab === "settings") loadSettings();
    else if (S.tab === "texts") loadTexts();
    else loadEntity();
  }

  /* ---------- enquiries ---------- */
  function loadEnquiries() {
    sb.from("enquiries").select("*").order("id", { ascending: false }).limit(2000).then(function (r) {
      if (r.error) return fail(r.error);
      S.enq = r.data || []; drawTabs(); drawEnquiries();
    });
  }
  function filteredEnq() {
    var q = S.fq.toLowerCase();
    return S.enq.filter(function (x) {
      return (!S.fs || x.status === S.fs) && (!q || [x.name, x.phone, x.city].some(function (v) { return String(v || "").toLowerCase().indexOf(q) > -1; }));
    });
  }
  function enqRows() {
    var rows = filteredEnq();
    if (!rows.length) return '<tr><td colspan="9" class="none">' + (S.enq.length ? "Is filter mein koi enquiry nahi hai." : "Abhi koi enquiry nahi aayi hai. Website ke form se aayi har enquiry yahan dikhegi.") + "</td></tr>";
    return rows.map(function (x) {
      return '<tr><td class="num">' + fmtDate(x.created_at) + "</td><td><b>" + esc(x.name) + '</b></td><td class="num"><a href="tel:+91' + esc(x.phone) + '">' + esc(x.phone) + "</a></td><td>"
        + esc(x.exam) + "</td><td>" + esc(x.interest) + "</td><td>" + esc(x.city) + "</td><td>" + esc(x.message) + "</td>"
        + '<td><select class="st s-' + esc(x.status) + '" data-status="' + x.id + '" aria-label="Status">' + Q.STATUSES.map(function (s) {
          return '<option value="' + s + '"' + (s === x.status ? " selected" : "") + ">" + cap(s) + "</option>";
        }).join("") + "</select></td>"
        + '<td><button class="link del" type="button" data-del-enq="' + x.id + '">Delete</button></td></tr>';
    }).join("");
  }
  function drawEnquiries() {
    var c = function (k) { return S.enq.filter(function (x) { return x.status === k; }).length; };
    view.innerHTML = "<h1>Student Enquiries</h1>"
      + '<div class="tiles"><div class="tile"><b>' + S.enq.length + '</b><span>Total</span></div><div class="tile t-new"><b>' + c("new") + '</b><span>New</span></div>'
      + '<div class="tile t-con"><b>' + c("contacted") + '</b><span>Contacted</span></div><div class="tile t-enr"><b>' + c("enrolled") + "</b><span>Enrolled</span></div></div>"
      + '<div class="tools"><input type="search" id="fq" value="' + esc(S.fq) + '" placeholder="Name, mobile ya city" aria-label="Search">'
      + '<select id="fs" aria-label="Status"><option value="">All status</option>' + Q.STATUSES.map(function (s) { return '<option value="' + s + '"' + (S.fs === s ? " selected" : "") + ">" + cap(s) + "</option>"; }).join("") + "</select>"
      + '<button class="btn sm line" type="button" id="csv">Excel (CSV) download</button></div>'
      + '<div class="scroll"><table><thead><tr><th>Date</th><th>Name</th><th>Mobile</th><th>Exam</th><th>Interest</th><th>City</th><th>Message</th><th>Status</th><th></th></tr></thead><tbody id="enq-body">' + enqRows() + "</tbody></table></div>";
  }
  function downloadCsv() {
    // Excel formula injection se bachav: = + - @ se shuru hone wali value ke aage ' lagta hai
    var cell = function (v) { v = String(v == null ? "" : v); if (/^[=+\-@]/.test(v)) v = "'" + v; return '"' + v.replace(/"/g, '""') + '"'; };
    var lines = [["Date", "Name", "Mobile", "Exam", "Interest", "City", "Message", "Status"]].concat(filteredEnq().map(function (x) {
      return [fmtDate(x.created_at), x.name, x.phone, x.exam, x.interest, x.city, x.message, x.status];
    })).map(function (r) { return r.map(cell).join(","); }).join("\r\n");
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + lines], { type: "text/csv;charset=utf-8" }));
    a.download = "enquiries-" + new Date().toISOString().slice(0, 10) + ".csv";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  /* ---------- courses / tests / reels / results ---------- */
  function loadEntity() {
    var E = ENT[S.tab], qy = sb.from(E.table).select("*");
    Object.keys(E.fixed).forEach(function (k) { qy = qy.eq(k, E.fixed[k]); });
    qy = E.order ? qy.order(E.order, { ascending: false }) : qy.order("sort").order("id");
    qy.then(function (r) {
      if (r.error) return fail(r.error);
      S.rows = r.data || []; drawEntity();
    });
  }
  function fieldHtml(f, cur) {
    var k = f[0], label = esc(f[1]), type = f[2];
    var val = cur ? cur[k] : (k === "is_active" ? true : "");
    if (type === "check") return '<label class="check"><input type="checkbox" id="e-' + k + '"' + (val ? " checked" : "") + "> " + label + "</label>";
    if (type === "select") {
      // Option ya to seedha naam hota hai, ya [value, dikhne wala naam].
      var opts = f[3].map(function (o) { return Array.isArray(o) ? o : [o, o]; });
      if (val && !opts.some(function (o) { return o[0] === val; })) opts.unshift([val, val]); // purana exam jo ab list mein nahi hai
      return "<label>" + label + '<select id="e-' + k + '">' + opts.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (o[0] === val ? " selected" : "") + ">" + esc(o[1]) + "</option>"; }).join("") + "</select></label>";
    }
    if (type === "image") {
      var url = Q.safeLink(val);
      return '<div class="full imgf"><span class="lbl">' + label + '</span><div class="imgrow">'
        + '<div class="thumb' + (f[5] === "tall" ? " tall" : "") + '" id="e-' + k + '-box">' + (url ? '<img src="' + esc(url) + '" alt="">' : "<span>Photo nahi hai</span>") + "</div>"
        + '<div class="imgctl"><input type="file" id="e-' + k + '-file" accept="image/png,image/jpeg,image/webp" aria-label="' + label + '">'
        + '<input type="hidden" id="e-' + k + '" value="' + esc(url) + '">'
        + '<button class="link del" type="button" data-clear-img="' + k + '"' + (url ? "" : " hidden") + ">Photo hatayein</button>"
        + "<small>" + esc(f[3] || "Sabse achha size 1280 × 720 (YouTube thumbnail jaisa, 16:9). Is naap ki photo card par poori dikhti hai, kuch nahi katta. JPG, PNG ya WebP.") + "</small></div></div></div>";
    }
    if (type === "pdf") {
      return '<div class="full imgf"><span class="lbl">' + label + '</span><div class="imgctl">'
        + '<input id="e-' + k + '" maxlength="500" placeholder="PDF ka link (file chunne par apne aap bhar jayega)" value="' + esc(val) + '">'
        + '<input type="file" id="e-' + k + '-file" accept="application/pdf,.pdf" aria-label="' + label + '">'
        + (val ? '<a href="' + esc(Q.safeLink(val)) + '" target="_blank" rel="noopener">Abhi lagi hui PDF dekhein ↗</a>' : "")
        + "<small>" + esc(f[3]) + "</small></div></div>";
    }
    if (type === "longtext") {
      return '<label class="full">' + label + '<textarea id="e-' + k + '" rows="16" maxlength="' + f[3] + '">' + esc(val) + "</textarea>"
        + '<small class="help">Likhne ka tareeka: naya paragraph ke liye ek line khaali chhodein. Heading ke liye line ke shuru mein "## " lagayein. Bullet ke liye har line "- " se shuru karein. Mota likhne ke liye **shabd**. Link seedha paste karein, wo apne aap click hone wala ban jata hai.</small></label>';
    }
    if (type === "textarea") return '<label class="full">' + label + '<textarea id="e-' + k + '" rows="3" maxlength="' + f[3] + '">' + esc(val) + "</textarea></label>";
    if (type === "number") return "<label>" + label + '<input id="e-' + k + '" inputmode="numeric" value="' + (Number(val) ? Number(val) : "") + '"></label>';
    return '<label class="' + (f[3] > 110 ? "full" : "") + '">' + label + '<input id="e-' + k + '" maxlength="' + f[3] + '" value="' + esc(val) + '"' + (f[4] ? " required" : "") + "></label>";
  }
  function cellHtml(E, c, r) {
    if (c === "is_active") return r[c] ? '<span class="live">Live</span>' : '<span class="hid">Hidden</span>';
    if (c === "price") return r.is_free ? "Free" : (r[c] ? Q.inr(r[c]) : "—");
    if (c === "video_url" || c === "url") {
      if (!r[c]) return "—";
      var short = r[c].length > 42 ? r[c].slice(0, 41) + "…" : r[c];
      return (Q.embedUrl(r[c]) ? "Video ✓" : "Link") + " <small>" + esc(short) + "</small>";
    }
    if (c === "file_url") return r[c] ? '<a href="' + esc(Q.safeLink(r[c])) + '" target="_blank" rel="noopener">PDF kholein ↗</a>' : "—";
    if (c === "created_at") return esc(fmtDate(r[c]).split(",")[0]);
    if (c === "category") {
      var cat = Q.DOC_CATS.filter(function (x) { return x[0] === r[c]; })[0];
      return esc(cat ? Q.TEXT[cat[1]] : r[c]);
    }
    return c === E.fields[0][0] ? "<b>" + esc(r[c]) + "</b>" : esc(r[c]);
  }
  function drawEntity() {
    var E = ENT[S.tab], cur = null;
    if (S.edit !== null && S.edit !== "new") {
      cur = S.rows.filter(function (r) { return r.id === S.edit; })[0] || null;
      if (!cur) S.edit = null;
    }
    var form = "";
    if (S.edit !== null) {
      form = '<form class="panel" id="e-form"><h2>' + (cur ? "Edit: " + esc(cur[E.fields[0][0]]) : "Naya " + esc(E.one)) + '</h2><div class="fields">'
        + E.fields.map(function (f) { return fieldHtml(f, cur); }).join("")
        + '</div><button class="btn" type="submit" id="e-save">Save</button> <button class="btn line" type="button" id="e-cancel">Cancel</button></form>';
    }
    view.innerHTML = '<div class="head"><h1>' + esc(E.label) + '</h1><button class="btn sm" type="button" id="e-new">+ Naya ' + esc(E.one) + "</button></div>"
      + (E.hint ? '<p class="hint">' + esc(E.hint) + "</p>" : "") + form
      + '<div class="scroll"><table><thead><tr>' + E.cols.map(function (c) { return "<th>" + (COL_LABEL[c] || cap(c)) + "</th>"; }).join("") + "<th></th></tr></thead><tbody>"
      + (S.rows.length ? S.rows.map(function (r) {
        return "<tr>" + E.cols.map(function (c) { return "<td>" + cellHtml(E, c, r) + "</td>"; }).join("")
          + '<td class="acts"><button class="link" type="button" data-edit="' + r.id + '">Edit</button><button class="link del" type="button" data-del="' + r.id + '">Delete</button></td></tr>';
      }).join("") : '<tr><td colspan="' + (E.cols.length + 1) + '" class="none">Abhi kuch nahi joda gaya hai. Upar ke button se jodein.</td></tr>')
      + "</tbody></table></div>";
  }
  function saveEntity() {
    var E = ENT[S.tab], data = {}, missing = null, uploads = [], badLink = false;
    Object.keys(E.fixed).forEach(function (k) { data[k] = E.fixed[k]; });
    E.fields.forEach(function (f) {
      var el = $("e-" + f[0]);
      if (f[2] === "check") data[f[0]] = el.checked;
      else if (f[2] === "number") data[f[0]] = Math.min(Number(el.value.replace(/\D/g, "")) || 0, 100000000);
      else if (f[2] === "image" || f[2] === "pdf") {
        data[f[0]] = el.value.trim();
        var picked = $("e-" + f[0] + "-file").files[0];
        if (picked) { uploads.push([f[0], picked, f[2]]); data[f[0]] = "uploading"; } // asli link upload ke baad bharta hai
        else if (f[2] === "pdf" && data[f[0]] && !Q.safeLink(data[f[0]])) { badLink = true; }
      }
      else data[f[0]] = el.value.trim();
      if (f[4] && !data[f[0]] && !missing) missing = f;
    });
    if (missing) { flash(missing[1] + " bharna zaroori hai.", true); $("e-" + missing[0]).focus(); return; }
    if (badLink) { flash("PDF ka link https:// se shuru hona chahiye, ya computer se file chunein.", true); return; }
    var btn = $("e-save");
    btn.disabled = true; btn.textContent = uploads.length ? "File upload ho rahi hai…" : "Save ho raha hai…";
    var done = function () { btn.disabled = false; btn.textContent = "Save"; };
    Promise.all(uploads.map(function (u) {
      if (u[2] === "pdf") return uploadPdf(u[1], data.category || "pdf").then(function (url) { data[u[0]] = url; data.file_size = u[1].size; });
      return uploadImage(u[1], E.fixed.kind || E.table).then(function (url) { data[u[0]] = url; });
    })).then(function () {
      return S.edit === "new" ? sb.from(E.table).insert(data) : sb.from(E.table).update(data).eq("id", S.edit);
    }).then(function (r) {
      if (r.error) { done(); return fail(r.error); }
      S.edit = null; flash(E.one + " save ho gaya."); loadEntity();
    }).catch(function (err) { done(); fail(err); });
  }

  /* ---------- thumbnail upload (Supabase Storage, bucket "thumbs") ---------- */
  // Badi photo ko 1200px chaudai tak chhota karke JPG banata hai, taaki website halki rahe.
  function shrinkImage(file) {
    return new Promise(function (resolve) {
      var img = new Image(), src = URL.createObjectURL(file);
      img.onload = function () {
        URL.revokeObjectURL(src);
        var scale = Math.min(1, 1200 / img.naturalWidth);
        var c = document.createElement("canvas");
        c.width = Math.round(img.naturalWidth * scale); c.height = Math.round(img.naturalHeight * scale);
        var ctx = c.getContext("2d");
        ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0, c.width, c.height);
        c.toBlob(function (b) { resolve(b || file); }, "image/jpeg", 0.86);
      };
      img.onerror = function () { URL.revokeObjectURL(src); resolve(file); };
      img.src = src;
    });
  }
  function uploadPdf(file, folder) {
    if (file.type !== "application/pdf" && !/\.pdf$/i.test(file.name)) return Promise.reject({ message: "Sirf PDF file chalegi." });
    if (file.size > 20 * 1024 * 1024) return Promise.reject({ message: "PDF 20 MB se chhoti honi chahiye. Badi file ho to use Google Drive par daal kar uska link lagayein." });
    var clean = file.name.replace(/\.pdf$/i, "").replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "file";
    var path = folder + "/" + Date.now() + "-" + clean + ".pdf";
    return sb.storage.from("docs").upload(path, file, { contentType: "application/pdf", cacheControl: "3600" }).then(function (r) {
      if (r.error) throw { message: "PDF upload nahi ho saki (" + r.error.message + ")" };
      return sb.storage.from("docs").getPublicUrl(path).data.publicUrl;
    });
  }
  function uploadImage(file, folder) {
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) return Promise.reject({ message: "Sirf JPG, PNG ya WebP photo chalegi." });
    if (file.size > 8 * 1024 * 1024) return Promise.reject({ message: "Photo 8 MB se chhoti honi chahiye." });
    return shrinkImage(file).then(function (blob) {
      var ext = blob.type === "image/jpeg" ? "jpg" : (blob.type === "image/png" ? "png" : "webp");
      var path = folder + "/" + Date.now() + "-" + Math.random().toString(36).slice(2, 8) + "." + ext;
      return sb.storage.from("thumbs").upload(path, blob, { contentType: blob.type, cacheControl: "31536000" }).then(function (r) {
        if (r.error) throw { message: "Photo upload nahi ho saki (" + r.error.message + ")" };
        return sb.storage.from("thumbs").getPublicUrl(path).data.publicUrl;
      });
    });
  }

  /* ---------- settings ---------- */
  function loadSettings() {
    sb.from("settings").select("*").then(function (r) {
      if (r.error) return fail(r.error);
      var s = {};
      (r.data || []).forEach(function (row) { s[row.k] = row.v; });
      if (!(s.exams || "").trim()) s.exams = Q.EXAMS.filter(function (x) { return x !== "Other"; }).join("\n");
      view.innerHTML = '<h1>Settings</h1><form class="panel" id="s-form">' + SETTINGS.map(function (g) {
        return "<h2>" + esc(g[0]) + '</h2><div class="fields">' + g[1].map(function (f) {
          return f[2] ? '<label class="full">' + esc(f[1]) + '<textarea id="s-' + f[0] + '" rows="4">' + esc(s[f[0]]) + "</textarea></label>"
            : "<label>" + esc(f[1]) + '<input id="s-' + f[0] + '" value="' + esc(s[f[0]]) + '"></label>';
        }).join("") + "</div>";
      }).join("") + '<button class="btn" type="submit">Settings Save Karein</button></form>'
        + '<form class="panel" id="p-form" style="max-width:520px"><h2>Password badlein</h2><div class="fields">'
        + '<label class="full">Naya password (kam se kam 8 akshar)<input type="password" id="p-new" required minlength="8" autocomplete="new-password"></label>'
        + '<label class="full">Naya password dobara<input type="password" id="p-again" required autocomplete="new-password"></label>'
        + '</div><button class="btn" type="submit">Password Badlein</button></form>';
    });
  }

  /* ---------- website text ---------- */
  function loadTexts() {
    sb.from("settings").select("*").then(function (r) {
      if (r.error) return fail(r.error);
      var s = {};
      (r.data || []).forEach(function (row) { s[row.k] = row.v; });
      view.innerHTML = '<div class="head"><h1>Website Text</h1></div>'
        + '<p class="hint">Website par jo bhi likha hai wo yahan se badlein. Kisi box ko khaali chhod kar save karne par uska purana (default) text wapas aa jata hai. Courses, books, results aur phone number apne apne tab se badalte hain.</p>'
        + '<form id="t-form">' + Q.TEXTS.map(function (g) {
          return '<div class="panel"><h2>' + esc(g[0]) + '</h2><div class="fields">' + g[1].map(function (f) {
            var val = (s["t_" + f[0]] || "").trim() || f[2], long = f[3] || f[2].length > 60;
            return '<label class="' + (long ? "full" : "") + '">' + esc(f[1]) + (long
              ? '<textarea id="t-' + f[0] + '" rows="2" maxlength="400">' + esc(val) + "</textarea>"
              : '<input id="t-' + f[0] + '" maxlength="120" value="' + esc(val) + '">') + "</label>";
          }).join("") + "</div></div>";
        }).join("") + '<div class="savebar"><button class="btn" type="submit">Saara Text Save Karein</button></div></form>';
    });
  }

  /* ---------- events inside the view ---------- */
  view.addEventListener("input", function (e) {
    if (e.target.id === "fq") { S.fq = e.target.value.trim(); $("enq-body").innerHTML = enqRows(); }
  });
  view.addEventListener("change", function (e) {
    var t = e.target;
    if (t.id === "fs") { S.fs = t.value; $("enq-body").innerHTML = enqRows(); }
    if (t.type === "file" && t.files[0] && /^image\//.test(t.files[0].type)) {
      var key = t.id.replace(/^e-|-file$/g, ""), box = $("e-" + key + "-box"), pic = document.createElement("img");
      pic.alt = ""; pic.src = URL.createObjectURL(t.files[0]);
      box.innerHTML = ""; box.appendChild(pic);
      view.querySelector('[data-clear-img="' + key + '"]').hidden = false;
    }
    if (t.dataset.status) {
      sb.from("enquiries").update({ status: t.value }).eq("id", Number(t.dataset.status)).then(function (r) {
        if (r.error) return fail(r.error);
        loadEnquiries();
      });
    }
  });
  view.addEventListener("click", function (e) {
    var t = e.target.closest("button"); if (!t) return;
    if (t.id === "csv") return downloadCsv();
    if (t.dataset.clearImg) {
      var ck = t.dataset.clearImg;
      $("e-" + ck).value = ""; $("e-" + ck + "-file").value = ""; t.hidden = true;
      $("e-" + ck + "-box").innerHTML = "<span>Photo nahi hai</span>";
      return;
    }
    if (t.id === "e-new") { S.edit = "new"; return drawEntity(); }
    if (t.id === "e-cancel") { S.edit = null; return drawEntity(); }
    if (t.dataset.edit) { S.edit = Number(t.dataset.edit); drawEntity(); return window.scrollTo(0, 0); }
    if (t.dataset.del && window.confirm("Delete karein?")) {
      var E = ENT[S.tab];
      sb.from(E.table).delete().eq("id", Number(t.dataset.del)).then(function (r) {
        if (r.error) return fail(r.error);
        flash(E.one + " delete ho gaya."); loadEntity();
      });
    }
    if (t.dataset.delEnq && window.confirm("Yeh enquiry delete karein?")) {
      sb.from("enquiries").delete().eq("id", Number(t.dataset.delEnq)).then(function (r) {
        if (r.error) return fail(r.error);
        flash("Enquiry delete ho gayi."); loadEnquiries();
      });
    }
  });
  view.addEventListener("submit", function (e) {
    e.preventDefault();
    if (e.target.id === "e-form") return saveEntity();
    if (e.target.id === "t-form") {
      var trows = [];
      Q.TEXTS.forEach(function (g) { g[1].forEach(function (f) {
        var v = $("t-" + f[0]).value.trim();
        trows.push({ k: "t_" + f[0], v: v === f[2] ? "" : v }); // default jaisa ho to khaali, taaki default hi chale
      }); });
      sb.from("settings").upsert(trows).then(function (r) { r.error ? fail(r.error) : flash("Website ka text save ho gaya. Website refresh karke dekhein."); });
    }
    if (e.target.id === "s-form") {
      var rows = [];
      SETTINGS.forEach(function (g) { g[1].forEach(function (f) { rows.push({ k: f[0], v: $("s-" + f[0]).value.trim().slice(0, 2000) }); }); });
      sb.from("settings").upsert(rows).then(function (r) {
        if (r.error) return fail(r.error);
        Q.setExams($("s-exams").value); flash("Settings save ho gayi.");
      });
    }
    if (e.target.id === "p-form") {
      var p = $("p-new").value;
      if (p.length < 8) return flash("Password kam se kam 8 akshar ka rakhein.", true);
      if (p !== $("p-again").value) return flash("Dono password alag hain.", true);
      sb.auth.updateUser({ password: p }).then(function (r) {
        if (r.error) return fail(r.error);
        e.target.reset(); flash("Password badal gaya.");
      });
    }
  });
})();
