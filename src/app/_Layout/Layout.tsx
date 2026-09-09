import React, { useState, useEffect, useMemo, useContext, useRef } from 'react';
import { Router } from 'app/_Router';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { Tenants as Hooks } from '@tapis/tapisui-hooks';
import './Layout.scss';
import { useTapisConfig } from '@tapis/tapisui-hooks';
import { useExtension } from 'extensions';
import { resolveTopBar } from './breadcrumbRoutes';
import TopBarStrip from './TopBarStrip';
import {
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import {
  QueryWrapper,
  PageLayout,
  Breadcrumbs,
  breadcrumbsFromPathname,
  type LoginPromptState,
} from '@tapis/tapisui-common';
import { ChatPanel } from 'app/_components';
import { Box, Stack, Typography, Chip } from '@mui/material';
import { Sidebar, PreloginBanner } from 'app/_components';
import { LoginDialog } from 'app/Login/_components';
import {
  ChatProvider,
  ChatContext,
  getChatConfig,
  getAllChats,
  type ChatMessage,
} from 'app/_context/chat';
import { FloatingChatButton, ChatSelector } from 'app/_components';
import type { ChatTurn } from 'app/_context/chat/agentTypes';
// Import registrations to ensure they run at app startup
import 'app/MLHub/_context/registerMLHubChat';
import 'app/Systems/_context/registerSystemsChat';
import 'app/Files/_context/registerFilesChat';
import 'app/Apps/_context/registerAppsChat';
import 'app/Jobs/_context/registerJobsChat';
import 'app/Workflows/_context/registerWorkflowsChat';
import 'app/Pods/_context/registerPodsChat';

// Chat state lives in LayoutContent, so every message update re-renders it.
// Memoized (both are prop-less), the page body and sidebar skip those
// renders — without this, every stream token re-rendered the entire app.
const MemoRouter = React.memo(Router);
const MemoSidebar = React.memo(Sidebar);

function parseAssistantStream(raw: string) {
  const thinkStartToken = '<think>';
  const thinkEndToken = '</think>';
  let visible = '';
  let thinking = '';
  let cursor = 0;
  let thinkingInProgress = false;

  while (cursor < raw.length) {
    const start = raw.indexOf(thinkStartToken, cursor);
    if (start === -1) {
      visible += raw.slice(cursor);
      break;
    }
    visible += raw.slice(cursor, start);
    const thinkStart = start + thinkStartToken.length;
    const end = raw.indexOf(thinkEndToken, thinkStart);
    if (end === -1) {
      thinking += raw.slice(thinkStart);
      thinkingInProgress = true;
      break;
    }
    thinking += raw.slice(thinkStart, end);
    cursor = end + thinkEndToken.length;
  }

  return { visible, thinking, thinkingInProgress };
}

const LayoutContent: React.FC = () => {
  const { claims, pathTenantId, pathSiteId } = useTapisConfig();
  const { extension } = useExtension();
  const { data, isLoading, error } = Hooks.useList();
  const result = data?.result ?? [];
  const tenants = result;
  const location = useLocation();
  const { pathname } = location;
  const crumbs = breadcrumbsFromPathname(pathname);
  // What sits above the page: breadcrumbs, nothing, or an extension's info
  // strip — one decision, see breadcrumbRoutes.ts. Memoized because this
  // component re-renders on every chat token and the answer only moves when
  // the route does.
  const topBar = useMemo(
    () => resolveTopBar(pathname, extension),
    [pathname, extension]
  );
  const hideCrumbs = topBar.mode !== 'crumbs';

  const history = useHistory();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Chat functionality
  const { isChatOpen, setIsChatOpen, activeChatId } = useContext(ChatContext);
  const [messagesByChatId, setMessagesByChatId] = useState<
    Record<string, ChatMessage[]>
  >({});
  const [isSendingByChatId, setIsSendingByChatId] = useState<
    Record<string, boolean>
  >({});
  const abortControllersRef = useRef<Record<string, AbortController | null>>(
    {}
  );
  const loadedChatIdsRef = useRef<Set<string>>(new Set());
  const { accessToken, basePath, mlHubBasePath } = useTapisConfig();
  const isAuthenticated = Boolean(accessToken?.access_token);

  // Pre-login chrome (extensions with a public landing): the not-logged-in
  // banner replaces the breadcrumb bar, and a bounce off a protected route
  // (ProtectedRoute sets { loginModal, from } state) opens the login dialog
  // over the current page instead of navigating to /login.
  const prelogin = extension?.prelogin;
  const preloginActive = !isAuthenticated && !!prelogin;
  // The banner marks the not-logged-in state on the landing page only —
  // other public pages (training catalog iframe, the login page itself)
  // shouldn't carry an extra chrome bar.
  const showPreloginBanner =
    preloginActive && !!prelogin?.banner && pathname === prelogin?.mainRoute;
  const locationState = location.state as Partial<LoginPromptState> | undefined;
  const loginModalOpen = !!prelogin && !!locationState?.loginModal;
  // Cancel: drop the state so the dialog doesn't reopen on re-render
  // (search preserved — only the state should go).
  const closeLoginModal = () =>
    history.replace({ pathname, search: location.search });

  useEffect(() => {
    return () => {
      Object.values(abortControllersRef.current).forEach((controller) =>
        controller?.abort()
      );
    };
  }, []);

  // Get the current chat configuration
  const chatConfig = useMemo(() => {
    const config = getChatConfig(activeChatId);
    if (!config) {
      console.warn(
        `Chat config not found for ID: ${activeChatId}. Available chats:`,
        getAllChats().map((c) => c.id)
      );
    }
    return config;
  }, [activeChatId]);

  const storageKey = useMemo(() => {
    return chatConfig?.storageKey || 'ml-hub-model-chat-messages';
  }, [chatConfig]);

  const updateMessagesForChat = (
    chatId: string,
    updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])
  ) => {
    setMessagesByChatId((prev) => {
      const prevMessages = prev[chatId] || [];
      const nextMessages =
        typeof updater === 'function' ? updater(prevMessages) : updater;
      if (typeof window !== 'undefined') {
        const key = getChatConfig(chatId)?.storageKey;
        if (key) {
          if (!nextMessages || nextMessages.length === 0) {
            try {
              window.localStorage.removeItem(key);
            } catch (e) {
              console.warn('Failed to clear persisted chat messages', e);
            }
          } else {
            const hasActiveStream = nextMessages.some(
              (m) => m.meta?.stream?.streaming === true
            );
            if (!hasActiveStream) {
              try {
                window.localStorage.setItem(key, JSON.stringify(nextMessages));
              } catch (e) {
                console.warn('Failed to persist chat messages', e);
              }
            }
          }
        }
      }
      return { ...prev, [chatId]: nextMessages };
    });
  };

  const setSendingForChat = (chatId: string, isSending: boolean) => {
    setIsSendingByChatId((prev) => ({ ...prev, [chatId]: isSending }));
  };

  // Load messages when chat ID changes
  useEffect(() => {
    if (typeof window === 'undefined' || !chatConfig) return;
    if (loadedChatIdsRef.current.has(activeChatId)) return;
    loadedChatIdsRef.current.add(activeChatId);
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) {
        updateMessagesForChat(activeChatId, []);
        return;
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        updateMessagesForChat(
          activeChatId,
          parsed.filter(
            (msg) =>
              msg &&
              typeof msg.id === 'string' &&
              typeof msg.role === 'string' &&
              typeof msg.content === 'string'
          )
        );
      } else {
        updateMessagesForChat(activeChatId, []);
      }
    } catch (error) {
      console.warn('Failed to restore chat messages', error);
      updateMessagesForChat(activeChatId, []);
    }
  }, [storageKey, chatConfig, activeChatId]);

  const activeMessages = messagesByChatId[activeChatId] || [];
  const activeIsSending = Boolean(isSendingByChatId[activeChatId]);

  const handleSend = async (text: string) => {
    if (!chatConfig) {
      console.error('No chat configuration available');
      return;
    }

    const requestChatId = activeChatId;
    const now = Date.now();
    const userTurn: ChatTurn = {
      id: `${now}-user`,
      role: 'user',
      content: text,
    };
    const currentMessages = messagesByChatId[requestChatId] || [];
    const nextHistory: ChatTurn[] = [...currentMessages, userTurn];
    updateMessagesForChat(requestChatId, [
      ...currentMessages,
      { ...userTurn, timestamp: now },
    ]);
    setSendingForChat(requestChatId, true);
    let streamingAssistantMessageId: string | null = null;

    try {
      if (!accessToken?.access_token) {
        updateMessagesForChat(requestChatId, (prev) => [
          ...prev,
          {
            id: `${Date.now()}-error`,
            role: 'assistant',
            content: 'Error: Please log in to use the chat feature.',
            timestamp: Date.now(),
          },
        ]);
        return;
      }

      const agentContext = chatConfig.getAgentContext({
        accessToken,
        basePath,
        mlHubBasePath,
      });

      const canStream = typeof chatConfig.agent.respondStream === 'function';

      if (canStream) {
        const assistantMessageId = `${Date.now()}-assistant-stream`;
        streamingAssistantMessageId = assistantMessageId;
        let rawStream = '';
        const abortController = new AbortController();
        abortControllersRef.current[requestChatId] = abortController;

        updateMessagesForChat(requestChatId, (prev) => [
          ...prev,
          {
            id: assistantMessageId,
            role: 'assistant',
            content: '',
            timestamp: Date.now(),
            meta: {
              stream: {
                thinking: '',
                thinkingInProgress: false,
                streaming: true,
              },
            },
          },
        ]);

        const flushStreamState = (streaming: boolean) => {
          const parsed = parseAssistantStream(rawStream);
          updateMessagesForChat(requestChatId, (prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? {
                    ...msg,
                    content: parsed.visible,
                    meta: {
                      ...msg.meta,
                      stream: {
                        thinking: parsed.thinking,
                        thinkingInProgress: parsed.thinkingInProgress,
                        streaming,
                      },
                    },
                  }
                : msg
            )
          );
        };

        await chatConfig.agent.respondStream!(nextHistory, agentContext, {
          signal: abortController.signal,
          onDelta: (delta) => {
            rawStream += delta;
            flushStreamState(true);
          },
          onDone: () => {
            flushStreamState(false);
            if (
              abortControllersRef.current[requestChatId] === abortController
            ) {
              abortControllersRef.current[requestChatId] = null;
            }
          },
        });
      } else {
        const result = await chatConfig.agent.respond(
          nextHistory,
          agentContext
        );
        if (result.messages && result.messages.length > 0) {
          const responseTimestamp = Date.now();
          updateMessagesForChat(requestChatId, (prev) => [
            ...prev,
            ...result.messages.map((msg) => ({
              ...msg,
              timestamp: responseTimestamp,
            })),
          ]);
        }
      }
    } catch (error) {
      if ((error as Error)?.name === 'AbortError') {
        if (streamingAssistantMessageId) {
          updateMessagesForChat(requestChatId, (prev) =>
            prev.map((msg) =>
              msg.id === streamingAssistantMessageId
                ? {
                    ...msg,
                    meta: {
                      ...msg.meta,
                      stream: {
                        ...(msg.meta?.stream ?? {
                          thinking: '',
                          thinkingInProgress: false,
                          streaming: false,
                        }),
                        streaming: false,
                      },
                    },
                  }
                : msg
            )
          );
        }
        return;
      }
      console.error('Error sending message:', error);
      const errorContent =
        'An error occurred while processing your message. Please try again.';
      if (streamingAssistantMessageId) {
        updateMessagesForChat(requestChatId, (prev) =>
          prev.map((msg) =>
            msg.id === streamingAssistantMessageId
              ? {
                  ...msg,
                  content: errorContent,
                  timestamp: Date.now(),
                  meta: {
                    ...msg.meta,
                    stream: {
                      ...(msg.meta?.stream ?? {
                        thinking: '',
                        thinkingInProgress: false,
                        streaming: false,
                      }),
                      streaming: false,
                    },
                  },
                }
              : msg
          )
        );
      } else {
        updateMessagesForChat(requestChatId, (prev) => [
          ...prev,
          {
            id: `${Date.now()}-error`,
            role: 'assistant',
            content: errorContent,
            timestamp: Date.now(),
          },
        ]);
      }
    } finally {
      setSendingForChat(requestChatId, false);
    }
  };

  const handleClearChat = () => {
    const currentChatId = activeChatId;
    abortControllersRef.current[currentChatId]?.abort();
    abortControllersRef.current[currentChatId] = null;
    updateMessagesForChat(currentChatId, []);
    setSendingForChat(currentChatId, false);
  };

  // Set the document title dynamically based on the tenant ID
  useEffect(() => {
    if (pathTenantId && pathSiteId) {
      document.title = `Tapis - ${pathTenantId}.${pathSiteId}`;
    } else if (pathTenantId) {
      document.title = `Tapis - ${pathTenantId}`;
    } else {
      document.title = 'Tapis';
    }
  }, [pathTenantId]);

  const header = (
    <div className="tapis-ui__header">
      <div style={{ marginLeft: '1.2rem' }}>
        <Breadcrumbs breadcrumbs={crumbs} />
      </div>
      <div>{false && <ButtonDropdown size="sm" />}</div>
    </div>
  );

  return (
    <>
      <div style={{ display: 'flex', height: '100vh' }}>
        <PageLayout
          left={<MemoSidebar />}
          right={
            <div
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {showPreloginBanner && (
                <PreloginBanner text={prelogin?.banner?.text} />
              )}
              <div style={{ flexShrink: 0 }}>
                {/* Pre-login the banner is the only chrome — no breadcrumbs. */}
                {preloginActive || hideCrumbs || (crumbs && crumbs.length == 0)
                  ? null
                  : header}
                {/* A public page keeps its strip before login too; only the
                    landing page, which already carries the pre-login banner,
                    does not stack a second bar. */}
                {!showPreloginBanner && topBar.mode === 'strip' && (
                  <TopBarStrip strip={topBar.strip} />
                )}
              </div>
              <div className="body">
                <MemoRouter />
              </div>
            </div>
          }
        />
      </div>
      {/* Mounted whenever a prelogin config exists (not just while the
          location state asks for it) so the post-login success beat inside
          the dialog can play out before it navigates away. */}
      {prelogin && (
        <LoginDialog
          open={loginModalOpen}
          onClose={closeLoginModal}
          fromPathname={locationState?.from?.pathname}
          fromSearch={locationState?.from?.search}
          message={locationState?.loginMessage}
        />
      )}
      <FloatingChatButton isAuthenticated={isAuthenticated} />
      {chatConfig ? (
        <ChatPanel
          open={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          title={chatConfig.title}
          messages={activeMessages}
          onSend={handleSend}
          isSending={activeIsSending}
          onClearChat={handleClearChat}
          headerExtras={<ChatSelector />}
          emptyStateContent={
            typeof chatConfig.emptyStateContent === 'function'
              ? chatConfig.emptyStateContent(handleSend)
              : chatConfig.emptyStateContent
          }
          resizable
          initialWidth={580}
          minWidth={360}
          maxWidth={960}
          enableExport
        />
      ) : isChatOpen ? (
        <ChatPanel
          open={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          title="Chat"
          messages={[]}
          onSend={() => {}}
          isSending={false}
          emptyStateContent={
            <div style={{ padding: '20px', textAlign: 'center' }}>
              Chat configuration not found. Please refresh the page.
            </div>
          }
        />
      ) : null}
    </>
  );
};

const Layout: React.FC = () => {
  return (
    <ChatProvider>
      <LayoutContent />
    </ChatProvider>
  );
};

export default Layout;
