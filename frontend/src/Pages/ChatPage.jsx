import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import authUserHook from '../customHook/authUserHook';
import ChatLoader from '../Components/ChatLoader';
import {
    Channel,
    ChannelHeader,
    Chat,
    MessageInput,
    MessageList,
    Thread,
    Window,
} from 'stream-chat-react';
import { StreamChat } from 'stream-chat';
import CallButton from '../Components/CallButton';
import toast from 'react-hot-toast';

const REACT_APP_STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
    const { chatId } = useParams();
    const { authUser } = authUserHook();

    const [chatClient, setChatClient] = useState(null);
    const [channel, setChannel] = useState(null);
    const [loading, setLoading] = useState(false);

    const { data: streamToken } = useQuery({
        queryKey: ["streamToken"],
        queryFn: async () => {
            const response = await axiosInstance.get('/chat/token');
            return response.data;
        },
        enabled: !!authUser // Only fetch if authUser is available
    });


    useEffect(() => {
        const initChat = async () => {
            if (!streamToken || !authUser) return;
            try {
                console.log('initializing chat client');
                setLoading(true);
                const client = StreamChat.getInstance(REACT_APP_STREAM_API_KEY);
                await client.connectUser({
                    id: authUser._id,
                    name: authUser.name,
                    image: authUser.profilePic,
                }, streamToken.token);

                const channelId = [authUser._id, chatId].sort().join('-');
                // you and me
                // why i sort the id?
                // because if i don't sort the id then the channel id will be different for you and me
                // for example if you are 1 and i am 2 then the channel id will be 1-2
                // but if i am 1 and you are 2 then the channel id will be 2-1
                // so i sort the id to make it same for both of us

                const currentChannel = client.channel("messaging", channelId, {
                    members: [authUser._id, chatId],
                });

                await currentChannel.watch();
                setChannel(currentChannel);
                setChatClient(client);

            } catch (error) {
                console.error('Error initializing chat client:', error);

            } finally {
                setLoading(false);
            }
        }
        initChat();
    }, [streamToken, authUser]);

    const handleVideoCall = () => {
        if(channel){
            const callUrl = `${window.location.origin}/video-call/${channel.id}`;

            channel.sendMessage({
                text: `Video call link: ${callUrl}`,
                attachments: [
                    {
                        type: 'video-call',
                        title: 'Join Video Call',
                        url: callUrl,
                    },
                ],
            }).then(() => {
                console.log('Video call link sent');
            }).catch((error) => {
                console.error('Error sending video call link:', error);
            })

            toast.success('Video call link sent to the channel');
        }
    }

    if (loading || !chatClient || !channel) return <ChatLoader />
    return (
        <div className="h-[93vh]">
            <Chat client={chatClient}>
                <Channel channel={channel}>
                    <div className="w-full relative">
                        <CallButton handleVideoCall={handleVideoCall} />
                        <Window>
                            <ChannelHeader />
                            <MessageList />
                            <MessageInput focus />
                        </Window>
                    </div>
                    <Thread />
                </Channel>
            </Chat>
        </div>
    )
}

export default ChatPage
