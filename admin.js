(function () {
  var Q = window.QE, sb = Q.sb, esc = Q.esc;
  var $ = function (id) { return document.getElementById(id); };

  /* Har list ki definition. Naya field jodna ho to yahin jodein (aur Supabase table mein column bhi). */
  var itemFields = [
    ["title", "Title", "text", 150, true],
    ["exam", "Exam", "select", Q.EXAMS],
    ["tag", "Badge (e.g. Most Popular)", "text", 40],
    ["meta", 'Highlights, separated by " · " (e.g. 12 Months · PDF Notes)', "text", 120],
    ["descr", "Description", "textarea", 500],
    ["image_url", "Thumbnail photo", "image"],
    ["price", 'Price (₹). Leave empty to show "Enquire for price"', "number"],
    ["mrp", "MRP (₹). Shown struck through next to the price (optional)", "number"],
    ["video_url", "Demo video link (YouTube or Instagram, optional)", "text", 300],
    ["buy_url", 'Buy Now link. The page where the student buys this item. Leave empty to show the "Enquire" button instead', "text", 500],
    ["sort", "Display order (lower number first)", "number"],
    ["is_free", "Free", "check"],
    ["is_active", "Show on website", "check"]
  ];
  var ENT = {
    courses: { label: "Video Courses", one: "Video Course", table: "items", fixed: { kind: "course" }, fields: itemFields, cols: ["title", "exam", "price", "video_url", "is_active"] },
    tests: { label: "Test Series", one: "Test Series", table: "items", fixed: { kind: "test" }, fields: itemFields, cols: ["title", "exam", "price", "is_active"] },
    books: {
      label: "Books", one: "Book", table: "items", fixed: { kind: "book" }, cols: ["title", "exam", "price", "is_active"],
      hint: "Every book added here appears as a card in the Books section of the website. If the price is left empty, \"Enquire for price\" is shown.",
      fields: itemFields.map(function (f) {
        if (f[0] === "meta") return ["meta", 'Highlights, separated by " · " (e.g. 450 Pages · PYQ 2018-2024)', "text", 120];
        if (f[0] === "price") return ["price", 'Price (₹). Leave empty to show "Enquire for price"', "number"];
        if (f[0] === "video_url") return ["video_url", "Book video link (YouTube or Instagram, optional)", "text", 300];
        return f;
      })
    },
    reels: {
      label: "Videos / Reels", one: "Video", table: "reels", fixed: {}, cols: ["title", "url", "is_active"],
      hint: "Paste the link of an Instagram reel or a YouTube video. The website shows its thumbnail on a card, and the video plays in the same box when clicked. A channel or profile link opens in a new tab.",
      fields: [
        ["title", "Title", "text", 100, true],
        ["subtitle", "Subtitle (e.g. Faculty Reel)", "text", 100],
        ["url", "Instagram reel or YouTube video link", "text", 300, true],
        ["image_url", "Thumbnail photo", "image", "YouTube thumbnails are added automatically, so no image is needed here. For an Instagram reel, upload a portrait image (720 × 1280 recommended); otherwise the card shows a plain colour. JPG, PNG or WebP.", false, "tall"],
        ["sort", "Display order (lower number first)", "number"],
        ["is_active", "Show on website", "check"]
      ]
    },
    docs: {
      label: "PDFs", one: "PDF", table: "docs", fixed: {}, order: "created_at", cols: ["title", "category", "file_url", "is_active"],
      hint: "Every PDF added here appears on the Resources page of the website, in the section you choose, with View and Download buttons. The newest PDF is listed first.",
      fields: [
        ["title", "PDF title (e.g. 25 November 2026 Current Affairs)", "text", 150, true],
        ["category", "Section", "select", Q.DOC_CATS.map(function (c) { return [c[0], Q.TEXT[c[1]]]; })],
        ["descr", "Short description (optional)", "text", 200],
        ["file_url", "PDF file", "pdf", "Choose a PDF from your computer (up to 20 MB). If the PDF is hosted elsewhere, such as Google Drive, paste its link in the box above instead.", true],
        ["is_active", "Show on website", "check"]
      ]
    },
    posts: {
      label: "Blog", one: "Blog Post", table: "posts", fixed: {}, order: "created_at", cols: ["title", "created_at", "is_active"],
      hint: "Every post appears on the Blog page of the website, and the latest posts also appear on the home page. The newest post is listed first.",
      fields: [
        ["title", "Post title", "text", 150, true],
        ["summary", "Summary (shown on the card, 1-2 lines)", "textarea", 300],
        ["image_url", "Post image (optional)", "image", "Recommended size: 1280 × 720 (16:9). JPG, PNG or WebP."],
        ["body", "Full article", "longtext", 30000, true],
        ["is_active", "Show on website", "check"]
      ]
    },
    results: {
      label: "Results", one: "Selected Student", table: "results", fixed: {}, cols: ["name", "detail"],
      fields: [
        ["name", "Student name", "text", 100, true],
        ["detail", "Detail (e.g. Selected in RAS 2018)", "text", 200],
        ["sort", "Display order (lower number first)", "number"]
      ]
    }
  };
  var SETTINGS = [
    ["Exam List", [
      ["exams", "One exam per line. This list is used for the Exam field of courses, the filter buttons on the website, the scrolling strip in the hero and the enquiry form. \"Other\" is added at the end automatically.", true]]],
    ["Notice and Contact", [
      ["notice_text", "Notice bar text (leave empty to hide the bar)"], ["phone", "Phone / WhatsApp number"],
      ["email", "Support email"], ["address", "Offices"]]],
    ["Statistics (one per line: number|label)", [
      ["hero_stats", "Hero statistics (4)", true], ["result_stats", "Results statistics", true]]],
    ["Book section", [
      ["book_title", "Book title (leave empty to hide the whole book banner)"], ["book_desc", "Book description", true],
      ["book_points", "Highlights (one per line)", true]]],
    ["App and Social Links (leave empty to hide)", [
      ["play_url", "Play Store link"], ["ios_url", "App Store link"], ["windows_url", "Windows app link"],
      ["instagram", "Instagram"], ["youtube", "YouTube"], ["telegram", "Telegram"], ["whatsapp_channel", "WhatsApp Channel"],
      ["facebook", "Facebook"], ["twitter", "Twitter / X"], ["linkedin", "LinkedIn"]]]
  ];
  var COL_LABEL = { is_active: "Status", video_url: "Demo video", url: "Link", price: "Price", category: "Section", file_url: "File", created_at: "Date" };

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
    flash("Something went wrong" + (error && error.message ? ": " + error.message : ". Please try again."), true);
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
        return sb.auth.signOut().then(function () { showLogin("This account does not have admin access."); });
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
      if (r.error) return showLogin("Incorrect email or password.");
      $("l-pass").value = "";
      enter();
    });
  });
  $("logout").addEventListener("click", function () { sb.auth.signOut().then(function () { showLogin(""); }); });

  if (!sb) {
    showLogin("Supabase details are missing. Add the project URL and key in config.js.");
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
    view.innerHTML = '<p class="loading">Loading…</p>';
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
    if (!rows.length) return '<tr><td colspan="9" class="none">' + (S.enq.length ? "No enquiries match this filter." : "No enquiries yet. Every enquiry sent from the website form will appear here.") + "</td></tr>";
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
      + '<div class="tools"><input type="search" id="fq" value="' + esc(S.fq) + '" placeholder="Search by name, mobile or city" aria-label="Search">'
      + '<select id="fs" aria-label="Status"><option value="">All status</option>' + Q.STATUSES.map(function (s) { return '<option value="' + s + '"' + (S.fs === s ? " selected" : "") + ">" + cap(s) + "</option>"; }).join("") + "</select>"
      + '<button class="btn sm line" type="button" id="csv">Download Excel (CSV)</button></div>'
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
        + '<div class="thumb' + (f[5] === "tall" ? " tall" : "") + '" id="e-' + k + '-box">' + (url ? '<img src="' + esc(url) + '" alt="">' : "<span>No image</span>") + "</div>"
        + '<div class="imgctl"><input type="file" id="e-' + k + '-file" accept="image/png,image/jpeg,image/webp" aria-label="' + label + '">'
        + '<input type="hidden" id="e-' + k + '" value="' + esc(url) + '">'
        + '<button class="link del" type="button" data-clear-img="' + k + '"' + (url ? "" : " hidden") + ">Remove image</button>"
        + "<small>" + esc(f[3] || "Recommended size: 1280 × 720 (16:9, same as a YouTube thumbnail). An image of this size is shown in full on the card without cropping. JPG, PNG or WebP.") + "</small></div></div></div>";
    }
    if (type === "pdf") {
      return '<div class="full imgf"><span class="lbl">' + label + '</span><div class="imgctl">'
        + '<input id="e-' + k + '" maxlength="500" placeholder="PDF link (filled in automatically when you choose a file)" value="' + esc(val) + '">'
        + '<input type="file" id="e-' + k + '-file" accept="application/pdf,.pdf" aria-label="' + label + '">'
        + (val ? '<a href="' + esc(Q.safeLink(val)) + '" target="_blank" rel="noopener">View current PDF ↗</a>' : "")
        + "<small>" + esc(f[3]) + "</small></div></div>";
    }
    if (type === "longtext") {
      return '<label class="full">' + label + '<textarea id="e-' + k + '" rows="16" maxlength="' + f[3] + '">' + esc(val) + "</textarea>"
        + '<small class="help">Formatting: leave a blank line to start a new paragraph. Start a line with "## " for a heading. Start each line with "- " for bullet points. Use **word** for bold text. Paste links as they are; they become clickable automatically.</small></label>';
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
    if (c === "file_url") return r[c] ? '<a href="' + esc(Q.safeLink(r[c])) + '" target="_blank" rel="noopener">Open PDF ↗</a>' : "—";
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
      form = '<form class="panel" id="e-form"><h2>' + (cur ? "Edit: " + esc(cur[E.fields[0][0]]) : "New " + esc(E.one)) + '</h2><div class="fields">'
        + E.fields.map(function (f) { return fieldHtml(f, cur); }).join("")
        + '</div><button class="btn" type="submit" id="e-save">Save</button> <button class="btn line" type="button" id="e-cancel">Cancel</button></form>';
    }
    view.innerHTML = '<div class="head"><h1>' + esc(E.label) + '</h1><button class="btn sm" type="button" id="e-new">+ Add ' + esc(E.one) + "</button></div>"
      + (E.hint ? '<p class="hint">' + esc(E.hint) + "</p>" : "") + form
      + '<div class="scroll"><table><thead><tr>' + E.cols.map(function (c) { return "<th>" + (COL_LABEL[c] || cap(c)) + "</th>"; }).join("") + "<th></th></tr></thead><tbody>"
      + (S.rows.length ? S.rows.map(function (r) {
        return "<tr>" + E.cols.map(function (c) { return "<td>" + cellHtml(E, c, r) + "</td>"; }).join("")
          + '<td class="acts"><button class="link" type="button" data-edit="' + r.id + '">Edit</button><button class="link del" type="button" data-del="' + r.id + '">Delete</button></td></tr>';
      }).join("") : '<tr><td colspan="' + (E.cols.length + 1) + '" class="none">Nothing has been added yet. Use the button above to add one.</td></tr>')
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
    if (missing) { flash(missing[1] + " is required.", true); $("e-" + missing[0]).focus(); return; }
    if (badLink) { flash("The PDF link must start with https://, or choose a file from your computer.", true); return; }
    var btn = $("e-save");
    btn.disabled = true; btn.textContent = uploads.length ? "Uploading…" : "Saving…";
    var done = function () { btn.disabled = false; btn.textContent = "Save"; };
    Promise.all(uploads.map(function (u) {
      if (u[2] === "pdf") return uploadPdf(u[1], data.category || "pdf").then(function (url) { data[u[0]] = url; data.file_size = u[1].size; });
      return uploadImage(u[1], E.fixed.kind || E.table).then(function (url) { data[u[0]] = url; });
    })).then(function () {
      return S.edit === "new" ? sb.from(E.table).insert(data) : sb.from(E.table).update(data).eq("id", S.edit);
    }).then(function (r) {
      if (r.error) { done(); return fail(r.error); }
      S.edit = null; flash(E.one + " saved."); loadEntity();
    }).catch(function (err) { done(); fail(err); });
  }

  /* ---------- thumbnail upload (Supabase Storage, bucket "thumbs") ---------- */
  // Badi photo ko 1200px chaudai tak chhota karke JPG banata hai, taaki website halki rahe.
  function shrinkImage(file, opts) {
    opts = opts || {};
    var png = opts.keepPng && file.type !== "image/jpeg";
    return new Promise(function (resolve) {
      var img = new Image(), src = URL.createObjectURL(file);
      img.onload = function () {
        URL.revokeObjectURL(src);
        var scale = Math.min(1, (opts.max || 1200) / img.naturalWidth);
        var c = document.createElement("canvas");
        c.width = Math.round(img.naturalWidth * scale); c.height = Math.round(img.naturalHeight * scale);
        var ctx = c.getContext("2d");
        if (!png) { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height); }
        ctx.drawImage(img, 0, 0, c.width, c.height);
        c.toBlob(function (b) { resolve(b || file); }, png ? "image/png" : "image/jpeg", 0.86);
      };
      img.onerror = function () { URL.revokeObjectURL(src); resolve(file); };
      img.src = src;
    });
  }
  function uploadPdf(file, folder) {
    if (file.type !== "application/pdf" && !/\.pdf$/i.test(file.name)) return Promise.reject({ message: "Only PDF files are allowed." });
    if (file.size > 20 * 1024 * 1024) return Promise.reject({ message: "The PDF must be smaller than 20 MB. For a larger file, upload it to Google Drive and paste its link instead." });
    var clean = file.name.replace(/\.pdf$/i, "").replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "file";
    var path = folder + "/" + Date.now() + "-" + clean + ".pdf";
    return sb.storage.from("docs").upload(path, file, { contentType: "application/pdf", cacheControl: "3600" }).then(function (r) {
      if (r.error) throw { message: "The PDF could not be uploaded (" + r.error.message + ")" };
      return sb.storage.from("docs").getPublicUrl(path).data.publicUrl;
    });
  }
  function uploadImage(file, folder, opts) {
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) return Promise.reject({ message: "Only JPG, PNG or WebP images are allowed." });
    if (file.size > 8 * 1024 * 1024) return Promise.reject({ message: "The image must be smaller than 8 MB." });
    return shrinkImage(file, opts).then(function (blob) {
      var ext = blob.type === "image/jpeg" ? "jpg" : (blob.type === "image/png" ? "png" : "webp");
      var path = folder + "/" + Date.now() + "-" + Math.random().toString(36).slice(2, 8) + "." + ext;
      return sb.storage.from("thumbs").upload(path, blob, { contentType: blob.type, cacheControl: "31536000" }).then(function (r) {
        if (r.error) throw { message: "The image could not be uploaded (" + r.error.message + ")" };
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
      var logo = Q.safeLink(s.logo_url);
      var logoPanel = '<form class="panel" id="logo-form"><h2>Logo</h2><div class="imgrow">'
        + '<div class="thumb logo" id="e-logo_url-box">' + (logo ? '<img src="' + esc(logo) + '" alt="">' : "<span>No image</span>") + "</div>"
        + '<div class="imgctl"><input type="file" id="e-logo_url-file" accept="image/png,image/jpeg,image/webp" aria-label="Logo">'
        + '<input type="hidden" id="e-logo_url" value="' + esc(logo) + '">'
        + '<button class="link del" type="button" data-clear-img="logo_url"' + (logo ? "" : " hidden") + ">Remove image</button>"
        + '<label class="check"><input type="checkbox" id="logo-only"' + (s.logo_only === "1" ? " checked" : "") + "> Show only the logo (hide the institute name and tagline beside it)</label>"
        + "<small>The logo appears in the header of every page and as the browser tab icon. A PNG with a transparent background works best, at least 400 px wide. JPG, PNG or WebP. Without a logo, the default QE mark is shown.</small>"
        + '</div></div><button class="btn" type="submit" id="logo-save">Save Logo</button></form>';
      var bimg = Q.safeLink(s.book_image);
      var bk = function (id, key, label) {
        return "<label>" + label + '<input id="' + id + '" maxlength="60" value="' + esc((s["t_" + key] || "").trim() || Q.TEXT[key]) + '"></label>';
      };
      var bookPanel = '<form class="panel" id="book-form"><h2>Book Banner (the large book box on the home page)</h2><div class="imgrow">'
        + '<div class="thumb bookimg" id="e-book_image-box">' + (bimg ? '<img src="' + esc(bimg) + '" alt="">' : "<span>No image</span>") + "</div>"
        + '<div class="imgctl"><span class="lbl">Book image</span><input type="file" id="e-book_image-file" accept="image/png,image/jpeg,image/webp" aria-label="Book image">'
        + '<input type="hidden" id="e-book_image" value="' + esc(bimg) + '">'
        + '<button class="link del" type="button" data-clear-img="book_image"' + (bimg ? "" : " hidden") + ">Remove image</button>"
        + "<small>Upload a photo of the book cover. It replaces the blue sample cover on the website. A portrait image about 600 × 800 works best. JPG, PNG or WebP. Without an image, the blue cover with the text below is shown.</small></div></div>"
        + '<h2>Text on the blue cover (used only when no image is uploaded)</h2><div class="fields">'
        + bk("bk-top", "cover_top", "Top text") + bk("bk-title", "cover_title", "Title") + bk("bk-sub", "cover_sub", "Subtitle") + bk("bk-badge", "cover_badge", "Badge")
        + '<label class="check full"><input type="checkbox" id="bk-hide"' + (s.book_cover_hide === "1" ? " checked" : "") + "> Hide all text on the cover</label></div>"
        + '<h2>Button</h2><div class="fields"><label class="full">Buy link for the banner button. Leave empty to open the enquiry form instead<input id="bk-buy" maxlength="500" value="' + esc(s.book_buy_url) + '"></label></div>'
        + '<small class="help" style="display:block;margin-bottom:14px">The book title, description and highlights are in the "Book section" box further down. The button text is under Website Text &gt; Books section.</small>'
        + '<button class="btn" type="submit" id="book-save">Save Book Banner</button></form>';
      view.innerHTML = '<h1>Settings</h1>' + logoPanel + bookPanel + '<form class="panel" id="s-form">' + SETTINGS.map(function (g) {
        return "<h2>" + esc(g[0]) + '</h2><div class="fields">' + g[1].map(function (f) {
          return f[2] ? '<label class="full">' + esc(f[1]) + '<textarea id="s-' + f[0] + '" rows="4">' + esc(s[f[0]]) + "</textarea></label>"
            : "<label>" + esc(f[1]) + '<input id="s-' + f[0] + '" value="' + esc(s[f[0]]) + '"></label>';
        }).join("") + "</div>";
      }).join("") + '<button class="btn" type="submit">Save Settings</button></form>'
        + '<form class="panel" id="p-form" style="max-width:520px"><h2>Change Password</h2><div class="fields">'
        + '<label class="full">New password (at least 8 characters)<input type="password" id="p-new" required minlength="8" autocomplete="new-password"></label>'
        + '<label class="full">Confirm new password<input type="password" id="p-again" required autocomplete="new-password"></label>'
        + '</div><button class="btn" type="submit">Change Password</button></form>';
    });
  }

  /* ---------- website text ---------- */
  function loadTexts() {
    sb.from("settings").select("*").then(function (r) {
      if (r.error) return fail(r.error);
      var s = {};
      (r.data || []).forEach(function (row) { s[row.k] = row.v; });
      view.innerHTML = '<div class="head"><h1>Website Text</h1></div>'
        + '<p class="hint">Edit any text shown on the website from here. Leave a box empty and save to restore its default text. Courses, books, results and contact details are managed from their own tabs.</p>'
        + '<form id="t-form">' + Q.TEXTS.map(function (g) {
          return '<div class="panel"><h2>' + esc(g[0]) + '</h2><div class="fields">' + g[1].map(function (f) {
            var val = (s["t_" + f[0]] || "").trim() || f[2], long = f[3] || f[2].length > 60;
            return '<label class="' + (long ? "full" : "") + '">' + esc(f[1]) + (long
              ? '<textarea id="t-' + f[0] + '" rows="2" maxlength="400">' + esc(val) + "</textarea>"
              : '<input id="t-' + f[0] + '" maxlength="120" value="' + esc(val) + '">') + "</label>";
          }).join("") + "</div></div>";
        }).join("") + '<div class="savebar"><button class="btn" type="submit">Save All Text</button></div></form>';
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
      $("e-" + ck + "-box").innerHTML = "<span>No image</span>";
      return;
    }
    if (t.id === "e-new") { S.edit = "new"; return drawEntity(); }
    if (t.id === "e-cancel") { S.edit = null; return drawEntity(); }
    if (t.dataset.edit) { S.edit = Number(t.dataset.edit); drawEntity(); return window.scrollTo(0, 0); }
    if (t.dataset.del && window.confirm("Delete this item?")) {
      var E = ENT[S.tab];
      sb.from(E.table).delete().eq("id", Number(t.dataset.del)).then(function (r) {
        if (r.error) return fail(r.error);
        flash(E.one + " deleted."); loadEntity();
      });
    }
    if (t.dataset.delEnq && window.confirm("Delete this enquiry?")) {
      sb.from("enquiries").delete().eq("id", Number(t.dataset.delEnq)).then(function (r) {
        if (r.error) return fail(r.error);
        flash("Enquiry deleted."); loadEnquiries();
      });
    }
  });
  view.addEventListener("submit", function (e) {
    e.preventDefault();
    if (e.target.id === "e-form") return saveEntity();
    if (e.target.id === "book-form") {
      var bf = $("e-book_image-file").files[0], bbtn = $("book-save"), blink = $("bk-buy").value.trim();
      if (blink && !Q.safeLink(blink)) return flash("The buy link must start with https://", true);
      bbtn.disabled = true; bbtn.textContent = bf ? "Uploading…" : "Saving…";
      (bf ? uploadImage(bf, "book", { max: 900, keepPng: true }) : Promise.resolve($("e-book_image").value)).then(function (url) {
        var rows = [{ k: "book_image", v: url || "" }, { k: "book_cover_hide", v: $("bk-hide").checked ? "1" : "" }, { k: "book_buy_url", v: blink }];
        [["bk-top", "cover_top"], ["bk-title", "cover_title"], ["bk-sub", "cover_sub"], ["bk-badge", "cover_badge"]].forEach(function (p) {
          var v = $(p[0]).value.trim();
          rows.push({ k: "t_" + p[1], v: v === Q.TEXT[p[1]] ? "" : v });
        });
        return sb.from("settings").upsert(rows);
      }).then(function (r) {
        if (r.error) throw r.error;
        flash("Book banner saved. Refresh the website to see the change."); loadSettings();
      }).catch(function (err) { bbtn.disabled = false; bbtn.textContent = "Save Book Banner"; fail(err); });
    }
    if (e.target.id === "logo-form") {
      var lf = $("e-logo_url-file").files[0], lbtn = $("logo-save");
      lbtn.disabled = true; lbtn.textContent = lf ? "Uploading…" : "Saving…";
      (lf ? uploadImage(lf, "logo", { max: 600, keepPng: true }) : Promise.resolve($("e-logo_url").value)).then(function (url) {
        return sb.from("settings").upsert([{ k: "logo_url", v: url || "" }, { k: "logo_only", v: $("logo-only").checked ? "1" : "" }]);
      }).then(function (r) {
        if (r.error) throw r.error;
        flash("Logo saved. Refresh the website to see the change."); loadSettings();
      }).catch(function (err) { lbtn.disabled = false; lbtn.textContent = "Save Logo"; fail(err); });
    }
    if (e.target.id === "t-form") {
      var trows = [];
      Q.TEXTS.forEach(function (g) { g[1].forEach(function (f) {
        var v = $("t-" + f[0]).value.trim();
        trows.push({ k: "t_" + f[0], v: v === f[2] ? "" : v }); // default jaisa ho to khaali, taaki default hi chale
      }); });
      sb.from("settings").upsert(trows).then(function (r) { r.error ? fail(r.error) : flash("Website text saved. Refresh the website to see the changes."); });
    }
    if (e.target.id === "s-form") {
      var rows = [];
      SETTINGS.forEach(function (g) { g[1].forEach(function (f) { rows.push({ k: f[0], v: $("s-" + f[0]).value.trim().slice(0, 2000) }); }); });
      sb.from("settings").upsert(rows).then(function (r) {
        if (r.error) return fail(r.error);
        Q.setExams($("s-exams").value); flash("Settings saved.");
      });
    }
    if (e.target.id === "p-form") {
      var p = $("p-new").value;
      if (p.length < 8) return flash("The password must be at least 8 characters long.", true);
      if (p !== $("p-again").value) return flash("The two passwords do not match.", true);
      sb.auth.updateUser({ password: p }).then(function (r) {
        if (r.error) return fail(r.error);
        e.target.reset(); flash("Password changed.");
      });
    }
  });
})();
