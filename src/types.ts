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
export type User = {
    id: Generated<number>;
};
export type DB = {
    User: User;
};
