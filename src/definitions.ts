import type { YogaInitialContext } from "graphql-yoga";
import type { PermissionAction, PermissionResource } from "@/src/types";

export type YogaRequestContext = YogaInitialContext & Env & {
    userId: string,
    permissionScopes: {
        resource: PermissionResource,
        action: PermissionAction
    }[]
}

export type PermissionActionValue = typeof PermissionAction[keyof typeof PermissionAction];
export type PermissionActionRanking = {
    [key in PermissionActionValue]: number;
};