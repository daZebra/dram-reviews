const routes = [
  {
    name: "Terms & Conditions",
    path: "/terms-conditions",
  },
  {
    name: "Privacy Policy",
    path: "/privacy-policy",
  },
];

{
  /* <header className="flex w-full">
      <div className="max-w-7xl mx-auto flex justify-between items-center border-b border-neutral/10 h-14 px-3 sm:px-9 w-full"></div> */
}

export default function Footer() {
  return (
    <footer className="mt-auto">
      <div className="max-w-7xl mx-auto  flex items-center justify-between h-16 border-t border-neutral/10 px-3 sm:px-9 text-xs text-base-content/50">
        <small className="text-xs">
          Made with 💜 by{" "}
          <a
            className="underline font-medium text-base-content/40"
            href="https://jeremycullen.framer.website/"
          >
            Jeremy Cullen
          </a>
        </small>
        <ul className="flex gap-x-3 sm:gap-x-8">
          {routes.map((route) => (
            <li key={route.path}>
              <a href={route.path}>{route.name}</a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
