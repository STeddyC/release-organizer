import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO } from 'date-fns';
import { ref, onValue } from 'firebase/database';
import { database } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
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

function Calendar() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { user } = useAuth();
  const selectedEventRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.uid) return;

    const releasesRef = ref(database, `releases/${user.uid}`);
    const submissionsRef = ref(database, `submissions/${user.uid}`);

    const unsubscribeReleases = onValue(releasesRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setReleases([]);
        return;
      }

      const releasesList = Object.entries(data).map(([id, release]) => ({
        id,
        ...(release as any)
      }));

      setReleases(releasesList);
    });

    const unsubscribeSubmissions = onValue(submissionsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setSubmissions([]);
        return;
      }

      const submissionsList = Object.entries(data).map(([id, submission]) => ({
        id,
        ...(submission as any)
      }));

      setSubmissions(submissionsList);
    });

    return () => {
      unsubscribeReleases();
      unsubscribeSubmissions();
    };
  }, [user]);

  useEffect(() => {
    if (selectedEventRef.current) {
      selectedEventRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedDate]);

  const getDayEvents = (day: Date) => {
    const dayReleases = releases.filter(release => 
      format(parseISO(release.releaseDate), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
    );

    const daySubmissions = submissions.filter(submission => {
      const submissionDate = format(parseISO(submission.submissionDate), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
      const answerDate = format(parseISO(submission.expectedAnswerDate), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
      return submissionDate || answerDate;
    });

    return {
      releases: dayReleases,
      submissions: daySubmissions.map(sub => ({
        ...sub,
        isSubmissionDate: format(parseISO(sub.submissionDate), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      }))
    };
  };

  const handleDateClick = (date: Date) => {
    const events = getDayEvents(date);
    if (events.releases.length > 0 || events.submissions.length > 0) {
      navigate(`/dashboard/calendar/${format(date, 'yyyy-MM-dd')}`);
    }
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get all events for the current month
  const allMonthEvents = days.map(day => ({
    date: day,
    events: getDayEvents(day)
  })).filter(day => day.events.releases.length > 0 || day.events.submissions.length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Calendar</h1>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendar */}
        <div className="w-full lg:w-[600px] xl:w-[700px] calendar-container">
          <div className="calendar-header">
            <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}
                className="calendar-nav-button"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
                className="calendar-nav-button"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="calendar-weekday">{day}</div>
            ))}
          </div>

          <div>
            {eachWeekOfMonth(currentMonth).map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7">
                {week.map((date, dateIndex) => {
                  if (!date) {
                    return <div key={dateIndex} className="calendar-day bg-gray-50 dark:bg-dark-200" />;
                  }

                  const events = getDayEvents(date);
                  const isCurrentMonth = isSameMonth(date, currentMonth);
                  const isCurrentDay = isToday(date);
                  const isSelected = selectedDate && format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                  const hasEvents = events.releases.length > 0 || events.submissions.length > 0;

                  return (
                    <div
                      key={dateIndex}
                      onClick={() => {
                        setSelectedDate(date);
                        if (hasEvents) {
                          handleDateClick(date);
                        }
                      }}
                      className={cn(
                        "calendar-day cursor-pointer",
                        !isCurrentMonth ? 'bg-gray-50 dark:bg-dark-200' : 
                        isSelected ? 'bg-gray-200 dark:bg-dark-300' : 
                        'hover:bg-gray-100 dark:hover:bg-dark-200'
                      )}
                    >
                      <div className="calendar-day-header">
                        <span className={cn(
                          "calendar-day-number",
                          isCurrentDay
                            ? 'bg-primary text-white'
                            : isCurrentMonth
                            ? 'text-gray-900 dark:text-white'
                            : 'text-gray-400 dark:text-gray-500'
                        )}>
                          {format(date, 'd')}
                        </span>
                        {hasEvents && (
                          <span className="calendar-event-count">
                            {events.releases.length + events.submissions.length}
                          </span>
                        )}
                      </div>
                      <div className="space-y-0.5 hidden sm:block">
                        {events.releases.slice(0, 1).map(release => (
                          <div
                            key={release.id}
                            className="calendar-event calendar-event-release"
                            title={`${release.name} - ${release.artist}`}
                          >
                            {release.name}
                          </div>
                        ))}
                        {events.submissions.slice(0, 1).map(submission => (
                          <div
                            key={submission.id}
                            className={`calendar-event ${
                              submission.isSubmissionDate
                                ? 'calendar-event-submission'
                                : 'calendar-event-expected'
                            }`}
                            title={`${submission.name} - ${submission.artist}`}
                          >
                            {submission.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Events List */}
        <div className="flex-1 min-w-0">
          <div className="events-list">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {format(currentMonth, 'MMMM yyyy')} Events
            </h3>
            
            {allMonthEvents.length > 0 ? (
              <div className="space-y-4 sm:space-y-6">
                {allMonthEvents.map(({ date, events }) => {
                  const isSelected = selectedDate && format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                  return (
                    <div 
                      key={format(date, 'yyyy-MM-dd')}
                      ref={isSelected ? selectedEventRef : null}
                      className={cn(
                        "p-3 sm:p-4 rounded-lg transition-colors",
                        isSelected ? 'bg-gray-200 dark:bg-dark-300' : ''
                      )}
                    >
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2 sm:mb-3">
                        {format(date, 'EEEE, MMMM d')}
                      </h4>
                      
                      <div className="space-y-3 sm:space-y-4">
                        {events.releases.map(release => (
                          <div key={release.id} className="event-item">
                            {release.artworkUrl ? (
                              <img
                                src={release.artworkUrl}
                                alt={release.name}
                                className="event-artwork"
                              />
                            ) : (
                              <div className="event-artwork-placeholder">
                                <span className="text-[10px] text-gray-400 dark:text-gray-500">No art</span>
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="calendar-event-release px-1.5 py-0.5 text-xs font-medium rounded">
                                  Release
                                </span>
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                  {release.type}
                                </span>
                              </div>
                              <h5 className="font-medium text-gray-900 dark:text-white truncate mt-1">{release.name}</h5>
                              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{release.artist}</p>
                            </div>
                          </div>
                        ))}
                        
                        {events.submissions.map(submission => (
                          <div key={submission.id} className="event-item">
                            {submission.artworkUrl ? (
                              <img
                                src={submission.artworkUrl}
                                alt={submission.name}
                                className="event-artwork"
                              />
                            ) : (
                              <div className="event-artwork-placeholder">
                                <span className="text-[10px] text-gray-400 dark:text-gray-500">No art</span>
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                                  submission.isSubmissionDate
                                    ? 'calendar-event-submission'
                                    : 'calendar-event-expected'
                                }`}>
                                  {submission.isSubmissionDate ? 'Submission' : 'Expected Answer'}
                                </span>
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                  {submission.type}
                                </span>
                              </div>
                              <h5 className="font-medium text-gray-900 dark:text-white truncate mt-1">{submission.name}</h5>
                              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{submission.artist}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No events scheduled for this month</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function eachWeekOfMonth(date: Date) {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  const days = eachDayOfInterval({ start, end });
  
  const weeks: (Date | null)[][] = [];
  let currentWeek: (Date | null)[] = [];
  
  // Add padding for first week
  const startDay = start.getDay();
  for (let i = 0; i < startDay; i++) {
    currentWeek.push(null);
  }
  
  // Add all days
  days.forEach(day => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  
  // Add padding for last week
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }
  
  return weeks;
}

export default Calendar;