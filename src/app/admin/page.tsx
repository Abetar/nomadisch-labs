// src/app/admin/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  adminCreateEventAction,
  adminListEventsAction,
  adminUpdateEventAction,
  type AdminEventPayload,
} from "@/app/admin/actions";

type Row = {
  id: string;
  slug: string;
  title: string;
  status: "upcoming" | "past" | "cancelled";
  dateStart: string;
  dateEnd?: string;
  city: string;
  state?: string;
  country?: string;
  venue?: string;
  address?: string;
  ticketUrl?: string;
  instagramPostUrl?: string;
  description?: string;
  coverUrl?: string; // derived from Airtable attachment
};

function toDatetimeLocal(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}


const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

async function uploadToCloudinary(
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  if (!CLOUD_NAME) throw new Error("Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME");
  if (!UPLOAD_PRESET) throw new Error("Missing NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET");

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  return await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    xhr.upload.onprogress = (evt) => {
      if (!evt.lengthComputable) return;
      const pct = Math.round((evt.loaded / evt.total) * 100);
      onProgress?.(pct);
    };

    xhr.onload = () => {
      try {
        const status = xhr.status;
        const json = JSON.parse(xhr.responseText || "{}");

        // console.log("[CLOUDINARY] status:", status);
        // console.log("[CLOUDINARY] response:", json);

        if (status >= 200 && status < 300 && json.secure_url) {
          resolve(json.secure_url as string);
          return;
        }

        reject(
          new Error(
            json?.error?.message ||
              `Cloudinary upload failed: ${status} ${xhr.responseText}`
          )
        );
      } catch (e: any) {
        reject(new Error(e?.message || "Cloudinary upload failed"));
      }
    };

    xhr.onerror = () => reject(new Error("Cloudinary upload network error"));

    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", UPLOAD_PRESET);
    fd.append("folder", "nomadisch/events");

    xhr.send(fd);
  });
}


