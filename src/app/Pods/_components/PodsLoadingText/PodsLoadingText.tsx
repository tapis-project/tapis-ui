import { useState, useEffect } from 'react';

const PodsLoadingText = (
  initialText = 'loading...',
  intervalDuration = 333
) => {
  const [loadingText, setLoadingText] = useState(initialText);
  // useEffect(() => {
  //   let loadingState = 0;
  //   const loadingStates = ['loading...', 'loading', 'loading.', 'loading..'];

  //   const interval = setInterval(() => {
  //     setLoadingText(loadingStates[loadingState]);
  //     loadingState = (loadingState + 1) % loadingStates.length;
  //   }, intervalDuration);

  //   return () => clearInterval(interval);
  // }, [intervalDuration]);

  return initialText; // "oadingText;
};

export default PodsLoadingText;
