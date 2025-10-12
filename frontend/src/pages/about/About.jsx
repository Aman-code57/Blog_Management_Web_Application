import React from "react";
import Layout from "../../components/Layout";
import "../../styles/About.css";

function About() {
  return (
    <Layout>
      <div className="about-container">
        <h2>About Blog Management</h2>
        <p>
          Welcome to our Blog Management System        </p>
        <p>
          Features include:
        </p>
        <ul>
          <li>Creating blogs with text, images, and videos</li>
          <li>Managing personal blogs (edit and delete)</li>
        </ul>
        <p>
          Built with React for the frontend and FastAPI for the backend.
        </p>
      </div>
    </Layout>
  );
}

export default About;
