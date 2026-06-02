export function truncateText(value: string | null | undefined, maxLength = 120) {
  const trimmedValue = value?.trim() ?? '';

  if (trimmedValue.length <= maxLength) return trimmedValue;

  return `${trimmedValue.slice(0, maxLength).trimEnd()}...`;
}
