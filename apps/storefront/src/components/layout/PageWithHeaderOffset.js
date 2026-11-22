export default function PageWithHeaderOffset({ children, className = "" }) {
  return (
    <main
      className={`
        pt-[104px]
        sm:pt-[112px]
        lg:pt-[124px]
        ${className}
      `}
    >
      {children}
    </main>
  );
}
