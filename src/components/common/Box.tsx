import styled from 'styled-components';

export interface BoxProps {
  mb?: number;
  mt?: number;
  ml?: number;
  mr?: number;
  mx?: number;
  my?: number;
  m?: number;
  p?: number;
  pb?: number;
  pt?: number;
  pl?: number;
  pr?: number;
  px?: number;
  py?: number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  display?: string;
  flexDirection?: string;
  alignItems?: string;
  justifyContent?: string;
  gap?: number;
  children?: React.ReactNode;
}

export const Box = styled.div<BoxProps>`
  ${({ mb, theme }) => mb && `margin-bottom: ${theme.spacing(mb)};`}
  ${({ mt, theme }) => mt && `margin-top: ${theme.spacing(mt)};`}
  ${({ ml, theme }) => ml && `margin-left: ${theme.spacing(ml)};`}
  ${({ mr, theme }) => mr && `margin-right: ${theme.spacing(mr)};`}
  ${({ mx, theme }) => mx && `margin-left: ${theme.spacing(mx)}; margin-right: ${theme.spacing(mx)};`}
  ${({ my, theme }) => my && `margin-top: ${theme.spacing(my)}; margin-bottom: ${theme.spacing(my)};`}
  ${({ m, theme }) => m && `margin: ${theme.spacing(m)};`}
  
  ${({ p, theme }) => p && `padding: ${theme.spacing(p)};`}
  ${({ pb, theme }) => pb && `padding-bottom: ${theme.spacing(pb)};`}
  ${({ pt, theme }) => pt && `padding-top: ${theme.spacing(pt)};`}
  ${({ pl, theme }) => pl && `padding-left: ${theme.spacing(pl)};`}
  ${({ pr, theme }) => pr && `padding-right: ${theme.spacing(pr)};`}
  ${({ px, theme }) => px && `padding-left: ${theme.spacing(px)}; padding-right: ${theme.spacing(px)};`}
  ${({ py, theme }) => py && `padding-top: ${theme.spacing(py)}; padding-bottom: ${theme.spacing(py)};`}
  
  ${({ textAlign }) => textAlign && `text-align: ${textAlign};`}
  ${({ display }) => display && `display: ${display};`}
  ${({ flexDirection }) => flexDirection && `flex-direction: ${flexDirection};`}
  ${({ alignItems }) => alignItems && `align-items: ${alignItems};`}
  ${({ justifyContent }) => justifyContent && `justify-content: ${justifyContent};`}
  ${({ gap, theme }) => gap && `gap: ${theme.spacing(gap)};`}
`;
