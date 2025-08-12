export default function LoadingCompany() {
  return (
    <div className="mx-auto max-w-6xl p-4">
      <div className="mb-6 h-7 w-60 animate-pulse rounded bg-gray-200" />
      <div className="mb-6 h-20 w-full animate-pulse rounded-lg bg-gray-200" />
      <div className="h-8 w-56 animate-pulse rounded bg-gray-200" />
      <div className="mt-4 grid gap-3">
        <div className="h-20 w-full animate-pulse rounded bg-gray-200" />
        <div className="h-20 w-full animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  );
}
