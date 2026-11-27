// PDF wala page (resources.html?cat=current | syllabus | papers | vacancy | strategy)
(function () {
  var Q = window.QE, sb = Q.sb, esc = Q.esc, T = Q.T, icon = Q.icon;
  var $ = function (id) { return document.getElementById(id); };
  var cats = Q.DOC_CATS.map(function (c) { return c[0]; });
  var cat = new URLSearchParams(location.search).get("cat");
  if (cats.indexOf(cat) < 0) cat = cats[0];
  var docs = [];

  $("year").textContent = new Date().getFullYear();
  var note = function (t) { return '<p class="load-note">' + esc(t) + "</p>"; };
  var catName = function (c) { return T(Q.DOC_CATS[cats.indexOf(c)][1]); };
  function size(n) {
    n = Number(n) || 0;
    if (!n) return "";
    return n >= 1048576 ? (n / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(n / 1024)) + " KB";
  }

  function render() {
    Q.applyTexts();
    $("res-title").textContent = catName(cat);
    document.title = catName(cat) + " | " + T("brand_name");
    var phone = (Q.SET.phone || "").trim();
    if (phone) document.querySelectorAll("[data-tel]").forEach(function (el) { el.href = "tel:+91" + phone.replace(/\D/g, "").slice(-10); });

    $("res-tabs").innerHTML = cats.map(function (c) {
      return '<a class="chip" href="resources.html?cat=' + c + '" data-cat="' + c + '" aria-current="' + (c === cat ? "page" : "false") + '">' + esc(catName(c)) + "</a>";
    }).join("");

    var rows = docs.filter(function (d) { return d.category === cat; });
    $("doc-list").innerHTML = rows.map(function (d) {
      var url = Q.safeLink(d.file_url);
      if (!url) return "";
      // Supabase par rakhi file seedhi download hoti hai; bahar ka link (jaise Google Drive) naye tab mein khulta hai.
      var ours = url.indexOf("/storage/v1/object/public/") > -1;
      var dl = ours ? url + "?download=" + encodeURIComponent(String(d.title).replace(/[\\/:*?"<>|]+/g, " ").trim() + ".pdf") : url;
      var meta = [Q.fmtDate(d.created_at), size(d.file_size)].filter(Boolean).join(" · ");
      return '<div class="doc"><i>' + icon("file") + '</i><div class="doc-t"><h3>' + esc(d.title) + "</h3>"
        + (d.descr ? "<p>" + esc(d.descr) + "</p>" : "") + (meta ? "<small>" + esc(meta) + "</small>" : "") + "</div>"
        + '<div class="doc-b"><a class="btn line sm" href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(T("res_view")) + "</a>"
        + '<a class="btn sm" href="' + esc(dl) + '"' + (ours ? "" : ' target="_blank" rel="noopener"') + ">" + esc(T("res_download")) + "</a></div></div>";
    }).join("") || note(T("res_empty"));
  }

  // Section badalne par page dobara load nahi hota.
  $("res-tabs").addEventListener("click", function (e) {
    var a = e.target.closest("[data-cat]");
    if (!a) return;
    e.preventDefault();
    cat = a.dataset.cat;
    history.replaceState(null, "", "resources.html?cat=" + cat);
    render();
  });

  function failed() { render(); $("doc-list").innerHTML = note("Unable to load the list right now. Please try again in a little while."); }

  if (!sb) return failed();
  Promise.all([
    sb.from("docs").select("*").eq("is_active", true).order("created_at", { ascending: false }),
    sb.from("settings").select("*")
  ]).then(function (r) {
    if (!r[1].error) Q.loadSettings(r[1].data);
    if (r[0].error) return failed();
    docs = r[0].data || [];
    render();
  }).catch(failed);
})();
