import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex bg-neutral-100 text-neutral-900">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center relative overflow-hidden bg-primary-default max-w-[52%] border-r border-primary-dark">
        {/* Decorative pattern */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.04]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <pattern id="topo" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <circle
              cx="40"
              cy="40"
              r="35"
              fill="none"
              className="stroke-neutral-50"
              strokeWidth="0.8"
            />
            <circle
              cx="40"
              cy="40"
              r="25"
              fill="none"
              className="stroke-neutral-50"
              strokeWidth="0.8"
            />
            <circle
              cx="40"
              cy="40"
              r="15"
              fill="none"
              className="stroke-neutral-50"
              strokeWidth="0.8"
            />
          </pattern>
          <rect width="100%" height="100%" fill="url(#topo)" />
        </svg>

        {/* Content */}
        <div className="relative z-10 text-center px-14 max-w-md">
          <div className="relative inline-block mb-10">
            <img
              src="/logo-gad.png"
              alt="GAD Municipal de Cañar"
              className="relative w-36 h-36 object-contain bg-neutral-50 rounded-2xl p-2.5"
            />
          </div>

          <h2 className="font-heading font-black text-neutral-50 mb-2 text-[1.5rem] tracking-[-em]">
            CAÑAR GAD MUNICIPAL
          </h2>

          <p className="text-neutral-200 text-[0.72rem] leading-[1.8]">
            Official services platform of
            <br />
            Cañar Canton, Ecuador
          </p>
        </div>
      </div>

      {/* RIGHT PANEL — rendered by child route */}
      <Outlet />
    </div>
  );
}
