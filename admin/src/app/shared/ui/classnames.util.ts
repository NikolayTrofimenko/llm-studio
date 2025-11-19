export function compactClassNames(
  classNames: ReadonlyArray<string | null | undefined | false>,
): string[] {
  return classNames.filter(
    (className): className is string =>
      typeof className === 'string' && className.length > 0,
  );
}

