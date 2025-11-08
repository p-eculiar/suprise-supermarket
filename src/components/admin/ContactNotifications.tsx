// Contact Notifications Component for Admin Dashboard
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../../lib/supabase';
import { FiMail, FiCheckCircle, FiClock } from 'react-icons/fi';

interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

const ContactNotifications: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
    const interval = setInterval(fetchContacts, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      
      // Fetch recent contacts
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      setContacts(data || []);
      
      // Count unread contacts (in a real implementation, you would have a status field)
      // For now, we'll just count all contacts from the last 24 hours
      const recentContacts = data?.filter(contact => {
        const contactDate = new Date(contact.created_at);
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return contactDate > oneDayAgo;
      }) || [];
      
      setUnreadCount(recentContacts.length);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (contactId: string) => {
    try {
      // In a real implementation, you would update the status in the database
      console.log(`Marking contact ${contactId} as read`);
      
      // For now, we'll just remove it from the unread count
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Error marking contact as read:', error);
    }
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <Title>Contact Messages</Title>
          <Spinner>Loading...</Spinner>
        </Header>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Contact Messages</Title>
        {unreadCount > 0 && (
          <UnreadBadge>
            {unreadCount} new
          </UnreadBadge>
        )}
      </Header>
      
      {contacts.length === 0 ? (
        <EmptyState>
          <FiMail size={48} color="#6C9A7F" />
          <p>No contact messages yet</p>
        </EmptyState>
      ) : (
        <ContactList>
          {contacts.map(contact => (
            <ContactItem key={contact.id}>
              <ContactHeader>
                <ContactInfo>
                  <Name>{contact.name}</Name>
                  <Email>{contact.email}</Email>
                </ContactInfo>
                <Timestamp>
                  {new Date(contact.created_at).toLocaleDateString()}
                </Timestamp>
              </ContactHeader>
              
              <Subject>{contact.subject}</Subject>
              
              <Message>
                {contact.message.length > 100 
                  ? `${contact.message.substring(0, 100)}...` 
                  : contact.message}
              </Message>
              
              <Actions>
                <MarkAsReadButton onClick={() => markAsRead(contact.id)}>
                  <FiCheckCircle />
                  Mark as Read
                </MarkAsReadButton>
              </Actions>
            </ContactItem>
          ))}
        </ContactList>
      )}
    </Container>
  );
};

export default ContactNotifications;

// Styled Components
const Container = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #2D3436;
  margin: 0;
`;

const UnreadBadge = styled.span`
  background: #6C9A7F;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
`;

const Spinner = styled.div`
  color: #6C9A7F;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #636E72;
  
  p {
    margin-top: 1rem;
    font-size: 1rem;
  }
`;

const ContactList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ContactItem = styled.div`
  border: 1px solid #E1E8ED;
  border-radius: 8px;
  padding: 1.25rem;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ContactHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
`;

const ContactInfo = styled.div``;

const Name = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  color: #2D3436;
  margin: 0 0 0.25rem 0;
`;

const Email = styled.div`
  font-size: 0.875rem;
  color: #6C9A7F;
`;

const Timestamp = styled.div`
  font-size: 0.75rem;
  color: #999;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const Subject = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #2D3436;
  margin-bottom: 0.75rem;
`;

const Message = styled.div`
  font-size: 0.875rem;
  color: #636E72;
  line-height: 1.5;
  margin-bottom: 1rem;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const MarkAsReadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #6C9A7F;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  
  &:hover {
    background: #F8F9FA;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;