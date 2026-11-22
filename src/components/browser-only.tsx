"use client";

import { useSyncExternalStore, type ReactNode } from "react";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function BrowserOnly({ children }: { children: ReactNode }) {
  const ready = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  return ready ? children : null;
}
