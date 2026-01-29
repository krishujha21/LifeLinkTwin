/**
 * LifeLink Twin - Role-Based Access Control (RBAC)
 * 
 * Defines what each role can access in the system:
 * - Doctor/Nurse: Patient-focused views (vitals, patient info, medical data)
 * - Admin: System-focused views (network, infrastructure, technical data)
 */

// Role definitions
export const ROLES = {
    ADMIN: 'admin',
    DOCTOR: 'doctor',
    NURSE: 'nurse'
};

// Menu items accessible by medical staff (doctor/nurse) - simplified patient care only
export const MEDICAL_MENU_ITEMS = [
    'dashboard',
    'vitals',
    'patient',
    'alerts',
    'history',
    'reports'
];

// Menu items accessible by system admin
export const ADMIN_MENU_ITEMS = [
    'dashboard',
    'edgecloud',
    'qos',
    'edgefailure',
    'national',
    'scenario',
    'settings'
];

// Dashboard cards for medical staff
export const MEDICAL_DASHBOARD_SECTIONS = [
    'multiPatient',
    'heartRate',
    'spo2',
    'temperature',
    'status',
    'predictiveHealth',
    'hospitalReadiness',
    'ambulanceTracker',
    'patientLog',
    'aiExplanation',
    'handoverReport',
    'emergencyEscalation',
    'digitalTwin'
];

// Dashboard cards for system admin
export const ADMIN_DASHBOARD_SECTIONS = [
    'edgeCloud',
    'networkQoS',
    'eventLog',
    'scenarioPlayback',
    'networkStats',
    'edgeFailureBackup',
    'nationalNetwork'
];

/**
 * Check if user has medical role (doctor or nurse)
 */
export const isMedicalRole = (role) => {
    return role === ROLES.DOCTOR || role === ROLES.NURSE;
};

/**
 * Check if user has admin role
 */
export const isAdminRole = (role) => {
    return role === ROLES.ADMIN;
};

/**
 * Get allowed menu items for a role
 */
export const getAllowedMenuItems = (role) => {
    if (isAdminRole(role)) {
        return ADMIN_MENU_ITEMS;
    }
    return MEDICAL_MENU_ITEMS;
};

/**
 * Check if a specific menu item is allowed for a role
 */
export const isMenuItemAllowed = (role, menuItemId) => {
    // Dividers are always allowed
    if (menuItemId.startsWith('divider')) {
        return true;
    }

    const allowedItems = getAllowedMenuItems(role);
    return allowedItems.includes(menuItemId);
};

/**
 * Check if user can see medical/patient data
 */
export const canViewPatientData = (role) => {
    return isMedicalRole(role);
};

/**
 * Check if user can see technical/system data
 */
export const canViewSystemData = (role) => {
    return isAdminRole(role);
};

/**
 * Get dashboard sections visible to role
 */
export const getVisibleDashboardSections = (role) => {
    if (isAdminRole(role)) {
        return ADMIN_DASHBOARD_SECTIONS;
    }
    return MEDICAL_DASHBOARD_SECTIONS;
};

/**
 * Get role display name
 */
export const getRoleDisplayName = (role) => {
    switch (role) {
        case ROLES.ADMIN:
            return 'System Administrator';
        case ROLES.DOCTOR:
            return 'Doctor';
        case ROLES.NURSE:
            return 'Nurse';
        default:
            return 'User';
    }
};

/**
 * Get role icon
 */
export const getRoleIcon = (role) => {
    switch (role) {
        case ROLES.ADMIN:
            return '🔧';
        case ROLES.DOCTOR:
            return '👨‍⚕️';
        case ROLES.NURSE:
            return '👩‍⚕️';
        default:
            return '👤';
    }
};

export default {
    ROLES,
    isMedicalRole,
    isAdminRole,
    getAllowedMenuItems,
    isMenuItemAllowed,
    canViewPatientData,
    canViewSystemData,
    getVisibleDashboardSections,
    getRoleDisplayName,
    getRoleIcon
};
