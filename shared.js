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

// ---------- Exams ki list (admin > Settings se badalti hai) ----------
(function () {
  var Q = window.QE;
  // Text ki har line ek exam. "Other" hamesha aakhir mein rehta hai.
  Q.setExams = function (text) {
    var list = String(text || "").split(/\r?\n/).map(function (l) { return l.trim().slice(0, 30); })
      .filter(function (l, i, a) { return l && l.toLowerCase() !== "other" && a.indexOf(l) === i; });
    if (!list.length) return;
    Q.EXAMS.length = 0;
    list.forEach(function (l) { Q.EXAMS.push(l); });
    Q.EXAMS.push("Other");
  };

  // ---------- Website ka saara text (admin > Website Text se badalta hai) ----------
  // [group, [[key, admin mein dikhne wala naam, default text, lamba text?], ...]]
  Q.TEXTS = [
    ["Upar ki patti aur menu", [
      ["brand_name", "Institute ka naam", "Quality Education"],
      ["brand_tag", "Naam ke neeche ki line", "Rajasthan Govt. Exam Preparation"],
      ["notice_btn", "Notice patti ka button", "Order Now"],
      ["nav_courses", "Menu: Courses", "Courses"], ["nav_tests", "Menu: Tests", "Tests"], ["nav_books", "Menu: Books", "Books"],
      ["nav_faculty", "Menu: Faculty", "Faculty"], ["nav_resources", "Menu: Resources", "Resources"],
      ["nav_app", "Menu: Download App", "Download App"], ["nav_contact", "Menu: Contact", "Contact"],
      ["nav_connect", "Menu: Connect With Us", "Connect With Us"],
      ["cta", "Enquiry ka button (upar aur mobile par)", "Enquire Now"],
      ["mbar_call", "Mobile par Call button", "Call"]]],
    ["Sabse upar ka hissa (Hero)", [
      ["hero_pill", "Chhoti patti", "Trusted by Rajasthan Aspirants"],
      ["hero_h1_a", "Badi heading: pehla hissa", "Prepare Smarter for"],
      ["hero_h1_hl", "Badi heading: rangeen hissa", "RAS, LDC, PSI, CET, VDO"],
      ["hero_h1_b", "Badi heading: aakhri hissa", "& Rajasthan Govt Exams"],
      ["hero_lead", "Heading ke neeche ki line", "Live classes, recorded courses, test series, books, current affairs, toppers strategy and daily motivation in one premium learning platform.", true],
      ["hero_btn1", "Pehla button", "Explore Courses"], ["hero_btn2", "Doosra button", "Attempt Free Test"]]],
    ["Hero ka phone wala design", [
      ["ph_tag", "Phone: chhota tag", "New Batch"], ["ph_title", "Phone: title", "LDC 2026 Complete Course"],
      ["ph_sub", "Phone: neeche ki line", "Live + Recorded + Tests + PDF Notes"],
      ["ph_r1", "Phone: line 1", "Science Class"], ["ph_r1b", "Phone: line 1 ka tag", "Live"],
      ["ph_r2", "Phone: line 2", "Mock Test"], ["ph_r2b", "Phone: line 2 ka tag", "Today"],
      ["ph_r3", "Phone: line 3", "Strategy Reel"], ["ph_r3b", "Phone: line 3 ka tag", "New"],
      ["fl1", "Tairta card 1", "Rank Analysis"], ["fl2", "Tairta card 2", "Faculty Reels"], ["fl3", "Tairta card 3", "Free PDFs"]]],
    ["Courses section", [
      ["courses_eyebrow", "Chhoti heading", "Premium Learning Programs"], ["courses_title", "Badi heading", "Featured Courses"],
      ["chip_all", "Filter ka pehla button", "All"],
      ["btn_enquire", "Card ka button", "Enquire"], ["btn_demo", "Demo video ka button", "Watch Demo"],
      ["fee_note", "Fee khaali hone par dikhne wali line", "Fee ke liye enquiry karein"]]],
    ["Test Series section", [
      ["tests_eyebrow", "Chhoti heading", "Online + Offline Practice"], ["tests_title", "Badi heading", "Test Series Platform"],
      ["feat1_t", "Khoobi 1", "Online Mock Tests"], ["feat1_d", "Khoobi 1 ki line", "Topic-wise, subject-wise and full length papers."],
      ["feat2_t", "Khoobi 2", "Offline Test Centers"], ["feat2_d", "Khoobi 2 ki line", "Jaipur, Ajmer, Jodhpur, Bikaner centers."],
      ["feat3_t", "Khoobi 3", "Detailed Analysis"], ["feat3_d", "Khoobi 3 ki line", "Rank, accuracy, speed and subject performance."],
      ["feat4_t", "Khoobi 4", "Leaderboard"], ["feat4_d", "Khoobi 4 ki line", "State level ranking and topper performance."]]],
    ["Books section", [
      ["book_pill", "Banner ki chhoti patti", "Book Store"], ["book_btn", "Banner ka button", "Order Book"],
      ["cover_top", "Book ke cover par: upar", "Quality Education"], ["cover_title", "Book ke cover par: naam", "Science"],
      ["cover_sub", "Book ke cover par: neeche", "LDC 2026"], ["cover_badge", "Book ke cover par: patti", "Free PYQ Booklet"],
      ["books_eyebrow", "Books ki list: chhoti heading", "Book Store"], ["books_title", "Books ki list: badi heading", "Our Books"],
      ["btn_order", "Book card ka button", "Order"]]],
    ["Faculty / Videos section", [
      ["faculty_eyebrow", "Chhoti heading", "Teachers + Reels"], ["faculty_title", "Badi heading", "Faculty Highlights"]]],
    ["Resources section", [
      ["res_eyebrow", "Chhoti heading", "Free Preparation Tools"], ["res_title", "Badi heading", "Resources & Updates"],
      ["res_pill", "Bade box ka tag", "Daily"], ["res_main_t", "Bade box ki heading", "Daily Current Affairs"],
      ["res_main_d", "Bade box ki line", "Exam-oriented current affairs with short notes and PDF download."],
      ["res_btn", "Bade box ka button", "Get PDF"],
      ["res1", "List 1", "Syllabus PDFs"], ["res2", "List 2", "Previous Year Papers"],
      ["res3", "List 3", "Vacancy Updates"], ["res4", "List 4", "Preparation Strategy"]]],
    ["Results section", [
      ["results_eyebrow", "Chhoti heading", "Results & Feedback"], ["results_title", "Badi heading", "Selected Students & Success Stories"],
      ["results_badge", "Box ka tag", "Our Results"], ["results_box_title", "Box ki heading", "Rajasthan Govt. Exam Selections"]]],
    ["App Download section", [
      ["app_eyebrow", "Chhoti heading", "Learning On Every Device"], ["app_title", "Badi heading", "Download Quality Education App"],
      ["app1_t", "App 1 ka naam", "Android App"], ["app1_d", "App 1 ki line", "Best for mobile learning, live classes, recorded videos, PDFs and mock tests."], ["app1_btn", "App 1 ka button", "Get it on Play Store"],
      ["app2_t", "App 2 ka naam", "iOS App"], ["app2_d", "App 2 ki line", "For iPhone and iPad students with smooth course access and test series support."], ["app2_btn", "App 2 ka button", "Download on App Store"],
      ["app3_t", "App 3 ka naam", "Windows App"], ["app3_d", "App 3 ki line", "Large screen learning experience for live classes, recorded lectures and study material."], ["app3_btn", "App 3 ka button", "Download for Windows"],
      ["app_ask", "Link na hone par button", "Ask for link"], ["help_title", "Neeche ki patti", "Need Help Installing?"]]],
    ["Contact aur Enquiry form", [
      ["contact_title", "Badi heading", "Start Your Preparation Today"],
      ["contact_sub", "Heading ke neeche ki line", "Course, book, test series ya technical support ke liye contact karein."],
      ["c_call", "Phone box ka naam", "Call / WhatsApp"], ["c_email", "Email box ka naam", "Support Email"], ["c_office", "Address box ka naam", "Offices"],
      ["form_title", "Form ki heading", "Student Enquiry"], ["form_sub", "Form ki line", "Form bharein, hamari team aapko call karegi."],
      ["f_name", "Form: Name", "Name"], ["f_phone", "Form: Mobile", "Mobile Number"], ["f_exam", "Form: Exam", "Exam"],
      ["f_interest", "Form: Interested In", "Interested In"], ["f_city", "Form: City", "City / District"], ["f_msg", "Form: Message", "Message (optional)"],
      ["form_btn", "Form ka button", "Send Enquiry"]]],
    ["Sabse neeche (Footer)", [
      ["foot_copy", "Copyright ki line", "Quality Education. All rights reserved."]]]
  ];
  Q.TEXT = {};
  Q.TEXTS.forEach(function (g) { g[1].forEach(function (f) { Q.TEXT[f[0]] = f[2]; }); });
})();

// ---------- Video ke link se jaankari: kahan ki hai, embed link, thumbnail ----------
(function () {
  var Q = window.QE;
  Q.videoInfo = function (url) {
    url = String(url || "").trim();
    var m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/))([\w-]{11})/i);
    if (m) return { type: "yt", embed: "https://www.youtube.com/embed/" + m[1], thumb: "https://i.ytimg.com/vi/" + m[1] + "/hqdefault.jpg" };
    var embed = Q.embedUrl(url);
    return embed ? { type: "ig", embed: embed, thumb: "" } : null;
  };
})();
