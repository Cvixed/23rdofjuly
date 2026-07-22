-- Jalankan perintah SQL ini di menu "SQL Editor" pada dashboard Supabase Anda.

-- 1. Create the tables
CREATE TABLE public.todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
  due_date TIMESTAMPTZ,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.subtasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  todo_id UUID REFERENCES public.todos(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Setup Row Level Security (RLS)
-- Untuk aplikasi personal ini, kita buat public (bisa diakses siapa saja yang punya App).
-- Jika ingin lebih aman, Anda bisa mengubahnya ke mode Authenticated user nantinya.
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read access on todos" ON public.todos FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access on todos" ON public.todos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access on todos" ON public.todos FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete access on todos" ON public.todos FOR DELETE USING (true);

CREATE POLICY "Allow anonymous read access on subtasks" ON public.subtasks FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access on subtasks" ON public.subtasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access on subtasks" ON public.subtasks FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete access on subtasks" ON public.subtasks FOR DELETE USING (true);
