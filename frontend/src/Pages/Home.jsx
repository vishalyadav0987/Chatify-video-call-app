
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { CheckCircleIcon, MapPinIcon, UserPlusIcon, UsersIcon } from "lucide-react";


import FriendCard, { getLanguageFlag } from "../components/FriendCard";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../utils/axios";
import toast from "react-hot-toast";

const Home = () => {

  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());



  // const recommendedUsers = [
  //   {
  //     _id: "3",
  //     fullName: "Alice Johnson",
  //     profilePic: "https://cdn-icons-png.flaticon.com/512/219/219986.png",
  //     nativeLanguage: "French",
  //     learningLanguage: "English",
  //     location: "Paris, France",
  //     bio: "I am passionate about art and literature."
  //   },
  //   {
  //     _id: "4",
  //     fullName: "Bob Brown",
  //     profilePic: "https://cdn-icons-png.flaticon.com/512/219/219986.png",
  //     nativeLanguage: "French",
  //     learningLanguage: "English",
  //     location: "Berlin, Germany",
  //     bio: "I love technology and programming."
  //   },
  //   {
  //     _id: "5",
  //     fullName: "Charlie Green",
  //     profilePic: "https://cdn-icons-png.flaticon.com/512/219/219986.png",
  //     nativeLanguage: "Italian",
  //     learningLanguage: "French",
  //     location: "Rome, Italy",
  //     bio: "I enjoy cooking and trying new recipes."
  //   },
  //   {
  //     _id: "6",
  //     fullName: "Diana Prince",
  //     profilePic: "https://cdn-icons-png.flaticon.com/512/219/219986.png",
  //     nativeLanguage: "Portuguese",
  //     nativeLanguage: "French",
  //     learningLanguage: "English",
  //     bio: "I am a fan of superheroes and comic books."
  //   },
  //   {
  //     _id: "7",
  //     fullName: "Ethan Hunt",
  //     profilePic: "https://cdn-icons-png.flaticon.com/512/219/219986.png",
  //     nativeLanguage: "Russian",
  //     learningLanguage: "Chinese",
  //     location: "Moscow, Russia",
  //     bio: "I love adventure and action movies."
  //   }
  // ]

  // tanstack query to get the friends list
  const { data: friends, isLoading: loadingUser } = useQuery({
    queryKey: ["friends"],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get("/friend/my-friends");
        return response.data.data;
      } catch (error) {
        return [];
      }
    },
  })


  const { data: recommendedUsers, isLoading: loadingRecUser } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get("/friend/recommended-users");
        return response.data.data;
      } catch (error) {
        return [];

      }
    },
  });



  const { data: outgoingFriendRequests } = useQuery({
    queryKey: ["outgoingFriendRequests"],
    queryFn: async () => {
      const response = await axiosInstance.get("/friend/outgoing-friend-requests");
      return response.data.data;

    },
  })

  const queryClient = useQueryClient();

  const { mutate: sendFriendRequest, isPending } = useMutation({
    mutationFn: async (userId) => {
      const response = await axiosInstance.post(`/friend/send-friend-request/${userId}`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendRequests"] });

      toast.success(data.message);
    },
  });


  useEffect(() => {
    const ids = new Set();
    if (outgoingFriendRequests && outgoingFriendRequests.length > 0) {
      outgoingFriendRequests.forEach((request) => {
        ids.add(request.recipient._id);
      });
    };
    setOutgoingRequestsIds(ids);

  }, [outgoingFriendRequests])





  const capitialize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Friends</h2>
          <Link to="/notifications" className="btn btn-outline btn-sm">
            <UsersIcon className="mr-2 size-4" />
            Friend Requests
          </Link>
        </div>

        {loadingUser ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : friends.length === 0 ? (
          <>
            <div className="card bg-base-200 p-6 text-center">
              <h3 className="font-semibold text-lg mb-2">No friends yet</h3>
              <p className="text-base-content opacity-70">
                Start connecting with others by sending friend requests!
              </p>
              <Link to="/notifications" className="btn btn-primary mt-4">
                <UsersIcon className="mr-2 size-4" />
                View Friend Requests
              </Link>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {friends.map((friend) => (
              <FriendCard key={friend._id} friend={friend} />
            ))}
          </div>
        )}

        <section>
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Meet New Learners</h2>
                <p className="opacity-70">
                  Discover perfect language exchange partners based on your profile
                </p>
              </div>
            </div>
          </div>

          {loadingRecUser ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : recommendedUsers.length === 0 ? (
            <div className="card bg-base-200 p-6 text-center">
              <h3 className="font-semibold text-lg mb-2">No recommendations available</h3>
              <p className="text-base-content opacity-70">
                Check back later for new language partners!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedUsers.map((user) => {
                const hasRequestBeenSent = outgoingRequestsIds.has(user?._id);
                return (
                  <div
                    key={user?._id}
                    className="card bg-base-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="card-body p-5 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="avatar size-16 rounded-full">
                          <img src={user.avatar} alt={user.name} />
                        </div>

                        <div>
                          <h3 className="font-semibold text-lg">{user.name}</h3>
                          {user?.location && (
                            <div className="flex items-center text-xs opacity-70 mt-1">
                              <MapPinIcon className="size-3 mr-1" />
                              {user?.location}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Languages with flags */}
                      <div className="flex flex-wrap gap-1.5">
                        <span className="badge badge-secondary">
                          {getLanguageFlag(user.nativeLanguage)}
                          Native: {capitialize(user.nativeLanguage)}
                        </span>
                        <span className="badge badge-outline">
                          {getLanguageFlag(user.learningLanguage)}
                          Learning: {capitialize(user.learningLanguage)}
                        </span>
                      </div>

                      {user.bio && <p className="text-sm opacity-70">{user.bio}</p>}

                      {/* Action button */}
                      <button
                        className={`btn w-full mt-2 ${hasRequestBeenSent ? "btn-disabled" : "btn-primary"
                          } `}
                        onClick={() => sendFriendRequest(user._id)}
                        disabled={hasRequestBeenSent || isPending}
                      >
                        {hasRequestBeenSent ? (
                          <>
                            <CheckCircleIcon className="size-4 mr-2" />
                            Request Sent
                          </>
                        ) : (
                          <>
                            <UserPlusIcon className="size-4 mr-2" />
                            Send Friend Request
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Home;
