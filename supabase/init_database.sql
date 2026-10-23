-- ====================================================================
-- AURUM FITNESS SUITE - SUPABASE DATABASE INITIALIZATION SCRIPT
-- PostgreSQL Schema: Profiles, Routines, Exercises & Workout Logs
-- ====================================================================

-- 1. Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Creación de tipos ENUM
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('member', 'trainer', 'admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fitness_goal') THEN
        CREATE TYPE fitness_goal AS ENUM ('muscle_gain', 'fat_loss', 'endurance', 'maintenance');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'routine_difficulty') THEN
        CREATE TYPE routine_difficulty AS ENUM ('principiante', 'intermedio', 'avanzado', 'elite');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'muscle_group') THEN
        CREATE TYPE muscle_group AS ENUM ('pecho', 'espalda', 'piernas', 'hombros', 'brazos', 'core', 'cardio', 'cuerpo_completo');
    END IF;
END $$;

-- 3. Tabla de Perfiles de Usuario (Vinculada a auth.users de Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role user_role DEFAULT 'member'::user_role,
    fitness_goal fitness_goal DEFAULT 'muscle_gain'::fitness_goal,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Trigger para actualizar updated_at en profiles
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 4. Trigger Automático: Crear Perfil al Registrarse en Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_first_name TEXT;
    v_last_name TEXT;
    v_full_name TEXT;
BEGIN
    v_first_name := COALESCE(NEW.raw_user_meta_data->>'first_name', 'Atleta');
    v_last_name  := COALESCE(NEW.raw_user_meta_data->>'last_name', 'Gold');
    v_full_name  := COALESCE(NEW.raw_user_meta_data->>'full_name', v_first_name || ' ' || v_last_name);

    INSERT INTO public.profiles (id, first_name, last_name, full_name, email, role, created_at, updated_at)
    VALUES (
        NEW.id,
        v_first_name,
        v_last_name,
        v_full_name,
        NEW.email,
        'member',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enlazar trigger con la tabla interna de usuarios de Supabase
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 5. Tabla de Rutinas de Entrenamiento
CREATE TABLE IF NOT EXISTS public.routines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    difficulty routine_difficulty DEFAULT 'intermedio'::routine_difficulty,
    duration_minutes INTEGER NOT NULL DEFAULT 45,
    target_calories_burn INTEGER NOT NULL DEFAULT 400,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

DROP TRIGGER IF EXISTS set_routines_updated_at ON public.routines;
CREATE TRIGGER set_routines_updated_at
    BEFORE UPDATE ON public.routines
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 6. Tabla de Ejercicios
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    routine_id UUID NOT NULL REFERENCES public.routines(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    muscle_group muscle_group NOT NULL,
    sets INTEGER NOT NULL DEFAULT 3,
    reps INTEGER NOT NULL DEFAULT 10,
    weight_kg NUMERIC(6,2) DEFAULT 0,
    rest_seconds INTEGER DEFAULT 60,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. Tabla de Registro de Sesiones / Logs de Entrenamiento
CREATE TABLE IF NOT EXISTS public.workout_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    routine_id UUID REFERENCES public.routines(id) ON DELETE SET NULL,
    started_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    completed_at TIMESTAMPTZ,
    calories_burned INTEGER DEFAULT 0,
    completed_sets INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. Índices para Alto Rendimiento
CREATE INDEX IF NOT EXISTS idx_routines_user_id ON public.routines(user_id);
CREATE INDEX IF NOT EXISTS idx_routines_is_public ON public.routines(is_public);
CREATE INDEX IF NOT EXISTS idx_exercises_routine_id ON public.exercises(routine_id);
CREATE INDEX IF NOT EXISTS idx_workout_logs_user_id ON public.workout_logs(user_id);

-- 9. Políticas de Seguridad (Row Level Security - RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de Profiles
CREATE POLICY "Los usuarios pueden leer perfiles públicos"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Políticas de Routines
CREATE POLICY "Lectura de rutinas públicas o propias"
    ON public.routines FOR SELECT
    USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Usuarios pueden insertar sus propias rutinas"
    ON public.routines FOR INSERT
    WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Usuarios pueden actualizar sus propias rutinas"
    ON public.routines FOR UPDATE
    USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Usuarios pueden eliminar sus propias rutinas"
    ON public.routines FOR DELETE
    USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- Políticas de Exercises
CREATE POLICY "Lectura de ejercicios vinculados a rutinas accesibles"
    ON public.exercises FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.routines r
        WHERE r.id = exercises.routine_id AND (r.is_public = true OR r.user_id = auth.uid())
    ));

CREATE POLICY "Gestión de ejercicios de rutinas propias"
    ON public.exercises FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.routines r
        WHERE r.id = exercises.routine_id AND (r.user_id = auth.uid() OR auth.role() = 'service_role')
    ));

