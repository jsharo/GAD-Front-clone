import { useEffect, useState, useMemo } from 'react';
import { Activity, ShieldCheck, ShieldAlert } from 'lucide-react';
import { audit_api } from '@/lib/api.calls';
import { cn } from '@/lib/utils';
import { BlockchainAuditTrail, type AuditEvent } from '@/components/logic/blockchain.audit-trail';
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

function parseDetail(detail_str: string | null) {
  if (!detail_str) return undefined;
  try {
    return JSON.parse(detail_str);
  } catch {
    return { raw: detail_str };
  }
}

function mapLogsToAuditEvents(logs: AuditLog[]): AuditEvent[] {
  return logs.map((log, index) => ({
    id: log.id,
    action: `${log.action} — ${log.entity}${log.entity_id ? ` #${log.entity_id.slice(0, 8)}` : ''}`,
    performerName: log.user_name,
    role: 'Auditoría GAD',
    timestamp: log.timestamp,
    blockIndex: logs.length - index,
    blockHash: log.hash,
    previousHash: log.previous_hash || 'BLOQUE GÉNESIS (NULL)',
    metadata: parseDetail(log.detail),
  }));
}

export function AdminAudit() {
  const [logs, set_logs] = useState<AuditLog[]>([]);
  const [is_loading, set_is_loading] = useState(true);
  const [is_verifying, set_is_verifying] = useState(false);
  const [integrity_status, set_integrity_status] = useState<{
    is_intact: boolean;
    breakage_info?: string;
  } | null>(null);

  const fetchLogs = async () => {
    try {
      set_is_loading(true);
      const { data } = await audit_api.list({ limit: 100 });

      const mapped = (data.data || []).map((l: any) => ({
        id: l.id,
        action: l.accion,
        hash: l.hash,
        user_name: l.userName,
        entity: l.entidad,
        entity_id: l.entidadId,
        timestamp: l.timestamp,
        previous_hash: l.hashAnterior,
        detail: l.detalle,
      }));

      set_logs(mapped);
    } catch (e) {
      console.error('Error fetching audit logs:', e);
    } finally {
      set_is_loading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleVerify = async () => {
    set_is_verifying(true);
    set_integrity_status(null);
    try {
      const { data } = await audit_api.verify();
      set_integrity_status({
        is_intact: data.integra,
        breakage_info: data.rotura,
      });
    } catch (e) {
      console.error('Error verifying integrity:', e);
      set_integrity_status({
        is_intact: false,
        breakage_info: 'Error de conexión con el verificador notarial.',
      });
    } finally {
      set_is_verifying(false);
    }
  };

  const auditEvents = useMemo(() => mapLogsToAuditEvents(logs), [logs]);

  return (
    <div className="animate-fade-in space-y-8">
      <PageHeader
        title="Registro Notarial Digital"
        description="Auditoría inmutable de eventos con encadenamiento criptográfico (Hash-chain)."
        icon={Activity}
        actions={
          <button
            onClick={handleVerify}
            disabled={is_verifying || is_loading}
            className={cn(
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
            <span>{is_verifying ? 'Escaneando Bloques...' : 'Verificar Integridad'}</span>

            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
          </button>
        }
      />

      {integrity_status && (
        <AlertBanner
          variant={integrity_status.is_intact ? 'success' : 'error'}
          message={
            integrity_status.is_intact
              ? 'Cadena Criptográfica Íntegra — Todos los hashes coinciden perfectamente. Ningún registro ha sido alterado.'
              : `¡Alerta de Integridad Comprometida! ${integrity_status.breakage_info ?? ''}`
          }
        />
      )}

      {is_loading ? (
        <LoadingSkeleton className="max-w-4xl mx-auto" />
      ) : (
        <BlockchainAuditTrail historyEvents={auditEvents} />
      )}
    </div>
  );
}
