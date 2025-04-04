import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ChevronLeft } from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { database } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

interface Release {
  id: string;
  name: string;
  artist: string;
  type: 'Single' | 'EP' | 'Album';
  label: string;
  releaseDate: string;
  artworkUrl?: string;
}

interface Submission {
  id: string;
  name: string;
  artist: string;
  type: 'Single' | 'EP' | 'Album';
  label: string;
  submissionDate: string;
  expectedAnswerDate: string;
  artworkUrl?: string;
}

function CalendarDay() {
  const { date } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [releases, setReleases] = useState<Release[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid || !date) return;

    setIsLoading(true);
    const releasesRef = ref(database, `releases/${user.uid}`);
    const submissionsRef = ref(database, `submissions/${user.uid}`);

    const unsubscribeReleases = onValue(releasesRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setReleases([]);
        return;
      }

      const releasesList = Object.entries(data)
        .map(([id, release]) => ({
          id,
          ...(release as any)
        }))
        .filter(release => format(parseISO(release.releaseDate), 'yyyy-MM-dd') === date)
        .sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());

      setReleases(releasesList);
    });

    const unsubscribeSubmissions = onValue(submissionsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setSubmissions([]);
        return;
      }

      const submissionsList = Object.entries(data)
        .map(([id, submission]) => ({
          id,
          ...(submission as any)
        }))
        .filter(submission => 
          format(parseISO(submission.submissionDate), 'yyyy-MM-dd') === date ||
          format(parseISO(submission.expectedAnswerDate), 'yyyy-MM-dd') === date
        )
        .sort((a, b) => new Date(a.submissionDate).getTime() - new Date(b.submissionDate).getTime());

      setSubmissions(submissionsList);
      setIsLoading(false);
    });

    return () => {
      unsubscribeReleases();
      unsubscribeSubmissions();
    };
  }, [user, date]);

  if (!date) {
    return <div>Invalid date</div>;
  }

  const formattedDate = format(parseISO(date), 'EEEE, MMMM d, yyyy');

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/dashboard/calendar')}
          className={cn(
            "p-2 rounded-lg transition-colors",
            "text-gray-600 dark:text-gray-400",
            "hover:bg-gray-100 dark:hover:bg-dark-200"
          )}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {formattedDate}
        </h1>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading events...</p>
        </div>
      ) : releases.length === 0 && submissions.length === 0 ? (
        <div className={cn(
          "text-center py-12 rounded-lg",
          "bg-white dark:bg-dark-100"
        )}>
          <p className="text-gray-500 dark:text-gray-400">No events scheduled for this day</p>
        </div>
      ) : (
        <div className="space-y-6">
          {releases.length > 0 && (
            <div className={cn(
              "p-6 rounded-lg",
              "bg-white dark:bg-dark-100"
            )}>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Releases
              </h2>
              <div className="space-y-4">
                {releases.map(release => (
                  <div
                    key={release.id}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-lg",
                      "bg-gray-50 dark:bg-dark-200"
                    )}
                  >
                    {release.artworkUrl ? (
                      <img
                        src={release.artworkUrl}
                        alt={release.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className={cn(
                        "w-16 h-16 rounded-lg flex items-center justify-center",
                        "bg-gray-100 dark:bg-dark-300"
                      )}>
                        <span className="text-xs text-gray-400 dark:text-gray-500">No artwork</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-2 py-1 text-xs font-medium rounded-full",
                          "bg-primary/10 dark:bg-primary/20 text-primary"
                        )}>
                          {release.type}
                        </span>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-1 truncate">
                        {release.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {release.artist} • {release.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {submissions.length > 0 && (
            <div className={cn(
              "p-6 rounded-lg",
              "bg-white dark:bg-dark-100"
            )}>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Submissions
              </h2>
              <div className="space-y-4">
                {submissions.map(submission => (
                  <div
                    key={submission.id}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-lg",
                      "bg-gray-50 dark:bg-dark-200"
                    )}
                  >
                    {submission.artworkUrl ? (
                      <img
                        src={submission.artworkUrl}
                        alt={submission.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className={cn(
                        "w-16 h-16 rounded-lg flex items-center justify-center",
                        "bg-gray-100 dark:bg-dark-300"
                      )}>
                        <span className="text-xs text-gray-400 dark:text-gray-500">No artwork</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-2 py-1 text-xs font-medium rounded-full",
                          format(parseISO(submission.submissionDate), 'yyyy-MM-dd') === date
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                            : "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                        )}>
                          {format(parseISO(submission.submissionDate), 'yyyy-MM-dd') === date
                            ? 'Submission'
                            : 'Expected Answer'}
                        </span>
                        <span className={cn(
                          "px-2 py-1 text-xs font-medium rounded-full",
                          "bg-gray-100 dark:bg-dark-300",
                          "text-gray-600 dark:text-gray-400"
                        )}>
                          {submission.type}
                        </span>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-1 truncate">
                        {submission.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {submission.artist} • {submission.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CalendarDay;