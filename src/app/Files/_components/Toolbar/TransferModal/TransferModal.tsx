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
  const [jsonTag, setJsonTag] = useState('');
  const [jsonDestination, setJsonDestination] = useState<{
    systemId: string;
    path: string;
  }>({ systemId, path });

  // Smart input state
  const [smartInputValue, setSmartInputValue] = useState('');
  const [smartTag, setSmartTag] = useState('');
  const [smartDestination, setSmartDestination] = useState<{
    systemId: string;
    path: string;
  }>({ systemId, path });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  // Use refs for debounce/unset timers to avoid re-renders/races
  const navRef = useRef<number | null>(null);
  const unsetNavRef = useRef<number | null>(null);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [smartInputError, setSmartInputError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Alert visibility state
  const [showInfoAlert, setShowInfoAlert] = useState(true);
  const [showWarningAlert, setShowWarningAlert] = useState(true);

  // Smart input path validation
  const validateSmartPath = useCallback((path: string): string | null => {
    if (!path || path === '/') return null; // Allow root path

    // Check for spaces
    if (path.includes(' ')) {
      return 'Path cannot contain spaces';
    }

    // Check for double slashes (except tapis:// protocol)
    if (path.includes('//')) {
      return 'Path cannot contain double slashes';
    }

    // Check for relative path segments
    if (path.includes('./') || path.includes('../')) {
      return 'Path cannot contain relative segments (./ or ../)';
    }

    // Ensure path starts with /
    if (!path.startsWith('/')) {
      return 'Path must start with /';
    }

    // Check for invalid characters (basic check)
    if (!/^[\/\w\-_.]+$/.test(path)) {
      return 'Path contains invalid characters';
    }

    return null;
  }, []);

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
  const { data: fileListData, isLoading: isSearching } = Hooks.useList(
    {
      systemId: smartDestination.systemId || systemId,
      path: getSearchPath(),
    },
    { enabled: showSuggestions && !smartInputError }
  );

  // Generate suggestions based on file system data
  useEffect(() => {
    if (!fileListData?.pages?.[0]?.result) {
      setSuggestions([]);
      return;
    }

    const searchPath = getSearchPath();
    const files = fileListData.pages[0].result;

    // Only show directories, never files
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
    const dirPaths = directories.map((file: Files.FileInfo) => {
      // Build the full path from search directory
      if (searchPath === '/') {
        return `/${file.name}`;
      }
      return `${searchPath}/${file.name}`.replace('//', '/');
    });

    setSuggestions(dirPaths);
  }, [fileListData, getSearchPath, smartInputValue]);

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000);
    return () => clearInterval(interval);
  }, [refetch]);

  // Enhanced JSON validation
  const validateJson = useCallback((jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) {
        return 'JSON must be an array of transfer objects';
      }
      if (parsed.length === 0) {
        return 'Array cannot be empty';
      }

      for (let i = 0; i < parsed.length; i++) {
        const element = parsed[i];

        // Check if element is an object
        if (typeof element !== 'object' || element === null) {
          return `Element ${i + 1} must be an object`;
        }

        // Check required fields exist and are strings
        if (!element.sourceURI || typeof element.sourceURI !== 'string') {
          return `Element ${i + 1} must have a valid sourceURI string`;
        }
        if (
          !element.destinationURI ||
          typeof element.destinationURI !== 'string'
        ) {
          return `Element ${i + 1} must have a valid destinationURI string`;
        }

        // Trim inputs and validate URI format
        const tapisRe = /^tapis:\/\/([^\s/]+)\/([^\s]+)$/; // group1=systemId, group2=path
        const httpRe = /^https?:\/\/[^\s]+$/; // HTTP/HTTPS URL validation
        const src = element.sourceURI.trim();
        const dst = element.destinationURI.trim();

        // Validate sourceURI - can be either Tapis URI or HTTP/HTTPS URL
        const srcTapisMatch = src.match(tapisRe);
        const srcHttpMatch = src.match(httpRe);
        if (!srcTapisMatch && !srcHttpMatch) {
          return `Element ${
            i + 1
          } sourceURI must be either tapis://systemId/path or http(s)://url`;
        }

        // Validate destinationURI - must be Tapis URI
        const dm = dst.match(tapisRe);
        if (!dm) {
          return `Element ${
            i + 1
          } destinationURI must be tapis://systemId/path`;
        }

        const srcPath = srcTapisMatch ? srcTapisMatch[2] : '';
        const dstPath = dm[2];

        // Check for placeholders and empty paths
        if (/DESTINATION_(SYSTEM|PATH)/.test(dst)) {
          return `Element ${i + 1} destinationURI still has placeholders`;
        }
        // For Tapis URIs, check that path is non-empty. For HTTP/HTTPS URLs, path validation is not applicable
        if (srcTapisMatch && srcPath === '') {
          return `Element ${i + 1} Tapis sourceURI path must be non-empty`;
        }
        if (dstPath === '') {
          return `Element ${i + 1} destinationURI path must be non-empty`;
        }

        // Check for identical source and destination
        if (src === dst) {
          return `Element ${
            i + 1
          } source and destination URIs cannot be identical`;
        }

        // Check for empty path segments (double slashes) - only for Tapis URIs
        if (srcTapisMatch && srcPath.includes('//')) {
          return `Element ${
            i + 1
          } Tapis sourceURI contains empty path segments (double slashes)`;
        }
        if (dstPath.includes('//')) {
          return `Element ${
            i + 1
          } destinationURI contains empty path segments (double slashes)`;
        }
      }

      // Check for duplicate destinations
      const destinationURIs = parsed.map((element: any) =>
        element.destinationURI.trim()
      );
      const uniqueDestinations = new Set(destinationURIs);
      if (destinationURIs.length !== uniqueDestinations.size) {
        return 'Duplicate destination URIs found. Each transfer must have a unique destination.';
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

    let parsed = JSON.parse(jsonInput);

    // Auto-apply destination if fields are filled but not applied
    if (jsonDestination.systemId && jsonDestination.path) {
      const hasPlaceholderDestinations = parsed.some(
        (element: any) =>
          element.destinationURI.includes('DESTINATION_SYSTEM') ||
          element.destinationURI.includes('DESTINATION_PATH')
      );

      if (hasPlaceholderDestinations) {
        parsed = parsed.map((element: any) => {
          const sourceParts = element.sourceURI.split('/').filter(Boolean);
          const basename = sourceParts[sourceParts.length - 1] ?? '';

          return {
            ...element,
            destinationURI:
              `tapis://${jsonDestination.systemId}/${jsonDestination.path}/${basename}`.replace(
                /(?<!:)\/\/+/g,
                '/'
              ),
          };
        });
        setJsonInput(JSON.stringify(parsed, null, 2));
      }
    }

    // Wrap the array in the elements structure that the API expects
    const tagName = jsonTag.trim().length > 0 ? jsonTag.trim() : undefined;
    const requestData = { reqTransfer: { elements: parsed, tag: tagName } };
    createTransfer(requestData);
  }, [jsonInput, jsonTag, jsonDestination, validateJson, createTransfer]);

  // Initialize smart input when switching to smart mode
  useEffect(() => {
    if (inputMode === 'smart' && !smartInputValue) {
      setSmartInputValue('/');
      setShowSuggestions(true); // Show suggestions by default
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

  // Auto-populate JSON when switching to JSON mode
  useEffect(() => {
    if (inputMode === 'json' && !jsonInput.trim()) {
      if (selectedFiles.length > 0) {
        // If files are selected, populate with selected files
        const elements: Array<Files.ReqTransferElement> = selectedFiles.map(
          (file) => ({
            sourceURI: `tapis://${systemId}/${file.path}`.replace(
              /(?<!:)\/\/+/g,
              '/'
            ),
            destinationURI:
              `tapis://DESTINATION_SYSTEM/DESTINATION_PATH/${file.name}`.replace(
                /(?<!:)\/\/+/g,
                '/'
              ),
          })
        );
        setJsonInput(JSON.stringify(elements, null, 2));
      } else {
        // If no files selected, provide default example with 2 elements
        const defaultElements: Array<Files.ReqTransferElement> = [
          {
            sourceURI: `tapis://${systemId}/path/to/source/file1.txt`,
            destinationURI:
              'tapis://DESTINATION_SYSTEM/DESTINATION_PATH/destination-file1.txt',
          },
          {
            sourceURI: 'https://example.com/data/results.csv',
            destinationURI:
              'tapis://DESTINATION_SYSTEM/DESTINATION_PATH/results.csv',
          },
        ];
        setJsonInput(JSON.stringify(defaultElements, null, 2));
      }
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
      setShowSuggestions(true); // Always show suggestions when typing
      setActiveSuggestionIndex(-1); // Reset active index when typing

      // Validate path
      const validationError = validateSmartPath(value);
      setSmartInputError(validationError);

      // Clear existing debounce timeout
      if (navRef.current) {
        clearTimeout(navRef.current);
        navRef.current = null;
      }

      // Debounced navigation - only navigate when user stops typing, path is valid, and not already searching
      if (value && !validationError && !isSearching) {
        navRef.current = window.setTimeout(() => {
          const parentPath = getParentPath(value);
          // Use current systemId to prevent drift
          const currentSystemId = smartDestination.systemId || systemId;
          if (parentPath !== smartDestination.path) {
            onNavigate(currentSystemId, parentPath);
            // Tie unset to this run to avoid races
            if (unsetNavRef.current) {
              clearTimeout(unsetNavRef.current);
            }
            unsetNavRef.current = window.setTimeout(() => {
              unsetNavRef.current = null;
            }, 200);
          }
        }, 300); // Wait 300ms after user stops typing
      }
    },
    [
      smartDestination.systemId,
      smartDestination.path,
      systemId,
      onNavigate,
      isSearching,
      validateSmartPath,
    ]
  );

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (navRef.current) {
        clearTimeout(navRef.current);
        navRef.current = null;
      }
      if (unsetNavRef.current) {
        clearTimeout(unsetNavRef.current);
        unsetNavRef.current = null;
      }
    };
  }, []);

  const handleSuggestionSelect = useCallback(
    (suggestion: string) => {
      // Navigate tree to selected suggestion first (without trailing slash)
      const cleanSuggestion = suggestion.endsWith('/')
        ? suggestion.slice(0, -1)
        : suggestion;
      onNavigate(smartDestination.systemId || systemId, cleanSuggestion);

      // Then set input value with trailing slash for consistency
      const pathWithSlash = `${cleanSuggestion}/`;
      setSmartInputValue(pathWithSlash);

      setActiveSuggestionIndex(-1);
    },
    [smartDestination.systemId, systemId, onNavigate]
  );

  const handleSmartInputKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showSuggestions || suggestions.length === 0) {
        if (e.key === 'Enter' && !smartInputError) {
          // Allow Enter to submit if no suggestions and no error
          return;
        }
        if (e.key === 'Escape') {
          setShowSuggestions(false);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveSuggestionIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveSuggestionIndex((prev) =>
            prev > 0 ? prev - 1 : suggestions.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (
            activeSuggestionIndex >= 0 &&
            activeSuggestionIndex < suggestions.length
          ) {
            handleSuggestionSelect(suggestions[activeSuggestionIndex]);
          } else if (suggestions.length > 0) {
            handleSuggestionSelect(suggestions[0]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setShowSuggestions(false);
          setActiveSuggestionIndex(-1);
          break;
        default:
          // Reset active index when typing
          setActiveSuggestionIndex(-1);
          break;
      }
    },
    [
      showSuggestions,
      suggestions,
      activeSuggestionIndex,
      handleSuggestionSelect,
      smartInputError,
    ]
  );

  const onSelect = useCallback(
    (transfer: Files.TransferTask) => {
      setTransfer(transfer);
    },
    [setTransfer]
  );

  const createTransferTab = (
    <div
      className={`row h-100 ${styles.pane}`}
      onClick={() => setShowSuggestions(false)}
    >
      {/* Left panel - only show for Visual and Smart Input modes */}
      {inputMode !== 'json' && (
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
      )}
      <div
        className={`${
          inputMode === 'json' ? 'col-12' : 'col-md-6'
        } d-flex flex-column`}
      >
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
          <div className="p-3" onClick={(e) => e.stopPropagation()}>
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
                    role="listbox"
                    aria-label="Directory suggestions"
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
                        const isActive = index === activeSuggestionIndex;
                        return (
                          <button
                            key={index}
                            type="button"
                            className={`list-group-item list-group-item-action text-left d-flex align-items-center ${
                              isActive ? 'active' : ''
                            }`}
                            onClick={() => handleSuggestionSelect(suggestion)}
                            onMouseDown={(e) => e.preventDefault()}
                            onMouseEnter={() => setActiveSuggestionIndex(index)}
                            style={{ fontSize: '0.9rem', padding: '8px 12px' }}
                            role="option"
                            aria-selected={isActive}
                            aria-label={`Navigate to ${dirName}`}
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
                {smartInputError && (
                  <div
                    className="text-danger mt-1"
                    style={{ fontSize: '0.8rem' }}
                  >
                    <i className="fa fa-exclamation-triangle me-1"></i>
                    {smartInputError}
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
            <FormGroup>
              <Label for="smartTag">Transfer Tag</Label>
              <Input
                type="text"
                id="smartTag"
                value={smartTag}
                onChange={(e) => setSmartTag(e.target.value)}
                placeholder="Enter transfer tag (optional)"
                className="mb-2"
              />
              <small className="text-muted">
                A tag name for this file transfer (optional)
              </small>
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
                  `tapis://${smartDestination.systemId}${transferPath}`.replace(
                    /(?<!:)\/\/+/g,
                    '/'
                  );
                const elements: Array<Files.ReqTransferElement> =
                  selectedFiles.map((file) => ({
                    destinationURI: `${destinationURI}/${file.name}`,
                    sourceURI: `tapis://${systemId}/${file.path}`.replace(
                      /(?<!:)\/\/+/g,
                      '/'
                    ),
                  }));
                const tagName =
                  smartTag.trim().length > 0 ? smartTag.trim() : undefined;
                createTransfer({
                  reqTransfer: { elements, tag: tagName },
                });
              }}
              disabled={
                isCreatingTransfer ||
                !smartInputValue.trim() ||
                !smartDestination?.systemId ||
                !!smartInputError ||
                selectedFiles.length === 0
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
            {showInfoAlert && (
              <Alert
                color="info"
                className="mb-2"
                toggle={() => setShowInfoAlert(false)}
              >
                <small>
                  <strong>Note:</strong>{' '}
                  {selectedFiles.length > 0
                    ? 'Source URIs are auto-populated from selected files. You only need to specify the destination URIs for each file.'
                    : 'Default example JSON is provided below. Edit the source and destination URIs as needed. Source URIs can be Tapis URIs (tapis://systemId/path) or HTTP/HTTPS URLs (https://example.com/file.csv).'}
                </small>
              </Alert>
            )}
            {showWarningAlert && (
              <Alert
                color="warning"
                className="mb-2"
                toggle={() => setShowWarningAlert(false)}
              >
                <small>
                  <strong>HTTP/HTTPS Limitations:</strong> When using HTTP/HTTPS
                  URLs as sourceURI, only single files can be transferred (no
                  directories).
                </small>
              </Alert>
            )}

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
              <div className="d-flex">
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
                      try {
                        const updatedJson = JSON.parse(jsonInput);
                        const updatedElements = updatedJson.map(
                          (element: any) => {
                            // Fix: Proper basename extraction for trailing slashes
                            const sourceParts = element.sourceURI
                              .split('/')
                              .filter(Boolean);
                            const basename =
                              sourceParts[sourceParts.length - 1] ?? '';

                            return {
                              ...element,
                              destinationURI:
                                `tapis://${jsonDestination.systemId}/${jsonDestination.path}/${basename}`.replace(
                                  /(?<!:)\/\/+/g,
                                  '/'
                                ),
                            };
                          }
                        );
                        setJsonInput(JSON.stringify(updatedElements, null, 2));
                        setJsonError(null); // Clear any previous errors
                      } catch (error) {
                        setJsonError(
                          'Invalid JSON format. Please fix the JSON before applying destination.'
                        );
                      }
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
              {jsonDestination.systemId &&
                jsonDestination.path &&
                jsonInput.trim() && (
                  <Alert
                    color="warning"
                    className="mt-2 mb-0"
                    style={{ fontSize: '0.8rem' }}
                  >
                    <small>
                      <strong>Note:</strong> Destination System/Path only apply
                      after clicking "Apply to All". The JSON below will not be
                      automatically updated until you click the button.
                    </small>
                  </Alert>
                )}
            </FormGroup>
            <FormGroup>
              <Label for="jsonTag">Transfer Tag</Label>
              <Input
                type="text"
                id="jsonTag"
                value={jsonTag}
                onChange={(e) => setJsonTag(e.target.value)}
                placeholder="Enter transfer tag (optional)"
                className="mb-2"
              />
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
                placeholder="JSON will be auto-populated with examples or selected files"
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
                <br />
                <small>Full error: {JSON.stringify(createError)}</small>
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
