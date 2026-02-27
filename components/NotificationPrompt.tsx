"use client";

import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  isPushNotificationSupported,
  isPushSubscribed,
  subscribeToPushNotifications,
} from "@/lib/utils/pushNotifications";

export function NotificationPrompt() {
  const [show, setShow] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      if (!isPushNotificationSupported()) return;
      if (localStorage.getItem("push-prompt-dismissed")) return;
      const subscribed = await isPushSubscribed();
      if (!subscribed) setShow(true);
    };
    checkStatus();
  }, []);

  const handleEnable = async () => {
    setSubscribing(true);
    const success = await subscribeToPushNotifications();
    setSubscribing(false);
    if (success) {
      setShow(false);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem("push-prompt-dismissed", "true");
  };

  if (!show) return null;

  return (
    <div className="bg-burgundy/10 border border-burgundy/20 rounded-xl p-4 flex items-start gap-3">
      <Bell className="w-5 h-5 text-burgundy mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">
          Enable session reminders?
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          Get notified 15 minutes before training sessions
        </p>
        <div className="flex gap-2 mt-2">
          <Button size="sm" onClick={handleEnable} disabled={subscribing}>
            {subscribing ? "Enabling..." : "Enable"}
          </Button>
          <Button size="sm" variant="ghost" onClick={handleDismiss}>
            Not now
          </Button>
        </div>
      </div>
      <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
