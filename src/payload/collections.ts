import type { CollectionConfig } from "payload";

const seriesOptions = [
  { label: "Formula 1", value: "f1" },
  { label: "Formula 2", value: "f2" },
  { label: "Formula 3", value: "f3" },
  { label: "MotoGP", value: "motogp" },
  { label: "NASCAR", value: "nascar" },
  { label: "IndyCar", value: "indycar" },
  { label: "WEC / Endurance", value: "wec" },
  { label: "WRC", value: "wrc" },
  { label: "Porsche Supercup", value: "supercup" },
  { label: "General", value: "general" },
];

const publicRead = { read: () => true } as const;

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: { useAsTitle: "email" },
  fields: [{ name: "name", type: "text" }],
};

export const Events: CollectionConfig = {
  slug: "events",
  access: publicRead,
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "series", "eventId"],
    description:
      "F1 events are AUTO-GENERATED from the season calendar (ids like f1-2026-r10) — do not create them by hand. To attach streams or override fields on an auto event, create an event here with the SAME eventId; it overrides/extends the generated one. Other series are managed manually as before.",
  },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "eventId", type: "text", required: true, unique: true, admin: { description: "Public id used in the /watch URL. Use the auto-generated F1 id (e.g. f1-2026-r10) to attach streams to a calendar event." } },
    { name: "series", type: "select", options: seriesOptions, required: true, defaultValue: "f1" },
    { name: "circuit", type: "text" },
    { name: "country", type: "text" },
    { name: "image", type: "text", admin: { description: "Image URL (or leave empty for the series poster)" } },
    { name: "description", type: "textarea" },
    { name: "featured", type: "checkbox", defaultValue: false },
    {
      name: "sessions",
      type: "array",
      fields: [
        { name: "key", type: "text", required: true },
        { name: "name", type: "text", required: true },
        { name: "startsAt", type: "date", required: true, admin: { date: { pickerAppearance: "dayAndTime" } } },
        { name: "endsAt", type: "date", admin: { date: { pickerAppearance: "dayAndTime" } } },
      ],
    },
    {
      name: "streams",
      type: "array",
      admin: { description: "Livestream sources shown on the watch page" },
      fields: [
        { name: "label", type: "text", required: true },
        { name: "language", type: "text", required: true, defaultValue: "English" },
        { name: "source", type: "text", required: true },
        { name: "url", type: "text", required: true },
        { name: "kind", type: "select", options: ["iframe", "hls"], defaultValue: "iframe", required: true },
        { name: "role", type: "select", options: ["feed", "onboard"], defaultValue: "feed", required: true },
        { name: "driver", type: "text", admin: { description: "Onboard cam driver name, e.g. Max Verstappen", condition: (_data, siblingData) => siblingData?.role === "onboard" } },
      ],
    },
  ],
};

export const Replays: CollectionConfig = {
  slug: "replays",
  access: publicRead,
  admin: { useAsTitle: "title", defaultColumns: ["title", "season", "round", "session"] },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "season", type: "number", required: true, defaultValue: 2026 },
    { name: "round", type: "number", required: true },
    { name: "eventName", type: "text", required: true },
    { name: "session", type: "text", required: true, admin: { description: "FP1, FP2, FP3, Sprint, Qualifying, Race…" } },
    { name: "url", type: "text", required: true },
    { name: "kind", type: "select", options: ["iframe", "hls"], defaultValue: "iframe", required: true },
    { name: "image", type: "text" },
    { name: "durationMin", type: "number" },
    { name: "airedAt", type: "date", required: true },
  ],
};

export const Media: CollectionConfig = {
  slug: "media-items",
  access: publicRead,
  admin: { useAsTitle: "title", defaultColumns: ["title", "kind", "series"] },
  fields: [
    { name: "kind", type: "select", options: ["documentary", "movie", "video"], required: true },
    { name: "title", type: "text", required: true },
    { name: "description", type: "textarea" },
    { name: "series", type: "select", options: seriesOptions, defaultValue: "general", required: true },
    { name: "year", type: "number" },
    { name: "image", type: "text" },
    { name: "url", type: "text", required: true },
    { name: "embedKind", type: "select", options: ["iframe", "hls"], defaultValue: "iframe", required: true },
    { name: "source", type: "text", admin: { description: "Origin site for crawled videos" } },
    { name: "durationMin", type: "number" },
    { name: "requiresAccount", type: "checkbox", defaultValue: false, admin: { description: "Movies should have this on" } },
  ],
};

