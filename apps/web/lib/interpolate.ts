/**
 * Resolves {{key}} placeholders in `template` against `variables`. Unknown
 * keys are left as literal `{{key}}` text rather than blanked, so a
 * misconfigured reference is visible in the forwarded request instead of
 * silently producing an empty header/value.
 */
export function interpolateGlobalVariables(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (match, key: string) => {
    return Object.prototype.hasOwnProperty.call(variables, key) ? variables[key] : match;
  });
}
