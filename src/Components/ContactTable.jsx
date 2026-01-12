// ContactTable.jsx
import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Button } from 'react-bootstrap';
import axios from 'axios';

const ContactTable = () => {
  const [contacts, setContacts] = useState([]);
  const api = axios.create({
    baseURL: 'http://localhost:5000',
    withCredentials: true
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await api.get('/api/contacts');
      setContacts(response.data.contacts);
    } catch (err) {
      console.error('Error fetching contacts:', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/api/contacts/${id}/read`);
      fetchContacts(); // Refresh the list
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  return (
    <Container>
      <h2>Contact Messages</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Subject</th>
            <th>Message</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map(contact => (
            <tr key={contact._id}>
              <td>{contact.name}</td>
              <td>{contact.email}</td>
              <td>{contact.subject || 'No Subject'}</td>
              <td>{contact.message}</td>
              <td>{new Date(contact.createdAt).toLocaleDateString()}</td>
              <td>
                <Badge bg={contact.isRead ? 'secondary' : 'primary'}>
                  {contact.isRead ? 'Read' : 'Unread'}
                </Badge>
              </td>
              <td>
                {!contact.isRead && (
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => markAsRead(contact._id)}
                  >
                    Mark as Read
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default ContactTable;