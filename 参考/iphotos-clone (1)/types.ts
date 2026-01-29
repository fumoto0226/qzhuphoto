import React from 'react';

export interface Photo {
  id: string;
  url: string;
  thumbnail: string;
  date: string;
  location: string;
  width: number;
  height: number;
}

export interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}