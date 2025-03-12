export default function BusinessRootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1>Business Root Layout</h1>
      {children}
    </div>
  );
}
