import { useEffect, useState } from 'react';
import {
  Activity,
  ShieldCheck,
  ShieldAlert,
  Key,
  Link as LinkIcon,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { audit_api } from '@/lib/api.calls';
import { formatDateTime, cn } from '@/lib/utils';

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

export function AdminAudit() {
  const [logs, set_logs] = useState<AuditLog[]>([]);
  const [is_loading, set_is_loading] = useState(true);
  const [is_verifying, set_is_verifying] = useState(false);
  const [integrity_status, set_integrity_status] = useState<{
    is_intact: boolean;
    breakage_info?: string;
  } | null>(null);
  const [expanded_id, set_expanded_id] = useState<string | null>(null);

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

  const toggleExpand = (id: string) => {
    set_expanded_id(expanded_id === id ? null : id);
  };

  const parseDetail = (detail_str: string) => {
    try {
      return JSON.parse(detail_str);
    } catch {
      return detail_str;
    }
  };

  return (
    <div className="animate-fade-in space-y-8">
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-blue-955 flex items-center gap-3">
            <Activity className="text-primary-600" />
            Registro Notarial Digital
          </h1>
          <p className="text-blue-800 mt-1 text-sm">
            Auditoría inmutable de eventos con encadenamiento criptográfico (Hash-chain).
          </p>
        </div>

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

          {/* Shimmer effect inside button */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
        </button>
      </div>

      {/* VERIFICATION ALERT */}
      {integrity_status && (
        <div
          className={cn(
            'p-4 rounded-xl border animate-slide-up flex items-start gap-3',
            integrity_status.is_intact
              ? 'bg-green-500/10 border-green-500/30 text-green-700'
              : 'bg-red-500/10 border-red-500/30 text-red-700'
          )}
        >
          {integrity_status.is_intact ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
          <div>
            <h3 className="font-bold font-heading">
              {integrity_status.is_intact
                ? 'Cadena Criptográfica Íntegra'
                : '¡Alerta de Integridad Comprometida!'}
            </h3>
            <p className="text-sm mt-1 opacity-90">
              {integrity_status.is_intact
                ? 'Todos los hashes coinciden perfectamente. Ningún registro ha sido alterado.'
                : integrity_status.breakage_info}
            </p>
          </div>
        </div>
      )}

      {/* BLOCKCHAIN VISUALIZATION */}
      <div className="relative max-w-4xl mx-auto pl-4 md:pl-8">
        {/* The central chain line */}
        <div className="absolute top-8 bottom-8 left-[31px] md:left-[47px] w-1 bg-gradient-to-b from-primary-400/50 via-blue-300/30 to-transparent rounded-full" />

        {is_loading ? (
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="pl-12 h-32 rounded-2xl shimmer" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-slate-500 glass-card">
            No existen registros de auditoría en la plataforma.
          </div>
        ) : (
          <div className="space-y-8">
            {logs.map((log, index) => {
              const is_expanded = expanded_id === log.id;
              const hash_corto = log.hash ? `${log.hash.slice(0, 16)}...` : 'GÉNESIS';

              return (
                <div key={log.id} className="relative pl-12 md:pl-16">
                  {/* Node Connector */}
                  <div className="absolute left-0 top-6 w-8 md:w-12 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-primary shadow-[0_0_15px_rgba(37,99,235,0.6)] z-10 ring-4 ring-slate-50" />
                  </div>

                  {/* Block Card */}
                  <div
                    className={cn(
                      'glass-card transition-all duration-300 overflow-hidden border',
                      is_expanded
                        ? 'border-primary-400/50 shadow-xl shadow-primary/10'
                        : 'border-surface-border hover:border-primary/40'
                    )}
                  >
                    {/* Block Header */}
                    <div
                      className="p-5 cursor-pointer flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"
                      onClick={() => toggleExpand(log.id)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="badge bg-primary-50 text-primary-600 border border-primary/20">
                            {log.action}
                          </span>
                          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                            <Key size={12} /> {hash_corto}
                          </span>
                        </div>
                        <h3 className="text-blue-955 font-bold font-heading">
                          {log.user_name} <span className="text-slate-500 font-normal">sobre</span>{' '}
                          {log.entity}{' '}
                          <span className="text-slate-400 text-sm">
                            #{log.entity_id?.slice(0, 8)}
                          </span>
                        </h3>
                        <p className="text-slate-500 text-xs mt-1">
                          {formatDateTime(log.timestamp)}
                        </p>
                      </div>

                      <button className="text-slate-400 hover:text-primary-600 transition-colors p-2 bg-slate-50 rounded-full">
                        {is_expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </div>

                    {/* Expanded Details */}
                    {is_expanded && (
                      <div className="p-5 pt-0 border-t border-surface-border/50 bg-slate-50/50 animate-slide-up">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                          {/* Cryptographic Data */}
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-2">
                              <ShieldCheck size={14} className="text-primary" />
                              Firmas Criptográficas
                            </h4>
                            <div className="bg-slate-900 text-slate-300 p-3 rounded-lg font-mono text-[10px] break-all border border-slate-700 shadow-inner">
                              <p className="mb-2">
                                <span className="text-slate-500">Hash Actual:</span>
                                <br />
                                <span className="text-green-400">{log.hash}</span>
                              </p>
                              <p className="flex items-center gap-2 text-slate-500 mb-1">
                                <LinkIcon size={12} /> Enlazado con:
                              </p>
                              <p>
                                <span className="text-slate-500">Hash Anterior:</span>
                                <br />
                                <span className="text-blue-300">
                                  {log.previous_hash || 'BLOQUE GÉNESIS (NULL)'}
                                </span>
                              </p>
                            </div>
                          </div>

                          {/* Payload / Details */}
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                              Payload (Detalles)
                            </h4>
                            <div className="bg-slate-100 p-3 rounded-lg font-mono text-[11px] text-blue-955 border border-slate-200 overflow-x-auto max-h-48 overflow-y-auto">
                              {log.detail ? (
                                <pre>{JSON.stringify(parseDetail(log.detail), null, 2)}</pre>
                              ) : (
                                <span className="text-slate-400 italic">
                                  No hay carga útil adicional.
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
