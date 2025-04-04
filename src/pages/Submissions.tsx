import React, { useState, useEffect } from 'react';
import { Plus, Pencil } from 'lucide-react';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ref as dbRef, push, set, onValue, update, remove } from 'firebase/database';
import AddSubmissionModal from '../components/AddSubmissionModal';
import EditSubmissionModal from '../components/EditSubmissionModal';
import { storage, database } from '../lib/firebase';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

interface Submission {
  id?: string;
  name: string;
  artist: string;
  type: 'Single' | 'EP' | 'Album';
  label: string;
  submissionDate: string;
  expectedAnswerDate: string;
  artwork?: File;
  artworkUrl?: string;
  userId?: string;
  createdAt?: number;
}

function Submissions() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.uid) return;

    setIsLoading(true);
    const submissionsRef = dbRef(database, `submissions/${user.uid}`);
    
    const unsubscribe = onValue(submissionsRef, (snapshot) => {
      const data = snapshot.val();
      const submissionsList = data ? Object.entries(data).map(([id, submission]) => ({
        id,
        ...(submission as Submission)
      })).sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()) : [];
      
      setSubmissions(submissionsList);
      setIsLoading(false);
    }, (error) => {
      console.error('Database error:', error);
      toast.error('Failed to load submissions');
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
      setIsLoading(false);
    };
  }, [user]);

  const handleAddSubmission = async (submission: Submission) => {
    if (!user?.uid) {
      toast.error('You must be logged in to add submissions');
      return;
    }

    try {
      let artworkUrl = '';
      if (submission.artwork) {
        const fileExt = submission.artwork.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `artworks/${user.uid}/${fileName}`;
        const fileRef = storageRef(storage, filePath);
        const uploadResult = await uploadBytes(fileRef, submission.artwork);
        artworkUrl = await getDownloadURL(uploadResult.ref);
      }

      const submissionsRef = dbRef(database, `submissions/${user.uid}`);
      const newSubmissionRef = push(submissionsRef);
      
      const submissionData = {
        name: submission.name,
        artist: submission.artist,
        type: submission.type,
        label: submission.label,
        submissionDate: submission.submissionDate,
        expectedAnswerDate: submission.expectedAnswerDate,
        artworkUrl,
        userId: user.uid,
        createdAt: Date.now()
      };

      await set(newSubmissionRef, submissionData);
      toast.success('Submission added successfully!');
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding submission:', error);
      toast.error('Failed to add submission. Please try again.');
    }
  };

  const handleEditSubmission = async (submission: Submission) => {
    if (!user?.uid || !submission.id) {
      toast.error('You must be logged in to edit submissions');
      return;
    }

    try {
      let artworkUrl = submission.artworkUrl;
      if (submission.artwork) {
        const fileExt = submission.artwork.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `artworks/${user.uid}/${fileName}`;
        const fileRef = storageRef(storage, filePath);
        const uploadResult = await uploadBytes(fileRef, submission.artwork);
        artworkUrl = await getDownloadURL(uploadResult.ref);
      }

      const submissionRef = dbRef(database, `submissions/${user.uid}/${submission.id}`);
      
      const submissionData = {
        name: submission.name,
        artist: submission.artist,
        type: submission.type,
        label: submission.label,
        submissionDate: submission.submissionDate,
        expectedAnswerDate: submission.expectedAnswerDate,
        artworkUrl,
        updatedAt: Date.now()
      };

      await update(submissionRef, submissionData);
      toast.success('Submission updated successfully!');
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating submission:', error);
      toast.error('Failed to update submission. Please try again.');
    }
  };

  const handleDeleteSubmission = async (id: string) => {
    if (!user?.uid) {
      toast.error('You must be logged in to delete submissions');
      return;
    }

    try {
      const submissionRef = dbRef(database, `submissions/${user.uid}/${id}`);
      await remove(submissionRef);
      toast.success('Submission deleted successfully!');
    } catch (error) {
      console.error('Error deleting submission:', error);
      toast.error('Failed to delete submission. Please try again.');
    }
  };

  const handleEditClick = (submission: Submission) => {
    setSelectedSubmission(submission);
    setIsEditModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Submissions</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className={cn(
            "w-full sm:w-auto inline-flex items-center justify-center px-4 py-2",
            "bg-secondary text-white rounded-md hover:bg-secondary/90 transition-colors"
          )}
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Submission
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading submissions...</p>
        </div>
      ) : submissions.length === 0 ? (
        <div className={cn(
          "text-center py-12 rounded-lg shadow-lg",
          "bg-white dark:bg-dark-100"
        )}>
          <p className="text-gray-500 dark:text-gray-400 text-lg">No submissions yet. Add your first submission!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {submissions.map((submission) => (
            <div
              key={submission.id}
              className={cn(
                "rounded-lg shadow-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4",
                "bg-white dark:bg-dark-100"
              )}
            >
              {submission.artworkUrl ? (
                <img
                  src={submission.artworkUrl}
                  alt={`${submission.name} artwork`}
                  className="w-full sm:w-20 h-40 sm:h-20 object-cover rounded-md"
                />
              ) : (
                <div className={cn(
                  "w-full sm:w-20 h-40 sm:h-20 rounded-md flex items-center justify-center",
                  "bg-gray-100 dark:bg-dark-200"
                )}>
                  <span className="text-gray-400 dark:text-gray-500">No artwork</span>
                </div>
              )}
              <div className="flex-1 min-w-0 w-full">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {submission.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">{submission.artist}</p>
                  </div>
                  <div className="flex flex-col sm:text-right items-start sm:items-end">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        "bg-secondary/10 dark:bg-secondary/20 text-secondary"
                      )}>
                        {submission.type}
                      </span>
                      <button
                        onClick={() => handleEditClick(submission)}
                        className={cn(
                          "p-1 rounded-full transition-colors",
                          "hover:bg-gray-100 dark:hover:bg-dark-200"
                        )}
                      >
                        <Pencil className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      </button>
                    </div>
                    <div className="mt-1 space-y-1">
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        Submitted: {format(new Date(submission.submissionDate), 'MMM d, yyyy')}
                      </p>
                      <p className="text-sm text-orange-600 dark:text-orange-400">
                        Expected: {format(new Date(submission.expectedAnswerDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">{submission.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddSubmissionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSubmission}
      />

      {selectedSubmission && (
        <EditSubmissionModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedSubmission(null);
          }}
          onSubmit={handleEditSubmission}
          onDelete={handleDeleteSubmission}
          submission={selectedSubmission}
        />
      )}
    </div>
  );
}

export default Submissions;