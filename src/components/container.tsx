export default function Container({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="flex flex-col min-h-screen">{children}</div>;
}
