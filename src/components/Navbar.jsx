import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FaShieldAlt, FaHome, FaInfoCircle, FaLaptopCode, FaStar } from 'react-icons/fa';

const NavigationBar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: <FaHome /> },
    { path: '/reviews', label: 'Reviews', icon: <FaStar /> },
    { path: '/services', label: 'Services', icon: <FaLaptopCode /> },
    { path: '/about', label: 'About', icon: <FaInfoCircle /> }
  ];

  return (
    <Navbar 
      expand="lg" 
      fixed="top"
      className={`cyber-navbar ${scrolled ? 'scrolled' : ''} ${expanded ? 'expanded' : ''}`}
      onToggle={(expanded) => setExpanded(expanded)}
    >
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center" onClick={scrollToTop}>
          <FaShieldAlt className="brand-icon" />
          <span className="brand-text">SafeMail</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" className="cyber-toggle">
          <span className="navbar-toggler-icon"></span>
        </Navbar.Toggle>

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {navLinks.map((link) => (
              <Nav.Link
                key={link.path}
                as={Link}
                to={link.path}
                className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                onClick={() => {
                  if (link.path === location.pathname) {
                    scrollToTop();
                  }
                }}
              >
                <span className="nav-icon">{link.icon}</span>
                <span className="nav-label">{link.label}</span>
              </Nav.Link>
            ))}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar; 