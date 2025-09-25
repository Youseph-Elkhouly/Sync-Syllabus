"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface Course {
  id: string;
  name: string;
  instructor: string;
  semester: string;
  calendars: string[];
  events: CalendarEvent[];
  syllabus?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  calendar: string;
}

// Generate stable IDs to avoid hydration issues
let idCounter = 0;
const generateId = () => `course-${++idCounter}`;

export default function ManageCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [selectedCalendar, setSelectedCalendar] = useState("Google Calendar");
  const [availableCalendars] = useState([
    "Google Calendar",
    "Notion Calendar"
  ]);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration issues by only rendering after mount
  useEffect(() => {
    setMounted(true);
    // Load courses from localStorage or API
    const savedCourses = localStorage.getItem('syncsyllabus-courses');
    if (savedCourses) {
      setCourses(JSON.parse(savedCourses));
    }
  }, []);

  // Save courses to localStorage whenever they change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('syncsyllabus-courses', JSON.stringify(courses));
    }
  }, [courses, mounted]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white flex flex-col justify-between font-sans text-black">
      {/* Top-left logo */}
      <div className="absolute top-8 left-8">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="SyncSyllabus logo"
            width={80}
            height={80}
            priority
          />
        </Link>
      </div>

      {/* Top-right navigation */}
      <div className="absolute top-8 right-8">
        <Link 
          href="/"
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          ← Back to Upload
        </Link>
      </div>

      {/* Centered content */}
      <main className="flex flex-col items-center justify-center flex-1 text-center px-4 mt-16">
        <h1 className="text-6xl font-normal mb-2">Manage Courses</h1>
        <div className="h-6" />
        <p className="text-base mb-8">Upload syllabi, manage calendar events, and sync across multiple calendars</p>
        
        {/* Calendar Selection */}
        <div className="mb-8">
          <p className="text-sm mb-4">Choose your calendar:</p>
          <select 
            value={selectedCalendar}
            onChange={(e) => setSelectedCalendar(e.target.value)}
            className="border rounded-md px-4 py-2 text-center"
          >
            {availableCalendars.map(calendar => (
              <option key={calendar} value={calendar}>{calendar}</option>
            ))}
          </select>
        </div>

        {/* Add Course Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowAddCourse(true)}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add New Course
          </button>
        </div>

        {/* Courses Grid */}
        <div className="w-full max-w-4xl">
          {courses.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
              <p className="text-gray-500 mb-4">Get started by adding your first course</p>
              <button
                onClick={() => setShowAddCourse(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Your First Course
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard 
                  key={course.id} 
                  course={course}
                  onUpdate={(updatedCourse) => {
                    setCourses(courses.map(c => c.id === course.id ? updatedCourse : c));
                  }}
                  onDelete={() => {
                    setCourses(courses.filter(c => c.id !== course.id));
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Add Course Modal */}
        {showAddCourse && (
          <AddCourseModal
            onClose={() => setShowAddCourse(false)}
            onAdd={(newCourse) => {
              setCourses([...courses, { ...newCourse, id: generateId() }]);
              setShowAddCourse(false);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="absolute bottom-8 left-8 text-sm">
        Powered by Google and Notion
      </footer>
    </div>
  );
}

// Course Card Component
function CourseCard({ course, onUpdate, onDelete }: { 
  course: Course; 
  onUpdate: (course: Course) => void;
  onDelete: () => void;
}) {
  const [showEvents, setShowEvents] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 2000));
    onUpdate({ ...course, syllabus: file.name });
    setUploading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold">{course.name}</h3>
          <p className="text-gray-600">{course.instructor}</p>
          <p className="text-sm text-gray-500">{course.semester}</p>
        </div>
        <button
          onClick={onDelete}
          className="text-red-500 hover:text-red-700"
        >
          Delete
        </button>
      </div>

      {/* Syllabus Upload */}
      <div className="mb-4">
        <h4 className="font-medium mb-2">Syllabus:</h4>
        {course.syllabus ? (
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
            <span className="text-sm">{course.syllabus}</span>
            <button className="text-blue-600 text-sm">View</button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              className="hidden"
              id={`upload-${course.id}`}
              disabled={uploading}
            />
            <label
              htmlFor={`upload-${course.id}`}
              className="cursor-pointer text-sm text-gray-600"
            >
              {uploading ? "Uploading..." : "Click to upload syllabus"}
            </label>
          </div>
        )}
      </div>

      {/* Events Management */}
      <div className="mb-4">
        <button
          onClick={() => setShowEvents(!showEvents)}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          {showEvents ? "Hide" : "Manage"} Events ({course.events.length})
        </button>
        
        {showEvents && (
          <EventsManager 
            course={course}
            onUpdate={onUpdate}
          />
        )}
      </div>

      {/* Calendar Sync */}
      <div>
        <h4 className="font-medium mb-2">Synced to:</h4>
        <div className="flex flex-wrap gap-2">
          {course.calendars.map(calendar => (
            <span key={calendar} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
              {calendar}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Add Course Modal
function AddCourseModal({ onClose, onAdd }: { 
  onClose: () => void;
  onAdd: (course: Omit<Course, 'id'>) => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    instructor: "",
    semester: "",
    calendars: [] as string[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.instructor && formData.semester) {
      onAdd(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4">Add New Course</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Course Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full border rounded-md px-3 py-2"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Instructor</label>
            <input
              type="text"
              value={formData.instructor}
              onChange={(e) => setFormData({...formData, instructor: e.target.value})}
              className="w-full border rounded-md px-3 py-2"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Semester</label>
            <input
              type="text"
              value={formData.semester}
              onChange={(e) => setFormData({...formData, semester: e.target.value})}
              className="w-full border rounded-md px-3 py-2"
              required
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Events Manager Component
function EventsManager({ course, onUpdate }: { 
  course: Course;
  onUpdate: (course: Course) => void;
}) {
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    time: "",
    description: ""
  });

  const addEvent = () => {
    const event: CalendarEvent = {
      id: `event-${Date.now()}`,
      ...newEvent,
      calendar: "Google Calendar"
    };
    onUpdate({
      ...course,
      events: [...course.events, event]
    });
    setNewEvent({ title: "", date: "", time: "", description: "" });
    setShowAddEvent(false);
  };

  return (
    <div className="mt-3 space-y-3">
      <button
        onClick={() => setShowAddEvent(true)}
        className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded"
      >
        + Add Event
      </button>
      
      {course.events.map(event => (
        <div key={event.id} className="bg-gray-50 p-3 rounded">
          <div className="flex justify-between items-start">
            <div>
              <h5 className="font-medium">{event.title}</h5>
              <p className="text-sm text-gray-600">{event.date} at {event.time}</p>
              <p className="text-sm text-gray-500">{event.description}</p>
            </div>
            <button
              onClick={() => onUpdate({
                ...course,
                events: course.events.filter(e => e.id !== event.id)
              })}
              className="text-red-500 text-sm"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      
      {showAddEvent && (
        <div className="bg-white border rounded-lg p-4">
          <h5 className="font-medium mb-3">Add New Event</h5>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Event title"
              value={newEvent.title}
              onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
              className="w-full border rounded px-3 py-2 text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                className="border rounded px-3 py-2 text-sm"
              />
              <input
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                className="border rounded px-3 py-2 text-sm"
              />
            </div>
            <textarea
              placeholder="Description"
              value={newEvent.description}
              onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
              className="w-full border rounded px-3 py-2 text-sm"
              rows={2}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowAddEvent(false)}
                className="text-sm text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={addEvent}
                className="text-sm bg-blue-600 text-white px-3 py-1 rounded"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
