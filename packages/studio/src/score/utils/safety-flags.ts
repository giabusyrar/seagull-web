/**
 * The safety flags (customer-condition codes) a ruleset's linked survey can
 * raise: every key of a choice's condition map, across all pages and
 * elements. With a survey code only that survey counts; without one, every
 * survey listed for the tenant does.
 *
 * Maps are stored as `condition_map` (snake_case, matching the Go/JSON survey
 * schema); `conditionMap` is also read in case a future schema writer uses
 * the camelCase form. A survey whose schema does not parse is skipped. A
 * response that is not a list yields no flags.
 */
export function safetyFlagsFromSurveys(surveys: unknown, surveyCode?: string): string[] {
  if (!Array.isArray(surveys)) return [];
  const rows = surveys as { code?: string; schema?: string }[];
  const selected = surveyCode ? rows.filter((s) => s.code === surveyCode) : rows;
  const flags = new Set<string>();
  for (const survey of selected) {
    if (!survey.schema) continue;
    try {
      const parsed = JSON.parse(survey.schema);
      for (const page of parsed.pages || []) {
        for (const el of page.elements || []) {
          for (const choice of el.choices || []) {
            const conditionMap = typeof choice === 'object' ? choice.condition_map || choice.conditionMap : null;
            if (conditionMap) Object.keys(conditionMap).forEach((k) => flags.add(k));
          }
        }
      }
    } catch {
      // skip surveys with unparsable schema
    }
  }
  return Array.from(flags);
}
