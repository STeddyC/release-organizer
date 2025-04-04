import React, { useState, useEffect } from 'react';
import { Plus, Pencil } from 'lucide-react';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ref as dbRef, push, set, onValue, update, remove } from 'firebase/database';
import AddReleaseModal from '../components/AddReleaseModal';
import EditReleaseModal from '../components/EditReleaseModal';
import { storage, database } from '../lib/firebase';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
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
  userId?: string;
  createdAt?: number;
}

function Releases() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);
  const [releases, setReleases] = useState<Release[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.uid) return;

    setIsLoading(true);
    const releasesRef = dbRef(database, `releases/${user.uid}`);
    
    const unsubscribe = onValue(releasesRef, (snapshot) => {
      const data = snapshot.val();
      const releasesList = data ? Object.entries(data).map(([id, release]) => ({
        id,
        ...(release as Release)
      })).sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()) : [];
      
      setReleases(releasesList);
      setIsLoading(false);
    }, (error) => {
      console.error('Database error:', error);
      toast.error('Failed to load releases');
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
      setIsLoading(false);
    };
  }, [user]);

  const handleAddRelease = async (release: Release) => {
    if (!user?.uid) {
      toast.error('You must be logged in to add releases');
      return;
    }

    try {
      let artworkUrl = '';
      if (release.artwork) {
        const fileExt = release.artwork.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `artworks/${user.uid}/${fileName}`;
        const fileRef = storageRef(storage, filePath);
        const uploadResult = await uploadBytes(fileRef, release.artwork);
        artworkUrl = await getDownloadURL(uploadResult.ref);
      }

      const releasesRef = dbRef(database, `releases/${user.uid}`);
      const newReleaseRef = push(releasesRef);
      
      const releaseData = {
        name: release.name,
        artist: release.artist,
        type: release.type,
        label: release.label,
        releaseDate: release.releaseDate,
        artworkUrl,
        userId: user.uid,
        createdAt: Date.now()
      };

      await set(newReleaseRef, releaseData);
      toast.success('Release added successfully!');
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding release:', error);
      toast.error('Failed to add release. Please try again.');
    }
  };

  const handleEditRelease = async (release: Release) => {
    if (!user?.uid || !release.id) {
      toast.error('You must be logged in to edit releases');
      return;
    }

    try {
      let artworkUrl = release.artworkUrl;
      if (release.artwork) {
        const fileExt = release.artwork.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `artworks/${user.uid}/${fileName}`;
        const fileRef = storageRef(storage, filePath);
        const uploadResult = await uploadBytes(fileRef, release.artwork);
        artworkUrl = await getDownloadURL(uploadResult.ref);
      }

      const releaseRef = dbRef(database, `releases/${user.uid}/${release.id}`);
      
      const releaseData = {
        name: release.name,
        artist: release.artist,
        type: release.type,
        label: release.label,
        releaseDate: release.releaseDate,
        artworkUrl,
        updatedAt: Date.now()
      };

      await update(releaseRef, releaseData);
      toast.success('Release updated successfully!');
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating release:', error);
      toast.error('Failed to update release. Please try again.');
    }
  };

  const handleDeleteRelease = async (id: string) => {
    if (!user?.uid) {
      toast.error('You must be logged in to delete releases');
      return;
    }

    try {
      const releaseRef = dbRef(database, `releases/${user.uid}/${id}`);
      await remove(releaseRef);
      toast.success('Release deleted successfully!');
    } catch (error) {
      console.error('Error deleting release:', error);
      toast.error('Failed to delete release. Please try again.');
    }
  };

  const handleEditClick = (release: Release) => {
    setSelectedRelease(release);
    setIsEditModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Releases</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className={cn(
            "w-full sm:w-auto inline-flex items-center justify-center px-4 py-2",
            "bg-secondary text-white rounded-md hover:bg-secondary/90 transition-colors"
          )}
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Release
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading releases...</p>
        </div>
      ) : releases.length === 0 ? (
        <div className={cn(
          "text-center py-12 rounded-lg shadow-lg",
          "bg-white dark:bg-dark-100"
        )}>
          <p className="text-gray-500 dark:text-gray-400 text-lg">No releases yet. Add your first release!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {releases.map((release) => (
            <div
              key={release.id}
              className={cn(
                "rounded-lg shadow-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4",
                "bg-white dark:bg-dark-100"
              )}
            >
              {release.artworkUrl ? (
                <img
                  src={release.artworkUrl}
                  alt={`${release.name} artwork`}
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
                      {release.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">{release.artist}</p>
                  </div>
                  <div className="flex flex-col sm:text-right items-start sm:items-end">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        "bg-secondary/10 dark:bg-secondary/20 text-secondary"
                      )}>
                        {release.type}
                      </span>
                      <button
                        onClick={() => handleEditClick(release)}
                        className={cn(
                          "p-1 rounded-full transition-colors",
                          "hover:bg-gray-100 dark:hover:bg-dark-200"
                        )}
                      >
                        <Pencil className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {format(new Date(release.releaseDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">{release.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddReleaseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddRelease}
      />

      {selectedRelease && (
        <EditReleaseModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedRelease(null);
          }}
          onSubmit={handleEditRelease}
          onDelete={handleDeleteRelease}
          release={selectedRelease}
        />
      )}
    </div>
  );
}

export default Releases;