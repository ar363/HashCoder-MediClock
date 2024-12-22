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
import { formatRelative, format, parse as parseDate } from "date-fns";
import { toast } from "sonner";
import Fraction from "fraction.js";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { time } from "console";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Dashboard() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [needToFillDetails, setNeedToFillDetails] = useState(false);
  const [prescriptionDrawer, setPrescriptionDrawer] = useState(false);
  const [medicines, setMedicines] = useState<PrescribedDrug[]>([]);
  const [tab, setTab] = useState("routine");
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [isOrderingMedicine, setIsOrderingMedicine] = useState<boolean>(false);
  const [currentOrderingPrescription, setCurrentOrderingPrescription] =
    useState<OrderPrescription | null>(null);
  const [orderDrugQty, setOrderDrugQty] = useState<
    { drugid: number; qty: number }[]
  >([]);
  const [daysToTake, setDaysToTake] = useState(0);

  const uploadPrescription = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);

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

    if (
      data.breakfast_time &&
      typeof data.breakfast_time == "string" &&
      data.breakfast_time.length === 5
    ) {
      data.breakfast_time += ":00";
    }

    if (
      data.lunch_time &&
      typeof data.lunch_time == "string" &&
      data.lunch_time.length === 5
    ) {
      data.lunch_time += ":00";
    }

    if (
      data.dinner_time &&
      typeof data.dinner_time == "string" &&
      data.dinner_time.length === 5
    ) {
      data.dinner_time += ":00";
    }

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

  const routineSetDone = (
    id: number,
    time: "morn" | "aft" | "eve",
    e: boolean
  ) => {
    fetch(`http://${location.hostname}:8000/api/patient/routine`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAuth().token}`,
      },
      body: JSON.stringify({
        drug_id: id,
        time,
        done: e,
      }),
    })
      .then((res) => res.json())
      .then((data) => {});
  };

  const orderPrescription = (prescription: Prescription) => {
    setIsOrderingMedicine(true);
    setCurrentOrderingPrescription(prescription);
  };

  const placeOrder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    fetch(`http://${location.hostname}:8000/api/order`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAuth().token}`,
      },
      body: JSON.stringify({
        drugs: orderDrugQty,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        toast.success("Order placed!");
        setOrders((prev) => [data, ...prev]);
        setTab("orderhist");
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

    fetch(`http://${location.hostname}:8000/api/patient/routine`, {
      headers: {
        Authorization: `Bearer ${getAuth().token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setRoutines(data.routines);
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
          }
        }
      });
    });

    meds.map((m) => {
      m.aqfrac = new Fraction(m.afternoon_qty).toFraction();
      m.mqfrac = new Fraction(m.morning_qty).toFraction();
      m.nqfrac = new Fraction(m.night_qty).toFraction();
    });

    setMedicines(meds);
  }, [prescriptions]);

  useEffect(() => {
    if (currentOrderingPrescription) {
      const odq: {
        drugid: number;
        qty: number;
      }[] = [];
      currentOrderingPrescription.drugs.map((d) => {
        odq.push({
          drugid: d.drug_info.id,
          qty: Math.ceil(
            (d.morning_qty + d.afternoon_qty + d.night_qty) * daysToTake
          ),
        });
      });
      setOrderDrugQty(odq);
    }
  }, [currentOrderingPrescription, daysToTake]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
      <div className="mx-auto p-4 max-w-screen-lg w-full">
        <h1 className="italic mb-3 mt-2">
          {greeting(getAuth().patient?.name || null)}
        </h1>

        <Tabs value={tab} onValueChange={(v) => setTab(v)}>
          <ScrollArea>
            <div className="w-full relative">
              <TabsList className="mb-6">
                <TabsTrigger value="routine">Routine</TabsTrigger>
                <TabsTrigger value="medicines">Medicines</TabsTrigger>
                <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
                <TabsTrigger
                  value="settings"
                  onClick={() => {
                    setTab("routine");
                    setNeedToFillDetails(true);
                  }}
                  disabled={false}
                >
                  Settings
                </TabsTrigger>
              </TabsList>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <TabsContent value="routine">
            <div className="text-xl font-semibold mb-4">Your routine</div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Morning</CardTitle>
                  <CardDescription>
                    {format(
                      parseDate(
                        getAuth().patient?.breakfast_time || "00:00:00",
                        "HH:mm:ss",
                        new Date()
                      ),
                      "h:mm aaaa"
                    )}
                    {/* {getAuth().patient?.breakfast_time} */}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {medicines
                    .filter((m) => m.morning_qty > 0)
                    .map((m) => (
                      <div className="flex items-center mb-4 gap-3" key={m.id}>
                        <Checkbox
                          id={"cbdone_morn" + m.id}
                          onCheckedChange={(e) =>
                            routineSetDone(m.drug_info.id, "morn", e as boolean)
                          }
                          defaultChecked={
                            routines.find(
                              (v) =>
                                v.drug_id == m.drug_info.id && v.time == "morn"
                            )?.taken || false
                          }
                        />
                        <label htmlFor={"cbdone_morn" + m.id}>
                          {m.drug} <br />
                          <span className="bg-rose-100 dark:bg-rose-950 text-rose-950 dark:text-rose-50 py-1 px-3 rounded-full text-sm">
                            {m.mqfrac} {m.drug_info.singular_term}
                          </span>
                        </label>
                      </div>
                    ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Afternoon</CardTitle>
                  <CardDescription>
                    {format(
                      parseDate(
                        getAuth().patient?.lunch_time || "00:00:00",
                        "HH:mm:ss",
                        new Date()
                      ),
                      "h:mm aaaa"
                    )}
                    {/* {getAuth().patient?.lunch_time} */}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {medicines
                    .filter((m) => m.afternoon_qty > 0)
                    .map((m) => (
                      <div className="flex items-center mb-4 gap-3" key={m.id}>
                        <Checkbox
                          id={"cbdone_aft" + m.id}
                          onCheckedChange={(e) =>
                            routineSetDone(m.drug_info.id, "aft", e as boolean)
                          }
                          defaultChecked={
                            routines.find(
                              (v) =>
                                v.drug_id == m.drug_info.id && v.time == "aft"
                            )?.taken || false
                          }
                        />
                        <label htmlFor={"cbdone_aft" + m.id}>
                          {m.drug} <br />
                          <span className="bg-rose-100 dark:bg-rose-950 text-rose-950 dark:text-rose-50 py-1 px-3 rounded-full text-sm">
                            {m.aqfrac} {m.drug_info.singular_term}
                          </span>
                        </label>
                      </div>
                    ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Night</CardTitle>
                  <CardDescription>
                    {format(
                      parseDate(
                        getAuth().patient?.dinner_time || "00:00:00",
                        "HH:mm:ss",
                        new Date()
                      ),
                      "h:mm aaaa"
                    )}
                    {/* {getAuth().patient?.dinner_time} */}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {medicines
                    .filter((m) => m.night_qty > 0)
                    .map((m) => (
                      <div className="flex items-center mb-4 gap-3" key={m.id}>
                        <Checkbox
                          id={"cbdone_eve" + m.id}
                          onCheckedChange={(e) =>
                            routineSetDone(m.drug_info.id, "eve", e as boolean)
                          }
                          defaultChecked={
                            routines.find(
                              (v) =>
                                v.drug_id == m.drug_info.id && v.time == "eve"
                            )?.taken || false
                          }
                        />
                        <label htmlFor={"cbdone_eve" + m.id}>
                          {m.drug} <br />
                          <span className="bg-rose-100 dark:bg-rose-950 text-rose-950 dark:text-rose-50 py-1 px-3 rounded-full text-sm">
                            {m.nqfrac} {m.drug_info.singular_term}
                          </span>
                        </label>
                      </div>
                    ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="medicines">
            <div className="text-xl font-semibold mb-4">Your medicines</div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {medicines.map((m) => (
                <Card key={m.id} className="flex flex-col justify-between">
                  <CardHeader>
                    <CardTitle>{m.drug}</CardTitle>
                    <CardDescription>
                      {m.drug_info.manufacturer} &nbsp;&middot;&nbsp;{" "}
                      {m.drug_info.pack_size}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="-mt-3">
                    <div className="flex gap-2">
                      <div className="flex flex-col items-center justify-center p-2 w-full bg-gray-50 dark:bg-gray-950 rounded-full">
                        <div className="text-xs text-rose-500">Morning</div>
                        <div className="">{m.mqfrac}</div>
                      </div>
                      <div className="flex flex-col items-center justify-center p-2 w-full bg-gray-50 dark:bg-gray-950 rounded-full">
                        <div className="text-xs text-rose-500">Afternoon</div>
                        <div className="">{m.aqfrac}</div>
                      </div>
                      <div className="flex flex-col items-center justify-center p-2 w-full bg-gray-50 dark:bg-gray-950 rounded-full">
                        <div className="text-xs text-rose-500">Night</div>
                        <div className="">{m.nqfrac}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="prescriptions">
            <div className="flex justify-between items-center mb-4">
              <div className="text-xl font-semibold">Your prescriptions</div>
              <Button
                variant={"link"}
                onClick={() => setPrescriptionDrawer(true)}
              >
                Add new +
              </Button>
            </div>

            {isLoaded && prescriptions && prescriptions.length === 0 && (
              <div className="mt-4 text-sm">
                No prescriptions found.
                <Button
                  variant={"link"}
                  onClick={() => setPrescriptionDrawer(true)}
                >
                  Upload one?
                </Button>
              </div>
            )}

            {prescriptions && prescriptions.length > 0 && (
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
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
                          className="h-[180px] object-cover w-full rounded-sm"
                        />
                      </a>
                    </CardContent>
                    <CardFooter className="-mt-3">
                      {prescription.drugs.length === 0 ? (
                        <p className="italic text-gray-600 text-sm">
                          Processing...
                        </p>
                      ) : (
                        <Button
                          onClick={() => orderPrescription(prescription)}
                          size={"sm"}
                          className="w-full"
                        >
                          Order medicines
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        {medicines.length > 0 && <></>}

        {!isLoaded && (
          <div className="flex gap-4 mt-4 flex-col sm:flex-row">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        <Dialog
          open={needToFillDetails}
          onOpenChange={(op) => setNeedToFillDetails(op)}
        >
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
                      step={"time"}
                    />
                  </div>
                  <div className="">
                    <Label htmlFor="lunch_time">Lunch time</Label>
                    <Input
                      type="time"
                      id="lunch_time"
                      name="lunch_time"
                      step={"time"}
                    />
                  </div>
                  <div className="">
                    <Label htmlFor="dinner_time">Dinner time</Label>
                    <Input
                      type="time"
                      id="dinner_time"
                      name="dinner_time"
                      step={"time"}
                    />
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

        <Drawer onOpenChange={setIsOrderingMedicine} open={isOrderingMedicine}>
          <DrawerContent>
            <div className="mx-auto w-full max-w-md py-8">
              <DrawerHeader>
                <DrawerTitle>Order medicine</DrawerTitle>
                <form className="mt-4" onSubmit={placeOrder}>
                  <Label htmlFor="days_to_order">
                    How many days to order for?
                  </Label>
                  <Input
                    type="number"
                    value={daysToTake}
                    onChange={(e) =>
                      setDaysToTake(Number(e.target.value || "0"))
                    }
                    id="days_to_order"
                    name="days_to_order"
                  />

                  <Table className="mt-4">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentOrderingPrescription?.drugs.map((d) => (
                        <TableRow key={d.id}>
                          <TableCell>{d.drug}</TableCell>
                          <TableCell>
                            <Input
                              className="max-w-24"
                              type="number"
                              name={`drug_` + d.drug_info.id + "_qty"}
                              value={
                                orderDrugQty.find(
                                  (x) => x.drugid == d.drug_info.id
                                )?.qty
                              }
                              onInput={(e) => {
                                setOrderDrugQty([
                                  ...orderDrugQty.filter(
                                    (x) => x.drugid !== d.drug_info.id
                                  ),
                                  {
                                    drugid: d.drug_info.id,
                                    qty: Number(e.target.value),
                                  },
                                ]);
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            {typeof orderDrugQty.find(
                              (x) => x.drugid == d.drug_info.id
                            )?.qty !== "undefined"
                              ? //@ts-ignore
                                orderDrugQty.find(
                                  (x) => x.drugid == d.drug_info.id
                                )?.qty * d.drug_info.price
                              : 0}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Button className="w-full mt-4" type="submit">
                    Order
                  </Button>
                </form>
              </DrawerHeader>
            </div>
          </DrawerContent>
        </Drawer>

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
