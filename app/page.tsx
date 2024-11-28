import Link from "next/link";


export default function Home() {
  return (
    <div className="font-[family-name:var(--font-geist-sans)]">
        <div className="mt-14 flex justify-center items-center">
        <Link href="/new-page" className="p-3 border-cyan-500 border-2 mx-4">New Page</Link>
        <Link href="/testme" className="p-3 border-cyan-500 border-2 mx-4">Testme</Link>
    </div>
    </div>
  );
}
