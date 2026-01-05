import React, { useState, useEffect, useMemo, useContext } from 'react';
import { Router } from 'app/_Router';
import { NotificationsProvider } from 'app/_components/Notifications';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { Tenants as Hooks } from '@tapis/tapisui-hooks';
import './Layout.scss';
import { useTapisConfig } from '@tapis/tapisui-hooks';
import { useExtension } from 'extensions';
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
} from '@tapis/tapisui-common';
import { ChatPanel } from 'app/_components';
import { Box, Stack, Typography, Chip } from '@mui/material';
import { Sidebar } from 'app/_components';
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
import 'app/MlHub/_context/registerMlHubChat';
import 'app/Systems/_context/registerSystemsChat';
import 'app/Files/_context/registerFilesChat';
import 'app/Apps/_context/registerAppsChat';
import 'app/Jobs/_context/registerJobsChat';
import 'app/Workflows/_context/registerWorkflowsChat';
import 'app/Pods/_context/registerPodsChat';

const LayoutContent: React.FC = () => {
  const { claims, pathTenantId, pathSiteId } = useTapisConfig();
  const { extension } = useExtension();
  const { data, isLoading, error } = Hooks.useList();
  const result = data?.result ?? [];
  const tenants = result;
  const { pathname } = useLocation();
  const crumbs = breadcrumbsFromPathname(pathname);

  const history = useHistory();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Chat functionality
  const { isChatOpen, setIsChatOpen, activeChatId } = useContext(ChatContext);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const { accessToken, basePath, mlHubBasePath } = useTapisConfig();

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

  // Load messages when chat ID changes
  useEffect(() => {
    if (typeof window === 'undefined' || !chatConfig) return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) {
        setMessages([]);
        return;
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setMessages(
          parsed.filter(
            (msg) =>
              msg &&
              typeof msg.id === 'string' &&
              typeof msg.role === 'string' &&
              typeof msg.content === 'string'
          )
        );
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.warn('Failed to restore chat messages', error);
      setMessages([]);
    }
  }, [storageKey, chatConfig]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (!messages || messages.length === 0) {
        window.localStorage.removeItem(storageKey);
        return;
      }
      window.localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch (error) {
      console.warn('Failed to persist chat messages', error);
    }
  }, [messages, storageKey]);

  const handleSend = async (text: string) => {
    if (!chatConfig) {
      console.error('No chat configuration available');
      return;
    }

    const now = Date.now();
    const userTurn: ChatTurn = {
      id: `${now}-user`,
      role: 'user',
      content: text,
    };
    const nextHistory: ChatTurn[] = [...messages, userTurn];
    setMessages([...messages, { ...userTurn, timestamp: now }]);
    setIsSending(true);
    try {
      if (!accessToken?.access_token) {
        setMessages((prev) => [
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

      // Get agent context from the chat config
      const agentContext = chatConfig.getAgentContext({
        accessToken,
        basePath,
        mlHubBasePath,
      });

      // Use the agent from the chat config
      const result = await chatConfig.agent.respond(nextHistory, agentContext);
      if (result.messages && result.messages.length > 0) {
        const now = Date.now();
        setMessages((prev) => [
          ...prev,
          ...result.messages.map((msg) => ({ ...msg, timestamp: now })),
        ]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          role: 'assistant',
          content:
            'An error occurred while processing your message. Please try again.',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(storageKey);
    }
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
          left={<Sidebar />}
          right={
            <div style={{ height: '100vh' }}>
              <div>{crumbs && crumbs.length == 0 ? null : header}</div>
              <div className="body">
                <Router />
              </div>
            </div>
          }
        />
      </div>
      <FloatingChatButton />
      {chatConfig ? (
        <ChatPanel
          open={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          title={chatConfig.title}
          messages={messages}
          onSend={handleSend}
          isSending={isSending}
          onClearChat={handleClearChat}
          headerExtras={<ChatSelector />}
          emptyStateContent={
            typeof chatConfig.emptyStateContent === 'function'
              ? chatConfig.emptyStateContent(handleSend)
              : chatConfig.emptyStateContent
          }
          resizable
          initialWidth={520}
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
    <NotificationsProvider>
      <ChatProvider>
        <LayoutContent />
      </ChatProvider>
    </NotificationsProvider>
  );
};

export default Layout;
