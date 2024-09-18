import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { useRouteMatch } from 'react-router-dom';
import { Pods as Hooks } from '@tapis/tapisui-hooks';
import { Navbar, NavItem } from '@tapis/tapisui-common';
import PodsLoadingText from '../PodsLoadingText';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { TreeViewBaseItem } from '@mui/x-tree-view/models';
import {
  unstable_useTreeItem2 as useTreeItem2,
  UseTreeItem2Parameters,
} from '@mui/x-tree-view/useTreeItem2';
import {
  TreeItem2Content,
  TreeItem2IconContainer,
  TreeItem2GroupTransition,
  TreeItem2Label,
  TreeItem2Root,
  TreeItem2Checkbox,
} from '@mui/x-tree-view/TreeItem2';
import { TreeItem2Icon } from '@mui/x-tree-view/TreeItem2Icon';
import { TreeItem2Provider } from '@mui/x-tree-view/TreeItem2Provider';
import { TreeItem2DragAndDropOverlay } from '@mui/x-tree-view/TreeItem2DragAndDropOverlay';
import FolderRounded from '@mui/icons-material/FolderRounded';
import ImageIcon from '@mui/icons-material/Image';
import ArticleIcon from '@mui/icons-material/Article';
import styles from '../Pages.module.scss';
import { format, formatDistanceToNow } from 'date-fns';

const CustomTreeItemContent = styled(TreeItem2Content)(({ theme }) => ({
  padding: theme.spacing(0.5, 1),
}));

interface CustomTreeItemProps
  extends Omit<UseTreeItem2Parameters, 'rootRef'>,
    Omit<React.HTMLAttributes<HTMLLIElement>, 'onFocus'> {}

const getIconByLevel = (level: number) => {
  switch (level) {
    case 1:
      return FolderRounded;
    case 2:
      return ImageIcon;
    case 3:
      return ArticleIcon;
    default:
      return ArticleIcon;
  }
};

const CustomTreeItem = React.forwardRef(function CustomTreeItem(
  props: CustomTreeItemProps,
  ref: React.Ref<HTMLLIElement>
) {
  const { id, itemId, label, disabled, children, ...other } = props;

  const {
    getRootProps,
    getContentProps,
    getIconContainerProps,
    getCheckboxProps,
    getLabelProps,
    getGroupTransitionProps,
    getDragAndDropOverlayProps,
    status,
  } = useTreeItem2({ id, itemId, children, label, disabled, rootRef: ref });

  const level = itemId.split('-').length;
  const Icon = getIconByLevel(level);

  return (
    <TreeItem2Provider itemId={itemId}>
      <TreeItem2Root {...getRootProps(other)}>
        <CustomTreeItemContent {...getContentProps()}>
          <TreeItem2IconContainer
            {...getIconContainerProps()}
            className={styles.secondaryText}
          >
            <Icon />
          </TreeItem2IconContainer>
          <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
            <TreeItem2Checkbox
              {...getCheckboxProps()}
              className={styles.secondaryText}
            />
            <TreeItem2Label
              {...getLabelProps()}
              className={styles.secondaryText}
            />
          </Box>
          <TreeItem2DragAndDropOverlay {...getDragAndDropOverlayProps()} />
        </CustomTreeItemContent>
        {children && (
          <TreeItem2GroupTransition {...getGroupTransitionProps()} />
        )}
      </TreeItem2Root>
    </TreeItem2Provider>
  );
});

const NavTemplates: React.FC = () => {
  const { url } = useRouteMatch();
  const { data, isLoading, error } = Hooks.useListTemplatesAndTags({
    full: true,
  });
  const definitions = data?.result || {};
  const loadingText = PodsLoadingText();
  const history = useHistory();

  const handleItemClick = (event: React.MouseEvent, itemId: string) => {
    const parts = itemId.split('-');
    const templateId = parts[0];
    let redirectUrl = `/pods/templates/${templateId}`;

    if (parts.length === 2) {
      redirectUrl += `/tags/${parts[1]}`;
    } else if (parts.length >= 3) {
      const prefix = parts[1];
      const timestamp = parts.slice(2).join('-');
      redirectUrl += `/tags/${prefix}@${timestamp}`;
    }

    history.push(redirectUrl);
  };

  if (isLoading) {
    return (
      <Navbar>
        <div style={{ paddingLeft: '16px' }}>
          <NavItem icon="visualization">{loadingText}</NavItem>
        </div>
      </Navbar>
    );
  }
  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 120) {
      return `${diffInSeconds} secs`;
    } else if (diffInSeconds < 2 * 24 * 60 * 60) {
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      return `${diffInMinutes} mins`;
    } else {
      const diffInDays = Math.floor(diffInSeconds / (24 * 60 * 60));
      return `${diffInDays} days`;
    }
  };

  const items: TreeViewBaseItem[] = Object.keys(definitions).map(
    (templateId) => {
      const tags = definitions[templateId].tags || [];
      const groupedTags: { [key: string]: TreeViewBaseItem[] } = {};

      tags.forEach((tag: any) => {
        const [prefix, timestamp] = tag.tag_timestamp.split('@');
        const formattedTimestamp = format(new Date(timestamp), 'yyyy/MM/dd'); // H:mm:ss
        const timeAgo = formatTimeAgo(timestamp);

        if (!groupedTags[prefix]) {
          groupedTags[prefix] = [];
        }
        groupedTags[prefix].push({
          id: `${templateId}-${prefix}-${timestamp}`,
          label: `${formattedTimestamp} | ${timeAgo}`,
        });
      });

      const children = Object.keys(groupedTags).map((prefix) => ({
        id: `${templateId}-${prefix}`,
        label: prefix,
        children: groupedTags[prefix],
      }));

      return {
        id: templateId,
        label: templateId,
        children,
      };
    }
  );

  return (
    <Navbar>
      <Box sx={{ minHeight: 200, minWidth: 250 }}>
        <RichTreeView
          defaultExpandedItems={[]}
          itemChildrenIndentation={'.75rem'}
          items={items}
          slots={{ item: CustomTreeItem }}
          onItemClick={handleItemClick}
        />
      </Box>
    </Navbar>
  );
};

export default NavTemplates;
