import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-white min-h-screen">
      <div className="p-8 mx-auto text-gray-900 flex flex-col sm:flex-row items-center justify-center gap-8">
        <div className="">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-12 h-12 text-rose-600"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M13.666 1.429l6.75 3.98l.096 .063l.093 .078l.106 .074a3.22 3.22 0 0 1 1.284 2.39l.005 .204v7.284c0 1.175 -.643 2.256 -1.623 2.793l-6.804 4.302c-.98 .538 -2.166 .538 -3.2 -.032l-6.695 -4.237a3.23 3.23 0 0 1 -1.678 -2.826v-7.285c0 -1.106 .57 -2.128 1.476 -2.705l6.95 -4.098c1 -.552 2.214 -.552 3.24 .015m-1.666 6.571a1 1 0 0 0 -1 1v2h-2a1 1 0 0 0 -.993 .883l-.007 .117a1 1 0 0 0 1 1h2v2a1 1 0 0 0 .883 .993l.117 .007a1 1 0 0 0 1 -1v-2h2a1 1 0 0 0 .993 -.883l.007 -.117a1 1 0 0 0 -1 -1h-2v-2a1 1 0 0 0 -.883 -.993z" />
          </svg>
          <h1 className="text-3xl font-bold tracking-tight lg:text-4xl mt-6">
            MedTech Proj
          </h1>
          <p className="mt-4 text-lg">
            Track medicines, prescriptions, automatic ordering and more...
          </p>

          <div className="flex mt-4 gap-4">
            <Button asChild>
              <Link href={"/login?signup=1"}>Sign Up</Link>
            </Button>
            <Button variant={"outline"} asChild>
              <Link href={"/login"}>Log In</Link>
            </Button>
          </div>
        </div>
        <div className="flex justify-center mt-8">
          <div className="max-w-[500px] p-8 rounded-lg">
            <img src="/med.svg" alt="" />
          </div>
        </div>
      </div>
    </div>
  );
}
