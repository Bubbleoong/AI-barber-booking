import type { ReactNode } from "react";

export type RouteContext<Key extends string> = { params: Promise<Record<Key, string>> };
export type RouteLayoutProps = { children: ReactNode };
export type BookingErrorProps = { error: Error; reset: () => void };
export type PageQueryProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
