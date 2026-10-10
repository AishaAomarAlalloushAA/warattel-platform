import React, { Component } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SiteLayout from "./components/SiteLayout";
import AdminLayout from "./components/AdminLayout";
import SupervisorLayout from "./components/SupervisorLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import SplashScreen from "./components/Splashscreen";
import AboutClub from "./components/AboutClub";
import ContactSection from "./components/contactsection";

import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Register from "./pages/Register";
import Feedback from "./pages/Feedback";
import Lectures from "./pages/Lectures";
import Programs from "./pages/Programs";
import AdminDashboard from "./pages/AdminDashboard";
import AdminInbox from "./pages/AdminInbox";
import StudentDashboard from "./pages/StudentDashboard";
import StudentLevel from "./pages/StudentLevel";
import StudentReports from "./pages/StudentReports";
import StudentTests from "./pages/StudentTests";
import StudentActivities from "./pages/StudentActivities";
import StudentAchievements from "./pages/StudentAchievements";
import StudentLinks from "./pages/StudentLinks";
import StudentProfile from "./pages/StudentProfile";
import AdminStudents from "./pages/AdminStudents";
import AdminSupervisors from "./pages/AdminSupervisors";
import AdminStudentsCount from "./pages/AdminStudentsCount";
import AdminReportsCount from "./pages/AdminReportsCount";
import AdminExamsCount from "./pages/AdminExamsCount";
import AdminActivitiesCount from "./pages/AdminActivitiesCount";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import SupervisorStudents from "./pages/SupervisorStudents";
import SupervisorReports from "./pages/SupervisorReports";
import SupervisorExams from "./pages/SupervisorExams";
import Volunteer from "./pages/Volunteer";
import ChangePassword from "./pages/ChangePassword";

import "./App.css";
import "./theme.css";
import "./responsive.css";
import "./navigation-hero.css";
import "./mobile-drawer-side.css";
import "./admin-polish.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { theme: localStorage.getItem("theme") || "light" };
    this.revealObserver = null;
  }

  componentDidMount() {
    document.documentElement.setAttribute("data-theme", this.state.theme);
    this.setupRevealAnimations();
  }

  componentWillUnmount() { this.revealObserver?.disconnect(); }

  setupRevealAnimations = () => {
    const elements = document.querySelectorAll(".about-club-card, .program-card, .contact-card, .site-footer__group");
    if (!elements.length) return;
    elements.forEach((element, index) => {
      element.classList.add("ui-reveal");
      element.style.setProperty("--reveal-delay", `${Math.min(index * 70, 350)}ms`);
    });
    if (!("IntersectionObserver" in window)) { elements.forEach((element) => element.classList.add("is-visible")); return; }
    this.revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    elements.forEach((element) => this.revealObserver.observe(element));
  };

  toggleTheme = () => {
    const newTheme = this.state.theme === "light" ? "dark" : "light";
    this.setState({ theme: newTheme });
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  renderHome = () => (
    <div className="home-page">
      <Navbar toggleTheme={this.toggleTheme} theme={this.state.theme} />
      <main>
        <section className="section section--splash" id="home-section"><SplashScreen /></section>
        <section className="section about-club-section"><AboutClub /></section>
        <section className="section programs-section" id="programs-section"><Programs /></section>
        <section className="section contact-home-section"><ContactSection /></section>
      </main>
      <Footer />
    </div>
  );

  renderWithHeader = (page, showFooter = false) => (
    <SiteLayout theme={this.state.theme} toggleTheme={this.toggleTheme} showFooter={showFooter}>{page}</SiteLayout>
  );

  renderAdmin = (page) => (
    <ProtectedRoute role="admin">
      <AdminLayout theme={this.state.theme} toggleTheme={this.toggleTheme}>{page}</AdminLayout>
    </ProtectedRoute>
  );

  renderSupervisor = (page) => (
    <ProtectedRoute role="supervisor">
      <SupervisorLayout theme={this.state.theme} toggleTheme={this.toggleTheme}>{page}</SupervisorLayout>
    </ProtectedRoute>
  );

  renderStudent = (page) => (
    <ProtectedRoute role="student">{this.renderWithHeader(page)}</ProtectedRoute>
  );

  render() {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/register" element={<Register />} />

          <Route path="/feedback" element={this.renderWithHeader(<Feedback />, true)} />
          <Route path="/lectures" element={this.renderWithHeader(<Lectures />, true)} />
          <Route path="/volunteer" element={this.renderWithHeader(<Volunteer />, true)} />

          <Route path="/admin-dashboard" element={this.renderAdmin(<AdminDashboard />)} />
          <Route path="/admin-inbox" element={this.renderAdmin(<AdminInbox />)} />
          <Route path="/admin-students" element={this.renderAdmin(<AdminStudents />)} />
          <Route path="/admin-supervisors" element={this.renderAdmin(<AdminSupervisors />)} />
          <Route path="/admin-students-count" element={this.renderAdmin(<AdminStudentsCount />)} />
          <Route path="/admin-reports-count" element={this.renderAdmin(<AdminReportsCount />)} />
          <Route path="/admin-exams-count" element={this.renderAdmin(<AdminExamsCount />)} />
          <Route path="/admin-activities-count" element={this.renderAdmin(<AdminActivitiesCount />)} />

          <Route path="/supervisor-dashboard" element={this.renderSupervisor(<SupervisorDashboard />)} />
          <Route path="/supervisor-students" element={this.renderSupervisor(<SupervisorStudents />)} />
          <Route path="/supervisor-reports" element={this.renderSupervisor(<SupervisorReports />)} />
          <Route path="/supervisor-exams" element={this.renderSupervisor(<SupervisorExams />)} />

          <Route path="/student-dashboard" element={this.renderStudent(<StudentDashboard />)} />
          <Route path="/student-level" element={this.renderStudent(<StudentLevel />)} />
          <Route path="/student-reports" element={this.renderStudent(<StudentReports />)} />
          <Route path="/student-tests" element={this.renderStudent(<StudentTests />)} />
          <Route path="/student-activities" element={this.renderStudent(<StudentActivities />)} />
          <Route path="/student-achievements" element={this.renderStudent(<StudentAchievements />)} />
          <Route path="/student-links" element={this.renderStudent(<StudentLinks />)} />
          <Route path="/student-profile" element={this.renderStudent(<StudentProfile />)} />
          <Route path="/change-password" element={this.renderStudent(<ChangePassword />)} />

          <Route path="/" element={this.renderHome()} />
        </Routes>
      </BrowserRouter>
    );
  }
}

export default App;
