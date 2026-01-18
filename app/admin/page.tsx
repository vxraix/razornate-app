"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  DollarSign,
  Users,
  Scissors,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Save,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { formatDate, formatTime } from "@/lib/utils";
import { motion } from "framer-motion";
import { AdvancedFilters } from "@/components/advanced-filters";

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  isActive: boolean;
}

interface Appointment {
  id: string;
  date: string;
  status: string;
  notes: string | null;
  user: {
    name: string | null;
    email: string;
    phone: string | null;
  };
  service: {
    name: string;
    price: number;
  };
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "services" | "appointments"
  >("dashboard");
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceForm, setServiceForm] = useState({
    name: "",
    description: "",
    duration: "30",
    price: "",
  });
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);
  const [appointmentEditForm, setAppointmentEditForm] = useState({
    status: "",
    barberNotes: "",
    date: "",
    time: "",
  });
  const [showCancelled, setShowCancelled] = useState(false);

  const fetchServices = useCallback(async () => {
    try {
      const response = await fetch("/api/services");
      const data = await response.json();
      if (response.ok) {
        setServices(data);
      }
    } catch (error) {
      toast.error("Failed to load services");
    }
  }, []);

  const fetchAppointments = useCallback(async () => {
    try {
      const url = `/api/admin/appointments${
        showCancelled ? "?includeCancelled=true" : ""
      }`;
      const response = await fetch(url);
      const data = await response.json();
      if (response.ok) {
        setAppointments(data);
      }
    } catch (error) {
      toast.error("Failed to load appointments");
    }
  }, [showCancelled]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated" && session) {
      // Check role - handle both string and case variations
      const userRole = String(session.user?.role || "")
        .toUpperCase()
        .trim();
      if (userRole !== "ADMIN") {
        // Don't redirect immediately, show a message first
        toast.error(
          "Admin access required. Please sign in with an admin account."
        );
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
        return;
      }
      fetchServices();
      fetchAppointments();
    }
  }, [session, status, router, fetchServices, fetchAppointments]);

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingService
        ? `/api/services/${editingService.id}`
        : "/api/services";
      const method = editingService ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serviceForm),
      });

      if (!response.ok) {
        throw new Error("Failed to save service");
      }

      toast.success(editingService ? "Service updated" : "Service created");
      setShowServiceForm(false);
      setEditingService(null);
      setServiceForm({ name: "", description: "", duration: "30", price: "" });
      fetchServices();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;

    try {
      const response = await fetch(`/api/services/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete service");
      toast.success("Service deleted");
      fetchServices();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleUpdateAppointmentStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error("Failed to update appointment");
      toast.success("Appointment updated");
      fetchAppointments();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEditAppointment = (appointment: Appointment) => {
    const appointmentDate = new Date(appointment.date);
    setEditingAppointment(appointment);
    setAppointmentEditForm({
      status: appointment.status,
      barberNotes: (appointment as any).barberNotes || "",
      date: appointmentDate.toISOString().split("T")[0],
      time: appointmentDate.toTimeString().slice(0, 5),
    });
  };

  const handleSaveAppointment = async () => {
    if (!editingAppointment) return;

    try {
      const updateData: any = {
        status: appointmentEditForm.status,
        barberNotes: appointmentEditForm.barberNotes,
      };

      // If date/time changed, update the date
      if (appointmentEditForm.date && appointmentEditForm.time) {
        const newDate = new Date(
          `${appointmentEditForm.date}T${appointmentEditForm.time}`
        );
        updateData.date = newDate.toISOString();
      }

      const response = await fetch(
        `/api/admin/appointments/${editingAppointment.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) throw new Error("Failed to update appointment");
      toast.success("Appointment updated successfully");
      setEditingAppointment(null);
      fetchAppointments();
    } catch (error: any) {
      toast.error(error.message || "Failed to update appointment");
    }
  };

  const todayAppointments = appointments.filter(
    (apt) => new Date(apt.date).toDateString() === new Date().toDateString()
  );
  const upcomingAppointments = appointments.filter(
    (apt) => new Date(apt.date) > new Date() && apt.status !== "CANCELLED"
  );

  const totalRevenue = appointments
    .filter((apt) => apt.status === "COMPLETED")
    .reduce((sum, apt) => sum + apt.service.price, 0);

  return (
    <div className="min-h-screen bg-black px-4 py-8 md:py-12 relative">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <Navbar />
      <div className="container mx-auto max-w-7xl">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-white via-gold-500 to-white bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
            Admin Dashboard
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Manage your barbershop
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-800 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {(["dashboard", "services", "appointments"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 sm:px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap flex-shrink-0 ${
                activeTab === tab
                  ? "border-gold-500 text-gold-500"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
          <Link
            href="/admin/working-hours"
            className="px-4 sm:px-6 py-3 font-medium text-gray-400 hover:text-gray-300 border-b-2 border-transparent whitespace-nowrap flex-shrink-0"
          >
            Working Hours
          </Link>
          <Link
            href="/admin/block-dates"
            className="px-4 sm:px-6 py-3 font-medium text-gray-400 hover:text-gray-300 border-b-2 border-transparent whitespace-nowrap flex-shrink-0"
          >
            Block Dates
          </Link>
          <Link
            href="/admin/schedule"
            className="px-4 sm:px-6 py-3 font-medium text-gray-400 hover:text-gray-300 border-b-2 border-transparent whitespace-nowrap flex-shrink-0"
          >
            Schedule
          </Link>
          <Link
            href="/admin/clients"
            className="px-4 sm:px-6 py-3 font-medium text-gray-400 hover:text-gray-300 border-b-2 border-transparent whitespace-nowrap flex-shrink-0"
          >
            Clients
          </Link>
          <Link
            href="/admin/analytics"
            className="px-4 sm:px-6 py-3 font-medium text-gray-400 hover:text-gray-300 border-b-2 border-transparent whitespace-nowrap flex-shrink-0"
          >
            Analytics
          </Link>
          <Link
            href="/admin/payments"
            className="px-4 sm:px-6 py-3 font-medium text-gray-400 hover:text-gray-300 border-b-2 border-transparent whitespace-nowrap flex-shrink-0"
          >
            Payments
          </Link>
          <Link
            href="/admin/settings"
            className="px-4 sm:px-6 py-3 font-medium text-gray-400 hover:text-gray-300 border-b-2 border-transparent whitespace-nowrap flex-shrink-0"
          >
            Settings
          </Link>
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {[
              {
                icon: Calendar,
                title: "Today's Appointments",
                value: todayAppointments.length,
                color: "text-white",
              },
              {
                icon: Users,
                title: "Upcoming",
                value: upcomingAppointments.length,
                color: "text-white",
              },
              {
                icon: DollarSign,
                title: "Total Revenue",
                value: `$${totalRevenue.toFixed(2)}`,
                color: "text-gold-500",
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <Card className="h-full hover:border-gold-500/50 transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <stat.icon className="w-5 h-5 text-gold-500" />
                      {stat.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <motion.div
                      className={`text-3xl font-bold ${stat.color}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.1, type: "spring" }}
                    >
                      {stat.value}
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Services Tab */}
        {activeTab === "services" && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold">Services</h2>
              <Button onClick={() => setShowServiceForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </div>

            {showServiceForm && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>
                    {editingService ? "Edit Service" : "New Service"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleServiceSubmit} className="space-y-4">
                    <Input
                      placeholder="Service name"
                      value={serviceForm.name}
                      onChange={(e) =>
                        setServiceForm({ ...serviceForm, name: e.target.value })
                      }
                      required
                    />
                    <Textarea
                      placeholder="Description"
                      value={serviceForm.description}
                      onChange={(e) =>
                        setServiceForm({
                          ...serviceForm,
                          description: e.target.value,
                        })
                      }
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        type="number"
                        placeholder="Duration (minutes)"
                        value={serviceForm.duration}
                        onChange={(e) =>
                          setServiceForm({
                            ...serviceForm,
                            duration: e.target.value,
                          })
                        }
                        required
                      />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Price"
                        value={serviceForm.price}
                        onChange={(e) =>
                          setServiceForm({
                            ...serviceForm,
                            price: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit">
                        {editingService ? "Update" : "Create"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowServiceForm(false);
                          setEditingService(null);
                          setServiceForm({
                            name: "",
                            description: "",
                            duration: "30",
                            price: "",
                          });
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <Card className="h-full hover:border-gold-500/50 transition-all">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{service.name}</CardTitle>
                          <CardDescription>
                            {service.description}
                          </CardDescription>
                        </div>
                        <Badge
                          variant={service.isActive ? "default" : "secondary"}
                        >
                          {service.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <p className="text-sm text-gray-400">
                            Duration: {service.duration} min
                          </p>
                          <p className="text-lg font-semibold text-gold-500">
                            ${service.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingService(service);
                              setServiceForm({
                                name: service.name,
                                description: service.description || "",
                                duration: service.duration.toString(),
                                price: service.price.toString(),
                              });
                              setShowServiceForm(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteService(service.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === "appointments" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">
              All Appointments
            </h2>
            <div className="mb-6 space-y-4">
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showCancelled}
                    onChange={(e) => setShowCancelled(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-gold-500 focus:ring-gold-500 focus:ring-offset-gray-900"
                  />
                  <span>Show cancelled appointments</span>
                </label>
              </div>
              <AdvancedFilters
                onFilter={(filters) => {
                  // Filter logic can be added here
                }}
                services={services}
                showSearch={true}
                showStatus={true}
                showService={true}
                showDateRange={true}
              />
            </div>
            <div className="space-y-4">
              {appointments.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 5, scale: 1.01 }}
                >
                  <Card className="hover:border-gold-500/50 transition-all">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Scissors className="w-5 h-5 text-gold-500" />
                            {appointment.service.name}
                          </CardTitle>
                          <CardDescription className="mt-2">
                            {formatDate(appointment.date)} at{" "}
                            {formatTime(appointment.date)}
                          </CardDescription>
                        </div>
                        {appointment.status === "PENDING" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                handleUpdateAppointmentStatus(
                                  appointment.id,
                                  "CONFIRMED"
                                )
                              }
                            >
                              Confirm
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleUpdateAppointmentStatus(
                                  appointment.id,
                                  "CANCELLED"
                                )
                              }
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge>{appointment.status}</Badge>
                          <span className="text-sm text-gray-400">
                            {appointment.user.name || appointment.user.email}
                          </span>
                          {appointment.user.phone && (
                            <span className="text-sm text-gray-500">
                              • {appointment.user.phone}
                            </span>
                          )}
                        </div>
                        {appointment.notes && (
                          <p className="text-sm text-gray-400">
                            <span className="text-gray-500">
                              Client Notes:{" "}
                            </span>
                            {appointment.notes}
                          </p>
                        )}
                        {(appointment as any).barberNotes && (
                          <p className="text-sm text-gray-400">
                            <span className="text-gray-500">
                              Barber Notes:{" "}
                            </span>
                            {(appointment as any).barberNotes}
                          </p>
                        )}
                        <p className="text-sm">
                          <span className="text-gray-500">Price: </span>
                          <span className="text-gold-500 font-semibold">
                            ${appointment.service.price.toFixed(2)}
                          </span>
                        </p>

                        {/* Quick Action Buttons */}
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-800">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditAppointment(appointment)}
                            className="flex-1 sm:flex-none"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          {appointment.status === "PENDING" && (
                            <Button
                              size="sm"
                              onClick={() =>
                                handleUpdateAppointmentStatus(
                                  appointment.id,
                                  "CONFIRMED"
                                )
                              }
                              className="flex-1 sm:flex-none"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Confirm
                            </Button>
                          )}
                          {appointment.status !== "COMPLETED" &&
                            appointment.status !== "CANCELLED" && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleUpdateAppointmentStatus(
                                    appointment.id,
                                    "COMPLETED"
                                  )
                                }
                                className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Complete
                              </Button>
                            )}
                          {appointment.status !== "CANCELLED" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleUpdateAppointmentStatus(
                                  appointment.id,
                                  "CANCELLED"
                                )
                              }
                              className="flex-1 sm:flex-none border-red-500 text-red-500 hover:bg-red-500/10"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Edit Appointment Modal */}
        {editingAppointment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-full max-w-2xl bg-gray-900 rounded-lg border border-gray-800 p-6 max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold mb-4">Edit Appointment</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Status
                  </label>
                  <select
                    value={appointmentEditForm.status}
                    onChange={(e) =>
                      setAppointmentEditForm({
                        ...appointmentEditForm,
                        status: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">
                      Date
                    </label>
                    <Input
                      type="date"
                      value={appointmentEditForm.date}
                      onChange={(e) =>
                        setAppointmentEditForm({
                          ...appointmentEditForm,
                          date: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">
                      Time
                    </label>
                    <Input
                      type="time"
                      value={appointmentEditForm.time}
                      onChange={(e) =>
                        setAppointmentEditForm({
                          ...appointmentEditForm,
                          time: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Barber Notes
                  </label>
                  <Textarea
                    value={appointmentEditForm.barberNotes}
                    onChange={(e) =>
                      setAppointmentEditForm({
                        ...appointmentEditForm,
                        barberNotes: e.target.value,
                      })
                    }
                    placeholder="Add notes about this appointment..."
                    rows={4}
                  />
                </div>

                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-gray-400 mb-2">
                    Appointment Details
                  </p>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-gray-500">Service: </span>
                      <span className="text-white">
                        {editingAppointment.service.name}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-500">Customer: </span>
                      <span className="text-white">
                        {editingAppointment.user.name ||
                          editingAppointment.user.email}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-500">Price: </span>
                      <span className="text-gold-500 font-semibold">
                        ${editingAppointment.service.price.toFixed(2)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingAppointment(null);
                    setAppointmentEditForm({
                      status: "",
                      barberNotes: "",
                      date: "",
                      time: "",
                    });
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveAppointment} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
