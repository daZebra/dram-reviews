export default function Container({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex flex-col max-w-7xl min-h-screen mx-auto">
      {children}
    </div>
  );
}
