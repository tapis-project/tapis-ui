import AppAttributes from './AppAttributes';
import JobAttributes from './JobAttributes';
import TagsSettings from './TagsSettings';

type AdvancedSettingsProp = {
  simplified: boolean;
};

const AdvancedSettings: React.FC<AdvancedSettingsProp> = ({ simplified }) => {
  if (simplified) {
    return (
      <div>
        <hr />
        <AppAttributes />
        <hr />
        <JobAttributes />
        <hr />
        <TagsSettings />
      </div>
    );
  } else {
    return null;
  }
};

export default AdvancedSettings;
