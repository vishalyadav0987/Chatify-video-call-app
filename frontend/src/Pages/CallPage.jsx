import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axiosInstance from '../utils/axios';
import authUserHook from '../customHook/authUserHook';

import {
    CallControls,
    CallingState,
    SpeakerLayout,
    StreamCall,
    StreamTheme,
    StreamVideo,
    StreamVideoClient,
    useCallStateHooks,
  } from '@stream-io/video-react-sdk';
  import '@stream-io/video-react-sdk/dist/css/styles.css';
import toast from 'react-hot-toast';
import PageLoader from '../Components/PageLoader';

  const REACT_APP_STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const CallPage = () => {
    const {id:callId} = useParams();
    const [client,setClient] = useState(null);
    const [call,setCall] = useState(null);
    const [isConnecting,setIsConnecting] = useState(true);


    const {authUser , isLoading} = authUserHook()

    const { data: streamToken } = useQuery({
        queryKey: ["streamToken"],
        queryFn: async () => {
            const response = await axiosInstance.get('/chat/token');
            return response.data;
        },
        enabled: !!authUser // Only fetch if authUser is available
    });

    useEffect(()=>{
        const initCall = async()=>{
            if(!authUser || !streamToken.token || !callId) return;
            try {
                console.log('Initlizing the call');
                const user = {
                    id:authUser._id,
                    name:authUser.name,
                    image:authUser.avatar,
                }

                const videoClient = new StreamVideoClient({
                    apiKey:REACT_APP_STREAM_API_KEY,
                    user,
                    token:streamToken.token,
                });

                const callInstance = videoClient.call("default",callId);
                await callInstance.join({
                    create:true,
                });

                console.log("Call connnecting Successfully!");
                setClient(videoClient);
                setCall(callInstance)
                
            } catch (error) {
                console.error('Error initializing chat client:', error);
                toast.error("Could not join the call. Please try again later.")
            }finally{
                setIsConnecting(false)
            }
        }
        initCall();
    },[streamToken,callId,authUser]);

    if(isLoading || isConnecting) return <PageLoader/>


  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="relative">
        {client && call ? (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <CallContent />
            </StreamCall>
          </StreamVideo>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>Could not initialize call. Please refresh or try again later.</p>
          </div>
        )}
      </div>
    </div>
  )
}

const CallContent = () => {
    const { useCallCallingState } = useCallStateHooks();
    const callingState = useCallCallingState();
  
    const navigate = useNavigate();
  
    if (callingState === CallingState.LEFT) return navigate("/");
  
    return (
      <StreamTheme>
        <SpeakerLayout />
        <CallControls />
      </StreamTheme>
    );
  };
  

export default CallPage
