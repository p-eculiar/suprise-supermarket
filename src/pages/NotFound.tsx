import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '../components/common/Button';

export const NotFound: React.FC = () => {
  return (
    <NotFoundContainer>
      <ErrorCode>404</ErrorCode>
      <ErrorMessage>Oops! Page Not Found</ErrorMessage>
      <ErrorDescription>
        The page you are looking for might have been removed, had its name changed,
        or is temporarily unavailable.
      </ErrorDescription>
      <HomeButton to="/">Go to Homepage</HomeButton>
    </NotFoundContainer>
  );
};

const NotFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  padding: ${({ theme }) => theme.spacing(4)};
  text-align: center;
`;

const ErrorCode = styled.h1`
  font-size: 8rem;
  font-weight: 900;
  margin: 0;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary.main}, ${({ theme }) => theme.colors.secondary.main});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const ErrorMessage = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.secondary.main};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const ErrorDescription = styled.p`
  font-size: 1.125rem;
  color: ${({ theme }) => theme.colors.common.gray[600]};
  max-width: 600px;
  margin: 0 auto ${({ theme }) => theme.spacing(4)};
  line-height: 1.6;
`;

const HomeButton = styled(Button)`
  margin-top: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(6)}`};
  font-size: 1.125rem;
`;
