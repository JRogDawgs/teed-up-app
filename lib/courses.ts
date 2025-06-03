import { Course } from '../types/game';

// TODO: Replace with Firebase database
const mockCourses: Course[] = [
  {
    id: '1',
    name: 'Augusta National',
    location: 'Augusta, GA',
    holes: Array(18).fill(null).map((_, index) => ({
      number: index + 1,
      par: 4,
      handicap: index + 1,
      yardages: {
        black: 450,
        blue: 420,
        white: 400,
        red: 380,
      },
    })),
    teeBoxes: ['black', 'blue', 'white', 'red'],
  },
  {
    id: '2',
    name: 'Pine Valley',
    location: 'Pine Valley, NJ',
    holes: Array(18).fill(null).map((_, index) => ({
      number: index + 1,
      par: 4,
      handicap: index + 1,
      yardages: {
        black: 440,
        blue: 410,
        white: 390,
        red: 370,
      },
    })),
    teeBoxes: ['black', 'blue', 'white', 'red'],
  },
];

export const getCourses = async (): Promise<Course[]> => {
  // TODO: Implement Firebase fetch
  return mockCourses;
};

export const getCourse = async (id: string): Promise<Course | null> => {
  // TODO: Implement Firebase fetch
  return mockCourses.find(course => course.id === id) || null;
};

export const searchCourses = async (query: string): Promise<Course[]> => {
  // TODO: Implement Firebase search
  const lowerQuery = query.toLowerCase();
  return mockCourses.filter(
    course =>
      course.name.toLowerCase().includes(lowerQuery) ||
      course.location.toLowerCase().includes(lowerQuery)
  );
};

export const getHoleDetails = async (
  courseId: string,
  holeNumber: number
): Promise<{
  par: number;
  handicap: number;
  yardages: Record<string, number>;
} | null> => {
  const course = await getCourse(courseId);
  if (!course) return null;
  
  const hole = course.holes.find(h => h.number === holeNumber);
  if (!hole) return null;

  return {
    par: hole.par,
    handicap: hole.handicap,
    yardages: hole.yardages,
  };
}; 