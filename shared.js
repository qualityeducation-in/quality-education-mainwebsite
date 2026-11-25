// Website aur admin panel dono mein kaam aane wala code.
(function () {
  var Q = window.QE = window.QE || {};

  Q.EXAMS = ["RAS", "LDC", "PSI", "VDO", "CET", "Patwar", "Police", "4th Grade", "Other"];
  Q.INTERESTS = ["Video Course", "Test Series", "Book", "Study Material"];
  Q.STATUSES = ["new", "contacted", "enrolled", "closed"];

  Q.configured = /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(Q.url || "") && !!Q.key && Q.key.indexOf("APNI-") !== 0;
  Q.sb = Q.configured && window.supabase ? window.supabase.createClient(Q.url, Q.key) : null;

  Q.esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  Q.inr = function (n) { return "₹" + Number(n || 0).toLocaleString("en-IN"); };

  // YouTube ya Instagram ke link ko embed link mein badalta hai. Pehchan na ho to "".
  Q.embedUrl = function (url) {
    url = String(url || "").trim();
    var m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/))([\w-]{11})/i);
    if (m) return "https://www.youtube.com/embed/" + m[1];
    m = url.match(/instagram\.com\/(?:[\w.]+\/)?(reels?|p|tv)\/([\w-]+)/i);
    if (m) return "https://www.instagram.com/" + (m[1].toLowerCase() === "p" ? "p" : "reel") + "/" + m[2] + "/embed";
    return "";
  };

  Q.safeLink = function (url) {
    url = String(url || "").trim();
    return /^https?:\/\//i.test(url) ? url : "";
  };

  // "10L+|App Downloads" jaisi lines ko [value, label] mein todta hai.
  Q.pairs = function (text) {
    return String(text || "").split(/\r?\n/).filter(function (l) { return l.trim() !== ""; }).map(function (l) {
      var i = l.indexOf("|");
      return i < 0 ? [l.trim(), ""] : [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    });
  };
})();
