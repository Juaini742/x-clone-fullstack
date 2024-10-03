/* eslint-disable react/prop-types */
import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { getAllPosts } from "../../api";

const Posts = ({ feedType, email, userId }) => {
  const {
    data: posts,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const res = await getAllPosts({ feedType, email, userId });
      return res;
    },
  });

  useEffect(() => {
    refetch();
  }, [feedType, refetch, email]);

  return (
    <>
      {(isLoading || isRefetching) && (
        <div className="flex flex-col justify-center">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
      {!isLoading && !isRefetching && posts?.length === 0 && (
        <p className="text-center my-4">No posts in this tab. Switch 👻</p>
      )}
      {!isLoading && !isRefetching && posts && (
        <div>
          {posts.map((post, index) => (
            <Post key={index} post={post} />
          ))}
        </div>
      )}
    </>
  );
};
export default Posts;
