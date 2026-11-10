export function flattenSearchParams(
  params: Record<string, string | string[] | undefined>
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      result[key] = value[0] ?? '';
    } else if (typeof value === 'string') {
      result[key] = value;
    }
  }

  return result;
}
