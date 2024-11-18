import React from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
      <header>
        <h1>Database Application</h1>
      </header>
      <main>{children}</main>
      </body>
    </html>
  );
}