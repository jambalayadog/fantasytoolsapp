import React, { useState } from "react";
import { useViewport } from "../hooks/useViewport";
import { PortfolioProject } from "../portfolioTypes";

// Helper function to convert YouTube URLs to embed format
const convertToEmbedUrl = (url: string): string => {
  // Handle youtu.be format
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1].split('?')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  
  // Handle youtube.com/watch format
  if (url.includes('youtube.com/watch')) {
    const videoId = url.split('v=')[1]?.split('&')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  
  // If already in embed format or other video format, return as is
  return url;
};

// Helper function to render text with clickable links
const renderTextWithLinks = (text: string) => {
  // Handle anchor tag format: [a(href='url' target='_blank') LinkText]
  const anchorTagRegex = /\[a\(href='([^']+)'[^)]*\)\s*([^\]]+)\]/g;
  
  // Handle plain URL format: https://example.com
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  let parts: (string | React.JSX.Element)[] = [];
  let lastIndex = 0;
  let match;
  
  // First, handle anchor tag format
  let processedText = text;
  const anchorMatches: Array<{match: string, url: string, text: string, index: number}> = [];
  
  while ((match = anchorTagRegex.exec(text)) !== null) {
    anchorMatches.push({
      match: match[0],
      url: match[1],
      text: match[2],
      index: match.index
    });
  }
  
  // Replace anchor tags with placeholder and collect info
  anchorMatches.reverse().forEach((anchorMatch, index) => {
    const placeholder = `__ANCHOR_${index}__`;
    processedText = processedText.replace(anchorMatch.match, placeholder);
  });
  
  // Now process URLs and anchor placeholders
  const combinedRegex = /(__ANCHOR_\d+__)|(https?:\/\/[^\s]+)/g;
  
  while ((match = combinedRegex.exec(processedText)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(processedText.slice(lastIndex, match.index));
    }
    
    if (match[1]) {
      // This is an anchor placeholder
      const anchorIndex = parseInt(match[1].match(/\d+/)?.[0] || '0');
      const anchorData = anchorMatches[anchorIndex];
      if (anchorData) {
        parts.push(
          <a 
            key={`anchor-${anchorIndex}-${match.index}`}
            href={anchorData.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#60a5fa", // blue-400
              textDecoration: "underline",
              cursor: "pointer"
            }}
          >
            {anchorData.text}
          </a>
        );
      }
    } else if (match[2]) {
      // This is a plain URL
      parts.push(
        <a 
          key={`url-${match.index}`}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "#60a5fa", // blue-400
            textDecoration: "underline",
            cursor: "pointer"
          }}
        >
          {match[2]}
        </a>
      );
    }
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < processedText.length) {
    parts.push(processedText.slice(lastIndex));
  }
  
  return parts.length > 0 ? parts : [text];
};

interface Project {
  id: number;
  title: string;
  role: string;
  responsibility: string;
}

interface ContentSectionProps {
  title: string;
  type: "media" | "impact";
  project: PortfolioProject;
  currentMediaIndex: number;
  onMediaIndexChange: (index: number) => void;
}

