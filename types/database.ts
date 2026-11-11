export type GoalType = 'quantitative' | 'completion' | 'date';
export type GoalStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type HabitType = 'check' | 'quantitative';
export type FrequencyType = 'daily' | 'weekly_days' | 'custom';
export type ProjectStatus = 'active' | 'paused' | 'completed' | 'archived';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
/** Color del proyecto: una de las claves de la paleta de acentos. */
export type ProjectColor = 'brand' | 'ocean' | 'amber' | 'plum' | 'clay';
export type ThemePreference = 'light' | 'dark' | 'system';
export type FontSize = 'small' | 'normal' | 'large';
/** Áreas de la vida que organiza la app. */
export type Area = 'trabajo' | 'personal' | 'salud' | 'general';
/** Áreas que tienen tareas, proyectos y vencimientos. */
export type WorkArea = 'trabajo' | 'personal';
export type DeadlineKind = 'vencimiento' | 'fecha';
export type Recurrence = 'none' | 'monthly' | 'yearly';
export type BookStatus = 'pendiente' | 'leyendo' | 'leido';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          reminder_email: string | null;
          reminders_enabled: boolean;
          id: string;
          height_cm: number | null;
          initial_weight_kg: number | null;
          daily_steps_goal: number;
          theme: ThemePreference;
          font_size: FontSize;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          reminder_email?: string | null;
          reminders_enabled?: boolean;
          id: string;
          height_cm?: number | null;
          initial_weight_kg?: number | null;
          daily_steps_goal?: number;
          theme?: ThemePreference;
          font_size?: FontSize;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          reminder_email?: string | null;
          reminders_enabled?: boolean;
          id?: string;
          height_cm?: number | null;
          initial_weight_kg?: number | null;
          daily_steps_goal?: number;
          theme?: ThemePreference;
          font_size?: FontSize;
          updated_at?: string;
        };
        Relationships: [];
      };
      goals: {
        Row: {
          area: Area;
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          type: GoalType;
          start_date: string;
          target_date: string | null;
          initial_value: number | null;
          target_value: number | null;
          current_value: number | null;
          unit: string | null;
          status: GoalStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          area?: Area;
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          type?: GoalType;
          start_date?: string;
          target_date?: string | null;
          initial_value?: number | null;
          target_value?: number | null;
          current_value?: number | null;
          unit?: string | null;
          status?: GoalStatus;
        };
        Update: {
          area?: Area;
          name?: string;
          description?: string | null;
          type?: GoalType;
          start_date?: string;
          target_date?: string | null;
          initial_value?: number | null;
          target_value?: number | null;
          current_value?: number | null;
          unit?: string | null;
          status?: GoalStatus;
        };
        Relationships: [];
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          type: HabitType;
          target_value: number | null;
          unit: string | null;
          frequency_type: FrequencyType;
          weekdays: number[];
          start_date: string;
          end_date: string | null;
          active: boolean;
          use_step_records: boolean;
          goal_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          type?: HabitType;
          target_value?: number | null;
          unit?: string | null;
          frequency_type?: FrequencyType;
          weekdays?: number[];
          start_date?: string;
          end_date?: string | null;
          active?: boolean;
          use_step_records?: boolean;
          goal_id?: string | null;
        };
        Update: {
          name?: string;
          description?: string | null;
          type?: HabitType;
          target_value?: number | null;
          unit?: string | null;
          frequency_type?: FrequencyType;
          weekdays?: number[];
          start_date?: string;
          end_date?: string | null;
          active?: boolean;
          use_step_records?: boolean;
          goal_id?: string | null;
        };
        Relationships: [];
      };
      weight_records: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          weight_kg: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          weight_kg: number;
        };
        Update: {
          date?: string;
          weight_kg?: number;
        };
        Relationships: [];
      };
      step_records: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          steps: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          steps: number;
        };
        Update: {
          date?: string;
          steps?: number;
        };
        Relationships: [];
      };
      habit_records: {
        Row: {
          id: string;
          user_id: string;
          habit_id: string;
          date: string;
          completed: boolean;
          value: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          habit_id: string;
          date: string;
          completed?: boolean;
          value?: number | null;
        };
        Update: {
          completed?: boolean;
          value?: number | null;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          area: WorkArea;
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          color: ProjectColor;
          start_date: string;
          target_date: string | null;
          status: ProjectStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          area?: WorkArea;
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          color?: ProjectColor;
          start_date?: string;
          target_date?: string | null;
          status?: ProjectStatus;
        };
        Update: {
          area?: WorkArea;
          name?: string;
          description?: string | null;
          color?: ProjectColor;
          start_date?: string;
          target_date?: string | null;
          status?: ProjectStatus;
        };
        Relationships: [];
      };
      project_stages: {
        Row: {
          id: string;
          user_id: string;
          project_id: string;
          name: string;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id: string;
          name: string;
          position?: number;
        };
        Update: {
          name?: string;
          position?: number;
        };
        Relationships: [];
      };
      project_tasks: {
        Row: {
          id: string;
          user_id: string;
          project_id: string;
          stage_id: string;
          title: string;
          notes: string | null;
          due_date: string | null;
          status: TaskStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id: string;
          stage_id: string;
          title: string;
          notes?: string | null;
          due_date?: string | null;
          status?: TaskStatus;
        };
        Update: {
          stage_id?: string;
          title?: string;
          notes?: string | null;
          due_date?: string | null;
          status?: TaskStatus;
        };
        Relationships: [];
      };
      meetings: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          date: string;
          attendees: string | null;
          notes: string | null;
          decisions: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          date?: string;
          attendees?: string | null;
          notes?: string | null;
          decisions?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          date?: string;
          attendees?: string | null;
          notes?: string | null;
          decisions?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          area: WorkArea;
          title: string;
          notes: string | null;
          due_date: string | null;
          done: boolean;
          done_at: string | null;
          meeting_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          area?: WorkArea;
          title: string;
          notes?: string | null;
          due_date?: string | null;
          done?: boolean;
          done_at?: string | null;
          meeting_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          area?: WorkArea;
          title?: string;
          notes?: string | null;
          due_date?: string | null;
          done?: boolean;
          done_at?: string | null;
          meeting_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      deadlines: {
        Row: {
          id: string;
          user_id: string;
          area: WorkArea;
          kind: DeadlineKind;
          title: string;
          due_date: string;
          recurrence: Recurrence;
          remind_days: number;
          notes: string | null;
          done: boolean;
          last_done: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          area?: WorkArea;
          kind?: DeadlineKind;
          title: string;
          due_date: string;
          recurrence?: Recurrence;
          remind_days?: number;
          notes?: string | null;
          done?: boolean;
          last_done?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          area?: WorkArea;
          kind?: DeadlineKind;
          title?: string;
          due_date?: string;
          recurrence?: Recurrence;
          remind_days?: number;
          notes?: string | null;
          done?: boolean;
          last_done?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      books: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          author: string | null;
          status: BookStatus;
          started_on: string | null;
          finished_on: string | null;
          rating: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          author?: string | null;
          status?: BookStatus;
          started_on?: string | null;
          finished_on?: string | null;
          rating?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          author?: string | null;
          status?: BookStatus;
          started_on?: string | null;
          finished_on?: string | null;
          rating?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      notes: {
        Row: {
          id: string;
          user_id: string;
          area: Area;
          title: string | null;
          body: string;
          pinned: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          area?: Area;
          title?: string | null;
          body: string;
          pinned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          area?: Area;
          title?: string | null;
          body?: string;
          pinned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      weekly_reviews: {
        Row: {
          id: string;
          user_id: string;
          week_start: string;
          highlights: string | null;
          blockers: string | null;
          next_focus: string | null;
          mood: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          week_start: string;
          highlights?: string | null;
          blockers?: string | null;
          next_focus?: string | null;
          mood?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          week_start?: string;
          highlights?: string | null;
          blockers?: string | null;
          next_focus?: string | null;
          mood?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Goal = Database['public']['Tables']['goals']['Row'];
export type GoalInsert = Database['public']['Tables']['goals']['Insert'];
export type GoalUpdate = Database['public']['Tables']['goals']['Update'];

export type Habit = Database['public']['Tables']['habits']['Row'];
export type HabitInsert = Database['public']['Tables']['habits']['Insert'];
export type HabitUpdate = Database['public']['Tables']['habits']['Update'];

export type Project = Database['public']['Tables']['projects']['Row'];
export type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
export type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

export type ProjectStage = Database['public']['Tables']['project_stages']['Row'];
export type ProjectStageInsert = Database['public']['Tables']['project_stages']['Insert'];
export type ProjectStageUpdate = Database['public']['Tables']['project_stages']['Update'];

export type ProjectTask = Database['public']['Tables']['project_tasks']['Row'];
export type ProjectTaskInsert = Database['public']['Tables']['project_tasks']['Insert'];
export type ProjectTaskUpdate = Database['public']['Tables']['project_tasks']['Update'];

export type Meeting = Database['public']['Tables']['meetings']['Row'];
export type Task = Database['public']['Tables']['tasks']['Row'];
export type Deadline = Database['public']['Tables']['deadlines']['Row'];
export type Book = Database['public']['Tables']['books']['Row'];
export type Note = Database['public']['Tables']['notes']['Row'];
export type WeeklyReview = Database['public']['Tables']['weekly_reviews']['Row'];

export type WeightRecord = Database['public']['Tables']['weight_records']['Row'];
export type StepRecord = Database['public']['Tables']['step_records']['Row'];
export type HabitRecord = Database['public']['Tables']['habit_records']['Row'];

/** Datos de un formulario de objetivo (sin ids ni timestamps). */
export interface GoalFormValues {
  name: string;
  description: string;
  type: GoalType;
  start_date: string;
  target_date: string;
  initial_value: string;
  target_value: string;
  current_value: string;
  unit: string;
  status: GoalStatus;
  area: Area;
}

/** Datos de un formulario de hábito. */
export interface HabitFormValues {
  name: string;
  description: string;
  type: HabitType;
  target_value: string;
  unit: string;
  frequency_type: FrequencyType;
  weekdays: number[];
  start_date: string;
  end_date: string;
  active: boolean;
  use_step_records: boolean;
  goal_id: string;
}
