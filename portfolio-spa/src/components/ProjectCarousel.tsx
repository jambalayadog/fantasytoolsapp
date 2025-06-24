import React, { useState, useEffect } from "react";
import { PortfolioProject } from "../portfolioTypes";

interface ProjectCarouselProps {
  projects: PortfolioProject[];
  selectedProject: PortfolioProject;
  onProjectSelect: (project: PortfolioProject) => void;
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

const ProjectCarousel: React.FC<ProjectCarouselProps> = ({
  projects,
  selectedProject,
  onProjectSelect,
}) => {
  const [startIndex, setStartIndex] = useState(0);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Adjust visible count based on screen size
  const visibleCount = isMobile ? 3 : 6;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div style={{ 
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      padding: "1rem 0",
      backgroundColor: "#1f2937",
      margin: 0
    }}>
      {/* Project cards container with navigation */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        width: "100%", 
        maxWidth: isMobile ? "min(95%, 1280px)" : "min(90%, 1280px)",
        margin: "0 auto",
        height: "90%",
        position: "relative"
      }}>
        {/* Navigation buttons */}
        <button
          onClick={() => {
            const totalPages = Math.ceil(projects.length / visibleCount);
            const maxStartIndex = projects.length - visibleCount;
            const currentPage = startIndex >= maxStartIndex ? totalPages - 1 : Math.floor(startIndex / visibleCount);
            const newPage = Math.max(0, currentPage - 1);
            const newStartIndex = newPage * visibleCount;
            setStartIndex(Math.min(newStartIndex, maxStartIndex));
          }}
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
            opacity: startIndex === 0 ? 0.1 : 1,
            transition: "all 0.3s ease-in-out",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)"
          }}
          onMouseEnter={(e) => {
            if (startIndex > 0) {
              e.currentTarget.style.backgroundColor = "rgba(31, 41, 55, 1)";
              e.currentTarget.style.borderTopColor = "rgba(255, 255, 255, 0.4)";
              e.currentTarget.style.borderBottomColor = "rgba(255, 255, 255, 0.4)";
              e.currentTarget.style.transform = "translateY(-50%) scale(1.05)";
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.4)";
            }
          }}
          onMouseLeave={(e) => {
            if (startIndex > 0) {
              e.currentTarget.style.backgroundColor = "rgba(31, 41, 55, 0.9)";
              e.currentTarget.style.borderTopColor = "rgba(255, 255, 255, 0.2)";
              e.currentTarget.style.borderBottomColor = "rgba(255, 255, 255, 0.2)";
              e.currentTarget.style.transform = "translateY(-50%) scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)";
            }
          }}
          disabled={startIndex === 0}
        >
          ←
        </button>
        <button
          onClick={() => {
            const totalPages = Math.ceil(projects.length / visibleCount);
            const maxStartIndex = projects.length - visibleCount;
            const currentPage = startIndex >= maxStartIndex ? totalPages - 1 : Math.floor(startIndex / visibleCount);
            const newPage = Math.min(totalPages - 1, currentPage + 1);
            const newStartIndex = newPage * visibleCount;
            setStartIndex(Math.min(newStartIndex, maxStartIndex));
          }}
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
            opacity: startIndex >= projects.length - visibleCount ? 0.1 : 1,
            transition: "all 0.3s ease-in-out",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)"
          }}
          onMouseEnter={(e) => {
            if (startIndex < projects.length - visibleCount) {
              e.currentTarget.style.backgroundColor = "rgba(31, 41, 55, 1)";
              e.currentTarget.style.borderTopColor = "rgba(255, 255, 255, 0.4)";
              e.currentTarget.style.borderBottomColor = "rgba(255, 255, 255, 0.4)";
              e.currentTarget.style.transform = "translateY(-50%) scale(1.05)";
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.4)";
            }
          }}
          onMouseLeave={(e) => {
            if (startIndex < projects.length - visibleCount) {
              e.currentTarget.style.backgroundColor = "rgba(31, 41, 55, 0.9)";
              e.currentTarget.style.borderTopColor = "rgba(255, 255, 255, 0.2)";
              e.currentTarget.style.borderBottomColor = "rgba(255, 255, 255, 0.2)";
              e.currentTarget.style.transform = "translateY(-50%) scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)";
            }
          }}
          disabled={startIndex >= projects.length - visibleCount}
        >
          →
        </button>

        {/* Progress bar */}
        <div style={{
          position: "absolute",
          bottom: "-25px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: "3px",
          zIndex: 10
        }}>
          {Array.from({ length: Math.ceil(projects.length / visibleCount) }, (_, pageIndex) => {
            const totalPages = Math.ceil(projects.length / visibleCount);
            const maxStartIndex = projects.length - visibleCount;
            // Fix for last page: if we're at max startIndex, we're on the last page
            const currentPage = startIndex >= maxStartIndex ? totalPages - 1 : Math.floor(startIndex / visibleCount);
            const isCurrentPage = pageIndex === currentPage;
            return (
              <button
                key={pageIndex}
                onClick={() => {
                  const newStartIndex = pageIndex * visibleCount;
                  const maxStartIndex = projects.length - visibleCount;
                  setStartIndex(Math.min(newStartIndex, maxStartIndex));
                }}
                style={{
                  width: isMobile ? isCurrentPage ? "40px" : "30px" : isCurrentPage ? "150px" : "130px",
                  height: "12px",
                  backgroundColor: isCurrentPage ? "#ffffff" : "rgba(255, 255, 255, 0.3)",
                  transition: "all 0.3s ease-in-out",
                  borderWidth: "2px",
                  borderStyle: "solid none solid none",
                  borderColor: isCurrentPage? "#ffffff" : "#aaaaaa",
                  cursor: "pointer",
                  padding: "0",
                  outline: "none"
                }}
                onMouseEnter={(e) => {
                  if (!isCurrentPage) {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isCurrentPage) {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
                  }
                }}
              />
            );
          })}
        </div>

        {/* Project cards */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: isMobile ? "0.5rem" : "1rem", 
          width: "100%", 
          justifyContent: "center",
          height: "100%",
          transition: "transform 0.3s ease-in-out"
        }}>
        {projects.slice(startIndex, startIndex + visibleCount).map((project) => (
          <div 
            key={project.id}
            className={`project-card ${selectedProject.id === project.id ? 'selected' : ''}`}
            onClick={() => {
              onProjectSelect(project);
              if (window.gtag) {
                window.gtag('event', 'click', {
                  event_category: 'Portfolio',
                  event_label: `Project Card: ${project.title}`
                });
              }
            }}
            onMouseEnter={() => setHoveredId(project.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{
              minWidth: isMobile ? "70px" : "115px",
              maxWidth: isMobile ? "88px" : "144px",
              maxHeight: isMobile ? "140px" : "200px",
              height: "100%",
              backgroundColor: "#1f2937",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start",
              padding: isMobile ? "0.125rem" : "0.25rem",
              cursor: "pointer",
              border: selectedProject.id === project.id ? "2px solid #ffffff" : "2px solid transparent",
              borderRadius: "0",
              transition: "all 0.3s ease-in-out",
              margin: isMobile ? "0 0.125rem" : "0 0.5rem",
              transform: selectedProject.id === project.id ? "scale(1.05)" : 
                        hoveredId === project.id ? "scale(1.1) translateY(-4px)" : "scale(1)",
              boxShadow: selectedProject.id === project.id ? "0 0 8px rgba(255, 255, 255, 0.2)" :
                        hoveredId === project.id ? "0 8px 16px -4px rgba(0, 0, 0, 0.3)" : "none",
              position: "relative"
            }}
          >
            <div style={{ 
              width: "100%", 
              height: "100%", 
              position: "relative",
              overflow: "hidden",
              borderRadius: "0"
            }}>
              <img 
                src={project.boxart}
                alt={project.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover"
                }}
              />
              {/* Title overlay at bottom of image */}
              <div style={{
                position: "absolute",
                bottom: "0",
                left: "0",
                right: "0",
                background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.8) 80%, transparent 100%)",
                padding: isMobile ? "0.5rem 0.25rem 0.25rem" : "1rem 0.5rem 0.5rem",
                textAlign: "center",
                color: "#ffffff",
                fontSize: isMobile ? "0.65rem" : "0.75rem",
                fontWeight: "600",
                lineHeight: "1.2"
              }}>
                {project.title}
              </div>
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectCarousel; 