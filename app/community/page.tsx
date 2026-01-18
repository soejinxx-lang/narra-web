"use client";

import { useState, useEffect } from "react";
import { sanitizeInput, isValidInput } from "@/app/utils/security";

interface Comment {
  id: string;
  author: string;
  content: string;
  time: string;
  replies: Comment[]; // 대댓글
}

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  time: string;
  likes: number;
  likedBy: string[]; // 좋아요를 누른 사용자 목록 
  topic: string; // 카테고리
  comments: Comment[]; // 댓글 목록 (대댓글 제외)
}

interface ForumTopic {
  id: string;
  title: string;
  count: number;
}

// 마스터 계정 확인 함수
const isMasterAccount = (): boolean => {
  if (typeof window === "undefined") return false;
  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) return false;
  try {
    const user = JSON.parse(currentUser);
    return user.username === "lego1357";
  } catch (e) {
    return false;
  }
};

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
  const [filteredTopic, setFilteredTopic] = useState<string | null>(null); // 필터링된 카테고리
  const [selectedPost, setSelectedPost] = useState<Post | null>(null); // 선택된 포스트 (댓글 보기용)
  const [newComment, setNewComment] = useState(""); // 새 댓글 내용
  const [newCommentAuthor, setNewCommentAuthor] = useState(""); // 새 댓글 작성자
  const [replyingTo, setReplyingTo] = useState<string | null>(null); // 대댓글을 달 댓글 ID
  const [newReply, setNewReply] = useState(""); // 새 대댓글 내용
  const [newReplyAuthor, setNewReplyAuthor] = useState(""); // 새 대댓글 작성자
  const [showCommentForm, setShowCommentForm] = useState(false); // 댓글 작성 폼 표시 여부
  const [isMaster, setIsMaster] = useState(false); // 마스터 계정 여부

  useEffect(() => {
    // 마스터 계정 확인
    setIsMaster(isMasterAccount());

    // 마스터 계정 자동 생성
    const usersData = localStorage.getItem("users");
    if (usersData) {
      const users = JSON.parse(usersData);
      const masterExists = users.some((u: any) => u.username === "lego1357");
      if (!masterExists) {
        const masterUser = {
          id: "master_" + Date.now().toString(),
          username: "lego1357",
          password: "blue2040",
          name: "Master",
        };
        users.push(masterUser);
        localStorage.setItem("users", JSON.stringify(users));
      }
    } else {
      // users가 없으면 마스터 계정만 생성
      const masterUser = {
        id: "master_" + Date.now().toString(),
        username: "lego1357",
        password: "blue2040",
        name: "Master",
      };
      localStorage.setItem("users", JSON.stringify([masterUser]));
    }

    const savedPosts = localStorage.getItem("communityPosts");
    
    if (savedPosts) {
      const parsedPosts = JSON.parse(savedPosts);
      // 기존 포스트에 likes, likedBy, topic, comments 필드가 없으면 추가
      const postsWithLikes = parsedPosts.map((post: Post) => {
        // topic이 없거나 유효하지 않은 경우에만 "general"로 설정
        const validTopics = ["general", "recommendations", "character", "translation"];
        const postTopic = post.topic && validTopics.includes(post.topic) ? post.topic : "general";
        return {
          ...post,
          likes: post.likes || 0,
          likedBy: post.likedBy || [],
          topic: postTopic,
          comments: post.comments || [],
        };
      });
      setPosts(postsWithLikes);
      
      // 카테고리별 포스트 수 업데이트
      setTopics((prevTopics) => 
        prevTopics.map((topic) => {
          const count = postsWithLikes.filter((post: Post) => post.topic === topic.id).length;
          return { ...topic, count };
        })
      );
    }
  }, []);

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 입력 sanitization 및 검증
    const sanitizedTitle = sanitizeInput(newPostTitle.trim());
    const sanitizedContent = sanitizeInput(newPostContent.trim());
    const sanitizedAuthor = sanitizeInput(newPostAuthor.trim());

    if (!sanitizedTitle || !sanitizedContent || !sanitizedAuthor) {
      return;
    }

    // 입력 유효성 검사
    if (!isValidInput(sanitizedTitle, 200) || !isValidInput(sanitizedContent, 10000) || !isValidInput(sanitizedAuthor, 100)) {
      return;
    }

    const newPost: Post = {
      id: Date.now().toString(),
      title: sanitizedTitle,
      content: sanitizedContent,
      author: sanitizedAuthor,
      time: "just now",
      likes: 0,
      likedBy: [],
      topic: selectedTopic,
      comments: [],
    };

    const updatedPosts = [newPost, ...posts];
    setPosts(updatedPosts);
    localStorage.setItem("communityPosts", JSON.stringify(updatedPosts));

    // Update topic count
    const updatedTopics = topics.map((topic) => {
      const count = updatedPosts.filter((post: Post) => post.topic === topic.id).length;
      return { ...topic, count };
    });
    setTopics(updatedTopics);
    localStorage.setItem("communityTopics", JSON.stringify(updatedTopics));

    // 새 포스트의 카테고리로 필터링 설정 (또는 필터 해제)
    if (filteredTopic && filteredTopic !== selectedTopic) {
      // 다른 카테고리가 필터링되어 있으면 필터 해제
      setFilteredTopic(null);
    } else if (!filteredTopic) {
      // 필터가 없으면 새 포스트의 카테고리로 필터링
      setFilteredTopic(selectedTopic);
    }

    // Reset form
    setNewPostTitle("");
    setNewPostContent("");
    setNewPostAuthor("");
    setShowPostModal(false);
  };

  const handleLike = (postId: string) => {
    const currentUser = localStorage.getItem("communityUser") || "anonymous";
    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        const hasLiked = post.likedBy?.includes(currentUser);
        if (hasLiked) {
          // 이미 좋아요를 눌렀으면 취소
          return {
            ...post,
            likes: Math.max(0, (post.likes || 0) - 1),
            likedBy: post.likedBy?.filter((user) => user !== currentUser) || [],
          };
        } else {
          // 좋아요 추가
          return {
            ...post,
            likes: (post.likes || 0) + 1,
            likedBy: [...(post.likedBy || []), currentUser],
          };
        }
      }
      return post;
    });
    setPosts(updatedPosts);
    localStorage.setItem("communityPosts", JSON.stringify(updatedPosts));
  };

  // 필터링된 포스트 가져오기
  const filteredPosts = filteredTopic 
    ? posts.filter((post) => {
        // topic 필드가 정확히 일치하는지 확인
        if (!post.topic) {
          // topic이 없으면 "general"로 간주하되, 필터가 "general"일 때만 표시
          return filteredTopic === "general";
        }
        // 정확한 매칭만 허용
        return post.topic === filteredTopic;
      })
    : posts;
  
  // 좋아요 수 기준으로 정렬 (내림차순)
  const sortedPosts = [...filteredPosts].sort((a, b) => (b.likes || 0) - (a.likes || 0));
  
  const handleTopicClick = (topicId: string) => {
    // 같은 카테고리를 다시 클릭하면 필터 해제
    if (filteredTopic === topicId) {
      setFilteredTopic(null);
      setSelectedTopic("general"); // 필터 해제 시 기본값으로
    } else {
      setFilteredTopic(topicId);
      setSelectedTopic(topicId); // 선택한 카테고리를 포스트 생성 기본값으로 설정
    }
  };

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
  };

  // 시간 계산 함수
  const getTimeAgo = (timeString: string): string => {
    // "just now"나 ISO 날짜 형식 모두 처리
    if (timeString === "just now") {
      return "just now";
    }
    
    try {
      const time = new Date(timeString);
      const now = new Date();
      const diffMs = now.getTime() - time.getTime();
      
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);
      const diffMonths = Math.floor(diffDays / 30);
      
      if (diffSeconds < 60) {
        return `${diffSeconds} seconds ago`;
      } else if (diffMinutes < 60) {
        return `${diffMinutes} minutes ago`;
      } else if (diffHours < 24) {
        return `${diffHours} hours ago`;
      } else if (diffDays < 30) {
        return `${diffDays} days ago`;
      } else if (diffMonths < 12) {
        return `${diffMonths} months ago`;
      } else {
        return time.toLocaleDateString();
      }
    } catch (e) {
      return timeString;
    }
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 입력 sanitization 및 검증
    const sanitizedComment = sanitizeInput(newComment.trim());
    const sanitizedAuthor = sanitizeInput(newCommentAuthor.trim());
    
    if (!sanitizedComment || !sanitizedAuthor || !selectedPost) return;

    // 입력 유효성 검사
    if (!isValidInput(sanitizedComment, 5000) || !isValidInput(sanitizedAuthor, 100)) {
      return;
    }

    const comment: Comment = {
      id: Date.now().toString(),
      author: sanitizedAuthor,
      content: sanitizedComment,
      time: new Date().toISOString(),
      replies: [],
    };

    const updatedPosts = posts.map((post) => {
      if (post.id === selectedPost.id) {
        const updatedComments = [...(post.comments || []), comment];
        return {
          ...post,
          comments: updatedComments,
        };
      }
      return post;
    });

    setPosts(updatedPosts);
    localStorage.setItem("communityPosts", JSON.stringify(updatedPosts));
    
    // 선택된 포스트도 업데이트
    const updatedPost = updatedPosts.find((p) => p.id === selectedPost.id);
    if (updatedPost) {
      setSelectedPost(updatedPost);
    }

    setNewComment("");
    setNewCommentAuthor("");
    setShowCommentForm(false);
  };

  const handleSubmitReply = (commentId: string, e: React.FormEvent) => {
    e.preventDefault();
    
    // 입력 sanitization 및 검증
    const sanitizedReply = sanitizeInput(newReply.trim());
    const sanitizedAuthor = sanitizeInput(newReplyAuthor.trim());
    
    if (!sanitizedReply || !sanitizedAuthor || !selectedPost) return;

    // 입력 유효성 검사
    if (!isValidInput(sanitizedReply, 5000) || !isValidInput(sanitizedAuthor, 100)) {
      return;
    }

    // 대댓글인지 확인 (댓글의 replies 배열에 있는지 확인)
    const isReplyingToReply = (post: Post, commentId: string): boolean => {
      for (const comment of post.comments || []) {
        for (const reply of comment.replies || []) {
          if (reply.id === commentId) {
            return true; // 대댓글에 대댓글을 달려고 함
          }
        }
      }
      return false;
    };

    // 대댓글에 대댓글을 달 수 없음
    if (isReplyingToReply(selectedPost, commentId)) {
      return;
    }

    const reply: Comment = {
      id: Date.now().toString(),
      author: sanitizedAuthor,
      content: sanitizedReply,
      time: new Date().toISOString(),
      replies: [], // 대댓글은 항상 빈 replies 배열을 가짐
    };

    // 대댓글에 대댓글을 달 수 없도록 확인
    // commentId가 댓글(comment)의 id인지 확인 (대댓글의 id가 아닌지)
    let isTopLevelComment = false;
    for (const comment of selectedPost.comments || []) {
      if (comment.id === commentId) {
        isTopLevelComment = true;
        break;
      }
      // 대댓글의 id인지 확인
      for (const reply of comment.replies || []) {
        if (reply.id === commentId) {
          // 대댓글에 대댓글을 달려고 함 - 차단
          return;
        }
      }
    }

    // 댓글이 아닌 경우도 차단
    if (!isTopLevelComment) {
      return;
    }

    const updatedPosts = posts.map((post) => {
      if (post.id === selectedPost.id) {
        const updatedComments = (post.comments || []).map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), reply],
            };
          }
          return comment;
        });
        return {
          ...post,
          comments: updatedComments,
        };
      }
      return post;
    });

    setPosts(updatedPosts);
    localStorage.setItem("communityPosts", JSON.stringify(updatedPosts));
    
    // 선택된 포스트도 업데이트
    const updatedPost = updatedPosts.find((p) => p.id === selectedPost.id);
    if (updatedPost) {
      setSelectedPost(updatedPost);
    }

    setNewReply("");
    setNewReplyAuthor("");
    setReplyingTo(null);
  };

  // 포스트 삭제 함수
  const handleDeletePost = (postId: string, postAuthor: string) => {
    const currentUser = localStorage.getItem("communityUser") || "anonymous";
    const canDelete = isMaster || postAuthor === currentUser;

    if (!canDelete) return;

    if (window.confirm("Are you sure you want to delete this post?")) {
      const updatedPosts = posts.filter((post) => post.id !== postId);
      setPosts(updatedPosts);
      localStorage.setItem("communityPosts", JSON.stringify(updatedPosts));

      // 카테고리별 포스트 수 업데이트
      setTopics((prevTopics) =>
        prevTopics.map((topic) => {
          const count = updatedPosts.filter((post: Post) => post.topic === topic.id).length;
          return { ...topic, count };
        })
      );

      // 선택된 포스트가 삭제된 경우 모달 닫기
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost(null);
      }
    }
  };

  // 댓글 삭제 함수
  const handleDeleteComment = (commentId: string, commentAuthor: string, isReply: boolean = false, parentCommentId?: string) => {
    if (!selectedPost) return;

    const currentUser = localStorage.getItem("communityUser") || "anonymous";
    const canDelete = isMaster || commentAuthor === currentUser;

    if (!canDelete) return;

    const updatedPosts = posts.map((post) => {
      if (post.id === selectedPost.id) {
        if (isReply && parentCommentId) {
          // 대댓글 삭제
          const updatedComments = (post.comments || []).map((comment) => {
            if (comment.id === parentCommentId) {
              return {
                ...comment,
                replies: (comment.replies || []).filter((reply) => reply.id !== commentId),
              };
            }
            return comment;
          });
          return {
            ...post,
            comments: updatedComments,
          };
        } else {
          // 댓글 삭제
          return {
            ...post,
            comments: (post.comments || []).filter((comment) => comment.id !== commentId),
          };
        }
      }
      return post;
    });

    setPosts(updatedPosts);
    localStorage.setItem("communityPosts", JSON.stringify(updatedPosts));

    // 선택된 포스트도 업데이트
    const updatedPost = updatedPosts.find((p) => p.id === selectedPost.id);
    if (updatedPost) {
      setSelectedPost(updatedPost);
    }
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
          onClick={() => {
            // 모달 열 때 현재 필터링된 카테고리를 기본값으로 설정
            if (filteredTopic) {
              setSelectedTopic(filteredTopic);
            }
            setShowPostModal(true);
          }}
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
            {topics.map((forum) => {
              const isSelected = filteredTopic === forum.id;
              return (
                <div
                  key={forum.id}
                  onClick={() => handleTopicClick(forum.id)}
                  style={{
                    padding: "12px",
                    background: isSelected ? "#243A6E" : "#faf9f6",
                    borderRadius: "8px",
                    border: isSelected ? "1px solid #243A6E" : "1px solid #e5e5e5",
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = "#f0f0f0";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = "#faf9f6";
                    }
                  }}
                >
                  <div style={{ fontWeight: 500, marginBottom: "4px", color: isSelected ? "#fff" : "#243A6E" }}>
                    {forum.title}
                  </div>
                  <div style={{ fontSize: "12px", color: isSelected ? "#e0e0e0" : "#999" }}>{forum.count} topics</div>
                </div>
              );
            })}
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
            Hot Posts
          </h2>
          {sortedPosts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
              {filteredTopic 
                ? `No posts in this category yet. Be the first to create a post!`
                : "No posts yet. Be the first to create a post!"}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {sortedPosts.map((post) => {
                const currentUser = localStorage.getItem("communityUser") || "anonymous";
                const hasLiked = post.likedBy?.includes(currentUser) || false;
                return (
                <div
                  key={post.id}
                  style={{
                    padding: "16px",
                    background: "#faf9f6",
                    borderRadius: "8px",
                    border: "1px solid #e5e5e5",
                    transition: "background 0.2s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f0f0f0";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#faf9f6";
                  }}
                  onClick={() => handlePostClick(post)}
                >
                  <div style={{ fontWeight: 500, marginBottom: "8px", color: "#243A6E", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span>{post.title}</span>
                      {post.comments && post.comments.length > 0 && (
                        <span style={{ fontSize: "13px", color: "#243A6E", fontWeight: 600, background: "#f0f0f0", padding: "2px 8px", borderRadius: "12px" }}>
                          {post.comments.length}
                        </span>
                      )}
                    </div>
                    {(isMaster || post.author === (localStorage.getItem("communityUser") || "anonymous")) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePost(post.id, post.author);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#e74c3c",
                          fontSize: "18px",
                          cursor: "pointer",
                          padding: "4px 8px",
                          lineHeight: "1",
                        }}
                        title="Delete post"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <div style={{ fontSize: "13px", color: "#666", marginBottom: "8px", lineHeight: 1.5 }}>
                    {post.content.length > 150 ? `${post.content.substring(0, 150)}...` : post.content}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: "12px", color: "#999" }}>
                      by {post.author} · {post.time}
                    </div>
                    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(post.id);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          transition: "background 0.2s",
                          color: hasLiked ? "#e74c3c" : "#666",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#f0f0f0";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <span style={{ fontSize: "16px" }}>{hasLiked ? "❤️" : "🤍"}</span>
                        <span style={{ fontSize: "12px", fontWeight: 500 }}>{post.likes || 0}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Spacer for visual balance */}
      <div
        style={{
          marginTop: "120px",
          height: "1px",
        }}
      />

      {/* Post Detail Modal (댓글 보기) */}
      {selectedPost && (
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
            zIndex: 1001,
            overflow: "auto",
            padding: "20px",
          }}
          onClick={() => {
            setSelectedPost(null);
            setReplyingTo(null);
            setShowCommentForm(false);
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "32px",
              maxWidth: "800px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              margin: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: 600,
                  color: "#243A6E",
                  fontFamily: '"KoPub Batang", serif',
                  margin: 0,
                }}
              >
                {selectedPost.title}
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {(isMaster || selectedPost.author === (localStorage.getItem("communityUser") || "anonymous")) && (
                  <button
                    onClick={() => {
                      handleDeletePost(selectedPost.id, selectedPost.author);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: "20px",
                      cursor: "pointer",
                      color: "#e74c3c",
                      padding: "4px 8px",
                      lineHeight: "1",
                    }}
                    title="Delete post"
                  >
                    🗑️
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedPost(null);
                    setReplyingTo(null);
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    fontSize: "24px",
                    cursor: "pointer",
                    color: "#666",
                    padding: "0",
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ×
                </button>
              </div>
            </div>
            
            <div style={{ marginBottom: "16px", color: "#666", fontSize: "14px" }}>
              by {selectedPost.author} · {selectedPost.time}
            </div>
            
            <div style={{ marginBottom: "32px", lineHeight: 1.8, color: "#333", whiteSpace: "pre-wrap" }}>
              {selectedPost.content}
            </div>

            {/* 댓글 목록 */}
            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px", color: "#243A6E" }}>
                Comments ({selectedPost.comments?.length || 0})
              </h3>
              
              {selectedPost.comments && selectedPost.comments.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {selectedPost.comments.map((comment) => (
                    <div
                      key={comment.id}
                      style={{
                        padding: "16px",
                        background: "#faf9f6",
                        borderRadius: "8px",
                        border: "1px solid #e5e5e5",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                        <div style={{ fontWeight: 500, color: "#243A6E" }}>{comment.author}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ fontSize: "12px", color: "#999" }}>{getTimeAgo(comment.time)}</div>
                          {(isMaster || comment.author === (localStorage.getItem("communityUser") || "anonymous")) && (
                            <button
                              onClick={() => handleDeleteComment(comment.id, comment.author, false)}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#e74c3c",
                                fontSize: "18px",
                                cursor: "pointer",
                                padding: "4px 8px",
                                lineHeight: "1",
                              }}
                              title="Delete comment"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </div>
                      <div style={{ marginBottom: "12px", color: "#333", lineHeight: 1.6 }}>
                        {comment.content}
                      </div>
                      
                      {/* 대댓글 목록 */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div style={{ marginLeft: "20px", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #e5e5e5" }}>
                          {comment.replies.map((reply) => (
                            <div
                              key={reply.id}
                              style={{
                                padding: "12px",
                                background: "#fff",
                                borderRadius: "6px",
                                marginBottom: "8px",
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                                <div style={{ fontWeight: 500, color: "#243A6E", fontSize: "14px" }}>{reply.author}</div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <div style={{ fontSize: "11px", color: "#999" }}>{getTimeAgo(reply.time)}</div>
                                  {(isMaster || reply.author === (localStorage.getItem("communityUser") || "anonymous")) && (
                                    <button
                                      onClick={() => handleDeleteComment(reply.id, reply.author, true, comment.id)}
                                      style={{
                                        background: "none",
                                        border: "none",
                                        color: "#e74c3c",
                                        fontSize: "18px",
                                        cursor: "pointer",
                                        padding: "4px 8px",
                                        lineHeight: "1",
                                      }}
                                      title="Delete reply"
                                    >
                                      ×
                                    </button>
                                  )}
                                </div>
                              </div>
                              <div style={{ color: "#333", lineHeight: 1.5, fontSize: "14px" }}>
                                {reply.content}
                              </div>
                              {/* 대댓글에는 댓글을 달 수 없음 */}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* 대댓글 작성 버튼 */}
                      <button
                        onClick={() => {
                          if (replyingTo === comment.id) {
                            setReplyingTo(null);
                            setNewReply("");
                            setNewReplyAuthor("");
                          } else {
                            setReplyingTo(comment.id);
                            setNewReply("");
                            setNewReplyAuthor("");
                          }
                        }}
                        style={{
                          marginTop: "8px",
                          padding: "6px 12px",
                          background: "transparent",
                          border: "1px solid #e5e5e5",
                          borderRadius: "6px",
                          fontSize: "12px",
                          color: "#666",
                          cursor: "pointer",
                        }}
                      >
                        {replyingTo === comment.id ? "Cancel Reply" : "Reply"}
                      </button>
                      
                      {/* 대댓글 작성 폼 */}
                      {replyingTo === comment.id && (
                        <form
                          onSubmit={(e) => handleSubmitReply(comment.id, e)}
                          style={{ marginTop: "12px", padding: "12px", background: "#fff", borderRadius: "6px" }}
                        >
                          <input
                            type="text"
                            value={newReplyAuthor}
                            onChange={(e) => setNewReplyAuthor(e.target.value)}
                            placeholder="Your name"
                            required
                            style={{
                              width: "100%",
                              padding: "8px",
                              border: "1px solid #e5e5e5",
                              borderRadius: "6px",
                              fontSize: "13px",
                              marginBottom: "8px",
                              outline: "none",
                            }}
                          />
                          <textarea
                            value={newReply}
                            onChange={(e) => setNewReply(e.target.value)}
                            placeholder="Write a reply..."
                            required
                            rows={3}
                            style={{
                              width: "100%",
                              padding: "8px",
                              border: "1px solid #e5e5e5",
                              borderRadius: "6px",
                              fontSize: "13px",
                              marginBottom: "8px",
                              outline: "none",
                              resize: "vertical",
                              fontFamily: "inherit",
                            }}
                          />
                          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingTo(null);
                                setNewReply("");
                                setNewReplyAuthor("");
                              }}
                              style={{
                                padding: "6px 12px",
                                background: "#e5e5e5",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "12px",
                                cursor: "pointer",
                              }}
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              style={{
                                padding: "6px 12px",
                                background: "#243A6E",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "12px",
                                cursor: "pointer",
                              }}
                            >
                              Submit Reply
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                  No comments yet. Be the first to comment!
                </div>
              )}
            </div>

            {/* 댓글 작성 버튼 */}
            {!showCommentForm && (
              <div style={{ borderTop: "2px solid #e5e5e5", paddingTop: "24px", textAlign: "center" }}>
                <button
                  onClick={() => setShowCommentForm(true)}
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
                  Add a Comment
                </button>
              </div>
            )}

            {/* 댓글 작성 폼 */}
            {showCommentForm && (
              <div style={{ borderTop: "2px solid #e5e5e5", paddingTop: "24px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px", color: "#243A6E" }}>
                  Add a Comment
                </h3>
                <form onSubmit={handleSubmitComment}>
                  <input
                    type="text"
                    value={newCommentAuthor}
                    onChange={(e) => setNewCommentAuthor(e.target.value)}
                    placeholder="Your name"
                    required
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #e5e5e5",
                      borderRadius: "8px",
                      fontSize: "14px",
                      marginBottom: "12px",
                      outline: "none",
                    }}
                  />
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    required
                    rows={4}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #e5e5e5",
                      borderRadius: "8px",
                      fontSize: "14px",
                      marginBottom: "12px",
                      outline: "none",
                      resize: "vertical",
                      fontFamily: "inherit",
                    }}
                  />
                  <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCommentForm(false);
                        setNewComment("");
                        setNewCommentAuthor("");
                      }}
                      style={{
                        padding: "10px 20px",
                        background: "#e5e5e5",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "14px",
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
                        cursor: "pointer",
                      }}
                    >
                      Submit Comment
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

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
