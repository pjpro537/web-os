import React, { ReactNode } from 'react';

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  icon: React.ElementType;
  component: ReactNode;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

export interface FileSystemItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string; // For text files
  children?: FileSystemItem[]; // For folders
  parentId: string | null;
  appId?: string; // For executable files
}

export interface AppDefinition {
  id: string;
  name: string;
  icon: React.ElementType;
  component: React.FC<any>;
  defaultWidth?: number;
  defaultHeight?: number;
  description?: string;
}

export enum BootState {
  OFF = 'OFF',
  BOOTING = 'BOOTING',
  LOGIN = 'LOGIN',
  DESKTOP = 'DESKTOP',
  BSOD = 'BSOD'
}