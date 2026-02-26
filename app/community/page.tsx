"use client";

import { useState, useEffect } from "react";
import { sanitizeInput, isValidInput } from "@/app/utils/security";
import { useLocale } from "../../lib/i18n";

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

const FORUM_TOPIC_KEYS: Record<string, string> = {
  general: "community.general",
  recommendations: "community.recommendations",
  character: "community.character",
  translation: "community.translation",
};

const FORUM_TOPICS: ForumTopic[] = [
  { id: "general", title: "General Discussion" },
  { id: "recommendations", title: "Novel Recommendations" },
  { id: "character", title: "Character Analysis" },
  { id: "translation", title: "Translation Discussions" },
];

export default function CommunityPage() {
  const { t } = useLocale();
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
      alert(t("community.loginToPost"));
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
        alert(t("community.postFailed"));
      }
    } catch (error) {
      console.error("Create post error", error);
    }
  };

  // 4. Delete Post
  const handleDeletePost = async (postId: string) => {
    if (!confirm(t("community.deleteConfirm"))) return;

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
        alert(t("community.deleteFailed"));
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
      await fetch(`${getBaseUrl()}/api/community/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ increment: true })
      });
    } catch (err) {
      console.error("Like error", err);
    }
  };

  // 7. Create Comment
  const handleCreateComment = async (e: React.FormEvent, parentId?: string) => {
    e.preventDefault();
    if (!selectedPost) return;

    const token = localStorage.getItem("authToken");
    if (!token) {
      alert(t("community.loginToComment"));
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
    if (!currentUser) return false;
    if (currentUser.username === 'lego1357') return true; // Admin override
    if (resourceUserId && currentUser.id === resourceUserId) return true;
    return false;
  };

  return (
    <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "60px 24px 100px" }}>
      {/* Header & New Post Button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "60px" }}>
        <div>
          <h1 style={{
            fontSize: "42px",
            fontWeight: 600,
            color: "#243A6E",
            fontFamily: '"KoPub Batang", serif',
            letterSpacing: "-0.5px",
            marginBottom: "16px"
          }}>
            {t("community.title")}
          </h1>
          <p style={{ color: "#666", fontSize: "16px", fontFamily: '"KoPub Batang", serif' }}>
            {t("community.subtitle")}
          </p>
        </div>
        <button
          onClick={() => {
            if (filteredTopic) setSelectedTopic(filteredTopic);
            setShowPostModal(true);
          }}
          style={{
            padding: "12px 24px",
            background: "transparent",
            color: "#243A6E",
            border: "1px solid #243A6E",
            borderRadius: "0px",
            cursor: "pointer",
            fontWeight: 500,
            fontSize: "14px",
            fontFamily: "sans-serif",
            transition: "all 0.2s"
          }}
        >
          {t("community.writePost")}
        </button>
      </div>

      <div style={{ display: "flex", gap: "60px", flexDirection: "row" }}>
        {/* Sidebar Topics */}
        <div style={{ width: "200px", flexShrink: 0 }}>
          <h2 style={{
            fontSize: "14px",
            fontWeight: 700,
            marginBottom: "24px",
            color: "#999",
            textTransform: "uppercase",
            letterSpacing: "1px"
          }}>
            {t("community.topics")}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div
              onClick={() => { setFilteredTopic(null); fetchPosts(); }}
              style={{
                cursor: "pointer",
                color: !filteredTopic ? "#243A6E" : "#666",
                fontWeight: !filteredTopic ? 700 : 400,
                fontFamily: !filteredTopic ? '"KoPub Batang", serif' : "sans-serif",
                fontSize: !filteredTopic ? "18px" : "15px",
                paddingLeft: !filteredTopic ? "12px" : "0",
                borderLeft: !filteredTopic ? "2px solid #243A6E" : "none",
                transition: "all 0.2s ease"
              }}>
              {t("community.allPosts")}
            </div>
            {FORUM_TOPICS.map(topic => (
              <div key={topic.id}
                onClick={() => { setFilteredTopic(topic.id); fetchPosts(topic.id); }}
                style={{
                  cursor: "pointer",
                  color: filteredTopic === topic.id ? "#243A6E" : "#666",
                  fontWeight: filteredTopic === topic.id ? 700 : 400,
                  fontFamily: filteredTopic === topic.id ? '"KoPub Batang", serif' : "sans-serif",
                  fontSize: filteredTopic === topic.id ? "18px" : "15px",
                  paddingLeft: filteredTopic === topic.id ? "12px" : "0",
                  borderLeft: filteredTopic === topic.id ? "2px solid #243A6E" : "none",
                  transition: "all 0.2s ease"
                }}>
                {t(FORUM_TOPIC_KEYS[topic.id] || topic.title)}
              </div>
            ))}
          </div>
        </div>

        {/* Post List */}
        <div style={{ flex: 1 }}>
          <div style={{ borderBottom: "1px solid #243A6E", marginBottom: "32px", paddingBottom: "16px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#243A6E", textTransform: "uppercase", letterSpacing: "1px" }}>
              {filteredTopic ? t(FORUM_TOPIC_KEYS[filteredTopic] || "") : t("community.recentPosts")}
            </h2>
          </div>

          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#999" }}>{t("common.loading")}</div>
          ) : posts.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#999", border: "1px dashed #ddd" }}>{t("community.noPosts")}</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {posts.map(post => (
                <div key={post.id} onClick={() => handlePostClick(post)}
                  style={{
                    padding: "32px 0",
                    borderBottom: "1px solid #eee",
                    cursor: "pointer",
                    transition: "opacity 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = "0.7"}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <span style={{
                      fontSize: "22px",
                      fontWeight: 600,
                      color: "#171717",
                      fontFamily: '"KoPub Batang", serif',
                      lineHeight: 1.4
                    }}>
                      {post.title}
                    </span>
                    {isOwner(post.author, post.user_id) && (
                      <button onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id); }}
                        style={{ color: "#999", background: "none", border: "none", cursor: "pointer", fontSize: "12px" }}>{t("community.delete")}</button>
                    )}
                  </div>

                  <p style={{ fontSize: "15px", color: "#555", marginBottom: "16px", lineHeight: 1.6, maxWidth: "90%" }}>
                    {post.content.length > 140 ? post.content.substring(0, 140) + "..." : post.content}
                  </p>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#888", fontFamily: "sans-serif" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontWeight: 600, color: "#243A6E" }}>{post.author_name || post.author}</span>
                      <span>·</span>
                      <span>{getTimeAgo(post.created_at)}</span>
                    </span>
                    <div style={{ display: "flex", gap: "16px" }}>
                      <span onClick={(e) => handleLike(post.id, e)} style={{ cursor: "pointer", color: post.liked_by_me ? "#e74c3c" : "#888" }}>
                        {post.liked_by_me ? "♥" : "♡"} {post.likes}
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
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(255,255,255,0.95)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "40px" }}
          onClick={() => setSelectedPost(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", padding: "60px", boxShadow: "0 20px 40px rgba(0,0,0,0.1)", maxWidth: "800px", width: "100%", maxHeight: "90vh", overflow: "auto", position: "relative" }}>
            <button onClick={() => setSelectedPost(null)} style={{ position: "absolute", top: "24px", right: "24px", background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#999" }}>×</button>

            <h2 style={{ fontSize: "32px", fontWeight: 600, color: "#171717", marginBottom: "24px", fontFamily: '"KoPub Batang", serif', lineHeight: 1.3 }}>{selectedPost.title}</h2>

            <div style={{ fontSize: "14px", color: "#666", marginBottom: "40px", borderBottom: "1px solid #eee", paddingBottom: "24px", display: "flex", justifyContent: "space-between" }}>
              <span>{t("community.by")} <strong style={{ color: "#243A6E" }}>{selectedPost.author_name || selectedPost.author}</strong></span>
              <span>{getTimeAgo(selectedPost.created_at)}</span>
            </div>

            <div style={{ lineHeight: 1.8, fontSize: "17px", color: "#333", marginBottom: "60px", whiteSpace: "pre-wrap", fontFamily: '"KoPub Batang", serif' }}>
              {selectedPost.content}
            </div>

            {/* Comments */}
            <div style={{ marginTop: "40px", borderTop: "2px solid #171717", paddingTop: "40px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>{t("community.comments")}</h3>
                <button onClick={() => setShowCommentForm(!showCommentForm)}
                  style={{ fontSize: "14px", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", color: "#243A6E" }}>
                  {t("community.writeComment")}
                </button>
              </div>

              {showCommentForm && (
                <form onSubmit={(e) => handleCreateComment(e)} style={{ marginBottom: "40px" }}>
                  <textarea value={newComment} onChange={e => setNewComment(e.target.value)}
                    placeholder={t("comment.placeholder")}
                    style={{ width: "100%", padding: "16px", border: "1px solid #ddd", minHeight: "100px", marginBottom: "12px", fontFamily: "inherit", fontSize: "15px", outline: "none" }} />
                  <div style={{ textAlign: "right" }}>
                    <button type="submit" style={{ padding: "10px 24px", background: "#243A6E", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600 }}>{t("community.submitComment")}</button>
                  </div>
                </form>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                {comments.length === 0 && <div style={{ color: "#999", fontStyle: "italic" }}>{t("community.noComments")}</div>}
                {comments.map(comment => (
                  <div key={comment.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ fontWeight: 600, fontSize: "15px", color: "#243A6E" }}>{comment.author_name}</span>
                      <span style={{ fontSize: "12px", color: "#999" }}>{getTimeAgo(comment.created_at)}</span>
                    </div>
                    <div style={{ fontSize: "15px", lineHeight: 1.6, marginBottom: "12px", color: "#444" }}>{comment.content}</div>
                    <button onClick={() => setReplyingTo(comment.id)} style={{ fontSize: "12px", color: "#999", background: "none", border: "none", cursor: "pointer", padding: 0 }}>{t("comment.reply")}</button>

                    {/* Reply Form */}
                    {replyingTo === comment.id && (
                      <form onSubmit={(e) => handleCreateComment(e, comment.id)} style={{ marginTop: "16px", paddingLeft: "16px", borderLeft: "2px solid #ddd" }}>
                        <input value={newReply} onChange={e => setNewReply(e.target.value)} placeholder={t("community.replyPlaceholder")}
                          style={{ width: "100%", padding: "8px", marginBottom: "8px", border: "none", borderBottom: "1px solid #ddd", outline: "none" }} />
                        <button type="submit" style={{ fontSize: "12px", fontWeight: 600, color: "#243A6E", background: "none", border: "none", cursor: "pointer" }}>{t("community.submitReply")}</button>
                      </form>
                    )}

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div style={{ marginTop: "16px", paddingLeft: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                        {comment.replies.map(reply => (
                          <div key={reply.id} style={{ background: "#f9fafb", padding: "12px" }}>
                            <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "4px", color: "#555" }}>{reply.author_name}</div>
                            <div style={{ fontSize: "14px", color: "#666" }}>{reply.content}</div>
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
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(255,255,255,0.95)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <form onSubmit={handleCreatePost} style={{ background: "#fff", padding: "60px", boxShadow: "0 20px 40px rgba(0,0,0,0.1)", width: "600px", maxWidth: "90%", border: "1px solid #eee" }}>
            <h2 style={{ marginBottom: "40px", fontSize: "28px", fontFamily: '"KoPub Batang", serif', textAlign: "center", color: "#243A6E" }}>{t("community.startDiscussion")}</h2>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", marginBottom: "12px", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#999" }}>{t("community.category")}</label>
              <select value={selectedTopic} onChange={e => setSelectedTopic(e.target.value)}
                style={{ width: "100%", padding: "12px", border: "none", borderBottom: "2px solid #eee", fontSize: "16px", outline: "none", background: "none" }}>
                {FORUM_TOPICS.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", marginBottom: "12px", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#999" }}>{t("community.postTitle")}</label>
              <input value={newPostTitle} onChange={e => setNewPostTitle(e.target.value)} required placeholder={t("community.titlePlaceholder")}
                style={{ width: "100%", padding: "12px", border: "none", borderBottom: "2px solid #eee", fontSize: "18px", outline: "none", fontFamily: '"KoPub Batang", serif' }} />
            </div>

            <div style={{ marginBottom: "40px" }}>
              <label style={{ display: "block", marginBottom: "12px", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#999" }}>{t("community.content")}</label>
              <textarea value={newPostContent} onChange={e => setNewPostContent(e.target.value)} required placeholder={t("community.contentPlaceholder")}
                style={{ width: "100%", padding: "12px", border: "1px solid #eee", minHeight: "200px", fontSize: "16px", outline: "none", fontFamily: '"KoPub Batang", serif', lineHeight: 1.6 }} />
            </div>

            <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
              <button type="button" onClick={() => setShowPostModal(false)}
                style={{ padding: "12px 32px", background: "none", border: "1px solid #ddd", cursor: "pointer", fontSize: "14px" }}>{t("community.cancel")}</button>
              <button type="submit"
                style={{ padding: "12px 32px", background: "#243A6E", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "14px" }}>{t("community.publish")}</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
