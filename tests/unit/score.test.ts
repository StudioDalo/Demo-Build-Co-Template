import { describe, expect, it } from "vitest";
import { scoreLead } from "@/lib/leads/score";
import { quoteForm } from "@/clients/active/content";

describe("scoreLead", () => {
  it("rates ASAP + big budget + permission granted as hot", () => {
    const r = scoreLead({ timing: "asap", budget: "50k-100k", drawings: "yes", planningStatus: "granted", architect: "no" }, quoteForm);
    expect(r.points).toBe(3 + 3 + 2 + 2 + 1);
    expect(r.score).toBe("hot");
  });
  it("rates 3-6 months, mid budget, nothing started as warm", () => {
    const r = scoreLead({ timing: "3-6-months", budget: "25k-50k", drawings: "no", planningStatus: "not-applied", architect: "yes" }, quoteForm);
    expect(r.points).toBe(5);
    expect(r.score).toBe("warm");
  });
  it("rates just researching with no budget as cold", () => {
    expect(scoreLead({ timing: "researching", budget: "not-sure", drawings: "no", planningStatus: "not-sure", architect: "not-sure" }, quoteForm).score).toBe("cold");
  });
  it("treats unknown values as zero points", () => {
    expect(scoreLead({ timing: "whenever" }, quoteForm)).toEqual({ score: "cold", points: 0 });
  });
  it("uses thresholds from settings", () => {
    expect(scoreLead({ timing: "asap" }, { ...quoteForm, scoring: { hot: 3, warm: 1 } }).score).toBe("hot");
  });
});
