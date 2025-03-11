import type { Context } from '@/src/context'
import type { PermissionActionRanking, YogaRequestContext } from "@/src/definitions"
import type { PermissionAction } from "@/src/types";

import SchemaBuilder from '@pothos/core'
import ScopeAuthPlugin from '@pothos/plugin-scope-auth';

interface SchemaTypes {
    AuthScopes: {
        // <resource>: <access-level>
        [key: string]: PermissionAction
    };
    Scalars: {
        JSONObject: {
            Input: any;
            Output: any;
        };
        DateTime: {
            Input: any;
            Output: Date;
        };
    };
    Context: Context
};

// Define the ranking of access levels
// The higher the level grants access to previous levels
//  e.g) EDIT permission can VIEW and EDIT, MANAGE can do everything, etc
const PERMISSION_ACCESS_RANKING: PermissionActionRanking = {
    VIEW: 1,
    EDIT: 2,
    CREATE: 3,
    DELETE: 4,
    MANAGE: 5
} as const;

export const builder = new SchemaBuilder<SchemaTypes>({
    plugins: [
        ScopeAuthPlugin // See https://pothos-graphql.dev/docs/plugins/scope-auth
    ],
    scopeAuth: {
        // Recommended when using subscriptions
        // when this is not set, auth checks are run when event is resolved rather than when the subscription is created
        // authorizeOnSubscribe: true,

        // @ts-expect-error
        authScopes: async (context: YogaRequestContext) =>
            // Resolves with an object mapping a resource with a boolean value (whether access is granted)
            // This map is compared with AuthScopes property on a query resolver
            Object.fromEntries(
                // An array of *all* resources and related permission actions granted to the user
                context.permissionScopes.map(
                    // The resource name and action of that permission
                    ({ resource, action }) => [
                        resource,
                        (requiredPermissionAction: PermissionAction) =>
                            // Compare the authority of the users action to that required by the current resource
                            PERMISSION_ACCESS_RANKING[action] >= PERMISSION_ACCESS_RANKING[requiredPermissionAction]
                    ]
                )
            )
    }
})

/**
 * JSON custom type
 */
builder.scalarType('JSONObject', {
    serialize: (value) => {
        return value;
    },

    parseValue: (value: any) => {
        if (value !== null && value !== undefined) {
            return value;
        }
        else {
            throw new Error('JSONObject cannot represent non-object value: ' + value);
        }
    }
})

/**
 * Datetime custom type
 */
builder.scalarType('DateTime', {
    serialize: (value) => {
        return value.toISOString();
    },
    parseValue: (value: any) => {
        return new Date(value);
    }
})