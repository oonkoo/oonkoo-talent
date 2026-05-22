"use client";

import { useState, useTransition, type ChangeEvent, type FormEvent } from "react";
import { ArrowUpRight, Check, Loader2 } from "lucide-react";
import { createLeadFromContact } from "@/app/actions";

type FormState = {
  name: string;
  email: string;
  company: string;
  message: string;
};

const INITIAL: FormState = {
  name: "",
  email: "",
  company: "",
  message: "",
};

export function ContactForm() {
  const [pending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<FormState>(INITIAL);

  function patch<K extends keyof FormState>(key: K) {
    return (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setData((d) => ({ ...d, [key]: e.target.value }));
    };
  }

  function validate(): string | null {
    if (!data.name.trim()) return "Tell us your name.";
    if (!data.email.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      return "That email looks off — double-check it?";
    if (!data.message.trim())
      return "A line or two about what you need helps us route this.";
    return null;
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await createLeadFromContact({
          name: data.name.trim(),
          email: data.email.trim(),
          company: data.company.trim() || undefined,
          message: data.message.trim(),
        });
        setSubmitted(true);
      } catch {
        setError("Something went wrong on our end. Try again, or email hello@oonkoo.com directly.");
      }
    });
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-start gap-3 py-2">
        <span className="inline-flex items-center justify-center size-9 rounded-full bg-accent">
          <Check className="size-5 text-foreground" strokeWidth={2.5} />
        </span>
        <p className="font-display text-[clamp(1.4rem,2.2vw,1.85rem)] leading-[1.2] tracking-[-0.025em] text-foreground text-balance max-w-[26ch]">
          Got it, {data.name.split(" ")[0]}. We&rsquo;ll get back within
          twenty-four hours.
        </p>
        <p className="text-[14px] leading-[1.55] text-muted-foreground max-w-[40ch]">
          Usually it&rsquo;s same-day. If we don&rsquo;t respond by tomorrow,
          we promise it&rsquo;s the inbox triage and not us ignoring you —
          drop a line directly to{" "}
          <span className="text-foreground">hello@oonkoo.com</span>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-7" noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7">
        <Field label="Name" htmlFor="contact-name">
          <input
            id="contact-name"
            type="text"
            value={data.name}
            onChange={patch("name")}
            placeholder="Jane Doe"
            disabled={pending}
            autoComplete="name"
            className="ot-line-input"
          />
        </Field>

        <Field label="Email" htmlFor="contact-email">
          <input
            id="contact-email"
            type="email"
            value={data.email}
            onChange={patch("email")}
            placeholder="jane@acme.com"
            disabled={pending}
            autoComplete="email"
            className="ot-line-input"
          />
        </Field>
      </div>

      <Field label="Company" htmlFor="contact-company" optional>
        <input
          id="contact-company"
          type="text"
          value={data.company}
          onChange={patch("company")}
          placeholder="Acme Inc."
          disabled={pending}
          autoComplete="organization"
          className="ot-line-input"
        />
      </Field>

      <Field label="Message" htmlFor="contact-message">
        <textarea
          id="contact-message"
          value={data.message}
          onChange={patch("message")}
          placeholder="What are you trying to ship, and on what timeline?"
          disabled={pending}
          rows={4}
          className="ot-line-input resize-none"
        />
      </Field>

      {error && (
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-destructive">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-6 gap-y-4 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="group relative inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-[14px] font-medium tracking-[-0.005em] text-primary-foreground transition-transform duration-300 hover:scale-[1.015] active:scale-[0.99] disabled:opacity-70 disabled:cursor-wait"
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Sending…</span>
            </>
          ) : (
            <>
              <span>Send the note</span>
              <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </>
          )}
          <span
            aria-hidden
            className="absolute inset-0 -z-10 rounded-full bg-accent opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-70"
          />
        </button>
        <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground/70">
          Reply within 24 hr · usually same-day
        </p>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  optional,
  children,
}: {
  label: string;
  htmlFor: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={htmlFor}
        className="flex items-baseline gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70"
      >
        <span>{label}</span>
        {optional && (
          <span className="text-muted-foreground/40 normal-case tracking-normal">
            (optional)
          </span>
        )}
      </label>
      {children}
    </div>
  );
}
