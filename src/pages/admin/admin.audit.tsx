import { useEffect, useState, useMemo } from 'react';
import { Activity, ShieldCheck, ShieldAlert } from 'lucide-react';
import { audit_api } from '@/lib/api.calls';
import { VerifyAuditChain } from '@/lib/api.calls';
import { Cn } from '@/lib/utils';
import { BlockchainAuditTrail, type AuditEvent } from '@/components/logic/blockchain.audit.trail';
import { PageHeader } from '@/components/ui/page.header';
import { LoadingSkeleton } from '@/components/ui/loading.skeleton';
import { AlertBanner } from '@/components/ui/alert.banner';

interface AuditLog {
  id: string;
  action: string;
  hash: string;
  user_name: string;
  entity: string;
  entity_id: string | null;
  timestamp: string;
  previous_hash: string | null;
  detail: string | null;
}

function ParseDetail(detail_str: string | null) {
  if (!detail_str) return undefined;
  try {
    return JSON.parse(detail_str);
  } catch {
    return { raw: detail_str };
  }
}

function MapLogsToAuditEvents(logs: AuditLog[]): AuditEvent[] {
  return logs.map((log, index) => ({
    id: log.id,
    action: `${log.action} — ${log.entity}${log.entity_id ? ` #${log.entity_id.slice(0, 8)}` : ''}`,
    performer_name: log.user_name,
    role: 'GAD Audit',
    timestamp: log.timestamp,
    block_index: logs.length - index,
    block_hash: log.hash,
    previous_hash: log.previous_hash || 'GENESIS BLOCK (NULL)',
    metadata: ParseDetail(log.detail),
  }));
}

export function AdminAudit() {
  const [logs, set_logs] = useState<AuditLog[]>([]);
  const [is_loading, set_is_loading] = useState(true);
  const [is_verifying, set_is_verifying] = useState(false);
  const [integrity_status, set_integrity_status] = useState<{
    is_intact: boolean;
    breakage_info?: string;
    checked_logs?: number;
    legacy_logs?: number;
  } | null>(null);

  const FetchLogs = async () => {
    try {
      set_is_loading(true);
      const { data } = await audit_api.List({ limit: 100 });

      const mapped = (data.data || []).map((l: any) => ({
        id: l.id,
        action: l.action,
        hash: l.current_hash,
        user_name: l.user_email,
        entity: 'AuditLog',
        entity_id: null,
        timestamp: l.created_at,
        previous_hash: l.previous_hash,
        detail: l.details,
      }));

      set_logs(mapped);
    } catch (e) {
      console.error('Error fetching audit logs:', e);
    } finally {
      set_is_loading(false);
    }
  };

  useEffect(() => {
    FetchLogs();
  }, []);

  const HandleVerify = async () => {
    set_is_verifying(true);
    set_integrity_status(null);
    try {
      const data = await VerifyAuditChain();
      set_integrity_status({
        is_intact: data.valid,
        breakage_info: data.message,
        checked_logs: data.checked_logs,
        legacy_logs: data.legacy_logs,
      });
    } catch (e) {
      console.error('Error verifying integrity:', e);
      set_integrity_status({
        is_intact: false,
        breakage_info: 'Connection error with the notarial verifier.',
      });
    } finally {
      set_is_verifying(false);
    }
  };

  const audit_events = useMemo(() => MapLogsToAuditEvents(logs), [logs]);

  return (
    <div className="animate-fade-in space-y-8">
      <PageHeader
        title="Audit Integrity"
        description="Cryptographic verification of the audit Hash Chain."
        icon={Activity}
        actions={
          <button
            onClick={HandleVerify}
            disabled={is_verifying || is_loading}
            className={Cn(
              'relative overflow-hidden group font-bold px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 text-white shadow-lg',
              integrity_status?.is_intact === false
                ? 'bg-gradient-to-r from-red-600 to-red-500 shadow-red-500/30'
                : 'bg-gradient-to-r from-primary-600 to-blue-600 shadow-primary/30 hover:scale-[1.02]'
            )}
          >
            {is_verifying ? (
              <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : integrity_status?.is_intact ? (
              <ShieldCheck size={20} className="text-green-300" />
            ) : integrity_status?.is_intact === false ? (
              <ShieldAlert size={20} className="text-white" />
            ) : (
              <ShieldCheck size={20} />
            )}
            <span>{is_verifying ? 'Scanning Blocks...' : 'Verify Integrity'}</span>

            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
          </button>
        }
      />

      {integrity_status && (
        <AlertBanner
          variant={integrity_status.is_intact ? 'success' : 'error'}
          message={
            integrity_status.is_intact
              ? `${integrity_status.breakage_info} ${integrity_status.checked_logs ?? 0} records verified and ${integrity_status.legacy_logs ?? 0} legacy records.`
              : `Integrity Compromised Alert! ${integrity_status.breakage_info ?? ''}`
          }
        />
      )}

      {is_loading ? (
        <LoadingSkeleton className="max-w-4xl mx-auto" />
      ) : (
        <BlockchainAuditTrail history_events={audit_events} />
      )}
    </div>
  );
}
