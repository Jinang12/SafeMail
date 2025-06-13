import React from 'react';
import { FaShieldAlt, FaRobot, FaClock, FaUsers, FaChartLine, FaLock, FaCode, FaServer } from 'react-icons/fa';

const About = () => {
  const features = [
    {
      icon: <FaShieldAlt />,
      title: "Advanced Security",
      description: "Our multi-layered security system combines machine learning with traditional security protocols to provide comprehensive protection against evolving threats."
    },
    {
      icon: <FaRobot />,
      title: "AI-Powered",
      description: "Leveraging cutting-edge artificial intelligence to detect and prevent sophisticated cyber threats in real-time, continuously learning from new attack patterns."
    },
    {
      icon: <FaClock />,
      title: "Real-Time Protection",
      description: "24/7 monitoring and instant threat response system that keeps you protected without compromising performance or user experience."
    },
    {
      icon: <FaLock />,
      title: "Privacy First",
      description: "Your data security is our top priority. We implement end-to-end encryption and strict privacy protocols to ensure your information remains confidential."
    },
    {
      icon: <FaCode />,
      title: "Innovation Driven",
      description: "Constantly evolving our technology stack to stay ahead of emerging threats and provide the most effective security solutions."
    },
    {
      icon: <FaServer />,
      title: "Enterprise Grade",
      description: "Built with scalability in mind, our infrastructure can handle millions of requests while maintaining high performance and reliability."
    }
  ];

  const stats = [
    {
      number: "99.9%",
      label: "Threat Detection Rate"
    },
    {
      number: "24/7",
      label: "Real-Time Protection"
    },
    {
      number: "1M+",
      label: "Protected Users"
    },
    {
      number: "50K+",
      label: "Threats Blocked Daily"
    }
  ];

  return (
    <div className="about-section">
      <div className="about-content">
        <h2 className="about-title">About SafeMail</h2>
        <p className="about-subtitle">
          Pioneering the Future of Email Security with Advanced AI Technology
        </p>
        
        <div className="about-description">
          <p>
            SafeMail was born from a vision to revolutionize email security in an increasingly complex digital landscape. 
            Our journey began with a simple yet powerful idea: to create a security solution that's both powerful enough to 
            protect against sophisticated threats and simple enough for anyone to use.
          </p>
          <p>
            Today, we stand at the forefront of cybersecurity innovation, combining cutting-edge artificial intelligence 
            with advanced threat detection to protect millions of users worldwide. Our platform specializes in identifying 
            and neutralizing sophisticated spam, phishing attempts, and fraudulent activities across multiple communication channels.
          </p>
        </div>

        <div className="about-mission">
          <h3 className="mission-title">Our Mission</h3>
          <p className="mission-description">
            To empower individuals and organizations with enterprise-grade security tools that are accessible, 
            effective, and easy to use. We believe that everyone deserves robust protection against digital threats, 
            regardless of their technical expertise.
          </p>
        </div>

        <div className="about-features">
          {features.map((feature, index) => (
            <div key={index} className="feature-item">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="about-stats">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <span className="stat-number">{stat.number}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>

        <div className="about-values">
          <h3 className="values-title">Our Core Values</h3>
          <div className="values-grid">
            <div className="value-item">
              <h4>Innovation</h4>
              <p>Continuously pushing the boundaries of what's possible in cybersecurity</p>
            </div>
            <div className="value-item">
              <h4>Security</h4>
              <p>Uncompromising commitment to protecting our users' digital safety</p>
            </div>
            <div className="value-item">
              <h4>Accessibility</h4>
              <p>Making advanced security tools available to everyone</p>
            </div>
            <div className="value-item">
              <h4>Transparency</h4>
              <p>Clear communication about our technology and practices</p>
            </div>
          </div>
        </div>

        <div className="about-cta">
          <h3>Ready to Experience Next-Gen Email Security?</h3>
          <p>Join millions of users who trust SafeMail for their email security needs.</p>
          <button className="cta-button">Get Started Now</button>
        </div>
      </div>
    </div>
  );
};

export default About; 