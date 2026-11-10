/**
 * Where each account lands on the public website. Pure — safe for client components.
 *
 * Only employers and candidates have a place here. Staff accounts have nothing on the public
 * site: the console is reached at its own address, never through a link or a redirect from
 * this one, so anything else is sent to the home page.
 */
export function homeFor(role: string | null | undefined): string {
  switch (role) {
    case "employer":
      return "/portal/employer";
    case "candidate":
      return "/portal/candidate";
    default:
      return "/";
  }
}
