import renderComponent from 'testing/utils';
import UploadModal from './UploadModal';

describe('UploadModal', () => {
  it('renders the upload modal', async () => {
    renderComponent(
      <UploadModal toggle={() => {}} systemId={'system-id'} path={'/'} />
    );
  });
  it.todo('uploads files');
});
