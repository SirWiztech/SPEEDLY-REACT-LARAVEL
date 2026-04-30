import React from 'react';

export const Toaster = () => null;

export const toast = {
  success: (message: string) => console.log('Toast success:', message),
  error: (message: string) => console.log('Toast error:', message),
  info: (message: string) => console.log('Toast info:', message),
};
