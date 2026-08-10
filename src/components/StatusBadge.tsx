import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { GroupStatus } from '../types';

const config: Record<GroupStatus, { color: string; bg: string; icon: typeof CheckCircle2 }> = {
  정상: { color: 'var(--status-good-text)', bg: 'rgba(12,163,12,0.1)', icon: CheckCircle2 },
  주의: { color: '#a86a00', bg: 'rgba(250,178,25,0.16)', icon: AlertTriangle },
  위험: { color: 'var(--status-critical)', bg: 'rgba(208,59,59,0.1)', icon: AlertCircle },
};

export function StatusBadge({ status }: { status: GroupStatus }) {
  const { color, bg, icon: Icon } = config[status];
  return (
    <span
      className="inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ color, background: bg }}
    >
      <Icon size={13} strokeWidth={2.5} />
      {status}
    </span>
  );
}
