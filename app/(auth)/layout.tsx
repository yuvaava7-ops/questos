import Link from "next/link";
import { PixelScene } from "@/components/pixel/PixelScene";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col px-4 pb-12 pt-6">
      <Link href="/" className="logo-shine px-title mb-6 block text-center text-[22px]">
        QUESTOS
      </Link>
      <PixelScene mode="title" className="shadow-[0_-4px_0_0_#0b0820,0_4px_0_0_#0b0820]" />
      <div className="mt-8">{children}</div>
    </main>
  );
}
