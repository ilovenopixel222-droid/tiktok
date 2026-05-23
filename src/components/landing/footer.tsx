import Link from "next/link";
import { Zap } from "lucide-react";

const links = {
  Product: ["Features", "Pricing", "Changelog", "Roadmap", "API Docs"],
  Resources: ["Blog", "Tutorials", "Help Center", "Community", "Status"],
  Company: ["About", "Careers", "Press", "Contact", "Partners"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy", "DMCA"],
};

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#020010]">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold">
                Clip<span className="gradient-text">Viral</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              AI-powered platform that turns long-form content into viral short clips automatically.
            </p>
            <div className="mt-6 flex gap-3">
              {["X", "YT", "DC", "TT"].map((social) => (
                <div
                  key={social}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-xs font-bold text-muted transition-colors hover:bg-white/10 hover:text-foreground cursor-pointer"
                >
                  {social}
                </div>
              ))}
            </div>
          </div>

          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-foreground">{category}</h4>
              <ul className="mt-4 space-y-3">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-muted transition-colors hover:text-foreground"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
          <p className="text-xs text-muted">
            &copy; {new Date().getFullYear()} ClipViral. All rights reserved.
          </p>
          <p className="text-xs text-muted/50">
            Made with AI for creators, by creators.
          </p>
        </div>
      </div>
    </footer>
  );
}
