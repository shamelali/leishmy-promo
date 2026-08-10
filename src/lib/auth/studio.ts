import { useAuth } from "@/context/AuthContext";
import { hasPermission, StudioRole, Permission, ROLE_HIERARCHY, roleAuthority } from "./roles";

/**
 * Hook for studio dashboard role-based access control
 * Provides permission checking and role information
 */
export function useStudioAuth() {
  const { user } = useAuth();
   
  // Get studio role from user's profile (comes from enhanced auth session)
  // The user.role field now contains the studio-specific role thanks to our API enhancements
  const studioRole = user?.role && ROLE_HIERARCHY[user.role as StudioRole] !== undefined
    ? (user.role as StudioRole)
    : null;
   
  // Check if user has a specific permission
  const can = (permission: Permission): boolean => {
    if (!studioRole) return false;
    return hasPermission(studioRole, permission);
  };
   
  // Check if user's role has equal or higher authority than another role
  const canManageRole = (targetRole: StudioRole): boolean => {
    if (!studioRole) return false;
    // roleAuthority is imported above
    return roleAuthority(studioRole, targetRole);
  };
   
  return {
    user,
    studioRole,
    isStudioUser: !!studioRole,
    can,
    canManageRole,
    // For backward compatibility
    isOwner: studioRole === "owner",
    isManager: studioRole === "manager",
    isArtist: studioRole === "senior_artist" || studioRole === "junior_artist",
    isStaff: studioRole === "senior_artist" || studioRole === "junior_artist" || studioRole === "receptionist",
  };
}

/**
 * Wrapper component to restrict access based on permissions
 */
export function StudioAccessControl({ 
  permission, 
  children, 
  fallback = null 
}: { 
  permission: Permission; 
  children: React.ReactNode; 
  fallback?: React.ReactNode | null 
}) {
  const { can } = useStudioAuth();
  
  if (!can(permission)) {
    return fallback || null;
  }
  
  return children;
}

/**
 * Hook to get user's studio role with proper typing
 */
export function useStudioRole(): StudioRole | null {
  const { studioRole } = useStudioAuth();
  return studioRole;
}