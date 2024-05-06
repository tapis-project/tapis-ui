import { useEffect, useState } from 'react';

type MouseCoordinates = {
  x: number | null
  y: number | null
}

const useMouseCoordiantes = () => {
  const [ mouseCoordiantes, setMouseCoordiantes ] = useState<MouseCoordinates>({
    x: null,
    y: null
  });
  
  useEffect(() => {
    const updateMouseCoordiantes = (e: MouseEvent) => {
      setMouseCoordiantes({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', updateMouseCoordiantes);
    return () => {
      window.removeEventListener('mousemove', updateMouseCoordiantes);
    };
  }, []);

  return mouseCoordiantes;
};
export default useMouseCoordiantes;