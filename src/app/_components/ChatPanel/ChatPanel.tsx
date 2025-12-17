import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Box,
  Stack,
  Typography,
  IconButton,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
  CircularProgress,
  Paper,
  Link,
} from '@mui/material';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { format, isToday } from 'date-fns';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import Markdown from 'markdown-to-jsx';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number | Date | string;
};

export type ChatPanelProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  width?: string | number;
  height?: number;
  messages: ChatMessage[];
  onSend: (text: string) => void;
  isSending?: boolean;
  onClearChat?: () => void;
  headerExtras?: React.ReactNode;
  footerExtras?: React.ReactNode;
  emptyStateContent?: React.ReactNode;
  resizable?: boolean;
  initialWidth?: number;
  initialHeight?: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  onWidthChange?: (width: number) => void;
  onHeightChange?: (height: number) => void;
  enableExport?: boolean;
  exportFileName?: string;
  onExportChat?: (messages: ChatMessage[]) => void;
};

const roleToBg = (role: ChatMessage['role']): string => {
  if (role === 'user') return '#e8f0fe';
  if (role === 'assistant') return '#f1f8e9';
  return '#f5f5f5';
};

const roleToAlign = (role: ChatMessage['role']): 'flex-start' | 'flex-end' => {
  return role === 'user' ? 'flex-end' : 'flex-start';
};

const formatTimestamp = (timestamp?: number | Date | string): string => {
  if (!timestamp) return '';
  try {
    const date =
      typeof timestamp === 'number' ? new Date(timestamp) : new Date(timestamp);
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else {
      return format(date, 'MMM d, HH:mm');
    }
  } catch {
    return '';
  }
};

const CLAMP_FALLBACK_WIDTH = 480;
const CLAMP_FALLBACK_HEIGHT = 640;
const TOP_PADDING = 36;
const BOTTOM_PADDING = 40;

/**
 * ChatPanel - A persistent side panel design (no backdrop, integrated into layout)
 * Alternative to drawer: slides in from right, no dark overlay, page stays visible
 */
