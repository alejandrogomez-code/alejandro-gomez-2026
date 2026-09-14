import { SaludNav } from '@/components/health/SaludNav';

export default function SaludLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <SaludNav />
      {children}
    </div>
  );
}
