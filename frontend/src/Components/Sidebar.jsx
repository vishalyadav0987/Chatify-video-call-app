import { BellIcon, HomeIcon, ShipWheelIcon, UsersIcon } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'
import authUserHook  from '../customHook/authUserHook'

const Sidebar = () => {
    const currentPath = window.location.pathname
    const {authUser} = authUserHook();
    
    return (
        <div className='bg-base-200 border-r border-base-300 hidden lg:flex flex-col h-screen sticky top-0 w-60' data-theme="sunset">
            <div className='flex flex-col h-full'>
                <div className='flex items-center justify-start h-16 *:py-4 px-4'>
                    <Link to="/" className="flex items-center gap-2.5">
                        <ShipWheelIcon className="size-9 text-primary" />
                        <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary  tracking-wider">
                            Chatify
                        </span>
                    </Link>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    <Link
                        to="/"
                        className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${currentPath === "/" ? "btn-active" : ""
                            }`}
                    >
                        <HomeIcon className="size-5 text-base-content opacity-70" />
                        <span>Home</span>
                    </Link>

                    <Link
                        to="/friends"
                        className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${currentPath === "/friends" ? "btn-active" : ""
                            }`}
                    >
                        <UsersIcon className="size-5 text-base-content opacity-70" />
                        <span>Friends</span>
                    </Link>

                    <Link
                        to="/notifications"
                        className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${currentPath === "/notifications" ? "btn-active" : ""
                            }`}
                    >
                        <BellIcon className="size-5 text-base-content opacity-70" />
                        <span>Notifications</span>
                    </Link>
                </nav>

                {/* USER PROFILE SECTION */}
                <div className="p-4 border-t border-base-300 mt-auto">
                    <div className="flex items-center gap-3">
                        <div className="avatar">
                            <div className="w-10 rounded-full">
                                <img src={authUser?.avatar} alt="User Avatar" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-sm">{authUser?.name}</p>
                            <p className="text-xs text-success flex items-center gap-1">
                                <span className="size-2 rounded-full bg-success inline-block" />
                                Online
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Sidebar
