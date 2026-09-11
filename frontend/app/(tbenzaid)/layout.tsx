import SimpleNavbar from "@/components/simpleNavbar";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SimpleNavbar />
      {children}
    </>
  );
}