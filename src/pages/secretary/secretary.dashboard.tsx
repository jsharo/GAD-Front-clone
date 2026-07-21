import { useEffect, useState } from 'react';
import { FileCheck2, Clock, CheckCircle2, XCircle, Inbox, TrendingUp } from 'lucide-react';
import { applications_api } from '@/lib/api.calls';
import { Link } from 'react-router-dom';
import { FormatDateTime } from '@/lib/utils';
import { GetProcedureTypeLabel } from '@/lib/constants/procedure.types';
import { PageHeader } from '@/components/ui/page.header';
import { StatCard, KpiGrid } from '@/components/ui/stat.card';
import { LoadingSkeleton } from '@/components/ui/loading.skeleton';
import { EmptyState } from '@/components/ui/empty.state';
import { PanelCard } from '@/components/ui/panel.card';

interface Application {
  id: string;
  status: string;
  procedure_type: string;
  created_at: string;
  citizen?: {
    first_name: string;
    last_name: string;
  } | null;
}

export function SecretaryDashboard() {
  const [applications, set_applications] = useState<Application[]>([]);
  const [is_loading, set_is_loading] = useState(true);

  useEffect(() => {
    applications_api
      .List({ limit: 100 })
      .then(({ data }) => {
        set_applications(data.data || []);
      })
      .catch(() => set_applications([]))
      .finally(() => set_is_loading(false));
  }, []);

  const pending_applications = applications.filter((s) => s.status === 'PENDING_SECRETARY');
  const observed_applications = applications.filter((s) => s.status === 'OBSERVED');
  const total = applications.length;

  const stats = [
    {
      label: 'Pending Review',
      value: pending_applications.length,
      icon: Clock,
      icon_class: 'text-warning-dark',
      icon_wrapper_class: 'bg-warning-light/20',
    },
    {
      label: 'In Progress',
      value: applications.filter((s) => ['PENDING_TECHNICIAN', 'INSPECTION'].includes(s.status))
        .length,
      icon: CheckCircle2,
      icon_class: 'text-success-dark',
      icon_wrapper_class: 'bg-success-light/20',
    },
    {
      label: 'Returned with Obs.',
      value: observed_applications.length,
      icon: XCircle,
      icon_class: 'text-error-dark',
      icon_wrapper_class: 'bg-error-light/20',
    },
    {
      label: 'Historical Total',
      value: total,
      icon: TrendingUp,
      icon_class: 'text-secondary-dark',
      icon_wrapper_class: 'bg-secondary-light/20',
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Secretary Dashboard"
        description="Document review — signature and completeness verification"
      />

      <KpiGrid>
        {stats.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            icon={s.icon}
            icon_class_name={s.icon_class}
            icon_wrapper_class_name={s.icon_wrapper_class}
          />
        ))}
      </KpiGrid>

      {/* Flujo de etapas — orientación visual */}
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
        <h2 className="font-bold text-blue-955 mb-4 text-left">Process Stages</h2>
        <div className="flex items-center gap-0 overflow-x-auto pb-2">
          {[
            {
              label: 'Citizen\nUpload docs',
              active: false,
              activeClass: 'bg-primary-default text-neutral-50',
              text_class: 'text-primary-default',
            },
            {
              label: 'Secretary\nReview',
              active: true,
              activeClass: 'bg-secondary-default text-neutral-50',
              text_class: 'text-secondary-dark',
            },
            {
              label: 'Technician\nEvaluate',
              active: false,
              activeClass: 'bg-success-default text-neutral-50',
              text_class: 'text-success-dark',
            },
            {
              label: 'Approved',
              active: false,
              activeClass: 'bg-success-default text-neutral-50',
              text_class: 'text-success-dark',
            },
          ].map((step, i, arr) => (
            <div key={step.label} className="flex items-center flex-shrink-0">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${step.active ? step.activeClass : 'bg-neutral-200 text-neutral-400'}`}
                >
                  {i + 1}
                </div>
                <p
                  className={`mt-2 max-w-[72px] whitespace-pre-line text-center text-xs font-semibold leading-tight ${step.active ? step.text_class : 'text-neutral-400'}`}
                >
                  {step.label}
                </p>
              </div>
              {i < arr.length - 1 && (
                <div className="mx-1 h-0.5 w-8 flex-shrink-0 bg-neutral-200 sm:w-16" />
              )}
            </div>
          ))}
        </div>
      </div>

      <PanelCard
        title="Applications Pending Review"
        icon={Inbox}
        icon_class_name="text-secondary-dark"
        footer={
          <Link
            to="/secretary/inbox"
            className="text-sm font-semibold text-secondary-dark hover:text-primary-dark"
          >
            View full inbox →
          </Link>
        }
      >
        <div className="divide-y divide-neutral-200">
          {is_loading ? (
            <LoadingSkeleton count={2} variant="row" className="p-6" />
          ) : pending_applications.length === 0 ? (
            <EmptyState icon={Inbox} title="No applications pending review" className="py-8" />
          ) : (
            pending_applications.slice(0, 5).map((application) => (
              <Link
                to={`/secretary/inbox/${application.id}`}
                key={application.id}
                className="block cursor-pointer px-6 py-4 hover:bg-neutral-100"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-secondary-light bg-secondary-light/20 text-left text-secondary-dark">
                    <FileCheck2 size={16} className="text-secondary-dark" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-blue-955 text-sm">
                      {application.citizen?.first_name} {application.citizen?.last_name}
                    </p>
                    <p className="text-[0.75rem] text-slate-500">
                      #{application.id.slice(0, 8)} ·{' '}
                      {GetProcedureTypeLabel(application.procedure_type) || 'Procedure'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="rounded-full bg-warning-light/20 px-3 py-1 text-xs font-semibold text-warning-dark">
                    {application.status.replace('_', ' ')}
                  </span>
                  <span className="text-[0.7rem] text-slate-400">
                    {FormatDateTime(application.created_at)}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </PanelCard>
    </div>
  );
}
