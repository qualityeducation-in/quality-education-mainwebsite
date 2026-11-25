-- Quality Education website: Supabase database setup
-- Supabase Dashboard > SQL Editor > New query mein yeh poori file paste karke "Run" dabayein.

-- ---------- Admin kaun hai ----------
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);
alter table public.admins enable row level security;   -- koi policy nahi: bahar se koi padh ya likh nahi sakta

create function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------- Tables ----------
create table public.items (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('course', 'test')),
  title text not null check (char_length(title) between 1 and 150),
  exam text not null default 'Other',
  tag text not null default '',
  meta text not null default '',
  descr text not null default '',
  price int not null default 0,
  mrp int not null default 0,
  video_url text not null default '',
  is_free boolean not null default false,
  is_active boolean not null default true,
  sort int not null default 0
);

create table public.reels (
  id bigint generated always as identity primary key,
  title text not null check (char_length(title) between 1 and 100),
  subtitle text not null default '',
  url text not null,
  is_active boolean not null default true,
  sort int not null default 0
);

create table public.results (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 1 and 100),
  detail text not null default '',
  sort int not null default 0
);

create table public.settings (
  k text primary key,
  v text not null default ''
);

create table public.enquiries (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 2 and 60),
  phone text not null check (phone ~ '^[6-9][0-9]{9}$'),
  exam text not null default '' check (char_length(exam) <= 30),
  interest text not null default '' check (char_length(interest) <= 30),
  city text not null default '' check (char_length(city) <= 60),
  message text not null default '' check (char_length(message) <= 500),
  status text not null default 'new' check (status in ('new', 'contacted', 'enrolled', 'closed')),
  created_at timestamptz not null default now()
);

-- ---------- Security (Row Level Security) ----------
alter table public.items enable row level security;
alter table public.reels enable row level security;
alter table public.results enable row level security;
alter table public.settings enable row level security;
alter table public.enquiries enable row level security;

-- Website par sab log padh sakte hain (hidden items sirf admin ko dikhte hain)
create policy "public read items" on public.items for select using (is_active or public.is_admin());
create policy "public read reels" on public.reels for select using (is_active or public.is_admin());
create policy "public read results" on public.results for select using (true);
create policy "public read settings" on public.settings for select using (true);

-- Badlaav sirf admin kar sakta hai
create policy "admin insert items" on public.items for insert with check (public.is_admin());
create policy "admin update items" on public.items for update using (public.is_admin()) with check (public.is_admin());
create policy "admin delete items" on public.items for delete using (public.is_admin());

create policy "admin insert reels" on public.reels for insert with check (public.is_admin());
create policy "admin update reels" on public.reels for update using (public.is_admin()) with check (public.is_admin());
create policy "admin delete reels" on public.reels for delete using (public.is_admin());

create policy "admin insert results" on public.results for insert with check (public.is_admin());
create policy "admin update results" on public.results for update using (public.is_admin()) with check (public.is_admin());
create policy "admin delete results" on public.results for delete using (public.is_admin());

create policy "admin insert settings" on public.settings for insert with check (public.is_admin());
create policy "admin update settings" on public.settings for update using (public.is_admin()) with check (public.is_admin());
create policy "admin delete settings" on public.settings for delete using (public.is_admin());

-- Enquiry: koi bhi bhej sakta hai (sirf "new" status ke saath), padhna/badalna sirf admin
create policy "anyone can send enquiry" on public.enquiries for insert with check (status = 'new');
create policy "admin read enquiries" on public.enquiries for select using (public.is_admin());
create policy "admin update enquiries" on public.enquiries for update using (public.is_admin()) with check (public.is_admin());
create policy "admin delete enquiries" on public.enquiries for delete using (public.is_admin());

