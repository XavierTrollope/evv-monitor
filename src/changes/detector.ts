import * as Diff from "diff";
import * as fs from "fs";
import * as path from "path";

export interface DiffResult {
  linesAdded: number;
  linesRemoved: number;
  totalLinesOld: number;
  totalLinesNew: number;
  changeScore: number;
  diffPreview: string;
  summary: string;
}

interface NoiseFilter {
  name: string;
  regex: string;
  flags?: string;
  description?: string;
}

interface NoiseFiltersConfig {
  patterns: NoiseFilter[];
}

let compiledFilters: RegExp[] | null = null;

function loadNoiseFilters(): RegExp[] {
  if (compiledFilters) return compiledFilters;

  const configPath = path.resolve(
    __dirname,
    "../../config/noise-filters.json"
  );
  try {
    const raw = fs.readFileSync(configPath, "utf-8");
    const config: NoiseFiltersConfig = JSON.parse(raw);
    compiledFilters = config.patterns.map(
      (p) => new RegExp(p.regex, p.flags ?? "")
    );
  } catch {
    compiledFilters = [];
  }
  return compiledFilters;
}

function applyNoiseFilters(text: string): string {
  const filters = loadNoiseFilters();
  return text
    .split("\n")
    .filter((line) => !filters.some((rx) => rx.test(line)))
    .join("\n");
}

export function computeDiff(oldText: string, newText: string): DiffResult {
  const filteredOld = applyNoiseFilters(oldText);
  const filteredNew = applyNoiseFilters(newText);

  const changes = Diff.diffLines(filteredOld, filteredNew);

  let linesAdded = 0;
  let linesRemoved = 0;
  const changedLines: string[] = [];

  for (const part of changes) {
    const lineCount = part.count ?? part.value.split("\n").length;
    if (part.added) {
      linesAdded += lineCount;
      for (const l of part.value.split("\n").slice(0, 20 - changedLines.length)) {
        if (changedLines.length < 20) changedLines.push(`+ ${l}`);
      }
    } else if (part.removed) {
      linesRemoved += lineCount;
      for (const l of part.value.split("\n").slice(0, 20 - changedLines.length)) {
        if (changedLines.length < 20) changedLines.push(`- ${l}`);
      }
    }
  }

  const totalLinesOld = filteredOld.split("\n").length;
  const totalLinesNew = filteredNew.split("\n").length;
  const totalChanged = linesAdded + linesRemoved;
  const baseline = Math.max(totalLinesOld, totalLinesNew, 1);
  const changeScore = (totalChanged / baseline) * 100;

  const summary = `${totalChanged} lines changed, ${linesAdded} added, ${linesRemoved} removed`;
  const diffPreview = changedLines.join("\n");

  return {
    linesAdded,
    linesRemoved,
    totalLinesOld,
    totalLinesNew,
    changeScore: Math.round(changeScore * 100) / 100,
    diffPreview,
    summary,
  };
}

export function resetNoiseFilters(): void {
  compiledFilters = null;
}
