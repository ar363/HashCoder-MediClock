"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SkeletonCard } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { getAuth, setAuth } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatRelative } from "date-fns";
import { toast } from "sonner";

export default function Dashboard() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [needToFillDetails, setNeedToFillDetails] = useState(false);
  const [prescriptionDrawer, setPrescriptionDrawer] = useState(false);

  const uploadPrescription = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    console.log(data);
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
        setPrescriptionDrawer(false);
        toast.success("Added prescription!");
      });
  };

  const submitDetails = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target as HTMLFormElement));

    fetch(`http://${location.hostname}:8000/api/patient`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAuth().token}`,
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((data) => {
        setNeedToFillDetails(false);
        setAuth(
          Number.parseInt(getAuth().userid || "0"),
          getAuth().token || "",
          data
        );
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
        setIsLoaded(true);
        if (data.length) setPrescriptions(data);
        if (data.pdatafill) setNeedToFillDetails(true);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto p-4 max-w-screen-lg w-full">
        <div className="flex justify-between">
          <div className="text-xl font-semibold">Your prescriptions</div>
          <Button variant={"link"} onClick={() => setPrescriptionDrawer(true)}>
            Add new +
          </Button>
        </div>
        {!isLoaded && (
          <div className="flex gap-4 mt-4 flex-col sm:flex-row">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        <Dialog open={needToFillDetails}>
          <DialogContent>
            <div className="mx-auto w-full">
              <DialogHeader>
                <DialogTitle>Please fill in some basic details</DialogTitle>
                <DialogDescription>
                  We need to know about you to serve you better
                </DialogDescription>
                <form
                  className="flex flex-col gap-4 text-left"
                  onSubmit={submitDetails}
                >
                  <div className="">
                    <Label htmlFor="name">Name</Label>
                    <Input type="text" id="name" name="name" />
                  </div>
                  <div className="">
                    <Label htmlFor="breakfast_time">Breakfast time</Label>
                    <Input
                      type="time"
                      id="breakfast_time"
                      name="breakfast_time"
                    />
                  </div>
                  <div className="">
                    <Label htmlFor="lunch_time">Lunch time</Label>
                    <Input type="time" id="lunch_time" name="lunch_time" />
                  </div>
                  <div className="">
                    <Label htmlFor="dinner_time">Dinner time</Label>
                    <Input type="time" id="dinner_time" name="dinner_time" />
                  </div>
                  <div className="">
                    <Label htmlFor="address">Address</Label>
                    <Textarea id="address" name="address" />
                  </div>

                  <Button className="mt-4" type="submit">
                    Save
                  </Button>
                </form>
              </DialogHeader>
            </div>
          </DialogContent>
        </Dialog>

        {isLoaded && prescriptions && prescriptions.length === 0 && (
          <div className="mt-4 text-sm">
            No prescriptions found.
            <Button variant={"link"}>Upload one?</Button>
          </div>
        )}

        {prescriptions && prescriptions.length > 0 && (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {prescriptions.map((prescription) => (
              <Card key={prescription.id}>
                <CardHeader>
                  <CardDescription>
                    {formatRelative(prescription.created_at, new Date())}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <a
                    href={`http://${location.hostname}:8000${prescription.image}`}
                    target="_blank"
                  >
                    <img
                      src={`http://${location.hostname}:8000${prescription.image}`}
                      className="h-[250px] object-cover w-full rounded-sm"
                    />
                  </a>
                </CardContent>
                <CardFooter>
                  {prescription.drugs.length === 0 && (
                    <p className="italic text-gray-600">
                      Processing... please check back later
                    </p>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        <Drawer onOpenChange={setPrescriptionDrawer} open={prescriptionDrawer}>
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
    </div>
  );
}
