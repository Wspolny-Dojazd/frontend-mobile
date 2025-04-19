export const timeIt = <T>(fn: () => T): T => {
  const start = Date.now();
  const result = fn();
  const end = Date.now();
  console.log(`${fn.name} took ${end - start}ms`);
  return result;
};
