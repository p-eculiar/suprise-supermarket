// Admin Contacts Page
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { FiMail, FiCheckCircle, FiClock, FiArrowLeft, FiTrash2 } from 'react-icons/fi';
import toast from '../../components/common/Toast';

interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

const AdminContacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (contactId: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ status: 'read' })
        .eq('id', contactId);
      
      if (error) throw error;
      
      // Update local state
      setContacts(contacts.map(contact => 
        contact.id === contactId ? { ...contact, status: 'read' } : contact
      ));
      
      if (selectedContact && selectedContact.id === contactId) {
        setSelectedContact({ ...selectedContact, status: 'read' });
      }
    } catch (error) {
      console.error('Error marking contact as read:', error);
    }
  };

  const markAsReplied = async (contactId: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ status: 'replied' })
        .eq('id', contactId);
      
      if (error) throw error;
      
      // Update local state
      setContacts(contacts.map(contact => 
        contact.id === contactId ? { ...contact, status: 'replied' } : contact
      ));
      
      if (selectedContact && selectedContact.id === contactId) {
        setSelectedContact({ ...selectedContact, status: 'replied' });
      }
    } catch (error) {
      console.error('Error marking contact as replied:', error);
    }
  };

  // Add delete function
  const deleteContact = async (contactId: string) => {
    if (!window.confirm('Are you sure you want to delete this contact message?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId);
      
      if (error) throw error;
      
      // Update local state
      setContacts(contacts.filter(contact => contact.id !== contactId));
      
      if (selectedContact && selectedContact.id === contactId) {
        setSelectedContact(null);
      }
      
      toast.success('Contact message deleted successfully');
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Failed to delete contact message');
    }
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <Title>Contact Messages</Title>
        </Header>
        <Loading>Loading contacts...</Loading>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BackLink to="/admin">
          <FiArrowLeft /> Back to Dashboard
        </BackLink>
        <Title>Contact Messages</Title>
        <Stats>
          Total: {contacts.length} | 
          New: {contacts.filter(c => c.status === 'new').length} | 
          Read: {contacts.filter(c => c.status === 'read').length} | 
          Replied: {contacts.filter(c => c.status === 'replied').length}
        </Stats>
      </Header>

      {selectedContact ? (
        <ContactDetail>
          <DetailHeader>
            <BackButton onClick={() => setSelectedContact(null)}>
              ← Back to List
            </BackButton>
            <DetailActions>
              {selectedContact.status === 'new' && (
                <ActionButton onClick={() => markAsRead(selectedContact.id)}>
                  <FiCheckCircle /> Mark as Read
                </ActionButton>
              )}
              <ActionButton onClick={() => markAsReplied(selectedContact.id)}>
                <FiMail /> Mark as Replied
              </ActionButton>
              <ActionButton 
                onClick={() => deleteContact(selectedContact.id)}
                style={{ backgroundColor: '#e74c3c' }}
              >
                <FiTrash2 /> Delete
              </ActionButton>
            </DetailActions>
          </DetailHeader>
          
          <ContactInfo>
            <InfoRow>
              <Label>From:</Label>
              <Value>{selectedContact.name} ({selectedContact.email})</Value>
            </InfoRow>
            <InfoRow>
              <Label>Subject:</Label>
              <Value>{selectedContact.subject}</Value>
            </InfoRow>
            <InfoRow>
              <Label>Date:</Label>
              <Value>{new Date(selectedContact.created_at).toLocaleString()}</Value>
            </InfoRow>
            <InfoRow>
              <Label>Status:</Label>
              <StatusBadge $status={selectedContact.status}>
                {selectedContact.status}
              </StatusBadge>
            </InfoRow>
          </ContactInfo>
          
          <MessageContent>
            <Label>Message:</Label>
            <MessageText>{selectedContact.message}</MessageText>
          </MessageContent>
        </ContactDetail>
      ) : (
        <ContactsTable>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} style={{ textAlign: 'center' }}>
                  No contact messages found
                </TableCell>
              </TableRow>
            ) : (
              contacts.map(contact => (
                <TableRow key={contact.id}>
                  <TableCell>
                    {new Date(contact.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{contact.name}</TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>
                    <SubjectPreview 
                      onClick={() => setSelectedContact(contact)}
                    >
                      {contact.subject}
                    </SubjectPreview>
                  </TableCell>
                  <TableCell>
                    <StatusBadge $status={contact.status}>
                      {contact.status}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    <ActionLink onClick={() => setSelectedContact(contact)}>
                      View
                    </ActionLink>
                    {' | '}
                    <ActionLink 
                      onClick={() => deleteContact(contact.id)}
                      style={{ color: '#e74c3c' }}
                    >
                      Delete
                    </ActionLink>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </ContactsTable>
      )}
    </Container>
  );
};

export default AdminContacts;

// Styled Components
const Container = styled.div`
  padding: 2rem;
  background: #F8F9FA;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const BackLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6C9A7F;
  text-decoration: none;
  font-weight: 600;
  
  &:hover {
    text-decoration: underline;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #2D3436;
  margin: 0;
`;

const Stats = styled.div`
  font-size: 0.95rem;
  color: #636E72;
`;

const Loading = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6C9A7F;
`;

const ContactsTable = styled.table`
  width: 100%;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: #6C9A7F;
  color: white;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid #F0F0F0;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: #F8F9FA;
  }
`;

const TableHead = styled.th`
  text-align: left;
  padding: 1rem;
  font-weight: 600;
`;

const TableCell = styled.td`
  padding: 1rem;
  font-size: 0.95rem;
  color: #2D3436;
`;

const SubjectPreview = styled.div`
  color: #6C9A7F;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    switch (props.$status) {
      case 'new': return '#FF980015';
      case 'read': return '#4ECDC415';
      case 'replied': return '#4CAF5015';
      default: return '#E1E8ED';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'new': return '#FF9800';
      case 'read': return '#4ECDC4';
      case 'replied': return '#4CAF50';
      default: return '#636E72';
    }
  }};
`;

const ActionLink = styled.button`
  background: none;
  border: none;
  color: #6C9A7F;
  font-weight: 600;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  
  &:hover {
    background: #6C9A7F15;
  }
`;

const ContactDetail = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const DetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #E1E8ED;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #6C9A7F;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const DetailActions = styled.div`
  display: flex;
  gap: 1rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #6C9A7F;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background: #5A8569;
  }
`;

const ContactInfo = styled.div`
  margin-bottom: 2rem;
`;

const InfoRow = styled.div`
  display: flex;
  margin-bottom: 1rem;
  align-items: flex-start;
`;

const Label = styled.div`
  font-weight: 700;
  color: #2D3436;
  width: 100px;
  flex-shrink: 0;
`;

const Value = styled.div`
  color: #636E72;
  flex: 1;
`;

const MessageContent = styled.div``;

const MessageText = styled.div`
  background: #F8F9FA;
  padding: 1.5rem;
  border-radius: 8px;
  color: #2D3436;
  line-height: 1.6;
  white-space: pre-wrap;
  margin-top: 0.5rem;
`;