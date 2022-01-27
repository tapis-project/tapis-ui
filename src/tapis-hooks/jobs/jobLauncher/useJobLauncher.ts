import { RootState } from './store';
import { useSelector } from 'react-redux';

const useJobLauncher = () => useSelector((state: RootState) => state.job.job);

export default useJobLauncher;