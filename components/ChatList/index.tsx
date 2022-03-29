import React, { forwardRef, RefObject, useCallback, VFC } from 'react';
import { ChatZone, Section, StickyHeader } from '@components/ChatList/styles';
import { IChat, IDM } from '@typings/db';
import Chat from '@components/Chat';
import { Scrollbars } from 'react-custom-scrollbars';

interface Props {
  chatSections: { [key: string]: (IChat | IDM)[] };
  setSize: (f: (size: number) => number) => Promise<(IChat | IDM)[][] | undefined>;
  isReachingEnd: boolean;
  scrollRef: RefObject<Scrollbars>;
}
const ChatList: VFC<Props> = ({ chatSections, isReachingEnd, setSize, scrollRef }) => {
  const onScroll = useCallback((values) => {
    if (values.scrollTop === 0 && !isReachingEnd) {
      setSize((prevSize) => prevSize + 1).then(() => {
        if (scrollRef?.current) {
          scrollRef.current?.scrollTop(scrollRef.current?.getScrollHeight() - values.scrollHeight);
        }
      });
    }
  }, []);

  return (
    <ChatZone>
      <Scrollbars autoHide ref={scrollRef} onScrollFrame={onScroll}>
        {Object.entries(chatSections).map(([date, chats]) => {
          return (
            <Section className={`section-${date}`} key={date}>
              <StickyHeader>
                <button>{date}</button>
              </StickyHeader>
              {chats.map((chat) => (
                <Chat key={chat.id} data={chat}></Chat>
              ))}
            </Section>
          );
        })}
      </Scrollbars>
    </ChatZone>
  );
};

export default ChatList;
