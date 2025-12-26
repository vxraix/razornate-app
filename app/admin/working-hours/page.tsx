"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/navbar";
import { Clock, Save } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const days = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export default function WorkingHoursPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [hours, setHours] = useState<
    Record<number, { startTime: string; endTime: string; isOpen: boolean }>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!session || session.user?.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
    fetchWorkingHours();
  }, [session, router]);

  const fetchWorkingHours = async () => {
    try {
      const response = await fetch("/api/admin/working-hours");
      const data = await response.json();
      if (response.ok) {
        const hoursMap: Record<
          number,
          { startTime: string; endTime: string; isOpen: boolean }
        > = {};
        data.forEach((h: any) => {
          hoursMap[h.dayOfWeek] = {
            startTime: h.startTime,
            endTime: h.endTime,
            isOpen: h.isOpen,
          };
        });
        setHours(hoursMap);
      }
    } catch (error) {
      toast.error("Failed to load working hours");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/working-hours", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          Object.entries(hours).map(([day, data]) => ({
            dayOfWeek: parseInt(day),
            ...data,
          }))
        ),
      });

      if (!response.ok) throw new Error("Failed to save");
      toast.success("Working hours updated!");
    } catch (error: any) {
      toast.error(error.message || "Failed to save working hours");
    } finally {
      setIsSaving(false);
    }
  };

  const updateDay = (
    day: number,
    field: "startTime" | "endTime" | "isOpen",
    value: string | boolean
  ) => {
    setHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
        startTime: prev[day]?.startTime || "09:00",
        endTime: prev[day]?.endTime || "18:00",
        isOpen:
          field === "isOpen" ? (value as boolean) : prev[day]?.isOpen ?? true,
      },
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-4 py-8 md:py-12">
      <Navbar />
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">
            Working Hours
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Manage your availability
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {days.map((day, index) => (
            <motion.div
              key={day.value}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <input
                        type="checkbox"
                        checked={hours[day.value]?.isOpen ?? true}
                        onChange={(e) =>
                          updateDay(day.value, "isOpen", e.target.checked)
                        }
                        className="w-5 h-5 rounded border-gray-700 bg-gray-900 text-gold-500 focus:ring-gold-500 flex-shrink-0"
                      />
                      <label className="font-semibold text-white min-w-[80px] sm:min-w-[100px]">
                        {day.label}
                      </label>
                      {!hours[day.value]?.isOpen && (
                        <span className="text-gray-600 text-sm">Closed</span>
                      )}
                    </div>
                    {hours[day.value]?.isOpen && (
                      <div className="pl-8 sm:pl-0 w-full">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full min-w-0">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <Input
                              type="time"
                              value={hours[day.value]?.startTime || "09:00"}
                              onChange={(e) =>
                                updateDay(
                                  day.value,
                                  "startTime",
                                  e.target.value
                                )
                              }
                              className="flex-1 max-w-fit sm:flex-none sm:w-28"
                            />
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className="text-gray-500 text-xs sm:text-sm flex-shrink-0 whitespace-nowrap">
                              to
                            </span>
                            <Input
                              type="time"
                              value={hours[day.value]?.endTime || "18:00"}
                              onChange={(e) =>
                                updateDay(day.value, "endTime", e.target.value)
                              }
                              className="flex-1 max-w-fit sm:flex-none sm:w-28"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full md:w-auto"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Saving..." : "Save Working Hours"}
        </Button>
      </div>
    </div>
  );
}
