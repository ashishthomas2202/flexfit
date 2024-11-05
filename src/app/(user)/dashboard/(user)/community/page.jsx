"use client";

import { useState, useEffect } from "react";
import { CreatePostDialog } from "@/components/dashboard/social/CreatePostDialog";
import { Post } from "@/components/dashboard/social/Post";
import axios from "axios";
import { Page } from "@/components/dashboard/Page";
import { Loader2 } from "lucide-react";

const CommunityPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followers, setFollowers] = useState([]);

  const fetchFollowers = async () => {
    await axios
      .get("/api/follower/followings")
      .then((response) => {
        if (response?.data?.success) {
          setFollowers(response.data.data);
          console.log("followers:", response.data.data);
          return response.data.data;
        }
        return [];
      })
      .catch((error) => {
        return [];
      });
  };
  const fetchPosts = async () => {
    await axios
      .get("/api/post")
      .then((response) => {
        if (response?.data?.success) {
          setPosts(response.data.data);
          return response.data.data;
        }
        return [];
      })
      .catch((error) => {
        return [];
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const createPost = async (post) => {
    await axios
      .post("/api/post/create", post)
      .then((response) => {
        if (response?.data?.success) {
          fetchPosts();
          return response.data.data;
        }
        throw new Error("Failed to create post");
      })
      .catch((error) => {
        throw new Error("Failed to create post");
      });
  };

  const handleDeletePost = async (id) => {
    return await axios
      .delete(`/api/post/${id}/delete`)
      .then((response) => {
        if (response?.data?.success) {
          setPosts(posts.filter((post) => post.id !== id));
          return response.data.data;
        }
        return null;
      })
      .catch((error) => {
        return null;
      });
  };

  const handleFollowChange = async (isFollowing, userId) => {
    if (isFollowing) {
      return await axios
        .delete(`/api/follower/unfollow`, {
          data: { userId },
        })
        .then((response) => {
          if (response?.data?.success) {
            setFollowers(followers.filter((follower) => follower != userId));
            return response.data.data;
          }
          return null;
        })
        .catch((error) => {
          return null;
        });
    } else {
      return await axios
        .post(`/api/follower/follow`, { userId })
        .then((response) => {
          if (response?.data?.success) {
            setFollowers([...followers, userId]);
            return response.data.data;
          }
          return null;
        })
        .catch((error) => {
          return null;
        });
    }
  };

  useEffect(() => {
    fetchFollowers();
    fetchPosts();
  }, []);

  useEffect(() => {
    console.log(followers);
  }, [followers]);

  return (
    <Page className="px-2 dark:bg-transparent">
      {/* Main Content Area */}
      <main className=" flex-1 space-y-4">
        <header className="max-w-3xl mx-auto top-0">
          <h1 className="text-3xl font-bold mb-10">Explore</h1>
          <span className="fixed z-50 md:z-0 bottom-4 right-4 md:relative md:top-0 md:left-0">
            <CreatePostDialog createPost={createPost} />
          </span>
        </header>
        <main className="space-y-4">
          {!posts || posts?.length == 0 ? (
            <div className="min-h-40 max-w-3xl mx-auto flex justify-center items-center text-lg font-light bg-neutral-100 text-neutral-400 dark:bg-neutral-900 dark:text-neutral-700 rounded-lg">
              {loading ? (
                <Loader2 className="h-10 w-10 animate-spin" />
              ) : (
                <p>No posts to display</p>
              )}
            </div>
          ) : (
            posts.map((post) => (
              <Post
                key={post.id}
                data={post}
                onDelete={handleDeletePost}
                isFollowing={followers && followers.includes(post.author._id)}
                onFollowChange={handleFollowChange}
              />
            ))
          )}
        </main>
      </main>
    </Page>
  );
};

export default CommunityPage;
