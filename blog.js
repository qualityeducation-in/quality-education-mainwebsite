// Blog page: blog.html = saari posts, blog.html?id=5 = ek post
(function () {
  var Q = window.QE, sb = Q.sb, esc = Q.esc, T = Q.T;
  var $ = function (id) { return document.getElementById(id); };
  var id = Number(new URLSearchParams(location.search).get("id")) || 0;

  $("year").textContent = new Date().getFullYear();
  var note = function (t) { return '<p class="load-note">' + esc(t) + "</p>"; };
  function common() {
    Q.applyTexts();
    var phone = (Q.SET.phone || "").trim();
    if (phone) document.querySelectorAll("[data-tel]").forEach(function (el) { el.href = "tel:+91" + phone.replace(/\D/g, "").slice(-10); });
  }

  function showList(posts) {
    common();
    document.title = T("blog_title") + " | " + T("brand_name");
    $("post-grid").innerHTML = posts.map(Q.postCard).join("") || note(T("blog_empty"));
  }
  function showPost(p) {
    common();
    $("blog-list").hidden = true; $("post").hidden = false;
    document.title = p.title + " | " + T("brand_name");
    $("post-title").textContent = p.title;
    $("post-date").textContent = Q.fmtDate(p.created_at);
    var photo = Q.safeLink(p.image_url);
    if (photo) { $("post-img").src = photo; $("post-img").hidden = false; }
    $("post-body").innerHTML = Q.richText(p.body);
  }
  function failed() { common(); $("post-grid").innerHTML = note("Unable to load the blog right now. Please try again in a little while."); }

  if (!sb) return failed();
  var posts = id
    ? sb.from("posts").select("*").eq("is_active", true).eq("id", id).limit(1)
    : sb.from("posts").select("id,title,summary,image_url,created_at").eq("is_active", true).order("created_at", { ascending: false });
  Promise.all([posts, sb.from("settings").select("*")]).then(function (r) {
    if (!r[1].error) Q.loadSettings(r[1].data);
    if (r[0].error) return failed();
    var rows = r[0].data || [];
    if (id && rows[0]) showPost(rows[0]);
    else if (id) { history.replaceState(null, "", "blog.html"); failed(); $("post-grid").innerHTML = note("This post could not be found."); }
    else showList(rows);
  }).catch(failed);
})();