export const NewsPosts: CollectionConfig = {
  slug: "news-posts",
  access: publicRead,
  admin: { useAsTitle: "title", defaultColumns: ["title", "publishedAt", "pinPriority"] },
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        if (!data) return data;
        const wasPinned = Boolean(originalDoc?.pinPriority);
        if (data.pinPriority && !wasPinned) data.pinnedAt = new Date().toISOString();
        else if (data.pinPriority === false && wasPinned) data.pinnedAt = null;
        return data;
      },
    ],
  },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true },
    { name: "excerpt", type: "textarea" },
    { name: "image", type: "text" },
    { name: "series", type: "select", options: seriesOptions, defaultValue: "general", required: true },
    { name: "author", type: "text", defaultValue: "Rerace Team" },
    { name: "publishedAt", type: "date", required: true },
    { name: "pinPriority", type: "checkbox", defaultValue: false, label: "Pin to top news (slot #2)" },
    { name: "pinHours", type: "number", defaultValue: 6, min: 1, admin: { description: "How long the pin lasts, in hours", condition: (data) => Boolean(data?.pinPriority) } },
    { name: "pinnedAt", type: "date", admin: { readOnly: true, description: "Set automatically when the pin is enabled" } },
    { name: "body", type: "richText" },
  ],
};

export const Polls: CollectionConfig = {
  slug: "polls",
  access: publicRead,
  admin: { useAsTitle: "question", defaultColumns: ["question", "startsAt", "endsAt"] },
  fields: [
    { name: "question", type: "text", required: true },
    { name: "options", type: "array", minRows: 2, maxRows: 10, fields: [{ name: "label", type: "text", required: true }] },
    { name: "startsAt", type: "date", required: true },
    { name: "endsAt", type: "date", required: true },
  ],
};

export const Drivers: CollectionConfig = {
  slug: "drivers",
  access: publicRead,
  admin: { useAsTitle: "name", defaultColumns: ["name", "series", "team"] },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true },
    { name: "series", type: "select", options: seriesOptions, defaultValue: "f1", required: true },
    { name: "team", type: "text" },
    { name: "number", type: "number" },
    { name: "country", type: "text" },
    { name: "image", type: "text" },
    { name: "bio", type: "textarea" },
    { name: "championships", type: "number" },
    { name: "careerWins", type: "number" },
    { name: "careerPodiums", type: "number" },
    { name: "careerPoles", type: "number" },
    { name: "stats", type: "array", fields: [
      { name: "label", type: "text", required: true },
      { name: "value", type: "text", required: true },
    ] },
  ],
};

export const Teams: CollectionConfig = {
  slug: "teams",
  access: publicRead,
  admin: { useAsTitle: "name", defaultColumns: ["name", "series"] },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true },
    { name: "series", type: "select", options: seriesOptions, defaultValue: "f1", required: true },
    { name: "color", type: "text", admin: { description: "Hex color, e.g. #ff8000" } },
    { name: "base", type: "text" },
    { name: "fullName", type: "text", admin: { description: "Full entrant name, e.g. McLaren Mastercard Formula 1 Team" } },
    { name: "principal", type: "text" },
    { name: "engine", type: "text" },
    { name: "carName", type: "text" },
    { name: "championships", type: "number" },
    { name: "raceWins", type: "number" },
    { name: "firstEntry", type: "number" },
    { name: "image", type: "text" },
    { name: "bio", type: "textarea" },
  ],
};

export const AdSlots: CollectionConfig = {
  slug: "ad-slots",
  access: publicRead,
  admin: { useAsTitle: "key", defaultColumns: ["key", "mode", "active"] },
  fields: [
    { name: "key", type: "text", required: true, unique: true, admin: { description: "Placement key: mega-menu, news-feed, sidebar, between-rows, watch-below" } },
    { name: "label", type: "text" },
    { name: "mode", type: "select", options: ["code", "banner"], defaultValue: "banner", required: true },
    { name: "code", type: "textarea", admin: { description: "Raw embed snippet (HilltopAds / AdMaven / partner)", condition: (data) => data.mode === "code" } },
    { name: "image", type: "text", admin: { condition: (data) => data.mode === "banner" } },
    { name: "link", type: "text", admin: { condition: (data) => data.mode === "banner" } },
    { name: "active", type: "checkbox", defaultValue: false },
  ],
};

export const Incidents: CollectionConfig = {
  slug: "incidents",
  access: publicRead,
  admin: { useAsTitle: "title", defaultColumns: ["title", "status", "severity"] },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "status", type: "select", options: ["investigating", "identified", "monitoring", "resolved"], defaultValue: "investigating", required: true },
    { name: "severity", type: "select", options: ["minor", "major", "critical"], defaultValue: "minor", required: true },
    { name: "body", type: "textarea" },
    { name: "startedAt", type: "date", required: true },
    { name: "resolvedAt", type: "date" },
  ],
};

export const collections = [
  Users,
  Events,
  Replays,
  Media,
  NewsPosts,
  Polls,
  Drivers,
  Teams,
  AdSlots,
  Incidents,
];
