import React from 'react';
import styled from 'styled-components';

const ColorPickerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 40px;
`;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
`;

const ColorOption = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 8px;
  background-color: ${props => props.color};
  cursor: pointer;
  transition: transform 0.2s ease;
  border: 2px solid transparent;

  &:hover {
    transform: scale(1.1);
    border: 2px solid #333;
  }
`;

const Title = styled.h2`
  color: #333;
  margin-bottom: 20px;
`;

const colorOptions = [
  '#FFD25C', // yellow
  '#4CAF50', // green
  '#2196F3', // blue
  '#9C27B0', // purple
  '#FF5722', // orange
  '#00BCD4', // cyan
  '#795548', // brown
  '#607D8B', // blue-grey
  '#E91E63'  // pink
];

export const ColorPicker = ({ onSelect }) => {
  return (
    <ColorPickerContainer>
      <Title>Player 1: Choose Your Color</Title>
      <ColorGrid>
        {colorOptions.map((color, index) => (
          <ColorOption
            key={index}
            color={color}
            onClick={() => onSelect(color)}
          />
        ))}
      </ColorGrid>
    </ColorPickerContainer>
  );
}; 