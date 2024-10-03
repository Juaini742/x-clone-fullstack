import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { updateUser } from "../api";

const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: updateProfile, isPending: isUpdatingProfile } =
    useMutation({
      mutationFn: async (formData) => {
        await updateUser(formData);
      },
      onSuccess: () => {
        toast.success("Profile updated successfully");
        Promise.all([
          queryClient.invalidateQueries({ queryKey: ["authUser"] }),
          queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
        ]);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  return { updateProfile, isUpdatingProfile };
};

export default useUpdateUserProfile;
