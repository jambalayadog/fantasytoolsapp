import React, { useState, useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import TitleBar from "./components/TitleBar";
import ProjectCarousel from "./components/ProjectCarousel";
import ContentSection from "./components/ContentSection";
import LegalBar from "./components/LegalBar";
import { PortfolioProject } from "./portfolioTypes";

const getBasename = () => {
  const path = window.location.pathname;
  if (path.startsWith('/portfolio')) {
    return '/portfolio';
  }
  return '/gamedevelopmentportfolio';
};

function App() {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  useEffect(() => {
    fetch(process.env.PUBLIC_URL + "/data/portfolio.json")
      .then((res) => res.json())
      .then((data: PortfolioProject[]) => {
        setProjects(data);
        setSelectedProject(data[0]);
        setCurrentMediaIndex(0); // Reset media index when data loads
      });
  }, []);

  // Reset media index when project changes
  const handleProjectSelect = (project: PortfolioProject) => {
    setSelectedProject(project);
    setCurrentMediaIndex(0);
  };

  if (!selectedProject || projects.length === 0) return <div className="text-white">Loading...</div>;

  return (
    <Router basename={getBasename()}>
      <div className="h-screen flex flex-col bg-gray-900 overflow-hidden">
        {/* Title Bar - 5% of viewport height */}
        <div style={{ height: "5vh", width: "100%", border: "0px solid green"  }}>
          <TitleBar />
        </div>

        {/* Project Carousel - 20% of main content */}
        <div style={{ height: "20vh", width: "100%", flexShrink: 0 }}>
          <ProjectCarousel 
            projects={projects}
            selectedProject={selectedProject}
            onProjectSelect={handleProjectSelect}
          />
        </div>
        
        {/* Content Section 1 - Media Showcase - 40% of page */}
        <div style={{ height: "40vh", width: "100%", flexShrink: 0, backgroundColor: "#1f2937", border: "0px solid blue"  }}>
          <ContentSection 
            title="Media Showcase"
            type="media"
            project={selectedProject}
            currentMediaIndex={currentMediaIndex}
            onMediaIndexChange={setCurrentMediaIndex}
          />
        </div>
        
        {/* Content Section 2 - Impact Bullets - 30% of page */}
        <div style={{ height: "30vh", width: "100%", flexShrink: 0, backgroundColor: "#1f2937", border: "0px solid red" }}>
          <ContentSection 
            title="Impact & Achievements"
            type="impact"
            project={selectedProject}
            currentMediaIndex={currentMediaIndex}
            onMediaIndexChange={setCurrentMediaIndex}
          />
        </div>
        
        {/* Legal Bar - 5% of viewport height */}
        <div style={{ height: "5vh", minHeight: "40px", border: "0px solid purple" }}>
          <LegalBar />
        </div>
      </div>
    </Router>
  );
}

export default App;
