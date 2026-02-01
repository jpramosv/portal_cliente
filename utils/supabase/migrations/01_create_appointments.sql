-- Create appointments table
create table if not exists appointments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  clinicorp_id text unique, -- External ID from Clinicorp
  patient_id text, -- Flexible ID for patient (can be linked to profiles later)
  professional_id text, -- ID of the dentist/professional
  start_time timestamptz not null,
  end_time timestamptz not null,
  status text default 'scheduled', -- scheduled, confirmed, cancelled, completed, no-show
  procedure_type text, -- Ex: 'Manutenção', 'Avaliação'
  notes text,
  metadata jsonb default '{}'::jsonb
);

-- Indexes for performance
create index if not exists idx_appointments_start_time on appointments(start_time);
create index if not exists idx_appointments_patient_id on appointments(patient_id);
create index if not exists idx_appointments_clinicorp_id on appointments(clinicorp_id);
create index if not exists idx_appointments_status on appointments(status);

-- RLS Policies (Example - Open for now, lock down later)
alter table appointments enable row level security;

create policy "Enable read access for all users" on appointments
    for select using (true);

create policy "Enable insert access for authenticated users" on appointments
    for insert with check (true);

create policy "Enable update access for authenticated users" on appointments
    for update using (true);
