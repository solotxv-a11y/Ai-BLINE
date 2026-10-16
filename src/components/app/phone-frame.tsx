"use client";

interface PhoneFrameProps {
  children: React.ReactNode;
}

/**
 * On mobile: the app fills the viewport (real device).
 * On desktop (xl+): renders inside a premium phone frame with neon ambient.
 */
export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="relative mx-auto w-full max-w-[430px] h-dvh flex flex-col xl:h-[880px] xl:max-h-[94vh] xl:w-[420px] xl:rounded-[2.9rem] xl:border xl:border-white/10 xl:bg-black xl:p-[10px] xl:shadow-[0_0_90px_-24px_var(--neon),0_40px_90px_-30px_rgba(0,0,0,0.9)]">
      <div className="relative flex flex-1 flex-col overflow-hidden bg-background xl:rounded-[2.3rem]">
        {/* dynamic island (desktop frame only) */}
        <div className="hidden xl:block absolute top-2.5 left-1/2 -translate-x-1/2 h-[21px] w-[88px] rounded-full bg-black border border-white/10 z-50" />
        {children}
      </div>
    </div>
  );
}
