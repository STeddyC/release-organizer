import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface Release {
  id?: string;
  name: string;
  artist: string;
  type: 'Single' | 'EP' | 'Album';
  label: string;
  releaseDate: string;
  artwork?: File;
  artworkUrl?: string;
}

interface EditReleaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (release: Release) => void;
  onDelete: (id: string) => void;
  release: Release;
}

function EditReleaseModal({ isOpen, onClose, onSubmit, onDelete, release }: EditReleaseModalProps) {
  const [editedRelease, setEditedRelease] = useState<Release>(release);
  const [artworkPreview, setArtworkPreview] = useState<string>(release.artworkUrl || '');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    setEditedRelease(release);
    setArtworkPreview(release.artworkUrl || '');
  }, [release]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedRelease(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('File must be an image');
        return;
      }
      setEditedRelease(prev => ({ ...prev, artwork: file }));
      setArtworkPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(editedRelease);
    onClose();
  };

  const handleDelete = () => {
    if (release.id) {
      onDelete(release.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark-100 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-text">Edit Release</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-text transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text mb-1">
              Release Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full rounded-md border border-gray-300 dark:border-dark-300 p-2 focus:ring-secondary focus:border-secondary dark:bg-dark-200 dark:text-white"
              value={editedRelease.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="artist" className="block text-sm font-medium text-text mb-1">
              Artist
            </label>
            <input
              type="text"
              id="artist"
              name="artist"
              required
              className="w-full rounded-md border border-gray-300 dark:border-dark-300 p-2 focus:ring-secondary focus:border-secondary dark:bg-dark-200 dark:text-white"
              value={editedRelease.artist}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-text mb-1">
              Type
            </label>
            <select
              id="type"
              name="type"
              required
              className="w-full rounded-md border border-gray-300 dark:border-dark-300 p-2 focus:ring-secondary focus:border-secondary dark:bg-dark-200 dark:text-white"
              value={editedRelease.type}
              onChange={handleChange}
            >
              <option value="Single">Single</option>
              <option value="EP">EP</option>
              <option value="Album">Album</option>
            </select>
          </div>

          <div>
            <label htmlFor="label" className="block text-sm font-medium text-text mb-1">
              Label
            </label>
            <input
              type="text"
              id="label"
              name="label"
              required
              className="w-full rounded-md border border-gray-300 dark:border-dark-300 p-2 focus:ring-secondary focus:border-secondary dark:bg-dark-200 dark:text-white"
              value={editedRelease.label}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="releaseDate" className="block text-sm font-medium text-text mb-1">
              Release Date
            </label>
            <input
              type="date"
              id="releaseDate"
              name="releaseDate"
              required
              className="w-full rounded-md border border-gray-300 dark:border-dark-300 p-2 focus:ring-secondary focus:border-secondary dark:bg-dark-200 dark:text-white"
              value={editedRelease.releaseDate}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="artwork" className="block text-sm font-medium text-text mb-1">
              Artwork
            </label>
            <input
              type="file"
              id="artwork"
              name="artwork"
              accept="image/*"
              className={cn(
                "w-full text-sm text-gray-500 dark:text-gray-400",
                "file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0",
                "file:text-sm file:font-medium",
                "file:bg-secondary file:text-white",
                "hover:file:bg-secondary/90"
              )}
              onChange={handleFileChange}
            />
            {artworkPreview && (
              <div className="mt-2">
                <img
                  src={artworkPreview}
                  alt="Artwork preview"
                  className="w-32 h-32 object-cover rounded-md"
                />
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-6">
            <button
              type="button"
              onClick={() => setIsDeleteConfirmOpen(true)}
              className={cn(
                "px-4 py-2 rounded-md",
                "bg-red-50 dark:bg-red-900/30",
                "text-red-600 dark:text-red-400",
                "hover:bg-red-100 dark:hover:bg-red-900/50",
                "transition-colors",
                "flex items-center gap-2"
              )}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-dark-300 rounded-md text-text hover:bg-gray-50 dark:hover:bg-dark-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>

        {/* Delete Confirmation Modal */}
        {isDeleteConfirmOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-dark-100 rounded-lg p-6 w-full max-w-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Delete Release
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to delete "{editedRelease.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-dark-300 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EditReleaseModal;