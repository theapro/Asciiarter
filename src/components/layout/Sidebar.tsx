import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Separator } from "../ui/separator";

type NavItem = { id: string; label: string };

const NAV: NavItem[] = [
  { id: "converter", label: "Converter" },
  { id: "output", label: "Output" },
  { id: "settings", label: "Settings" },
];

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ block: "start" });
}

export function Sidebar() {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-20">
        <Card className="p-4">
          <div className="text-xs font-medium text-muted-foreground">
            Navigation
          </div>
          <nav className="mt-3 flex flex-col gap-1">
            {NAV.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className="justify-start"
                onClick={() => scrollToSection(item.id)}
              >
                {item.label}
              </Button>
            ))}
          </nav>

          <Separator className="my-4" />

          <div className="text-xs text-muted-foreground">
            Minimal, modern, glass UI.
          </div>
        </Card>
      </div>
    </aside>
  );
}
