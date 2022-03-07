import renderComponent from 'utils/testing';
import UploadModal from './UploadModal';

describe('UploadModal', () => {
  it('renders the upload modal', async () => {
    renderComponent(
      <UploadModal toggle={() => {}} systemId={'system-id'} path={'/'} />
    );
  });
  it.todo('uploads files');
});
