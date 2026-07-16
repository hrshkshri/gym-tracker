// Placeholder service worker so `next build` can compile with Serwist enabled
// in production. A later task owns the real caching strategy for this app;
// this is intentionally the minimal Serwist boilerplate and nothing more.
//
// This file executes in the service worker global scope, which needs the
// "webworker" lib for full typing. The project tsconfig (shared with app
// code) intentionally doesn't include it, so we type-check this file
// loosely rather than widen the shared tsconfig for a placeholder.
// @ts-nocheck
import { defaultCache } from "@serwist/next/worker";
import { Serwist } from "serwist";

declare const self: any;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();
