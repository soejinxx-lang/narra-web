"use client";

import { useState, useEffect, useCallback } from "react";
import { sanitizeInput, isValidInput } from "@/app/utils/security";

interface Comment {
  id: string;
  author: string;
  author_name: string;
  content: string;
  created_at: string;
  replies: Comment[];
  parent_id?: string;
  user_id: string; // for ownership check
}

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  author_name: string;
  created_at: string;
  topic: string;
  views: number;
  likes: number; // Simple integer
  liked_by_me: boolean;
  comment_count: number;
  user_id?: string; // for ownership check
}

interface ForumTopic {
  id: string;
  title: string;
}

const FORUM_TOPICS: ForumTopic[] = [
  { id: "general", title: "General Discussion" },
  { id: "recommendations", title: "Novel Recommendations" },
  { id: "character", title: "Character Analysis" },
  { id: "translation", title: "Translation Discussions" },
];

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Post State
  const [showPostModal, setShowPostModal] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string>("general");

  // Filter State
  const [filteredTopic, setFilteredTopic] = useState<string | null>(null);

  // Detail View State
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);

  // Comment State
  const [newComment, setNewComment] = useState("");
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [newReply, setNewReply] = useState("");

  // Auth State
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Helper: Get Base URL
  const getBaseUrl = () => process.env.NEXT_PUBLIC_STORAGE_BASE_URL?.replace('/api', '') || '';

  // 1. Initial Load & Auth Check
  useEffect(() => {
    const userStr = localStorage.getItem("currentUser");
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {
        console.error("Failed to parse user", e);
      }
    }
    fetchPosts();
  }, []);

  // 2. Fetch Posts
  const fetchPosts = async (topic?: string) => {
    setLoading(true);
    try {
      const url = new URL(`${getBaseUrl()}/api/community/posts`);
      if (topic) url.searchParams.set("topic", topic);

      const res = await fetch(url.toString(), { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error("Fetch posts failed", error);
    } finally {
      setLoading(false);
    }
  };

  // 3. Create Post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");

    if (!token) {
      alert("Please log in to create a post.");
      return;
    }

    const title = sanitizeInput(newPostTitle.trim());
    const content = sanitizeInput(newPostContent.trim());

    if (!title || !content) return;
    if (!isValidInput(title, 200) || !isValidInput(content, 10000)) return;

    try {
      const res = await fetch(`${getBaseUrl()}/api/community/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ title, content, topic: selectedTopic })
      });

      if (res.ok) {
        // Refresh posts
        setNewPostTitle("");
        setNewPostContent("");
        setShowPostModal(false);
        fetchPosts(filteredTopic || undefined);
      } else {
        alert("Failed to create post. Please try again.");
      }
    } catch (error) {
      console.error("Create post error", error);
    }
  };

  // 4. Delete Post
  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      const res = await fetch(`${getBaseUrl()}/api/community/posts/${postId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        setPosts(prev => prev.filter(p => p.id !== postId));
        if (selectedPost?.id === postId) setSelectedPost(null);
      } else {
        alert("Failed to delete post.");
      }
    } catch (error) {
      console.error("Delete post error", error);
    }
  };

  // 5. Select Post & Fetch Comments
  const handlePostClick = async (post: Post) => {
    setSelectedPost(post);
    setComments([]);

    // Fetch full detail (including increment view)
    try {
      // 1. Get Detail (View +1)
      const detailRes = await fetch(`${getBaseUrl()}/api/community/posts/${post.id}`, { cache: "no-store" });
      if (detailRes.ok) {
        const data = await detailRes.json();
        setSelectedPost(data.post); // Update view count/likes
      }

      // 2. Get Comments
      const commentsRes = await fetch(`${getBaseUrl()}/api/community/posts/${post.id}/comments`, { cache: "no-store" });
      if (commentsRes.ok) {
        const data = await commentsRes.json();
        setComments(data.comments || []);
      }
    } catch (e) {
      console.error("Fetch detail error", e);
    }
  };

  // 6. Toggle Like
  const handleLike = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Optimistic update
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const isLiked = !!p.liked_by_me;
        return {
          ...p,
          likes: Math.max(0, (p.likes || 0) + (isLiked ? -1 : 1)),
          liked_by_me: !isLiked
        };
      }
      return p;
    }));

    // In detail view
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost(prev => {
        if (!prev) return null;
        const isLiked = !!prev.liked_by_me;
        return {
          ...prev,
          likes: Math.max(0, (prev.likes || 0) + (isLiked ? -1 : 1)),
          liked_by_me: !isLiked
        };
      });
    }

    try {
      // Fire and forget (simple toggle logic)
      // Actually our API logic is just "increment". 
      // If user spams click, it just goes up. That's fine for simple MVP.
      await fetch(`${getBaseUrl()}/api/community/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ increment: true })
      });
    } catch (err) {
      // revert if failed? nah, simple MVP.
      console.error("Like error", err);
    }
  };

  // 7. Create Comment
  const handleCreateComment = async (e: React.FormEvent, parentId?: string) => {
    e.preventDefault();
    if (!selectedPost) return;

    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Please log in to comment.");
      return;
    }

    const content = parentId ? newReply : newComment;
    const cleanContent = sanitizeInput(content.trim());

    if (!cleanContent) return;

    try {
      const res = await fetch(`${getBaseUrl()}/api/community/posts/${selectedPost.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ content: cleanContent, parent_id: parentId })
      });

      if (res.ok) {
        const data = await res.json();
        // Refresh comments
        const commentsRes = await fetch(`${getBaseUrl()}/api/community/posts/${selectedPost.id}/comments`, { cache: "no-store" });
        if (commentsRes.ok) {
          const cData = await commentsRes.json();
          setComments(cData.comments || []);
        }

        // Clear inputs
        if (parentId) {
          setNewReply("");
          setReplyingTo(null);
        } else {
          setNewComment("");
          setShowCommentForm(false);
        }
      }
    } catch (err) {
      console.error("Comment error", err);
    }
  };

  // --- Render Helpers ---
  const getTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diff = (now.getTime() - date.getTime()) / 1000;
      if (diff < 60) return "just now";
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return date.toLocaleDateString();
    } catch (e) {
      return dateStr;
    }
  };

  const isOwner = (authorUsername: string, resourceUserId?: string) => {
    // Check via ID if available (secure), else username fallback
    if (!currentUser) return false;
    if (currentUser.username === 'lego1357') return true; // Admin override
    if (resourceUserId && currentUser.id === resourceUserId) return true;
    return false; // Default safe
  };

  return (
    <main style={{ padding: "32px 24px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: 600, color: "#243A6E", fontFamily: '"KoPub Batang", serif' }}>
          Community
        </h1>
        <button
          onClick={() => {
            if (filteredTopic) setSelectedTopic(filteredTopic);
            setShowPostModal(true);
          }}
          style={{
            padding: "12px 24px", background: "#243A6E", color: "#fff",
            border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 500
          }}
        >
          + Create Post
        </button>
      </div>

      <div style={{ display: "grid", gap: "24px", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
        {/* Topics (Left Sidebar) */}
        <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", border: "1px solid #e5e5e5", height: "fit-content" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px", color: "#243A6E", fontFamily: '"KoPub Batang", serif' }}>
            Forums
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div onClick={() => { setFilteredTopic(null); fetchPosts(); }}
              style={{ padding: "12px", borderRadius: "8px", cursor: "pointer", background: !filteredTopic ? "#243A6E" : "#f5f5f5", color: !filteredTopic ? "#fff" : "#333" }}>
              All Posts
            </div>
            {FORUM_TOPICS.map(topic => (
              <div key={topic.id}
                onClick={() => { setFilteredTopic(topic.id); fetchPosts(topic.id); }}
                style={{ padding: "12px", borderRadius: "8px", cursor: "pointer", background: filteredTopic === topic.id ? "#243A6E" : "#f5f5f5", color: filteredTopic === topic.id ? "#fff" : "#333" }}>
                {topic.title}
              </div>
            ))}
          </div>
        </div>

        {/* Post List */}
        <div style={{ gridColumn: "span 2", background: "#fff", borderRadius: "12px", padding: "24px", border: "1px solid #e5e5e5", minHeight: "500px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px", color: "#243A6E", fontFamily: '"KoPub Batang", serif' }}>
            {filteredTopic ? FORUM_TOPICS.find(t => t.id === filteredTopic)?.title : "Recent Posts"}
          </h2>

          {loading ? (
            <div>Loading...</div>
          ) : posts.length === 0 ? (
            <div style={{ color: "#999", padding: "20px", textAlign: "center" }}>No posts yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {posts.map(post => (
                <div key={post.id} onClick={() => handlePostClick(post)}
                  style={{ padding: "16px", background: "#faf9f6", borderRadius: "8px", border: "1px solid #e5e5e5", cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontWeight: 600, color: "#243A6E", fontSize: "16px" }}>{post.title}</span>
                    {isOwner(post.author, post.user_id) && (
                      <button onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id); }}
                        style={{ color: "#e74c3c", background: "none", border: "none", cursor: "pointer" }}>Delete</button>
                    )}
                  </div>
                  <p style={{ fontSize: "14px", color: "#666", marginBottom: "12px" }}>
                    {post.content.length > 100 ? post.content.substring(0, 100) + "..." : post.content}
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#999" }}>
                    <span>by {post.author_name || post.author} · {getTimeAgo(post.created_at)}</span>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <span onClick={(e) => handleLike(post.id, e)} style={{ cursor: "pointer", opacity: post.liked_by_me ? 1 : 0.7 }}>
                        {post.liked_by_me ? "❤️" : "🤍"} {post.likes}
                      </span>
                      <span>💬 {post.comment_count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}
          onClick={() => setSelectedPost(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", padding: "32px", borderRadius: "12px", maxWidth: "800px", width: "90%", maxHeight: "90vh", overflow: "auto" }}>
            <h2 style={{ fontSize: "24px", fontWeight: 600, color: "#243A6E", marginBottom: "16px" }}>{selectedPost.title}</h2>
            <div style={{ fontSize: "14px", color: "#666", marginBottom: "24px", borderBottom: "1px solid #eee", paddingBottom: "16px" }}>
              by {selectedPost.author_name || selectedPost.author} · {getTimeAgo(selectedPost.created_at)}
            </div>
            <div style={{ lineHeight: 1.6, marginBottom: "32px", whiteSpace: "pre-wrap" }}>
              {selectedPost.content}
            </div>

            {/* Comments */}
            <div style={{ marginTop: "40px", borderTop: "1px solid #e5e5e5", paddingTop: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: 600 }}>Comments</h3>
                <button onClick={() => setShowCommentForm(!showCommentForm)}
                  style={{ padding: "8px 16px", background: "#eee", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                  Write Comment
                </button>
              </div>

              {showCommentForm && (
                <form onSubmit={(e) => handleCreateComment(e)} style={{ marginBottom: "24px" }}>
                  <textarea value={newComment} onChange={e => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "8px", minHeight: "80px", marginBottom: "8px" }} />
                  <button type="submit" style={{ padding: "8px 16px", background: "#243A6E", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>Submit</button>
                </form>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {comments.length === 0 && <div style={{ color: "#999" }}>No comments yet.</div>}
                {comments.map(comment => (
                  <div key={comment.id} style={{ padding: "16px", background: "#f9f9f9", borderRadius: "8px" }}>
                    <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "4px" }}>{comment.author_name}</div>
                    <div style={{ fontSize: "12px", color: "#999", marginBottom: "8px" }}>{getTimeAgo(comment.created_at)}</div>
                    <div style={{ marginBottom: "8px" }}>{comment.content}</div>
                    <button onClick={() => setReplyingTo(comment.id)} style={{ fontSize: "12px", color: "#666", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Reply</button>

                    {/* Reply Form */}
                    {replyingTo === comment.id && (
                      <form onSubmit={(e) => handleCreateComment(e, comment.id)} style={{ marginTop: "12px", marginLeft: "20px" }}>
                        <input value={newReply} onChange={e => setNewReply(e.target.value)} placeholder="Write a reply..."
                          style={{ width: "100%", padding: "8px", marginBottom: "8px", border: "1px solid #ddd", borderRadius: "4px" }} />
                        <button type="submit" style={{ padding: "4px 12px", background: "#243A6E", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>Reply</button>
                      </form>
                    )}

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div style={{ marginTop: "12px", marginLeft: "20px", borderLeft: "2px solid #ddd", paddingLeft: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
                        {comment.replies.map(reply => (
                          <div key={reply.id}>
                            <div style={{ fontSize: "13px", fontWeight: 600 }}>{reply.author_name}</div>
                            <div style={{ fontSize: "13px" }}>{reply.content}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {showPostModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <form onSubmit={handleCreatePost} style={{ background: "#fff", padding: "32px", borderRadius: "12px", width: "500px", maxWidth: "90%" }}>
            <h2 style={{ marginBottom: "24px" }}>Create New Post</h2>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>Category</label>
              <select value={selectedTopic} onChange={e => setSelectedTopic(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }}>
                {FORUM_TOPICS.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>Title</label>
              <input value={newPostTitle} onChange={e => setNewPostTitle(e.target.value)} required
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }} />
            </div>
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>Content</label>
              <textarea value={newPostContent} onChange={e => setNewPostContent(e.target.value)} required
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", minHeight: "150px" }} />
            </div>
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setShowPostModal(false)}
                style={{ padding: "10px 20px", background: "#eee", border: "none", borderRadius: "8px", cursor: "pointer" }}>Cancel</button>
              <button type="submit"
                style={{ padding: "10px 20px", background: "#243A6E", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>Create</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
