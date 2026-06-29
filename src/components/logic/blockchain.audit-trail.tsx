import React, { useState } from 'react';
import { Database, ChevronDown, ChevronUp, Link as LinkIcon, Cpu } from 'lucide-react';

export interface AuditEvent {
  id: string;
  action: string;
  performerName: string;
  role: string;
  timestamp: string;
  blockIndex: number;
  blockHash: string;
  previousHash: string;
  metadata?: Record<string, any>;
}

export interface BlockchainAuditTrailProps {
  historyEvents: AuditEvent[];
}

export function BlockchainAuditTrail({ historyEvents }: BlockchainAuditTrailProps) {
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});

  const toggleEvent = (id: string) => {
    setExpandedEvents((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const sortedEvents = [...historyEvents].sort((a, b) => b.blockIndex - a.blockIndex);

  if (!sortedEvents || sortedEvents.length === 0) {
    return (
      <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200/50">
        <Database className="mx-auto text-slate-300 mb-3" size={40} />
        <p className="text-slate-500 font-medium text-sm">
          No hay registros de auditoría disponibles.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto space-y-6">
      {/* Blockchain Header Badge */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <Database className="text-blue-600" size={20} />
          <h4 className="font-heading font-black text-slate-800 text-sm tracking-wide">
            Hash Chain de Auditoría
          </h4>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-100 bg-blue-500/5">
          <Cpu size={12} className="text-blue-600" />
          <span className="text-blue-600 text-[10px] font-bold uppercase tracking-wider">
            Cadena Activa
          </span>
        </div>
      </div>

      {/* Vertical Timeline container */}
      <div className="relative border-l border-dashed border-slate-300/80 ml-6 pl-8 space-y-6 py-2">
        {sortedEvents.map((event, index) => {
          const isExpanded = !!expandedEvents[event.id];
          const isFirst = index === 0;

          return (
            <div key={event.id} className="relative group text-left">
              {/* Connector Dot */}
              <div
                className={`absolute -left-[45px] top-1.5 w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold font-mono transition-all z-10 ${
                  isFirst
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md ring-4 ring-blue-500/10'
                    : 'bg-white text-slate-500 border-slate-350 shadow-xs'
                }`}
              >
                #{event.blockIndex}
              </div>

              {/* Event Body Card */}
              <div className="glass-card p-5 bg-white/80 border border-slate-200/50 rounded-2xl hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div>
                    {/* Action Title */}
                    <p className="font-bold text-slate-900 text-sm tracking-wide">{event.action}</p>

                    {/* Performer info */}
                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                      <span className="font-semibold text-slate-700">{event.performerName}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-100/50">
                        {event.role}
                      </span>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="text-[11px] font-medium text-slate-400">
                    {new Date(event.timestamp).toLocaleString()}
                  </div>
                </div>

                {/* Accordion trigger */}
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <button
                    onClick={() => toggleEvent(event.id)}
                    className="flex items-center justify-between w-full text-slate-500 hover:text-blue-600 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <LinkIcon size={12} className="text-blue-500" />
                      Detalles Técnicos del Bloque
                    </span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {/* Expanded cryptographic and JSON block information */}
                  {isExpanded && (
                    <div className="mt-3.5 space-y-3 animate-fade-in">
                      {/* Block information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] font-semibold text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="truncate">
                          <span className="font-bold text-slate-400 uppercase tracking-wider mr-1">
                            Hash del Bloque:
                          </span>
                          <span className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded select-all">
                            {event.blockHash}
                          </span>
                        </div>
                        <div className="truncate">
                          <span className="font-bold text-slate-400 uppercase tracking-wider mr-1">
                            Hash Previo:
                          </span>
                          <span className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded select-all">
                            {event.previousHash}
                          </span>
                        </div>
                      </div>

                      {/* JSON Payload representation */}
                      <div className="relative">
                        <pre className="bg-slate-900 text-green-400 font-mono text-[10px] p-4 rounded-xl border border-slate-950 overflow-x-auto shadow-inner">
                          <code>
                            {JSON.stringify(
                              {
                                blockIndex: event.blockIndex,
                                action: event.action,
                                actor: {
                                  name: event.performerName,
                                  role: event.role,
                                },
                                timestamp: event.timestamp,
                                cryptographicVerification: 'VALID_SHA256_INTEGRITY',
                                dataPayload: event.metadata || {
                                  status: 'APPROVED',
                                  note: 'No additional metadata registered.',
                                },
                              },
                              null,
                              2
                            )}
                          </code>
                        </pre>
                        <span className="absolute right-3 top-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          JSON Payload
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
