import { useRef } from 'react';

export const useDebugCounter = (name: string) => {
  const count = useRef(0);
  console.log(`${name} update count`, count.current++);
};
