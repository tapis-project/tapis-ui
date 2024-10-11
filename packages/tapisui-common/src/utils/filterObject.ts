// Type that matches property values of type T if and only if the value of
// that property is a string or undefined
export type PropsOfObjectWithValuesOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

export type OrderBy = 'ASC' | 'DESC';

export const filterObjects = <T extends {}, U = unknown>(
  objects: Array<T>,
  groupBy: PropsOfObjectWithValuesOfType<T, U>,
  orderGroupBy: OrderBy = 'ASC'
): Array<[string, Array<T>]> => {
  let objectsByProp: { [key: string]: Array<T> } = {};
  for (let obj of objects) {
    // Cannot filter on values that are undefined.
    if (obj[groupBy] === undefined) {
      continue;
    }

    // Create groupBy key if it doesn't exist and add the object to an empty
    // array
    const key = obj[groupBy] as unknown as string;
    if (objectsByProp[key] === undefined) {
      objectsByProp[key] = [obj];
      continue;
    }

    objectsByProp[key] = [...objectsByProp[key], obj];
  }

  const filteredObjects = Object.entries(objectsByProp).sort((a, b) =>
    a[0].localeCompare(b[0])
  );
  return orderGroupBy === 'ASC' ? filteredObjects : filteredObjects.reverse();
};
