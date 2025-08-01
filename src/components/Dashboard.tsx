import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Users, TrendingUp, Clock, Play, Award, Settings, FileQuestion, BarChart3 } from "lucide-react";
import CourseLibrary from "./CourseLibrary";
import CourseContent from "./CourseContent";
import CourseManagement from "./CourseManagement";
import VoiceCommand from "./VoiceCommand";
import { courses as initialCourses } from "@/data/courses";
import { Course } from "@/types";

interface DashboardProps {
  userRole: 'learner' | 'educator' | 'admin';
}

const Dashboard = ({ userRole }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState("courses");
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [courses, setCourses] = useState<Course[]>(initialCourses);

  // Voice command event listeners
  useEffect(() => {
    const handleVoiceNavigate = (event: CustomEvent) => {
      const tab = event.detail;
      if (tab === 'management' && (userRole === 'educator' || userRole === 'admin')) {
        setActiveTab('management');
      } else if (tab === 'analytics' && userRole === 'admin') {
        setActiveTab('analytics');
      } else if (tab === 'courses') {
        setActiveTab(tab);
      }
    };

    const handleVoiceClick = (event: CustomEvent) => {
      const action = event.detail;
      
      if (action === 'continue') {
        // Simulate clicking the first continue button
        const continueButtons = document.querySelectorAll('button');
        for (const button of continueButtons) {
          if (button.textContent?.includes('Continue')) {
            button.click();
            break;
          }
        }
      } else if (action === 'create-course') {
        // Switch to management tab and trigger create course
        if (userRole === 'educator' || userRole === 'admin') {
          setActiveTab('management');
          setTimeout(() => {
            const createButton = document.querySelector('[data-voice="create-course"]') as HTMLButtonElement;
            if (createButton) createButton.click();
          }, 100);
        }
      } else if (action === 'save-course') {
        const saveButton = document.querySelector('[data-voice="save-course"]') as HTMLButtonElement;
        if (saveButton) saveButton.click();
      } else if (action === 'add-content') {
        const addContentButton = document.querySelector('[data-voice="add-content"]') as HTMLButtonElement;
        if (addContentButton) addContentButton.click();
      } else if (action === 'add-question') {
        const addQuestionButton = document.querySelector('[data-voice="add-question"]') as HTMLButtonElement;
        if (addQuestionButton) addQuestionButton.click();
      } else if (action === 'publish-course') {
        const publishButton = document.querySelector('[data-voice="publish-course"]') as HTMLButtonElement;
        if (publishButton) publishButton.click();
      }
    };

    window.addEventListener('voice-navigate', handleVoiceNavigate as EventListener);
    window.addEventListener('voice-click', handleVoiceClick as EventListener);

    return () => {
      window.removeEventListener('voice-navigate', handleVoiceNavigate as EventListener);
      window.removeEventListener('voice-click', handleVoiceClick as EventListener);
    };
  }, [userRole]);

  // Calculate real stats from courses data
  const getTotalStudents = () => {
    return courses.reduce((total, course) => total + course.students, 0);
  };

  const getCoursesCreated = () => {
    return courses.length;
  };

  const getAverageRating = () => {
    const validRatings = courses.filter(course => course.rating > 0);
    if (validRatings.length === 0) return 0;
    const total = validRatings.reduce((sum, course) => sum + course.rating, 0);
    return Number((total / validRatings.length).toFixed(1));
  };

  const getActiveCourses = () => {
    return courses.filter(course => course.students > 0).length;
  };

  const getTopCourses = () => {
    return courses
      .sort((a, b) => b.students - a.students)
      .slice(0, 2);
  };

  const handleCourseSelect = (courseId: number) => {
    setSelectedCourseId(courseId);
    setActiveTab("course-content");
  };

  const handleCoursesUpdate = (updatedCourses: Course[]) => {
    console.log('Dashboard: Updating courses with:', updatedCourses);
    setCourses(updatedCourses);
  };

  const handleBackToCourses = () => {
    setSelectedCourseId(null);
    setActiveTab("courses");
  };

  // Quick stats based on user role with dynamic data
  const getQuickStats = () => {
    if (userRole === 'learner') {
      return [
        { title: "Enrolled Courses", value: 3, icon: BookOpen },
        { title: "Completed", value: 1, icon: Award },
        { title: "Certificates", value: 2, icon: Award },
        { title: "Study Hours", value: 24, icon: Clock },
      ];
    } else {
      return [
        { title: "Total Students", value: getTotalStudents(), icon: Users },
        { title: "Courses Created", value: getCoursesCreated(), icon: BookOpen },
        { title: "Avg. Rating", value: getAverageRating(), icon: TrendingUp },
        { title: "Active Courses", value: getActiveCourses(), icon: BarChart3 },
      ];
    }
  };

  const getUserName = () => {
    if (userRole === 'admin') return 'Admin User';
    if (userRole === 'educator') return 'Dr. Sarah Johnson';
    return 'John Doe';
  };

  const getUserWelcomeMessage = () => {
    if (userRole === 'learner') return "Continue your learning journey";
    if (userRole === 'educator') return "Manage your courses and students";
    return "Oversee the entire platform";
  };

  if (selectedCourseId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CourseContent 
          courseId={selectedCourseId} 
          onBack={handleBackToCourses}
          userRole={userRole}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {getUserName()}!
              </h1>
              <p className="text-gray-600 mt-1">
                {getUserWelcomeMessage()}
              </p>
            </div>
            <VoiceCommand />
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              {userRole === 'learner' ? 'Browse Courses' : 'Course Library'}
            </TabsTrigger>
            {(userRole === 'educator' || userRole === 'admin') && (
              <TabsTrigger value="management" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Manage Courses
              </TabsTrigger>
            )}
            {userRole === 'admin' && (
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            )}
          </TabsList>

          {/* Courses Tab */}
          <TabsContent value="courses">
            <CourseLibrary 
              userRole={userRole} 
              onCourseSelect={handleCourseSelect}
              courses={courses}
            />
          </TabsContent>

          {/* Course Management Tab (Educators and Admins only) */}
          {(userRole === 'educator' || userRole === 'admin') && (
            <TabsContent value="management">
              <CourseManagement 
                userRole={userRole} 
                courses={courses}
                onCoursesUpdate={handleCoursesUpdate}
              />
            </TabsContent>
          )}

          {/* Analytics Tab (Admin only) */}
          {userRole === 'admin' && (
            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Overview</CardTitle>
                    <CardDescription>Key metrics and performance indicators</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total Students</span>
                      <span className="font-semibold">{getTotalStudents()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Active Courses</span>
                      <span className="font-semibold">{getCoursesCreated()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average Rating</span>
                      <span className="font-semibold">{getAverageRating()}/5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Popular Courses</span>
                      <span className="font-semibold">{courses.filter(c => c.students > 50).length}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Course Performance</CardTitle>
                    <CardDescription>Enrollment trends by course</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {courses.slice(0, 3).map((course, index) => (
                        <div key={course.id}>
                          <div className="flex justify-between">
                            <span className="text-sm truncate">{course.title}</span>
                            <span className="text-sm font-medium">{course.students} students</span>
                          </div>
                          <Progress 
                            value={(course.students / Math.max(...courses.map(c => c.students), 1)) * 100} 
                            className="h-2"
                          />
                        </div>
                      ))}
                      {courses.length === 0 && (
                        <p className="text-sm text-gray-500">No courses available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
