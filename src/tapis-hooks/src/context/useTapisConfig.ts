import { useContext } from 'react';
import TapisContext from './TapisContext';

const useTapisConfig = () => useContext(TapisContext);

export default useTapisConfig;