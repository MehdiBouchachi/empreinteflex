import { redirect } from "next/navigation";
export default function Page(){redirect(process.env.STAFF_PUBLIC_URL || "http://localhost:8081");}
