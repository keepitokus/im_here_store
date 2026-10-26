export default function RootLoading() {
  return (
    <div
      role="status"
      aria-label="Загрузка страницы"
      className="min-h-screen bg-[#F7F2E9] text-[#1F3042]"
    >
      <div className="layout-container py-12 space-y-8 animate-pulse">
        <div className="h-10 w-56 rounded-full bg-[#EAE0D2]" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-6 space-y-4">
            <div className="h-14 w-4/5 rounded-2xl bg-[#EAE0D2]" />
            <div className="h-6 w-full rounded-xl bg-[#EAE0D2]/80" />
            <div className="h-6 w-3/4 rounded-xl bg-[#EAE0D2]/80" />
            <div className="flex gap-3 pt-2">
              <div className="h-12 w-44 rounded-full bg-[#1F3042]/20" />
              <div className="h-12 w-44 rounded-full bg-[#EAE0D2]" />
            </div>
          </div>
          <div className="lg:col-span-6">
            <div className="aspect-[16/10] w-full rounded-3xl bg-[#EAE0D2]" />
          </div>
        </div>
      </div>
    </div>
  );
}
