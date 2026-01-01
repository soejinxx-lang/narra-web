"use client";

import { useState, useEffect } from "react";

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  time: string;
  replies: number;
}

interface ForumTopic {
  id: string;
  title: string;
  count: number;
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [topics, setTopics] = useState<ForumTopic[]>([
    { id: "general", title: "General Discussion", count: 0 },
    { id: "recommendations", title: "Novel Recommendations", count: 0 },
    { id: "character", title: "Character Analysis", count: 0 },
    { id: "translation", title: "Translation Discussions", count: 0 },
  ]);
  const [showPostModal, setShowPostModal] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostAuthor, setNewPostAuthor] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string>("general");

  useEffect(() => {
    const savedPosts = localStorage.getItem("communityPosts");
    const savedTopics = localStorage.getItem("communityTopics");
    
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    }
    if (savedTopics) {
      setTopics(JSON.parse(savedTopics));
    }
  }, []);

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim() || !newPostAuthor.trim()) {
      return;
    }

    const newPost: Post = {
      id: Date.now().toString(),
      title: newPostTitle,
      content: newPostContent,
      author: newPostAuthor,
      time: "just now",
      replies: 0,
    };

    const updatedPosts = [newPost, ...posts];
    setPosts(updatedPosts);
    localStorage.setItem("communityPosts", JSON.stringify(updatedPosts));

    // Update topic count
    const updatedTopics = topics.map((topic) =>
      topic.id === selectedTopic ? { ...topic, count: topic.count + 1 } : topic
    );
    setTopics(updatedTopics);
    localStorage.setItem("communityTopics", JSON.stringify(updatedTopics));

    // Reset form
    setNewPostTitle("");
    setNewPostContent("");
    setNewPostAuthor("");
    setShowPostModal(false);
  };

  return (
    <main style={{ padding: "32px 24px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <h1
          style={{
            fontSize: "32px",
            fontWeight: 600,
            color: "#243A6E",
            fontFamily: '"KoPub Batang", serif',
          }}
        >
          Community
        </h1>
        <button
          onClick={() => setShowPostModal(true)}
          style={{
            padding: "12px 24px",
            background: "#243A6E",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#1e2f56";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#243A6E";
          }}
        >
          + Create Post
        </button>
      </div>

      <div style={{ display: "grid", gap: "24px", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
        {/* Discussion Forums */}
        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "24px",
            border: "1px solid #e5e5e5",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <h2
            style={{
              fontSize: "20px",
              fontWeight: 600,
              marginBottom: "16px",
              color: "#243A6E",
              fontFamily: '"KoPub Batang", serif',
            }}
          >
            Discussion Forums
          </h2>
          <p style={{ color: "#666", marginBottom: "16px", lineHeight: 1.6 }}>
            Join discussions about your favorite novels, share theories, and connect with fellow readers.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {topics.map((forum) => (
              <div
                key={forum.id}
                style={{
                  padding: "12px",
                  background: "#faf9f6",
                  borderRadius: "8px",
                  border: "1px solid #e5e5e5",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f0f0f0";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#faf9f6";
                }}
              >
                <div style={{ fontWeight: 500, marginBottom: "4px", color: "#243A6E" }}>{forum.title}</div>
                <div style={{ fontSize: "12px", color: "#999" }}>{forum.count} topics</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Posts */}
        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "24px",
            border: "1px solid #e5e5e5",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            gridColumn: "span 2",
          }}
        >
          <h2
            style={{
              fontSize: "20px",
              fontWeight: 600,
              marginBottom: "16px",
              color: "#243A6E",
              fontFamily: '"KoPub Batang", serif',
            }}
          >
            Recent Posts
          </h2>
          {posts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
              No posts yet. Be the first to create a post!
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {posts.map((post) => (
                <div
                  key={post.id}
                  style={{
                    padding: "16px",
                    background: "#faf9f6",
                    borderRadius: "8px",
                    border: "1px solid #e5e5e5",
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f0f0f0";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#faf9f6";
                  }}
                >
                  <div style={{ fontWeight: 500, marginBottom: "8px", color: "#243A6E" }}>{post.title}</div>
                  <div style={{ fontSize: "13px", color: "#666", marginBottom: "8px", lineHeight: 1.5 }}>
                    {post.content.length > 150 ? `${post.content.substring(0, 150)}...` : post.content}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: "12px", color: "#999" }}>
                      by {post.author} · {post.time}
                    </div>
                    <div style={{ fontSize: "12px", color: "#243A6E", fontWeight: 500 }}>{post.replies} replies</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Community Guidelines */}
      <div
        style={{
          marginTop: "32px",
          background: "#fff",
          borderRadius: "12px",
          padding: "24px",
          border: "1px solid #e5e5e5",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <h2
          style={{
            fontSize: "20px",
            fontWeight: 600,
            marginBottom: "16px",
            color: "#243A6E",
            fontFamily: '"KoPub Batang", serif',
          }}
        >
          Community Guidelines
        </h2>
        <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
          {[
            "Be respectful to all members and their opinions",
            "Keep discussions relevant to web novels and literature",
            "No spam, advertisements, or self-promotion",
            "Spoiler tags are required for recent chapters",
            "Report any inappropriate content to moderators",
          ].map((guideline, index) => (
            <li
              key={index}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                color: "#666",
                lineHeight: 1.6,
              }}
            >
              <span style={{ color: "#243A6E", fontWeight: 600 }}>•</span>
              <span>{guideline}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Post Modal */}
      {showPostModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowPostModal(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "32px",
              maxWidth: "600px",
              width: "90%",
              maxHeight: "90vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                fontSize: "24px",
                fontWeight: 600,
                marginBottom: "24px",
                color: "#243A6E",
                fontFamily: '"KoPub Batang", serif',
              }}
            >
              Create New Post
            </h2>
            <form onSubmit={handleSubmitPost}>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: 500,
                    color: "#243A6E",
                  }}
                >
                  Your Name
                </label>
                <input
                  type="text"
                  value={newPostAuthor}
                  onChange={(e) => setNewPostAuthor(e.target.value)}
                  placeholder="Enter your name"
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #e5e5e5",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                  required
                />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: 500,
                    color: "#243A6E",
                  }}
                >
                  Topic
                </label>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #e5e5e5",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    background: "#fff",
                  }}
                >
                  {topics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.title}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: 500,
                    color: "#243A6E",
                  }}
                >
                  Title
                </label>
                <input
                  type="text"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  placeholder="Enter post title"
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #e5e5e5",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                  required
                />
              </div>
              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: 500,
                    color: "#243A6E",
                  }}
                >
                  Content
                </label>
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Write your post content..."
                  rows={8}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #e5e5e5",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    resize: "vertical",
                    fontFamily: "inherit",
                  }}
                  required
                />
              </div>
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  style={{
                    padding: "10px 20px",
                    background: "#e5e5e5",
                    color: "#333",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 20px",
                    background: "#243A6E",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  Submit Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
