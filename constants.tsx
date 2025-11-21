import { FileSystemItem } from './types';

export const INITIAL_FILES: FileSystemItem[] = [
  {
    id: 'root',
    name: 'C:',
    type: 'folder',
    parentId: null,
    children: [
      {
        id: 'docs',
        name: 'Documents',
        type: 'folder',
        parentId: 'root',
        children: [
          { id: 'resume', name: 'resume.txt', type: 'file', parentId: 'docs', content: 'Senior React Engineer\nExperience: 10 Years\nSkills: React, TypeScript, Node.js' },
          { id: 'notes', name: 'ideas.txt', type: 'file', parentId: 'docs', content: 'Build a WebOS with React...' },
        ]
      },
      {
        id: 'images',
        name: 'Pictures',
        type: 'folder',
        parentId: 'root',
        children: []
      },
      {
        id: 'sys',
        name: 'System',
        type: 'folder',
        parentId: 'root',
        children: [
             { id: 'sys_log', name: 'boot.log', type: 'file', parentId: 'sys', content: 'System initialized successfully.\nDrivers loaded.\nKernel active.' },
        ]
      }
    ]
  }
];