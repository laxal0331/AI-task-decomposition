import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from 'react';
// Sentry 在浏览器端可选初始化；避免 Node-only 依赖被打进客户端
import { initSentryBrowser } from "../lib/monitoring/sentry.browser";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => { initSentryBrowser(); }, []);
  return <Component {...pageProps} />;
}