export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ✅ SOURCE OF TRUTH for cover URL (hidden; no URL input in UI)
  const coverUrlRef = useRef<string>("");

  // ✅ Only send coverUrl on UPDATE if user changed it
  const [coverTouched, setCoverTouched] = useState(false);

  // ✅ Small UX: show selected filename (no URL)
  const [selectedCoverName, setSelectedCoverName] = useState<string>("");

  const selected = useMemo(
    () => rows.find((r) => r.id === selectedId) ?? null,
    [rows, selectedId]
  );

  const [form, setForm] = useState({
    id: "",
    slug: "",
    title: "",
    status: "past" as Row["status"],
    dateStart: "",
    dateEnd: "",
    city: "",
    state: "",
    country: "MX",
    venue: "",
    address: "",
    ticketUrl: "",
    instagramPostUrl: "",
    description: "",
  });

  useEffect(() => {
    if (!selected) return;

    // Load cover from Airtable into ref (so preview works)
    coverUrlRef.current = selected.coverUrl || "";
    setCoverTouched(false);
    setSelectedCoverName(""); // reset filename badge when switching records

    setForm({
      id: selected.id,
      slug: selected.slug || "",
      title: selected.title || "",
      status: selected.status || "past",
      dateStart: toDatetimeLocal(selected.dateStart),
      dateEnd: toDatetimeLocal(selected.dateEnd),
      city: selected.city || "",
      state: selected.state || "",
      country: selected.country || "MX",
      venue: selected.venue || "",
      address: selected.address || "",
      ticketUrl: selected.ticketUrl || "",
      instagramPostUrl: selected.instagramPostUrl || "",
      description: selected.description || "",
    });
  }, [selected]);

  function load() {
    setError(null);
    startTransition(async () => {
      try {
        const data = await adminListEventsAction(password);
        setRows(data as any);
      } catch (e: any) {
        setError(e?.message || "Error loading events");
      }
    });
  }

  function buildPayload(mode: "create" | "update"): AdminEventPayload {
    const cover = (coverUrlRef.current || "").trim();

    // console.log("[CLIENT SUBMIT] mode:", mode);
    // console.log("[CLIENT SUBMIT] coverTouched:", coverTouched);
    // console.log("[CLIENT SUBMIT] coverUrlRef:", JSON.stringify(cover));

    const payload: AdminEventPayload = {
      password,
      id: mode === "update" ? form.id : undefined,

      slug: form.slug,
      title: form.title,
      status: form.status,

      dateStart: form.dateStart,
      dateEnd: form.dateEnd || undefined,

      city: form.city,
      state: form.state || undefined,
      country: form.country || "MX",
      venue: form.venue || undefined,
      address: form.address || undefined,

      ticketUrl: form.ticketUrl || undefined,
      instagramPostUrl: form.instagramPostUrl || undefined,
      description: form.description || undefined,
    };

    // ✅ IMPORTANT:
    // CREATE: only send if we actually have a URL
    // UPDATE: only send if user touched cover ("" clears or "http..." sets)
    if (mode === "create") {
      if (cover.startsWith("http")) payload.coverUrl = cover;
    } else {
      if (coverTouched) payload.coverUrl = cover; // "" or url
    }

    // console.log("[CLIENT SUBMIT] payload.coverUrl:", payload.coverUrl);
    return payload;
  }

  function submit(mode: "create" | "update") {
    setError(null);
    startTransition(async () => {
      try {
        if (!password) throw new Error("Missing admin password");

        const payload = buildPayload(mode);

        if (mode === "create") {
          await adminCreateEventAction(payload);
        } else {
          if (!form.id) throw new Error("No event selected");
          await adminUpdateEventAction(payload);
        }

        load();
      } catch (e: any) {
        setError(e?.message || "Error saving event");
      }
    });
  }

  async function handleFileUpload(file: File) {
    // ✅ PRUEBA 1: confirmar que se dispara el handler
    // console.log("[HANDLE FILE UPLOAD] FIRED", file?.name, file?.type, file?.size);
    // alert("handleFileUpload FIRED: " + file?.name);

    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Image too large (max 8MB).");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      setSelectedCoverName(file.name);

      // ✅ PRUEBA 2: verificar envs en cliente (si esto falla, cae al catch)
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
      // console.log("[ENV CHECK] cloudName:", cloudName);
      // console.log("[ENV CHECK] preset:", preset);
      // alert(`ENV CHECK\ncloudName=${cloudName}\npreset=${preset}`);

      // ✅ PRUEBA 3: confirmar si se cuelga en el await
      // console.log("[UPLOAD] before uploadToCloudinary");
      // alert("before uploadToCloudinary");

      const url = await uploadToCloudinary(file, setUploadProgress);

      // console.log("[UPLOAD] after uploadToCloudinary", url);
      // alert("after uploadToCloudinary: " + url);

      // console.log("[CLIENT UPLOAD] GOT URL:", url);

      coverUrlRef.current = url;
      setCoverTouched(true);

      // reset input so you can upload same file again if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (e: any) {
      // console.log("[UPLOAD] catch error:", e);
      // alert("UPLOAD FAILED: " + (e?.message || String(e)));
      setError(e?.message || "Image upload failed");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }

  const coverPreview = (coverUrlRef.current || "").trim();

  return (
    <main className="mx-auto max-w-5xl">
      <div className="rounded-3xl border border-white/12 p-6 md:p-10">
        <div className="text-xs font-bold tracking-[0.28em] text-white/55">
          ADMIN
        </div>
        <h1 className="mt-3 text-4xl font-extrabold [font-family:var(--font-display)]">
          EVENTS PANEL
        </h1>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            type="password"
            className="rounded-2xl border border-white/20 bg-black px-4 py-3 text-sm text-white placeholder:text-white/35"
          />

          <button
            onClick={load}
            disabled={!password || isPending}
            className="rounded-2xl bg-white px-4 py-3 text-sm font-extrabold tracking-[0.18em] text-black disabled:opacity-50"
          >
            LOAD EVENTS
          </button>

          <button
            onClick={() => {
              setSelectedId(null);
              coverUrlRef.current = "";
              setCoverTouched(false);
              setSelectedCoverName("");
              setForm({
                id: "",
                slug: "",
                title: "",
                status: "past",
                dateStart: "",
                dateEnd: "",
                city: "",
                state: "",
                country: "MX",
                venue: "",
                address: "",
                ticketUrl: "",
                instagramPostUrl: "",
                description: "",
              });
            }}
            disabled={isPending}
            className="rounded-2xl border border-white/25 px-4 py-3 text-sm font-extrabold tracking-[0.18em] text-white/85 disabled:opacity-50"
          >
            NEW EVENT
          </button>
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-white/20 bg-black/40 p-4 text-sm text-white">
            {error}
          </div>
        ) : null}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-[1fr_1.2fr]">
        {/* List */}
        <div className="rounded-3xl border border-white/12 p-5">
          <div className="text-xs font-bold tracking-[0.28em] text-white/55">
            EVENTS
          </div>

          <div className="mt-4 grid gap-2">
            {rows.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedId(r.id)}
                className={`text-left rounded-2xl border px-4 py-3 transition ${
                  selectedId === r.id
                    ? "border-white/35 bg-white/5"
                    : "border-white/12 hover:border-white/25"
                }`}
              >
                <div className="text-xs font-bold tracking-[0.22em] text-white/55">
                  {r.status?.toUpperCase()} · {r.slug}
                </div>
                <div className="mt-1 text-sm font-extrabold">{r.title}</div>
              </button>
            ))}

            {rows.length === 0 ? (
              <div className="rounded-2xl border border-white/12 p-4 text-sm text-white/70">
                Load events to edit, or create a new one.
              </div>
            ) : null}
          </div>
        </div>

        {/* Form */}
        <div className="rounded-3xl border border-white/12 p-5">
          <div className="text-xs font-bold tracking-[0.28em] text-white/55">
            {form.id ? "EDIT EVENT" : "CREATE EVENT"}
          </div>

          <div className="mt-4 grid gap-3">
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="slug (unique)"
              className="rounded-2xl border border-white/20 bg-black px-4 py-3 text-sm text-white placeholder:text-white/35"
            />

            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="title"
              className="rounded-2xl border border-white/20 bg-black px-4 py-3 text-sm text-white placeholder:text-white/35"
            />

            <div className="grid gap-3 md:grid-cols-2">
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as any })
                }
                className="rounded-2xl border border-white/20 bg-black px-4 py-3 text-sm text-white"
              >
                <option value="upcoming">upcoming</option>
                <option value="past">past</option>
                <option value="cancelled">cancelled</option>
              </select>

              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="city"
                className="rounded-2xl border border-white/20 bg-black px-4 py-3 text-sm text-white placeholder:text-white/35"
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <input
                type="datetime-local"
                value={form.dateStart}
                onChange={(e) =>
                  setForm({ ...form, dateStart: e.target.value })
                }
                className="rounded-2xl border border-white/20 bg-black px-4 py-3 text-sm text-white"
              />
              <input
                type="datetime-local"
                value={form.dateEnd}
                onChange={(e) => setForm({ ...form, dateEnd: e.target.value })}
                className="rounded-2xl border border-white/20 bg-black px-4 py-3 text-sm text-white"
              />
            </div>

            {/* COVER (upload only; no URL input) */}
            <div className="rounded-2xl border border-white/12 p-4">
              <div className="text-[11px] font-bold tracking-[0.22em] text-white/55">
                COVER IMAGE (upload)
              </div>

              <div className="mt-3 grid gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  disabled={isUploading || isPending}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    void handleFileUpload(file);
                  }}
                  className="rounded-2xl border border-white/20 bg-black px-4 py-3 text-sm text-white file:mr-4 file:rounded-xl file:border-0 file:bg-white file:px-4 file:py-2 file:text-xs file:font-extrabold file:tracking-[0.18em] file:text-black disabled:opacity-60"
                />

                {selectedCoverName ? (
                  <div className="text-xs text-white/60">
                    Selected:{" "}
                    <span className="font-bold text-white/80">
                      {selectedCoverName}
                    </span>
                  </div>
                ) : null}

                {isUploading ? (
                  <div className="rounded-2xl border border-white/12 p-3">
                    <div className="text-xs font-bold tracking-[0.22em] text-white/70">
                      UPLOADING… {uploadProgress}%
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full border border-white/12">
                      <div
                        className="h-full bg-white"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                ) : null}

                {coverPreview ? (
                  <div className="overflow-hidden rounded-2xl border border-white/12">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={coverPreview}
                      alt="cover preview"
                      className="h-48 w-full object-cover grayscale"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="text-xs text-white/55">
                    Upload an image — it will be stored in Cloudinary and saved
                    into Airtable attachment{" "}
                    <span className="font-bold text-white/75">coverURL</span>.
                  </div>
                )}

                <button
                  type="button"
                  disabled={isPending || isUploading || !form.id}
                  onClick={() => {
                    coverUrlRef.current = "";
                    setCoverTouched(true);
                    setSelectedCoverName("");
                  }}
                  className="rounded-2xl border border-white/25 px-4 py-3 text-sm font-extrabold tracking-[0.18em] text-white/85 disabled:opacity-50"
                >
                  CLEAR COVER (next UPDATE)
                </button>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <button
                onClick={() => submit("create")}
                disabled={!password || isPending || isUploading}
                className="rounded-2xl bg-white px-4 py-3 text-sm font-extrabold tracking-[0.18em] text-black disabled:opacity-50"
              >
                CREATE
              </button>

              <button
                onClick={() => submit("update")}
                disabled={!password || !form.id || isPending || isUploading}
                className="rounded-2xl border border-white/25 px-4 py-3 text-sm font-extrabold tracking-[0.18em] text-white/85 disabled:opacity-50"
              >
                UPDATE
              </button>
            </div>

            <div className="text-xs text-white/55">
              NOTE: Upload uses Cloudinary. We store the resulting URL internally
              and save it into Airtable attachment{" "}
              <span className="font-bold text-white/75">coverURL</span>.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