const ContentSection: React.FC<ContentSectionProps> = ({ title, type, project, currentMediaIndex, onMediaIndexChange }) => {
  const { isMobile } = useViewport();
  
  // Replace placeholder mediaItems with project.media
  const mediaItems = project.media;

  const handlePreviousMedia = () => {
    onMediaIndexChange(Math.max(0, currentMediaIndex - 1));
  };

  const handleNextMedia = () => {
    onMediaIndexChange(Math.min(mediaItems.length - 1, currentMediaIndex + 1));
  };

  const renderMediaContent = () => (
    <div 
      style={{ 
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        width: "100%",
        position: "relative",
        overflow: "hidden",
        padding: "0"
      }}
    >
      {/* Media Container */}
      <div 
        style={{ 
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          maxWidth: isMobile ? "min(95%, 1280px)" : "min(90%, 1280px)"
        }}
      >
        {/* Previous Button */}
        {mediaItems.length > 1 && (
          <button
            onClick={handlePreviousMedia}
            disabled={currentMediaIndex === 0}
            style={{
              position: "absolute",
              left: "0",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 20,
              backgroundColor: "rgba(31, 41, 55, 0.9)",
              color: "#fff",
              borderTop: "2px solid rgba(255, 255, 255, 0.2)",
              borderBottom: "2px solid rgba(255, 255, 255, 0.2)",
              borderLeft: "none",
              borderRight: "none",
              borderRadius: "0",
              width: isMobile ? "32px" : "56px",
              height: isMobile ? "32px" : "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: isMobile ? "20px" : "26px",
              fontWeight: "300",
              opacity: currentMediaIndex === 0 ? 0.1 : 1,
              transition: "all 0.3s ease-in-out",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)"
            }}
            onMouseEnter={(e) => {
              if (currentMediaIndex > 0) {
                e.currentTarget.style.backgroundColor = "rgba(31, 41, 55, 1)";
                e.currentTarget.style.borderTopColor = "rgba(255, 255, 255, 0.4)";
                e.currentTarget.style.borderBottomColor = "rgba(255, 255, 255, 0.4)";
                e.currentTarget.style.transform = "translateY(-50%) scale(1.05)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              if (currentMediaIndex > 0) {
                e.currentTarget.style.backgroundColor = "rgba(31, 41, 55, 0.9)";
                e.currentTarget.style.borderTopColor = "rgba(255, 255, 255, 0.2)";
                e.currentTarget.style.borderBottomColor = "rgba(255, 255, 255, 0.2)";
                e.currentTarget.style.transform = "translateY(-50%) scale(1)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)";
              }
            }}
          >
            ←
          </button>
        )}

        {/* Media Display */}
        <div 
          className="bg-gray-800 overflow-hidden"
          style={{ 
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative"
          }}
        >
          {mediaItems[currentMediaIndex]?.type === "video" ? (
            <iframe
              src={convertToEmbedUrl(mediaItems[currentMediaIndex].url)}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ 
                width: isMobile ? "100%" : "90%",
                minHeight: isMobile ? "75%" : "80%",
                height: "auto",
                objectFit: "contain"
              }}
            />
          ) : (
            <div 
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#1f2937"
              }}
            >
              <img
                src={mediaItems[currentMediaIndex]?.url}
                alt={project.title}
                style={{
                  maxWidth: "100%",
                  maxHeight: isMobile ? "80%" : "75%",
                  width: "auto",
                  height: "auto",
                  objectFit: "contain"
                }}
              />
            </div>
          )}
          
          {/* Tag Overlay */}
          {mediaItems[currentMediaIndex]?.tag && (
            <div
              style={{
                position: "absolute",
                top: "1rem",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "rgba(0, 0, 0, 0.9)", // black with slight transparency
                color: "white",
                border: "2px solid white",
                padding: "0.5rem 1rem",
                borderRadius: "0", // square corners
                fontSize: "0.875rem",
                fontWeight: "600",
                zIndex: 30,
                whiteSpace: "nowrap"
              }}
            >
              {mediaItems[currentMediaIndex].tag}
            </div>
          )}
        </div>

        {/* Next Button */}
        {mediaItems.length > 1 && (
          <button
            onClick={handleNextMedia}
            disabled={currentMediaIndex >= mediaItems.length - 1}
            style={{
              position: "absolute",
              right: "0",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 20,
              backgroundColor: "rgba(31, 41, 55, 0.9)",
              color: "#fff",
              borderTop: "2px solid rgba(255, 255, 255, 0.2)",
              borderBottom: "2px solid rgba(255, 255, 255, 0.2)",
              borderLeft: "none",
              borderRight: "none",
              borderRadius: "0",
              width: isMobile ? "32px" : "56px",
              height: isMobile ? "32px" : "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: isMobile ? "20px" : "26px",
              fontWeight: "300",
              opacity: currentMediaIndex >= mediaItems.length - 1 ? 0.1 : 1,
              transition: "all 0.3s ease-in-out",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)"
            }}
            onMouseEnter={(e) => {
              if (currentMediaIndex < mediaItems.length - 1) {
                e.currentTarget.style.backgroundColor = "rgba(31, 41, 55, 1)";
                e.currentTarget.style.borderTopColor = "rgba(255, 255, 255, 0.4)";
                e.currentTarget.style.borderBottomColor = "rgba(255, 255, 255, 0.4)";
                e.currentTarget.style.transform = "translateY(-50%) scale(1.05)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              if (currentMediaIndex < mediaItems.length - 1) {
                e.currentTarget.style.backgroundColor = "rgba(31, 41, 55, 0.9)";
                e.currentTarget.style.borderTopColor = "rgba(255, 255, 255, 0.2)";
                e.currentTarget.style.borderBottomColor = "rgba(255, 255, 255, 0.2)";
                e.currentTarget.style.transform = "translateY(-50%) scale(1)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)";
              }
            }}
          >
            →
          </button>
        )}
      </div>

      {/* Media Indicators */}
      {mediaItems.length > 0 && (
        <div 
          style={{ 
            display: "flex",
            justifyContent: "center",
            gap: "0rem",
            position: "absolute",
            bottom: "1rem",
            left: "0",
            right: "0",
            zIndex: 20
          }}
        >
          {mediaItems.map((_, index) => (
            <button
              key={index}
              onClick={() => onMediaIndexChange(index)}
              style={{
                width: index === currentMediaIndex ? isMobile ? "40px" : "150px" : isMobile ? "30px" : "130px",
                height: "12px",
                backgroundColor: index === currentMediaIndex ? "#ffffff" : "rgba(255, 255, 255, 0.3)",
                borderWidth: "2px",
                borderStyle: "solid none solid none",
                borderColor: index === currentMediaIndex ? "#ffffff" : "#aaaaaa",
                /*border: index === currentMediaIndex ? "2px solid #ffffff" : "2px solid rgba(255, 255, 255, 0.6)",*/
                borderRadius: "0",
                cursor: "pointer",
                transition: "all 0.3s ease-in-out",
                /*opacity: index === currentMediaIndex ? 1 : 0.7,*/
                transform: index === currentMediaIndex ? "scale(1.0)" : "scale(1)"
                /*backdropFilter: "blur(2px)"*/
              }}
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderImpactContent = () => {
    // Get impact data from the current media item
    const impactData = mediaItems[currentMediaIndex]?.impact || [];
    
    return (
      <div 
        style={{ 
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          height: "100%",
          /*padding: "2rem 0",*/
        }}
      >
        <div 
          style={{ 
            width: isMobile ? "95%" : "90%",
            maxWidth: "1280px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            alignItems: "flex-start",
          }}
        >
          {impactData.map((impactPoint, index) => (
            <p 
              key={index}
              style={{ 
                fontSize: isMobile ? "0.75rem" : "1.5rem", 
                lineHeight: "1.75", 
                color: "#e5e7eb", // gray-200
                margin: 0 
              }}
            >
              {renderTextWithLinks(impactPoint)}
            </p>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full" style={{height:"100%"}}>
      {type === "media" ? renderMediaContent() : renderImpactContent()}
    </div>
  );
};

export default ContentSection; 