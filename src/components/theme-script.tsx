/**
 * Applies the saved theme while the browser parses the HTML, before the first paint, so a
 * dark-mode visitor never sees a flash of the light page. `useEffect` and even
 * `useLayoutEffect` run after hydration — on a slow connection the browser has painted the
 * server's HTML long before React has loaded — so this has to be an inline script.
 *
 * The `type` swap is the fix Next's "preventing flash before hydration" guide prescribes
 * for the dev-only warning React raises when a component renders a `<script>`: scripts
 * inserted by a DOM update never execute, so React warns that one rendered on the client
 * would be dead code. On the server it is real JavaScript and runs during parsing; on the
 * client it is inert `text/plain`, which is exactly right — by then the class is already
 * set, and `ThemeToggle` owns every change after that. `suppressHydrationWarning` covers
 * the resulting mismatch in the `type` attribute itself.
 */
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('peeps-theme');var d=t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

export function ThemeScript() {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }}
    />
  );
}
