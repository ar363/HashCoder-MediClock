"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const sp = useSearchParams();
  const signup = sp.get("signup");

  return (
    <div className="min-h-screen bg-gray-50 grid items-center">
    <div className="mx-auto p-4 max-w-sm w-full">
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">
              {signup ? "Sign up" : "Welcome back"}
            </CardTitle>
            <CardDescription>
              {signup ? "Register" : "Login"} with your phone number
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form>
              <div className="grid gap-6">
                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone No</Label>
                    <Input id="phone" type="tel" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" required />
                  </div>
                  <Button type="submit" className="w-full">
                    {signup ? "Sign Up" : "Login"}
                  </Button>
                </div>
                <div className="text-center text-sm">
                  {signup ? "Already" : "Don't"} have an account?{" "}
                  <Link
                    href={signup ? "/login" : "/login?signup=1"}
                    className="underline underline-offset-4"
                  >
                    {signup ? "Log In" : "Sign Up"}
                  </Link>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  );
}
