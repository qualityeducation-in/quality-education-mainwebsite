// "View All" page (all.html?type=courses | tests | books | reels) ka code.
(function () {
  var Q = window.QE, sb = Q.sb, esc = Q.esc, T = Q.T;
  var $ = function (id) { return document.getElementById(id); };

  var params = new URLSearchParams(location.search);
  var type = Q.TYPES[params.get("type")] ? params.get("type") : "courses";
  var info = Q.TYPES[type], rows = [], filter = params.get("exam") || "";

  $("year").textContent = new Date().getFullYear();
  var note = function (t) { return '<p class="load-note">' + t + "</p>"; };

  function heading() {
    Q.applyTexts();
    $("all-eyebrow").textContent = T(info.eyebrow);
    $("all-title").textContent = T(info.title);
    document.title = T(info.title) + " | " + T("brand_name");
    var phone = (Q.SET.phone || "").trim();
    if (phone) document.querySelectorAll("[data-tel]").forEach(function (el) { el.href = "tel:+91" + phone.replace(/\D/g, "").slice(-10); });
  }

  function render() {
    var grid = $("all-grid");
    if (type === "reels") {
      grid.className = "reels wrap-all";
      grid.innerHTML = rows.map(Q.reelHtml).join("") || note("No videos available yet.");
      return;
    }
    // Exam ke filter button, usi kram mein jis kram mein exams ki list hai.
    var exams = rows.map(function (c) { return c.exam; }).filter(function (e, i, a) { return a.indexOf(e) === i; });
    exams.sort(function (a, b) {
      var ia = Q.EXAMS.indexOf(a), ib = Q.EXAMS.indexOf(b);
      return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
    });
    if (exams.indexOf(filter) < 0) filter = "";
    $("all-chips").innerHTML = exams.length > 1
      ? '<button class="chip" type="button" aria-pressed="' + (filter === "") + '" data-f="">' + esc(T("chip_all")) + "</button>" + exams.map(function (e) {
        return '<button class="chip" type="button" aria-pressed="' + (filter === e) + '" data-f="' + esc(e) + '">' + esc(e) + "</button>";
      }).join("") : "";
    var shown = rows.filter(function (x) { return !filter || x.exam === filter; });
    $("all-count").textContent = shown.length ? shown.length + " items" : "";
    grid.innerHTML = shown.map(function (x) { return Q.cardHtml(x, info.interest); }).join("") || note("Nothing here yet.");
  }

  $("all-chips").addEventListener("click", function (e) {
    var c = e.target.closest("[data-f]");
    if (c) { filter = c.dataset.f; render(); }
  });

  function failed() {
    heading();
    $("all-grid").innerHTML = note("Unable to load the list right now. Please try again in a little while.");
  }

  if (!sb) return failed();
  var list = type === "reels"
    ? sb.from("reels").select("*").eq("is_active", true).order("sort").order("id")
    : sb.from("items").select("*").eq("is_active", true).eq("kind", info.kind).order("sort").order("id");
  Promise.all([list, sb.from("settings").select("*")]).then(function (r) {
    if (r[0].error || r[1].error) return failed();
    Q.loadSettings(r[1].data);
    rows = r[0].data || [];
    heading();
    render();
  }).catch(failed);
})();
