import ChatBox from '@components/ChatBox';
import ChatList from '@components/ChatList';
import useInput from '@hooks/useInput';
import useSocket from '@hooks/useSocket';
import fetcher from '@utils/fetcher';
import axios from 'axios';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import useSWR, { useSWRInfinite } from 'swr';
import { Container, Header } from './styles';
import gravatar from 'gravatar';
import makeSection from '@utils/makeSection';
import Scrollbars from 'react-custom-scrollbars';
import { IChannel, IChat, IDM, IUser } from '@typings/db';
import InviteChannelModal from '@components/InviteChannelModal';

const Channel = () => {
  const { workspace, channel } = useParams<{ workspace: string; channel: string }>();

  const { data: myData } = useSWR(`/api/users`, fetcher);
  const { data: channelData } = useSWR<IChannel>(`/api/workspaces/${workspace}/channels/${channel}`, fetcher);

  const [chat, onChangeChat, setChat] = useInput('');

  const [socket] = useSocket(workspace);

  const [showInviteChannelModal, setShowInviteChannelModal] = useState(false);

  const {
    data: chatData,
    mutate: mutateChat,
    revalidate,
    setSize,
  } = useSWRInfinite<IChat[]>(
    (index) => `/api/workspaces/${workspace}/channels/${channel}/chats?perPage=20&page=${index + 1}`,
    fetcher,
  );

  const { data: channelMembersData } = useSWR<IUser[]>(
    myData ? `/api/workspaces/${workspace}/channels/${channel}/members` : null,
    fetcher,
  );

  const isEmpty = chatData?.[0]?.length === 0;
  const isReachingEnd = isEmpty || (chatData && chatData[chatData.length - 1]?.length < 20) || false;
  const scrollbarRef = useRef<Scrollbars>(null);

  const onSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      if (chat?.trim() && chatData && channelData) {
        const savedChat = chat;
        mutateChat((prevChatData) => {
          prevChatData?.[0].unshift({
            id: (chatData[0][0]?.id || 0) + 1,
            content: savedChat,
            UserId: myData.id,
            User: myData,
            ChannelId: channelData.id,
            Channel: channelData,
            createdAt: new Date(),
          });
          return prevChatData;
        }, false).then(() => {
          setChat('');
          scrollbarRef.current?.scrollToBottom();
        });
        axios
          .post(`/api/workspaces/${workspace}/channels/${channel}/chats`, {
            content: chat,
          })
          .then(() => {
            revalidate();
          })
          .catch(console.error);
      }
    },
    [chat, chatData, myData, workspace, channel],
  );

  const onMessage = useCallback(
    (data: IChat) => {
      if (data.Channel.name === channel && data.UserId !== myData?.id) {
        mutateChat((chatData) => {
          chatData?.[0].unshift(data);
          return chatData;
        }, false).then(() => {
          if (scrollbarRef.current) {
            if (
              scrollbarRef.current.getScrollHeight() <
              scrollbarRef.current.getClientHeight() + scrollbarRef.current?.getScrollTop() + 150
            ) {
              console.log('scrollToBottm!!', scrollbarRef.current?.getValues());
              setTimeout(() => {
                scrollbarRef.current?.scrollToBottom();
              }, 50);
            }
          }
        });
      }
    },
    [channel, myData],
  );

  useEffect(() => {
    socket?.on('message', onMessage);
    return () => {
      socket?.off('message', onMessage);
    };
  }, [socket, onMessage]);

  useEffect(() => {
    if (chatData?.length === 1) {
      scrollbarRef.current?.scrollToBottom();
    }
  }, [chatData]);

  const onClickInviteChannel = useCallback(() => {
    setShowInviteChannelModal(true);
  }, []);

  const onCloseModal = useCallback(() => {
    setShowInviteChannelModal(false);
  }, []);

  if (!myData || !myData) {
    return null;
  }

  const chatSections = makeSection(chatData ? [...chatData].flat().reverse() : []);

  return (
    <Container>
      <Header>
        <span>#{channel}</span>
        <div className="header-right">
          <span>{channelMembersData?.length}</span>
          <button
            onClick={onClickInviteChannel}
            className="c-button-unstyled p-ia__view_header__button"
            aria-label="Add people to #슬리액트"
            data-sk="tooltip_parent"
            type="button"
          >
            <i className="c-icon p-ia__view_header__button_icon c-icon--add-user" aria-hidden="true"></i>
          </button>
        </div>
      </Header>
      <ChatList
        chatSections={chatSections}
        scrollRef={scrollbarRef}
        setSize={setSize}
        isReachingEnd={isReachingEnd}
      ></ChatList>
      <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm}></ChatBox>
      <InviteChannelModal
        show={showInviteChannelModal}
        onCloseModal={onCloseModal}
        setShowInviteChannelModal={setShowInviteChannelModal}
      ></InviteChannelModal>
    </Container>
  );
};

export default Channel;
