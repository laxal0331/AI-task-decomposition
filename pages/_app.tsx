import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from 'react';
import { initSentryBrowser } from "../lib/monitoring/sentry";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => { initSentryBrowser(); }, []);
  return <Component {...pageProps} />;
}
