export type GoalType = 'quantitative' | 'completion' | 'date';
export type GoalStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type HabitType = 'check' | 'quantitative';
export type FrequencyType = 'daily' | 'weekly_days' | 'custom';
export type ThemePreference = 'light' | 'dark' | 'system';
export type FontSize = 'small' | 'normal' | 'large';
export type ProjectStatus = 'active' | 'paused' | 'completed' | 'archived';
export type ProjectColor = 'coral' | 'ocean' | 'sage' | 'honey' | 'plum';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
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
          completed_at: string | null;
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

export type WeightRecord = Database['public']['Tables']['weight_records']['Row'];
export type StepRecord = Database['public']['Tables']['step_records']['Row'];
export type HabitRecord = Database['public']['Tables']['habit_records']['Row'];

export type Project = Database['public']['Tables']['projects']['Row'];
export type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
export type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

export type ProjectStage = Database['public']['Tables']['project_stages']['Row'];
export type ProjectStageUpdate = Database['public']['Tables']['project_stages']['Update'];

export type ProjectTask = Database['public']['Tables']['project_tasks']['Row'];
export type ProjectTaskInsert = Database['public']['Tables']['project_tasks']['Insert'];
export type ProjectTaskUpdate = Database['public']['Tables']['project_tasks']['Update'];

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
