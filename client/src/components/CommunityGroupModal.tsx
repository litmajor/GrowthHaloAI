
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Globe, Lock, MapPin, Tag } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface CommunityGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (groupData: any) => void;
}

export default function CommunityGroupModal({ isOpen, onClose, onCreateGroup }: CommunityGroupModalProps) {
  const [groupData, setGroupData] = useState({
    name: '',
    description: '',
    category: 'general',
    isPrivate: false,
    location: 'virtual',
    tags: [] as string[],
    guidelines: '',
    maxMembers: 50
  });

  const [currentTag, setCurrentTag] = useState('');

  const addTag = () => {
    if (currentTag.trim() && !groupData.tags.includes(currentTag.trim())) {
      setGroupData({
        ...groupData,
        tags: [...groupData.tags, currentTag.trim()]
      });
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setGroupData({
      ...groupData,
      tags: groupData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleSubmit = () => {
    if (groupData.name.trim() && groupData.description.trim()) {
      onCreateGroup(groupData);
      onClose();
      // Reset form
      setGroupData({
        name: '',
        description: '',
        category: 'general',
        isPrivate: false,
        location: 'virtual',
        tags: [],
        guidelines: '',
        maxMembers: 50
      });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Create Growth Circle</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Circle Name *
                </label>
                <input
                  type="text"
                  value={groupData.name}
                  onChange={(e) => setGroupData({...groupData, name: e.target.value})}
                  placeholder="e.g., Mindful Entrepreneurs, Creative Writers Circle"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-gray-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={groupData.description}
                  onChange={(e) => setGroupData({...groupData, description: e.target.value})}
                  placeholder="Describe the purpose and vision of your circle..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-gray-200"
                />
              </div>
            </div>

            {/* Category and Privacy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={groupData.category}
                  onChange={(e) => setGroupData({...groupData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-gray-200"
                >
                  <option value="general">General Growth</option>
                  <option value="career">Career Development</option>
                  <option value="relationships">Relationships</option>
                  <option value="health">Health & Wellness</option>
                  <option value="creativity">Creativity & Arts</option>
                  <option value="spirituality">Spirituality</option>
                  <option value="learning">Learning & Skills</option>
                  <option value="entrepreneurship">Entrepreneurship</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Privacy Setting
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => setGroupData({...groupData, isPrivate: false})}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md border ${
                      !groupData.isPrivate 
                        ? 'border-primary bg-primary/10 text-primary' 
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    <span>Public</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGroupData({...groupData, isPrivate: true})}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md border ${
                      groupData.isPrivate 
                        ? 'border-primary bg-primary/10 text-primary' 
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Lock className="w-4 h-4" />
                    <span>Private</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  placeholder="Add tags (press Enter)"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-gray-200"
                />
                <Button onClick={addTag} size="sm">
                  <Tag className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {groupData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="ml-1 text-xs">
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Location and Size */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={groupData.location}
                  onChange={(e) => setGroupData({...groupData, location: e.target.value})}
                  placeholder="Virtual, New York, London, etc."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-gray-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Members
                </label>
                <input
                  type="number"
                  value={groupData.maxMembers}
                  onChange={(e) => setGroupData({...groupData, maxMembers: parseInt(e.target.value)})}
                  min="5"
                  max="500"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-gray-200"
                />
              </div>
            </div>

            {/* Guidelines */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Community Guidelines (Optional)
              </label>
              <textarea
                value={groupData.guidelines}
                onChange={(e) => setGroupData({...groupData, guidelines: e.target.value})}
                placeholder="Set expectations and guidelines for your circle members..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-gray-200"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!groupData.name.trim() || !groupData.description.trim()}
                className="bg-gradient-to-r from-primary to-accent text-white"
              >
                Create Circle
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
