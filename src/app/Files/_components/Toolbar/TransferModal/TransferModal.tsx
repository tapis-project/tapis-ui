import React, { useCallback, useState, useEffect, useRef } from 'react';
import { GenericModal, Breadcrumbs } from '@tapis/tapisui-common';
import { breadcrumbsFromPathname } from '@tapis/tapisui-common';
import { FileListingTable } from '@tapis/tapisui-common';
import { FileExplorer } from '@tapis/tapisui-common';
import { ToolbarModalProps } from '../Toolbar';
import { useLocation } from 'react-router-dom';
import { Files } from '@tapis/tapis-typescript';
import styles from './TransferModal.module.scss';
import { useFilesSelect } from '../../FilesContext';
import { Tabs } from '@tapis/tapisui-common';
import {
  TransferListing,
  TransferDetails,
  TransferCreate,
  TransferCancel,
} from '@tapis/tapisui-common';
import { Files as Hooks } from '@tapis/tapisui-hooks';
import {
  Button,
  Input,
  FormGroup,
  Label,
  Alert,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';

const TransferModal: React.FC<ToolbarModalProps> = ({
  toggle,
  systemId = '',
  path = '/',
}) => {
  const { pathname } = useLocation();
  const [transfer, setTransfer] = useState<Files.TransferTask | null>(null);
  const { selectedFiles } = useFilesSelect();
  const [inputMode, setInputMode] = useState<'visual' | 'json' | 'smart'>(
    'visual'
  );

  // Visual mode state
  const [visualDestination, setVisualDestination] = useState<{
    systemId: string;
    path: string;
  }>({ systemId, path });

  // JSON mode state
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [jsonDestination, setJsonDestination] = useState<{
    systemId: string;
    path: string;
  }>({ systemId, path });

  // Smart input state
  const [smartInputValue, setSmartInputValue] = useState('');
  const [smartDestination, setSmartDestination] = useState<{
    systemId: string;
    path: string;
  }>({ systemId, path });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationTimeout, setNavigationTimeout] =
    useState<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { refetch } = Hooks.Transfers.useList({});
  const {
    create: createTransfer,
    isLoading: isCreatingTransfer,
    error: createError,
    isSuccess: createSuccess,
  } = Hooks.Transfers.useCreate();

  // Helper function to get parent path from input
  const getParentPath = (inputPath: string): string => {
    if (!inputPath || inputPath === '/') return '/';
    const parts = inputPath.split('/').filter(Boolean);
    if (parts.length === 0) return '/';
    return '/' + parts.slice(0, -1).join('/');
  };

  // Helper function to get current directory name from input
  const getCurrentDirName = (inputPath: string): string => {
    if (!inputPath || inputPath === '/') return '';
    const parts = inputPath.split('/').filter(Boolean);
    return parts[parts.length - 1] || '';
  };

  // Determine search path for file system data
  const getSearchPath = useCallback(() => {
    if (smartInputValue && smartInputValue !== '/') {
      if (smartInputValue.endsWith('/')) {
        return smartInputValue.slice(0, -1) || '/';
      }
      return getParentPath(smartInputValue) || '/';
    }
    return smartDestination.path || path;
  }, [smartInputValue, smartDestination.path, path]);

  // File system search for suggestions
  const { data: fileListData, isLoading: isSearching } = Hooks.useList({
    systemId: smartDestination.systemId || systemId,
    path: getSearchPath(),
  });

  // Generate suggestions based on file system data
  useEffect(() => {
    if (!fileListData?.pages?.[0]?.result) {
      setSuggestions([]);
      return;
    }

    const searchPath = getSearchPath();
    const files = fileListData.pages[0].result;
    let directories = files.filter(
      (file: Files.FileInfo) => file.type === Files.FileTypeEnum.Dir
    );

    // Filter directories based on what user is typing
    if (
      smartInputValue &&
      smartInputValue !== '/' &&
      !smartInputValue.endsWith('/')
    ) {
      const currentDirName = getCurrentDirName(smartInputValue);
      if (currentDirName) {
        // Filter directories that start with what the user is typing
        directories = directories.filter(
          (file: Files.FileInfo) =>
            file.name &&
            file.name.toLowerCase().startsWith(currentDirName.toLowerCase())
        );
      }
    }

    // Build full paths for all directories (for navigation)
    const dirPaths = directories
      .map((file: Files.FileInfo) => {
        // Build the full path from search directory
        if (searchPath === '/') {
          return `/${file.name}`;
        }
        return `${searchPath}/${file.name}`.replace('//', '/');
      })
      .slice(0, 15); // Show more options for better navigation

    setSuggestions(dirPaths);
  }, [fileListData, getSearchPath, smartInputValue]);

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000);
    return () => clearInterval(interval);
  }, [refetch]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (navigationTimeout) {
        clearTimeout(navigationTimeout);
      }
    };
  }, [navigationTimeout]);

  // JSON validation and submission
  const validateJson = useCallback((jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) {
        return 'JSON must be an array of transfer objects';
      }
      if (parsed.length === 0) {
        return 'Array cannot be empty';
      }
      for (const element of parsed) {
        if (!element.sourceURI || !element.destinationURI) {
          return 'Each object must have sourceURI and destinationURI';
        }
      }
      return null;
    } catch (error) {
      return 'Invalid JSON format';
    }
  }, []);

  const handleJsonSubmit = useCallback(() => {
    const error = validateJson(jsonInput);
    if (error) {
      setJsonError(error);
      return;
    }
    setJsonError(null);
    const parsed = JSON.parse(jsonInput);
    // Wrap the array in the elements structure that the API expects
    createTransfer({ reqTransfer: { elements: parsed } });
  }, [jsonInput, validateJson, createTransfer]);

  // Initialize smart input when switching to smart mode
  useEffect(() => {
    if (inputMode === 'smart' && !smartInputValue) {
      setSmartInputValue('/');
      setShowSuggestions(true);
    }
  }, [inputMode, smartInputValue]);

  // Initialize destinations when modal opens
  useEffect(() => {
    setVisualDestination({ systemId, path });
    setJsonDestination({ systemId, path });
    setSmartDestination({ systemId, path });
  }, [systemId, path]);

  // Auto-switch modes based on file selection (only on initial load)
  useEffect(() => {
    if (selectedFiles.length === 0 && inputMode === 'visual') {
      // Switch to JSON mode when no files are selected and in visual mode
      setInputMode('json');
    }
  }, [selectedFiles.length]); // Only depend on selectedFiles.length, not inputMode or jsonInput

  // Auto-populate JSON when switching to JSON mode (only if files are selected and JSON is empty)
  useEffect(() => {
    if (inputMode === 'json' && selectedFiles.length > 0 && !jsonInput.trim()) {
      const elements: Array<Files.ReqTransferElement> = selectedFiles.map(
        (file) => ({
          sourceURI: `tapis://${systemId}/${file.path}`.replace(/\/\//g, '/'),
          destinationURI:
            `tapis://DESTINATION_SYSTEM/DESTINATION_PATH/${file.name}`.replace(
              /\/\//g,
              '/'
            ),
        })
      );
      setJsonInput(JSON.stringify(elements, null, 2));
    }
  }, [inputMode, selectedFiles, systemId, jsonInput]);

  const onNavigate = useCallback(
    (systemId: string | null, path: string | null) => {
      if (!!systemId && !!path) {
        // Update the appropriate destination based on current mode
        if (inputMode === 'visual') {
          setVisualDestination({ systemId, path });
        } else if (inputMode === 'json') {
          setJsonDestination({ systemId, path });
        } else if (inputMode === 'smart') {
          setSmartDestination({ systemId, path });
        }
      }
    },
    [inputMode]
  );

  // Auto-resize textarea
  const autoResizeTextarea = useCallback((textarea: HTMLTextAreaElement) => {
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.max(38, textarea.scrollHeight) + 'px';
    }
  }, []);

  // Auto-resize textarea when value changes
  useEffect(() => {
    if (textareaRef.current) {
      autoResizeTextarea(textareaRef.current);
    }
  }, [smartInputValue, autoResizeTextarea]);

  // Smart input handlers
  const handleSmartInputChange = useCallback(
    (value: string) => {
      setSmartInputValue(value);
      setShowSuggestions(value.length > 0);

      // Clear existing timeout
      if (navigationTimeout) {
        clearTimeout(navigationTimeout);
      }

      // Debounced navigation - only navigate when user stops typing
      if (value && !isNavigating) {
        const timeout = setTimeout(() => {
          const parentPath = getParentPath(value);
          if (parentPath !== smartDestination.path) {
            setIsNavigating(true);
            onNavigate(smartDestination.systemId || systemId, parentPath);
            setTimeout(() => setIsNavigating(false), 200);
          }
        }, 300); // Wait 300ms after user stops typing
        setNavigationTimeout(timeout);
      }
    },
    [
      smartDestination.systemId,
      smartDestination.path,
      systemId,
      onNavigate,
      isNavigating,
      navigationTimeout,
    ]
  );

  const handleSuggestionSelect = useCallback(
    (suggestion: string) => {
      // Automatically add '/' to show subdirectories
      const pathWithSlash = suggestion.endsWith('/')
        ? suggestion
        : `${suggestion}/`;
      setSmartInputValue(pathWithSlash);

      // Navigate tree to selected suggestion
      onNavigate(smartDestination.systemId || systemId, suggestion);
    },
    [smartDestination.systemId, systemId, onNavigate]
  );

  const handleSmartInputKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && suggestions.length > 0) {
        e.preventDefault();
        handleSuggestionSelect(suggestions[0]);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    },
    [suggestions, handleSuggestionSelect]
  );

  const onSelect = useCallback(
    (transfer: Files.TransferTask) => {
      setTransfer(transfer);
    },
    [setTransfer]
  );

  const createTransferTab = (
    <div className={`row h-100 ${styles.pane}`}>
      <div className="col-md-6 d-flex flex-column">
        {/* Table of selected files */}
        <div className={`${styles['col-header']}`}>
          {selectedFiles.length > 0
            ? `Transfering ${selectedFiles.length} files`
            : 'No files selected - Use JSON mode to paste your transfer data'}
        </div>
        <div className="p-3">
          <Breadcrumbs
            breadcrumbs={[
              ...breadcrumbsFromPathname(pathname)
                .splice(1)
                .map((fragment) => ({ text: fragment.text })),
            ]}
          />
          <div className={styles['nav-list']}>
            {selectedFiles.length > 0 ? (
              <FileListingTable
                files={selectedFiles}
                className={`${styles['file-list-origin']} `}
                fields={['size']}
              />
            ) : (
              <div className="text-center text-muted p-4">
                <p>No files selected</p>
                <small>
                  Select files from the file system or use JSON mode to paste
                  your transfer data
                </small>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="col-md-6 d-flex flex-column">
        {/* Input mode selector */}
        <div
          className={`${styles['col-header']} d-flex justify-content-between align-items-center`}
        >
          <span>Destination</span>
          <div className="btn-group" role="group">
            <Button
              size="sm"
              color={inputMode === 'visual' ? 'primary' : 'outline-primary'}
              onClick={() => setInputMode('visual')}
              disabled={selectedFiles.length === 0}
              title={
                selectedFiles.length === 0
                  ? 'Select files first to use Visual mode'
                  : ''
              }
            >
              Visual
            </Button>
            <Button
              size="sm"
              color={inputMode === 'json' ? 'primary' : 'outline-primary'}
              onClick={() => setInputMode('json')}
            >
              JSON
            </Button>
            <Button
              size="sm"
              color={inputMode === 'smart' ? 'primary' : 'outline-primary'}
              onClick={() => setInputMode('smart')}
              disabled={selectedFiles.length === 0}
              title={
                selectedFiles.length === 0
                  ? 'Select files first to use Smart Input mode'
                  : ''
              }
            >
              Smart Input
            </Button>
          </div>
        </div>

        {/* Visual mode - File Explorer */}
        {inputMode === 'visual' && (
          <div className="p-3">
            <FileExplorer
              systemId={visualDestination.systemId || systemId}
              path={visualDestination.path || path}
              onNavigate={onNavigate}
              fields={['size']}
              className={styles['file-list']}
              allowSystemChange
            />
            <TransferCreate
              sourceSystemId={systemId}
              destinationSystemId={visualDestination?.systemId ?? ''}
              destinationPath={visualDestination?.path ?? ''}
              files={selectedFiles}
            />
          </div>
        )}

        {/* Smart input mode */}
        {inputMode === 'smart' && (
          <div className="p-3">
            <FormGroup>
              <Label for="smartInput">Smart Path Input</Label>
              <div className="position-relative">
                <textarea
                  ref={textareaRef}
                  id="smartInput"
                  value={smartInputValue}
                  onChange={(e) => {
                    handleSmartInputChange(e.target.value);
                    autoResizeTextarea(e.target);
                  }}
                  onKeyDown={handleSmartInputKeyDown}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() =>
                    setTimeout(() => setShowSuggestions(false), 100)
                  }
                  placeholder="/"
                  className="form-control mb-2"
                  style={{
                    resize: 'vertical',
                    minHeight: '38px',
                    overflow: 'hidden',
                  }}
                  rows={1}
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div
                    className="position-absolute w-100"
                    style={{ zIndex: 1000, top: '100%' }}
                  >
                    <div
                      className="list-group border rounded shadow"
                      style={{ maxHeight: '300px', overflowY: 'auto' }}
                    >
                      <div
                        className="list-group-item bg-light text-muted"
                        style={{ fontSize: '0.8rem', fontWeight: 'bold' }}
                      >
                        📁 Available Directories (click to navigate)
                      </div>
                      {suggestions.map((suggestion, index) => {
                        // Extract just the directory name from the full path
                        const dirName =
                          suggestion.split('/').pop() || suggestion;
                        return (
                          <button
                            key={index}
                            type="button"
                            className="list-group-item list-group-item-action text-left d-flex align-items-center"
                            onClick={() => handleSuggestionSelect(suggestion)}
                            onMouseDown={(e) => e.preventDefault()}
                            style={{ fontSize: '0.9rem', padding: '8px 12px' }}
                          >
                            <span className="me-2">📁</span>
                            <span className="flex-grow-1">{dirName}</span>
                            <small className="text-muted">
                              Click to navigate
                            </small>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {isSearching && (
                  <small className="text-muted">
                    <i className="fa fa-spinner fa-spin"></i> Searching...
                  </small>
                )}
              </div>
              <small className="text-muted">
                Click directories to navigate or type to search. The tree will
                navigate as you type.
              </small>
            </FormGroup>
            <FormGroup>
              <Label for="smartDestinationSystem">Destination System</Label>
              <Input
                type="text"
                id="smartDestinationSystem"
                value={smartDestination?.systemId || ''}
                onChange={(e) =>
                  setSmartDestination((prev) => ({
                    ...prev,
                    systemId: e.target.value,
                  }))
                }
                placeholder="Enter system ID"
                className="mb-2"
              />
            </FormGroup>
            {createError && (
              <Alert color="danger" className="mb-2">
                Error: {createError.message}
              </Alert>
            )}
            {createSuccess && (
              <Alert color="success" className="mb-2">
                Transfer submitted successfully!
              </Alert>
            )}
            <Button
              color="primary"
              onClick={() => {
                // Use the path without trailing slash for transfer
                const transferPath = smartInputValue.endsWith('/')
                  ? smartInputValue.slice(0, -1)
                  : smartInputValue;

                // Create transfer directly
                const destinationURI =
                  `tapis://${smartDestination.systemId}/${transferPath}`.replace(
                    /\/\//g,
                    '/'
                  );
                const elements: Array<Files.ReqTransferElement> =
                  selectedFiles.map((file) => ({
                    destinationURI: `${destinationURI}/${file.name}`,
                    sourceURI: `tapis://${systemId}/${file.path}`.replace(
                      /\/\//g,
                      '/'
                    ),
                  }));
                createTransfer({ reqTransfer: { elements } });
              }}
              disabled={
                isCreatingTransfer ||
                !smartInputValue.trim() ||
                !smartDestination?.systemId
              }
            >
              {isCreatingTransfer ? 'Submitting...' : 'Submit Transfer'}
            </Button>
          </div>
        )}

        {/* JSON input mode */}
        {inputMode === 'json' && (
          <div className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <Label for="jsonInput">Transfer Request JSON</Label>
            </div>
            <Alert color="info" className="mb-2">
              <small>
                <strong>Note:</strong>{' '}
                {selectedFiles.length > 0
                  ? 'Source URIs are auto-populated from selected files. You only need to specify the destination URIs for each file.'
                  : 'Paste your transfer JSON directly, or select files first to auto-populate source URIs.'}
              </small>
            </Alert>

            {/* Destination input */}
            <FormGroup>
              <Label for="destinationSystem">Destination System</Label>
              <Input
                type="text"
                id="destinationSystem"
                value={jsonDestination?.systemId || ''}
                onChange={(e) =>
                  setJsonDestination((prev) => ({
                    ...prev,
                    systemId: e.target.value,
                  }))
                }
                placeholder="Enter system ID"
                className="mb-2"
              />
            </FormGroup>
            <FormGroup>
              <Label for="destinationPath">Destination Path</Label>
              <div className="d-flex gap-2">
                <Input
                  type="text"
                  id="destinationPath"
                  value={jsonDestination?.path || ''}
                  onChange={(e) =>
                    setJsonDestination((prev) => ({
                      ...prev,
                      path: e.target.value,
                    }))
                  }
                  placeholder="destination/path"
                  className="mb-2"
                  style={{ flex: 1 }}
                />
                <Button
                  size="sm"
                  color="outline-primary"
                  className="mb-2"
                  onClick={() => {
                    if (jsonDestination.systemId && jsonDestination.path) {
                      const updatedJson = JSON.parse(jsonInput);
                      const updatedElements = updatedJson.map(
                        (element: any) => ({
                          ...element,
                          destinationURI: `tapis://${
                            jsonDestination.systemId
                          }/${jsonDestination.path}/${element.sourceURI
                            .split('/')
                            .pop()}`.replace(/\/\//g, '/'),
                        })
                      );
                      setJsonInput(JSON.stringify(updatedElements, null, 2));
                    }
                  }}
                  disabled={
                    !jsonDestination.systemId ||
                    !jsonDestination.path ||
                    !jsonInput.trim()
                  }
                >
                  Apply to All
                </Button>
              </div>
              <small className="text-muted">
                Set destination and click "Apply to All" to update all
                destination URIs, or edit individual destinations in the JSON
                below.
              </small>
            </FormGroup>

            <FormGroup>
              <Input
                type="textarea"
                id="jsonInput"
                value={jsonInput}
                onChange={(e) => {
                  setJsonInput(e.target.value);
                  setJsonError(null);
                }}
                placeholder={`[
  {
    "sourceURI": "tapis://${systemId}/path/to/source/file",
    "destinationURI": "tapis://DESTINATION_SYSTEM/DESTINATION_PATH/destination-file"
  }
]`}
                rows={12}
                className="mb-2"
                style={{ fontFamily: 'monospace' }}
              />
            </FormGroup>
            {jsonError && (
              <Alert color="danger" className="mb-2">
                {jsonError}
              </Alert>
            )}
            {createError && (
              <Alert color="danger" className="mb-2">
                Error: {createError.message}
              </Alert>
            )}
            {createSuccess && (
              <Alert color="success" className="mb-2">
                Transfer submitted successfully!
              </Alert>
            )}
            <Button
              color="primary"
              onClick={handleJsonSubmit}
              disabled={isCreatingTransfer || !jsonInput.trim()}
            >
              {isCreatingTransfer ? 'Submitting...' : 'Submit JSON Transfer'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  const listTransfersTab = (
    <div className={`row h-100 ${styles.pane}`}>
      <div className="col-md-6 d-flex flex-column">
        <div className={`${styles['nav-list']} ${styles['transfer-list']}`}>
          <TransferListing onSelect={onSelect} />
        </div>
      </div>
      <div className="col-md-6 d-flex flex-column">
        <div>
          {transfer ? (
            <div>
              <TransferDetails
                transferTaskId={transfer?.uuid!}
                className={styles['transfer-detail']}
              />
              <TransferCancel
                transferTaskId={transfer?.uuid!}
                className={styles['transfer-cancel']}
              />
            </div>
          ) : (
            <i>Select a file transfer to view details</i>
          )}
        </div>
      </div>
    </div>
  );

  const tabs: { [name: string]: React.ReactNode } = {};
  // Always show Start a Transfer tab - users can use JSON mode without selecting files
  tabs['Start a Transfer'] = createTransferTab;
  tabs['Recent Transfers'] = listTransfersTab;

  const body = <Tabs tabs={tabs} className={styles.body} />;

  return (
    <GenericModal
      toggle={toggle}
      title="Transfer Files"
      size="xl"
      body={body}
    />
  );
};

export default TransferModal;
