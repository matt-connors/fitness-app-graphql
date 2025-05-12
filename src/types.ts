import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export const PermissionAction = {
    VIEW: "VIEW",
    EDIT: "EDIT",
    CREATE: "CREATE",
    DELETE: "DELETE",
    MANAGE: "MANAGE"
} as const;
export type PermissionAction = (typeof PermissionAction)[keyof typeof PermissionAction];
export const PermissionResource = {
    DEFAULT: "DEFAULT"
} as const;
export type PermissionResource = (typeof PermissionResource)[keyof typeof PermissionResource];
export const AuthProvider = {
    Email: "Email",
    Google: "Google",
    Apple: "Apple"
} as const;
export type AuthProvider = (typeof AuthProvider)[keyof typeof AuthProvider];
export const UnitPreference = {
    Metric: "Metric",
    Imperial: "Imperial"
} as const;
export type UnitPreference = (typeof UnitPreference)[keyof typeof UnitPreference];
export const Gender = {
    Male: "Male",
    Female: "Female"
} as const;
export type Gender = (typeof Gender)[keyof typeof Gender];
export const UserRoutineRole = {
    Creator: "Creator",
    Participant: "Participant"
} as const;
export type UserRoutineRole = (typeof UserRoutineRole)[keyof typeof UserRoutineRole];
export const SkillLevel = {
    Beginner: "Beginner",
    Intermediate: "Intermediate",
    Advanced: "Advanced",
    AllLevels: "AllLevels"
} as const;
export type SkillLevel = (typeof SkillLevel)[keyof typeof SkillLevel];
export const TargetMuscle = {
    Chest: "Chest",
    Back: "Back",
    Legs: "Legs",
    Shoulders: "Shoulders",
    Arms: "Arms",
    Core: "Core"
} as const;
export type TargetMuscle = (typeof TargetMuscle)[keyof typeof TargetMuscle];
export const RoutineType = {
    Strength: "Strength",
    Endurance: "Endurance",
    Flexibility: "Flexibility",
    Balance: "Balance",
    Mobility: "Mobility"
} as const;
export type RoutineType = (typeof RoutineType)[keyof typeof RoutineType];
export type Exercise = {
    id: Generated<number>;
    name: string;
    targetMuscle: TargetMuscle;
    iconUrl: string;
    posterUrl: string;
    instructions: unknown | null;
    cues: unknown | null;
    overview: string | null;
};
export type Routine = {
    id: Generated<number>;
    name: string;
    type: RoutineType;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
    skillLevel: SkillLevel | null;
};
export type RoutineExercise = {
    routineId: number;
    exerciseId: number;
    notes: string | null;
    sets: unknown;
    restTime: number | null;
    order: number;
    rir: number | null;
};
export type Session = {
    id: Generated<number>;
    userId: number;
    routineId: number | null;
    name: string | null;
    date: Generated<Timestamp>;
    duration: number | null;
    notes: string | null;
};
export type SessionExercise = {
    id: Generated<number>;
    sessionId: number;
    exerciseId: number;
};
export type SessionSet = {
    id: Generated<number>;
    sessionExerciseId: number;
    setNumber: number;
    reps: number | null;
    weight: number | null;
};
export type User = {
    id: Generated<number>;
    username: string;
    email: string;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
    profilePictureUrl: string | null;
    authProvider: AuthProvider;
    authProviderId: string | null;
    preferredUnits: UnitPreference;
    notificationsEnabled: Generated<boolean>;
    gender: Gender | null;
    age: number | null;
    height: number | null;
    weight: number | null;
};
export type UserRoutine = {
    userId: number;
    routineId: number;
    role: UserRoutineRole;
    joinedAt: Generated<Timestamp>;
};
export type DB = {
    Exercise: Exercise;
    Routine: Routine;
    RoutineExercise: RoutineExercise;
    Session: Session;
    SessionExercise: SessionExercise;
    SessionSet: SessionSet;
    User: User;
    UserRoutine: UserRoutine;
};
