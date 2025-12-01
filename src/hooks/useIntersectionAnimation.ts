"use client";

import { useEffect, useRef, useState, RefObject } from "react";

interface UseIntersectionAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Lightweight alternative to framer-motion for scroll-triggered animations.
 * Uses CSS classes instead of JavaScript animations for better performance.
 */
export function useIntersectionAnimation<T extends HTMLElement>(
  options: UseIntersectionAnimationOptions = {}
): [RefObject<T | null>, boolean] {
  const { threshold = 0.1, rootMargin = "0px", triggerOnce = true } = options;
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return [ref, isVisible];
}

/**
 * Batch intersection observer for multiple elements.
 * More efficient than individual observers.
 */
export function useBatchIntersection(
  selector: string,
  options: UseIntersectionAnimationOptions = {}
): void {
  const { threshold = 0.1, rootMargin = "50px", triggerOnce = true } = options;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            if (triggerOnce) {
              observer.unobserve(entry.target);
            }
          } else if (!triggerOnce) {
            entry.target.classList.remove("is-visible");
          }
        });
      },
      { threshold, rootMargin }
    );

    // Use requestIdleCallback for non-critical observation setup
    const setup = () => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => observer.observe(el));
    };

    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(setup, { timeout: 1000 });
    } else {
      setTimeout(setup, 100);
    }

    return () => observer.disconnect();
  }, [selector, threshold, rootMargin, triggerOnce]);
}

