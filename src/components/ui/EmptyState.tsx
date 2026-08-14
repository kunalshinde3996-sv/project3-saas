interface EmptyStateProps {
  title: string;
}

export default function EmptyState({
  title,
}: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed p-10 text-center">
      <p className="text-slate-500">{title}</p>
    </div>
  );
}