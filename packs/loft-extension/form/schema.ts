/**
 * Loft & extension quote form: the questions are code; their answer options and points are in
 * Sanity (Quote form → Answer options) with ../content/quote-form.ts as the default.
 */
import { z } from "zod";
import { choice, optionalText, ukPostcode, type PackFormDefinition } from "@/lib/leads/fields";

const stepSchemas = {
  property: z.object({
    propertyType: choice("Choose a property type"),
    propertyAge: choice("Choose an approximate age"),
    ownership: choice("Choose one"),
    postcode: ukPostcode,
  }),
  timing: z.object({ timing: choice("Choose when you'd like to start") }),
  budget: z.object({ budget: choice("Choose a budget range") }),
  planning: z.object({
    drawings: choice("Choose one"),
    planningStatus: choice("Choose one"),
    architect: choice("Choose one"),
    partyWall: choice("Choose one"),
  }),
  living: z.object({
    staying: choice("Choose one"),
    access: optionalText(1000),
    parking: choice("Choose one"),
  }),
};

export const packForm = {
  steps: ["services", "property", "timing", "budget", "planning", "living", "detail", "contact"],
  stepSchemas,
  scoreFields: ["timing", "budget", "drawings", "planningStatus", "architect"],
  answerRows: (lead, label) => {
    const a = lead.answers;
    return [
      ["Property", [label("propertyType", a.propertyType), label("propertyAge", a.propertyAge), label("ownership", a.ownership)].filter(Boolean).join(" · ")],
      ["Postcode", lead.postcode],
      ["Start", label("timing", a.timing)],
      ["Budget", label("budget", a.budget)],
      ["Drawings", label("drawings", a.drawings)],
      ["Planning", label("planningStatus", a.planningStatus)],
      ["Needs architect", label("architect", a.architect)],
      ["Party wall issues", label("partyWall", a.partyWall)],
      ["Staying in", label("staying", a.staying)],
      ["Access", String(a.access ?? "")],
      ["Parking", label("parking", a.parking)],
    ];
  },
  csvColumns: [
    ["Timing", "timing"],
    ["Budget", "budget"],
    ["Planning status", "planningStatus"],
  ],
  conversionParams: (a) => ({ budget_band: String(a.budget ?? ""), timescale: String(a.timing ?? ""), planning_status: String(a.planningStatus ?? "") }),
} satisfies PackFormDefinition;