-- API ke liye permissions (asli rok-tok upar ki policies karti hain)
grant usage on schema public to anon, authenticated;
grant select on public.items, public.reels, public.results, public.settings to anon, authenticated;
grant insert, update, delete on public.items, public.reels, public.results, public.settings to authenticated;
grant insert on public.enquiries to anon, authenticated;
grant select, update, delete on public.enquiries to authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------- Shuruaati data ----------
insert into public.items (kind, title, exam, tag, meta, descr, is_free, sort) values
('course', 'RAS Foundation Course', 'RAS', 'Live + Recorded', '12 Months · Expert Faculty', 'Complete syllabus, live classes, PDFs, test series and revision plan.', false, 1),
('course', 'LDC 2026 Complete Batch', 'LDC', 'Most Popular', 'PYQ Based · PDF Notes', 'GK, Science, Hindi, English, Math & Reasoning with practice tests.', false, 2),
('course', 'PSI Target Batch', 'PSI', 'Combo', 'Full Test · Rank System', 'Concept classes, mock tests, answer explanation and strategy sessions.', false, 3),
('test', 'LDC 2026 Test Series', 'LDC', 'Online + Offline', 'Topic-wise · Full Length', 'Naye pattern par mock tests, rank aur detailed analysis ke saath.', false, 1),
('test', 'RAS Pre Test Series', 'RAS', 'State Level Rank', 'Subject-wise · Full Length', 'Har test ke baad accuracy, speed aur subject performance report.', false, 2),
('test', 'Daily Free Test', 'Other', 'Free', 'Roz ek naya test', 'Rozana practice ke liye free test, sabhi Rajasthan exams ke liye.', true, 3);

insert into public.reels (title, subtitle, url, sort) values
('Science Tips', 'Faculty Reel', 'https://www.youtube.com/channel/UC7FWT474H8a7-pLf1Tutdeg', 1),
('Motivation', 'Daily Push', 'https://www.youtube.com/channel/UC7FWT474H8a7-pLf1Tutdeg', 2),
('Exam Strategy', 'Short Clips', 'https://www.youtube.com/channel/UC7FWT474H8a7-pLf1Tutdeg', 3),
('Current Affairs', 'Quick Revision', 'https://www.youtube.com/channel/UC7FWT474H8a7-pLf1Tutdeg', 4);

insert into public.results (name, detail, sort) values
('Karan', 'Selected in RAS (2018)', 1),
('Ravi', 'Selected in Constable (2021)', 2),
('Sandeep', 'Selected in Patwar (2021)', 3),
('Mohd. Shakil', 'Selected in Patwar · 77 marks in VDO', 4),
('Aarika Choudhary', 'Patwar DV qualified · 70 marks in VDO', 5),
('Jitendra Singh Charan', '74 marks in VDO', 6);

insert into public.settings (k, v) values
('notice_text', 'LDC 2026 Science Book + Free PYQ Booklet Available Now'),
('phone', '8949294370'),
('email', 'support@qualityeducation.in'),
('address', 'Jaipur & Ajmer'),
('hero_stats', E'10L+|App Downloads\n7L+|YouTube Family\n100+|Expert Courses\n24×7|Support'),
('result_stats', E'10,000+|Happy members\n3,000|Patwar students\n300|RAS members\n95%|Success ratio'),
('book_title', 'LDC Science Book with Free PYQ Booklet'),
('book_desc', 'Infographic colourful presentation, flow chart short notes and NCERT + RBSE का निचोड़. Biology, Physics, Chemistry & Technology in one book.'),
('book_points', E'Colourful Notes\nPYQ 2018-2024\nExam Oriented\nCOD / Online Order'),
('play_url', 'https://play.google.com/store/apps/details?id=com.QualityEducation'),
('ios_url', ''),
('windows_url', ''),
('instagram', 'https://www.instagram.com/qualityeducation.in/'),
('youtube', 'https://www.youtube.com/channel/UC7FWT474H8a7-pLf1Tutdeg'),
('facebook', 'https://www.facebook.com/QualityEducationLive/'),
('twitter', 'https://twitter.com/q_ed_nschouhan'),
('telegram', ''),
('whatsapp_channel', ''),
('linkedin', '');
