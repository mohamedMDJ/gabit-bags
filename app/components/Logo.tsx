import Image from "next/image";

export default function Logo() {
  return (
    <div className="flex flex-col items-center">
      <Image
        src="/logo-gabit.jpg"
        alt="GABIT"
        width={170}
        height={170}
        className="rounded-full object-cover shadow-xl border border-white/40"
        priority
      />
    </div>
  );
}