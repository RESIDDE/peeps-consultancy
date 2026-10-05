/** Where each role lands after sign-in. Pure — safe for client components. */
export function homeFor(role: string | null | undefined): string {
  switch (role) {
    case "admin":
    case "recruiter":
      return "/console";
    case "employer":
      return "/portal/employer";
    default:
      return "/portal/candidate";
  }
}
