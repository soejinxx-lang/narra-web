"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";

type Comment = {
    id: string;
    content: string;
    username: string;
    name: string;
    likes: number;
    created_at: string;
    parent_id: string | null;
    replies?: Comment[];
};

type CommentSectionProps = {
    episodeId: string;
};

export default function CommentSection({ episodeId }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState("");
    const [replyContent, setReplyContent] = useState("");
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Load user from localStorage
    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedUser = localStorage.getItem("currentUser");
            if (savedUser) {
                try {
                    setCurrentUser(JSON.parse(savedUser));
                } catch (e) {
                    console.error("Failed to parse user", e);
                }
            }
        }
    }, []);

    // Fetch comments
    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/episodes/${episodeId}/comments`);
            if (res.ok) {
                const data = await res.json();
                const rawComments: Comment[] = data.comments;

                // Reconstruct nested structure
                const commentMap: Record<string, Comment> = {};
                const rootComments: Comment[] = [];

                // First pass: create map and init replies array
                rawComments.forEach((c) => {
                    c.replies = [];
                    commentMap[c.id] = c;
                });

                // Second pass: link parents and children
                rawComments.forEach((c) => {
                    if (c.parent_id && commentMap[c.parent_id]) {
                        commentMap[c.parent_id].replies?.push(c);
                    } else {
                        rootComments.push(c);
                    }
                });

                setComments(rootComments);
            }
        } catch (error) {
            console.error("Failed to fetch comments", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [episodeId]);

    // Submit comment
    const handleSubmit = async (parentId: string | null = null) => {
        const content = parentId ? replyContent : newComment;
        if (!content.trim()) return;



        try {
            // Note: In a real app, you should use a proper auth token. 
            // Here we assume the backend checks session or we pass a token if available.
            // For this implementation, we'll try to get the token from localStorage if exists
            // or just rely on session cookie if that's how it's set up.
            // Assuming 'user_sessions' check in backend might need a token header.

            // Let's check for a token in localStorage (common pattern)
            const token = localStorage.getItem("authToken");

            const res = await fetch(`/api/episodes/${episodeId}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    content,
                    parent_id: parentId,
                }),
            });

            if (res.ok) {
                setNewComment("");
                setReplyContent("");
                setReplyingTo(null);
                fetchComments(); // Reload to show new comment
            } else {
                alert("Failed to post comment");
            }
        } catch (error) {
            console.error("Error posting comment", error);
        }
    };

    if (loading) return <div style={{ padding: "20px", textAlign: "center" }}>Loading comments...</div>;

    const renderComment = (comment: Comment, isReply = false) => {
        return (
            <div
                key={comment.id}
                style={{
                    display: "flex",
                    gap: "16px",
                    marginBottom: "24px",
                    paddingLeft: isReply ? "48px" : "0",
                    borderLeft: isReply ? "2px solid #eee" : "none",
                }}
            >
                {/* Avatar */}
                <div style={{ flexShrink: 0 }}>
                    <div
                        style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "50%",
                            background: "#ddd", // Placeholder grey
                            overflow: "hidden",
                        }}
                    >
                        {/* Fallback avatar logic usually goes here */}
                        <img
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${comment.username || "Guest"}`}
                            alt={comment.username}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                    </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <span style={{ fontWeight: 600, color: "#243A6E" }}>{comment.name || comment.username || "Guest"}</span>
                        <span style={{ fontSize: "12px", color: "#888" }}>
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                    </div>

                    <div style={{ fontSize: "15px", lineHeight: "1.6", color: "#333", marginBottom: "8px", whiteSpace: "pre-wrap" }}>
                        {comment.content}
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: "12px", fontSize: "13px" }}>
                        <button
                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                            style={{
                                background: "none",
                                border: "1px solid #ddd",
                                borderRadius: "15px",
                                padding: "4px 12px",
                                cursor: "pointer",
                                color: "#666",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px"
                            }}
                        >
                            ↩ Reply
                        </button>
                        <button
                            style={{
                                background: "none",
                                border: "1px solid #ddd",
                                borderRadius: "15px",
                                padding: "4px 12px",
                                cursor: "pointer",
                                color: "#666",
                            }}
                        >
                            ⚠ Report
                        </button>
                    </div>

                    {/* Reply Form */}
                    {replyingTo === comment.id && (
                        <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
                            <textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Write a reply..."
                                style={{
                                    flex: 1,
                                    padding: "8px",
                                    borderRadius: "4px",
                                    border: "1px solid #e5e5e5",
                                    resize: "vertical",
                                    minHeight: "60px",
                                }}
                            />
                            <button
                                onClick={() => handleSubmit(comment.id)}
                                style={{
                                    padding: "0 16px",
                                    background: "#243A6E",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "4px",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                }}
                            >
                                Post
                            </button>
                        </div>
                    )}

                    {/* Render Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                        <div style={{ marginTop: "16px" }}>
                            {comment.replies.map((reply) => renderComment(reply, true))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div style={{ marginTop: "60px", paddingTop: "40px", borderTop: "2px solid #f0f0f0" }}>
            <h3 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "24px", color: "#243A6E" }}>
                Comments ({comments.length})
            </h3>

            {/* Main Comment Form */}
            <div style={{ marginBottom: "40px" }}>
                <div style={{ display: "flex", gap: "16px" }}>
                    <div
                        style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "50%",
                            background: "#eee",
                            overflow: "hidden",
                            flexShrink: 0
                        }}
                    >
                        <img
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${currentUser ? currentUser.username : "Guest"}`}
                            alt="Avatar"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder={currentUser ? "Leave a comment..." : "Leave a comment as Guest..."}
                            style={{
                                width: "100%",
                                padding: "16px",
                                borderRadius: "8px",
                                border: "1px solid #e5e5e5",
                                resize: "vertical",
                                minHeight: "100px",
                                marginBottom: "12px",
                                fontFamily: "inherit",
                            }}
                        />
                        <div style={{ textAlign: "right" }}>
                            <button
                                onClick={() => handleSubmit(null)}
                                style={{
                                    padding: "10px 24px",
                                    background: "#243A6E",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "6px",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    fontSize: "14px"
                                }}
                            >
                                Post Comment
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Comment List */}
            <div>
                {comments.map((comment) => renderComment(comment))}
                {comments.length === 0 && (
                    <p style={{ color: "#888", fontStyle: "italic", textAlign: "center", padding: "40px" }}>
                        No comments yet. Be the first to share your thoughts!
                    </p>
                )}
            </div>
        </div>
    );
}
