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
    ["Header and Menu", [
      ["brand_name", "Institute name", "Quality Education"],
      ["brand_tag", "Tagline under the name", "Rajasthan Govt. Exam Preparation"],
      ["notice_btn", "Notice bar button", "Order Now"],
      ["nav_courses", "Menu: Courses", "Courses"],
      ["nav_tests", "Menu: Tests", "Tests"],
      ["nav_books", "Menu: Books", "Books"],
      ["nav_faculty", "Menu: Faculty", "Faculty"],
      ["nav_resources", "Menu: Resources", "Resources"],
      ["nav_blog", "Menu: Blog", "Blog"],
      ["nav_app", "Menu: Download App", "Download App"],
      ["nav_contact", "Menu: Contact", "Contact"],
      ["nav_connect", "Menu: Connect With Us", "Connect With Us"],
      ["cta", "Enquiry button (header and mobile bar)", "Enquire Now"],
      ["mbar_call", "Call button (mobile bar)", "Call"]]],
    ["Hero Section", [
      ["hero_pill", "Small badge", "Trusted by Rajasthan Aspirants"],
      ["hero_h1_a", "Main heading: first part", "Prepare Smarter for"],
      ["hero_h1_hl", "Main heading: highlighted part", "RAS, LDC, PSI, CET, VDO"],
      ["hero_h1_b", "Main heading: last part", "& Rajasthan Govt Exams"],
      ["hero_lead", "Text under the heading", "Live classes, recorded courses, test series, books, current affairs, toppers strategy and daily motivation in one premium learning platform.", true],
      ["hero_btn1", "First button", "Explore Courses"],
      ["hero_btn2", "Second button", "Attempt Free Test"]]],
    ["Hero App Screens (caption under the phone)", [
      ["shot1", "Screen 1", "Home Screen"],
      ["shot2", "Screen 2", "Daily Free Test"],
      ["shot3", "Screen 3", "Test Attempt"],
      ["shot4", "Screen 4", "Submit Screen"],
      ["shot5", "Screen 5", "Result"],
      ["shot6", "Screen 6", "Subject Wise Analysis"],
      ["shot7", "Screen 7", "Leaderboard"],
      ["shot8", "Screen 8 (video)", "Class Recording"],
      ["shot9", "Screen 9", "Download Option"]]],
    ["Courses section", [
      ["courses_eyebrow", "Small heading", "Premium Learning Programs"],
      ["courses_title", "Main heading", "Featured Courses"],
      ["chip_all", "First filter button", "All"],
      ["view_all", "View all button (shown when there are more than 8 items)", "View All"],
      ["btn_enquire", "Card button (when no Buy Now link is set)", "Enquire"],
      ["btn_buy", "Card button (when a Buy Now link is set)", "Buy Now"],
      ["btn_demo", "Demo video button", "Watch Demo"],
      ["fee_note", "Text shown when the price is empty", "Enquire for price"]]],
    ["Test Series section", [
      ["tests_eyebrow", "Small heading", "Online + Offline Practice"],
      ["tests_title", "Main heading", "Test Series Platform"],
      ["feat1_t", "Feature 1 title", "Online Mock Tests"],
      ["feat1_d", "Feature 1 description", "Topic-wise, subject-wise and full length papers."],
      ["feat2_t", "Feature 2 title", "Offline Test Centers"],
      ["feat2_d", "Feature 2 description", "Jaipur, Ajmer, Jodhpur, Bikaner centers."],
      ["feat3_t", "Feature 3 title", "Detailed Analysis"],
      ["feat3_d", "Feature 3 description", "Rank, accuracy, speed and subject performance."],
      ["feat4_t", "Feature 4 title", "Leaderboard"],
      ["feat4_d", "Feature 4 description", "State level ranking and topper performance."]]],
    ["Books section", [
      ["book_pill", "Banner badge", "Book Store"],
      ["book_btn", "Banner button", "Order Book"],
      ["cover_top", "Book cover: top text", "Quality Education"],
      ["cover_title", "Book cover: title", "Science"],
      ["cover_sub", "Book cover: subtitle", "LDC 2026"],
      ["cover_badge", "Book cover: badge", "Free PYQ Booklet"],
      ["books_eyebrow", "Book list: small heading", "Book Store"],
      ["books_title", "Book list: main heading", "Our Books"],
      ["btn_order", "Book card button", "Order"]]],
    ["Faculty / Videos section", [
      ["faculty_eyebrow", "Small heading", "Teachers + Reels"],
      ["faculty_title", "Main heading", "Faculty Highlights"]]],
    ["Resources section", [
      ["res_eyebrow", "Small heading", "Free Preparation Tools"],
      ["res_title", "Main heading", "Resources & Updates"],
      ["res_pill", "Large box badge", "Daily"],
      ["res_main_t", "Large box heading", "Daily Current Affairs"],
      ["res_main_d", "Large box description", "Exam-oriented current affairs with short notes and PDF download."],
      ["res_btn", "Large box button", "Get PDF"],
      ["res1", "List item 1", "Syllabus PDFs"],
      ["res2", "List item 2", "Previous Year Papers"],
      ["res3", "List item 3", "Vacancy Updates"],
      ["res4", "List item 4", "Preparation Strategy"],
      ["res_view", "PDF page: view button", "View"],
      ["res_download", "PDF page: download button", "Download"],
      ["res_empty", "PDF page: text when no PDF is available", "No PDFs have been added to this section yet. Please check back soon."]]],
    ["Blog", [
      ["blog_eyebrow", "Small heading", "Latest Articles"],
      ["blog_title", "Main heading", "Blog"],
      ["blog_read", "Read post button", "Read More"],
      ["blog_back", "Back to all posts link", "All Posts"],
      ["blog_empty", "Text when there are no posts", "No posts yet. New articles will be published here soon."]]],
    ["Results section", [
      ["results_eyebrow", "Small heading", "Results & Feedback"],
      ["results_title", "Main heading", "Selected Students & Success Stories"],
      ["results_badge", "Box badge", "Our Results"],
      ["results_box_title", "Box heading", "Rajasthan Govt. Exam Selections"]]],
    ["App Download section", [
      ["app_eyebrow", "Small heading", "Learning On Every Device"],
      ["app_title", "Main heading", "Download Quality Education App"],
      ["app1_t", "App 1 name", "Android App"],
      ["app1_d", "App 1 description", "Best for mobile learning, live classes, recorded videos, PDFs and mock tests."],
      ["app1_btn", "App 1 button", "Get it on Play Store"],
      ["app2_t", "App 2 name", "iOS App"],
      ["app2_d", "App 2 description", "For iPhone and iPad students with smooth course access and test series support."],
      ["app2_btn", "App 2 button", "Download on App Store"],
      ["app3_t", "App 3 name", "Windows App"],
      ["app3_d", "App 3 description", "Large screen learning experience for live classes, recorded lectures and study material."],
      ["app3_btn", "App 3 button", "Download for Windows"],
      ["app_ask", "Button when no link is set", "Ask for link"],
      ["help_title", "Help bar text", "Need Help Installing?"]]],
    ["Contact and Enquiry Form", [
      ["contact_title", "Main heading", "Start Your Preparation Today"],
      ["contact_sub", "Text under the heading", "Contact us for courses, books, test series or technical support."],
      ["c_call", "Phone box label", "Call / WhatsApp"],
      ["c_email", "Email box label", "Support Email"],
      ["c_office", "Address box label", "Offices"],
      ["form_title", "Form heading", "Student Enquiry"],
      ["form_sub", "Form description", "Fill in the form and our team will call you back."],
      ["f_name", "Form: Name", "Name"],
      ["f_phone", "Form: Mobile", "Mobile Number"],
      ["f_exam", "Form: Exam", "Exam"],
      ["f_interest", "Form: Interested In", "Interested In"],
      ["f_city", "Form: City", "City / District"],
      ["f_msg", "Form: Message", "Message (optional)"],
      ["form_btn", "Form button", "Send Enquiry"]]],
    ["Footer", [
      ["foot_copy", "Copyright text", "Quality Education. All rights reserved."]]]
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

// ---------- PDF ke section (Resources). Naam Website Text se aate hain. ----------
(function () {
  var Q = window.QE;
  // [link mein aane wala naam, Website Text ki key jisse section ka naam aata hai]
  Q.DOC_CATS = [["current", "res_main_t"], ["syllabus", "res1"], ["papers", "res2"], ["vacancy", "res3"], ["strategy", "res4"]];
})();
