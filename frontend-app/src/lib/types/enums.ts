export enum UserRole {
    ADMIN = 'admin',
    SUPPORT = 'support',
    FREELANCER = 'freelancer', // The tenant
    CLIENT = 'client',         // The tenant's customer
}

/**
 * Convenience constant for checking if a user has administrative privileges.
 */
export const ADMIN_ROLES = [UserRole.ADMIN, UserRole.SUPPORT] as const;

/**
 * Represents all possible roles in the system.
 */
export const ALL_ROLES = [
    UserRole.ADMIN,
    UserRole.SUPPORT,
    UserRole.FREELANCER,
    UserRole.CLIENT,
] as const;

/**
 * Human-readable labels for each role.
 */
export const UserRoleLabels: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'Administrador',
    [UserRole.SUPPORT]: 'Soporte',
    [UserRole.FREELANCER]: 'Freelancer',
    [UserRole.CLIENT]: 'Cliente',
};

/**
 * Visual badge configurations for each role (Tailwind classes).
 */
export const UserRoleBadgeStyles: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    [UserRole.SUPPORT]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    [UserRole.FREELANCER]: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    [UserRole.CLIENT]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
};
