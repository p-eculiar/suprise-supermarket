import React, { ReactNode } from 'react';
import styled from 'styled-components';

interface SectionProps {
  children: ReactNode;
  className?: string;
  padding?: string | number;
  bgColor?: string;
  id?: string;
}

const StyledSection = styled.section<Omit<SectionProps, 'children'>>`
  padding: ${({ padding }) => (typeof padding === 'number' ? `${padding}px` : padding || '4rem 1rem')};
  background-color: ${({ bgColor, theme }) => 
    bgColor || theme.colors.background.default};
  width: 100%;
  position: relative;
  overflow: hidden;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ padding }) => (typeof padding === 'number' ? `${padding * 1.5}px` : padding || '6rem 2rem')};
  }
`;

const Section: React.FC<SectionProps> = ({
  children,
  className,
  padding,
  bgColor,
  id,
}) => {
  return (
    <StyledSection 
      className={className} 
      padding={padding}
      bgColor={bgColor}
      id={id}
    >
      {children}
    </StyledSection>
  );
};

export { Section };
export default Section;
