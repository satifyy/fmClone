import type { Metadata } from "next";
import { ReactNode } from "react";

import "../app/globals.css";

export const metadata: Metadata = {
  title: "FM Clone",
  description: "Fictional soccer management simulation"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