const ChatPanel: React.FC<ChatPanelProps> = ({
  open,
  onClose,
  title = 'Model Chat',
  width = 420,
  height,
  messages,
  onSend,
  isSending = false,
  onClearChat,
  headerExtras,
  footerExtras,
  emptyStateContent,
  resizable = false,
  initialWidth,
  initialHeight,
  minWidth,
  maxWidth,
  minHeight,
  maxHeight,
  onWidthChange,
  onHeightChange,
  enableExport = false,
  exportFileName,
  onExportChat,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRightResizing, setIsRightResizing] = useState(false);
  const [isHeightResizing, setIsHeightResizing] = useState(false);
  const [isCornerResizing, setIsCornerResizing] = useState(false);
  const [isTopResizing, setIsTopResizing] = useState(false);
  const [isTopCornerResizing, setIsTopCornerResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const resizeState = useRef<{
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    startTop: number;
    startLeft: number;
  }>({
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
    startTop: 16,
    startLeft: 0,
  });

  // Ensure the header/footer controls (including reset/close/send) stay visible
  const minWidthValue = Math.max(420, minWidth ?? 420);
  const maxWidthValue = Math.max(minWidthValue, maxWidth ?? 960);
  const minHeightValue = Math.max(420, minHeight ?? 420);
  const maxHeightValue = Math.max(
    minHeightValue,
    maxHeight ??
      (typeof window !== 'undefined'
        ? Math.max(window.innerHeight - 32, minHeightValue)
        : 1200)
  );

  const parseWidth = (value?: string | number): number | undefined => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string') {
      const numeric = parseFloat(value);
      if (Number.isNaN(numeric)) {
        return undefined;
      }
      if (value.trim().endsWith('vw')) {
        if (typeof window !== 'undefined') {
          return (window.innerWidth * numeric) / 100;
        }
        return undefined;
      }
      return numeric;
    }
    return undefined;
  };

  const clampWidth = useCallback(
    (value: number): number => {
      return Math.min(Math.max(value, minWidthValue), maxWidthValue);
    },
    [minWidthValue, maxWidthValue]
  );
  const clampHeight = useCallback(
    (value: number): number => {
      return Math.min(Math.max(value, minHeightValue), maxHeightValue);
    },
    [minHeightValue, maxHeightValue]
  );

  const computeInitialWidth = useCallback((): number => {
    const parsed = initialWidth ?? parseWidth(width) ?? CLAMP_FALLBACK_WIDTH;
    const viewportWidth =
      typeof window !== 'undefined'
        ? Math.max(window.innerWidth - 32, minWidthValue)
        : undefined;
    const maxAllowedWidth =
      viewportWidth !== undefined
        ? Math.min(maxWidthValue, viewportWidth)
        : maxWidthValue;
    return Math.min(Math.max(parsed, minWidthValue), maxAllowedWidth);
  }, [initialWidth, width, minWidthValue, maxWidthValue]);

  const [panelWidth, setPanelWidth] = useState<number>(computeInitialWidth);
  const computeInitialHeight = useCallback((): number => {
    const fallback =
      typeof window !== 'undefined'
        ? Math.min(
            Math.max(
              window.innerHeight - TOP_PADDING - BOTTOM_PADDING,
              minHeightValue
            ),
            maxHeightValue
          )
        : CLAMP_FALLBACK_HEIGHT;
    const parsed = initialHeight ?? height ?? fallback;
    return Math.min(Math.max(parsed, minHeightValue), maxHeightValue);
  }, [height, initialHeight, maxHeightValue, minHeightValue]);

  const [panelHeight, setPanelHeight] = useState<number>(computeInitialHeight);
  const [panelTop, setPanelTop] = useState<number>(TOP_PADDING);
  const [panelLeft, setPanelLeft] = useState<number>(0);

  const computeInitialLeft = useCallback((): number => {
    if (typeof window === 'undefined') return 0;
    const available = window.innerWidth;
    const widthValue = computeInitialWidth();
    const tentative = available - widthValue - 16;
    return Math.max(16, tentative);
  }, [computeInitialWidth]);

  useEffect(() => {
    setPanelLeft(computeInitialLeft());
  }, [computeInitialLeft]);

  useEffect(() => {
    if (!resizable) return;
    setPanelWidth(computeInitialWidth());
    setPanelHeight(computeInitialHeight());
    setPanelTop(TOP_PADDING);
    setPanelLeft(computeInitialLeft());
  }, [
    resizable,
    computeInitialWidth,
    computeInitialHeight,
    computeInitialLeft,
  ]);

  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      resizeState.current = {
        startX: e.clientX,
        startY: e.clientY,
        startWidth: panelWidth,
        startHeight: panelHeight,
        startTop: panelTop,
        startLeft: panelLeft,
      };
      setIsResizing(true);
    },
    [panelWidth, panelHeight, panelTop, panelLeft]
  );

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = resizeState.current.startX - e.clientX;
      const tentativeWidth = resizeState.current.startWidth + deltaX;
      const rightEdge =
        resizeState.current.startLeft + resizeState.current.startWidth;
      const maxWidthByPos = rightEdge;
      const effectiveMaxWidth = Math.min(maxWidthValue, maxWidthByPos);

      const newWidth = Math.min(
        Math.max(tentativeWidth, minWidthValue),
        effectiveMaxWidth
      );
      const newLeft = rightEdge - newWidth;

      setPanelWidth(newWidth);
      setPanelLeft(newLeft);
      onWidthChange?.(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, minWidthValue, maxWidthValue, onWidthChange]);

  useEffect(() => {
    if (!isRightResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeState.current.startX;
      const tentativeWidth = resizeState.current.startWidth + deltaX;
      const viewportWidth =
        typeof window !== 'undefined' ? window.innerWidth : 1000;
      const maxWidthByPos = viewportWidth - resizeState.current.startLeft;
      const effectiveMaxWidth = Math.min(maxWidthValue, maxWidthByPos);

      const newWidth = Math.min(
        Math.max(tentativeWidth, minWidthValue),
        effectiveMaxWidth
      );

      setPanelWidth(newWidth);
      onWidthChange?.(newWidth);
    };

    const handleMouseUp = () => {
      setIsRightResizing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isRightResizing, minWidthValue, maxWidthValue, onWidthChange]);

  useEffect(() => {
    if (!isHeightResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - resizeState.current.startY;
      const viewportHeight =
        typeof window !== 'undefined'
          ? window.innerHeight
          : resizeState.current.startHeight;
      const maxHeightAllowed = viewportHeight - panelTop - BOTTOM_PADDING; // keep padding from bottom
      const rawHeight = resizeState.current.startHeight + deltaY;
      const newHeight = clampHeight(Math.min(rawHeight, maxHeightAllowed));
      setPanelHeight(newHeight);
      onHeightChange?.(newHeight);
    };

    const handleMouseUp = () => {
      setIsHeightResizing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isHeightResizing, minHeightValue, maxHeightValue, onHeightChange]);

  useEffect(() => {
    if (!isTopResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - resizeState.current.startY;
      const viewportHeight =
        typeof window !== 'undefined'
          ? window.innerHeight
          : resizeState.current.startHeight;
      const tentativeTop = Math.max(0, resizeState.current.startTop + deltaY);
      const maxTop = Math.max(0, viewportHeight - minHeightValue);
      const newTop = Math.min(tentativeTop, maxTop);
      const maxHeightAllowed = viewportHeight - newTop - BOTTOM_PADDING;
      const rawHeight = resizeState.current.startHeight - deltaY;
      const newHeight = clampHeight(Math.min(rawHeight, maxHeightAllowed));
      setPanelTop(newTop);
      setPanelHeight(newHeight);
      onHeightChange?.(newHeight);
    };

    const handleMouseUp = () => {
      setIsTopResizing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isTopResizing, clampHeight, onHeightChange, minHeightValue]);

  useEffect(() => {
    if (!isTopCornerResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      // X Axis (Same as Left Resize)
      const deltaX = resizeState.current.startX - e.clientX;
      const tentativeWidth = resizeState.current.startWidth + deltaX;
      const rightEdge =
        resizeState.current.startLeft + resizeState.current.startWidth;
      const maxWidthByPos = rightEdge;
      const effectiveMaxWidth = Math.min(maxWidthValue, maxWidthByPos);
      const newWidth = Math.min(
        Math.max(tentativeWidth, minWidthValue),
        effectiveMaxWidth
      );
      const newLeft = rightEdge - newWidth;

      // Y Axis (Same as Top Resize)
      const deltaY = e.clientY - resizeState.current.startY;
      const viewportHeight =
        typeof window !== 'undefined'
          ? window.innerHeight
          : resizeState.current.startHeight;
      const tentativeTop = Math.max(0, resizeState.current.startTop + deltaY);
      const maxTop = Math.max(0, viewportHeight - minHeightValue);
      const newTop = Math.min(tentativeTop, maxTop);
      const maxHeightAllowed = viewportHeight - newTop - BOTTOM_PADDING;
      const rawHeight = resizeState.current.startHeight - deltaY;
      const newHeight = clampHeight(Math.min(rawHeight, maxHeightAllowed));

      setPanelWidth(newWidth);
      setPanelHeight(newHeight);
      setPanelTop(newTop);
      setPanelLeft(newLeft);
      onWidthChange?.(newWidth);
      onHeightChange?.(newHeight);
    };

    const handleMouseUp = () => {
      setIsTopCornerResizing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    isTopCornerResizing,
    clampHeight,
    onWidthChange,
    onHeightChange,
    minHeightValue,
    maxWidthValue,
    minWidthValue,
  ]);

  useEffect(() => {
    if (!isCornerResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      // X Axis (Same as Left Resize)
      const deltaX = resizeState.current.startX - e.clientX;
      const tentativeWidth = resizeState.current.startWidth + deltaX;
      const rightEdge =
        resizeState.current.startLeft + resizeState.current.startWidth;
      const maxWidthByPos = rightEdge;
      const effectiveMaxWidth = Math.min(maxWidthValue, maxWidthByPos);
      const newWidth = Math.min(
        Math.max(tentativeWidth, minWidthValue),
        effectiveMaxWidth
      );
      const newLeft = rightEdge - newWidth;

      // Y Axis (Same as Bottom Resize)
      const deltaY = e.clientY - resizeState.current.startY;
      const viewportHeight =
        typeof window !== 'undefined'
          ? window.innerHeight
          : resizeState.current.startHeight;
      const maxHeightAllowed = viewportHeight - panelTop - BOTTOM_PADDING;
      const rawHeight = resizeState.current.startHeight + deltaY;
      const newHeight = clampHeight(Math.min(rawHeight, maxHeightAllowed));

      setPanelWidth(newWidth);
      setPanelHeight(newHeight);
      setPanelLeft(newLeft);
      onWidthChange?.(newWidth);
      onHeightChange?.(newHeight);
    };

    const handleMouseUp = () => {
      setIsCornerResizing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    isCornerResizing,
    minWidthValue,
    maxWidthValue,
    minHeightValue,
    maxHeightValue,
    onWidthChange,
    onHeightChange,
    panelTop,
    clampHeight,
  ]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeState.current.startX;
      const deltaY = e.clientY - resizeState.current.startY;
      const viewportWidth =
        typeof window !== 'undefined'
          ? window.innerWidth
          : panelLeft + panelWidth;
      const viewportHeight =
        typeof window !== 'undefined'
          ? window.innerHeight
          : panelTop + panelHeight;
      const maxLeft = Math.max(0, viewportWidth - panelWidth - 8);
      const tentativeLeft = resizeState.current.startLeft + deltaX;
      const newLeft = Math.min(Math.max(0, tentativeLeft), maxLeft);

      const maxTop = Math.max(
        0,
        viewportHeight - Math.max(panelHeight, minHeightValue) - 8
      );
      const tentativeTop = resizeState.current.startTop + deltaY;
      const newTop = Math.min(Math.max(0, tentativeTop), maxTop);

      setPanelLeft(newLeft);
      setPanelTop(newTop);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    isDragging,
    panelLeft,
    panelWidth,
    panelHeight,
    panelTop,
    minHeightValue,
  ]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const handleSend = () => {
    if (inputValue.trim() && !isSending) {
      onSend(inputValue.trim());
      setInputValue('');
    }
  };

  const handleClearClick = () => {
    setShowClearDialog(true);
  };

  const handleClearConfirm = () => {
    onClearChat?.();
    setShowClearDialog(false);
  };

  const handleResetSize = () => {
    const newWidth = computeInitialWidth();
    const newHeight = computeInitialHeight();
    setPanelWidth(newWidth);
    setPanelHeight(newHeight);
    setPanelTop(TOP_PADDING);
    setPanelLeft(computeInitialLeft());
    onWidthChange?.(newWidth);
    onHeightChange?.(newHeight);
  };

  const handleDragMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, [role="button"], textarea, input')) {
      return; // allow clicks on controls without dragging
    }
    e.preventDefault();
    resizeState.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: panelWidth,
      startHeight: panelHeight,
      startTop: panelTop,
      startLeft: panelLeft,
    };
    setIsDragging(true);
  };

  const handleClearCancel = () => {
    setShowClearDialog(false);
  };

  const handleCopyMessage = async (message: ChatMessage) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(message.content);
      } else {
        if (typeof document === 'undefined') return;
        const textarea = document.createElement('textarea');
        textarea.value = message.content;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedMessageId(message.id);
    } catch (error) {
      console.error('Failed to copy message', error);
    }
  };

  const handleExportChat = async () => {
    if (!messages || messages.length === 0) return;

    if (onExportChat) {
      onExportChat(messages);
      return;
    }

    if (typeof document === 'undefined') return;

    const lines: string[] = [];
    lines.push(`# Chat Transcript\n`);
    messages.forEach((msg) => {
      const timestamp = msg.timestamp ? formatTimestamp(msg.timestamp) : '';
      lines.push(`## ${msg.role}${timestamp ? ` (${timestamp})` : ''}`);
      lines.push('');
      lines.push(msg.content || '');
      lines.push('');
    });
    const content = lines.join('\n');
    const blob = new Blob([content], {
      type: 'text/markdown;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const fileName =
      exportFileName ||
      `chat-${new Date().toISOString().replace(/[:.]/g, '-')}.md`;
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const effectiveWidth = resizable
    ? panelWidth
    : parseWidth(width) ?? CLAMP_FALLBACK_WIDTH;
  const effectiveHeight = resizable ? panelHeight : height;
  const headerDraggableAreaHeight = 48;

  return (
    <>
      <Paper
        elevation={3}
        sx={{
          position: 'fixed',
          left: panelLeft,
          top: panelTop,
          height: effectiveHeight ?? 'calc(100vh - 32px)',
          minHeight: minHeightValue,
          maxHeight: maxHeightValue,
          width: effectiveWidth,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1300,
          borderRadius: '12px',
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          boxShadow:
            '6px 0 18px rgba(0, 0, 0, 0.18), -6px 0 18px rgba(0, 0, 0, 0.18)',
          transition: 'opacity 220ms ease, transform 220ms ease',
          transformOrigin: 'center',
          transform: open ? 'translateX(0)' : 'translateX(16px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          visibility: open ? 'visible' : 'hidden',
          overflow: 'hidden',
        }}
      >
        {resizable && (
          <Box
            onMouseDown={handleResizeMouseDown}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 6,
              height: '100%',
              cursor: 'ew-resize',
              zIndex: 2,
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          />
        )}
        {resizable && (
          <Box
            onMouseDown={(e) => {
              e.preventDefault();
              resizeState.current = {
                startX: e.clientX,
                startY: e.clientY,
                startWidth: panelWidth,
                startHeight: panelHeight,
                startTop: panelTop,
                startLeft: panelLeft,
              };
              setIsRightResizing(true);
            }}
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 6,
              height: '100%',
              cursor: 'ew-resize',
              zIndex: 2,
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          />
        )}
        {resizable && (
          <Box
            onMouseDown={(e) => {
              e.preventDefault();
              resizeState.current = {
                startX: e.clientX,
                startY: e.clientY,
                startWidth: panelWidth,
                startHeight: panelHeight,
                startTop: panelTop,
                startLeft: panelLeft,
              };
              setIsHeightResizing(true);
            }}
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: 8,
              cursor: 'ns-resize',
              zIndex: 2,
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          />
        )}
        {resizable && (
          <Box
            onMouseDown={(e) => {
              e.preventDefault();
              resizeState.current = {
                startX: e.clientX,
                startY: e.clientY,
                startWidth: panelWidth,
                startHeight: panelHeight,
                startTop: panelTop,
                startLeft: panelLeft,
              };
              setIsCornerResizing(true);
            }}
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: 16,
              height: 16,
              cursor: 'nesw-resize',
              zIndex: 3,
              bgcolor: 'transparent',
            }}
          />
        )}
        {resizable && (
          <Box
            onMouseDown={(e) => {
              e.preventDefault();
              resizeState.current = {
                startX: e.clientX,
                startY: e.clientY,
                startWidth: panelWidth,
                startHeight: panelHeight,
                startTop: panelTop,
                startLeft: panelLeft,
              };
              setIsTopResizing(true);
            }}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: 8,
              cursor: 'ns-resize',
              zIndex: 2,
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          />
        )}
        {resizable && (
          <Box
            onMouseDown={(e) => {
              e.preventDefault();
              resizeState.current = {
                startX: e.clientX,
                startY: e.clientY,
                startWidth: panelWidth,
                startHeight: panelHeight,
                startTop: panelTop,
                startLeft: panelLeft,
              };
              setIsTopCornerResizing(true);
            }}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 16,
              height: 16,
              cursor: 'nwse-resize',
              zIndex: 3,
              bgcolor: 'transparent',
            }}
          />
        )}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          onMouseDown={handleDragMouseDown}
          sx={{
            p: 1.5,
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: isDragging ? 'none' : 'auto',
          }}
        >
          <Typography variant="subtitle1" sx={{ flex: 1, fontWeight: 600 }}>
            {title}
          </Typography>
          {headerExtras}
          {enableExport && messages.length > 0 && (
            <Tooltip title="Export chat" placement="bottom">
              <IconButton
                aria-label="Export chat"
                onClick={handleExportChat}
                size="small"
                sx={{ color: 'text.secondary' }}
              >
                <FileDownloadOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onClearChat && messages.length > 0 && (
            <Tooltip title="Clear chat" placement="bottom">
              <IconButton
                aria-label="Clear chat"
                onClick={handleClearClick}
                size="small"
                sx={{ color: 'text.secondary' }}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {resizable && (
            <Tooltip title="Reset size" placement="bottom">
              <IconButton
                aria-label="Reset size"
                onClick={handleResetSize}
                size="small"
                sx={{ color: 'text.secondary' }}
              >
                <RestartAltIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <IconButton aria-label="Close chat" onClick={onClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
        <Divider />
        <Box
          ref={scrollRef}
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.25,
          }}
        >
          {messages.length === 0
            ? emptyStateContent || (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Start a conversation by typing in the box below.
                </Typography>
              )
            : messages.map((m) => (
                <Box
                  key={m.id}
                  sx={{ display: 'flex', justifyContent: roleToAlign(m.role) }}
                >
                  <Box
                    sx={{
                      maxWidth: '80%',
                      px: 1.25,
                      py: 1,
                      borderRadius: 1.5,
                      bgcolor: roleToBg(m.role),
                      border: '1px solid #e0e0e0',
                      position: 'relative',
                      '&:hover .chat-message-copy': {
                        opacity: 1,
                        visibility: 'visible',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: 1,
                        mb: 0.5,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 700,
                          color:
                            m.role === 'user'
                              ? '#101828'
                              : m.role === 'assistant'
                              ? '#1F2933'
                              : '#475467',
                        }}
                      >
                        {m.role === 'user'
                          ? 'User'
                          : m.role === 'assistant'
                          ? 'Assistant'
                          : 'System'}
                      </Typography>
                      {m.timestamp && (
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', fontSize: '0.7rem' }}
                        >
                          {formatTimestamp(m.timestamp)}
                        </Typography>
                      )}
                    </Box>
                    <Box
                      sx={{
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        overflowWrap: 'anywhere',
                        '& p': {
                          margin: 0,
                          marginBottom: '0.5em',
                          '&:last-child': {
                            marginBottom: 0,
                          },
                        },
                        '& strong': {
                          fontWeight: 700,
                        },
                        '& a': {
                          color: 'primary.main',
                          textDecoration: 'underline',
                          '&:hover': {
                            textDecoration: 'none',
                          },
                        },
                        '& h1, & h2, & h3, & h4, & h5, & h6': {
                          fontSize: '1.25rem !important',
                          fontWeight: 600,
                          marginTop: '0.5em',
                          marginBottom: '0.5em',
                          '&:first-of-type': {
                            marginTop: 0,
                          },
                        },
                      }}
                    >
                      <Markdown
                        options={{
                          overrides: {
                            a: {
                              component: Link,
                              props: {
                                target: '_blank',
                                rel: 'noopener noreferrer',
                              },
                            },
                            p: {
                              component: Typography,
                              props: {
                                variant: 'body2',
                                component: 'p',
                              },
                            },
                            h1: {
                              component: Typography,
                              props: {
                                variant: 'h6',
                                component: 'h1',
                              },
                            },
                            h2: {
                              component: Typography,
                              props: {
                                variant: 'h6',
                                component: 'h2',
                              },
                            },
                            h3: {
                              component: Typography,
                              props: {
                                variant: 'h6',
                                component: 'h3',
                              },
                            },
                            h4: {
                              component: Typography,
                              props: {
                                variant: 'h6',
                                component: 'h4',
                              },
                            },
                            h5: {
                              component: Typography,
                              props: {
                                variant: 'h6',
                                component: 'h5',
                              },
                            },
                            h6: {
                              component: Typography,
                              props: {
                                variant: 'h6',
                                component: 'h6',
                              },
                            },
                          },
                        }}
                      >
                        {m.content}
                      </Markdown>
                    </Box>
                    <Tooltip
                      title={
                        copiedMessageId === m.id ? 'Copied!' : 'Copy message'
                      }
                      placement="top"
                    >
                      <IconButton
                        size="small"
                        className="chat-message-copy"
                        aria-label="Copy message"
                        onClick={() => handleCopyMessage(m)}
                        sx={{
                          position: 'absolute',
                          right: 4,
                          bottom: 4,
                          opacity: 0,
                          visibility: 'hidden',
                          transition: 'opacity 0.2s ease-in-out',
                          bgcolor: 'background.paper',
                          boxShadow: 1,
                          '&:hover': {
                            bgcolor: 'grey.100',
                          },
                        }}
                      >
                        {copiedMessageId === m.id ? (
                          <CheckIcon fontSize="inherit" />
                        ) : (
                          <ContentCopyIcon fontSize="inherit" />
                        )}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              ))}
          {isSending && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
              <Box
                sx={{
                  maxWidth: '70%',
                  px: 1.25,
                  py: 1,
                  borderRadius: 1.5,
                  bgcolor: roleToBg('assistant'),
                  border: '1px solid #e0e0e0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <CircularProgress size={16} thickness={5} />
                <Typography variant="caption" color="text.secondary">
                  Preparing a response...
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
        <Divider />
        <Box
          sx={{
            p: 1.5,
            pt: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          {footerExtras}
          <Stack direction="row" spacing={1}>
            <TextareaAutosize
              minRows={1}
              maxRows={6}
              placeholder="Message"
              value={inputValue}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setInputValue(e.target.value)
              }
              onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              style={{
                width: '100%',
                resize: 'none',
                padding: '8px 12px',
                fontSize: '0.875rem',
                lineHeight: 1.5,
                borderRadius: 4,
                border: '1px solid rgba(0,0,0,0.23)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
                fontFamily: 'inherit',
              }}
            />
            <Button
              variant="contained"
              onClick={handleSend}
              disabled={isSending || inputValue.trim() === ''}
            >
              Send
            </Button>
          </Stack>
        </Box>
      </Paper>
      <Dialog
        open={showClearDialog}
        onClose={handleClearCancel}
        aria-labelledby="clear-dialog-title"
        aria-describedby="clear-dialog-description"
      >
        <DialogTitle id="clear-dialog-title">Clear Chat History?</DialogTitle>
        <DialogContent>
          <DialogContentText id="clear-dialog-description">
            Are you sure you want to clear all chat messages? This action cannot
            be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClearCancel} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleClearConfirm}
            color="error"
            variant="contained"
          >
            Clear
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ChatPanel;
