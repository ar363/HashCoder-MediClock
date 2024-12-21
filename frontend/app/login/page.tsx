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
import { redirect, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { setAuth } from "@/lib/utils";

export default function Login() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sp = useSearchParams();
  const signup = sp.get("signup");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target as HTMLFormElement));

    let res;
    try {
      res = await fetch(`http://${location.hostname}:8000/api/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    } catch (e) {
      toast.error("Network issue , pls check...");
    }

    if (res?.status !== 200) toast.error("Wrong password, pls check...");
    else {
      const d = await res.json();
      toast.success("Login successful");
      setAuth(d.id, d.token, d.patient);
      redirect("/dashboard");
    }

    setIsSubmitting(false);
  };

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
              <form onSubmit={handleSubmit}>
                <div className="grid gap-6">
                  <div className="grid gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone No</Label>
                      <Input id="phone" name="phone" type="tel" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting && <Loader2 className="animate-spin" />}
                      {isSubmitting
                        ? "Submitting..."
                        : signup
                        ? "Sign Up"
                        : "Login"}
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
