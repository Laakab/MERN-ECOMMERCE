import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { motion } from 'framer-motion';
import styled from 'styled-components';

// Styled components for custom styling
const TeamSection = styled.section`
  padding: 5rem 0;
  background-color: #f8f9fa;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 3rem;
  text-align: center;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -15px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 4px;
    background: linear-gradient(to right, #ff6b6b, #4ecdc4);
  }
`;

const SectionSubtitle = styled.p`
  font-size: 1.1rem;
  color: #6c757d;
  text-align: center;
  max-width: 700px;
  margin: 0 auto 4rem auto;
`;

const TeamCard = styled(Card)`
  border: none;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  margin-bottom: 30px;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
  }
`;

const TeamImage = styled(Card.Img)`
  height: 300px;
  object-fit: cover;
`;

const SocialIcon = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: #f1f1f1;
  border-radius: 50%;
  margin: 0 5px;
  color: #333;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(to right, #ff6b6b, #4ecdc4);
    color: white;
    transform: translateY(-3px);
  }
`;

const TeamMemberName = styled(Card.Title)`
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const TeamMemberPosition = styled(Card.Text)`
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

const Team = () => {
  const teamMembers = [
    {
      id: 1,
      name: 'John Doe',
      position: 'CEO & Founder',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      social: {
        facebook: '#',
        twitter: '#',
        instagram: '#',
        linkedin: '#'
      }
    },
    {
      id: 2,
      name: 'Jane Smith',
      position: 'Marketing Director',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      social: {
        facebook: '#',
        twitter: '#',
        instagram: '#',
        linkedin: '#'
      }
    },
    {
      id: 3,
      name: 'Mike Johnson',
      position: 'Product Manager',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      social: {
        facebook: '#',
        twitter: '#',
        instagram: '#',
        linkedin: '#'
      }
    },
    {
      id: 4,
      name: 'Sarah Williams',
      position: 'UX Designer',
      image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      social: {
        facebook: '#',
        twitter: '#',
        instagram: '#',
        linkedin: '#'
      }
    }
  ];

  return (
    <TeamSection id="team">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SectionTitle>Meet Our Team</SectionTitle>
          <SectionSubtitle>
            Our team of professionals is dedicated to providing you with the best shopping experience.
          </SectionSubtitle>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Row>
            {teamMembers.map((member) => (
              <Col lg={3} md={6} key={member.id}>
                <motion.div variants={itemVariants}>
                  <TeamCard>
                    <TeamImage variant="top" src={member.image} alt={member.name} />
                    <Card.Body className="text-center">
                      <TeamMemberName>{member.name}</TeamMemberName>
                      <TeamMemberPosition>{member.position}</TeamMemberPosition>
                      <div className="d-flex justify-content-center">
                        <SocialIcon href={member.social.facebook} target="_blank" rel="noopener noreferrer">
                          <FaFacebook />
                        </SocialIcon>
                        <SocialIcon href={member.social.twitter} target="_blank" rel="noopener noreferrer">
                          <FaTwitter />
                        </SocialIcon>
                        <SocialIcon href={member.social.instagram} target="_blank" rel="noopener noreferrer">
                          <FaInstagram />
                        </SocialIcon>
                        <SocialIcon href={member.social.linkedin} target="_blank" rel="noopener noreferrer">
                          <FaLinkedin />
                        </SocialIcon>
                      </div>
                    </Card.Body>
                  </TeamCard>
                </motion.div>
              </Col>
            ))}
          </Row>
        </motion.div>
      </Container>
    </TeamSection>
  );
};

export default Team;