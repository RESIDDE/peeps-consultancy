/**
 * Where each role lands after sign-in. Pure — safe for client components.
 * Staff go to the separate admin console app; the main site sets
 * NEXT_PUBLIC_ADMIN_URL to its address (unset inside the console itself).
 */
export function homeFor(role: string | null | undefined): string {
  switch (role) {
    case "admin":
    case "recruiter":
      return `${process.env.NEXT_PUBLIC_ADMIN_URL ?? ""}/console`;
    case "employer":
      return "/portal/employer";
    default:
      return "/portal/candidate";
  }
}
