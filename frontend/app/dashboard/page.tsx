"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { SkeletonCard } from "@/components/ui/skeleton";
import { getAuth } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function Dashboard() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  
  const uploadPrescription = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    console.log(data)
    // data.append("file", );

    fetch(`http://${location.hostname}:8000/api/prescriptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAuth().token}`,
      },
      body: data,
    })
      .then((res) => res.json())
      .then((data) => {
        setPrescriptions((prev) => [data, ...prev]);
      });
  };

  useEffect(() => {
    fetch(`http://${location.hostname}:8000/api/prescriptions`, {
      headers: {
        Authorization: `Bearer ${getAuth().token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.length) setPrescriptions(data);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto p-4 max-w-screen-lg w-full">
        <div className="text-xl font-semibold">Your prescriptions</div>
        {!prescriptions && (
          <div className="flex gap-4 mt-4 flex-col sm:flex-row">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {prescriptions && prescriptions.length === 0 && (
          <div className="mt-4 text-sm">
            No prescriptions found.
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant={"link"}>Upload one?</Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="mx-auto w-full max-w-sm py-8">
                  <DrawerHeader>
                    <DrawerTitle>Upload prescription</DrawerTitle>
                    <DrawerDescription>
                      It will be checked by one of our chemists and converted
                    </DrawerDescription>
                    <form
                      encType="multipart/form-data"
                      onSubmit={uploadPrescription}
                    >
                      <Input
                        type="file"
                        className="mt-4"
                        accept="image/*"
                        name="file"
                      />
                      <Button type="submit" className="mt-4">
                        Upload
                      </Button>
                    </form>
                  </DrawerHeader>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        )}
      </div>
    </div>
  );
}
