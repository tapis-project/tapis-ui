export const upperCaseFirstLetter = (str: string) => {
  const lower = str.toLowerCase();
  return `${lower.slice(0, 1).toUpperCase()}${lower.slice(1)}`;
};

export const reduceRecord = (record: Record<'id', string>) => {
  const { id, ...contents } = record;
  return Object.values(contents).reduce(
    (prev, current) => ((prev as string) + current) as string,
    ''
  );
};
