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
import { getAuth, greeting, setAuth } from "@/lib/utils";
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
  const [medicines, setMedicines] = useState<PrescribedDrug[]>([]);

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
        if (data.pres && data.pres.length) setPrescriptions(data.pres);
        if (data.pdatafill) setNeedToFillDetails(true);
        else {
          setAuth(
            Number.parseInt(getAuth().userid),
            getAuth().token,
            data.currentpdata
          );
        }
      });
  }, []);

  useEffect(() => {
    const meds: PrescribedDrug[] = [];
    prescriptions.forEach((p) => {
      p.drugs.forEach((d) => {
        if (!meds.find((m) => m.drug_info.id === d.drug_info.id)) {
          meds.push(d);
        } else {
          const med = meds.find((m) => m.drug_info.id === d.drug_info.id);
          if (med) {
            med.morning_qty += d.morning_qty;
            med.afternoon_qty += d.afternoon_qty;
            med.night_qty += d.night_qty;
            med.custom_qty += d.custom_qty;
          }
        }
      });
    });

    setMedicines(meds);
  }, [prescriptions]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto p-4 max-w-screen-lg w-full">
        <h1 className="italic mb-3 mt-2">
          {greeting(getAuth().patient?.name || null)}
        </h1>
        {medicines.length > 0 && (
          <>
            <div className="text-xl font-semibold mb-4">Your medicines</div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {medicines.map((m) => (
                <Card key={m.id}>
                  <CardHeader>
                    <CardTitle>{m.drug}</CardTitle>
                    <CardDescription>
                      {m.drug_info.manufacturer} &nbsp;&middot;&nbsp;{" "}
                      {m.drug_info.pack_size}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="-mt-3">
                    {m.custom_qty > 0 ? (
                      <p>
                        {m.custom_qty} at {m.custom_time}
                      </p>
                    ) : (
                      <div className="flex gap-2">
                        <div className="flex flex-col items-center justify-center p-2 w-full bg-gray-50 rounded-full">
                          <div className="text-xs text-rose-500">Morning</div>
                          <div className="">{m.morning_qty}</div>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2 w-full bg-gray-50 rounded-full">
                          <div className="text-xs text-rose-500">Afternoon</div>
                          <div className="">{m.afternoon_qty}</div>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2 w-full bg-gray-50 rounded-full">
                          <div className="text-xs text-rose-500">Night</div>
                          <div className="">{m.night_qty}</div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
        <div className="flex justify-between items-center mb-4">
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
                <CardFooter className="-mt-3">
                  {prescription.drugs.length === 0 ? (
                    <p className="italic text-gray-600 text-sm">
                      Processing... please check back later
                    </p>
                  ) : (
                    <p className="italic text-emerald-600 text-sm">
                      Processed!
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
