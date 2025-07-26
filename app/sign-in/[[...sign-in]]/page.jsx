import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#292a2d] text-white px-4 pb-8">
      <SignIn />
    </div>
  );
}
