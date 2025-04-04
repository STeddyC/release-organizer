import React, { useState } from 'react';
import { X } from 'lucide-react';
import { getSubscriptionTier } from '../lib/analytics';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';
import SubscriptionPlanModal from './SubscriptionPlanModal';

interface Submission {
  name: string;
  artist: string;
  type: 'Single' | 'EP' | 'Album';
  label: string;
  submissionDate: string;
  expectedAnswerDate: string;
  artwork?: File;
}

interface AddSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (submission: Submission) => void;
}

function AddSubmissionModal({ isOpen, onClose, onSubmit }: AddSubmissionModalProps) {
  const [submission, setSubmission] = useState<Submission>({
    name: '',
    artist: '',
    type: 'Single',
    label: '',
    submissionDate: '',
    expectedAnswerDate: '',
  });
  const [artworkPreview, setArtworkPreview] = useState<string>('');
  const [isChecking, setIsChecking] = useState(false);
  const [showPlans, setShowPlans] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSubmission(prev => ({ ...prev, [name]: value }));
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
      setSubmission(prev => ({ ...prev, artwork: file }));
      setArtworkPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChecking(true);

    try {
      const tier = await getSubscriptionTier();
      if (tier === 'basic') {
        setShowPlans(true);
        return;
      }

      onSubmit(submission);
      onClose();
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast.error('Failed to check subscription. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={cn(
          "w-full max-w-md rounded-lg p-6",
          "bg-white dark:bg-dark-100"
        )}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Submission</h2>
            <button
              onClick={onClose}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Release Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className={cn(
                  "w-full rounded-md p-2",
                  "border border-gray-300 dark:border-dark-300",
                  "focus:ring-secondary focus:border-secondary",
                  "dark:bg-dark-200 dark:text-white"
                )}
                value={submission.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="artist" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Artist
              </label>
              <input
                type="text"
                id="artist"
                name="artist"
                required
                className={cn(
                  "w-full rounded-md p-2",
                  "border border-gray-300 dark:border-dark-300",
                  "focus:ring-secondary focus:border-secondary",
                  "dark:bg-dark-200 dark:text-white"
                )}
                value={submission.artist}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                id="type"
                name="type"
                required
                className={cn(
                  "w-full rounded-md p-2",
                  "border border-gray-300 dark:border-dark-300",
                  "focus:ring-secondary focus:border-secondary",
                  "dark:bg-dark-200 dark:text-white"
                )}
                value={submission.type}
                onChange={handleChange}
              >
                <option value="Single">Single</option>
                <option value="EP">EP</option>
                <option value="Album">Album</option>
              </select>
            </div>

            <div>
              <label htmlFor="label" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Label
              </label>
              <input
                type="text"
                id="label"
                name="label"
                required
                className={cn(
                  "w-full rounded-md p-2",
                  "border border-gray-300 dark:border-dark-300",
                  "focus:ring-secondary focus:border-secondary",
                  "dark:bg-dark-200 dark:text-white"
                )}
                value={submission.label}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="submissionDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Submission Date
              </label>
              <input
                type="date"
                id="submissionDate"
                name="submissionDate"
                required
                className={cn(
                  "w-full rounded-md p-2",
                  "border border-gray-300 dark:border-dark-300",
                  "focus:ring-secondary focus:border-secondary",
                  "dark:bg-dark-200 dark:text-white"
                )}
                value={submission.submissionDate}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="expectedAnswerDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Expected Answer Date
              </label>
              <input
                type="date"
                id="expectedAnswerDate"
                name="expectedAnswerDate"
                required
                className={cn(
                  "w-full rounded-md p-2",
                  "border border-gray-300 dark:border-dark-300",
                  "focus:ring-secondary focus:border-secondary",
                  "dark:bg-dark-200 dark:text-white"
                )}
                value={submission.expectedAnswerDate}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="artwork" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  "px-4 py-2 rounded-md",
                  "border border-gray-300 dark:border-dark-300",
                  "text-gray-700 dark:text-gray-300",
                  "hover:bg-gray-50 dark:hover:bg-dark-200"
                )}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isChecking}
                className={cn(
                  "px-4 py-2 bg-secondary text-white rounded-md",
                  "hover:bg-secondary/90",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isChecking ? 'Checking...' : 'Add Submission'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <SubscriptionPlanModal
        isOpen={showPlans}
        onClose={() => setShowPlans(false)}
      />
    </>
  );
}

export default AddSubmissionModal;