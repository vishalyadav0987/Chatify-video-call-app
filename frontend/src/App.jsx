import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import SignUpPage from './Pages/SignUpPage'
import LoginPage from './Pages/LoginPage'
import Home from './Pages/Home'
import Layout from './Components/Layout'
import NotificationPage from './Pages/NotificationPage'
import OnboardingPage from './Pages/OnboardingPage'
import { Toaster } from 'react-hot-toast'
import authUserHook from './customHook/authUserHook'
import PageLoader from './Components/PageLoader'
import ChatPage from './Pages/ChatPage'
import CallPage from './Pages/CallPage'


const App = () => {

  const { authUser, isLoading } = authUserHook();

  const isAuthenticated = Boolean(authUser);
  const isOnboarding = authUser?.isOnboarded;

  if (isLoading) return <PageLoader />

  // console.log("Auth User: ", authUser);


  return (
    <div className='h-screen' data-theme="sunset">
      <Routes>
        <Route path='/' element={
          (isAuthenticated && isOnboarding) ? <Layout showSidebar={true}>
            <Home />
          </Layout> : <Navigate to={
            isAuthenticated ? '/onboarding' : '/login'
          } />
        } />
        <Route path='/signup' element={!isAuthenticated ? <SignUpPage /> : <Navigate to={'/'} />} />
        <Route path='/login' element={!isAuthenticated ? <LoginPage /> : <Navigate to={
          isOnboarding ? '/' : '/onboarding'
        } />} />
        <Route path='/notifications' element={
          isAuthenticated && isOnboarding ? <Layout showSidebar={true}>
            <NotificationPage />
          </Layout> : <Navigate to={
            isAuthenticated ? '/onboarding' : '/login'
          } />
        } />
        <Route path='/chat/:chatId' element={
          isAuthenticated && isOnboarding ? <Layout showSidebar={false}>
            <ChatPage />
          </Layout> : <Navigate to={
            isAuthenticated ? '/onboarding' : '/login'
          } />
        } />

        <Route path='/video-call/:id' element={
          isAuthenticated && isOnboarding ? <Layout showSidebar={false}>
            <CallPage />
          </Layout> : <Navigate to={
            isAuthenticated ? '/onboarding' : '/login'
          } />
        } />
        <Route path='/onboarding' element={
          isAuthenticated && !isOnboarding ?
            <OnboardingPage />
            : <Navigate to={
              isAuthenticated ? '/' : '/login'
            } />
        } />
      </Routes>
      <Toaster position='bottom-center' />
    </div>
  )
}

export default App