-- Políticas de Workout Logs
CREATE POLICY "Usuarios gestionan sus propios registros de entrenamiento"
    ON public.workout_logs FOR ALL
    USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- ====================================================================
-- 10. DATOS SEMILLA (Seed Data de Rutinas y Ejercicios Gold)
-- ====================================================================

DO $$
DECLARE
    v_routine_1 UUID;
    v_routine_2 UUID;
    v_routine_3 UUID;
BEGIN
    -- Verificar si ya existen rutinas para evitar duplicados en re-ejecución
    IF NOT EXISTS (SELECT 1 FROM public.routines WHERE title = 'Hipertrofia Gold: Torso Superior') THEN

        -- Rutina 1: Torso Superior
        INSERT INTO public.routines (id, user_id, title, description, difficulty, duration_minutes, target_calories_burn, is_public)
        VALUES (
            gen_random_uuid(),
            NULL,
            'Hipertrofia Gold: Torso Superior',
            'Rutina de alto impacto diseñada para hipertrofia y fuerza en pecho, espalda y hombros.',
            'avanzado',
            60,
            550,
            true
        ) RETURNING id INTO v_routine_1;

        INSERT INTO public.exercises (routine_id, name, muscle_group, sets, reps, weight_kg, order_index) VALUES
        (v_routine_1, 'Press de Banca Plano con Barra', 'pecho', 4, 8, 80.0, 1),
        (v_routine_1, 'Dominadas con Lastre', 'espalda', 4, 6, 10.0, 2),
        (v_routine_1, 'Press Militar con Mancuernas', 'hombros', 3, 10, 24.0, 3),
        (v_routine_1, 'Remo con Barra T', 'espalda', 4, 10, 70.0, 4),
        (v_routine_1, 'Fondos en Paralelas', 'pecho', 3, 12, 0.0, 5);

        -- Rutina 2: Tren Inferior
        INSERT INTO public.routines (id, user_id, title, description, difficulty, duration_minutes, target_calories_burn, is_public)
        VALUES (
            gen_random_uuid(),
            NULL,
            'Fuerza & Potencia: Tren Inferior',
            'Enfoque biomecánico en cuádriceps, glúteos e isquiotibiales con sobrecarga progresiva.',
            'elite',
            70,
            620,
            true
        ) RETURNING id INTO v_routine_2;

        INSERT INTO public.exercises (routine_id, name, muscle_group, sets, reps, weight_kg, order_index) VALUES
        (v_routine_2, 'Sentadilla Trasera Profunda', 'piernas', 5, 5, 120.0, 1),
        (v_routine_2, 'Peso Muerto Rumano', 'piernas', 4, 8, 100.0, 2),
        (v_routine_2, 'Prensa Inclinada 45°', 'piernas', 4, 12, 200.0, 3),
        (v_routine_2, 'Elevación de Talones en Máquina', 'piernas', 4, 15, 80.0, 4);

        -- Rutina 3: Core y Acondicionamiento
        INSERT INTO public.routines (id, user_id, title, description, difficulty, duration_minutes, target_calories_burn, is_public)
        VALUES (
            gen_random_uuid(),
            NULL,
            'Acondicionamiento & Core Dorado',
            'Circuito funcional dinámico para máxima quema calórica y estabilidad de core.',
            'intermedio',
            45,
            480,
            true
        ) RETURNING id INTO v_routine_3;

        INSERT INTO public.exercises (routine_id, name, muscle_group, sets, reps, weight_kg, order_index) VALUES
        (v_routine_3, 'Kettlebell Swings', 'core', 4, 20, 24.0, 1),
        (v_routine_3, 'Plancha Abdominal Activa', 'core', 4, 60, 0.0, 2),
        (v_routine_3, 'Rueda Abdominal (Ab Wheel)', 'core', 3, 12, 0.0, 3);

    END IF;
END $$;
