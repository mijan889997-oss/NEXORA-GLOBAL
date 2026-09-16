import React from 'react';
import { DigitalProductsSection, DigitalProductsSectionProps } from './DigitalProductsSection';

export const DigitalProductsView: React.FC<DigitalProductsSectionProps> = (props) => {
  return <DigitalProductsSection {...props} />;
};

export default DigitalProductsView;
