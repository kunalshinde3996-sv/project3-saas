interface AvatarProps {
  name: string;
  className?: string;
}

export default function Avatar({
  name,
  className = "",
}: AvatarProps) {
  return (
    <div
      className={`flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white ${className}`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}