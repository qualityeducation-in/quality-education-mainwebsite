QUALITY EDUCATION WEBSITE (Supabase + Render version)
=====================================================

Yeh version bina PHP ke chalta hai:
- Website aur admin panel: HTML + CSS + JavaScript  (Render par "Static Site")
- Database aur admin login: Supabase

Is folder mein kya hai
----------------------
index.html          Website ka main page
admin/index.html    Admin panel (login + dashboard)
admin/admin.js      Admin panel ka code
assets/config.js    Supabase ka URL aur key (yeh aapko bharni hai)
assets/app.js       Website ka code
assets/shared.js    Website aur admin dono ka common code
assets/style.css    Website ka design
assets/admin.css    Admin panel ka design
supabase.sql        Database tables, security rules aur shuruaati data


PART A - SUPABASE SETUP (ek baar)
---------------------------------
1. supabase.com par login karein, apna project kholein (ya naya project banayein).

2. Tables banayein:
   Left menu > SQL Editor > New query.
   supabase.sql file ko Notepad mein khol kar poora copy karein, paste karein, "Run" dabayein.
   "Success" aana chahiye.

3. Admin user banayein:
   Left menu > Authentication > Users > "Add user" > "Create new user".
   Apna email aur ek mazboot password daalein. "Auto Confirm User" ko ON rakhein.

4. Us user ko admin banayein:
   SQL Editor > New query mein yeh line chalayein (apna email daal kar):

     insert into public.admins select id from auth.users where email = 'aapka@email.com';

   Sirf wahi account admin panel chala sakta hai jo is admins list mein hai.
   Doosra admin jodna ho to Step 3 aur 4 dobara karein.

5. URL aur key copy karein:
   Project Settings > API (ya "API Keys").
   - Project URL            (https://xxxxx.supabase.co)
   - anon / publishable key (public wali key)
   assets/config.js ko Notepad mein kholein aur dono cheezein bhar kar save karein.

   DHYAN: "service_role" ya "secret" key website mein KABHI na daalein.
   anon / publishable key public hoti hai, use website mein rakhna theek hai.


PART B - RENDER PAR LIVE KARNA
------------------------------
1. Is poore folder ko ek GitHub repository mein upload karein
   (github.com > New repository > "uploading an existing file" se saari files aur folders daal dein).

2. render.com > New > "Static Site" > apni GitHub repository chunein.
   - Build Command:      khaali chhod dein
   - Publish Directory:  .        (sirf ek dot)
   "Create Static Site" dabayein.

3. Kuch der mein Render ek link dega, jaise  https://quality-education.onrender.com
   Yahi link aap kisi ko bhi bhej kar website check karwa sakte hain.
   Admin panel:  usi link ke aage  /admin/

4. Aage jab bhi GitHub par koi file badlegi, Render apne aap nayi website laga dega.


PART C - APNA DOMAIN JODNA (jab sab final ho jaye)
--------------------------------------------------
1. Render > apni site > Settings > Custom Domains > qualityeducation.in aur www.qualityeducation.in jodein.
2. Render jo DNS records batayega, unhe domain company ke panel mein DNS settings mein daal dein.
3. Kuch ghante mein domain naye website par aa jayega. SSL (https) Render khud laga deta hai.
   Is step ke baad purani site hat jayegi, isliye pehle uska backup le lein.


TEST KARNE KE LIYE
------------------
1. Website kholein, enquiry form se ek test enquiry bhejein.
2. /admin/ par login karein, Enquiries mein woh dikhni chahiye.
3. Video Courses mein ek course edit karke fee daalein, website refresh karke dekhein.
4. Videos / Reels mein ek Instagram reel ya YouTube video ka link daalein,
   website par click karke dekhein ki video chal rahi hai.


ROZ KA KAAM (admin panel)
-------------------------
- Video course jodna / badalna:  Video Courses > "+ Naya Video Course" ya Edit.
  Fee khaali chhodne par website par "Fee ke liye enquiry karein" dikhta hai.
  "Demo video link" bharne par course par "Watch Demo" button aata hai.
- Instagram / YouTube video lagana:  Videos / Reels > link paste karein
  (jaise instagram.com/reel/XXXX ya youtu.be/XXXX).
- Enquiry:  status New > Contacted > Enrolled badlein, "Excel (CSV) download" se list nikalein.
- Notice patti, phone, email, social links, numbers, book:  Settings.
- Password badalna:  Settings ke neeche.


DHYAN RAKHEIN
-------------
- Supabase ka free plan: agar hafte bhar database par bahut kam activity ho to project "pause" ho jata hai.
  Tab website par courses nahi dikhenge aur enquiry nahi jayegi. Supabase dashboard se "Restore" dabane par
  sab wapas chalu ho jata hai, data nahi jata. Live site ke liye hafte mein ek baar check kar lein.
- Free plan mein automatic backup nahi hota. Mahine mein ek baar admin se enquiries ki CSV download kar lein.
- Yeh website jaankari aur enquiry ke liye hai. Online payment aur student login isme nahi hai.
