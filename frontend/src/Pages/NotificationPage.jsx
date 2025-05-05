import { BellIcon, ClockIcon, MessageSquareIcon, UserCheckIcon } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../utils/axios";
import { toast } from "react-hot-toast";

const NotificationsPage = () => {



  const { data: friendRequests, isLoading: friendReqLoader } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get("/friend/friend-requests");
        return response.data;
      } catch (error) {
        return [];
      }
    },
  });



  const queryClient = useQueryClient();

  const { mutate: acceptRequestMutation, isPending } = useMutation({
    mutationFn: async (id) => {
      const response = await axiosInstance.post(`/friend/accept-friend-request/${id}`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      console.log("Friend request accepted successfully", data);
      toast.success("Friend request accepted successfully");
    },
    onError: (error) => {
      console.error("Failed to accept friend request:", error.response?.data || error.message);
      toast.error("You are not authorized to accept this request.");
    },
  });






  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-4xl space-y-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">Notifications</h1>

        {friendReqLoader ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <>
            {friendRequests?.incomingReqs?.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <UserCheckIcon className="h-5 w-5 text-primary" />
                  Friend Requests
                  <span className="badge badge-primary ml-2">{friendRequests?.incomingReqs?.length}</span>
                </h2>

                <div className="space-y-3">
                  {friendRequests?.incomingReqs?.map((request) => (
                    <div
                      key={request._id}
                      className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="card-body p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="avatar w-14 h-14 rounded-full bg-base-300">
                              <img src={request.sender.avatar} alt={request.sender.name} />
                            </div>
                            <div>
                              <h3 className="font-semibold">{request.sender.name}</h3>
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                <span className="badge badge-secondary badge-sm">
                                  Native: {request.sender.nativeLanguage}
                                </span>
                                <span className="badge badge-outline badge-sm">
                                  Learning: {request.sender.learningLanguage}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => acceptRequestMutation(request._id)}
                            disabled={isPending}
                          >
                            Accept
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ACCEPTED REQS NOTIFICATONS */}
            {friendRequests?.acceptedReqs?.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <BellIcon className="h-5 w-5 text-success" />
                  New Connections
                </h2>

                <div className="space-y-3">
                  {friendRequests?.acceptedReqs?.map((notification) => (
                    <div key={notification._id} className="card bg-base-200 shadow-sm">
                      <div className="card-body p-4">
                        <div className="flex items-start gap-3">
                          <div className="avatar mt-1 size-10 rounded-full">
                            <img
                              src={notification.recipient.avatar}
                              alt={notification.recipient.name}
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{notification.recipient.name}</h3>
                            <p className="text-sm my-1">
                              {notification.recipient.name} accepted your friend request
                            </p>
                            <p className="text-xs flex items-center opacity-70">
                              <ClockIcon className="h-3 w-3 mr-1" />
                              Recently
                            </p>
                          </div>
                          <div className="badge badge-success">
                            <MessageSquareIcon className="h-3 w-3 mr-1" />
                            New Friend
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {friendRequests?.incomingReqs?.length === 0 && friendRequests?.acceptedReqs?.length === 0 && (
              <>
                <div className="flex flex-col items-center justify-center h-64">
                  <div className="text-4xl text-gray-500 mb-4">
                    <BellIcon className="h-10 w-10" />
                  </div>
                  <h2 className="text-xl font-semibold">No Notifications</h2>
                  <p className="text-gray-500">You have no new notifications at the moment.</p>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
export default NotificationsPage;