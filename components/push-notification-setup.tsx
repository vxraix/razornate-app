"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";
import toast from "react-hot-toast";

export function PushNotificationSetup() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      // Check both browser and server
      const registration = await navigator.serviceWorker.ready;
      const browserSubscription = await registration.pushManager.getSubscription();
      
      // Also check server to see if we have a subscription record
      const serverResponse = await fetch("/api/push/subscribe");
      if (serverResponse.ok) {
        const serverData = await serverResponse.json();
        setIsSubscribed(!!browserSubscription && serverData.isSubscribed);
      } else {
        setIsSubscribed(!!browserSubscription);
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
      // Fallback to browser check only
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch (e) {
        setIsSubscribed(false);
      }
    }
  };

  const subscribe = async () => {
    if (!isSupported) {
      toast.error("Push notifications are not supported in your browser");
      return;
    }

    // Check if VAPID key is configured
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      toast.error("Push notifications are not configured. Please set VAPID keys in environment variables.");
      return;
    }

    setIsLoading(true);
    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register("/sw.js");
      await registration.update();

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;

      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error("Notification permission denied");
      }

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // Send subscription to server
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: arrayBufferToBase64(subscription.getKey("p256dh")!),
            auth: arrayBufferToBase64(subscription.getKey("auth")!),
          },
        }),
      });

      if (response.ok) {
        setIsSubscribed(true);
        toast.success("Push notifications enabled!");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to subscribe");
      }
    } catch (error: any) {
      console.error("Error subscribing:", error);
      toast.error(error.message || "Failed to enable push notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async () => {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Unsubscribe from browser
        await subscription.unsubscribe();
        
        // Remove from server database
        const response = await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
          }),
        });

        if (response.ok) {
          setIsSubscribed(false);
          toast.success("Push notifications disabled");
        } else {
          // Even if server removal fails, we've unsubscribed from browser
          setIsSubscribed(false);
          toast.success("Push notifications disabled (browser only)");
        }
      } else {
        // No browser subscription, but try to clean up server records
        const response = await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endpoint: "",
          }),
        });
        setIsSubscribed(false);
        toast.success("Push notifications disabled");
      }
    } catch (error) {
      console.error("Error unsubscribing:", error);
      toast.error("Failed to disable push notifications");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <Button
      variant="outline"
      onClick={isSubscribed ? unsubscribe : subscribe}
      disabled={isLoading}
      className="glow-gold-hover"
    >
      {isSubscribed ? (
        <>
          <BellOff className="w-4 h-4 mr-2" />
          Disable Notifications
        </>
      ) : (
        <>
          <Bell className="w-4 h-4 mr-2" />
          Enable Notifications
        </>
      )}
    </Button>
  );
}

function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray as BufferSource;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
